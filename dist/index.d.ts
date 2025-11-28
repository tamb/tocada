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
    constructor(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions);
    destroy: () => void;
    private clearTimers;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleSwipeStart;
    private handleSwipeEnd;
    private handleGestureStart;
    private handleGestureMove;
    private handleGestureEnd;
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
export declare function useTouchEvents(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions): Tocada;
export * from "./types";
//# sourceMappingURL=index.d.ts.map