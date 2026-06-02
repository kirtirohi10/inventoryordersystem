import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 5, 8, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease-out forwards'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '550px',
          background: 'rgba(18, 20, 36, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#fff' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
