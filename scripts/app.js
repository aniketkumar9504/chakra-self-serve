// Landing page behaviour:
//  1. Layout variation toggle (V1 centered / V2 two-column).
//  2. Product selector → reveals the form, carries the product, tailors copy.
(function () {
  "use strict";

  /* ---------------- Layout variation toggle ---------------- */
  var STORAGE_KEY = "demoView";
  var toggleButtons = document.querySelectorAll(".view-toggle__btn");

  function setView(view) {
    if (view !== "v1" && view !== "v2") view = "v1";
    document.body.classList.remove("is-v1", "is-v2");
    document.body.classList.add("is-" + view);

    Array.prototype.forEach.call(toggleButtons, function (btn) {
      var active = btn.getAttribute("data-view") === view;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch (e) {
      /* ignore storage failures (private mode, etc.) */
    }
  }

  Array.prototype.forEach.call(toggleButtons, function (btn) {
    btn.addEventListener("click", function () {
      setView(btn.getAttribute("data-view"));
    });
  });

  var savedView = "v1";
  try {
    savedView = localStorage.getItem(STORAGE_KEY) || "v1";
  } catch (e) {
    /* ignore */
  }
  setView(savedView);

  /* ---------------- Product selector ---------------- */
  var form = document.getElementById("demoForm");
  var hiddenProduct = document.getElementById("selectedProduct");
  var radios = document.querySelectorAll(".product-card__input");

  function selectProduct(value) {
    hiddenProduct.value = value;

    if (form.hidden) {
      form.hidden = false;
      requestAnimationFrame(function () {
        form.classList.add("is-visible");
      });
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
