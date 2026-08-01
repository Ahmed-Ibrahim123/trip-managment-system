import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ userRole, username, onLogout }) {
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const isAdmin = userRole === 'admin';

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                ✈️ TripManager
            </Link>
            <ul className="nav-links">
                <li>
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                        Trips
                    </Link>
                </li>
                <li>
                    <Link to="/add-booking" className={location.pathname === '/add-booking' ? 'active' : ''}>
                        Add Booking
                    </Link>
                </li>
                {isAdmin && (
                    <li>
                        <Link to="/employees" className={location.pathname === '/employees' ? 'active' : ''}>
                            Staff Management
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
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}