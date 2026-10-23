import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Award, LayoutDashboard, Users, PlusCircle, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loginAsDemo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
            <BookOpen size={22} color="#ffffff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #ffffff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ApexLMS
          </span>
        </Link>

        {/* Role-Based Nav Navigation */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/catalog"
            className={`btn ${isActive('/catalog') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <BookOpen size={16} /> Catalog
          </Link>

          {user.role === 'LEARNER' && (
            <Link
              to="/dashboard"
              className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Award size={16} /> My Dashboard
            </Link>
          )}

          {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
            <>
              <Link
                to="/admin/dashboard"
                className={`btn ${isActive('/admin/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <LayoutDashboard size={16} /> Analytics
              </Link>

              <Link
                to="/admin/courses"
                className={`btn ${isActive('/admin/courses') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <PlusCircle size={16} /> Course Builder
              </Link>

              <Link
                to="/admin/users"
                className={`btn ${isActive('/admin/users') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <Users size={16} /> Users & Assignments
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</span>
            <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : user.role === 'INSTRUCTOR' ? 'badge-info' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
              <ShieldCheck size={10} /> {user.role}
            </span>
          </div>

          {/* Role Switcher Pill */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255,255,255,0.05)',
            padding: '3px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              onClick={() => loginAsDemo('LEARNER')}
              title="Switch to Student View"
              style={{
                background: user.role === 'LEARNER' ? '#6366f1' : 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Learner
            </button>
            <button
              onClick={() => loginAsDemo('INSTRUCTOR')}
              title="Switch to Instructor View"
              style={{
                background: user.role === 'INSTRUCTOR' ? '#06b6d4' : 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Instructor
            </button>
            <button
              onClick={() => loginAsDemo('ADMIN')}
              title="Switch to Admin View"
              style={{
                background: user.role === 'ADMIN' ? '#f59e0b' : 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
