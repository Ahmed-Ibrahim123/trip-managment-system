import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Form from './Form';
import TripsPage from './Dashboard';
import TripDashboard from './TripDashboard';
import Navbar from './NavBar';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import Employees from './Employees';
import { useSettings } from './contexts/SettingsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Decode JWT payload without a library
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export default function App() {
    const { language } = useSettings();
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded = decodeToken(token);
        return decoded?.role || null;
    });
    const [username, setUsername] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decoded = decodeToken(token);
        return decoded?.username || null;
    });

    const [trips, setTrips] = useState([]);
    const navigate = useNavigate();

    // ---- Auth helpers ----
    const handleAuthSuccess = useCallback((token) => {
        const decoded = decodeToken(token);
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUserRole(decoded?.role || 'employee');
        setUsername(decoded?.username || null);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername(null);
        setTrips([]);
        navigate('/login');
    }, [navigate]);

    // ---- Trips API ----
    const fetchTrips = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/trips`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                handleLogout();
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch trips');
            const data = await res.json();
            setTrips(data);
        } catch (err) {
            console.error('Error fetching trips:', err);
        }
    }, [handleLogout]);

    useEffect(() => {
        if (isAuthenticated) fetchTrips();
    }, [isAuthenticated, fetchTrips, language]);

    const handleAddTrip = async (tripData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(tripData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create trip');
            setTrips(prev => [data, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const handleDeleteTrip = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/trips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete trip');
            }
            setTrips(prev => prev.filter(t => t.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // ---- Bookings API ----
    const handleAddBooking = async (bookingData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(bookingData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create booking');
            // Refresh trip stats
            fetchTrips();
            return { success: true, booking: data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const handleUpdateBooking = async (id, updatedData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(updatedData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update booking');
            fetchTrips();
            return { success: true, booking: data.booking };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const handleDeleteBooking = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete booking');
            }
            fetchTrips();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return (
        <>
            {isAuthenticated && (
                <Navbar
                    userRole={userRole}
                    username={username}
                    onLogout={handleLogout}
                />
            )}

            <Routes>
                <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/register" element={<Register />} />

                {/* Trips Overview Page (was Dashboard) */}
                <Route path="/" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <TripsPage
                            trips={trips}
                            userRole={userRole}
                            onAddTrip={handleAddTrip}
                            onDeleteTrip={handleDeleteTrip}
                        />
                    </ProtectedRoute>
                } />

                {/* Trip-Specific Dashboard */}
                <Route path="/trips/:tripId" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <TripDashboard
                            trips={trips}
                            userRole={userRole}
                            onUpdateBooking={handleUpdateBooking}
                            onDeleteBooking={handleDeleteBooking}
                        />
                    </ProtectedRoute>
                } />

                {/* Add Booking Form */}
                <Route path="/add-booking" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Form
                            trips={trips}
                            userRole={userRole}
                            onAddBooking={handleAddBooking}
                        />
                    </ProtectedRoute>
                } />

                {/* Staff Management — admin only gated in component */}
                <Route path="/employees" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Employees userRole={userRole} />
                    </ProtectedRoute>
                } />

                <Route path="*" element={isAuthenticated ? <h2 style={{ padding: '40px', textAlign: 'center' }}>{language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}</h2> : <Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}