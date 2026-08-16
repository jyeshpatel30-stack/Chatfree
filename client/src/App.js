import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">लोड हो रहा है...</div>;
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <Route
            path="/"
            element={<Chat user={user} setIsAuthenticated={setIsAuthenticated} />}
          />
        ) : (
          <>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
            />
            <Route
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
