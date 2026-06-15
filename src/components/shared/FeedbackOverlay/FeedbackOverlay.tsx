import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FeedbackOverlay.module.css';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackOverlayProps {
  isVisible: boolean;
  type: FeedbackType;
  message?: string;
  onAnimationComplete?: () => void;
  autoDismissDelay?: number; // ms to auto-dismiss (optional)
}

const icons = {
  success: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
      <path
        d="M24 40l10 10 22-22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
      <path
        d="M28 28l24 24M52 28L28 52"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ),
  info: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
      <path
        d="M40 28v4M40 38v14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const toastVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

export function FeedbackOverlay({
  isVisible,
  type,
  message,
  onAnimationComplete,
  autoDismissDelay = type === 'success' ? 3000 : undefined,
}: FeedbackOverlayProps) {
  // Auto-dismiss after specified delay
  useEffect(() => {
    if (!isVisible || !autoDismissDelay || !onAnimationComplete) return;
    const timer = setTimeout(() => onAnimationComplete(), autoDismissDelay);
    return () => clearTimeout(timer);
  }, [isVisible, autoDismissDelay, onAnimationComplete]);
  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isVisible && (
        <motion.div
          className={`${styles.overlay} ${styles[type]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={styles.content}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
          >
            <div className={styles.icon}>{icons[type]}</div>
            {message && <p className={styles.message}>{message}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
