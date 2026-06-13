import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfig } from '../../config';
import { Button } from '../../components/shared';
import styles from './ModeSelect.module.css';

const HOLD_DURATION = 2000; // 2 seconds to unlock adults mode

export function ModeSelect() {
  const navigate = useNavigate();
  const { config, loading } = useConfig();
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const handleKidsClick = useCallback(() => {
    if (config.features.kidsMode.enabled) {
      navigate('/kids');
    }
  }, [navigate, config.features.kidsMode.enabled]);

  const startAdultHold = useCallback(() => {
    if (!config.features.adultsMode.enabled) return;

    const startTime = Date.now();
    const holdMs = config.settings.adultLockHoldMs || HOLD_DURATION;

    // Update progress every 50ms
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / holdMs) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    // Navigate after hold duration
    holdTimerRef.current = window.setTimeout(() => {
      cancelAdultHold();
      navigate('/adults');
    }, holdMs);
  }, [navigate, config.features.adultsMode.enabled, config.settings.adultLockHoldMs]);

  const cancelAdultHold = useCallback(() => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Logo */}
      <motion.div
        className={styles.logo}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="/images/logo-square.jpg"
          alt="Mary's Meals"
          className={styles.logoImage}
          onError={(e) => {
            // Fallback if image doesn't exist yet
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className={styles.title}>{config.appName}</h1>
      </motion.div>

      {/* Mode buttons */}
      <div className={styles.buttons}>
        {config.features.kidsMode.enabled && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="primary"
              size="xl"
              onClick={handleKidsClick}
              className={styles.modeButton}
            >
              <span className={styles.modeIcon}>🎮</span>
              Pre deti
            </Button>
          </motion.div>
        )}

        {config.features.adultsMode.enabled && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={styles.adultButtonWrapper}
          >
            <Button
              variant="secondary"
              size="xl"
              onPointerDown={startAdultHold}
              onPointerUp={cancelAdultHold}
              onPointerLeave={cancelAdultHold}
              onPointerCancel={cancelAdultHold}
              className={styles.modeButton}
            >
              <span className={styles.modeIcon}>📊</span>
              Pre dospelých
              {holdProgress > 0 && (
                <span className={styles.holdHint}> (podržte)</span>
              )}
            </Button>
            
            {/* Progress indicator */}
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${holdProgress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Subtle hint for adults mode */}
      {config.features.adultsMode.enabled && (
        <motion.p
          className={styles.hint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Pre vstup do sekcie dospelých podržte tlačidlo 2 sekundy
        </motion.p>
      )}

      {/* Version */}
      <div className={styles.version}>v{config.version}</div>
    </div>
  );
}
