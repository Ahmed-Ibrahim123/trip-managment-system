import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Form from './Form';
import Dashboard from './Dashboard';
import Navbar from './NavBar';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import Employees from './Employees';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [input, setInput] = useState({ clientName: "", mobileNumber: "", tripName: "", notes: "" });
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const contentType = response.headers.get("content-type");
        let dbRecords;
        if (contentType && contentType.includes("application/json")) {
          dbRecords = await response.json();
        } else {
          throw new Error(await response.text());
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch bookings');
        }

        const formattedRecords = dbRecords.map(record => ({
          id: record.id,
          clientName: record.client_name,
          mobileNumber: record.mobile_number,
          tripName: record.trip_name,
          notes: record.notes,
          createdAt: record.created_at,
          createdBy: record.created_by
        }));

        setData(formattedRecords);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    }

    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, navigate]);

  function handleChange(e) {
    const value = e.target.value;
    setInput({
      ...input,
      [e.target.name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_name: input.clientName,
          mobile_number: input.mobileNumber,
          trip_name: input.tripName,
          notes: input.notes
        }),
      });

      const contentType = response.headers.get("content-type");
      let resData;
      if (contentType && contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        resData = await response.text();
      }

      if (response.ok) {
        const formattedNewRecord = {
          id: resData.id,
          clientName: resData.client_name,
          mobileNumber: resData.mobile_number,
          tripName: resData.trip_name,
          notes: resData.notes,
          createdAt: resData.created_at,
          createdBy: resData.created_by
        };

        setData(prev => [formattedNewRecord, ...prev]);
        setInput({ clientName: "", mobileNumber: "", tripName: "", notes: "" });
        navigate('/');
      } else {
        console.error("Server refused the booking:", resData);
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("Network error when saving booking:", error);
    }
  }

  async function handleDelete(id) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setData(prev => prev.filter(record => record.id !== id));
      } else {
        console.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  }

  async function handleUpdate(id, updatedData) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_name: updatedData.clientName,
          mobile_number: updatedData.mobileNumber,
          trip_name: updatedData.tripName,
          notes: updatedData.notes
        })
      });

      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (response.ok) {
        const updated = result.booking || result;

        setData(prev => prev.map(record => record.id === id ? {
          ...record,
          clientName: updated.client_name,
          mobileNumber: updated.mobile_number,
          tripName: updated.trip_name,
          notes: updated.notes
        } : record));
      } else {
        console.error("Failed to update booking:", result);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  }

  return (
    <>
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard records={data} onDelete={handleDelete} onUpdate={handleUpdate} />
          </ProtectedRoute>
        } />

        <Route path="/add-booking" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Form data={input} onChange={handleChange} onSubmit={handleSubmit} />
          </ProtectedRoute>
        } />

        <Route path="/employees" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Employees />
          </ProtectedRoute>
        } />

        <Route path="*" element={isAuthenticated ? <h2>Page Not Found</h2> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}