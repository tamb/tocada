type GestureType =
  | "swipe"
  | "swipeup"
  | "swipedown"
  | "swipeleft"
  | "swiperight"
  | "pinch"
  | "spread";

interface TocadaOptions {
  thresholds?: {
    swipeThreshold?: number;
    pinchThreshold?: number;
    spreadThreshold?: number;
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
  angle: number;
}

export default class Tocada {
  private element: HTMLElement | null;

  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private startPressure: number = 0;
  private endPressure: number = 0;

  private thresholds!: {
    swipeThreshold: number;
    pinchThreshold: number;
    spreadThreshold: number;
  };
  private pinchStartDistance: number = 0;
  private eventPrefix: string = "";

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
      pinchThreshold: thresholds.pinchThreshold || 100,
      spreadThreshold: thresholds.spreadThreshold || 100,
    };
    this.eventPrefix = eventPrefix;

    this.element.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
    this.element.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
  }

  private handleTouchStart = (event: TouchEvent) => {
    // FIXME - pinch and spread are not firing
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.startPressure = touch.force || 0;

    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.pinchStartDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
    }
  };

  private handleTouchMove(event: TouchEvent) {
    // Prevent default behavior to prevent scrolling
    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const deltaTime = endTime - this.startTime;
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const distance = Math.hypot(deltaX, deltaY);
    const velocityX = deltaX / deltaTime;
    const velocityY = deltaY / deltaTime;
    const velocity = distance / deltaTime;
    this.endPressure = touch.force || 0;
    const avgPressure = (this.startPressure + this.endPressure) / 2;

    if (distance > this.thresholds.swipeThreshold) {
      const xDirection = deltaX > 0 ? "swiperight" : "swipeleft";
      const yDirection = deltaY > 0 ? "swipedown" : "swipeup";
      // TODO - doublecheck this logic
      // FIXME - this logic (above and below) is busted
      const angle = Math.atan2(deltaY, deltaX);
      const gestureType: GestureType = deltaX > deltaY ? xDirection : yDirection;

      // always dispatch a swipe event
      this.dispatchSwipeEvent("swipe", {
        velocityX,
        velocityY,
        velocity,
        avgPressure,
        startPressure: this.startPressure,
        endPressure: this.endPressure,
        angle,
      });

      // dispatch a specific swipe event
      this.dispatchSwipeEvent(gestureType, {
        velocityX,
        velocityY,
        velocity,
        avgPressure,
        startPressure: this.startPressure,
        endPressure: this.endPressure,
        angle,
      });
    }

    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const deltaDistance = currentDistance - this.pinchStartDistance;

      if (Math.abs(deltaDistance) > this.thresholds.pinchThreshold) {
        const gestureType: GestureType = deltaDistance > 0 ? "spread" : "pinch";
        this.dispatchGestureEvent(gestureType);
        this.pinchStartDistance = currentDistance;
      }
    }
  }

  private dispatchSwipeEvent(gestureType: GestureType, details: SwipeEventDetails) {
    const eventName = this.eventPrefix + gestureType;
    const swipeEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(swipeEvent);
  }

  private dispatchGestureEvent(gestureType: GestureType) {
    const eventName = this.eventPrefix + gestureType;
    const gestureEvent = new CustomEvent(eventName);
    this.element!.dispatchEvent(gestureEvent);
  }
}
