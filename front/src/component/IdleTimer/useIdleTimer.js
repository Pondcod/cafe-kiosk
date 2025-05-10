import { useEffect, useRef, useState } from 'react';

export default function useIdleTimer({
  warningTime = 30_000,
  idleTime    = 90_000,
  onWarn,
  onIdle,
}) {
  const warnRef      = useRef();
  const idleRef      = useRef();
  const countdownRef = useRef();

  const initialSeconds = Math.ceil((idleTime - warningTime) / 1000);
  const [showWarn, setShowWarn]       = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  const reset = () => {
    clearTimeout(warnRef.current);
    clearTimeout(idleRef.current);
    clearInterval(countdownRef.current);
    setShowWarn(false);
    setSecondsLeft(initialSeconds);

    warnRef.current = setTimeout(() => {
      setShowWarn(true);
      onWarn?.();
      countdownRef.current = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    }, warningTime);

    idleRef.current = setTimeout(() => {
      onIdle?.();
      reset();
    }, idleTime);
  };

  useEffect(() => {
    const events = ['mousemove','mousedown','keydown','touchstart','scroll'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(warnRef.current);
      clearTimeout(idleRef.current);
      clearInterval(countdownRef.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, []);

  // return the reset function so consumers can hide the modal early
  return { showWarn, secondsLeft, reset };
}