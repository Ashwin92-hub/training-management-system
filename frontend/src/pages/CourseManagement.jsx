import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit3, BookOpen, Layers, HelpCircle, Save, X } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('Software Engineering');

  // Module Form
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modType, setModType] = useState('TEXT');
  const [modBody, setModBody] = useState('');
  const [modVideo, setModVideo] = useState('');

  // Quiz Form
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      explanation: '',
      points: 10,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false }
      ]
    }
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', {
        title: courseTitle,
        description: courseDesc,
        category: courseCategory
      });
      setShowCourseModal(false);
      setCourseTitle('');
      setCourseDesc('');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.post(`/courses/${selectedCourse.id}/modules`, {
        title: modTitle,
        description: modDesc,
        content_type: modType,
        content_body: modBody,
        video_url: modVideo,
        order_index: (selectedCourse.modules?.length || 0) + 1
      });
      setShowModuleModal(false);
      setModTitle('');
      setModDesc('');
      setModBody('');
      setModVideo('');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add module');
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!selectedModule) return;
    try {
      await api.post('/quizzes', {
        module_id: selectedModule.id,
        title: quizTitle,
        passing_score_pct: parseFloat(passingScore),
        questions: questions
      });
      setShowQuizModal(false);
      alert('Quiz successfully saved!');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save quiz');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        explanation: '',
        points: 10,
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false }
        ]
      }
    ]);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Course & Quiz Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
            Create and edit training courses, modules, text/video content, and MCQ quizzes.
          </p>
        </div>

        <button onClick={() => setShowCourseModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create New Course
        </button>
      </div>

      {/* Courses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {courses.map(course => (
          <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{course.category}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{course.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{course.description}</p>
              </div>

              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setShowModuleModal(true);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Module
              </button>
            </div>

            {/* Modules List inside Course */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Course Modules ({course.modules?.length || 0})
              </h4>

              {(!course.modules || course.modules.length === 0) ? (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No modules added yet. Click "Add Module" to start adding content.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.modules.map((mod, mIdx) => (
                    <div key={mod.id} style={{
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong style={{ color: '#ffffff' }}>{mIdx + 1}. {mod.title}</strong>
                        <span style={{ marginLeft: '12px', fontSize: '0.78rem', color: 'var(--accent-secondary)' }}>
                          [{mod.content_type}]
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedModule(mod);
                          setQuizTitle(mod.quiz?.title || `${mod.title} Quiz`);
                          setPassingScore(mod.quiz?.passing_score_pct || 70);
                          if (mod.quiz?.questions?.length > 0) {
                            setQuestions(mod.quiz.questions);
                          }
                          setShowQuizModal(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <HelpCircle size={14} /> {mod.quiz ? 'Edit Quiz' : 'Add Quiz'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Course */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Create New Training Course</h3>
              <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input type="text" className="form-input" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-input" value={courseCategory} onChange={e => setCourseCategory(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="4" value={courseDesc} onChange={e => setCourseDesc(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Course</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Module */}
      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Add Module to "{selectedCourse?.title}"</h3>
              <button onClick={() => setShowModuleModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="form-group">
                <label className="form-label">Module Title</label>
                <input type="text" className="form-input" value={modTitle} onChange={e => setModTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <select className="form-select" value={modType} onChange={e => setModType(e.target.value)}>
                  <option value="TEXT">Text / Markdown</option>
                  <option value="VIDEO">Video Embed + Text</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Video Embed URL (Optional)</label>
                <input type="text" className="form-input" placeholder="https://www.youtube.com/embed/..." value={modVideo} onChange={e => setModVideo(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Module Training Content (Markdown)</label>
                <textarea className="form-textarea" rows="6" value={modBody} onChange={e => setModBody(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Module</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quiz Builder */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-card" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Manage Quiz for "{selectedModule?.title}"</h3>
              <button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveQuiz}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Quiz Title</label>
                  <input type="text" className="form-input" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Score %</label>
                  <input type="number" className="form-input" min="1" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value)} required />
                </div>
              </div>

              <h4 style={{ margin: '16px 0 12px 0', color: '#a5b4fc' }}>Questions ({questions.length})</h4>

              {questions.map((q, qIdx) => (
                <div key={qIdx} style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Question {qIdx + 1} Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={q.question_text}
                      onChange={e => {
                        const newQ = [...questions];
                        newQ[qIdx].question_text = e.target.value;
                        setQuestions(newQ);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explanation (Shown after attempt)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={q.explanation}
                      onChange={e => {
                        const newQ = [...questions];
                        newQ[qIdx].explanation = e.target.value;
                        setQuestions(newQ);
                      }}
                    />
                  </div>

                  {/* Options */}
                  <label className="form-label">Multiple Choice Options</label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name={`correct_${qIdx}`}
                        checked={opt.is_correct}
                        onChange={() => {
                          const newQ = [...questions];
                          newQ[qIdx].options.forEach((o, i) => o.is_correct = (i === oIdx));
                          setQuestions(newQ);
                        }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt.option_text}
                        onChange={e => {
                          const newQ = [...questions];
                          newQ[qIdx].options[oIdx].option_text = e.target.value;
                          setQuestions(newQ);
                        }}
                        required
                      />
                    </div>
                  ))}
                </div>
              ))}

              <button type="button" onClick={handleAddQuestion} className="btn btn-secondary" style={{ marginBottom: '20px', width: '100%' }}>
                <Plus size={16} /> Add Question
              </button>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Save size={16} /> Save Quiz
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
