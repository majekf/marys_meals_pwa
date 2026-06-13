import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './BowlGame.module.css';

// Ingredients data
const INGREDIENTS = [
  { id: 'corn', name: 'Kukurica', emoji: '🌽', color: '#FFD54F' },
  { id: 'soy', name: 'Sója', emoji: '🫘', color: '#8D6E63' },
  { id: 'sugar', name: 'Cukor', emoji: '🍬', color: '#FFFFFF' },
  { id: 'vitamins', name: 'Vitamíny', emoji: '💊', color: '#81C784' },
] as const;

type IngredientId = (typeof INGREDIENTS)[number]['id'];

export function BowlGame() {
  const [addedIngredients, setAddedIngredients] = useState<Set<IngredientId>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [draggedIngredient, setDraggedIngredient] = useState<IngredientId | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const bowlRef = useRef<HTMLDivElement>(null);
  const { playSuccess, playComplete } = useAudio();

  // Activate idle timer
  useIdleTimer();

  const isComplete = addedIngredients.size === INGREDIENTS.length;

  const checkDropInBowl = useCallback(
    (info: PanInfo, ingredientId: IngredientId) => {
      if (!bowlRef.current || addedIngredients.has(ingredientId)) return;

      const bowlRect = bowlRef.current.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;

      // Check if dropped inside bowl bounds
      const inBowl =
        dropX >= bowlRect.left &&
        dropX <= bowlRect.right &&
        dropY >= bowlRect.top &&
        dropY <= bowlRect.bottom;

      if (inBowl) {
        // Add ingredient to bowl
        setAddedIngredients((prev) => new Set([...prev, ingredientId]));
        
        // Check if game complete
        if (addedIngredients.size === INGREDIENTS.length - 1) {
          setShowSuccess(true);
          playComplete();
        } else {
          playSuccess();
        }
      }
    },
    [addedIngredients, playSuccess, playComplete]
  );

  const handleDragEnd = useCallback(
    (ingredientId: IngredientId) => (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDraggedIngredient(null);
      checkDropInBowl(info, ingredientId);
    },
    [checkDropInBowl]
  );

  const handleReset = useCallback(() => {
    setAddedIngredients(new Set());
    setShowSuccess(false);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <div className={styles.container}>
      <Header title="Miska jedla" variant="kids" showGameNav />

      <main className={styles.main}>
        {/* Instructions */}
        <div className={styles.instructions}>
          <h2>Potiahni ingrediencie do misky! 🥣</h2>
          <p>Vytvor likuni phala - výživnú kašu pre deti</p>
        </div>

        <div className={styles.gameArea}>
          {/* Ingredients */}
          <div className={styles.ingredientsRow}>
            {INGREDIENTS.map((ingredient) => {
              const isAdded = addedIngredients.has(ingredient.id);

              return (
                <motion.div
                  key={`${ingredient.id}-${resetKey}`}
                  className={`${styles.ingredient} ${isAdded ? styles.added : ''}`}
                  drag={!isAdded}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDragStart={() => setDraggedIngredient(ingredient.id)}
                  onDragEnd={handleDragEnd(ingredient.id)}
                  whileDrag={{ scale: 1.1, zIndex: 100 }}
                  animate={{
                    opacity: isAdded ? 0.4 : 1,
                    scale: isAdded ? 0.9 : 1,
                  }}
                  style={{
                    backgroundColor: ingredient.color,
                  }}
                >
                  <span className={styles.emoji}>{ingredient.emoji}</span>
                  <span className={styles.name}>{ingredient.name}</span>
                  {isAdded && <span className={styles.checkmark}>✓</span>}
                </motion.div>
              );
            })}
          </div>

          {/* Bowl */}
          <div className={styles.bowlArea}>
            <motion.div
              ref={bowlRef}
              className={`${styles.bowl} ${draggedIngredient ? styles.bowlActive : ''}`}
              animate={{
                scale: draggedIngredient ? 1.05 : 1,
                boxShadow: draggedIngredient
                  ? '0 0 30px rgba(0, 157, 220, 0.5)'
                  : '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Bowl contents */}
              <div className={styles.bowlContents}>
                {Array.from(addedIngredients).map((id) => {
                  const ingredient = INGREDIENTS.find((i) => i.id === id);
                  return ingredient ? (
                    <motion.span
                      key={id}
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      className={styles.bowlIngredient}
                    >
                      {ingredient.emoji}
                    </motion.span>
                  ) : null;
                })}
              </div>

              {addedIngredients.size === 0 && (
                <span className={styles.bowlPlaceholder}>🥣</span>
              )}
            </motion.div>

            {/* Progress */}
            <div className={styles.progress}>
              {addedIngredients.size} / {INGREDIENTS.length} ingrediencií
            </div>
          </div>
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
        message="Výborne! Pripravil si likuni phala!"
        onAnimationComplete={() => setShowSuccess(false)}
      />

      {/* Error feedback */}
      <FeedbackOverlay
        isVisible={showError}
        type="error"
        onAnimationComplete={() => setShowError(false)}
      />
    </div>
  );
}
