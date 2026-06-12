import React, { useState } from 'react';
import axios from 'axios';
import '../styles/adminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('riskrishi340@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });

      localStorage.setItem('adminToken', response.data.token);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h1>🏨 VIZON Hotel</h1>
        <h2>Admin Panel Login</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="info">
          Admin Email: riskrishi340@gmail.com<br/>
          Password: RishiRisk9905460514@Bihar
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
