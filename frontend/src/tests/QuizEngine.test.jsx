import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import QuizEngine from '../components/QuizEngine';

describe('QuizEngine Component', () => {
  it('renders fallback when quiz object is empty', () => {
    render(<QuizEngine quiz={null} />);
    expect(screen.getByText(/No quiz questions available/i)).toBeDefined();
  });

  it('renders question title and passing threshold', () => {
    const mockQuiz = {
      id: 1,
      title: 'Sample React Quiz',
      passing_score_pct: 80,
      questions: [
        {
          id: 101,
          question_text: 'What is JSX?',
          explanation: 'JavaScript XML',
          points: 10,
          options: [
            { id: 1, option_text: 'Syntax Extension', is_correct: true },
            { id: 2, option_text: 'Database Engine', is_correct: false }
          ]
        }
      ]
    };

    render(<QuizEngine quiz={mockQuiz} />);
    expect(screen.getByText('Sample React Quiz')).toBeDefined();
    expect(screen.getByText(/What is JSX\?/i)).toBeDefined();
    expect(screen.getByText('Syntax Extension')).toBeDefined();
  });
});
