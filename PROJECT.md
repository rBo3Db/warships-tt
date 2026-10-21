# World of Warships: Architecture and Project Overview

An interactive single-page application for exploring warship encyclopedia data and tech research trees in World of Warships.

> Developed with AI assistance, under meticulous human guidance and technical direction.

The project is built around client-side performance, instant user feedback, zero redundant renders, and resilient data caching.

---

## Architecture Principles

```
+------------------------------------------------------------------------+
|                             User Interface                             |
+------------------------------------+-----------------------------------+
|  Zero-Lag Rendering                |  Multi-Tier Storage               |
|  - Automatic compiler memoization  |  - Frame-0 synchronous boot (0ms) |
|  - Render-phase state adjustment   |  - Stale-While-Revalidate (SWR)   |
|  - Localized filter hooks          |  - In-flight Promise deduplication|
+------------------------------------+-----------------------------------+
|  DOM and Layout Performance        |  Zero-Request i18n                |
|  - Chunked IntersectionObserver    |  - 19 global locales              |
|  - SVG graph with ResizeObserver   |  - Instant client-side switching  |
|  - Lightweight CSS Modules (~23kB) |  - Fallback dictionary strategy   |
+------------------------------------+-----------------------------------+
```

---

## 1. Zero Unnecessary Re-renders

### 1.1. React 19 and React Compiler
- Uses `babel-plugin-react-compiler` via `@rolldown/plugin-babel` to automatically memoize components, hooks, and JSX trees during build time.
- Minimizes boilerplate and manual dependency tuning.

### 1.2. Render-Phase State Adjustment
- Avoids cascading `useEffect` updates for list resets.
- When search queries, tier filters, or nation selections change, `useInfiniteScroll` resets the pagination offset during the render pass before DOM mutation.

### 1.3. State Encapsulation and Prop Drilling Elimination
- All catalog filter parameters (`type`, `tier`, `status`, `sort`) and pagination mechanics are encapsulated in `useCatalogFilter`.
- The root `Encyclopedia` container maintains only high-level route state (`selectedNation`, `viewMode`, `searchQuery`), preventing parent re-renders when toggling ship filters.

### 1.4. Binary Event Thresholds
- Scroll listeners (such as `ScrollToTop`) register with `{ passive: true }` and update state strictly when passing the 400px threshold.
- Eliminates per-pixel re-renders, maintaining 60/120 FPS during rapid scrolling.

### 1.5. Derived State
- Localized error text and counts are computed during the render pass from existing state and translation tables, preventing state synchronization desynchronization.

---

## 2. Multi-Tier Caching and Offline-First

### 2.1. Frame-0 Startup (0 ms Initial Paint)
- `useVehicles` and `useAppBootstrap` read normalized records synchronously from storage on initial mount (`getCachedVehiclesSync`).
- Catalog items and tech tree structures render on the very first frame without empty layout flashes or loading spinners.

### 2.2. Stale-While-Revalidate (SWR)
- Stored data is presented immediately.
- A background worker queries the Wargaming API. If remote data contains balance updates or newly added ships, the cache updates silently and triggers a smooth UI sync.

### 2.3. In-flight Promise Deduplication
- Shared promises (`activeVehiclesPromise`, `activeNationsPromise`) deduplicate concurrent requests.
- Parallel component mounts cannot produce duplicate network traffic.

### 2.4. Graceful Degradation
- If network requests fail or the remote endpoint is unreachable, the application remains fully interactive using cached assets.
- A non-intrusive `ErrorBanner` informs the user of offline status with a manual retry option.

---

## 3. DOM and Layout Optimization

### 3.1. Chunked Infinite Scroll
- Catalog items render in batches of 36 via `IntersectionObserver`.
- Keeps DOM node counts bounded, ensuring fluid interaction on mobile devices.

### 3.2. Accessible Tech Tree with Dynamic SVG Connections
- Tech tree nodes are linked by dynamic vector connectors computed via container measurements.
- Layout calculations update through a container `ResizeObserver`, avoiding window-level resize polling.
- The scroll container is keyboard-accessible (`tabIndex={0}`, `role="region"`), touch-enabled, and styled with an accessible gray scrollbar.

### 3.3. Zero UI-Library Overhead
- Implemented with scoped CSS Modules and semantic design tokens (`--color-*`, `--border-*`).
- Eliminates third-party UI framework bloat (~23 kB CSS and ~98 kB gzipped JS).

---

## 4. Internationalization (i18n)

- Supports 19 locales: English, Russian, German, French, Japanese, Chinese, Spanish, and others.
- Instant client-side language switching without subsequent network requests.
- Automatic browser language detection with reliable fallback dictionaries (`FALLBACK_LANGUAGES`).

---

## 5. Testing and Code Quality

- **100% test pass rate**: 21 test suites, 113 tests passing under `Vitest` and `React Testing Library`.
- Strict TypeScript typings across all API payloads, normalized entities, and component props.
- High-speed static analysis with `Oxlint`.
