import { env } from '../config/env';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  DIRECTOR: 'director',
  COORDINADOR: 'coordinador'
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

export const TRUE_FALSE_OPTIONS = [
  { value: 'true', labelKey: 'exam.true' },
  { value: 'false', labelKey: 'exam.false' }
];

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const API_URL = env.VITE_API_URL;
export const APP_NAME = 'KawsayMath';