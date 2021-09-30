import tocada from "tocada";
window.tocada({
  namespace: "tocada:",
});
var $ = document.querySelector.bind(document),
  eventName = $("#eventName"),
  currX = $("#currX"),
  currY = $("#currY"),
  distanceX = $("#distanceX"),
  distanceY = $("#distanceY"),
  test = $("#test"),
  preventDefault = function (e) {
    e.preventDefault();
  };
test.addEventListener("tocada:tap", updateHtml);
test.addEventListener("tocada:dbltap", updateHtml);
test.addEventListener("tocada:longtap", updateHtml);
test.addEventListener("tocada:longtap", updateHtml);
test.addEventListener("tocada:swipeup", updateHtml);
test.addEventListener("tocada:swipedown", updateHtml);
test.addEventListener("tocada:swipeleft", updateHtml);
test.addEventListener("tocada:swiperight", updateHtml);
test.addEventListener("tocada:swipe", updateHtml);
test.addEventListener("touchmove", preventDefault);
test.addEventListener("touchstart", preventDefault);
test.addEventListener("touchend", preventDefault);
function updateHtml(e) {
  console.log(e);
  e.preventDefault();
  eventName.innerHTML = test.innerHTML = e.type;
  currX.innerHTML = e.x;
  currY.innerHTML = e.y;
  distanceX.innerHTML = e.distance ? e.distance.x : "not available";
  distanceY.innerHTML = e.distance ? e.distance.y : "not available";
}
