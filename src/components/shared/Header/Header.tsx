import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameNavigation } from '../../../hooks';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  showGameNav?: boolean;
  variant?: 'kids' | 'adults';
}

export function Header({
  title,
  showBack = true,
  showHome = true,
  showGameNav = false,
  variant = 'kids',
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { prevGame, nextGame } = useGameNavigation();
  const isHome = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  if (isHome) {
    return null; // Don't show header on home/mode select screen
  }

  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      <div className={styles.left}>
        {showGameNav && prevGame && (
          <motion.button
            className={styles.navButton}
            onClick={() => navigate(prevGame.path)}
            whileTap={{ scale: 0.95 }}
            aria-label={`Predchádzajúca hra: ${prevGame.title}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 17l-5-5 5-5" />
              <path d="M18 17l-5-5 5-5" />
            </svg>
            <span className={styles.navLabel}>{prevGame.title}</span>
          </motion.button>
        )}
        {showBack && (
          <motion.button
            className={styles.navButton}
            onClick={handleBack}
            whileTap={{ scale: 0.95 }}
            aria-label="Späť"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className={styles.navLabel}>Späť</span>
          </motion.button>
        )}
      </div>

      <div className={styles.center}>
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      <div className={styles.right}>
        {showHome && (
          <motion.button
            className={styles.navButton}
            onClick={handleHome}
            whileTap={{ scale: 0.95 }}
            aria-label="Domov"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            <span className={styles.navLabel}>Domov</span>
          </motion.button>
        )}
        {showGameNav && nextGame && (
          <motion.button
            className={styles.navButton}
            onClick={() => navigate(nextGame.path)}
            whileTap={{ scale: 0.95 }}
            aria-label={`Nasledujúca hra: ${nextGame.title}`}
          >
            <span className={styles.navLabel}>{nextGame.title}</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
          </motion.button>
        )}
      </div>
    </header>
  );
}
