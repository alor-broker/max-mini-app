import React, { useEffect, useState } from 'react';

interface ModalLayoutProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({ children, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      pointerEvents: 'none' // Allow clicks to pass through initially? No, we want to block interactions with background
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'auto'
        }}
      />

      {/* Modal Content - Slide up */}
      <div style={{
        width: '100%',
        height: '92%', // Almost full screen
        background: 'var(--background-surface-primary)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto', // Re-enable pointer events
        overflow: 'hidden',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Drag Handle / Close indicator */}
        <div
          onClick={handleClose}
          style={{
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <div style={{ width: '40px', height: '4px', background: 'var(--icon-tertiary, #ccc)', borderRadius: '2px' }} />
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--background-surface-primary)'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
