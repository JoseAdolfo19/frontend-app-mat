// Provides API calls for learner gamification summaries, checks, and synchronization.
import api from './axios';

export const gamificationApi = {
  getSummary: (locale) => api.get('/gamification/summary', { params: { locale } }),
  check: () => api.post('/gamification/check'),
  sync: () => api.post('/admin/achievements/sync'),
};