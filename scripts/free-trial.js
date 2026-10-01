// Sequentially reveals each chat message in the Chakra showcase card.
(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var messages = document.querySelectorAll(".chat-card__body .cmsg");
  if (!messages.length) return;

  if (reduce) {
    Array.prototype.forEach.call(messages, function (msg) {
      msg.classList.add("is-in");
    });
    return;
  }

  var START = 350; // ms before the first message appears
  var STEP = 950; // ms between messages

  Array.prototype.forEach.call(messages, function (msg, i) {
    setTimeout(function () {
      msg.classList.add("is-in");
    }, START + i * STEP);
  });
})();
