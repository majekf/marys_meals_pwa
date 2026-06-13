# BowlGame – Ingredient Positioning Issue

## App Stack

- **Framework:** React 19 + TypeScript + Vite
- **Animation / Drag:** `framer-motion` (drag, dragSnapToOrigin, motion.div)
- **Styling:** CSS Modules (`.module.css` co-located with each component)
- **Target device:** Landscape tablet (768–1280 px wide), touch-only

## What We Were Trying to Achieve

The `BowlGame` screen (`src/screens/BowlGame/BowlGame.tsx`) shows a bowl centered on screen. Around the bowl, **12 draggable ingredient tiles** (4 correct + 8 wrong, mixed together) should be arranged in a **rough circle / organic ellipse perimeter** around the bowl center.

### Requirements

- All 12 ingredient tiles must be visible on screen at normal tablet zoom (no scrolling).
- All tiles share the same visual starting position formula — each is offset from the bowl center by a fixed pixel amount corresponding to a point on a circle at ~210 px radius (30° steps), with small per-tile deviations for an organic look.
- After dragging a tile to the bowl, `dragSnapToOrigin` should snap it back to its own original position.
- The arrangement must be **zoom-independent**: at any browser zoom level, all tiles stay clustered visibly around the bowl.

## Solution: Non-Draggable Anchor Wrapper Pattern

### Core Insight

**Framer-motion owns the `transform` property.** Any CSS positioning property set on a `motion.div` that relies on `transform` will conflict or be overridden by framer-motion's drag tracking. The solution is to **separate the ring placement concern from the draggable element**.

### Implementation

Each ingredient is now rendered as a two-level structure:

```tsx
{/* Non-draggable wrapper — handles ring placement only */}
<div className={styles.ingredientAnchor} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
  {/* Draggable element inside — has origin 0,0 for dragSnapToOrigin */}
  <motion.div
    className={styles.ingredientTile}
    drag={!isComplete}
    dragElastic={0.1}
    dragMomentum={false}
    dragSnapToOrigin
    onDragEnd={handleDragEnd(ingredient.id)}
    whileDrag={{ scale: 1.15, zIndex: 100 }}
  >
    <span className={styles.ingredientIcon}>{ingredient.icon}</span>
    <span className={styles.ingredientName}>{ingredient.name}</span>
  </motion.div>
</div>
```

#### Why This Works

| Problem | Solution |
|---------|----------|
| Framer-motion overrides `transform` on draggable elements | The anchor wrapper is a plain `<div>` — framer-motion never touches it |
| `dragSnapToOrigin` returns to wrong position | The child's local origin is exactly `x=0, y=0` — the anchor center. Motion snaps back to that position, which IS the ring slot |
| `top`/`left`/`calc()` weirdness with `50%` | Not needed; the anchor is already at the final position via `transform` |
| Margin/layout interaction quirks | Not used for positioning |

#### CSS Structure

```css
/* Zero-size positioning wrapper — regular div */
.ingredientAnchor {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  /* transform set inline per-tile */
}

/* Draggable tile — local to its anchor */
.ingredientTile {
  position: absolute;
  left: -36px;  /* Center 72px tile on anchor origin */
  top: -36px;
  width: 72px;
  height: 72px;
  pointer-events: auto;
  touch-action: none;
  /* ... card styling ... */
}
```

### Ring Placement Formula

Offsets are computed dynamically using an ellipse formula with zoom-awareness:

```typescript
function getIngredientOffset(index: number, fieldSize: { width: number; height: number }) {
  const angle = ((index * 30 - 90) * Math.PI) / 180;  // 30° steps
  const radius = getSafeRadius(fieldSize);             // Clamped to viewport
  const ellipseX = radius * 1.12;                      // Wider than tall
  const ellipseY = radius * 0.82;
  const organic = organicOffsets[index % 12];          // Per-tile randomness
  return {
    x: Math.cos(angle) * ellipseX + organic.x,
    y: Math.sin(angle) * ellipseY + organic.y,
  };
}
```

The `getSafeRadius()` function ensures all tiles remain visible at any browser zoom level by measuring the actual play field and clamping the ring radius appropriately.

### Result

- ✅ All 12 tiles render at visually correct ring positions
- ✅ `dragSnapToOrigin` reliably snaps each tile back to its own ring slot (not to `0,0` of the play field)
- ✅ Tiles remain visible at all browser zoom levels
- ✅ No framer-motion/CSS property conflicts
