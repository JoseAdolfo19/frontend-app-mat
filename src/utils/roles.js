export const canAccess = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (allowedRoles.includes(userRole)) return true;

  // Jerarquía: director > coordinador > docente
  // Quien exige 'teacher' acepta también coordinador y director
  if (allowedRoles.includes('teacher') && ['coordinador', 'director'].includes(userRole)) {
    return true;
  }
  // Quien exige 'coordinador' acepta también director
  if (allowedRoles.includes('coordinador') && userRole === 'director') {
    return true;
  }
  return false;
};

export const isTeacherLike = (userRole) => canAccess(userRole, ['teacher', 'admin']);

export const isDirector = (userRole) => userRole === 'director';
export const isCoordinator = (userRole) => userRole === 'coordinador';
