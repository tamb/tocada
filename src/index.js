/**
 *
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/
/* global jQuery */
(function (doc, win) {
  // if (typeof doc.createEvent !== "function") return false; // no tap events here
  // helpers

  let tocada = {};
  let tapNum = 0;
  // was initially triggered a "touchstart" event?
  let wasTouch = false;

  var pointerId;
  var currX;
  var currY;
  var cachedX;
  var cachedY;
  var timestamp;
  var target;
  var dblTapTimer;
  var longtapTimer;

  const defaults = {
    useJquery: !win.IGNORE_JQUERY && typeof jQuery !== "undefined",
    swipeThreshold: win.SWIPE_THRESHOLD || 100,
    tapThreshold: win.TAP_THRESHOLD || 150, // range of time where a tap event could be detected
    dbltapThreshold: win.DBL_TAP_THRESHOLD || 200, // delay needed to detect a double tap
    longtapThreshold: win.LONG_TAP_THRESHOLD || 1000, // delay needed to detect a long tap
    tapPrecision: win.TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
    justTouchEvents: win.JUST_ON_TOUCH_DEVICES,
    namespace: win.NAMESPACE || "",
  };

  const touchevents = {
    touchstart: touchEvent("touchstart") || pointerEvent("PointerDown"),
    touchend: touchEvent("touchend") || pointerEvent("PointerUp"),
    touchmove: touchEvent("touchmove") || pointerEvent("PointerMove"),
  };

  function pointerEvent(type) {
    const lo = type.toLowerCase();
    const ms = "MS" + type;
    return navigator.msPointerEnabled ? ms : window.PointerEvent ? lo : false;
  }
  function touchEvent(name) {
    return "on" + name in window ? name : false;
  }

  function isTheSameFingerId(e) {
    return (
      !e.pointerId ||
      typeof pointerId === "undefined" ||
      e.pointerId === pointerId
    );
  }
  function setListener(elm, events, callback) {
    var eventsArray = events.split(" "),
      i = eventsArray.length;

    while (i--) {
      elm.addEventListener(eventsArray[i], callback, false);
    }
  }
  function getPointerEvent(event) {
    var hasTargetTouches = Boolean(
      event.targetTouches && event.targetTouches.length
    );
    switch (true) {
      case Boolean(event.target.touches):
        return event.target.touches[0];
      case hasTargetTouches &&
        typeof event.targetTouches[0].pageX !== "undefined":
        return event.targetTouches[0];
      case hasTargetTouches && Boolean(event.targetTouches[0].touches):
        return event.targetTouches[0].touches[0];
      default:
        return event;
    }
  }
  function isMultipleTouches(event) {
    return (event.targetTouches || event.target.touches || []).length > 1;
  }
  function getTimestamp() {
    return new Date().getTime();
  }
  function sendEvent(elm, eventName, originalEvent, tocada) {
    var customEvent = new CustomEvent(eventName, {
      bubbles: true,
      detail: {
        originalEvent,
        ...tocada,
      },
    });
    tocada = tocada || { endingCoords: {} };
    tocada.endingCoords.x = currX;
    tocada.endingCoords.y = currY;

    // jquerys
    if (defaults.useJquery) {
      customEvent = jQuery.Event(eventName, { originalEvent: originalEvent });
      jQuery(elm).trigger(customEvent, tocada);
    }

    // addEventListener
    if (!defaults.useJquery) {
      elm.dispatchEvent(customEvent);
    }

    // detect all the inline events
    // also on the parent nodes
    while (elm) {
      // inline
      if (elm["on" + eventName]) elm["on" + eventName](customEvent);
      elm = elm.parentNode;
    }
  }
  function onTouchStart(e) {
    /**
     * Skip all the mouse events
     * events order:
     * Chrome:
     *   touchstart
     *   touchmove
     *   touchend
     *   mousedown
     *   mousemove
     *   mouseup <- this must come always after a "touchstart"
     *
     * Safari
     *   touchstart
     *   mousedown
     *   touchmove
     *   mousemove
     *   touchend
     *   mouseup <- this must come always after a "touchstart"
     */

    if (!isTheSameFingerId(e) || isMultipleTouches(e)) return;
    const startTimeStamp = getTimestamp();
    pointerId = e.pointerId;

    // it looks like it was a touch event!
    if (e.type !== "mousedown") wasTouch = true;

    // skip this event we don't need to track it now
    if (e.type === "mousedown" && wasTouch) return;

    var pointer = getPointerEvent(e);

    // caching the current x
    cachedX = currX = pointer.pageX;
    // caching the current y
    cachedY = currY = pointer.pageY;

    tocada = {
      startingElement: e.target,
      startingCoords: {
        x: cachedX,
        y: cachedY,
      },
      touchStartTime: startTimeStamp,
      endingCoords: {
        x: null,
        y: null,
      },
      distance: {},
      velocity: null,
    };

    longtapTimer = setTimeout(function () {
      sendEvent(e.target, "longtap", e, tocada);
      target = e.target;
    }, defaults.longtapThreshold);

    // we will use these variables on the touchend events
    timestamp = getTimestamp();

    tapNum++;
  }
  function onTouchEnd(e) {
    if (!isTheSameFingerId(e) || isMultipleTouches(e)) return;

    pointerId = undefined;

    // skip the mouse events if previously a touch event was dispatched
    // and reset the touch flag
    if (e.type === "mouseup" && wasTouch) {
      wasTouch = false;
      return;
    }

    var eventsArr = [],
      now = getTimestamp(),
      deltaY = cachedY - currY,
      deltaX = cachedX - currX;

    const absoluteDistance = Math.sqrt(
      Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
    );

    const touchDuration = now - tocada.touchStartTime;
    // clear the previous timer if it was set
    clearTimeout(dblTapTimer);
    // kill the long tap timer
    clearTimeout(longtapTimer);

    if (deltaX <= -defaults.swipeThreshold)
      eventsArr.push(defaults.namespace + "swiperight");

    if (deltaX >= defaults.swipeThreshold)
      eventsArr.push(defaults.namespace + "swipeleft");

    if (deltaY <= -defaults.swipeThreshold)
      eventsArr.push(defaults.namespace + "swipedown");

    if (deltaY >= defaults.swipeThreshold)
      eventsArr.push(defaults.namespace + "swipeup");

    if (eventsArr.length) {
      for (var i = 0; i < eventsArr.length; i++) {
        var eventName = eventsArr[i];
        tocada = {
          ...tocada,
          distance: {
            x: Math.abs(deltaX),
            y: Math.abs(deltaY),
            absolute: absoluteDistance,
          },
          endingElement: document.elementFromPoint(currX, currY),
          touchDuration,
          velocity: absoluteDistance / (now - tocada.touchStartTime),
          touchEndTime: now,
        };
        sendEvent(e.target, eventName, e, tocada);
      }
      // reset the tap counter
      tapNum = 0;
    } else {
      if (
        cachedX >= currX - defaults.tapPrecision &&
        cachedX <= currX + defaults.tapPrecision &&
        cachedY >= currY - defaults.tapPrecision &&
        cachedY <= currY + defaults.tapPrecision
      ) {
        if (timestamp + defaults.tapThreshold - now >= 0) {
          // Here you get the Tap event
          sendEvent(
            e.target,
            tapNum >= 2 && target === e.target
              ? defaults.namespace + "dbltap"
              : defaults.namespace + "tap",
            e
          );
          target = e.target;
        }
      }

      // reset the tap counter
      dblTapTimer = setTimeout(function () {
        tapNum = 0;
      }, defaults.dbltapThreshold);
    }
  }
  function onTouchMove(e) {
    if (!isTheSameFingerId(e)) return;
    // skip the mouse move events if the touch events were previously detected
    if (e.type === "mousemove" && wasTouch) return;

    var pointer = getPointerEvent(e);
    currX = pointer.pageX;
    currY = pointer.pageY;
  }

  //setting the events listeners
  // we need to debounce the callbacks because some devices multiple events are triggered at same time
  setListener(
    doc,
    touchevents.touchstart + (defaults.justTouchEvents ? "" : " mousedown"),
    onTouchStart
  );
  setListener(
    doc,
    touchevents.touchend + (defaults.justTouchEvents ? "" : " mouseup"),
    onTouchEnd
  );
  setListener(
    doc,
    touchevents.touchmove + (defaults.justTouchEvents ? "" : " mousemove"),
    onTouchMove
  );

  // Configure the tocca default options at any time
  win.tocada = function (options) {
    for (var opt in options) {
      defaults[opt] = options[opt];
    }

    return defaults;
  };
})(document, window);
