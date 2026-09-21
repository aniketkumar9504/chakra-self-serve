// Chakra live-transcription animation.
(function () {
  var desktopQuery = window.matchMedia("(min-width: 960px)");
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var initialized = false;
  var finished = false;
  var listenersAttached = false;
  var timers = [];
  var first = null;
  var second = null;
  var intro = document.querySelector(".chakra__intro");
  var chakra = document.querySelector(".chakra");

  function loadDecoration() {
    var decoration = document.querySelector(".chat__decoration[data-src]");
    if (decoration && !decoration.getAttribute("src")) {
      decoration.setAttribute("src", decoration.getAttribute("data-src"));
    }
  }

  function revealStaticMessages() {
    var messages = document.querySelectorAll(".msg");
    for (var i = 0; i < messages.length; i++) {
      messages[i].classList.add("is-revealed");
      messages[i].classList.remove("is-speaking");
    }
  }

  // Reserve each bubble at its final size with a hidden sizer, then blank
  // the visible layer so it can be transcribed in when it is this message's
  // turn. This only runs for the desktop showcase.
  function prepare(msg) {
    if (!msg) return null;
    var bubble = msg.querySelector(".bubble");
    if (!bubble) return null;
    var full = bubble.textContent.replace(/\s+/g, " ").trim();
    bubble.textContent = "";

    var sizer = document.createElement("span");
    sizer.className = "tw-sizer";
    sizer.setAttribute("aria-hidden", "true");
    sizer.textContent = full;

    var live = document.createElement("span");
    live.className = "tw-text";
    live.setAttribute("aria-live", "polite");

    bubble.appendChild(sizer);
    bubble.appendChild(live);

    return {
      msg: msg,
      full: full,
      live: live,
    };
  }

  function later(fn, ms) {
    var timer = setTimeout(fn, ms);
    timers.push(timer);
    return timer;
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function play(ctx, onDone) {
    if (!ctx || finished || !desktopQuery.matches) {
      if (onDone) onDone();
      return;
    }

    ctx.msg.classList.add("is-revealed", "is-speaking");
    var words = ctx.full.match(/\S+\s*/g) || [ctx.full];
    var index = 0;

    function type() {
      if (finished || !desktopQuery.matches) return;

      if (index < words.length) {
        var wordElement = document.createElement("span");
        wordElement.className = "tw-word";
        wordElement.textContent = words[index];
        ctx.live.appendChild(wordElement);

        var word = words[index];
        index++;
        var delay = 112 + Math.random() * 44;
        if (/[.,?!]["')\]]?\s*$/.test(word)) delay += 200;
        later(type, delay);
      } else {
        ctx.msg.classList.remove("is-speaking");
        if (onDone) later(onDone, 380);
      }
    }

    type();
  }

  function startConversation() {
    play(first, function () {
      play(second);
    });
  }

  // The moment the user engages, or the layout stops being desktop-sized,
  // snap the showcase to its stable final state and stop all animation work.
  function finish() {
    if (!initialized) return;
    finished = true;
    clearTimers();

    if (intro) {
      intro.classList.remove("is-rising");
      intro.style.transform = "";
    }

    [first, second].forEach(function (ctx) {
      if (!ctx) return;
      ctx.msg.classList.add("is-revealed");
      ctx.msg.classList.remove("is-speaking");
      ctx.live.textContent = ctx.full;
    });

    revealStaticMessages();
  }

  function attachSafeguards() {
    if (listenersAttached) return;
    listenersAttached = true;

    var form = document.querySelector(".form");
    if (form) {
      form.addEventListener("focusin", finish, { once: true });
      form.addEventListener("pointerdown", finish, { once: true });
    }
    window.addEventListener("scroll", finish, { once: true, passive: true });
  }

  function initializeDesktop() {
    if (!desktopQuery.matches) return;
    loadDecoration();

    if (initialized) {
      revealStaticMessages();
      return;
    }

    initialized = true;
    attachSafeguards();

    if (reducedMotionQuery.matches) {
      finished = true;
      revealStaticMessages();
      return;
    }

    first = prepare(document.querySelector(".msg--in"));
    second = prepare(document.querySelector(".msg--out"));
    later(finish, 9000);

    if (intro && chakra) {
      var offset =
        (chakra.getBoundingClientRect().height -
          intro.getBoundingClientRect().height) /
        2;
      intro.style.transform = "translateY(" + offset + "px)";

      later(function () {
        if (finished || !desktopQuery.matches) return;
        intro.classList.add("is-rising");
        void intro.offsetWidth;
        intro.style.transform = "";
        later(startConversation, 640);
      }, 600);
    } else {
      later(startConversation, 400);
    }
  }

  function handleBreakpointChange(event) {
    if (event.matches) {
      initializeDesktop();
    } else {
      finish();
    }
  }

  desktopQuery.addEventListener("change", handleBreakpointChange);
  initializeDesktop();
})();
