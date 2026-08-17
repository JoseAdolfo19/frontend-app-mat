export const canAccess = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (allowedRoles.includes(userRole)) return true;

  // Jerarquía: director > coordinador > docente
  // Quien exige 'teacher' acepta también coordinator y director
  if (allowedRoles.includes('teacher') && ['coordinator', 'director'].includes(userRole)) {
    return true;
  }
  // Quien exige 'coordinator' acepta también director
  if (allowedRoles.includes('coordinator') && userRole === 'director') {
    return true;
  }
  return false;
};

export const isTeacherLike = (userRole) => canAccess(userRole, ['teacher', 'admin']);

export const isDirector = (userRole) => userRole === 'director';
export const isCoordinator = (userRole) => userRole === 'coordinator';
