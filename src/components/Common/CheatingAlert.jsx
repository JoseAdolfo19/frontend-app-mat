import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const CheatingAlert = ({ alert, onDismiss }) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible || !alert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-600 text-white rounded-xl shadow-2xl p-4 animate-slide-in">
      <div className="flex items-start gap-3">
        <FaExclamationTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm mb-1">ALERTA DE TRAMPA</p>
          <p className="text-xs text-red-100">
            {alert.student_name} esta siendo detectado abandonando el examen {alert.exam_title}
          </p>
          <p className="text-[10px] text-red-200 mt-1">{alert.event_type} - {alert.detail}</p>
        </div>
        <button
          onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }}
          className="text-white/70 hover:text-white transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CheatingAlert;
