import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading details...', size = 32 }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem',
      width: '100%'
    }}>
      <Loader2 className="spin" size={size} color="var(--primary)" />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message}</span>
    </div>
  );
};

export default Loader;
