import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Register({ setIsAuthenticated, setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('पासवर्ड मेल नहीं खा रहे!');
      return;
    }

    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 वर्��ों का होना चाहिए!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'रजिस्ट्रेशन विफल!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Chatfree</h1>
        <h2>रजिस्टर करें</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>नाम</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="आपका नाम दर्ज करें"
            />
          </div>

          <div className="form-group">
            <label>ईमेल</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="आपकी ईमेल दर्ज करें"
            />
          </div>

          <div className="form-group">
            <label>पासवर्ड</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="एक पासवर्ड बनाएं"
            />
          </div>

          <div className="form-group">
            <label>पासवर्ड की पुष्टि करें</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="पासवर्ड दोबारा दर्ज करें"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'रजिस्ट्रेशन हो रहा है...' : 'रजिस्टर करें'}
          </button>
        </form>

        <p className="auth-link">
          पहले से खाता है? <Link to="/login">लॉगिन करें</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
