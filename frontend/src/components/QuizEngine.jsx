import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { CheckCircle2, XCircle, RefreshCw, HelpCircle, ArrowRight, Award } from 'lucide-react';

const QuizEngine = ({ quiz, onQuizPassed }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No quiz questions available for this module.
      </div>
    );
  }

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting your quiz.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        quiz_id: quiz.id,
        answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
          question_id: parseInt(qId),
          selected_option_id: parseInt(optId)
        }))
      };

      const response = await api.post('/quizzes/submit', payload);
      const resData = response.data;
      setResult(resData);

      if (resData.is_passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onQuizPassed) {
          onQuizPassed();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
    setError(null);
  };

  // Result Overview Screen
  if (result) {
    return (
      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {result.is_passed ? (
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '12px' }}>
              <CheckCircle2 size={48} />
            </div>
          ) : (
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '12px' }}>
              <XCircle size={48} />
            </div>
          )}

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {result.is_passed ? 'Quiz Passed! Great Job!' : 'Quiz Attempt Failed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Passing threshold: <strong style={{ color: '#fff' }}>{result.passing_score_pct}%</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR SCORE</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: result.is_passed ? '#10b981' : '#ef4444' }}>
                {result.score_pct}%
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CORRECT ANSWERS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                {result.correct_count} / {result.total_questions}
              </div>
            </div>
          </div>
        </div>

        {/* Question Review Breakdown */}
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#a5b4fc' }}>Detailed Answer Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {result.answers_review.map((item, idx) => (
            <div key={idx} style={{
              background: item.is_correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${item.is_correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontWeight: 600 }}>
                {item.is_correct ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Question {idx + 1}: </span>
                  {item.question_text}
                </div>
              </div>

              <div style={{ marginLeft: '30px', marginTop: '10px', fontSize: '0.88rem' }}>
                <div>Your answer: <strong style={{ color: item.is_correct ? '#10b981' : '#ef4444' }}>{item.selected_option_text}</strong></div>
                {!item.is_correct && (
                  <div style={{ marginTop: '4px' }}>Correct answer: <strong style={{ color: '#10b981' }}>{item.correct_option_text}</strong></div>
                )}
                {item.explanation && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    💡 <strong>Explanation:</strong> {item.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {!result.is_passed && (
            <button onClick={handleRetry} className="btn btn-primary">
              <RefreshCw size={18} /> Retry Quiz
            </button>
          )}
          {result.is_passed && (
            <div className="badge badge-success" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              <Award size={18} /> Module Completed & Saved
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz Taking Screen
  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="badge badge-primary">Module Assessment</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{quiz.title}</h2>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Passing Threshold: <strong style={{ color: '#10b981' }}>{quiz.passing_score_pct}%</strong>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', color: '#fca5a5', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '28px' }}>
        {quiz.questions.map((q, qIdx) => (
          <div key={q.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-secondary)' }}>Q{qIdx + 1}.</span> {q.question_text}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map(opt => {
                const isSelected = selectedAnswers[q.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(q.id, opt.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'}`,
                      background: isSelected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '0.93rem' }}>{opt.option_text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '1rem' }}
        >
          {isSubmitting ? 'Submitting & Grading...' : 'Submit Answers'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default QuizEngine;
