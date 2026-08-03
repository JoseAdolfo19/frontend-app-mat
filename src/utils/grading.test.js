import { describe, it, expect } from 'vitest';
import { isAnswerCorrect, gradeExam, normalizeTrueFalse } from './grading';

describe('normalizeTrueFalse', () => {
  it('normaliza booleanos y strings canónicos', () => {
    expect(normalizeTrueFalse(true)).toBe('true');
    expect(normalizeTrueFalse('true')).toBe('true');
    expect(normalizeTrueFalse(false)).toBe('false');
    expect(normalizeTrueFalse('false')).toBe('false');
  });
});

describe('isAnswerCorrect', () => {
  it('true/false: compara valores canónicos, no labels traducidos', () => {
    const question = { type: 'true_false', correctAnswer: 'true' };
    expect(isAnswerCorrect({ ...question, userAnswer: true })).toBe(true);
    expect(isAnswerCorrect({ ...question, userAnswer: 'true' })).toBe(true);
    expect(isAnswerCorrect({ ...question, userAnswer: 'false' })).toBe(false);
  });

  it('multiple_choice: compara strings exactos', () => {
    const question = { type: 'multiple_choice', correctAnswer: 'París' };
    expect(isAnswerCorrect({ ...question, userAnswer: 'París' })).toBe(true);
    expect(isAnswerCorrect({ ...question, userAnswer: 'Londres' })).toBe(false);
  });

  it('drag_drop: compara el orden exacto', () => {
    const correct = JSON.stringify(['a', 'b', 'c']);
    expect(isAnswerCorrect({ type: 'drag_drop', correctAnswer: correct, userAnswer: ['a', 'b', 'c'] })).toBe(true);
    expect(isAnswerCorrect({ type: 'drag_drop', correctAnswer: correct, userAnswer: ['c', 'b', 'a'] })).toBe(false);
    expect(isAnswerCorrect({ type: 'drag_drop', correctAnswer: correct, userAnswer: ['a', 'b'] })).toBe(false);
  });

  it('respuestas vacías nunca son correctas', () => {
    expect(isAnswerCorrect({ type: 'multiple_choice', correctAnswer: 'a', userAnswer: '' })).toBe(false);
    expect(isAnswerCorrect({ type: 'multiple_choice', correctAnswer: 'a', userAnswer: undefined })).toBe(false);
  });
});

describe('gradeExam', () => {
  const questions = [
    { id: 1, type: 'true_false', correct_answer: 'true', points: 2 },
    { id: 2, type: 'multiple_choice', correct_answer: 'B', points: 3 },
    { id: 3, type: 'drag_drop', correct_answer: JSON.stringify(['x', 'y']), points: 5 },
  ];

  it('califica todas las respuestas correctas', () => {
    const result = gradeExam(questions, { 1: true, 2: 'B', 3: ['x', 'y'] });
    expect(result.correctAnswers).toBe(10);
    expect(result.totalPoints).toBe(10);
    expect(result.score).toBe(20);
    expect(result.passed).toBe(true);
  });

  it('califica parcialmente y falla bajo el umbral', () => {
    const result = gradeExam(questions, { 1: 'false', 2: 'A', 3: ['y', 'x'] });
    expect(result.correctAnswers).toBe(0);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});
