import { describe, it, expect } from 'vitest';
import { ROLES, TRUE_FALSE_OPTIONS, QUESTION_TYPES } from './constants';

describe('ROLES', () => {
  it('incluye el rol PARENT', () => {
    expect(ROLES.PARENT).toBe('parent');
  });

  it('cubre todos los roles que usa la app', () => {
    expect(Object.values(ROLES).sort()).toEqual([
      'admin', 'coordinador', 'director', 'parent', 'student', 'teacher'
    ]);
  });
});

describe('TRUE_FALSE_OPTIONS', () => {
  it('expone valores canónicos y keys de i18n', () => {
    expect(TRUE_FALSE_OPTIONS).toEqual([
      { value: 'true', labelKey: 'exam.true' },
      { value: 'false', labelKey: 'exam.false' },
    ]);
  });
});

describe('QUESTION_TYPES', () => {
  it('incluye drag_drop', () => {
    expect(QUESTION_TYPES.DRAG_DROP).toBe('drag_drop');
  });
});
