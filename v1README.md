# tocada.js

A fork of the wonderful Tocca.js library. But we use CustomEvents. You also get added event information like `velocity`, `endingElement`, `touchDuration`

## Installation

### Npm

```bash
$ npm install tocada
```

## Usage

Include the script into your page:

```html
<script src="path/to/script.js"></script>
```

Once you have included tocada.js you will be able to catch all the new events:

```javascript
elm.addEventListener("tap", function (e) {});
elm.addEventListener("dbltap", function (e) {});
elm.addEventListener("longtap", function (e) {});
elm.addEventListener("swipeleft", function (e) {});
elm.addEventListener("swiperight", function (e) {});
elm.addEventListener("swipeup", function (e) {});
elm.addEventListener("swipedown", function (e) {});
elm.addEventListener("swipe", function (e) {}); // fires once per every initiating swipe touch
```

**note**
The "swipe" event will fire after all types of swipe. In the case multiple types of swipe are triggered
from the same motion. "swipe" will be fired after the first type of swipe event.

It works with jQuery as well:

```javascript
$(elm).on("tap", function (e, data) {});
$(elm).on("dbltap", function (e, data) {});
$(elm).on("longtap", function (e, data) {});
$(elm).on("swipeleft", function (e, data) {});
$(elm).on("swiperight", function (e, data) {});
$(elm).on("swipeup", function (e, data) {});
$(elm).on("swipedown", function (e, data) {});
$(elm).on("swipe", function (e, data) {});
```

## API and Examples

Anytime you will use a Tocada event the callback function will receive a special `event` object with with a `detail` object containing the following properties

- <code>endingCoords</code> { Object }: the x and y coordinates of the touch event
- <code>endingCoords.x</code> { Int }: latest x position of pointer at the end of the event
- <code>endingCoords.y</code> { Int }: latest y position of pointer at the end of the event
- <code>originalEvent</code> { Object }: the original javascript native event that has been triggered
- <code>startingElement</code> {HTMLElement}: the original target element of the touch event
- <code>endingElement</code>{HTMLElement}: the last element the touch sensor picked up on as determined by the touch coordinates
- <code>distance</code>: this property is available only for the swipe events
- <code>distance.x</code> { Int }: the x absolute difference between the beginning and the end of the swipe gesture
- <code>distance.y</code> { Int }: the y absolute difference between the beginning and the end of the swipe gesture
- <code>distance.absolute</code> { Int/Float }: the calculated absolute distance from point to point
- <code>startingCoords</code> { Object }: the starting coordinates of the initiating touch event
- <code>startingCoords.x</code>
- <code>startingCoords.y</code>
- <code>touchDuration</code> { Int }: the length of time in MS for the touch event
- <code>velocity</code> { Float }: the velocity in pixels per millisecond
- <code>touchStartTime</code> { Int }: time of event start in milliseconds
- <code>touchEndTime</code> { Int }: time of event end in milliseconds

Examples:

```javascript
elm.addEventListener("dbltap", function (e) {
  console.log(e.x);
  console.log(e.y);
});
elm.addEventListener("swipeup", function (e) {
  console.log(e.x);
  console.log(e.y);
  console.log(e.distance.x);
  console.log(e.distance.y);
});

// with jQuery

$(elm).on("dbltap", function (e, data) {
  console.log(data.x);
  console.log(data.y);
});
$(elm).on("swipeup", function (e, data) {
  console.log(data.x);
  console.log(data.y);
  console.log(data.distance.x);
  console.log(data.distance.y);
});
```

Anyway you can combine Tocada with the default javascript touch events:

- <code>touchmove</code>
- <code>touchstart</code>
- <code>touchend</code>
- <code>touchcancel</code>

To disable the default touch behaviours (zoom on double tap, scroll on swipe...) on a certain element via javascript you can always use the following snippet:

```javascript
elm.addEventListener("touchmove", function (e) {
  e.preventDefault();
});
elm.addEventListener("touchstart", function (e) {
  e.preventDefault();
});
elm.addEventListener("touchend", function (e) {
  e.preventDefault();
});
```

## Configuration

Whenever you want to configure the plugin events settings you can do that simply specifying two constants before including tocada.js into the page

```html
<script>
  var SWIPE_THRESHOLD = 100, // default value
    DBL_TAP_THRESHOLD = 200, // range of time in which a dbltap event could be detected,
    LONG_TAP_THRESHOLD = 1000, // range of time after which a longtap event could be detected
    TAP_THRESHOLD = 150, // range of time in which a tap event could be detected
    TAP_PRECISION = 60 / 2, // default value (touch events boundaries)
    JUST_ON_TOUCH_DEVICES = false, // default value ( decide whether you want to use the tocada events only on the touch devices )
    IGNORE_JQUERY = false, // default value ( will not use jQuery events, even if jQuery is detected )
    NAMESPACE = ""; // prepend a namespace to the events to avoid conflict with future native implementations
</script>
<script src="path/to/tocada.min.js"></script>
```

```js
window.tocada({
  useJquery: your new option
  swipeThreshold: your new option
  tapThreshold: your new option
  dbltapThreshold: your new option
  longtapThreshold: your new option
  tapPrecision: your new option
  justTouchEvents: your new option,
  namespace: your new option,
})

console.log(window.tocada()) // will always return the current internal options
```

## Browser Support

This requires a CustomEvent polyfill for older browsers.

## What does Tocada mean?!

"Tocada" is Spanish for "touched"
