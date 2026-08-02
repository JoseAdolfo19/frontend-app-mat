import { useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const useAntiCheat = (attemptId, isActive = true) => {
  const tabSwitchCount = useRef(0);
  const lastBlurTime = useRef(null);
  const cheatLog = useRef([]);

  const reportCheat = useCallback(async (eventType, detail = null) => {
    if (!attemptId || !isActive) return;
    
    tabSwitchCount.current += 1;
    const event = {
      event: eventType,
      timestamp: new Date().toISOString(),
      detail,
      tabSwitchCount: tabSwitchCount.current,
    };
    cheatLog.current.push(event);

    try {
      await api.post(`/exams/attempts/${attemptId}/cheat`, {
        event_type: eventType,
        detail,
      });
    } catch (err) {
      console.error('Failed to report cheat event:', err);
    }
  }, [attemptId, isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportCheat('tab_switch', 'Student left the exam tab');
      }
    };

    const handleBlur = () => {
      lastBlurTime.current = Date.now();
      reportCheat('window_blur', 'Student switched to another window');
    };

    const handleFocus = () => {
      if (lastBlurTime.current) {
        const duration = Date.now() - lastBlurTime.current;
        if (duration > 2000) {
          reportCheat('extended_absence', `Absent for ${Math.round(duration / 1000)}s`);
        }
        lastBlurTime.current = null;
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      reportCheat('copy_attempt', 'Student tried to copy content');
    };

    const handleCut = (e) => {
      e.preventDefault();
      reportCheat('cut_attempt', 'Student tried to cut content');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      reportCheat('paste_attempt', 'Student tried to paste content');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      reportCheat('right_click', 'Student tried to open context menu');
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'u')) {
        e.preventDefault();
        reportCheat('keyboard_shortcut', `Pressed Ctrl+${e.key.toUpperCase()}`);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        reportCheat('devtools_attempt', 'Tried to open developer tools');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, reportCheat]);

  return { tabSwitchCount: tabSwitchCount.current, cheatLog: cheatLog.current };
};

export default useAntiCheat;
