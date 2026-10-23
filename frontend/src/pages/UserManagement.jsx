import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserPlus, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/courses')
      ]);
      setUsers(uRes.data);
      setCourses(cRes.data);
      if (cRes.data.length > 0) {
        setSelectedCourseId(cRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourseId) return;
    try {
      const res = await api.post('/admin/assign-course', {
        user_id: selectedUser.id,
        course_id: parseInt(selectedCourseId)
      });
      setMessage(res.data.message);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Assignment failed');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>User & Course Assignment Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
          Manage platform accounts, assign training courses to learners, and track user roles.
        </p>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          ✅ {message}
        </div>
      )}

      {/* Main Grid: User List + Assign Course Tool */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        
        {/* User Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-primary)" /> Platform Registered Users ({users.length})
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 0' }}>Name</th>
                <th style={{ padding: '10px 0' }}>Email</th>
                <th style={{ padding: '10px 0' }}>Role</th>
                <th style={{ padding: '10px 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : u.role === 'INSTRUCTOR' ? 'badge-info' : 'badge-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 0' }}>
                    <button
                      onClick={() => setSelectedUser(u)}
                      className={`btn ${selectedUser?.id === u.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Select to Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Course Assigner Panel */}
        <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent-secondary)" /> Assign Course
          </h3>

          {selectedUser ? (
            <form onSubmit={handleAssignCourse}>
              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target User</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedUser.email}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Course to Assign</label>
                <select
                  className="form-select"
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '8px' }}>
                <CheckCircle2 size={16} /> Assign Course to User
              </button>
            </form>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
              👈 Select a user from the table on the left to assign a training course.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserManagement;
