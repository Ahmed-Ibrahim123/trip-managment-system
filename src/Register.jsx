import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { t, language } = useSettings();

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
                throw new Error(data.error || (language === 'ar' ? 'فشل في تسجيل الموظف' : 'Failed to register employee'));
            }

            setSuccess(language === 'ar' ? `تم تسجيل حساب ${role === 'admin' ? 'المدير' : 'الموظف'} بنجاح! جاري التوجيه لتسجيل الدخول...` : `${role === 'admin' ? 'Admin' : 'Employee'} account registered successfully! Redirecting to login...`);
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
                <h2>{t('regTitle')}</h2>
                <p className="subtitle">{t('regSubtitle')}</p>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="reg-username">{t('usernameLabel')}</label>
                        <input
                            type="text"
                            id="reg-username"
                            placeholder={t('regUsernamePlaceholder')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <small>{t('regUsernameHint')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">{t('passwordLabel')}</label>
                        <input
                            type="password"
                            id="reg-password"
                            placeholder={t('regPasswordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <small>{t('passwordSecureHint')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-role">{t('regRoleLabel')}</label>
                        <select
                            id="reg-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="employee">{t('regRoleEmployee')}</option>
                            <option value="admin">{t('regRoleAdmin')}</option>
                        </select>
                        <small>{t('regRoleHint')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-adminSecret">{t('regAuthKeyLabel')}</label>
                        <input
                            type="password"
                            id="reg-adminSecret"
                            placeholder={t('regAuthKeyPlaceholder')}
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                            required
                        />
                        <small>{t('regAuthKeyHint')}</small>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? t('btnRegistering') : t('btnRegister')}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p style={{ color: '#718096' }}>
                        {t('linkLogin').split('?')[0]}? <Link to="/login" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>{t('linkLogin').split('?')[1]?.trim() || 'Log in here'}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}