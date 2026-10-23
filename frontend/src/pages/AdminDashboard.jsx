import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { Users, BookOpen, Award, CheckCircle2, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Admin Analytics...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin & Instructor Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
          Overview of platform users, courses, module completions, quiz pass rates, and certificates.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <StatCard title="Total Platform Users" value={stats.total_users} subtitle={`${stats.learners_count} Active Learners`} icon={Users} color="#6366f1" />
        <StatCard title="Published Courses" value={stats.total_courses} subtitle={`${stats.total_modules} Training Modules`} icon={BookOpen} color="#06b6d4" />
        <StatCard title="Active Enrollments" value={stats.total_enrollments} subtitle="Assigned & Active" icon={Activity} color="#f59e0b" />
        <StatCard title="Quiz Pass Rate" value={`${stats.quiz_pass_rate_pct}%`} subtitle={`${stats.total_quiz_attempts} Total Attempts`} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Certificates Issued" value={stats.total_certificates} subtitle="Verified Credentials" icon={Award} color="#ec4899" />
      </div>

      {/* Tables Row (Recent Enrollments & Recent Certificates) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* Recent Enrollments */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent-secondary)" /> Recent Course Assignments
          </h3>
          {stats.recent_enrollments.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent enrollments recorded.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Learner</th>
                  <th style={{ padding: '8px 0' }}>Course Assigned</th>
                  <th style={{ padding: '8px 0' }}>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_enrollments.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{e.user_name}</td>
                    <td style={{ padding: '10px 0', color: 'var(--accent-secondary)' }}>{e.course_title}</td>
                    <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Certificates Issued */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#10b981" /> Recent Certificates Generated
          </h3>
          {stats.recent_certificates.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No certificates issued yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Participant</th>
                  <th style={{ padding: '8px 0' }}>Course</th>
                  <th style={{ padding: '8px 0' }}>Final Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_certificates.map(c => (
                  <tr key={c.certificate_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{c.user_name}</td>
                    <td style={{ padding: '10px 0' }}>{c.course_title}</td>
                    <td style={{ padding: '10px 0', color: '#10b981', fontWeight: 700 }}>{c.final_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
