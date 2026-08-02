const LOCALE_MAP = {
  es: 'es-ES',
  en: 'en-US',
  qu: 'es-PE',
};

export const formatDate = (date, lang = 'es') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(LOCALE_MAP[lang] || 'es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (date, lang = 'es') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString(LOCALE_MAP[lang] || 'es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getDifficultyColor = (level) => {
  switch (level) {
    case 'basic': return 'text-green-600 bg-green-100';
    case 'intermediate': return 'text-yellow-600 bg-yellow-100';
    case 'advanced': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'bg-red-500';
    case 'teacher': return 'bg-blue-500';
    case 'student': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'inactive': return 'bg-gray-400';
    case 'pending': return 'bg-yellow-500';
    case 'completed': return 'bg-green-500';
    case 'failed': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export const calculateProgress = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const getBadgeIcon = (badgeId) => {
  const badges = {
    'first_lesson': '🎓',
    'lesson_master': '📚',
    'perfect_score': '⭐',
    'streak_7': '🔥',
    'streak_30': '💎',
    'math_genius': '🧠'
  };
  return badges[badgeId] || '🏅';
};

const BADGE_NAMES = {
  es: {
    'first_lesson': 'Primera Lección',
    'lesson_master': 'Maestro de Lecciones',
    'perfect_score': 'Puntuación Perfecta',
    'streak_7': 'Racha de 7 Días',
    'streak_30': 'Racha de 30 Días',
    'math_genius': 'Genio Matemático'
  },
  en: {
    'first_lesson': 'First Lesson',
    'lesson_master': 'Lesson Master',
    'perfect_score': 'Perfect Score',
    'streak_7': '7-Day Streak',
    'streak_30': '30-Day Streak',
    'math_genius': 'Math Genius'
  },
  qu: {
    'first_lesson': 'Ñawpa Yachay',
    'lesson_master': 'Yachachiq',
    'perfect_score': 'Perfecto',
    'streak_7': '7 Punchay Racha',
    'streak_30': '30 Punchay Racha',
    'math_genius': 'Yachachiq Matemática'
  }
};

export const getBadgeName = (badgeId, lang = 'es') => {
  return BADGE_NAMES[lang]?.[badgeId] || BADGE_NAMES.es[badgeId] || badgeId;
};

export const DIFFICULTY_LABELS = {
  es: { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' },
  en: { basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced' },
  qu: { basic: 'Ñawpaq', intermediate: 'Chawpi', advanced: 'Llaqpaq' },
};

export const getDifficultyLabel = (level, lang = 'es') => {
  return DIFFICULTY_LABELS[lang]?.[level] || DIFFICULTY_LABELS.es[level] || level;
};

export const getLetterGrade = (score) => {
  if (score >= 18) return 'AD';
  if (score >= 15) return 'A';
  if (score >= 12) return 'B';
  return 'C';
};

export const getLetterGradeColor = (score) => {
  if (score >= 18) return 'text-emerald-600 bg-emerald-100';
  if (score >= 15) return 'text-blue-600 bg-blue-100';
  if (score >= 12) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
};
