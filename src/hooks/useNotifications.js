import { useNotifications as useNotificationsContext } from '../contexts/NotificationContext';

export const useNotifications = () => {
  const context = useNotificationsContext();
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};