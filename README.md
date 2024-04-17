# Tocada JS

Touch Events with ease
<br/>

## It's dead simple to use

```
/**
Add events for
swipe // fired before swipeleft, up, down, right events
swipeup
swiperight
swipedown
swipeleft
gesture // fired before any pinch or spread
pinch
spread
*/
const swipeArea = new Tocada (querySelector | element);

/**
Remove events
*/
swipeArea.destroy();

```

## `detail` object

The above `CustomEvent`s emit a `detail` object with the following data

```
velocityX,      // speed of x-axis movement
velocityY,      // speed of y-axis movement
velocity,       // speed of overall touch event
avgPressure,    // touch pressure for the entire event
startPressure,  // starting touch pressure for the event
endPressure,    // ending touch pressure for the event
startTime,      // datetime at the start of the event
endTime,        // datetime at the end of the event
distanceX,      // distance traveled over the x-axis
distanceY,      // distance traveled over the y-axis
distance,       // distance traveled in a straight line
startingElement,// first element touched
endingElement,  // last element touched
touchedElements,// all of the element (including duplicates) touched during the event -- convert to a Set to make elements unique: new Set(touchedElements);

```

## Help me out

I write a lot of open source software (some more useful than others). You can help me out by tossing me a few bucks to buy coffee.

<a href="https://www.buymeacoffee.com/tamb" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
