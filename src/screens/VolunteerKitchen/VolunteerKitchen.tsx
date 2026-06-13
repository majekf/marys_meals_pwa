import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Header, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer, useAudio } from '../../hooks';
import styles from './VolunteerKitchen.module.css';

const CHARACTERS = [
  { id: 'donor', name: 'Darca', emoji: '🤝', needsItem: 'coin' },
  { id: 'cook', name: 'Kuchárka', emoji: '👩\u200d🍳', needsItem: 'ladle' },
  { id: 'teacher', name: 'Učiteľ', emoji: '👨\u200d🏫', needsItem: 'book' },
  { id: 'farmer', name: 'Farmár', emoji: '👨\u200d🌾', needsItem: 'seed' },
  { id: 'child', name: 'Dieťa', emoji: '🧒', needsItem: 'bowl' },
] as const;

const ITEMS = [
  { id: 'coin', name: 'Minca', emoji: '🪙' },
  { id: 'ladle', name: 'Varecha', emoji: '🥄' },
  { id: 'book', name: 'Kniha', emoji: '📚' },
  { id: 'seed', name: 'Semeno', emoji: '🌱' },
  { id: 'bowl', name: 'Miska', emoji: '🥣' },
] as const;

type CharacterId = (typeof CHARACTERS)[number]['id'];
type ItemId = (typeof ITEMS)[number]['id'];

const shuffle = <T,>(array: readonly T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export function VolunteerKitchen() {
  const [matchedPairs, setMatchedPairs] = useState<Map<CharacterId, ItemId>>(new Map());
  const [draggingItem, setDraggingItem] = useState<ItemId | null>(null);
  const [hoveredCharacter, setHoveredCharacter] = useState<CharacterId | null>(null);
  const [errorItem, setErrorItem] = useState<ItemId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [shuffledCharacters, setShuffledCharacters] = useState(() => shuffle(CHARACTERS));
  const [shuffledItems, setShuffledItems] = useState(() => shuffle(ITEMS));
  const { playSuccess, playError, playComplete } = useAudio();

  const characterRefs = useRef<Map<CharacterId, HTMLDivElement | null>>(new Map());
  const prevMatchedSizeRef = useRef(0);

  useIdleTimer();

  const matchedItemIds = new Set(matchedPairs.values());
  const isComplete = matchedPairs.size === CHARACTERS.length;

  // Trigger audio feedback whenever a new pair is matched
  useEffect(() => {
    const size = matchedPairs.size;
    if (size > prevMatchedSizeRef.current) {
      if (size === CHARACTERS.length) {
        setShowSuccess(true);
        playComplete();
      } else {
        playSuccess();
      }
    }
    prevMatchedSizeRef.current = size;
  }, [matchedPairs.size, playSuccess, playComplete]);

  const getDropTarget = useCallback((point: { x: number; y: number }): CharacterId | null => {
    for (const [id, el] of characterRefs.current.entries()) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      ) {
        return id;
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((itemId: ItemId) => {
    setDraggingItem(itemId);
    setErrorItem(null);
  }, []);

  const handleDragEnd = useCallback(
    (itemId: ItemId, info: PanInfo) => {
      setDraggingItem(null);
      setHoveredCharacter(null);

      const target = getDropTarget(info.point);

      if (target && !matchedPairs.has(target)) {
        const character = CHARACTERS.find((c) => c.id === target);
        if (character?.needsItem === itemId) {
          setMatchedPairs((prev) => {
            const next = new Map(prev);
            next.set(target, itemId);
            return next;
          });
          return;
        }
      }

      // Wrong drop or missed a target
      playError();
      setShowError(true);
      setErrorItem(itemId);
      setTimeout(() => {
        setShowError(false);
        setErrorItem(null);
      }, 900);
    },
    [getDropTarget, matchedPairs, playError],
  );

  const handleReset = useCallback(() => {
    setMatchedPairs(new Map());
    setDraggingItem(null);
    setHoveredCharacter(null);
    setErrorItem(null);
    setShowSuccess(false);
    prevMatchedSizeRef.current = 0;
    setGameKey((k) => k + 1);
    setShuffledCharacters(shuffle(CHARACTERS));
    setShuffledItems(shuffle(ITEMS));
  }, []);

  return (
    <div className={styles.container}>
      <Header title="Kuchyňa dobrovoľníkov" variant="kids" showGameNav />

      <main className={styles.main}>
        <p className={styles.instructions}>
          Priraď každému pomocníkovi správny predmet! 🎯
        </p>

        <div className={styles.gameArea}>
          {/* Drop zones – characters */}
          <div className={styles.charactersRow}>
            {shuffledCharacters.map((character) => {
              const isMatched = matchedPairs.has(character.id);
              const isHovered = hoveredCharacter === character.id && !!draggingItem;
              const matchedItemId = matchedPairs.get(character.id);
              const matchedItem = matchedItemId ? ITEMS.find((i) => i.id === matchedItemId) : null;

              return (
                <div
                  key={character.id}
                  ref={(el) => { characterRefs.current.set(character.id, el); }}
                  className={[
                    styles.character,
                    isMatched ? styles.characterMatched : '',
                    isHovered ? styles.characterHovered : '',
                  ].join(' ')}
                >
                  <span className={styles.charEmoji}>{character.emoji}</span>
                  <span className={styles.charName}>{character.name}</span>
                  <AnimatePresence>
                    {isMatched && matchedItem && (
                      <motion.span
                        key="badge"
                        className={styles.matchedBadge}
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        {matchedItem.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Draggable items */}
          <div className={styles.itemsRow}>
            {shuffledItems.map((item) => {
              const isMatched = matchedItemIds.has(item.id);
              const isSnappingBack = errorItem === item.id;

              return (
                <motion.div
                  key={`${item.id}-${gameKey}`}
                  className={[
                    styles.item,
                    isMatched ? styles.itemMatched : '',
                    draggingItem === item.id ? styles.itemDragging : '',
                  ].join(' ')}
                  drag={!isMatched && errorItem !== item.id}
                  dragMomentum={false}
                  dragElastic={0.08}
                  animate={
                    isMatched
                      ? { opacity: 0, scale: 0.4 }
                      : isSnappingBack
                        ? { x: 0, y: 0, opacity: 1, scale: 1 }
                        : { opacity: 1, scale: 1 }
                  }
                  transition={
                    isMatched
                      ? { duration: 0.3 }
                      : isSnappingBack
                        ? { type: 'spring', stiffness: 500, damping: 30 }
                        : { duration: 0.2 }
                  }
                  onDragStart={() => handleDragStart(item.id)}
                  onDrag={(_, info) => setHoveredCharacter(getDropTarget(info.point))}
                  onDragEnd={(_, info) => handleDragEnd(item.id, info)}
                  whileDrag={{ scale: 1.15, zIndex: 100, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}
                  style={{
                    touchAction: 'none',
                    cursor: isMatched ? 'default' : 'grab',
                    pointerEvents: isMatched ? 'none' : 'auto',
                    position: 'relative',
                  }}
                >
                  <span className={styles.itemEmoji}>{item.emoji}</span>
                  <span className={styles.itemName}>{item.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className={styles.progress}>
          {matchedPairs.size} / {CHARACTERS.length} priradených
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.button
              className={styles.resetButton}
              onClick={handleReset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              Hrať znova 🔄
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      <FeedbackOverlay
        isVisible={showSuccess}
        type="success"
        message="Výborne! Každý pomocník má svoju úlohu."
        onAnimationComplete={() => setShowSuccess(false)}
      />

      <FeedbackOverlay
        isVisible={showError}
        type="error"
        message="Skús to znova!"
      />
    </div>
  );
}
