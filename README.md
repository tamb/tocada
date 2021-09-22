# tocada.js

A fork of the wonderful Tocca.js library, but with **more** features. Super lightweight script ( ~1kB ) to detect via Javascript events like 'tap' 'longtap' 'dbltap' 'swipeup' 'swipedown' 'swipeleft' 'swiperight' on any kind of device.

## Installation

### Npm

```bash
$ npm install tocada
```

## Usage

Include the script into your page:

```html
<script src="path/to/tocada.min.js"></script>
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
```

It works with jQuery as well:

```javascript
$(elm).on("tap", function (e, data) {});
$(elm).on("dbltap", function (e, data) {});
$(elm).on("longtap", function (e, data) {});
$(elm).on("swipeleft", function (e, data) {});
$(elm).on("swiperight", function (e, data) {});
$(elm).on("swipeup", function (e, data) {});
$(elm).on("swipedown", function (e, data) {});
```

Tocca.js supports also the inline events if you are using Riot.js!

```html
<div ontap="function(e){})"></div>
<div ondbltap="function(e){})"></div>
<div onlongtap="function(e){})"></div>
<div onswipeleft="function(e){})"></div>
<div onswiperight="function(e){})"></div>
<div onswipeup="function(e){})"></div>
<div onswipedown="function(e){})"></div>
```

## API and Examples

Anytime you will use a Tocca.js event the callback function will receive a special event object containing the following properties

- <code>x</code> { Int }: latest x position of pointer at the end of the event
- <code>y</code> { Int }: latest y position of pointer at the end of the event
- <code>originalEvent</code> { Object }: the original javascript native event that has been triggered
- <code>endingElement</code>{HTMLElement}: the last element the touch sensor picked up on as determined by the touch coordinates
- <code>distance</code>: this property is available only for the swipe events
- <code>distance.x</code> { Int }: the x absolute difference between the beginning and the end of the swipe gesture
- <code>distance.y</code> { Int }: the y absolute difference between the beginning and the end of the swipe gesture

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

Anyway you can combine Tocca.js with the default javascript touch events:

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
    JUST_ON_TOUCH_DEVICES = false, // default value ( decide whether you want to use the Tocca.js events only on the touch devices )
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
  namespace: 'myspace',
})

console.log(window.tocca2()) // will always return the current internal options
```

## Browser Support

Actually the script has been tested on all the modern browsers but it need a better testing phase over several platforms: Chrome 29+ Firefox 23+ Opera 12+ Safari 5+

It works on mobile/tablet browsers and on desktop browsers as well.

On the old browsers all the Tocca.js events cannot be triggered.

## What does Tocada mean?!

"Tocada" is Spanish for "touch"
