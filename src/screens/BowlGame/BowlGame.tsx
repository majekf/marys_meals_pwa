import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './BowlGame.module.css';

// ═══════════════════════════════════════════════════════════════════════════
// CORRECT INGREDIENTS
// Positions: scattered around edges of playField, avoiding the center bowl.
// Safe zones verified for both portrait (768×850 playField) and landscape
// (1024×594 playField) tablets — bowl occupies ~37-63% x, ~37-63% y.
// ═══════════════════════════════════════════════════════════════════════════
const CORRECT_INGREDIENTS = [
  {
    id: 'corn' as const,
    name: 'Kukuričná kaša',
    icon: '🌽',
    color: '#FFD54F',
    targetCount: 7,
    unit: '🥄' as const,
    overflowMessage: 'Ups! Príliš veľa kaše – miska pretečie! 🌽💨',
    position: { top: '5%', left: '2%' },     // left column, top
  },
  {
    id: 'soy' as const,
    name: 'Sója',
    icon: '🫘',
    color: '#8D6E63',
    targetCount: 2,
    unit: '🥄' as const,
    overflowMessage: 'Ojoj, príliš veľa sóje! Bude to príliš husté. 🫘',
    position: { top: '5%', left: '75%' },    // right column, top
  },
  {
    id: 'sugar' as const,
    name: 'Cukor',
    icon: '🍯',
    color: '#FFFDE7',
    targetCount: 1,
    unit: '🥄' as const,
    overflowMessage: 'Ups, už je to príliš sladké! 🍯😋',
    position: { top: '2%', left: '32%' },    // top strip, center-left
  },
  {
    id: 'vitamins' as const,
    name: 'Vitamíny',
    icon: '⭐',
    color: '#C8E6C9',
    targetCount: 1,
    unit: '⭐' as const,
    overflowMessage: 'Stačí jedna vitamínová hviezdička! ⭐',
    position: { top: '2%', left: '53%' },    // top strip, center-right
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// WRONG INGREDIENTS – tempting but not for nutritious porridge
// ═══════════════════════════════════════════════════════════════════════════
const WRONG_INGREDIENTS = [
  {
    id: 'cola' as const,
    name: 'Cola',
    icon: '🥤',
    color: '#5D4037',
    errorMessage: 'Cola do kaše nepatrí! Deti potrebujú výživnú kašu, nie sladký nápoj. 🚫🥤',
    position: { top: '30%', left: '2%' },    // left column, mid
  },
  {
    id: 'chips' as const,
    name: 'Čipsy',
    icon: '🍟',
    color: '#FFB74D',
    errorMessage: 'Čipsy sú chutné, ale do kaše nepatria! 🍟❌',
    position: { top: '55%', left: '2%' },    // left column, lower-mid
  },
  {
    id: 'lollipop' as const,
    name: 'Lízanka',
    icon: '🍭',
    color: '#F48FB1',
    errorMessage: 'Lízanka je sladká, ale deti potrebujú skutočné jedlo plné správnej výživy. 🍭',
    position: { top: '78%', left: '2%' },    // left column, bottom
  },
  {
    id: 'burger' as const,
    name: 'Burger',
    icon: '🍔',
    color: '#A1887F',
    errorMessage: 'Burger do kaše? To by bolo divné! 🍔😄',
    position: { top: '30%', left: '75%' },   // right column, mid
  },
  {
    id: 'chocolate' as const,
    name: 'Čokoláda',
    icon: '🍫',
    color: '#6D4C41',
    errorMessage: 'Čokoláda je dobrota, ale deti potrebujú výživu! 🍫',
    position: { top: '55%', left: '75%' },   // right column, lower-mid
  },
  {
    id: 'icecream' as const,
    name: 'Zmrzlina',
    icon: '🍦',
    color: '#FFCCBC',
    errorMessage: 'Zmrzlina by sa roztopila! Do kaše nepatrí. 🍦💧',
    position: { top: '78%', left: '75%' },   // right column, bottom
  },
  {
    id: 'ketchup' as const,
    name: 'Kečup',
    icon: '🍅',
    color: '#EF5350',
    errorMessage: 'Kečup do kaše? To by pokazilo chuť. 🍅🙈',
    position: { top: '78%', left: '32%' },   // bottom strip, center-left
  },
  {
    id: 'candy' as const,
    name: 'Cukríky',
    icon: '🍬',
    color: '#CE93D8',
    errorMessage: 'Cukríky sú chutné ale nie dosť výživné! 🍬',
    position: { top: '78%', left: '53%' },   // bottom strip, center-right
  },
] as const;

type CorrectIngredientId = (typeof CORRECT_INGREDIENTS)[number]['id'];
type WrongIngredientId = (typeof WRONG_INGREDIENTS)[number]['id'];
type AllIngredientId = CorrectIngredientId | WrongIngredientId;

const isCorrectIngredient = (id: AllIngredientId): id is CorrectIngredientId =>
  CORRECT_INGREDIENTS.some((ing) => ing.id === id);

export function BowlGame() {
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

  useIdleTimer();

  // Auto-dismiss error after 3 seconds.
  // Each time errorMessage changes, the previous timer is cancelled and a new one starts.
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const isComplete = CORRECT_INGREDIENTS.every(
    (ing) => ingredientCounts[ing.id] === ing.targetCount
  );

  const totalItemsInBowl = Object.values(ingredientCounts).reduce((sum, c) => sum + c, 0);

  const checkDropInBowl = useCallback(
    (info: PanInfo, ingredientId: AllIngredientId) => {
      if (!bowlRef.current) return;

      const bowlRect = bowlRef.current.getBoundingClientRect();
      const inBowl =
        info.point.x >= bowlRect.left &&
        info.point.x <= bowlRect.right &&
        info.point.y >= bowlRect.top &&
        info.point.y <= bowlRect.bottom;

      if (!inBowl) return;

      // Wrong ingredient dropped in bowl
      if (!isCorrectIngredient(ingredientId)) {
        const wrongIng = WRONG_INGREDIENTS.find((ing) => ing.id === ingredientId);
        if (wrongIng) {
          setErrorMessage(wrongIng.errorMessage);
          playError();
        }
        return;
      }

      // Correct ingredient: check for overflow
      const correctIng = CORRECT_INGREDIENTS.find((ing) => ing.id === ingredientId);
      if (!correctIng) return;

      const currentCount = ingredientCounts[ingredientId];
      if (currentCount >= correctIng.targetCount) {
        setErrorMessage(correctIng.overflowMessage);
        playError();
        return;
      }

      // Add one unit
      const newCounts = { ...ingredientCounts, [ingredientId]: currentCount + 1 };
      setIngredientCounts(newCounts);

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
        // Clear previous error immediately on any new drop attempt.
        // React 18 batches this with any subsequent setErrorMessage inside checkDropInBowl,
        // so the net result is the new error (or null if no error).
        setErrorMessage(null);
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

  // Build bowl contents for visual display
  const bowlContents: Array<{ id: string; icon: string }> = [];
  CORRECT_INGREDIENTS.forEach((ing) => {
    for (let i = 0; i < ingredientCounts[ing.id]; i++) {
      bowlContents.push({
        id: `${ing.id}-${i}`,
        icon: ing.unit === '⭐' ? '⭐' : ing.icon,
      });
    }
  });

  return (
    <div className={styles.container}>
      <Header title="Miska jedla" variant="kids" showGameNav />

      <main className={styles.main}>
        {/* Top bar: instructions only */}
        <div className={styles.topBar}>
          <div className={styles.instructions}>
            <h2>Priprav výživnú kašu! 🥣</h2>
            <p>Potiahni správne suroviny do misky v správnom množstve</p>
          </div>
        </div>

        {/* Play field: bowl centered, ingredients scattered absolutely */}
        <div className={styles.playField}>
          {/* Bowl — centered in the play field */}
          <div className={styles.bowlWrapper}>
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

          {/* Correct ingredients — scattered in safe zones around the bowl */}
          {CORRECT_INGREDIENTS.map((ingredient) => (
            <motion.div
              key={`${ingredient.id}-${resetKey}`}
              className={styles.ingredient}
              style={{
                backgroundColor: ingredient.color,
                top: ingredient.position.top,
                left: ingredient.position.left,
              }}
              drag={!isComplete}
              dragElastic={0.1}
              dragMomentum={false}
              dragSnapToOrigin
              onDragStart={() => setDraggedIngredient(ingredient.id)}
              onDragEnd={handleDragEnd(ingredient.id)}
              whileDrag={{ scale: 1.15, zIndex: 100 }}
            >
              <span className={styles.ingredientIcon}>{ingredient.icon}</span>
              <span className={styles.ingredientName}>{ingredient.name}</span>
            </motion.div>
          ))}

          {/* Wrong ingredients — also scattered in safe zones */}
          {WRONG_INGREDIENTS.map((ingredient) => (
            <motion.div
              key={`${ingredient.id}-${resetKey}`}
              className={styles.ingredient}
              style={{
                backgroundColor: ingredient.color,
                top: ingredient.position.top,
                left: ingredient.position.left,
              }}
              drag={!isComplete}
              dragElastic={0.1}
              dragMomentum={false}
              dragSnapToOrigin
              onDragStart={() => setDraggedIngredient(ingredient.id)}
              onDragEnd={handleDragEnd(ingredient.id)}
              whileDrag={{ scale: 1.15, zIndex: 100 }}
            >
              <span className={styles.ingredientIcon}>{ingredient.icon}</span>
              <span className={styles.ingredientName}>{ingredient.name}</span>
            </motion.div>
          ))}

          {/* Reset button — shown after game is complete */}
          {isComplete && (
            <motion.button
              className={styles.resetButton}
              onClick={handleReset}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Hrať znova 🔄
            </motion.button>
          )}
        </div>
      </main>

      <FeedbackOverlay
        isVisible={showSuccess}
        type="success"
        message="Výborne! Pripravil si likuni phala! 🎉"
        onAnimationComplete={() => setShowSuccess(false)}
      />

      <FeedbackOverlay
        isVisible={!!errorMessage}
        type="error"
        message={errorMessage ?? undefined}
        onAnimationComplete={() => setErrorMessage(null)}
      />
    </div>
  );
}
