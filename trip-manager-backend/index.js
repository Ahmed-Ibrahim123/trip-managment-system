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
app.use(express.json()); // Crucial: Allows Express to read JSON bodies from React

// 2. PostgreSQL Connection Pool
// 2. PostgreSQL Connection Pool (Supports Neon Cloud & Local fallback)
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
);

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database at:', res.rows[0].now);
    }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = verified; // Contains id and username
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/register', async (req, res) => {
    const { username, password, adminSecret } = req.body;

    const expectedSecret = process.env.ADMIN_SECRET_PASSWORD || 'admin123';

    if (adminSecret !== expectedSecret) {
        return res.status(403).json({ error: "Invalid admin password confirmation." });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserResult = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully", user: newUserResult.rows[0] });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

app.get('/api/employees', verifyToken, async (req, res) => {
    try {
        const employees = await pool.query('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
        res.json(employees.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.delete('/api/employees/:id', verifyToken, async (req, res) => {
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

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        let user = userResult.rows[0];

        if (!user && username === 'OlaSoliman') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUserResult = await pool.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
                [username, hashedPassword]
            );
            user = newUserResult.rows[0];
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid Username or Password" });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid Username or Password" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1h' }
        );

        res.json({ token });

    } catch (err) {
        console.log("Login server error:", err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// BOOKING ROUTES
// ==========================================

app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const allBookings = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(allBookings.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/bookings', verifyToken, async (req, res) => {
    try {
        const { client_name, mobile_number, trip_name, notes } = req.body;
        const createdBy = req.user ? req.user.username : 'Unknown';

        const query = `
            INSERT INTO bookings (client_name, mobile_number, trip_name, notes, created_by) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [client_name, mobile_number, trip_name, notes, createdBy];

        const newBooking = await pool.query(query, values);

        res.json(newBooking.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.put('/api/bookings/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { client_name, mobile_number, trip_name, notes } = req.body;

    try {
        const query = `
            UPDATE bookings 
            SET client_name = $1, mobile_number = $2, trip_name = $3, notes = $4 
            WHERE id = $5 RETURNING *;
        `;
        const values = [client_name, mobile_number, trip_name, notes, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking updated successfully', booking: result.rows[0] });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ error: 'Server error updating booking' });
    }
});

app.delete('/api/bookings/:id', verifyToken, async (req, res) => {
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

// 3. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});