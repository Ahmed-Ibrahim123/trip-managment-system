import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Employees({ userRole }) {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const isAdmin = userRole === 'admin';

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            setError('Could not load employee list.');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id, username) => {
        setMessage('');
        setError('');

        if (!window.confirm(`Are you sure you want to delete employee "${username}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/employees/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete employee');
            }

            setMessage(`Successfully deleted ${username}`);
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="app-container">
            <div className="employees-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2>Staff Management</h2>
                        <p className="subtitle" style={{ margin: 0 }}>
                            View authorized system users and manage administrative access privileges.
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/register')}
                            style={{ width: 'auto', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            ➕ Add New Employee
                        </button>
                    )}
                </div>

                {!isAdmin && (
                    <div className="alert error" style={{ marginBottom: '20px' }}>
                        You have read-only access to this page. Only admins can manage staff.
                    </div>
                )}

                {error && <div className="alert error">{error}</div>}
                {message && <div className="alert success">{message}</div>}

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username / Account Name</th>
                                <th>Role</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="no-data">
                                        No employee records found in the database.
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td>#{emp.id}</td>
                                        <td>
                                            <strong>{emp.username}</strong>
                                            {emp.username === 'OlaSoliman' && (
                                                <span className="role-tag">System Owner</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={emp.role === 'admin' ? 'badge-admin' : 'badge-employee'}>
                                                {emp.role === 'admin' ? '👑 Admin' : '👤 Employee'}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                {emp.username === 'OlaSoliman' ? (
                                                    <span className="admin-badge">Protected Account</span>
                                                ) : (
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(emp.id, emp.username)}
                                                    >
                                                        Revoke Access
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}