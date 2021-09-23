/**
 * @jest-environment jsdom
 */

require("./index.js");
const { exportAllDeclaration } = require("@babel/types");
const simulant = require("jsdom-simulant");

var testDiv = document.createElement("div"),
  isTouch =
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof DocumentTouch) ||
    !!navigator.pointerEnabled,
  touchend = isTouch ? "touchend" : "mouseup",
  touchmove = isTouch ? "touchmove" : "mousemove",
  touchstart = isTouch ? "touchstart" : "mousedown";

// append the test div into the body
document.body.appendChild(testDiv);

describe("Options", () => {
  test("Tap is fired", () => {
    const fn = jest.fn();
    document.body.addEventListener("tap", fn);
    simulant.fire(testDiv, touchstart, {
      clientX: 99,
      clientY: 99,
    });
    setTimeout(function () {
      simulant.fire(testDiv, touchend, {
        clientX: 99,
        clientY: 99,
      });
    }, 20);

    setTimeout(() => {
      expect(fn).toHaveBeenCalled();
    }, 21);
  });

  test("Event can be namespaced", () => {
    window.tocada({ namespace: "yo:" });
    const fn = jest.fn();
    document.body.addEventListener("yo:tap", fn);
    simulant.fire(testDiv, touchstart, {
      clientX: 99,
      clientY: 99,
    });
    setTimeout(function () {
      simulant.fire(testDiv, touchend, {
        clientX: 99,
        clientY: 99,
      });
    }, 20);

    setTimeout(() => {
      expect(fn).toHaveBeenCalled();
    }, 21);
  });

  test("dbltap fires", () => {
    window.tocada({ namespace: "yo:" });
    const fn = jest.fn();
    document.body.addEventListener("dbltap", fn);
    simulant.fire(testDiv, touchstart, {
      clientX: 99,
      clientY: 99,
    });
    setTimeout(function () {
      simulant.fire(testDiv, touchend, {
        clientX: 99,
        clientY: 99,
      });
      simulant.fire(testDiv, touchstart, {
        clientX: 99,
        clientY: 99,
      });
      setTimeout(function () {
        simulant.fire(testDiv, touchend, {
          clientX: 99,
          clientY: 99,
        });
      }, 20);
    }, 20);

    setTimeout(() => {
      expect(fn).toHaveBeenCalled();
    }, 21);
  });
});
