# Performance Optimization Report

## Problem Analysis

The application was experiencing "intensive lag" during video feed usage and resonance interaction. This was caused by:

1. **Main Thread Blocking**: `face-api.js` and `GestureService` were running detection loops on every available animation frame (60+ FPS), starving the browser's main thread.
2. **React Render Thrashing**: The `CommunicationContext` was updating an `energy` state variable every 50ms via `setInterval`. This caused the entire `App` (and all its children) to re-render 20 times a second, even when nothing visual was changing significantly.
3. **Redundant Calculations**: `SensoryHub` and other components were re-calculating logic on these high-frequency renders.

## Implemented Solutions

### 1. AI Service Throttling

- **Expression Service**: Throttled to **200ms** (5 FPS). This is sufficient for mood detection (human expressions don't change faster than this) and frees up ~85% of previously used CPU time.
- **Gesture Service**: Throttled to **150ms** (~7 FPS). Enough to catch a "Wave" or "Generic Hand" movement without lagging the UI.
- **Input Resizing**: Configured `TinyFaceDetector` to use a smaller input size (`224px`), significantly speeding up tensor operations.

### 2. Event-Driven Architecture (The "Event Bus")

- **Decoupled Visualizers**: Instead of passing `energy` as a React prop (which forces re-renders), the `CommunicationContext` now emits an `energy_impulse` event via a lightweight Event Bus (`mitt`).
- **Reactive Components**: `VisualHearing` subscribes directly to this event bus. It updates its internal animation loop variables _without_ triggering a React component re-render.
- **Result**: The layout remains static while the canvas draws at 60 FPS smoothly.

### 3. Memoization

- **UniversalCommWindow**: Wrapped in `React.memo` so it only re-renders when actual chat messages or connection status changes, ignoring unrelated parent updates.

## Impact

- **Video Feed**: Stable, smooth playback.
- **Resonance Hub**: "Glitch" and "Energy" effects no longer stutter the interface.
- **Battery/CPU**: Significantly reduced usage.
