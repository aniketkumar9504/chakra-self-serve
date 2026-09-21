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
  var variantButtons = document.querySelectorAll(
    ".selector-preview__button"
  );
  var selectorViews = document.querySelectorAll("[data-selector-view]");
  var dropdown = document.querySelector(".product-dropdown");
  var dropdownTrigger = document.getElementById("productDropdownTrigger");
  var dropdownMenu = document.getElementById("productDropdownMenu");
  var dropdownOptions = document.querySelectorAll(
    ".product-dropdown__option"
  );
  var dropdownTriggerIcon = document.querySelector(
    ".product-dropdown__trigger-icon"
  );
  var dropdownTriggerName = document.querySelector(
    ".product-dropdown__name"
  );
  var dropdownTriggerDescription = document.querySelector(
    ".product-dropdown__description"
  );
  var communityRadio = document.querySelector(
    '.product-card__input[value="Community"]'
  );
  var lastHiringRadio = document.querySelector(
    "#hiringProducts .product-card__input:checked"
  );
  var activeTab = "hiring";
  var activeVariant = "cards";

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
      syncDropdownSelection(value);
      hide(communityPanel);
      show(form);
    }
  }

  function closeDropdown(returnFocus) {
    dropdownMenu.hidden = true;
    dropdownTrigger.setAttribute("aria-expanded", "false");

    if (returnFocus) dropdownTrigger.focus();
  }

  function selectedOptionIndex() {
    var selectedIndex = 0;

    Array.prototype.forEach.call(dropdownOptions, function (option, index) {
      if (option.getAttribute("aria-selected") === "true") {
        selectedIndex = index;
      }
    });

    return selectedIndex;
  }

  function focusOption(index) {
    var normalized = (index + dropdownOptions.length) % dropdownOptions.length;
    dropdownOptions[normalized].focus();
  }

  function openDropdown(startAtLast) {
    if (activeTab !== "hiring" || activeVariant !== "dropdown") return;

    dropdownMenu.hidden = false;
    dropdownTrigger.setAttribute("aria-expanded", "true");
    focusOption(startAtLast ? dropdownOptions.length - 1 : selectedOptionIndex());
  }

  function radioForProduct(value) {
    var matchingRadio = null;

    Array.prototype.forEach.call(radios, function (radio) {
      if (radio.value === value) matchingRadio = radio;
    });

    return matchingRadio;
  }

  function syncDropdownSelection(value) {
    var selectedOption = null;

    Array.prototype.forEach.call(dropdownOptions, function (option) {
      var selected = option.dataset.productOption === value;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-selected", String(selected));

      if (selected) selectedOption = option;
    });

    if (!selectedOption) return;

    dropdownTriggerIcon.src = selectedOption.dataset.icon;
    dropdownTriggerName.textContent = selectedOption.dataset.productOption;
    dropdownTriggerDescription.textContent = selectedOption.dataset.description;
    dropdownTrigger.setAttribute(
      "aria-label",
      "Change hiring product. Selected: " + selectedOption.dataset.productOption
    );
  }

  function selectDropdownOption(option) {
    var radio = radioForProduct(option.dataset.productOption);

    if (!radio) return;

    radio.checked = true;
    lastHiringRadio = radio;
    selectProduct(radio.value);
    closeDropdown(true);
  }

  function syncVariant() {
    Array.prototype.forEach.call(variantButtons, function (button) {
      var selected = button.dataset.selectorVariant === activeVariant;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    Array.prototype.forEach.call(selectorViews, function (view) {
      view.hidden = view.dataset.selectorView !== activeVariant;
    });

    if (activeVariant !== "dropdown") closeDropdown(false);
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
    closeDropdown(false);
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

  Array.prototype.forEach.call(variantButtons, function (button) {
    button.addEventListener("click", function () {
      activeVariant = button.dataset.selectorVariant;
      syncVariant();
    });
  });

  dropdownTrigger.addEventListener("click", function () {
    if (dropdownMenu.hidden) {
      openDropdown(false);
    } else {
      closeDropdown(false);
    }
  });

  dropdownTrigger.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown(false);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown(true);
    }
  });

  Array.prototype.forEach.call(dropdownOptions, function (option, index) {
    option.addEventListener("click", function () {
      selectDropdownOption(option);
    });

    option.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusOption(index + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusOption(index - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusOption(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusOption(dropdownOptions.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectDropdownOption(option);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown(true);
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target)) closeDropdown(false);
  });

  syncVariant();
  syncTabs();
  syncActiveProductContent();
})();
