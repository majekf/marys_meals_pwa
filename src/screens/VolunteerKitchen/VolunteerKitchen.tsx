import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './VolunteerKitchen.module.css';

// Volunteer characters
const VOLUNTEERS = [
  { id: 'cook', name: 'Kuchár', emoji: '👨‍🍳', needsItem: 'pot' },
  { id: 'helper', name: 'Pomocník', emoji: '🧑‍🤝‍🧑', needsItem: 'ladle' },
  { id: 'porter', name: 'Nosič', emoji: '🏃', needsItem: 'basket' },
] as const;

// Items to match
const ITEMS = [
  { id: 'pot', name: 'Hrniec', emoji: '🍲' },
  { id: 'ladle', name: 'Naberačka', emoji: '🥄' },
  { id: 'basket', name: 'Košík', emoji: '🧺' },
] as const;

type VolunteerId = (typeof VOLUNTEERS)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

export function VolunteerKitchen() {
  const [matchedPairs, setMatchedPairs] = useState<Set<ItemId>>(new Set());
  const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [lastMatchedVolunteer, setLastMatchedVolunteer] = useState<VolunteerId | null>(null);
  const { playSuccess, playError, playComplete } = useAudio();

  // Activate idle timer
  useIdleTimer();

  const isComplete = matchedPairs.size === ITEMS.length;

  const handleItemClick = useCallback((itemId: ItemId) => {
    if (matchedPairs.has(itemId)) return;
    setSelectedItem(itemId);
  }, [matchedPairs]);

  const handleVolunteerClick = useCallback((volunteerId: VolunteerId) => {
    if (!selectedItem) return;

    const volunteer = VOLUNTEERS.find((v) => v.id === volunteerId);
    if (!volunteer) return;

    // Check if this is a correct match
    if (volunteer.needsItem === selectedItem) {
      // Correct match!
      setMatchedPairs((prev) => new Set([...prev, selectedItem]));
      setLastMatchedVolunteer(volunteerId);
      setSelectedItem(null);

      // Check if game complete
      if (matchedPairs.size === ITEMS.length - 1) {
        setShowSuccess(true);
        playComplete();
      } else {
        playSuccess();
      }
    } else {
      // Wrong match
      setShowError(true);
      playError();
      setTimeout(() => setShowError(false), 800);
    }
  }, [selectedItem, matchedPairs, playSuccess, playError, playComplete]);

  const handleReset = useCallback(() => {
    setMatchedPairs(new Set());
    setSelectedItem(null);
    setShowSuccess(false);
    setLastMatchedVolunteer(null);
  }, []);

  return (
    <div className={styles.container}>
<Header title="Kuchyňa" variant="kids" showGameNav />

      <main className={styles.main}>
        {/* Instructions */}
        <div className={styles.instructions}>
          <h2>Spáruj predmety s pomocníkmi! 🤝</h2>
          <p>Vyber predmet a potom klikni na správneho pomocníka</p>
        </div>

        <div className={styles.gameArea}>
          {/* Items */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Predmety</h3>
            <div className={styles.itemsRow}>
              {ITEMS.map((item) => {
                const isMatched = matchedPairs.has(item.id);
                const isSelected = selectedItem === item.id;

                return (
                  <motion.button
                    key={item.id}
                    className={`${styles.item} ${isMatched ? styles.matched : ''} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    disabled={isMatched}
                    whileHover={!isMatched ? { scale: 1.05 } : {}}
                    whileTap={!isMatched ? { scale: 0.95 } : {}}
                    animate={{
                      opacity: isMatched ? 0.5 : 1,
                      y: isSelected ? -10 : 0,
                    }}
                  >
                    <span className={styles.emoji}>{item.emoji}</span>
                    <span className={styles.name}>{item.name}</span>
                    {isMatched && <span className={styles.checkmark}>✓</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Connection indicator */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                className={styles.connectionHint}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span>👆</span>
                <span>Vyber pomocníka</span>
                <span>👇</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Volunteers */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Pomocníci</h3>
            <div className={styles.volunteersRow}>
              {VOLUNTEERS.map((volunteer) => {
                const isMatched = matchedPairs.has(volunteer.needsItem);
                const isJustMatched = lastMatchedVolunteer === volunteer.id;

                return (
                  <motion.button
                    key={volunteer.id}
                    className={`${styles.volunteer} ${isMatched ? styles.matched : ''} ${selectedItem && !isMatched ? styles.selectable : ''}`}
                    onClick={() => handleVolunteerClick(volunteer.id)}
                    disabled={isMatched || !selectedItem}
                    whileHover={selectedItem && !isMatched ? { scale: 1.05 } : {}}
                    whileTap={selectedItem && !isMatched ? { scale: 0.95 } : {}}
                    animate={{
                      scale: isJustMatched ? [1, 1.2, 1] : 1,
                    }}
                  >
                    <span className={styles.emoji}>{volunteer.emoji}</span>
                    <span className={styles.name}>{volunteer.name}</span>
                    {isMatched && (
                      <motion.span
                        className={styles.matchedItem}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {ITEMS.find((i) => i.id === volunteer.needsItem)?.emoji}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          {matchedPairs.size} / {ITEMS.length} spárovaných
        </div>

        {/* Reset button (shown when complete) */}
        {isComplete && (
          <motion.button
            className={styles.resetButton}
            onClick={handleReset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Hrať znova 🔄
          </motion.button>
        )}
      </main>

      {/* Success feedback */}
      <FeedbackOverlay
        isVisible={showSuccess}
        type="success"
        message="Výborne! Všetko správne spárované!"
        onAnimationComplete={() => setShowSuccess(false)}
      />

      {/* Error feedback */}
      <FeedbackOverlay
        isVisible={showError}
        type="error"
        message="Skús to znova!"
      />
    </div>
  );
}
