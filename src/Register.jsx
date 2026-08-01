import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, adminSecret, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register employee');
            }

            setSuccess(`${role === 'admin' ? 'Admin' : 'Employee'} account registered successfully! Redirecting to login...`);
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="register-container">
                <h2>Register New Account</h2>
                <p className="subtitle">Create a new staff credential for the trip management portal.</p>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="reg-username">Username</label>
                        <input
                            type="text"
                            id="reg-username"
                            placeholder="e.g. john_doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <small>Choose a unique identifier for the staff member's login.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">Account Password</label>
                        <input
                            type="password"
                            id="reg-password"
                            placeholder="Enter secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <small>Must be at least 6 characters long.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-role">Role</label>
                        <select
                            id="reg-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="employee">👤 Employee — Can add & edit bookings</option>
                            <option value="admin">👑 Admin — Full access</option>
                        </select>
                        <small>Employees can create and edit bookings. Admins have full CRUD access.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-adminSecret">Admin Authorization Key</label>
                        <input
                            type="password"
                            id="reg-adminSecret"
                            placeholder="Enter system admin secret"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                            required
                        />
                        <small>Required security key to authorize new account creation.</small>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p style={{ color: '#718096' }}>
                        Already have an account? <Link to="/login" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}