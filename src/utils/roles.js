export const canAccess = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

export const isTeacherLike = (userRole) => canAccess(userRole, ['teacher', 'admin']);
