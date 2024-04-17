export default class Tocada {
    constructor(queryStringOrElement, options = {}) {
        // detail object properties
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.startPressure = 0;
        this.endPressure = 0;
        this.startingElement = null;
        this.touchedElements = [];
        this.eventPrefix = "";
        this.gestureStartDistance = 0;
        this.latestGestureDistance = 0;
        this.isMultiTouch = false;
        this.activeTouches = 0;
        this.touchCount = 0;
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
        this.element.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
        this.element.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
        this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    }
    handleTouchStart(event) {
        this.activeTouches += event.changedTouches.length;
        this.touchCount = event.touches.length;
        if (this.activeTouches > 1) {
            this.isMultiTouch = true;
            this.gestureStartDistance = this.getDistanceBetweenTouchPoints(event.touches);
            this.handleGestureStart(event);
        }
        else {
            this.isMultiTouch = false;
            this.handleSwipeStart(event);
        }
    }
    handleTouchMove(event) {
        // Prevent default behavior to prevent scrolling
        event.preventDefault();
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        const element = document.elementFromPoint(x, y);
        if (element)
            this.touchedElements.push(element);
        if (this.isMultiTouch) {
            this.handleGestureMove(event);
        }
    }
    handleTouchEnd(event) {
        if (this.activeTouches >= 2) {
            this.handleGestureEnd(event);
            this.touchCount = 0;
        }
        else if (this.activeTouches === 1) {
            this.handleSwipeEnd(event);
            this.touchCount = 0;
        }
        this.activeTouches -= event.changedTouches.length;
    }
    handleSwipeStart(event) {
        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
        this.startPressure = touch.force || 0;
        this.startingElement = document.elementsFromPoint(this.startX, this.startY)[0];
        this.touchedElements.push(this.startingElement);
    }
    handleSwipeEnd(event) {
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
            const endingElement = document.elementFromPoint(touch.clientX, touch.clientY);
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
            const gestureType = deltaX > deltaY ? xDirection : yDirection;
            this.dispatchSwipeEvent(gestureType, detail);
            this.touchedElements = [];
        }
    }
    handleGestureStart(event) {
        this.isMultiTouch = true;
    }
    handleGestureMove(event) {
        this.latestGestureDistance = this.getDistanceBetweenTouchPoints(event.touches);
    }
    handleGestureEnd(event) {
        this.isMultiTouch = false;
        this.dispatchGestureEvent("gesture");
        if (this.latestGestureDistance < this.gestureStartDistance) {
            this.dispatchGestureEvent("pinch");
        }
        else {
            this.dispatchGestureEvent("spread");
        }
        this.latestGestureDistance = 0;
    }
    getDistanceBetweenTouchPoints(touches) {
        const distanceX = touches[0].clientX - touches[1].clientX;
        const distanceY = touches[0].clientY - touches[1].clientY;
        return Math.hypot(distanceX, distanceY);
    }
    dispatchSwipeEvent(gestureType, details) {
        const eventName = this.eventPrefix + gestureType;
        const swipeEvent = new CustomEvent(eventName, { detail: details });
        this.element.dispatchEvent(swipeEvent);
    }
    dispatchGestureEvent(gestureType) {
        const eventName = this.eventPrefix + gestureType;
        const gestureEvent = new CustomEvent(eventName);
        this.element.dispatchEvent(gestureEvent);
    }
}
function difference(num1, num2) {
    if (num1 < num2) {
        return num2 - num1;
    }
    else {
        return num1 - num2;
    }
}
//# sourceMappingURL=index.js.map