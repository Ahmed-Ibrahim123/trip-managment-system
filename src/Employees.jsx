import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';

export default function Employees({ userRole }) {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { t, language } = useSettings();
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
            setError(language === 'ar' ? 'تعذر تحميل قائمة الموظفين.' : 'Could not load employee list.');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [language]);

    const handleDelete = async (id, username) => {
        setMessage('');
        setError('');

        const confirmMsg = language === 'ar' 
            ? `هل أنت متأكد من حذف الموظف "${username}"؟`
            : `Are you sure you want to delete employee "${username}"?`;

        if (!window.confirm(confirmMsg)) {
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
                throw new Error(data.error || (language === 'ar' ? 'فشل في حذف الموظف' : 'Failed to delete employee'));
            }

            setMessage(language === 'ar' ? `تم حذف ${username} بنجاح` : `Successfully deleted ${username}`);
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
                        <h2>{t('staffTitle')}</h2>
                        <p className="subtitle" style={{ margin: 0 }}>
                            {t('staffSubtitle')}
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/register')}
                            style={{ width: 'auto', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            ➕ {language === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}
                        </button>
                    )}
                </div>

                {!isAdmin && (
                    <div className="alert error" style={{ marginBottom: '20px' }}>
                        {language === 'ar' ? 'لديك صلاحية القراءة فقط لهذه الصفحة. المدراء فقط من يمكنهم إدارة الموظفين.' : 'You have read-only access to this page. Only admins can manage staff.'}
                    </div>
                )}

                {error && <div className="alert error">{error}</div>}
                {message && <div className="alert success">{message}</div>}

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>{language === 'ar' ? 'معرف المستخدم' : 'User ID'}</th>
                                <th>{t('colUsername')}</th>
                                <th>{t('colRole')}</th>
                                {isAdmin && <th>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="no-data">
                                        {t('noEmployeesFound')}
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td>#{emp.id}</td>
                                        <td>
                                            <strong>{emp.username}</strong>
                                            {emp.username === 'OlaSoliman' && (
                                                <span className="role-tag">{language === 'ar' ? 'مالك النظام' : 'System Owner'}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={emp.role === 'admin' ? 'badge-admin' : 'badge-employee'}>
                                                {emp.role === 'admin' ? `👑 ${t('admin')}` : `👤 ${t('employee')}`}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                {emp.username === 'OlaSoliman' ? (
                                                    <span className="admin-badge">{language === 'ar' ? 'حساب محمي' : 'Protected Account'}</span>
                                                ) : (
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(emp.id, emp.username)}
                                                    >
                                                        {language === 'ar' ? 'إلغاء الصلاحية' : 'Revoke Access'}
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