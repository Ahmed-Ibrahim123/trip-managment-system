import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripsPage({ trips, userRole, onAddTrip, onDeleteTrip }) {
    const isAdmin = userRole === 'admin';
    const navigate = useNavigate();

    const [tripForm, setTripForm] = useState({ trip_name: '', trip_date: '', notes: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const totalBookings = trips.reduce((sum, t) => sum + parseInt(t.booking_count || 0), 0);
    const totalPersons = trips.reduce((sum, t) => sum + parseInt(t.total_persons || 0), 0);

    const handleTripSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setSubmitting(true);

        const result = await onAddTrip({
            trip_name: tripForm.trip_name,
            trip_date: tripForm.trip_date,
            notes: tripForm.notes
        });

        setSubmitting(false);

        if (result.success) {
            setFormSuccess('Trip created successfully!');
            setTripForm({ trip_name: '', trip_date: '', notes: '' });
            setTimeout(() => setFormSuccess(''), 3000);
        } else {
            setFormError(result.error || 'Failed to create trip.');
        }
    };

    const handleDeleteTrip = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this trip and all its associated bookings?')) return;
        const result = await onDeleteTrip(id);
        if (!result.success) alert(result.error || 'Failed to delete trip.');
    };

    return (
        <div className="app-container">
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2>✈️ Trips Overview</h2>
                <p className="subtitle">Manage trips and view bookings by destination.</p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                    <h3>Total Trips</h3>
                    <div className="stat-value">{trips.length}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active trip records</span>
                </div>
                <div className="stat-card">
                    <h3>Total Bookings</h3>
                    <div className="stat-value">{totalBookings}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Across all trips</span>
                </div>
                <div className="stat-card">
                    <h3>Total Guests</h3>
                    <div className="stat-value">{totalPersons}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Number of persons</span>
                </div>
            </div>

            {/* Create Trip Form — Admin Only */}
            {isAdmin && (
                <div className="card" style={{ marginBottom: '32px' }}>
                    <h3 style={{ marginBottom: '20px' }}>➕ Create New Trip</h3>

                    {formError && <div className="alert error">{formError}</div>}
                    {formSuccess && <div className="alert success">{formSuccess}</div>}

                    <form onSubmit={handleTripSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label htmlFor="trip_name">Trip Name</label>
                                <input
                                    type="text"
                                    id="trip_name"
                                    placeholder="e.g. Sharm El Sheikh Summer 2026"
                                    value={tripForm.trip_name}
                                    onChange={e => setTripForm({ ...tripForm, trip_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="trip_date">Trip Date</label>
                                <input
                                    type="date"
                                    id="trip_date"
                                    value={tripForm.trip_date}
                                    onChange={e => setTripForm({ ...tripForm, trip_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="trip_notes">Notes (Optional)</label>
                            <textarea
                                id="trip_notes"
                                rows={3}
                                placeholder="Add any extra details about the trip..."
                                value={tripForm.notes}
                                onChange={e => setTripForm({ ...tripForm, notes: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ width: 'auto', padding: '12px 28px' }}
                        >
                            {submitting ? 'Creating...' : '✈️ Create Trip'}
                        </button>
                    </form>
                </div>
            )}

            {/* Trips Grid */}
            <div>
                <h3 style={{ marginBottom: '20px' }}>📋 All Trips</h3>
                {trips.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✈️</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                            {isAdmin ? 'No trips yet. Create your first trip above!' : 'No trips have been created yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                className="trip-card"
                                onClick={() => navigate(`/trips/${trip.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && navigate(`/trips/${trip.id}`)}
                            >
                                <div className="trip-card-header">
                                    <span className="trip-card-icon">✈️</span>
                                    {isAdmin && (
                                        <button
                                            className="trip-delete-btn"
                                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                                            title="Delete trip"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <h3 className="trip-card-title">{trip.trip_name}</h3>
                                <p className="trip-card-date">
                                    📅 {new Date(trip.trip_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                {trip.notes && (
                                    <p className="trip-card-notes">{trip.notes}</p>
                                )}
                                <div className="trip-card-stats">
                                    <div className="trip-stat">
                                        <span className="trip-stat-value">{trip.booking_count}</span>
                                        <span className="trip-stat-label">Bookings</span>
                                    </div>
                                    <div className="trip-stat">
                                        <span className="trip-stat-value">{trip.total_persons}</span>
                                        <span className="trip-stat-label">Guests</span>
                                    </div>
                                </div>
                                <div className="trip-card-action">
                                    View Details →
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}