import { ITocadaOptions } from "types";
export default class Tocada {
    element: HTMLElement | null;
    private endPressure;
    private startingElement;
    private startPressure;
    private startTime;
    private startX;
    private startY;
    private touchedElements;
    private activeTouches;
    private gestureStartDistance;
    private isMultiTouch;
    private latestGestureDistance;
    private touchCount;
    private thresholds;
    private eventPrefix;
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
    private reset;
}
export declare function useTouchEvents(queryStringOrElement: string | HTMLElement, options?: ITocadaOptions): Tocada;
//# sourceMappingURL=index.d.ts.map