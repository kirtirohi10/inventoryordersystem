import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const getStyleAndIcon = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--success-glow)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--success)',
          icon: <CheckCircle size={20} />
        };
      case 'warning':
        return {
          bg: 'var(--warning-glow)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: 'var(--warning)',
          icon: <AlertCircle size={20} />
        };
      case 'error':
        return {
          bg: 'var(--danger-glow)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)',
          icon: <AlertCircle size={20} />
        };
      default:
        return {
          bg: 'var(--secondary-glow)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--secondary)',
          icon: <Info size={20} />
        };
    }
  };

  const style = getStyleAndIcon();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      background: style.bg,
      border: style.border,
      color: style.color,
      marginBottom: '1.5rem',
      animation: 'fadeIn 0.3s ease forwards'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {style.icon}
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
