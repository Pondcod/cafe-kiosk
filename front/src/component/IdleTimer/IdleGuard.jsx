import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../Context/CartContext.jsx';
import useIdleTimer from './useIdleTimer.js';
import WarningModal from './WarningModal.jsx';

export default function IdleGuard({ children }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { clearCart } = useCart();

  const { showWarn, secondsLeft } = useIdleTimer({
    warningTime: 30_000,  
    idleTime:    90_000,  
    onWarn:  () => {},
    onIdle:  () => {
      if (location.pathname !== '/') {
        clearCart();
        navigate('/');
      }
    },
  });

  return (
    <>
      {showWarn && location.pathname !== '/' && (
        <WarningModal
          secondsLeft={secondsLeft}
          onClose={() => {/* hide modal inside hook if needed */}}
        />
      )}
      {children}
    </>
  );
}