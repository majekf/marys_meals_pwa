import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfig } from '../config';

interface UseIdleTimerOptions {
  /** Override config timeout in ms */
  timeoutMs?: number;
  /** Path to redirect to on idle */
  redirectPath?: string;
  /** Disable the timer (e.g., on home screen) */
  disabled?: boolean;
}

/**
 * Hook to detect user inactivity and redirect to home screen.
 * Resets timer on any touch, mouse, or keyboard activity.
 */
export function useIdleTimer(options: UseIdleTimerOptions = {}) {
  const { config } = useConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef<number | null>(null);

  const {
    timeoutMs = config.settings.idleTimeoutMs,
    redirectPath = '/',
    disabled = false,
  } = options;

  // Don't run on the redirect target path
  const isOnRedirectPath = location.pathname === redirectPath;
  const shouldRun = !disabled && !isOnRedirectPath && timeoutMs > 0;

  const handleIdle = useCallback(() => {
    navigate(redirectPath, { replace: true });
  }, [navigate, redirectPath]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    if (shouldRun) {
      timeoutRef.current = window.setTimeout(handleIdle, timeoutMs);
    }
  }, [shouldRun, timeoutMs, handleIdle]);

  useEffect(() => {
    if (!shouldRun) {
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'touchstart',
      'touchmove',
      'keydown',
      'scroll',
      'wheel',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Start the timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [shouldRun, resetTimer]);

  // Return resetTimer in case manual reset is needed
  return { resetTimer };
}
