# World of Warships: Encyclopedia and Tech Tree

High-performance single-page web application for exploring warship specifications and interactive tech trees across all nations in World of Warships.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Tests](https://img.shields.io/badge/Tests-113%20passed-success?style=flat-square&logo=vitest)
![Bundle Size](https://img.shields.io/badge/Bundle-~98kB%20gzip-brightgreen?style=flat-square)

---

## Architectural Focus

The application is engineered for minimal latency, zero redundant renders, resilient caching, and a lightweight runtime footprint.

### 1. Minimal Re-renders
- **React 19 & React Compiler**: Automatic component and expression memoization via `@rolldown/plugin-babel` and `babel-plugin-react-compiler`.
- **Render-phase State Adjustment**: Pagination limit resets inside `useInfiniteScroll` happen synchronously during render phase instead of cascading through `useEffect`, avoiding double renders and cumulative layout shifts.
- **State Encapsulation**: Catalog filter state (`type`, `tier`, `status`, `sort`) and infinite scroll logic are isolated inside `useCatalogFilter`. The root `Encyclopedia` component is decoupled from filter churn.
- **Binary Event Thresholds**: Scroll listeners (e.g. `ScrollToTop`) use passive event listeners and fire state updates only when crossing the visibility threshold (400px), preserving 60/120 FPS.
- **Derived Localizations**: Error banners and UI copy are computed during render from static dictionaries, avoiding unnecessary state sync cycles.

### 2. Multi-Tier Caching and Offline-First
- **Frame-0 Startup (0 ms)**: `useVehicles` and `useAppBootstrap` read normalized records synchronously from storage on initial mount. The catalog and tree render on the very first frame without blocking spinners.
- **Stale-While-Revalidate (SWR)**: Cached data displays immediately while a background sync verifies freshness against the remote Wargaming API.
- **Promise Deduplication**: Concurrent fetch requests share in-flight promises (`activeVehiclesPromise`, `activeNationsPromise`), eliminating redundant HTTP requests.
- **Graceful Degradation**: If the network or remote API is unavailable, the application remains fully functional with cached data and non-blocking warning banners.

### 3. DOM & Layout Optimization
- **Chunked Infinite Scroll**: Renders warships in batches of 36 via `IntersectionObserver`, keeping DOM node counts low and responsive.
- **Accessible Tech Tree with Custom Scroll**: The horizontal tree container supports keyboard navigation (`tabIndex={0}`, `role="region"`), touch panning, and a custom gray scrollbar. SVG connection lines dynamically recalculate via container `ResizeObserver`.
- **Zero UI-Library Overhead**: Built with pure CSS Modules and CSS variables. Total production styles weigh ~23 kB, and the JavaScript bundle is ~98 kB (gzipped).

### 4. Internationalization (i18n)
- 19 supported locales (EN, RU, DE, FR, JA, ZH, ES, etc.).
- Client-side instant language switching without additional HTTP requests.
- Dynamic locale extraction with static fallback configurations.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **React 19** | Core UI library with React Compiler support |
| **TypeScript 5.x** | Strict end-to-end type safety |
| **Vite 8** | Fast build tooling and HMR |
| **CSS Modules** | Scoped, zero-runtime styling |
| **Vitest & React Testing Library** | Unit and integration testing |
| **Oxlint** | High-performance Rust-based linter |

---

## Testing

Comprehensive test suite covering services, custom hooks, and UI components.

- **21 test suites**
- **113 tests passed (100%)**

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Scripts

```bash
# Start development server
npm run dev

# Run type check and production build
npm run build

# Run linter
npm run lint

# Preview production build locally
npm run preview
```

---

## Deployment

Configured for static hosting (GitHub Pages, Cloudflare Pages, Vercel) with relative asset paths (`base: './'`). Includes an automated deployment workflow at `.github/workflows/deploy.yml`.
