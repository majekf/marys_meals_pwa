import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './BowlGame.module.css';

// ═══════════════════════════════════════════════════════════════════════════
// INGREDIENT LAYOUT – formula-based ellipse ring
// Tiles are placed via a zero-size anchor div (no framer-motion involvement).
// The draggable motion.div inside has origin 0,0 so dragSnapToOrigin always
// snaps back to the anchor's center — the tile's ring position.
// ═══════════════════════════════════════════════════════════════════════════
const TILE_SIZE = 72;
const BASE_RADIUS = 210;

const organicOffsets: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: -8 },
  { x: 10, y: -4 },
  { x: 8, y: 8 },
  { x: 0, y: 12 },
  { x: -10, y: 6 },
  { x: -12, y: -4 },
  { x: 0, y: 10 },
  { x: 12, y: 4 },
  { x: 8, y: -8 },
  { x: -4, y: -12 },
  { x: -12, y: 2 },
  { x: -6, y: 10 },
];

function getSafeRadius(fieldSize: { width: number; height: number }): number {
  if (!fieldSize.width || !fieldSize.height) return BASE_RADIUS;
  const padding = 24;
  const halfTile = TILE_SIZE / 2;
  const maxX = fieldSize.width / 2 - halfTile - padding;
  const maxY = fieldSize.height / 2 - halfTile - padding;
  const safeRadius = Math.min(BASE_RADIUS, maxX / 1.12, maxY / 0.82);
  return Math.max(120, safeRadius);
}

function getIngredientOffset(
  index: number,
  fieldSize: { width: number; height: number }
): { x: number; y: number } {
  const angle = ((index * 30 - 90) * Math.PI) / 180;
  const radius = getSafeRadius(fieldSize);
  const ellipseX = radius * 1.12;
  const ellipseY = radius * 0.82;
  const organic = organicOffsets[index % organicOffsets.length];
  return {
    x: Math.cos(angle) * ellipseX + organic.x,
    y: Math.sin(angle) * ellipseY + organic.y,
  };
}

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

// Combined ingredients array: interleave correct and wrong for mixed layout
type IngredientData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCorrect: boolean;
  // Correct-only fields
  targetCount?: number;
  unit?: string;
  overflowMessage?: string;
  // Wrong-only field
  errorMessage?: string;
};

const ALL_INGREDIENTS: ReadonlyArray<IngredientData> = [
  // Mixed order: C, W, C, W, W, C, W, W, C, W, W, W
  { id: 'corn', name: 'Kukuričná kaša', icon: '🌽', color: '#FFD54F', isCorrect: true, targetCount: 7, unit: '🥄', overflowMessage: 'Ups! Príliš veľa kaše – miska pretečie! 🌽💨' },
  { id: 'cola', name: 'Cola', icon: '🥤', color: '#5D4037', isCorrect: false, errorMessage: 'Cola do kaše nepatrí! Deti potrebujú výživnú kašu, nie sladký nápoj. 🚫🥤' },
  { id: 'soy', name: 'Sója', icon: '🫘', color: '#8D6E63', isCorrect: true, targetCount: 2, unit: '🥄', overflowMessage: 'Ojoj, príliš veľa sóje! Bude to príliš husté. 🫘' },
  { id: 'chips', name: 'Čipsy', icon: '🍟', color: '#FFB74D', isCorrect: false, errorMessage: 'Čipsy sú chutné, ale do kaše nepatria! 🍟❌' },
  { id: 'lollipop', name: 'Lízanka', icon: '🍭', color: '#F48FB1', isCorrect: false, errorMessage: 'Lízanka je sladká, ale deti potrebujú skutočné jedlo plné správnej výživy. 🍭' },
  { id: 'sugar', name: 'Cukor', icon: '🍯', color: '#FFFDE7', isCorrect: true, targetCount: 1, unit: '🥄', overflowMessage: 'Ups, už je to príliš sladké! 🍯😋' },
  { id: 'burger', name: 'Burger', icon: '🍔', color: '#A1887F', isCorrect: false, errorMessage: 'Burger do kaše? To by bolo divné! 🍔😄' },
  { id: 'chocolate', name: 'Čokoláda', icon: '🍫', color: '#6D4C41', isCorrect: false, errorMessage: 'Čokoláda je dobrota, ale deti potrebujú výživu! 🍫' },
  { id: 'vitamins', name: 'Vitamíny', icon: '⭐', color: '#C8E6C9', isCorrect: true, targetCount: 1, unit: '⭐', overflowMessage: 'Stačí jedna vitamínová hviezdička! ⭐' },
  { id: 'icecream', name: 'Zmrzlina', icon: '🍦', color: '#FFCCBC', isCorrect: false, errorMessage: 'Zmrzlina by sa roztopila! Do kaše nepatrí. 🍦💧' },
  { id: 'ketchup', name: 'Kečup', icon: '🍅', color: '#EF5350', isCorrect: false, errorMessage: 'Kečup do kaše? To by pokazilo chuť. 🍅🙈' },
  { id: 'candy', name: 'Cukríky', icon: '🍬', color: '#CE93D8', isCorrect: false, errorMessage: 'Cukríky sú chutné ale nie dosť výživné! 🍬' },
];

// IDs of correct ingredients for state management
const CORRECT_IDS = ['corn', 'soy', 'sugar', 'vitamins'] as const;
type CorrectIngredientId = (typeof CORRECT_IDS)[number];

const getCorrectIngredient = (id: string) =>
  ALL_INGREDIENTS.find((ing) => ing.id === id && ing.isCorrect) as IngredientData & { targetCount: number; unit: string; overflowMessage: string } | undefined;

export function BowlGame() {
  const [ingredientCounts, setIngredientCounts] = useState<Record<CorrectIngredientId, number>>({
    corn: 0,
    soy: 0,
    sugar: 0,
    vitamins: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIngredient, setDraggedIngredient] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const bowlRef = useRef<HTMLDivElement>(null);
  const [playFieldRef, fieldSize] = useElementSize();
  const { playSuccess, playError, playComplete } = useAudio();

  useIdleTimer();

  // Auto-dismiss error after 2 seconds.
  // Each time errorMessage changes, the previous timer is cancelled and a new one starts.
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const isComplete = CORRECT_IDS.every(
    (id) => ingredientCounts[id] === getCorrectIngredient(id)?.targetCount
  );

  const totalItemsInBowl = Object.values(ingredientCounts).reduce((sum, c) => sum + c, 0);

  const checkDropInBowl = useCallback(
    (info: PanInfo, ingredientId: string) => {
      if (!bowlRef.current) return;

      const bowlRect = bowlRef.current.getBoundingClientRect();
      const inBowl =
        info.point.x >= bowlRect.left &&
        info.point.x <= bowlRect.right &&
        info.point.y >= bowlRect.top &&
        info.point.y <= bowlRect.bottom;

      if (!inBowl) return;

      const ingredient = ALL_INGREDIENTS.find((ing) => ing.id === ingredientId);
      if (!ingredient) return;

      // Wrong ingredient dropped in bowl
      if (!ingredient.isCorrect) {
        setErrorMessage(ingredient.errorMessage ?? 'Toto do kaše nepatrí!');
        playError();
        return;
      }

      // Correct ingredient: check for overflow
      const correctIng = getCorrectIngredient(ingredientId);
      if (!correctIng) return;

      const currentCount = ingredientCounts[ingredientId as CorrectIngredientId] ?? 0;
      if (currentCount >= correctIng.targetCount) {
        setErrorMessage(correctIng.overflowMessage);
        playError();
        return;
      }

      // Add one unit
      const newCounts = { ...ingredientCounts, [ingredientId]: currentCount + 1 };
      setIngredientCounts(newCounts);

      const nowComplete = CORRECT_IDS.every(
        (id) => newCounts[id] === getCorrectIngredient(id)?.targetCount
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
    (ingredientId: string) =>
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
  ALL_INGREDIENTS.filter((ing) => ing.isCorrect).forEach((ing) => {
    const count = ingredientCounts[ing.id as CorrectIngredientId] ?? 0;
    for (let i = 0; i < count; i++) {
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
        <div ref={playFieldRef} className={styles.playField}>
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

          {/* All ingredients — anchor div handles ring placement; draggable motion.div
               inside has origin 0,0 so dragSnapToOrigin reliably snaps back. */}
          {ALL_INGREDIENTS.map((ingredient, idx) => {
            const offset = getIngredientOffset(idx, fieldSize);
            return (
              <div
                key={`${ingredient.id}-${resetKey}`}
                className={styles.ingredientAnchor}
                style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
              >
                <motion.div
                  className={styles.ingredientTile}
                  style={{ backgroundColor: ingredient.color }}
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
              </div>
            );
          })}

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
