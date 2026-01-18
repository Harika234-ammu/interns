import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/ForgotPassword.css" 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    else if (name === 'newPassword') setNewPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !newPassword) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);

    try {
      // Prefer using an env var like process.env.REACT_APP_API_URL in production
      const res = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      // Safely parse response depending on Content-Type
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = { message: await res.text() };
      }

      if (res.ok) {
        alert(data.message || 'Password updated successfully');
        setEmail('');
        setNewPassword('');
        navigate('/DocDashboard');
      } else {
        // show server message or generic failure
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetPassword">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="bars"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={email}
          onChange={handleChange}
        />
        <br />
        <input
          className="bars"
          type="password"
          placeholder="Enter new password"
          name="newPassword"
          value={newPassword}
          onChange={handleChange}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
