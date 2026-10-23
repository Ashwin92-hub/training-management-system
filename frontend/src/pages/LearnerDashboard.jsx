import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import CertificateView from '../components/CertificateView';
import { BookOpen, Award, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const LearnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesRes, certsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/certificates/user')
      ]);
      setCourses(coursesRes.data);
      setCertificates(certsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Welcome back, {user?.name}! 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
          Track your course completion, review pending modules, and view earned certificates.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <StatCard title="Available Courses" value={courses.length} icon={BookOpen} color="#6366f1" />
        <StatCard title="Certificates Earned" value={certificates.length} icon={Award} color="#10b981" />
        <StatCard title="Learning Status" value="Active" icon={Clock} color="#06b6d4" />
      </div>

      {/* Certificates View Modal / Display */}
      {selectedCert && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your Earned Certificate</h2>
            <button onClick={() => setSelectedCert(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Close Certificate Preview
            </button>
          </div>
          <CertificateView certificate={selectedCert} />
        </div>
      )}

      {/* Earned Certificates Grid */}
      {certificates.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#10b981" /> Your Certificates ({certificates.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {certificates.map(cert => (
              <div key={cert.id} className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <span className="badge badge-success" style={{ marginBottom: '8px' }}>Verified Credential</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{cert.course_name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Issued Date: {new Date(cert.issue_date).toLocaleDateString()} • Score: <strong style={{ color: '#10b981' }}>{cert.final_score}%</strong>
                </div>
                <button onClick={() => setSelectedCert(cert)} className="btn btn-success" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <Award size={16} /> View & Download Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled & Available Courses */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>Your Training Courses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <div key={course.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>{course.category}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', flex: 1 }}>{course.description}</p>
              <button
                onClick={() => navigate(`/course/${course.id}`)}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.88rem' }}
              >
                <PlayCircle size={16} /> Resume Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
