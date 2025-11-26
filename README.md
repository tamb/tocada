# Tocada JS

Touch Events with ease

## Installation

```bash
npm install tocada
```

## Basic Usage

```javascript
import { useTouchEvents } from "tocada";

// Pass a query selector or HTMLElement
const swipeArea = useTouchEvents("#my-element");

// Listen for events
swipeArea.element.addEventListener("swipe", (e) => {
  console.log("Swiped!", e.detail);
});

// Clean up when done
swipeArea.destroy();
```

## Available Events

### Single Touch Events

| Event | Description |
|-------|-------------|
| `tap` | Quick touch < 200ms |
| `doubletap` | Two taps within 300ms |
| `press` | Touch held 200-500ms |
| `hold` | Touch held > 500ms |
| `swipe` | Fires before directional swipe events |
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
| `swipepalm` | Palm swipe detected (fires before directional) |
| `swipepalmup` | Palm swipe upward |
| `swipepalmdown` | Palm swipe downward |
| `swipepalmleft` | Palm swipe left |
| `swipepalmright` | Palm swipe right |

## Configuration Options

```javascript
import { useTouchEvents } from "tocada";

const swipeArea = useTouchEvents("#my-element", {
  // Prefix all event names (e.g., "myapp-swipe", "myapp-tap")
  eventPrefix: "myapp-",
  
  // Customize detection thresholds
  thresholds: {
    swipeThreshold: 50,        // Min distance for swipe (px)
    tapMaxTime: 200,           // Max duration for tap (ms)
    doubleTapGap: 300,         // Max gap between taps for doubletap (ms)
    pressMinTime: 200,         // Min duration for press (ms)
    holdMinTime: 500,          // Min duration for hold (ms)
    circularSwipeMinArc: 90,   // Min arc for circular swipe (degrees)
    palmMinTouches: 3,         // Min touch points for palm swipe
    palmLineTolerance: 50,     // Tolerance for palm line detection (px)
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

### Palm Swipe Events (`swipepalm`, `swipepalmup`, etc.)

```javascript
{
  direction,         // "up", "down", "left", or "right"
  touchCount,        // Number of touch points
  distance,          // Distance traveled
  velocity,          // Speed of swipe
  startPositions,    // Array of { x, y } start positions
  endPositions,      // Array of { x, y } end positions
}
```

### Gesture Event (`gesture`)

```javascript
{
  touchCount,        // Number of simultaneous touches
}
```

## TypeScript Support

Tocada is written in TypeScript and exports all types:

```typescript
import { 
  useTouchEvents,
  ITocadaOptions,
  ISwipeEventDetails,
  ITapEventDetails,
  IRotateEventDetails,
  IPinchSpreadEventDetails,
  IPalmSwipeEventDetails,
  ICircularSwipeEventDetails,
  DEFAULT_THRESHOLDS,
} from "tocada";
```

## Help Me Out

I write a lot of open source software (some more useful than others). You can help me out by tossing me a few bucks to buy coffee.

<a href="https://www.buymeacoffee.com/tamb" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
