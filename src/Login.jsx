import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';

export default function Login({ onAuthSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useSettings();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Invalid username or password');

            // Store token and update app state via callback
            onAuthSuccess(data.token);

            // Navigate home
            window.location.href = '/';

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{t('loginTitle')}</h2>
                    <p>{t('loginSubtitle')}</p>
                </div>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-wrapper">
                        <label htmlFor="username">{t('usernameLabel')}</label>
                        <input
                            type="text"
                            id="username"
                            placeholder={t('usernamePlaceholder')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <span className="input-hint">{t('usernameHint')}</span>
                    </div>

                    <div className="input-wrapper">
                        <label htmlFor="password">{t('passwordLabel')}</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="input-hint">{t('passwordHint')}</span>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? t('btnSigningIn') : t('btnSignIn')}
                    </button>
                </form>

                <div className="auth-footer-link">
                    <p>{t('linkAddEmployee').split('?')[0]}? <Link to="/register">{t('linkAddEmployee').split('?')[1]?.trim() || 'Add Employee'}</Link></p>
                </div>
            </div>
        </div>
    );
}