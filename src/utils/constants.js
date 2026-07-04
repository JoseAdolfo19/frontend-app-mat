export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const DIFFICULTY_LEVELS = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

export const EVALUATION_TYPES = {
  EXAM: 'exam',
  QUIZ: 'quiz',
  HOMEWORK: 'homework',
  PRACTICE: 'practice'
};

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_BLANK: 'fill_blank',
  DRAG_DROP: 'drag_drop',
  FORMULA: 'formula'
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const APP_NAME = 'MathFlow';