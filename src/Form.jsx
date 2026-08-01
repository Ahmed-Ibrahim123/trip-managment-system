import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Form({ trips, userRole, onAddBooking }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        trip_id: '',
        client_name: '',
        mobile_number: '',
        no_of_persons: 1,
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        if (!form.trip_id) {
            setError('Please select a trip.');
            setSubmitting(false);
            return;
        }

        if (parseInt(form.no_of_persons) < 1) {
            setError('Number of persons must be at least 1.');
            setSubmitting(false);
            return;
        }

        const result = await onAddBooking({
            trip_id: form.trip_id,
            client_name: form.client_name,
            mobile_number: form.mobile_number,
            no_of_persons: parseInt(form.no_of_persons),
            notes: form.notes
        });

        setSubmitting(false);

        if (result.success) {
            setSuccess('Booking added successfully!');
            setForm({ trip_id: '', client_name: '', mobile_number: '', no_of_persons: 1, notes: '' });
            setTimeout(() => navigate('/'), 1500);
        } else {
            setError(result.error || 'Failed to add booking.');
        }
    };

    return (
        <div className="app-container">
            <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ marginBottom: '6px' }}>➕ Add New Booking</h2>
                    <p className="subtitle">Fill in the client and trip details below.</p>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Trip Select */}
                    <div className="form-group">
                        <label htmlFor="trip_id">Trip <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select
                            id="trip_id"
                            name="trip_id"
                            value={form.trip_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">— Select a trip —</option>
                            {trips.map(trip => (
                                <option key={trip.id} value={trip.id}>
                                    {trip.trip_name} ({new Date(trip.trip_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
                                </option>
                            ))}
                        </select>
                        {trips.length === 0 && (
                            <small style={{ color: 'var(--danger)' }}>
                                No trips available. {userRole === 'admin' ? 'Create a trip first.' : 'Ask an admin to create a trip.'}
                            </small>
                        )}
                    </div>

                    {/* Customer Name */}
                    <div className="form-group">
                        <label htmlFor="client_name">Customer Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            type="text"
                            id="client_name"
                            name="client_name"
                            value={form.client_name}
                            onChange={handleChange}
                            placeholder="Full name of the customer"
                            required
                        />
                    </div>

                    {/* Mobile Number */}
                    <div className="form-group">
                        <label htmlFor="mobile_number">Mobile Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            type="tel"
                            id="mobile_number"
                            name="mobile_number"
                            value={form.mobile_number}
                            onChange={handleChange}
                            placeholder="e.g. 01012345678"
                            required
                        />
                        <small>Each mobile number can only be registered once per trip.</small>
                    </div>

                    {/* Number of Persons */}
                    <div className="form-group">
                        <label htmlFor="no_of_persons">Number of Persons <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            type="number"
                            id="no_of_persons"
                            name="no_of_persons"
                            min="1"
                            value={form.no_of_persons}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label htmlFor="notes">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Any special requirements or additional info..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                            type="submit"
                            disabled={submitting || trips.length === 0}
                            style={{ flex: 1 }}
                        >
                            {submitting ? 'Saving...' : '✅ Add Booking'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{ flex: 1, background: '#64748b' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}