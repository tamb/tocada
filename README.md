# Tocada JS

Pointer and touch gestures with ease

## Installation

```bash
npm install tocada
```

## Basic Usage

```javascript
import { usePointerEvents } from "tocada";

// Pass a query selector or HTMLElement (Pointer Events by default: mouse, pen, touch)
const swipeArea = usePointerEvents("#my-element");

// Listen for events
swipeArea.element.addEventListener("swipe", (e) => {
  console.log("Swiped!", e.detail);
});

// Clean up when done
swipeArea.destroy();
```

For **TouchEvent-only** input (legacy mobile pipelines), use `useTouchEvents` instead—it forces `pointerEvents: false`.

## Available Events

### Single Touch Events

| Event | Description |
|-------|-------------|
| `tap` | Quick touch < 200ms |
| `doubletap` | Two taps within 300ms |
| `press` | Touch held 200-500ms |
| `hold` | Touch held > 500ms |
| `swipe` | Fires before directional swipe events (same gesture also emits `swipeup` / `swipedown` / etc.) |
| `swipeup` | Swipe in upward direction |
| `swipedown` | Swipe in downward direction |
| `swipeleft` | Swipe in left direction |
| `swiperight` | Swipe in right direction |
| `swipeclockwise` | Circular swipe in clockwise direction |
| `swipecounterclockwise` | Circular swipe in counter-clockwise direction |

### Multi-Touch Events

| Event | Description |
|-------|-------------|
| `gesture` | Fires before any multi-touch gesture |
| `pinch` | Two fingers moving closer together |
| `spread` | Two fingers moving apart |
| `rotate` | Two-finger rotation (fires before directional) |
| `rotateclockwise` | Clockwise two-finger rotation |
| `rotatecounterclockwise` | Counter-clockwise two-finger rotation |
<!-- | `swipepalm` | Palm swipe detected (fires before directional) |
| `swipepalmup` | Palm swipe upward |
| `swipepalmdown` | Palm swipe downward |
| `swipepalmleft` | Palm swipe left |
| `swipepalmright` | Palm swipe right | -->

## Configuration Options

```javascript
import { usePointerEvents } from "tocada";

const swipeArea = usePointerEvents("#my-element", {
  // Prefix all event names (e.g., "myapp-swipe", "myapp-tap")
  eventPrefix: "myapp-",

  // Enable high-precision element tracking (fills gaps between move events)
  // Adds computational overhead - use when you need complete element coverage
  useHighPrecision: true,

  // Customize detection thresholds
  thresholds: {
    swipeThreshold: 50,        // Min distance for swipe (px)
    tapMaxTime: 200,           // Max duration for tap (ms)
    doubleTapGap: 300,         // Max gap between taps for doubletap (ms)
    pressMinTime: 200,         // Min duration for press (ms)
    holdMinTime: 500,          // Min duration for hold (ms)
    circularSwipeMinArc: 90,   // Min arc for circular swipe (degrees)
    // NOT YET IMPLEMENTED palmMinTouches: 3,         // Min touch points for palm swipe
    // NOT YET IMPLEMENTED palmLineTolerance: 50,     // Tolerance for palm line detection (px)
    rotateMinAngle: 15,        // Min angle for rotation (degrees)
  }
});

// With prefix, listen like this:
swipeArea.element.addEventListener("myapp-swipe", (e) => {
  console.log("Swiped!", e.detail);
});
```

## Event Details

Each event type provides a `detail` object with relevant data.

### Swipe Events (`swipe`, `swipeup`, `swipedown`, `swipeleft`, `swiperight`)

```javascript
{
  velocity,          // Overall speed (px/ms)
  velocityX,         // X-axis speed
  velocityY,         // Y-axis speed
  distance,          // Total distance traveled
  distanceX,         // X-axis distance
  distanceY,         // Y-axis distance
  avgPressure,       // Average touch pressure
  startPressure,     // Starting pressure
  endPressure,       // Ending pressure
  startTime,         // Start timestamp
  endTime,           // End timestamp
  startingElement,   // First element touched
  endingElement,     // Last element touched
  touchedElements,   // All elements touched during swipe
  startingCoords,    // { x, y } start position
  endingCoords,      // { x, y } end position
  // High precision fields (only when useHighPrecision: true)
  touchedPathElements?,        // Elements found by sampling touchPath coordinates
  interpolatedTouchedElements?, // Elements found via interpolation between touchmove events
  derivedTouchedElements?,     // Combined and chronologically ordered array (recommended)
}
```

### Tap Events (`tap`, `doubletap`, `press`, `hold`)

```javascript
{
  duration,          // How long the touch lasted (ms)
  pressure,          // Touch pressure
  element,           // Element that was tapped
  coords,            // { x, y } tap position
  startTime,         // Start timestamp
  endTime,           // End timestamp
}
```

### Circular Swipe Events (`swipeclockwise`, `swipecounterclockwise`)

```javascript
{
  direction,         // "clockwise" or "counterclockwise"
  arc,               // Total arc traversed (degrees)
  touchPath,         // Array of { x, y, time } points
  touchedElements,   // All elements touched during circular swipe
  // High precision fields (only when useHighPrecision: true)
  touchedPathElements?,        // Elements found by sampling touchPath coordinates
  interpolatedTouchedElements?, // Elements found via interpolation between touchmove events
  derivedTouchedElements?,     // Combined and chronologically ordered array (recommended)
}
```

### Rotate Events (`rotate`, `rotateclockwise`, `rotatecounterclockwise`)

```javascript
{
  angle,             // Total rotation (degrees)
  direction,         // "clockwise" or "counterclockwise"
  startAngle,        // Starting angle
  endAngle,          // Ending angle
  centerPoint,       // { x, y } center of rotation
}
```

### Pinch/Spread Events (`pinch`, `spread`)

```javascript
{
  gesture,           // "pinch" or "spread"
  startDistance,     // Initial distance between fingers
  endDistance,       // Final distance between fingers
  distanceChange,    // Change in distance
  scale,             // endDistance / startDistance
  centerPoint,       // { x, y } center point
}
```

<!-- ### Palm Swipe Events (`swipepalm`, `swipepalmup`, etc.)

```javascript
{
  direction,         // "up", "down", "left", or "right"
  touchCount,        // Number of touch points
  distance,          // Distance traveled
  velocity,          // Speed of swipe
  startPositions,    // Array of { x, y } start positions
  endPositions,      // Array of { x, y } end positions
  // High precision fields (only when useHighPrecision: true)
  // Note: Not available for palm swipes (multi-touch gestures)
  touchedPathElements?,        // Elements found by sampling touchPath coordinates
  interpolatedTouchedElements?, // Elements found via interpolation between touchmove events
  derivedTouchedElements?,     // Combined and chronologically ordered array (recommended)
}
``` -->

### Gesture Event (`gesture`)

```javascript
{
  touchCount,        // Number of simultaneous touches
}
```

## High Precision Touch Tracking

When `useHighPrecision: true` is enabled, Tocada provides additional element tracking arrays to fill gaps between discrete `touchmove` events during rapid swipes. This is useful for:

- **Visual feedback**: Highlighting all elements in a swipe path
- **Game interactions**: Detecting all tiles/elements touched during a gesture
- **Complete coverage**: Ensuring no elements are missed during fast swipes

### Usage

```javascript
const swipeArea = usePointerEvents("#my-element", {
  useHighPrecision: true
});

swipeArea.element.addEventListener("swipe", (e) => {
  // Use derivedTouchedElements for complete, ordered coverage
  const allElements = e.detail.derivedTouchedElements || e.detail.touchedElements;
  allElements.forEach(el => el.classList.add("highlighted"));
});
```

### Available Arrays

When `useHighPrecision: true`, three additional arrays are provided:

- **`touchedPathElements`**: Elements found by sampling coordinates from the `touchPath` array. This fills gaps by checking elements at points along the recorded touch path.

- **`interpolatedTouchedElements`**: Elements found via interpolation between consecutive `touchmove` events. Samples points every 5-10px along the interpolation path to catch elements that might have been missed.

- **`derivedTouchedElements`**: **Recommended to use**. A combined array that merges `touchedElements`, `interpolatedTouchedElements`, and `touchedPathElements`, then orders them chronologically by their position in the touch path and deduplicates them.

### Performance Considerations

High precision tracking adds computational overhead as it:
- Samples multiple points along the touch path
- Calls `document.elementFromPoint()` for each sampled point
- Performs interpolation calculations during touch moves

Only enable this feature when you need complete element coverage. For most use cases, the standard `touchedElements` array is sufficient.

### Native Browser Alternatives

For custom tracking needs or edge cases, you can use native browser APIs:

- **`document.elementFromPoint(x, y)`**: Get the topmost element at specific coordinates
- **`document.elementsFromPoint(x, y)`**: Get all elements at coordinates (in stack order)
- **`TouchEvent.touches`**: Access raw touch data during move events
- **`TouchEvent.changedTouches`**: Touches that changed in the current event

These native APIs can be useful for:
- Custom interpolation logic
- Handling edge cases not covered by Tocada
- Building specialized touch tracking features
- Debugging touch event behavior

## TypeScript Support

Tocada is written in TypeScript and exports all types:

```typescript
import {
  usePointerEvents,
  useTouchEvents,
  ITocadaOptions,
  ISwipeEventDetails,
  ITapEventDetails,
  IRotateEventDetails,
  IPinchSpreadEventDetails,
  // IPalmSwipeEventDetails, NOT YET IMPLEMENTED
  ICircularSwipeEventDetails,
  DEFAULT_THRESHOLDS,
} from "tocada";
```

## Help Me Out

I write a lot of open source software (some more useful than others). You can help me out by tossing me a few bucks to buy coffee.

<a href="https://www.buymeacoffee.com/tamb" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
