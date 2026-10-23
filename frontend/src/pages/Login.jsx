import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogIn, UserCheck, Shield, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo(role);
      if (role === 'LEARNER') {
        navigate('/catalog');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
          }}>
            <BookOpen size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome to ApexLMS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Enterprise Full-Stack Training & Certification Engine
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-danger)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleStandardLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. learner@lms.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
          >
            <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Instant Quick Demo Account Switcher */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            <Sparkles size={12} inline style={{ marginRight: '4px' }} /> Quick Demo Role Login
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => handleQuickDemo('LEARNER')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <UserCheck size={16} color="#6366f1" /> Log in as <strong>Learner (Student)</strong>
            </button>
            <button onClick={() => handleQuickDemo('INSTRUCTOR')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <Shield size={16} color="#06b6d4" /> Log in as <strong>Instructor</strong>
            </button>
            <button onClick={() => handleQuickDemo('ADMIN')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <Shield size={16} color="#f59e0b" /> Log in as <strong>System Admin</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
