import { motion, AnimatePresence } from 'framer-motion';
import styles from './FeedbackOverlay.module.css';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackOverlayProps {
  isVisible: boolean;
  type: FeedbackType;
  message?: string;
  onAnimationComplete?: () => void;
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

export function FeedbackOverlay({
  isVisible,
  type,
  message,
  onAnimationComplete,
}: FeedbackOverlayProps) {
  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isVisible && (
        <motion.div
          className={`${styles.overlay} ${styles[type]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={styles.content}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            <div className={styles.icon}>{icons[type]}</div>
            {message && <p className={styles.message}>{message}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
