import { describe, it, expect } from 'vitest';
import { canAccess, isTeacherLike } from './roles';

describe('canAccess', () => {
  it('permite el acceso cuando el rol está en la lista', () => {
    expect(canAccess('parent', ['parent'])).toBe(true);
    expect(canAccess('admin', ['teacher', 'admin'])).toBe(true);
  });

  it('deniega cuando el rol no está en la lista', () => {
    expect(canAccess('student', ['teacher', 'admin'])).toBe(false);
    expect(canAccess('parent', ['admin'])).toBe(false);
  });

  it('deniega si el usuario no tiene rol', () => {
    expect(canAccess(undefined, ['admin'])).toBe(false);
    expect(canAccess(null, ['admin'])).toBe(false);
  });
});

describe('isTeacherLike', () => {
  it('teacher y admin tienen acceso a rutas de docente', () => {
    expect(isTeacherLike('teacher')).toBe(true);
    expect(isTeacherLike('admin')).toBe(true);
  });

  it('student y parent no', () => {
    expect(isTeacherLike('student')).toBe(false);
    expect(isTeacherLike('parent')).toBe(false);
  });
});
