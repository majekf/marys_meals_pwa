import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfig } from '../../config';
import { Button } from '../../components/shared';
import styles from './ModeSelect.module.css';

export function ModeSelect() {
  const navigate = useNavigate();
  const { config, loading } = useConfig();

  const handleKidsClick = useCallback(() => {
    if (config.features.kidsMode.enabled) {
      navigate('/kids');
    }
  }, [navigate, config.features.kidsMode.enabled]);

  const handleAdultsClick = useCallback(() => {
    if (config.features.adultsMode.enabled) {
      navigate('/adults');
    }
  }, [navigate, config.features.adultsMode.enabled]);

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
          >
            <Button
              variant="secondary"
              size="xl"
              onClick={handleAdultsClick}
              className={styles.modeButton}
            >
              <span className={styles.modeIcon}>💙</span>
              Pre zvedavých
            </Button>
          </motion.div>
        )}
      </div>

      {/* Version */}
      <div className={styles.version}>v{config.version}</div>
    </div>
  );
}
