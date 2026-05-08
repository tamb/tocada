import { ITocadaOptions } from "./types";
export default class Tocada {
    element: HTMLElement | null;
    private endPressure;
    private startingElement;
    private startPressure;
    private startTime;
    private startX;
    private startY;
    private touchedElements;
    private interpolatedTouchedElements;
    private lastTouchPosition;
    private activeTouches;
    private gestureStartDistance;
    private isMultiTouch;
    private latestGestureDistance;
    private touchCount;
    private lastTapTime;
    private lastTapX;
    private lastTapY;
    private holdTimer;
    private holdFired;
    private touchPath;
    private gestureStartTouch1;
    private gestureStartTouch2;
    private latestTouch1;
    private latestTouch2;
    private palmStartPositions;
    private isPalmSwipe;
    private thresholds;
    private eventPrefix;
    private useHighPrecision;
    private usePointerEvents;
    /** Prior inline `touch-action` if this instance set one; `null` if {@link ITocadaOptions.touchAction} was `false`. */
    private touchActionBefore;
    /** Active pointers when using the Pointer Events pipeline (key = pointerId). */
    private pointerById;
    constructor(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions);
    destroy: () => void;
    private clearTimers;
    private beginSingleContactSession;
    /** Single-contact move sampling (linear path, interpolation, circular-swipe path). */
    private sampleSingleContactAlongPath;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleSwipeStart;
    private finalizeSingleContactEnd;
    private handleSwipeEnd;
    private handleGestureStart;
    private handleGestureMove;
    private finalizeMultiContactGesture;
    private handleGestureEnd;
    private getOrderedActivePointerCoordsPair;
    private syncPointerTwoFingerGeometryFromMap;
    private tryPointerCapture;
    private releasePointerCaptureSafe;
    private handlePointerDown;
    private handlePointerMove;
    private handlePointerUpOrCancel;
    private handlePointerUp;
    private handlePointerCancel;
    /**
     * Gets all unique elements touched along a touch path by sampling points.
     * Samples points from touchPath and finds elements at those coordinates.
     */
    private getTouchedPathElements;
    /**
     * Combines touchedElements, interpolatedTouchedElements, and touchedPathElements,
     * orders them chronologically by their position in the touch path, and deduplicates.
     */
    private getDerivedTouchedElements;
    private dispatchSwipeEvent;
    private dispatchTapEvent;
    private dispatchCircularSwipeEvent;
    private dispatchRotateEvent;
    private dispatchPalmSwipeEvent;
    private dispatchPinchSpreadEvent;
    private dispatchGestureEvent;
    private reset;
}
/** Touch-only pipeline (`touchstart` / `touchmove` / `touchend`). Overrides default pointer mode. */
export declare function useTouchEvents(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions): Tocada;
/** Explicit Pointer Events pipeline (default for {@link Tocada} and {@link usePointerEvents}). */
export declare function usePointerEvents(queryStringOrElement: string | HTMLElement, options?: Omit<ITocadaOptions, "pointerEvents">): Tocada;
export * from "./types";
//# sourceMappingURL=index.d.ts.map