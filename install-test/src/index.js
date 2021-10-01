import tocada from "tocada";
window.tocada({
  namespace: "tocada:",
});
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
  var code = document.querySelector("code");
  code.textContent = `
  ${JSON.stringify(e.detail, null, 2)}
  ___________________________________

  ${code.textContent}
 
  `;
}
