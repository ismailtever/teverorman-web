# Mentra — Engineering Standards

## Project
React Native + Expo SDK 54 + TypeScript. expo-router v6, Reanimated v3, Supabase.
Workspace: `C:\Users\Hp Victus\OneDrive - Istanbul Bilgi Universitesi\Belgeler\Claude\Projects\Mentra Uygulama`
GitHub sync: run `push_to_github.ps1` after changes.

---

## Engineering Workflow (4-Agent Mental Model)

Before touching any file, think in 4 roles:

| Role | Question |
|------|----------|
| **Architect** | What is this component's single responsibility? Does it belong here? |
| **Engineer** | makeStyles(C)? refs for mutable counters? stale closures eliminated? |
| **Reviewer** | Dark mode works? StatusBar set? edge cases handled? cleanup on unmount? |
| **Optimizer** | Unnecessary re-renders? heavy work inside render? memoization needed? |

---

## Non-Negotiable Rules

### 1. Theme — ALWAYS use `useMentraTheme()`
```tsx
const C = useMentraTheme();
const styles = makeStyles(C);  // call inside component, not at module level
```
- NEVER use `Colors.mentra.*` directly in JSX or StyleSheet
- NEVER hardcode `#194031`, `#FFF`, `#000` for semantic colors — use `C.*`
- Brand accent colors in STATIC arrays outside component are OK as hex

### 2. Dynamic Styles Factory Pattern
```tsx
function makeStyles(C: ReturnType<typeof useMentraTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    // ...
  });
}
// Inside component:
const C = useMentraTheme();
const styles = makeStyles(C);
```

### 3. Stale Closure Rule — Timers/Intervals MUST use refs
```tsx
// ✅ Correct
const scoreRef = useRef(0);
const [score, setScore] = useState(0);
const addPoint = () => { scoreRef.current += 10; setScore(scoreRef.current); };
finishSession(scoreRef.current); // safe inside setInterval/setTimeout

// ❌ Wrong
finishSession(score); // stale inside closure
```

### 4. StatusBar — every phase of every game screen
```tsx
<StatusBar style={C.statusBar} />
// Exception: focus phase on dark gradient bg → style="light"
```

### 5. Timer Cleanup
```tsx
useEffect(() => {
  const id = setInterval(...);
  return () => clearInterval(id); // ALWAYS
}, []);
```

### 6. Real Measurement (not nominal)
```tsx
// Reaction time
stimStartTime.current = Date.now(); // set when stimulus appears
const rt = Date.now() - stimStartTime.current; // measure in handler
```

---

## Token Map (`C.*`)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `C.bg` | `#F8FAF9` | `#0D1210` | Screen background |
| `C.surface` | `#FFFFFF` | `#121614` | Cards, inputs |
| `C.surface2` | `#F0F4F2` | `#1A1F1D` | Secondary surfaces |
| `C.text` | `#0F1A16` | `#E8F0EC` | Primary text |
| `C.textDim` | `#4A7A63` | `#5A9478` | Secondary text |
| `C.muted` | `#8FA89B` | `#3D5248` | Placeholder |
| `C.border` | `#D4E4DB` | `#1E2E28` | Borders |
| `C.brandPrimary` | `#194031` | `#4ADE80` | CTA, active |
| `C.brandSecondary` | `#A3C4B5` | `#2D6A4F` | Secondary CTA |
| `C.success` | `#10B981` | same | Success |
| `C.warning` | `#F59E0B` | same | Warning |
| `C.danger` | `#EF4444` | same | Error/danger |
| `C.statusBar` | `'dark'` | `'light'` | StatusBar style |
| `C.isDark` | `false` | `true` | Conditional logic |

---

## File Checklist Before Push

- [ ] `useMentraTheme()` + `makeStyles(C)` pattern applied
- [ ] No `Colors.mentra.*` in JSX/StyleSheet
- [ ] `StatusBar style={C.statusBar}` on every screen phase
- [ ] Mutable game counters tracked via `useRef` (not just `useState`)
- [ ] All `setInterval`/`setTimeout` cleaned up in `useEffect` return
- [ ] `push_to_github.ps1` includes new/modified file

---

## Architecture

```
app/
  (tabs)/         → Main tabs (index, training, coach, journal, profile)
  game/           → Game screens (grid-focus, deep-focus, impulse-control, dopamine-reset, memory-grid, speed-match)
  paywall/        → Feature gate, onboarding paywall
  onboarding.tsx  → First-run onboarding

components/
  ui/             → Shared UI (Buttons, etc.)
  game/           → Game-specific (SessionResultsOverlay)
  paywall/        → Paywall components

features/
  training/       → Game domain logic (useGridFocusDomain, etc.)

services/         → Storage, Streak, I18n, Purchases, Notifications, Logger
hooks/            → useMentraTheme, useColorScheme
constants/        → Colors, Theme
locales/          → en.json, tr.json
```

---

## Performance Rules

- `React.memo()` on list items and sub-components that receive primitive props
- `useCallback` on handlers passed as props
- `useFocusEffect` instead of `useEffect` for data that refreshes on tab focus
- `Animated.View` with `useSharedValue` instead of JS-driven animations
- No inline function creation inside `StyleSheet` or render return

---

## Commit Message Format
```
feat(scope): short description

- Detail 1
- Detail 2
```
Scopes: `game`, `ui`, `tabs`, `paywall`, `services`, `theme`
