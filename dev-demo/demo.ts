import Tocada from "./../dist/index";
import { version } from "../package.json";
const touchArea = document.getElementById("touchArea");
const debugEl = document.getElementById("debug");
const versionEl = document.getElementById("version");

const destroyBtn = document.getElementById("destroy");

const start = document.createElement("p");
start.textContent = new Date().toISOString();
debugEl!.appendChild(start);

versionEl!.textContent = version;

try {
  const swipeHandler = new Tocada(touchArea!);
  const eventNames = [
    "swipe",
    "swipeleft",
    "swiperight",
    "swipeup",
    "swipedown",
    "pinch",
    "spread",
    "gesture",
  ];

  console.log(swipeHandler);

  destroyBtn!.addEventListener("click", () => {
    swipeHandler.destroy();
  });

  eventNames.forEach((eventName) => {
    touchArea!.addEventListener(eventName, (e) => {
      console.log(e);
      const eventLi = document.createElement("li");
      eventLi.textContent = e.type;
      debugEl!.insertAdjacentElement("afterbegin", eventLi);
    });
  });
} catch (e) {
  const errEl = document.createElement("p");
  errEl.textContent = e.message;
  debugEl!.appendChild(errEl);
}
