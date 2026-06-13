# Mary's Meals Slovakia PWA – Agent Instructions

Interactive educational **tablet kiosk PWA** for Mary's Meals Slovakia charity. Two worlds: **Kids** (interactive games) and **Adults** (information + donation). Built with React 19 + TypeScript + Vite. Slovak UI language.

**Primary target device:** landscape-oriented tablet (≥ 768 px wide). All interactive elements must be finger-friendly — minimum touch target 48 px, comfortable target 56 px. No hover-only interactions; every action must work by tap/touch.

---

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Tests (watch) | `npm test` |
| Tests (CI/one-shot) | `npm run test:run` |
| Lint | `npm run lint` |

## Architecture

```
src/
  App.tsx              # Route tree + ConfigProvider
  config/              # Feature-flag config (types, useConfig hook)
  screens/             # One folder per screen, each with barrel index.ts
  components/shared/   # Reusable components (Button, Header, FeedbackOverlay)
  hooks/               # Shared hooks (useAudio, useGameNavigation, useIdleTimer)
  styles/global.css    # Brand colours, Poppins font, CSS variables, base styles
  index.css            # Minimal #root reset (do NOT add flex/flex-direction here)
  main.tsx             # React root mount
public/
  config.json          # Runtime feature flags & timers (no rebuild needed)
  manifest.webmanifest # PWA install metadata
  audio/sfx/           # success.mp3, error.mp3, complete.mp3
  images/              # logo-square.jpg, logo-hearth.jpg, qr/donation.png
  icons/               # icon-192.png, icon-512.png
vite.config.ts         # Vite + PWA plugin (vite-plugin-pwa / Workbox)
vitest.config.ts       # Vitest config (separate from vite.config.ts to avoid type conflicts)
netlify.toml           # Netlify deployment: SPA redirects + cache + security headers
```

Full user-facing feature descriptions: [docs/app-guide.md](docs/app-guide.md)

## Routing

| Path | Screen |
|------|--------|
| `/` | ModeSelect (entry, idle timer here) |
| `/kids` | GameMenu |
| `/kids/bowl` | BowlGame |
| `/kids/kitchen` | VolunteerKitchen |
| `/adults` | AdultsMenu |
| `/adults/eleven-cents` | ElevenCents |
| `/adults/calculator` | DonationCalculator |
| `/adults/get-involved` | GetInvolved |

Placeholder routes exist for `worldMap`, `schoolBell`, `schoolFeeding`, `stories`.

## Feature Flags

All screens/features are gated via `public/config.json` — edit this file to enable/disable without code changes. Config shape is defined in `src/config/types.ts`. Access config in components via `useConfig()` from `src/config`.

Key settings:
- `settings.idleTimeoutMs` — auto-return to `/` after inactivity (default 3 min)
- `settings.adultLockHoldMs` — hold duration for adult lock (default 2 s)
- `features.audio.sfx` — enables/disables sound effects

## Conventions

- **CSS Modules** for all component styles (`*.module.css` co-located with component)
- **Barrel exports**: every screen/component folder has `index.ts`
- **Shared components** live in `src/components/shared/`; import via `src/components/shared/index.ts`
- **Touch targets**: minimum 48 px height on all interactive elements (tablet use)
- **Brand colours**: `#009ddc` (blue), `#f4a912` (orange) — defined as CSS variables in `src/styles/global.css`
- **Font**: Poppins (loaded globally)
- **Animation**: use `framer-motion` for transitions and feedback overlays
- **Full-screen layout**: All screen containers must have `width: 100%; height: 100vh` and their main content areas must explicitly set `width: 100%` to avoid width collapse when children are `position: absolute`. The `#root` div in `index.css` must remain simple (`width: 100%; min-height: 100vh`) to not constrain child components.

## Testing

- Framework: **Vitest** + **@testing-library/react** + **happy-dom**
- Config: `vitest.config.ts` (separate file — do NOT merge into `vite.config.ts`; mixing `vitest/config` and `vite` `defineConfig` causes plugin type conflicts)
- Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`)
- Test files: `*.test.tsx` / `*.test.ts` co-located with source files
- Tests that need routing must wrap with `<BrowserRouter>` (or `MemoryRouter`)
- Tests that need config must wrap with `<ConfigProvider>`
- When mocking framer-motion, stub `motion.div`, `motion.button`, etc. as plain HTML elements and `AnimatePresence` as a passthrough fragment — framer-motion props like `whileHover` / `whileTap` are not valid HTML attributes and cause React warnings in tests

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useConfig()` | Access feature flags and settings |
| `useIdleTimer(options?)` | Redirects to `/` after inactivity; reads `idleTimeoutMs` from config; accepts `{ timeoutMs?, redirectPath?, disabled? }` |
| `useGameNavigation()` | Returns `{ prevGame, nextGame }` for ‹ / › arrows in game header |
| `useAudio()` | Play `success`, `error`, `complete` SFX from `public/audio/sfx/` |

## Header Component

`<Header>` props:

| Prop | Default | Purpose |
|------|---------|--------|
| `title` | — | Text shown in centre |
| `showBack` | `true` | Back (‹) button |
| `showHome` | `true` | Home (🏠) button |
| `showGameNav` | `false` | Enables ‹‹ / ›› prev/next game arrows (BowlGame, VolunteerKitchen) |
| `variant` | `'kids'` | `'kids'` = blue bar; `'adults'` = white bar |

The header hides itself on `/` (ModeSelect has its own full-screen layout). Game nav arrows read enabled games from `useGameNavigation()` → `src/screens/GameMenu/gamesData.ts`.

## Adding a New Screen

1. Create `src/screens/MyScreen/MyScreen.tsx` + `MyScreen.module.css` + `index.ts`
2. Export from `src/screens/index.ts`
3. Add route in `src/App.tsx`
4. Add feature flag to `src/config/types.ts` and `public/config.json`

## Adding a New Game

1. Add game entry to `src/screens/GameMenu/gamesData.ts` (includes `configKey` used by `useGameNavigation`)
2. Add `configKey` to `GamesConfig` in `src/config/types.ts` and `defaultConfig`
3. Set flag in `public/config.json`
4. Create screen folder + register route in `src/App.tsx` (see Adding a New Screen above)
5. Call `useIdleTimer()` inside the game screen to keep auto-return active

## Known Layout Gotchas

**Narrow rectangle UI when using `position: absolute` children:**
When all content children of a flex container are `position: absolute` (e.g., scattered ingredients in `.playField`), the container can collapse to zero intrinsic width. The container won't stretch to full viewport width automatically.

**Fix:** Always explicitly set `width: 100%` on the container AND on intermediate content areas. Example from BowlGame:
```css
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.playField {
  flex: 1;
  position: relative;
  width: 100%;  /* explicit width for absolutely positioned children */
}
```

Also ensure `#root` in `src/index.css` is kept simple: `width: 100%; min-height: 100vh;` — do not add `display: flex; flex-direction: column` or constrain width, as it breaks full-screen layouts.

## PWA / Deployment

- Service worker via `vite-plugin-pwa` (Workbox); configured in `vite.config.ts`
- Manifest: `public/manifest.webmanifest`
- Deployed on Netlify; config in `netlify.toml`
- App is designed to work **fully offline** after first load

---

## Tablet UI Rules

This app runs as a kiosk on a **landscape tablet** (typically 768–1280 px wide). These rules are non-negotiable:

- **No scrolling on game screens.** Layout must fit entirely in the viewport (`height: 100vh`, `overflow: hidden`). Use flex columns to distribute space.
- **No hover-only states.** Every interactive action must be reachable by a single tap. Hover effects are decorative only.
- **Touch target size.** All tappable elements (buttons, cards, ingredients, volunteers) must be at least `48 px` tall/wide. Prefer `56 px` (CSS variable `--touch-comfortable`) for primary actions.
- **Drag interactions** (e.g., BowlGame) use `framer-motion` `drag` with `touch-action: none` on the draggable element. Never rely on `onMouseMove`; use Pointer Events via framer-motion.
- **Font size.** Use `var(--font-size-lg)` (1.25 rem) or larger for body text visible across a table from standing distance. `var(--font-size-sm)` (0.875 rem) is for labels only.
- **Buttons on ModeSelect** have `min-width: 250px` and `size="xl"` to be easily tappable with a full finger.
- **Idle timer** (`useIdleTimer`) is active on every screen except `/`. If 3 minutes pass without touch, the app returns to ModeSelect automatically.
- **Adult lock** on ModeSelect requires a 2-second press-and-hold (`onPointerDown` / `onPointerUp`) — protects the adult section from accidental child access.
- **Landscape orientation** is declared in `public/manifest.webmanifest` (`"orientation": "landscape"`).
