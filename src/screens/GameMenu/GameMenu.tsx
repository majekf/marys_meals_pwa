import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfig } from '../../config';
import { Header } from '../../components/shared';
import { useIdleTimer } from '../../hooks';
import { games } from './gamesData';
import styles from './GameMenu.module.css';

export function GameMenu() {
  const navigate = useNavigate();
  const { config } = useConfig();
  
  // Activate idle timer
  useIdleTimer();

  // Filter games based on config
  const enabledGames = games.filter(
    (game) => config.features.kidsMode.games[game.configKey]
  );

  const handleGameClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      <Header title="Hry" variant="kids" />
      
      <main className={styles.main}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Vyber si hru! 🎮
        </motion.h2>

        <div className={styles.grid}>
          {enabledGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className={styles.gameCard}
                onClick={() => handleGameClick(game.path)}
              >
                <span className={styles.gameIcon}>{game.icon}</span>
                <span className={styles.gameTitle}>{game.title}</span>
                <span className={styles.gameDescription}>{game.description}</span>
              </button>
            </motion.div>
          ))}
        </div>

        {enabledGames.length === 0 && (
          <p className={styles.empty}>Žiadne hry nie sú k dispozícii.</p>
        )}
      </main>
    </div>
  );
}
