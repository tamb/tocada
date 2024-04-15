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
    private thresholds;
    private pinchStartDistance;
    private eventPrefix;
    constructor(queryStringOrElement: string | HTMLElement, options?: TocadaOptions);
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private dispatchSwipeEvent;
    private dispatchGestureEvent;
}
export {};
//# sourceMappingURL=index.d.ts.map