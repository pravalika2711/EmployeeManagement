// Notification.jsx - Alert banner for user feedback

import React, { useEffect } from 'react';

export default function Notification({ type = 'info', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`notification-banner ${type}`} role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span>
          {type === 'success' && '✅'}
          {type === 'error' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          className="notification-close-btn"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}

