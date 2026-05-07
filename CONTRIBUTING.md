# Contributing to Tocada

Thank you for your interest in contributing to Tocada! This guide will help you understand our codebase structure and development standards.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/tamb/tocada.git
cd tocada

# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build the project
bun run build
```

## Project Structure

```
src/
├── index.ts                    # Main Tocada class (orchestration only)
├── index.test.ts               # Integration tests
├── types.ts                    # All TypeScript interfaces and types
├── utils.ts                    # Basic shared utilities
├── utils.test.ts
└── detectors/                  # Gesture detection modules
    ├── tap.ts                  # Tap/press/hold detection
    ├── tap.test.ts
    ├── swipe.ts                # Linear swipe detection
    ├── swipe.test.ts
    ├── circular-swipe.ts       # Circular swipe detection
    ├── circular-swipe.test.ts
    ├── pinch-spread.ts         # Pinch/spread detection
    ├── pinch-spread.test.ts
    ├── palm-swipe.ts           # Palm swipe detection
    ├── palm-swipe.test.ts
    ├── rotate.ts               # Two-finger rotation detection
    └── rotate.test.ts
```

## Architecture Principles

### 1. Modular Detectors

All gesture detection logic lives in the `src/detectors/` directory. Each detector module:

- Contains **pure functions** that are easy to test
- Has **no side effects** - they take input and return output
- Is **co-located with its tests** (e.g., `tap.ts` and `tap.test.ts`)

```typescript
// Good: Pure function in detector module
export function classifyTapGesture(
  duration: number,
  thresholds: Partial<IThresholds>
): TapGestureType {
  // Detection logic here
  return "tap" | "press" | "hold" | null;
}
```

### 2. Main Class is Orchestration Only

The main `Tocada` class in `index.ts` should only:

- Set up and tear down event listeners (Pointer Events by default, or Touch Events when `pointerEvents: false`)
- Maintain state between input events (pointer or touch pipeline)
- Call detector functions to classify gestures
- Dispatch custom events

Detection logic should be extracted into detector modules.

### 3. Types First

All interfaces and types live in `src/types.ts`:

- `TGestureType` - Union of all gesture event names
- `IThresholds` - Configurable threshold options
- `I*EventDetails` - Event detail interfaces for each gesture type
- `DEFAULT_THRESHOLDS` - Default values for all thresholds

When adding a new gesture:

1. Add the gesture name to `TGestureType`
2. Create an `I*EventDetails` interface if needed
3. Add any new thresholds to `IThresholds` and `DEFAULT_THRESHOLDS`

### 4. Event Prefixes

All events must support the `eventPrefix` option. Use the dispatch methods in the main class:

```typescript
private dispatchSwipeEvent = (gestureType: TGestureType, details: ISwipeEventDetails) => {
  const eventName = this.eventPrefix + gestureType;  // Always include prefix
  const event = new CustomEvent(eventName, { detail: details });
  this.element!.dispatchEvent(event);
};
```

## Adding a New Gesture

### Step 1: Define Types

Add to `src/types.ts`:

```typescript
// Add to TGestureType union
export type TGestureType =
  // ... existing types
  | "mygesture";

// Create event details interface
export interface IMyGestureEventDetails {
  // relevant properties
}

// Add thresholds if needed
export interface IThresholds {
  // ... existing thresholds
  myGestureThreshold?: number;
}

export const DEFAULT_THRESHOLDS = {
  // ... existing defaults
  myGestureThreshold: 50,
};
```

### Step 2: Create Detector Module

Create `src/detectors/my-gesture.ts`:

```typescript
import { ICoords, DEFAULT_THRESHOLDS } from "../types";

/**
 * Pure function to detect the gesture.
 * Document what it does and what it returns.
 */
export function detectMyGesture(
  // input parameters
): MyGestureResult {
  // Detection logic - pure function, no side effects
}
```

### Step 3: Write Tests First

Create `src/detectors/my-gesture.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";
import { detectMyGesture } from "./my-gesture";

describe("detectMyGesture", () => {
  it("should detect gesture when conditions are met", () => {
    const result = detectMyGesture(/* test input */);
    expect(result).toBe(/* expected output */);
  });

  it("should return null when conditions are not met", () => {
    // ...
  });

  // Test edge cases, thresholds, etc.
});
```

### Step 4: Integrate into Main Class

Update `src/index.ts`:

1. Import the detector function
2. Add any necessary state variables
3. Call the detector from the appropriate pointer or touch handler in `index.ts`
4. Dispatch the event with details

### Step 5: Update Documentation

Update `README.md` with:

- The new event in the events table
- Event details structure
- Any new configuration options

## Testing Standards

### Write Pure, Testable Functions

```typescript
// Good: Easy to test
export function calculateDistance(p1: ICoords, p2: ICoords): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Avoid: Hard to test (depends on DOM)
function getDistanceFromTouch(touch: Touch): number {
  // ...
}
```

### Test Edge Cases

```typescript
describe("classifyRotation", () => {
  it("should return null for rotation below threshold", () => { });
  it("should return clockwise for positive delta", () => { });
  it("should return counterclockwise for negative delta", () => { });
  it("should handle exact threshold boundary", () => { });  // Edge case
  it("should handle zero input", () => { });                // Edge case
});
```

### Use Descriptive Test Names

```typescript
// Good
it("should return null when contact count is below minimum", () => { });

// Avoid
it("works", () => { });
```

## Code Style

- Use TypeScript strict mode
- Export types for public API
- Document public functions with JSDoc comments
- Use meaningful variable names
- Keep functions small and focused

## Pull Request Checklist

- [ ] All tests pass (`bun test`)
- [ ] Build succeeds (`bun run build`)
- [ ] New features have tests
- [ ] Types are updated in `types.ts`
- [ ] README is updated if needed
- [ ] No linter errors

## Questions?

Open an issue on GitHub if you have questions or need help getting started!

