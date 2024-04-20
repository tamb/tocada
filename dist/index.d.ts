import { ITocadaOptions } from "types";
export default class Tocada {
    element: HTMLElement | null;
    private startX;
    private startY;
    private startTime;
    private startPressure;
    private endPressure;
    private startingElement;
    private touchedElements;
    private thresholds;
    private eventPrefix;
    private gestureStartDistance;
    private latestGestureDistance;
    private isMultiTouch;
    private activeTouches;
    private touchCount;
    constructor(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions);
    destroy: () => void;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleSwipeStart;
    private handleSwipeEnd;
    private handleGestureStart;
    private handleGestureMove;
    private handleGestureEnd;
    private dispatchSwipeEvent;
    private dispatchGestureEvent;
}
export declare function useTouchEvents(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions): Tocada;
//# sourceMappingURL=index.d.ts.map