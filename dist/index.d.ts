interface TocadaOptions {
    thresholds?: {
        swipeThreshold?: number;
        pinchThreshold?: number;
        spreadThreshold?: number;
    };
    eventPrefix?: string;
}
export default class Tocada {
    private element;
    private startX;
    private startY;
    private startTime;
    private startPressure;
    private endPressure;
    private startingElement;
    private touchedElements;
    private thresholds;
    private eventPrefix;
    private pinchStartDistance;
    private isMultiTouch;
    private isTouching;
    private activeTouches;
    private touchCount;
    private gestureTouches;
    constructor(queryStringOrElement: string | HTMLElement, options?: TocadaOptions);
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleSwipeStart;
    private handleSwipeEnd;
    private handleGestureStart;
    private handleGestureEnd;
    private dispatchSwipeEvent;
    private dispatchGestureEvent;
}
export {};
//# sourceMappingURL=index.d.ts.map