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
  var tabList = document.querySelector(".product-tabs");
  var tabs = document.querySelectorAll(".product-tabs__tab");
  var hiringPanel = document.getElementById("hiringProducts");
  var communityRadio = document.querySelector(
    '.product-card__input[value="Community"]'
  );
  var lastHiringRadio = document.querySelector(
    "#hiringProducts .product-card__input:checked"
  );
  var activeTab = "hiring";

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

  function syncTabs() {
    tabList.dataset.activeTab = activeTab;
    hiringPanel.hidden = activeTab !== "hiring";

    Array.prototype.forEach.call(tabs, function (tab) {
      var selected = tab.dataset.tab === activeTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;

      if (selected) {
        tab.setAttribute("data-active", "");
      } else {
        tab.removeAttribute("data-active");
      }
    });
  }

  function activeRadio() {
    return activeTab === "developers"
      ? communityRadio
      : lastHiringRadio || document.querySelector(
        "#hiringProducts .product-card__input"
      );
  }

  function syncActiveProductContent() {
    var radio = activeRadio();
    radio.checked = true;
    selectProduct(radio.value);
  }

  function activateTab(tab) {
    activeTab = tab.dataset.tab;
    syncTabs();
    syncActiveProductContent();
  }

  Array.prototype.forEach.call(radios, function (radio) {
    radio.addEventListener("change", function () {
      if (!radio.checked) return;

      if (radio.closest("#hiringProducts")) {
        lastHiringRadio = radio;
      }

      selectProduct(radio.value);
    });
  });

  Array.prototype.forEach.call(tabs, function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });

    tab.addEventListener("keydown", function (event) {
      var nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  syncTabs();
  syncActiveProductContent();
})();
