import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const JudgeLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { loginJudge } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await loginJudge(credentials.username, credentials.password);

    if (result.success) {
      navigate('/judge/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>👨‍⚖️ Judge Portal</h1>
          <p>Christ Soldiers Talent Test - Judge Login</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-btn">
            Login as Judge
          </button>

          <div className="other-logins">
            <p>Other Portals:</p>
            <Link to="/admin/login">Admin Login</Link>
            <span>•</span>
            <Link to="/section/login">Section Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgeLogin;
