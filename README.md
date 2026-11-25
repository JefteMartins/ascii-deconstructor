# ascii-deconstructor

A **zero-dependency, 60 FPS HTML5 Canvas 2D** visual deconstruction engine written in TypeScript. It samples live video, static images, or a built-in procedural fallback and progressively transforms them across **5 continuous stages** (`RAW` → `DRIFT` → `PARTICLE` → `HYBRID` → `BINARY`).

## Features

- **5 progressive render stages** controlled by a single normalized value (`0.0` to `1.0`):
  1. `RAW` (`0.00 – 0.18`) — Clean source media with subtle pointer parallax.
  2. `DRIFT` (`0.18 – 0.40`) — High-resolution ASCII rasterization with motion-delta particle trails (zero-GC typed array pool).
  3. `PARTICLE` (`0.40 – 0.62`) — Luminance-driven spatial particle field with smooth interpolation.
  4. `HYBRID` (`0.62 – 0.82`) — Mixed ASCII/binary glyph ramp blending structure and data.
  5. `BINARY` (`0.82 – 1.00`) — Dynamic luminance-percentile `0`/`1` thresholding that keeps silhouettes recognizable on any uploaded image.
- **High-performance 60 FPS pipeline**:
  - Offscreen downsampling proportional to the active stage cell size.
  - Reusable `Uint32Array` framebuffer + sparse pre-rendered glyph stamp cache (no per-frame `fillText` calls or GC pressure).
  - Dual `<video>` A/B ping-pong crossfade (`0.5s`) for seamless looping without frame jumps.
- **Runtime media swapping**: drop in any local image or video `File` with `loadCustomFile(file)` and revert via `resetToDefaultMedia()`.
- **Accessibility-aware**: automatically respects `prefers-reduced-motion: reduce` and pauses rendering when the tab is hidden (`visibilitychange`).
- **Zero runtime dependencies** & full TypeScript definitions (`.d.ts`).

## Installation

Install directly from GitHub:

```bash
npm install github:JefteMartins/ascii-deconstructor
```

## Quick Start

```ts
import { AsciiDeconstructor } from 'ascii-deconstructor';

const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;

const engine = new AsciiDeconstructor(
  canvas,
  {
    imageSrc: '/assets/background.jpg', // optional — falls back to procedural canvas
    videoSrc: '/assets/background.mp4', // optional — seamless A/B loop crossfade
    desktopFocalX: 0.5,
    mobileFocalX: 0.5,
    focalY: 0.5
  },
  (telemetry) => {
    console.log(telemetry.stageName, telemetry.progress.toFixed(2));
  }
);

engine.start();

// Drive the 5 stages from scroll, a slider, or any normalized [0, 1] value:
window.addEventListener(
  'scroll',
  () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    engine.setProgress(progress);
  },
  { passive: true }
);
```

### Zero-config usage (procedural fallback)

You don't even need media assets to test it — omit the config object and the engine renders a built-in animated procedural source:

```ts
const engine = new AsciiDeconstructor(canvas);
engine.start();
engine.setProgress(0.35); // DRIFT stage
```

## API Reference

### `new AsciiDeconstructor(canvas, config?, onTelemetry?)`

| Parameter | Type | Description |
| --- | --- | --- |
| `canvas` | `HTMLCanvasElement` | Target full-bleed or sized `<canvas>` element. |
| `config` | `AsciiDeconstructorConfig` *(optional)* | Media sources, focal point, and optional font family. |
| `onTelemetry` | `(state: EngineTelemetry) => void` *(optional)* | Callback invoked with current stage, progress, cell size, and active media label. |

### `AsciiDeconstructorConfig`

```ts
export interface AsciiDeconstructorConfig {
  imageSrc?: string;
  videoSrc?: string;
  desktopFocalX?: number; // default: 0.5
  mobileFocalX?: number;  // default: 0.5
  focalY?: number;        // default: 0.5
  fontFamily?: string;    // default: '"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace'
}
```

### Methods

- `start(): void` — Attaches resize/pointer/visibility listeners, loads media, and starts the `requestAnimationFrame` loop.
- `destroy(): void` — Stops the animation loop, removes all listeners, revokes object URLs, and releases video elements.
- `setProgress(progress: number): void` — Sets target progress in `[0, 1]` (alias: `setScrollProgress(progress)`).
- `loadCustomFile(file: File): void` — Replaces the active source with a user-selected image or video file.
- `resetToDefaultMedia(): void` — Reverts to the initial configured media (or procedural fallback).

## Running the Interactive Demo Locally

```bash
git clone https://github.com/JefteMartins/ascii-deconstructor.git
cd ascii-deconstructor
npm install
npm run dev
```

You can drag & drop any local image or video directly onto the demo window to test all 5 stages live.

## License

[MIT](./LICENSE) © 2026 Jefté Martins
