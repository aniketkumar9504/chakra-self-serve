// Landing page behaviour:
//  Product selector → reveals the demo form (or the Community sign-up panel)
//  and carries the chosen product through on submit.
(function () {
  "use strict";

  /* ---------------- Product selector ---------------- */
  var form = document.getElementById("demoForm");
  var communityPanel = document.getElementById("communityPanel");
  var hiddenProduct = document.getElementById("selectedProduct");
  var radios = document.querySelectorAll(".product-card__input");

  function show(el) {
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add("is-visible");
    });
  }

  function hide(el) {
    el.hidden = true;
    el.classList.remove("is-visible");
  }

  function selectProduct(value) {
    hiddenProduct.value = value;

    // Community is a sign-up/learn-more flow, not a demo request.
    if (value === "Community") {
      hide(form);
      show(communityPanel);
    } else {
      hide(communityPanel);
      show(form);
    }
  }

  Array.prototype.forEach.call(radios, function (radio) {
    radio.addEventListener("change", function () {
      if (radio.checked) selectProduct(radio.value);
    });
  });

  var preChecked = document.querySelector(".product-card__input:checked");
  if (preChecked) selectProduct(preChecked.value);
})();
