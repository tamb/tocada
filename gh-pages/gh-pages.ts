import Tocada from "../dist/index.js";

const touchArea = document.getElementById("touchArea");
const eventDisplay = document.getElementById("eventDisplay");
const useHighPrecisionCheckbox = document.getElementById("useHighPrecision");

if (!touchArea || !eventDisplay || !useHighPrecisionCheckbox) {
  throw new Error("Required elements not found");
}

// Error tracking
interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  source?: string;
}

const errors: ErrorInfo[] = [];
let hasUnreadErrors = false;
const errorButton = document.getElementById("errorButton");
const errorBadge = document.getElementById("errorBadge");
const errorModal = document.getElementById("errorModal");
const errorModalBody = document.getElementById("errorModalBody");

// Function to add error
function addError(error: Error, source?: string) {
  errors.push({
    message: error.message || String(error),
    stack: error.stack,
    timestamp: new Date(),
    source,
  });
  hasUnreadErrors = true;
  updateErrorUI();
}

// Function to update error UI
function updateErrorUI() {
  if (!errorButton || !errorBadge) return;

  if (errors.length > 0) {
    errorBadge.textContent = String(errors.length);
    errorBadge.style.display = "flex";
    
    // Only pulse if there are unread errors
    if (hasUnreadErrors) {
      errorButton.classList.add("has-errors");
    } else {
      errorButton.classList.remove("has-errors");
    }
  } else {
    errorButton.classList.remove("has-errors");
    errorBadge.style.display = "none";
    hasUnreadErrors = false;
  }
}

// Function to render errors in modal
function renderErrors() {
  if (!errorModalBody) return;

  if (errors.length === 0) {
    errorModalBody.innerHTML = '<div class="no-errors">No errors captured yet.</div>';
    return;
  }

  const html = errors
    .map((error, index) => {
      return `
        <div class="error-item">
          <div class="error-message">${escapeHtml(error.message)}</div>
          ${error.source ? `<div style="font-size: 0.85em; color: #6c757d; margin-bottom: 10px;">Source: ${escapeHtml(error.source)}</div>` : ""}
          ${error.stack ? `<div class="error-stack">${escapeHtml(error.stack)}</div>` : ""}
          <div class="error-time">${error.timestamp.toLocaleString()}</div>
        </div>
      `;
    })
    .join("");

  errorModalBody.innerHTML = html;
}

// Function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Function to open error modal
function openErrorModal() {
  if (!errorModal) return;
  renderErrors();
  errorModal.classList.add("show");
  // Mark errors as read when modal is opened
  hasUnreadErrors = false;
  updateErrorUI();
}

// Function to close error modal
function closeErrorModal() {
  if (!errorModal) return;
  errorModal.classList.remove("show");
}

// Function to clear all errors
function clearErrors() {
  errors.length = 0;
  hasUnreadErrors = false;
  updateErrorUI();
  renderErrors();
}

// Make functions available globally for onclick handlers
(window as any).openErrorModal = openErrorModal;
(window as any).closeErrorModal = closeErrorModal;
(window as any).clearErrors = clearErrors;

// Set up error button click handler
if (errorButton) {
  errorButton.addEventListener("click", openErrorModal);
}

// Close modal when clicking outside
if (errorModal) {
  errorModal.addEventListener("click", (e) => {
    if (e.target === errorModal) {
      closeErrorModal();
    }
  });
}

// Set up global error handlers
window.addEventListener("error", (event) => {
  addError(event.error || new Error(event.message), "Global Error Handler");
});

window.addEventListener("unhandledrejection", (event) => {
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  addError(error, "Unhandled Promise Rejection");
});

// Wrap the main code in try-catch
try {

// Create 16x16 grid of squares
const gridSize = 16;
for (let i = 0; i < gridSize * gridSize; i++) {
  const square = document.createElement("div");
  square.className = "touch-square";
  touchArea.appendChild(square);
}

// Pointer events by default (mouse, pen, touch); see useTouchEvents() for touch-only.
let touchHandler = new Tocada(touchArea, {
  useHighPrecision: (useHighPrecisionCheckbox as HTMLInputElement).checked,
});

useHighPrecisionCheckbox.addEventListener("change", (e) => {
  const useHighPrecision = (e.target as HTMLInputElement).checked;
  touchHandler.destroy();
  touchHandler = new Tocada(touchArea, { useHighPrecision });
}); 

// Track recent events (keep only 2 most recent)
const recentEvents: Array<{
  type: string;
  detail: any;
  timestamp: Date;
}> = [];

// All available touch events
const eventNames = [
  // Single touch events
  "tap",
  "doubletap",
  "press",
  "hold",
  "swipe",
  "swipeup",
  "swipedown",
  "swipeleft",
  "swiperight",
  "swipeclockwise",
  "swipecounterclockwise",
  // Multi-touch events
  "gesture",
  "pinch",
  "spread",
  "rotate",
  "rotateclockwise",
  "rotatecounterclockwise",
  // "swipepalm",
  // "swipepalmup",
  // "swipepalmdown",
  // "swipepalmleft",
  // "swipepalmright",
];

// Function to make a square glow
function glowSquare(element: HTMLElement | null) {
  if (!element) return;

  // Find the square element (might be the element itself or a parent)
  let square: HTMLElement | null = element;
  while (square && !square.classList.contains("touch-square")) {
    square = square.parentElement;
  }

  if (square) {
    square.classList.add("glow");
    setTimeout(() => {
      square?.classList.remove("glow");
    }, 300);
  }
}

// Function to glow multiple squares (for swipe paths)
function glowSquares(elements: HTMLElement[] | null | undefined) {
  if (!elements || elements.length === 0) return;

  elements.forEach((element) => {
    glowSquare(element);
  });
}

// Function to format event details for display
function formatEventDetails(eventType: string, detail: any): string {
  const parts: string[] = [];

  // Common properties
  if (detail.distance !== undefined) {
    parts.push(`Distance: ${Math.round(detail.distance)}px`);
  }
  if (detail.velocity !== undefined) {
    parts.push(`Velocity: ${detail.velocity.toFixed(2)} px/ms`);
  }
  if (detail.duration !== undefined) {
    parts.push(`Duration: ${detail.duration}ms`);
  }
  if (detail.direction !== undefined) {
    parts.push(`Direction: ${detail.direction}`);
  }
  if (detail.angle !== undefined) {
    parts.push(`Angle: ${Math.round(detail.angle)}°`);
  }
  if (detail.scale !== undefined) {
    parts.push(`Scale: ${detail.scale.toFixed(2)}`);
  }
  if (detail.touchCount !== undefined) {
    parts.push(`Touches: ${detail.touchCount}`);
  }
  if (detail.arc !== undefined) {
    parts.push(`Arc: ${Math.round(detail.arc)}°`);
  }

  return parts.length > 0 ? parts.join(" • ") : "No additional details";
}

// Function to update event display
function updateEventDisplay() {
  if (!eventDisplay) return;
  
  if (recentEvents.length === 0) {
    eventDisplay.innerHTML =
      '<p class="text-muted">Touch the grid above to see events here...</p>';
    return;
  }

  const html = recentEvents
    .map((event) => {
      const details = formatEventDetails(event.type, event.detail);
      return `
        <div class="event-item">
          <div class="event-type">${event.type}</div>
          ${details ? `<div class="event-details">${details}</div>` : ""}
          <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
        </div>
      `;
    })
    .join("");

  eventDisplay.innerHTML = html;
}

// Listen to all touch events
eventNames.forEach((eventName) => {
  touchArea.addEventListener(eventName, (e: Event) => {
    const customEvent = e as CustomEvent;
    const detail = customEvent.detail || {};

    // Glow all touched elements (for swipe paths) or just the touched element (for taps)
    // Prefer derivedTouchedElements if available (high precision mode), fall back to touchedElements
    const elementsToGlow = detail.derivedTouchedElements || detail.touchedElements;
    if (elementsToGlow && Array.isArray(elementsToGlow) && elementsToGlow.length > 0) {
      // Deduplicate to ensure each square only glows once
      const uniqueElements = Array.from(new Set(elementsToGlow));
      // For swipe gestures, glow all touched squares to show the path
      glowSquares(uniqueElements);
    } else {
      // For tap/press/hold events, just glow the single element
      const touchedElement =
        detail.startingElement ||
        detail.element ||
        (detail.coords
          ? document.elementFromPoint(detail.coords.x, detail.coords.y)
          : null) ||
        (detail.startingCoords
          ? document.elementFromPoint(
              detail.startingCoords.x,
              detail.startingCoords.y
            )
          : null);
      glowSquare(touchedElement as HTMLElement);
    }

    // Add to recent events (keep only 2 most recent)
    recentEvents.unshift({
      type: eventName,
      detail,
      timestamp: new Date(),
    });

    if (recentEvents.length > 2) {
      recentEvents.pop();
    }

    // Update display
    updateEventDisplay();

    // Log to console for debugging
    console.log(`Event: ${eventName}`, detail);
  });
});

// Initial display
updateEventDisplay();
} catch (error) {
  addError(error instanceof Error ? error : new Error(String(error)), "Main Script");
}
