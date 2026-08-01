import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Dynamically use Vercel environment variable or fallback to localhost
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, adminSecret }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register employee');
            }

            setSuccess('Employee registered successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="register-container">
                <h2>Register New Employee</h2>
                <p className="subtitle">Create a new staff credential for the trip management portal.</p>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="username">Employee Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="e.g. john_doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <small>Choose a unique identifier for the staff member's login.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Account Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <small>Must be at least 6 characters long.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="adminSecret">Admin Authorization Key</label>
                        <input
                            type="password"
                            id="adminSecret"
                            placeholder="Enter system admin secret"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                            required
                        />
                        <small>Required security key to authorize new employee creation.</small>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? 'Registering Employee...' : 'Register Employee'}
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