# Performance Analysis: About Us Route Navigation

## Investigation Summary

### Identified Bottlenecks

#### 1. **Multiple ResizeObserver State Updates (Critical)**

- **Issue**: 6 GaugeChart components each create ResizeObserver on mount
- **Impact**: 6 simultaneous `setState` calls → 6 React re-renders during initial load
- **Measurement**: Each ResizeObserver triggers immediately on mount
- **Root Cause**: ResizeObserver fires synchronously, blocking main thread

#### 2. **Competing Animations (High Impact)**

- **Issue**: Multiple animation systems running simultaneously:
  - Header Framer Motion animation (`initial → animate`)
  - TanStack Router route transition
  - ResizeObserver-triggered chart updates
  - Recharts internal animations
- **Impact**: Frame drops during navigation transition
- **Root Cause**: Animation overlap creates layout thrashing

#### 3. **Expensive Computations During Render (High Impact)**

- **Issue**: GaugeChart performs complex calculations every render:
  - `normalizeGaugeData()`
  - `generateGaugeTicks()`
  - SVG path calculations (`describeArc()`)
  - Zone color mapping
  - Tick filtering and positioning
- **Impact**: ~6 charts × expensive calculations = significant CPU time
- **Root Cause**: No memoization of computed values

#### 4. **Unnecessary Component Re-renders (Medium Impact)**

- **Issue**: No React.memo on any components
- **Impact**: All children re-render when parent re-renders
- **Components affected**: GaugeChart, MonitoringLineChart, WaterMeterAlertStats, DataTable

#### 5. **Inline Function Creation (Medium Impact)**

- **Issue**: `onUpdateDate={() => {}}` in about-us route
- **Impact**: DataTable columns recreated every render
- **Root Cause**: New function reference breaks memoization

#### 6. **TanStack Table Column Recreation (Medium Impact)**

- **Issue**: Columns depend on unstable `onUpdateDate` callback
- **Impact**: Table re-initializes on every parent render
- **Root Cause**: `useMemo` dependency includes unstable callback

#### 7. **React StrictMode Double Effects (Development Only)**

- **Issue**: Effects run twice in development
- **Impact**: 2× ResizeObserver setups, 2× data fetches
- **Root Cause**: Expected StrictMode behavior

## Optimization Strategy

### Phase 1: Critical Path Optimizations

1. Memoize GaugeChart expensive computations
2. Add React.memo to all expensive components
3. Debounce ResizeObserver callbacks
4. Stabilize callbacks with useCallback

### Phase 2: Animation Coordination

1. Delay non-critical animations
2. Use requestIdleCallback for deferred work
3. Sequence animations instead of running parallel

### Phase 3: Rendering Optimizations

1. Lazy load DataTable if off-screen
2. Virtualize chart list if needed
3. Split effects into smaller, focused effects

## Expected Improvements

- **Reduce initial renders**: 6+ renders → 2-3 renders
- **Eliminate animation jank**: 60fps during transition
- **Faster time-to-interactive**: ~200-300ms faster
- **Smaller JavaScript execution time**: 30-40% reduction
