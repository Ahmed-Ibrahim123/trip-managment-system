const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. PostgreSQL Connection Pool
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
);

// ==========================================
// DATABASE INITIALIZATION & MIGRATION
// ==========================================
const initDb = async () => {
    // Run each migration step independently so one failure doesn't block the others
    const run = async (label, sql, params = []) => {
        try {
            await pool.query(sql, params);
        } catch (err) {
            console.warn(`[initDb] Skipped "${label}": ${err.message}`);
        }
    };

    // 1. Users table
    await run('create users', `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'employee',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await run('add users.role', `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'employee';`);
    await run('set OlaSoliman admin', `UPDATE users SET role = 'admin' WHERE username = 'OlaSoliman';`);

    // 2. Trips table
    await run('create trips', `
        CREATE TABLE IF NOT EXISTS trips (
            id SERIAL PRIMARY KEY,
            trip_name VARCHAR(255) NOT NULL,
            trip_date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. Bookings table (new schema)
    await run('create bookings', `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            mobile_number VARCHAR(50) NOT NULL,
            trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
            no_of_persons INTEGER NOT NULL DEFAULT 1,
            notes TEXT,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await run('add bookings.trip_id', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL;`);
    await run('add bookings.no_of_persons', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS no_of_persons INTEGER NOT NULL DEFAULT 1;`);

    // 4. Migrate old trip_name text data into dedicated legacy trips
    //    Create one legacy trip PER unique old trip_name to avoid duplicate-mobile violations
    try {
        const legacyColCheck = await pool.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='bookings' AND column_name='trip_name';`
        );
        if (legacyColCheck.rows.length > 0) {
            const orphaned = await pool.query(
                `SELECT DISTINCT COALESCE(NULLIF(TRIM(trip_name), ''), 'Legacy Bookings') AS tname
                 FROM bookings WHERE trip_id IS NULL;`
            );
            for (const row of orphaned.rows) {
                const tname = row.tname;
                // Find or create a trip for this old trip_name
                let legacyTripId;
                const existing = await pool.query(`SELECT id FROM trips WHERE trip_name = $1 LIMIT 1;`, [tname]);
                if (existing.rows.length > 0) {
                    legacyTripId = existing.rows[0].id;
                } else {
                    const inserted = await pool.query(
                        `INSERT INTO trips (trip_name, trip_date, notes) VALUES ($1, CURRENT_DATE, 'Migrated from legacy data') RETURNING id;`,
                        [tname]
                    );
                    legacyTripId = inserted.rows[0].id;
                }
                // Assign orphaned bookings for this trip_name
                await pool.query(
                    `UPDATE bookings SET trip_id = $1 WHERE trip_id IS NULL AND COALESCE(NULLIF(TRIM(trip_name), ''), 'Legacy Bookings') = $2;`,
                    [legacyTripId, tname]
                );
            }
        }
    } catch (err) {
        console.warn('[initDb] Legacy migration skipped:', err.message);
    }

    // 5. Add unique constraint only if no duplicate (mobile_number, trip_id) pairs exist
    try {
        const constraintExists = await pool.query(
            `SELECT 1 FROM pg_constraint WHERE conname = 'bookings_mobile_trip_unique';`
        );
        if (constraintExists.rows.length === 0) {
            // Check for duplicates before adding constraint
            const dupes = await pool.query(
                `SELECT mobile_number, trip_id, COUNT(*) FROM bookings
                 WHERE trip_id IS NOT NULL
                 GROUP BY mobile_number, trip_id HAVING COUNT(*) > 1;`
            );
            if (dupes.rows.length === 0) {
                await pool.query(
                    `ALTER TABLE bookings ADD CONSTRAINT bookings_mobile_trip_unique UNIQUE (mobile_number, trip_id);`
                );
                console.log('[initDb] Unique constraint added.');
            } else {
                console.warn(`[initDb] Skipped unique constraint — ${dupes.rows.length} duplicate (mobile, trip) pair(s) exist. Resolve duplicates manually.`);
            }
        }
    } catch (err) {
        console.warn('[initDb] Unique constraint step skipped:', err.message);
    }

    console.log('Database initialization complete.');
};


initDb();

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database at:', res.rows[0].now);
    }
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'TripManager API is live' });
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = verified; // Contains id, username, role
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/register', async (req, res) => {
    const { username, password, adminSecret, role } = req.body;
    const expectedSecret = process.env.ADMIN_SECRET_PASSWORD || 'admin123';

    if (adminSecret !== expectedSecret) {
        return res.status(403).json({ error: 'Invalid admin password confirmation.' });
    }

    const assignedRole = (role === 'admin' || role === 'employee') ? role : 'employee';

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserResult = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, assignedRole]
        );

        res.status(201).json({ message: 'User registered successfully', user: newUserResult.rows[0] });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        let user = userResult.rows[0];

        // Auto-create OlaSoliman as admin on first login
        if (!user && username === 'OlaSoliman') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUserResult = await pool.query(
                'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
                [username, hashedPassword, 'admin']
            );
            user = newUserResult.rows[0];
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }

        // Include role in JWT payload
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '8h' }
        );

        res.json({ token, role: user.role, username: user.username });

    } catch (err) {
        console.error('Login server error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// EMPLOYEE / USER MANAGEMENT ROUTES
// ==========================================
app.get('/api/employees', verifyToken, async (req, res) => {
    try {
        const employees = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        res.json(employees.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.delete('/api/employees/:id', verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const userCheck = await pool.query('SELECT username FROM users WHERE id = $1', [id]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const targetUser = userCheck.rows[0];

        if (targetUser.username === 'OlaSoliman') {
            return res.status(403).json({ error: 'Cannot delete the primary admin account.' });
        }

        if (req.user && req.user.id === parseInt(id)) {
            return res.status(403).json({ error: 'You cannot delete your own active session.' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username;', [id]);
        res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// TRIPS ROUTES
// ==========================================

// GET all trips (all authenticated users — needed for booking dropdown)
app.get('/api/trips', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id, t.trip_name, t.trip_date, t.notes, t.created_at,
                COUNT(b.id) AS booking_count,
                COALESCE(SUM(b.no_of_persons), 0) AS total_persons
            FROM trips t
            LEFT JOIN bookings b ON b.trip_id = t.id
            GROUP BY t.id
            ORDER BY t.trip_date DESC, t.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET single trip
app.get('/api/trips/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT t.id, t.trip_name, t.trip_date, t.notes, t.created_at,
                COUNT(b.id) AS booking_count,
                COALESCE(SUM(b.no_of_persons), 0) AS total_persons
            FROM trips t
            LEFT JOIN bookings b ON b.trip_id = t.id
            WHERE t.id = $1
            GROUP BY t.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching trip:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST create trip — admin only
app.post('/api/trips', verifyToken, requireAdmin, async (req, res) => {
    const { trip_name, trip_date, notes } = req.body;

    if (!trip_name || !trip_date) {
        return res.status(400).json({ error: 'Trip name and date are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO trips (trip_name, trip_date, notes) VALUES ($1, $2, $3) RETURNING *',
            [trip_name, trip_date, notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating trip:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT update trip — admin only
app.put('/api/trips/:id', verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { trip_name, trip_date, notes } = req.body;

    try {
        const result = await pool.query(
            'UPDATE trips SET trip_name = $1, trip_date = $2, notes = $3 WHERE id = $4 RETURNING *',
            [trip_name, trip_date, notes || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip updated successfully', trip: result.rows[0] });
    } catch (err) {
        console.error('Error updating trip:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE trip — admin only
app.delete('/api/trips/:id', verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM trips WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
        console.error('Error deleting trip:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// BOOKING ROUTES
// ==========================================

// GET bookings — optionally filtered by tripId
app.get('/api/bookings', verifyToken, async (req, res) => {
    const { tripId } = req.query;
    try {
        let query, params;
        if (tripId) {
            query = `
                SELECT b.*, t.trip_name, t.trip_date
                FROM bookings b
                LEFT JOIN trips t ON t.id = b.trip_id
                WHERE b.trip_id = $1
                ORDER BY b.created_at DESC
            `;
            params = [tripId];
        } else {
            query = `
                SELECT b.*, t.trip_name, t.trip_date
                FROM bookings b
                LEFT JOIN trips t ON t.id = b.trip_id
                ORDER BY b.created_at DESC
            `;
            params = [];
        }
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST create booking — employee or admin
app.post('/api/bookings', verifyToken, async (req, res) => {
    const { client_name, mobile_number, trip_id, no_of_persons, notes } = req.body;
    const createdBy = req.user ? req.user.username : 'Unknown';

    if (!client_name || !mobile_number || !trip_id || !no_of_persons) {
        return res.status(400).json({ error: 'Client name, mobile number, trip, and number of persons are required.' });
    }

    if (parseInt(no_of_persons) < 1) {
        return res.status(400).json({ error: 'Number of persons must be at least 1.' });
    }

    // Check for duplicate: same mobile number + same trip
    try {
        const dupCheck = await pool.query(
            'SELECT id FROM bookings WHERE mobile_number = $1 AND trip_id = $2',
            [mobile_number, trip_id]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ error: 'This mobile number has already been registered for this trip.' });
        }

        const result = await pool.query(
            'INSERT INTO bookings (client_name, mobile_number, trip_id, no_of_persons, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [client_name, mobile_number, trip_id, no_of_persons, notes || null, createdBy]
        );

        // Fetch joined data for response
        const joined = await pool.query(
            'SELECT b.*, t.trip_name, t.trip_date FROM bookings b LEFT JOIN trips t ON t.id = b.trip_id WHERE b.id = $1',
            [result.rows[0].id]
        );

        res.status(201).json(joined.rows[0]);
    } catch (err) {
        console.error('Error creating booking:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'This mobile number has already been registered for this trip.' });
        }
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT update booking — employee or admin
app.put('/api/bookings/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { client_name, mobile_number, trip_id, no_of_persons, notes } = req.body;

    try {
        // Check for duplicate excluding current booking
        const dupCheck = await pool.query(
            'SELECT id FROM bookings WHERE mobile_number = $1 AND trip_id = $2 AND id != $3',
            [mobile_number, trip_id, id]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ error: 'This mobile number has already been registered for this trip.' });
        }

        const result = await pool.query(
            `UPDATE bookings
             SET client_name = $1, mobile_number = $2, trip_id = $3, no_of_persons = $4, notes = $5
             WHERE id = $6 RETURNING *`,
            [client_name, mobile_number, trip_id, no_of_persons, notes || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const joined = await pool.query(
            'SELECT b.*, t.trip_name, t.trip_date FROM bookings b LEFT JOIN trips t ON t.id = b.trip_id WHERE b.id = $1',
            [result.rows[0].id]
        );

        res.json({ message: 'Booking updated successfully', booking: joined.rows[0] });
    } catch (err) {
        console.error('Error updating booking:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'This mobile number has already been registered for this trip.' });
        }
        res.status(500).json({ error: 'Server error updating booking' });
    }
});

// DELETE booking — admin only
app.delete('/api/bookings/:id', verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({ error: 'Server error deleting booking' });
    }
});

// ==========================================
// 404 & ERROR HANDLING
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 3. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});