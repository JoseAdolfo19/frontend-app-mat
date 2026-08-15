import {
  FaHandPeace,
  FaBookOpen,
  FaClipboardCheck,
  FaTrophy,
  FaUsersCog,
  FaFileAlt,
  FaChartLine,
  FaDatabase,
  FaUserShield,
  FaChild,
  FaPencilAlt,
  FaTasks,
} from 'react-icons/fa';

// Configuración del onboarding por rol.
// Cada paso referencia claves de traducción bajo `onboarding.<rol>.<index>`.
export const ONBOARDING_STEPS = {
  student: [
    { icon: FaHandPeace, tKey: 'student.0' },
    { icon: FaBookOpen, tKey: 'student.1' },
    { icon: FaClipboardCheck, tKey: 'student.2' },
    { icon: FaTrophy, tKey: 'student.3' },
  ],
  teacher: [
    { icon: FaHandPeace, tKey: 'teacher.0' },
    { icon: FaPencilAlt, tKey: 'teacher.1' },
    { icon: FaUsersCog, tKey: 'teacher.2' },
    { icon: FaChartLine, tKey: 'teacher.3' },
  ],
  admin: [
    { icon: FaHandPeace, tKey: 'admin.0' },
    { icon: FaUserShield, tKey: 'admin.1' },
    { icon: FaTasks, tKey: 'admin.2' },
    { icon: FaDatabase, tKey: 'admin.3' },
  ],
  parent: [
    { icon: FaHandPeace, tKey: 'parent.0' },
    { icon: FaChild, tKey: 'parent.1' },
    { icon: FaFileAlt, tKey: 'parent.2' },
  ],
};

// Clave persistente: se marca como visto tras completar/saltar.
export const ONBOARDING_DONE_KEY = 'sim_onboarding_done';

export const getOnboardingSteps = (role) => ONBOARDING_STEPS[role] || null;