import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './BowlGame.module.css';

// ═══════════════════════════════════════════════════════════════════════════
// CORRECT INGREDIENTS - these belong in likuni phala
// ═══════════════════════════════════════════════════════════════════════════
const CORRECT_INGREDIENTS = [
  {
    id: 'corn',
    name: 'Kukuričná kaša',
    icon: '🌽',
    color: '#FFD54F',
    targetCount: 7,
    unit: '🥄', // spoon icon for progress
    overflowMessage: 'Ups! Príliš veľa kaše – miska pretečie! 🌽💨',
  },
  {
    id: 'soy',
    name: 'Sója',
    icon: '🫘',
    color: '#8D6E63',
    targetCount: 2,
    unit: '🥄',
    overflowMessage: 'Ojoj, príliš veľa sóje! Bude to príliš husté. 🫘',
  },
  {
    id: 'sugar',
    name: 'Cukor',
    icon: '🍯',
    color: '#FFFDE7',
    targetCount: 1,
    unit: '🥄',
    overflowMessage: 'Ups, už je to príliš sladké! 🍯😋',
  },
  {
    id: 'vitamins',
    name: 'Vitamíny',
    icon: '⭐',
    color: '#81C784',
    targetCount: 1,
    unit: '⭐',
    overflowMessage: 'Stačí jedna vitamínová hviezdička! ⭐',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// WRONG INGREDIENTS - tempting but don't belong in nutritious porridge
// ═══════════════════════════════════════════════════════════════════════════
const WRONG_INGREDIENTS = [
  {
    id: 'cola',
    name: 'Cola',
    icon: '🥤',
    color: '#5D4037',
    errorMessage: 'Cola nie je zdravá! Deti potrebujú výživnú kašu, nie sladký nápoj. 🚫🥤',
  },
  {
    id: 'chips',
    name: 'Čipsy',
    icon: '🍟',
    color: '#FFB74D',
    errorMessage: 'Čipsy sú chutné, ale do kaše nepatria! 🍟❌',
  },
  {
    id: 'lollipop',
    name: 'Lízanka',
    icon: '🍭',
    color: '#F48FB1',
    errorMessage: 'Lízanka je sladká, ale deti potrebujú skutočné jedlo! 🍭',
  },
  {
    id: 'burger',
    name: 'Burger',
    icon: '🍔',
    color: '#A1887F',
    errorMessage: 'Burger do kaše? To by bolo divné! 🍔😄',
  },
  {
    id: 'chocolate',
    name: 'Čokoláda',
    icon: '🍫',
    color: '#6D4C41',
    errorMessage: 'Čokoláda je dobrota, ale deti potrebujú výživu! 🍫',
  },
  {
    id: 'icecream',
    name: 'Zmrzlina',
    icon: '🍦',
    color: '#FFCCBC',
    errorMessage: 'Zmrzlina by sa roztopila! Do kaše nepatrí. 🍦💧',
  },
  {
    id: 'ketchup',
    name: 'Kečup',
    icon: '🍅',
    color: '#EF5350',
    errorMessage: 'Kečup do kaše? Fuj, to by nechutilo! 🍅🙈',
  },
  {
    id: 'candy',
    name: 'Cukríky',
    icon: '🍬',
    color: '#CE93D8',
    errorMessage: 'Cukríky nie sú výživné! Deti potrebujú pravé jedlo. 🍬',
  },
] as const;

type CorrectIngredientId = (typeof CORRECT_INGREDIENTS)[number]['id'];
type WrongIngredientId = (typeof WRONG_INGREDIENTS)[number]['id'];
type AllIngredientId = CorrectIngredientId | WrongIngredientId;

// Helper to check if ingredient is correct
const isCorrectIngredient = (id: AllIngredientId): id is CorrectIngredientId =>
  CORRECT_INGREDIENTS.some((ing) => ing.id === id);

export function BowlGame() {
  // Track counts of each correct ingredient in the bowl
  const [ingredientCounts, setIngredientCounts] = useState<Record<CorrectIngredientId, number>>({
    corn: 0,
    soy: 0,
    sugar: 0,
    vitamins: 0,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIngredient, setDraggedIngredient] = useState<AllIngredientId | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const bowlRef = useRef<HTMLDivElement>(null);
  const { playSuccess, playError, playComplete } = useAudio();

  // Activate idle timer
  useIdleTimer();

  // Check if game is complete (all correct ingredients at target counts)
  const isComplete = CORRECT_INGREDIENTS.every(
    (ing) => ingredientCounts[ing.id] === ing.targetCount
  );

  // Calculate total items in bowl for visual display
  const totalItemsInBowl = Object.values(ingredientCounts).reduce((sum, count) => sum + count, 0);

  const checkDropInBowl = useCallback(
    (info: PanInfo, ingredientId: AllIngredientId) => {
      if (!bowlRef.current) return;

      const bowlRect = bowlRef.current.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;

      // Check if dropped inside bowl bounds
      const inBowl =
        dropX >= bowlRect.left &&
        dropX <= bowlRect.right &&
        dropY >= bowlRect.top &&
        dropY <= bowlRect.bottom;

      if (!inBowl) return;

      // Handle wrong ingredients
      if (!isCorrectIngredient(ingredientId)) {
        const wrongIng = WRONG_INGREDIENTS.find((ing) => ing.id === ingredientId);
        if (wrongIng) {
          setErrorMessage(wrongIng.errorMessage);
          playError();
        }
        return;
      }

      // Handle correct ingredients
      const correctIng = CORRECT_INGREDIENTS.find((ing) => ing.id === ingredientId);
      if (!correctIng) return;

      const currentCount = ingredientCounts[ingredientId];

      // Check for overflow
      if (currentCount >= correctIng.targetCount) {
        setErrorMessage(correctIng.overflowMessage);
        playError();
        return;
      }

      // Add one unit of the ingredient
      const newCount = currentCount + 1;
      const newCounts = { ...ingredientCounts, [ingredientId]: newCount };
      setIngredientCounts(newCounts);

      // Check if game is now complete
      const nowComplete = CORRECT_INGREDIENTS.every(
        (ing) => newCounts[ing.id] === ing.targetCount
      );

      if (nowComplete) {
        setShowSuccess(true);
        playComplete();
      } else {
        playSuccess();
      }
    },
    [ingredientCounts, playSuccess, playError, playComplete]
  );

  const handleDragEnd = useCallback(
    (ingredientId: AllIngredientId) =>
      (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setDraggedIngredient(null);
        checkDropInBowl(info, ingredientId);
      },
    [checkDropInBowl]
  );

  const handleReset = useCallback(() => {
    setIngredientCounts({ corn: 0, soy: 0, sugar: 0, vitamins: 0 });
    setShowSuccess(false);
    setErrorMessage(null);
    setResetKey((k) => k + 1);
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Build bowl contents for display
  const bowlContents: Array<{ id: string; icon: string }> = [];
  CORRECT_INGREDIENTS.forEach((ing) => {
    for (let i = 0; i < ingredientCounts[ing.id]; i++) {
      bowlContents.push({ id: `${ing.id}-${i}`, icon: ing.unit === '⭐' ? '⭐' : ing.icon });
    }
  });

  return (
    <div className={styles.container}>
      <Header title="Miska jedla" variant="kids" showGameNav />

      <main className={styles.main}>
        {/* Instructions */}
        <div className={styles.instructions}>
          <h2>Priprav výživnú kašu! 🥣</h2>
          <p>Potiahni správne suroviny do misky v správnom množstve</p>
        </div>

        <div className={styles.gameArea}>
          {/* Progress indicators */}
          <div className={styles.progressPanel}>
            {CORRECT_INGREDIENTS.map((ing) => {
              const current = ingredientCounts[ing.id];
              const target = ing.targetCount;
              const isFull = current >= target;

              return (
                <div key={ing.id} className={styles.progressItem}>
                  <span className={styles.progressIcon}>{ing.icon}</span>
                  <div className={styles.progressDots}>
                    {Array.from({ length: target }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`${styles.progressDot} ${idx < current ? styles.filled : ''}`}
                      >
                        {ing.unit}
                      </span>
                    ))}
                  </div>
                  {isFull && <span className={styles.checkmark}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Ingredients grid */}
          <div className={styles.ingredientsGrid}>
            {/* Correct ingredients */}
            <div className={styles.ingredientSection}>
              <h3 className={styles.sectionLabel}>Zdravé suroviny</h3>
              <div className={styles.ingredientsRow}>
                {CORRECT_INGREDIENTS.map((ingredient) => {
                  const isFull = ingredientCounts[ingredient.id] >= ingredient.targetCount;

                  return (
                    <motion.div
                      key={`${ingredient.id}-${resetKey}`}
                      className={`${styles.ingredient} ${styles.correct} ${isFull ? styles.completed : ''}`}
                      drag={!isFull}
                      dragElastic={0.1}
                      dragMomentum={false}
                      dragSnapToOrigin
                      onDragStart={() => setDraggedIngredient(ingredient.id)}
                      onDragEnd={handleDragEnd(ingredient.id)}
                      whileDrag={{ scale: 1.15, zIndex: 100 }}
                      style={{ backgroundColor: ingredient.color }}
                    >
                      <span className={styles.ingredientIcon}>{ingredient.icon}</span>
                      <span className={styles.ingredientName}>{ingredient.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Wrong ingredients */}
            <div className={styles.ingredientSection}>
              <h3 className={styles.sectionLabel}>Pozor! Toto sem nepatrí</h3>
              <div className={styles.ingredientsRow}>
                {WRONG_INGREDIENTS.map((ingredient) => (
                  <motion.div
                    key={`${ingredient.id}-${resetKey}`}
                    className={`${styles.ingredient} ${styles.wrong}`}
                    drag
                    dragElastic={0.1}
                    dragMomentum={false}
                    dragSnapToOrigin
                    onDragStart={() => setDraggedIngredient(ingredient.id)}
                    onDragEnd={handleDragEnd(ingredient.id)}
                    whileDrag={{ scale: 1.15, zIndex: 100 }}
                    style={{ backgroundColor: ingredient.color }}
                  >
                    <span className={styles.ingredientIcon}>{ingredient.icon}</span>
                    <span className={styles.ingredientName}>{ingredient.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bowl */}
          <div className={styles.bowlArea}>
            <motion.div
              ref={bowlRef}
              className={`${styles.bowl} ${draggedIngredient ? styles.bowlActive : ''} ${isComplete ? styles.bowlComplete : ''}`}
              animate={{
                scale: draggedIngredient ? 1.05 : 1,
                boxShadow: draggedIngredient
                  ? '0 0 30px rgba(0, 157, 220, 0.5)'
                  : isComplete
                    ? '0 0 40px rgba(76, 175, 80, 0.6)'
                    : '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Bowl contents */}
              <div className={styles.bowlContents}>
                {bowlContents.map((item) => (
                  <motion.span
                    key={item.id}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    className={styles.bowlIngredient}
                  >
                    {item.icon}
                  </motion.span>
                ))}
              </div>

              {totalItemsInBowl === 0 && <span className={styles.bowlPlaceholder}>🥣</span>}
            </motion.div>
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
        message="Výborne! Pripravil si likuni phala! 🎉"
        onAnimationComplete={() => setShowSuccess(false)}
      />

      {/* Error feedback */}
      <FeedbackOverlay
        isVisible={!!errorMessage}
        type="error"
        message={errorMessage ?? undefined}
        onAnimationComplete={handleErrorDismiss}
      />
    </div>
  );
}
