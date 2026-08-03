import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';

export default function Navbar({ userRole, username, onLogout }) {
    const location = useLocation();
    const { theme, setTheme, language, setLanguage, t, toggleTheme, toggleLanguage } = useSettings();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    // Close settings dropdown on outside click or Escape key
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setSettingsOpen(false);
            }
        }
        function handleEscape(event) {
            if (event.key === 'Escape') setSettingsOpen(false);
        }
        
        if (settingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [settingsOpen]);

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const isAdmin = userRole === 'admin';

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                ✈️ {t('appTitle').replace('Yalla Nefsel ', '').replace('يلا نفصل ', '')}
            </Link>
            <ul className="nav-links">
                <li>
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                        {t('navTrips')}
                    </Link>
                </li>
                <li>
                    <Link to="/add-booking" className={location.pathname === '/add-booking' ? 'active' : ''}>
                        {t('navAddBooking')}
                    </Link>
                </li>
                {isAdmin && (
                    <li>
                        <Link to="/employees" className={location.pathname === '/employees' ? 'active' : ''}>
                            {t('navStaffManagement')}
                        </Link>
                    </li>
                )}
                {username && (
                    <li>
                        <span className={`nav-role-badge ${isAdmin ? 'nav-role-admin' : 'nav-role-employee'}`}>
                            {isAdmin ? '👑' : '👤'} {username}
                        </span>
                    </li>
                )}
                <li>
                    <button onClick={onLogout} className="nav-logout-btn">
                        {t('navLogout')}
                    </button>
                </li>
                
                {/* Settings Dropdown Container */}
                <li style={{ position: 'relative' }} ref={settingsRef}>
                    <button 
                        className="settings-btn" 
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        aria-label="Settings"
                    >
                        ⚙️
                    </button>
                    
                    {settingsOpen && (
                        <div className="settings-dropdown">
                            <div className="settings-section">
                                <label>{t('themeLabel')}</label>
                                <select 
                                    value={theme} 
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="form-group"
                                    style={{ margin: 0 }}
                                >
                                    <option value="light">{t('themeLight')}</option>
                                    <option value="dark">{t('themeDark')}</option>
                                </select>
                            </div>
                            
                            <div className="settings-section">
                                <label>{t('languageLabel')}</label>
                                <select 
                                    value={language} 
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="form-group"
                                    style={{ margin: 0 }}
                                >
                                    <option value="en">{t('langEnglish')}</option>
                                    <option value="ar">{t('langArabic')}</option>
                                </select>
                            </div>
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
}