import React, { useEffect, useState, useRef } from 'react';

interface ModalLayoutProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({ children, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Trigger entry animation
    requestAnimationFrame(() => setIsVisible(true));

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Reset drag offset to 0 so it animates to '100%' transform cleanly from a known state
    // if we were dragging. However, if we leave dragOffset as is, and switch transition on,
    // it will animate from `dragOffset` to `100%`.
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = y;
    currentY.current = y;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    currentY.current = y;
    const delta = y - startY.current;

    // Only allow dragging down. If dragging up, clamp to 0.
    setDragOffset(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Threshold to close
    if (dragOffset > 100) {
      handleClose();
    } else {
      setDragOffset(0); // Snap back
    }
  };

  // Bind mouse events to window when dragging to avoid losing focus?
  // Ideally we attach move/up to window, but for simplicity we can try attaching to the container first.
  // Actually, standard React mouse events might miss if we drag out of the element.
  // Using native events on window is safer for Mouse.
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const delta = e.clientY - startY.current;
        setDragOffset(Math.max(0, delta));
      }
    };

    const handleWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (currentY.current - startY.current > 100) {
          handleClose();
        } else {
          setDragOffset(0);
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

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
      pointerEvents: 'none'
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
      <div
        ref={contentRef}
        style={{
          width: '100%',
          height: '92%',
          background: 'var(--background-surface-primary)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          // If dragging, follow the offset. If not, follow isVisible state.
          transform: isDragging
            ? `translateY(${dragOffset}px)`
            : (isVisible ? 'translateY(0)' : 'translateY(100%)'),
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'auto',
          overflow: 'hidden',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Drag Handle / Close indicator */}
        <div
          onMouseDown={handleTouchStart}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            cursor: 'grab',
            touchAction: 'none' // propery prevents browser scroll interfering with drag
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
