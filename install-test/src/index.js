import tocca2 from "tocca-2";
window.tocca2({
  namespace: "tocca2:",
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
test.addEventListener("tocca2:tap", updateHtml);
test.addEventListener("tocca2:dbltap", updateHtml);
test.addEventListener("tocca2:longtap", updateHtml);
test.addEventListener("tocca2:longtap", updateHtml);
test.addEventListener("tocca2:swipeup", updateHtml);
test.addEventListener("tocca2:swipedown", updateHtml);
test.addEventListener("tocca2:swipeleft", updateHtml);
test.addEventListener("tocca2:swiperight", updateHtml);
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
