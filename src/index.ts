type GestureType =
  | "swipe"
  | "swipeup"
  | "swipedown"
  | "swipeleft"
  | "swiperight"
  | "pinch"
  | "spread"
  | "gesture";

interface TocadaOptions {
  thresholds?: {
    swipeThreshold?: number;
  };
  eventPrefix?: string;
}

interface SwipeEventDetails {
  velocityX: number;
  velocityY: number;
  velocity: number;
  avgPressure: number;
  startPressure: number;
  endPressure: number;
  startTime: number;
  endTime: number;
  distanceX: number;
  distanceY: number;
  distance: number;
  startingElement: HTMLElement | null;
  endingElement: HTMLElement;
  touchedElements: HTMLElement[];
}

export default class Tocada {
  private element: HTMLElement | null;

  // detail object properties
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private startPressure: number = 0;
  private endPressure: number = 0;
  private startingElement: HTMLElement | null = null;
  private touchedElements: HTMLElement[] = [];

  // options
  private thresholds!: {
    swipeThreshold: number;
  };
  private eventPrefix: string = "";

  private gestureStartDistance: number = 0;
  private latestGestureDistance: number = 0;
  private isMultiTouch = false;
  private activeTouches = 0;
  private touchCount = 0;

  constructor(queryStringOrElement: string | HTMLElement, options: TocadaOptions = {}) {
    this.element =
      typeof queryStringOrElement === "string"
        ? document.querySelector(queryStringOrElement)
        : queryStringOrElement;
    if (!this.element) {
      console.error("Element not found");
      return;
    }

    const { thresholds = {}, eventPrefix = "" } = options;
    this.thresholds = {
      swipeThreshold: thresholds.swipeThreshold || 50,
    };
    this.eventPrefix = eventPrefix;

    this.element.addEventListener("touchstart", this.handleTouchStart, false);
    this.element.addEventListener("touchmove", this.handleTouchMove, false);
    this.element.addEventListener("touchend", this.handleTouchEnd, false);
  }

  destroy() {
    this.element?.removeEventListener("touchstart", this.handleTouchStart);
    this.element?.removeEventListener("touchmove", this.handleTouchMove);
    this.element?.removeEventListener("touchend", this.handleTouchEnd);
  }

  private handleTouchStart = (event: TouchEvent) => {
    this.activeTouches += event.changedTouches.length;
    this.touchCount = event.touches.length;

    if (this.activeTouches > 1) {
      this.isMultiTouch = true;
      this.gestureStartDistance = this.getDistanceBetweenTouchPoints(event.touches);
      this.handleGestureStart(event);
    } else {
      this.isMultiTouch = false;
      this.handleSwipeStart(event);
    }
  };

  private handleTouchMove = (event: TouchEvent) => {
    // Prevent default behavior to prevent scrolling
    event.preventDefault();
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (element) this.touchedElements.push(element);

    if (this.isMultiTouch) {
      this.handleGestureMove(event);
    }
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (this.activeTouches >= 2) {
      this.handleGestureEnd(event);
      this.touchCount = 0;
    } else if (this.activeTouches === 1) {
      this.handleSwipeEnd(event);
      this.touchCount = 0;
    }

    this.activeTouches -= event.changedTouches.length;
  };

  private handleSwipeStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.startPressure = touch.force || 0;
    this.startingElement = document.elementsFromPoint(this.startX, this.startY)[0] as HTMLElement;

    this.touchedElements.push(this.startingElement);
  };

  private handleSwipeEnd = (event: TouchEvent) => {
    if (!this.isMultiTouch && this.touchCount === 1) {
      // Handle swipe gesture
      const touch = event.changedTouches[0];
      const endTime = Date.now();
      const deltaTime = endTime - this.startTime;
      const deltaX = difference(this.startX, touch.clientX);
      const deltaY = difference(this.startY, touch.clientY);
      const distanceX = Math.abs(deltaX);
      const distanceY = Math.abs(deltaY);
      const distance = Math.hypot(distanceX, distanceY);
      const velocityX = deltaX / deltaTime;
      const velocityY = deltaY / deltaTime;
      const velocity = distance / deltaTime;
      this.endPressure = touch.force || 0;
      const avgPressure = (this.startPressure + this.endPressure) / 2;
      const endingElement = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;

      const detail = {
        velocityX,
        velocityY,
        velocity,
        avgPressure,
        startPressure: this.startPressure,
        endPressure: this.endPressure,
        startTime: this.startTime,
        endTime,
        distanceX,
        distanceY,
        distance,
        startingElement: this.startingElement,
        endingElement,
        touchedElements: this.touchedElements,
      };

      this.dispatchSwipeEvent("swipe", detail);

      const xDirection = this.startX < touch.clientX ? "swiperight" : "swipeleft";
      const yDirection = this.startY < touch.clientY ? "swipedown" : "swipeup";
      const gestureType: GestureType = deltaX > deltaY ? xDirection : yDirection;

      this.dispatchSwipeEvent(gestureType, detail);

      this.touchedElements = [];
    }
  };

  private handleGestureStart = (event: TouchEvent) => {
    this.isMultiTouch = true;
  };

  private handleGestureMove = (event: TouchEvent) => {
    this.latestGestureDistance = this.getDistanceBetweenTouchPoints(event.touches);
  };

  private handleGestureEnd = (event: TouchEvent) => {
    this.isMultiTouch = false;

    this.dispatchGestureEvent("gesture");

    if (this.latestGestureDistance < this.gestureStartDistance) {
      this.dispatchGestureEvent("pinch");
    } else {
      this.dispatchGestureEvent("spread");
    }

    this.latestGestureDistance = 0;
  };

  private getDistanceBetweenTouchPoints = (touches: TouchEvent["changedTouches"]) => {
    const distanceX = touches[0].clientX - touches[1].clientX;
    const distanceY = touches[0].clientY - touches[1].clientY;
    return Math.hypot(distanceX, distanceY);
  };

  private dispatchSwipeEvent = (gestureType: GestureType, details: SwipeEventDetails) => {
    const eventName = this.eventPrefix + gestureType;
    const swipeEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(swipeEvent);
  };

  private dispatchGestureEvent = (gestureType: GestureType) => {
    const eventName = this.eventPrefix + gestureType;
    const gestureEvent = new CustomEvent(eventName);
    this.element!.dispatchEvent(gestureEvent);
  };
}

function difference(num1: number, num2: number): number {
  if (num1 < num2) {
    return num2 - num1;
  } else {
    return num1 - num2;
  }
}