import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import QuizEngine from '../components/QuizEngine';
import CertificateView from '../components/CertificateView';
import { CheckCircle2, Lock, FileText, Video, Award, ChevronRight, HelpCircle, ArrowLeft } from 'lucide-react';

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [viewMode, setViewMode] = useState('MODULE'); // MODULE, QUIZ, CERTIFICATE
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
    fetchProgress();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/progress/course/${id}`);
      setProgress(res.data);
      if (res.data.certificate_id) {
        fetchCertificate(res.data.certificate_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCertificate = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}`);
      setCertificate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await api.post(`/certificates/generate/${id}`);
      setCertificate(res.data);
      setViewMode('CERTIFICATE');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate certificate.');
    }
  };

  const handleQuizPassed = () => {
    fetchProgress();
  };

  if (loading || !course) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Course Player...</div>;
  }

  const activeModule = course.modules?.[activeModuleIndex];
  const isModuleCompleted = (modId) => {
    return progress?.modules?.some(m => m.module_id === modId && m.is_completed);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/catalog')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Course Progress: <strong style={{ color: '#ffffff' }}>{progress?.overall_progress_pct || 0}%</strong>
          </span>
          <div style={{ width: '120px' }}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress?.overall_progress_pct || 0}%` }} />
            </div>
          </div>

          {progress?.is_course_completed && (
            <button
              onClick={() => {
                if (certificate) setViewMode('CERTIFICATE');
                else handleGenerateCertificate();
              }}
              className="btn btn-success"
              style={{ fontSize: '0.85rem' }}
            >
              <Award size={16} /> View Certificate
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid (Sidebar + Player Content) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Module Navigation Sidebar */}
        <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{course.category}</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>{course.title}</h3>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>
            Course Modules ({course.modules?.length || 0})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {course.modules?.map((mod, idx) => {
              const completed = isModuleCompleted(mod.id);
              const isActive = activeModuleIndex === idx && viewMode !== 'CERTIFICATE';

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    setViewMode('MODULE');
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {completed ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : mod.content_type === 'VIDEO' ? (
                      <Video size={18} color="var(--accent-secondary)" />
                    ) : (
                      <FileText size={18} color="var(--accent-primary)" />
                    )}
                    <span style={{ fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'var(--text-main)' }}>
                      {idx + 1}. {mod.title}
                    </span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              );
            })}

            {/* Certificate Tab in Sidebar */}
            {progress?.is_course_completed && (
              <div
                onClick={() => {
                  if (certificate) setViewMode('CERTIFICATE');
                  else handleGenerateCertificate();
                }}
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: viewMode === 'CERTIFICATE' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#6ee7b7',
                  fontWeight: 700
                }}
              >
                <Award size={20} /> Course Certificate
              </div>
            )}
          </div>
        </div>

        {/* Content Viewer / Quiz / Certificate Area */}
        <div>
          {viewMode === 'CERTIFICATE' && certificate ? (
            <CertificateView certificate={certificate} />
          ) : activeModule ? (
            <div className="glass-card" style={{ padding: '32px' }}>
              
              {/* Module Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '6px' }}>
                    Module {activeModuleIndex + 1} of {course.modules.length}
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeModule.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                    {activeModule.description}
                  </p>
                </div>

                {/* Switch between Module Content & Quiz */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setViewMode('MODULE')}
                    className={`btn ${viewMode === 'MODULE' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <FileText size={16} /> Content
                  </button>
                  <button
                    onClick={() => setViewMode('QUIZ')}
                    className={`btn ${viewMode === 'QUIZ' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <HelpCircle size={16} /> Module Quiz
                  </button>
                </div>
              </div>

              {viewMode === 'MODULE' && (
                <div>
                  {/* Video Player Embed if present */}
                  {activeModule.video_url && (
                    <VideoPlayer videoUrl={activeModule.video_url} title={activeModule.title} />
                  )}

                  {/* Body Text / Markdown Renderer */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-body)',
                    lineHeight: '1.7',
                    fontSize: '1rem',
                    marginBottom: '28px'
                  }}>
                    {activeModule.content_body}
                  </div>

                  {/* Next Action Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      Completed reading? Take the quiz to validate your knowledge.
                    </div>
                    <button
                      onClick={() => setViewMode('QUIZ')}
                      className="btn btn-primary"
                    >
                      <HelpCircle size={18} /> Start Module Quiz
                    </button>
                  </div>
                </div>
              )}

              {viewMode === 'QUIZ' && (
                <QuizEngine quiz={activeModule.quiz} onQuizPassed={handleQuizPassed} />
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              Select a module from the left menu to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
