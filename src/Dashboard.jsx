import { useState } from 'react';

export default function Dashboard({ records, onDelete, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ clientName: '', mobileNumber: '', tripName: '', notes: '' });

    const startEditing = (record) => {
        setEditingId(record.id);
        setEditForm({
            clientName: record.clientName,
            mobileNumber: record.mobileNumber,
            tripName: record.tripName,
            notes: record.notes || ''
        });
    };

    const handleSaveEdit = (id) => {
        onUpdate(id, editForm);
        setEditingId(null);
    };

    return (
        <div className="app-container">
            <div style={{ marginBottom: '32px' }}>
                <h2>Trip Operations Dashboard</h2>
                <p className="subtitle">Monitor active client submissions, update details, or manage records.</p>
            </div>

            {/* Metrics Grid */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Total Trips Logged</h3>
                    <div className="stat-value">{records.length}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active records in database</span>
                </div>
            </div>

            {/* Main Records Table Card */}
            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>📋 Client Records Overview</h3>

                {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <p>No trip records submitted yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Mobile Number</th>
                                    <th>Trip Name</th>
                                    <th>Notes</th>
                                    <th>Created By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        {editingId === item.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        value={editForm.clientName}
                                                        onChange={e => setEditForm({ ...editForm, clientName: e.target.value })}
                                                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={editForm.mobileNumber}
                                                        onChange={e => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                                                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={editForm.tripName}
                                                        onChange={e => setEditForm({ ...editForm, tripName: e.target.value })}
                                                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        value={editForm.notes}
                                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                                                    />
                                                </td>
                                                <td><span className="role-tag">{item.createdBy || 'Unknown'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => handleSaveEdit(item.id)}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', background: '#64748b' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td><strong>{item.clientName}</strong></td>
                                                <td>{item.mobileNumber}</td>
                                                <td>{item.tripName}</td>
                                                <td>{item.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td><span className="role-tag">{item.createdBy || 'Unknown'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => startEditing(item)}
                                                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', background: '#3b82f6' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => onDelete(item.id)}
                                                        >
                                                            Delete
                                                        </button>
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