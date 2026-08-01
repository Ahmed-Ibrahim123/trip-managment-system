import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                ✈️ TripManager
            </Link>
            <ul className="nav-links">
                <li>
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/employees" className={location.pathname === '/employees' ? 'active' : ''}>
                        Staff Management
                    </Link>
                </li>
                <li>
                    <Link to="/add-booking" className={location.pathname === '/add-booking' ? 'active' : ''}>
                        Add New Booking
                    </Link>
                </li>
                {token ? (
                    <li>
                        <button onClick={handleLogout} className="nav-logout-btn">
                            Logout
                        </button>
                    </li>
                ) : (
                    <li>
                        <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}