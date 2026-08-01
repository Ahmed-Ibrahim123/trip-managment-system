import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TripDashboard({ trips, userRole, onUpdateBooking, onDeleteBooking }) {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const isAdmin = userRole === 'admin';

    const [trip, setTrip] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Inline edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        client_name: '', mobile_number: '', trip_id: '', no_of_persons: 1, notes: ''
    });
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    const fetchTripData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [tripRes, bookingsRes] = await Promise.all([
                fetch(`${API_URL}/api/trips/${tripId}`, { headers }),
                fetch(`${API_URL}/api/bookings?tripId=${tripId}`, { headers })
            ]);

            if (!tripRes.ok) throw new Error('Trip not found');
            const tripData = await tripRes.json();
            const bookingsData = await bookingsRes.json();

            setTrip(tripData);
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch (err) {
            setError(err.message || 'Failed to load trip data.');
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        fetchTripData();
    }, [fetchTripData]);

    const startEditing = (booking) => {
        setEditingId(booking.id);
        setEditError('');
        setEditForm({
            client_name: booking.client_name,
            mobile_number: booking.mobile_number,
            trip_id: booking.trip_id,
            no_of_persons: booking.no_of_persons,
            notes: booking.notes || ''
        });
    };

    const handleSaveEdit = async (id) => {
        setEditError('');
        setEditSaving(true);

        const result = await onUpdateBooking(id, {
            client_name: editForm.client_name,
            mobile_number: editForm.mobile_number,
            trip_id: editForm.trip_id,
            no_of_persons: editForm.no_of_persons,
            notes: editForm.notes
        });

        setEditSaving(false);

        if (result.success) {
            setEditingId(null);
            // If trip was changed, remove from this list
            if (result.booking && result.booking.trip_id !== parseInt(tripId)) {
                setBookings(prev => prev.filter(b => b.id !== id));
            } else {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...result.booking } : b));
            }
            // Refresh totals
            fetchTripData();
        } else {
            setEditError(result.error || 'Failed to update booking.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        const result = await onDeleteBooking(id);
        if (result.success) {
            setBookings(prev => prev.filter(b => b.id !== id));
            fetchTripData();
        } else {
            alert(result.error || 'Failed to delete booking.');
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: '16px' }}>Loading trip data...</p>
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="app-container">
                <div className="alert error">{error || 'Trip not found.'}</div>
                <button onClick={() => navigate('/')} style={{ width: 'auto', padding: '10px 24px' }}>
                    ← Back to Trips
                </button>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="back-btn"
            >
                ← Back to Trips
            </button>

            {/* Trip Header Banner */}
            <div className="trip-header-banner">
                <div className="trip-header-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '2rem' }}>✈️</span>
                        <h2 style={{ margin: 0 }}>{trip.trip_name}</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                        📅 {new Date(trip.trip_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {trip.notes && (
                        <p style={{ color: 'var(--text-muted)', margin: '6px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            📝 {trip.notes}
                        </p>
                    )}
                </div>
                <div className="trip-header-stats">
                    <div className="trip-summary-stat">
                        <span className="trip-summary-value">{trip.booking_count}</span>
                        <span className="trip-summary-label">Bookings</span>
                    </div>
                    <div className="trip-summary-stat">
                        <span className="trip-summary-value">{trip.total_persons}</span>
                        <span className="trip-summary-label">Total Guests</span>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3>📋 Bookings for this Trip</h3>
                    <button
                        onClick={() => navigate('/add-booking')}
                        style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                        ➕ Add Booking
                    </button>
                </div>

                {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                        <p>No bookings for this trip yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Mobile Number</th>
                                    <th>No. of Persons</th>
                                    <th>Notes</th>
                                    <th>Created By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        {editingId === booking.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        value={editForm.client_name}
                                                        onChange={e => setEditForm({ ...editForm, client_name: e.target.value })}
                                                        style={{ padding: '8px 10px', fontSize: '0.9rem', width: '100%' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="tel"
                                                        value={editForm.mobile_number}
                                                        onChange={e => setEditForm({ ...editForm, mobile_number: e.target.value })}
                                                        style={{ padding: '8px 10px', fontSize: '0.9rem', width: '100%' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editForm.no_of_persons}
                                                        onChange={e => setEditForm({ ...editForm, no_of_persons: e.target.value })}
                                                        style={{ padding: '8px 10px', fontSize: '0.9rem', width: '80px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={editForm.notes}
                                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                                        style={{ padding: '8px 10px', fontSize: '0.9rem', width: '100%' }}
                                                    />
                                                </td>
                                                <td>
                                                    <span className="role-tag">{booking.created_by || 'Unknown'}</span>
                                                </td>
                                                <td>
                                                    {editError && (
                                                        <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginBottom: '6px' }}>
                                                            {editError}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => handleSaveEdit(booking.id)}
                                                            disabled={editSaving}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
                                                        >
                                                            {editSaving ? '...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingId(null); setEditError(''); }}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', background: '#64748b' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td><strong>{booking.client_name}</strong></td>
                                                <td>{booking.mobile_number}</td>
                                                <td>
                                                    <span className="persons-badge">{booking.no_of_persons}</span>
                                                </td>
                                                <td>{booking.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td><span className="role-tag">{booking.created_by || 'Unknown'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => startEditing(booking)}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', background: '#3b82f6' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => handleDelete(booking.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
