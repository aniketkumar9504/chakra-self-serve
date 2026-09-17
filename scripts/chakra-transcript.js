// Chakra live-transcription animation + the header V1/V2 background toggle.

// V1/V2 toggle: V1 = Chakra background glow, V2 = plain white (`no-gradient`).
(function () {
  var toggle = document.querySelector(".ver-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".ver-toggle__btn");
    if (!btn) return;
    document.body.classList.toggle("no-gradient", btn.dataset.ver === "2");
    var btns = toggle.querySelectorAll(".ver-toggle__btn");
    for (var b = 0; b < btns.length; b++) {
      var active = btns[b] === btn;
      btns[b].classList.toggle("is-active", active);
      btns[b].setAttribute("aria-pressed", active ? "true" : "false");
    }
  });
})();

// Live-transcription animation.
(function () {
  // Respect reduced-motion: reveal the whole conversation at once with the
  // full text static — no typing, no waveform motion.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var all = document.querySelectorAll(".msg");
    for (var m = 0; m < all.length; m++) all[m].classList.add("is-revealed");
    return;
  }

  // Reserve each bubble at its final size with a hidden sizer, then blank
  // the visible layer so it can be transcribed in when it's this message's
  // turn. Runs up front for every message so nothing shows early.
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

    var wave = msg.querySelector(".wave");
    return {
      msg: msg,
      full: full,
      live: live,
      bars: wave ? wave.querySelectorAll("span") : [],
    };
  }

  // Cancellable timers, so the whole sequence can be cut short the instant
  // the user engages with the form.
  var timers = [];
  var finished = false;
  function later(fn, ms) {
    var t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }

  function play(ctx, onDone) {
    if (!ctx) {
      if (onDone) onDone();
      return;
    }
    // The message appears and its waveform springs to life — this speaker
    // is "talking" while their words are transcribed.
    ctx.msg.classList.add("is-revealed");
    ctx.msg.classList.add("is-speaking");

    // Stream a word at a time (each keeps its trailing space); the .tw-word
    // CSS animation fades each one in, so the text flows in continuously.
    var words = ctx.full.match(/\S+\s*/g) || [ctx.full];
    var i = 0;

    function type() {
      if (i < words.length) {
        var wordEl = document.createElement("span");
        wordEl.className = "tw-word";
        wordEl.textContent = words[i];
        ctx.live.appendChild(wordEl);
        var word = words[i];
        i++;

        var delay = 112 + Math.random() * 44; // ~112–156ms between words
        if (/[.,?!]["')\]]?\s*$/.test(word)) delay += 200; // brief pause after punctuation
        later(type, delay);
      } else {
        ctx.msg.classList.remove("is-speaking"); // speech ends, waveform settles
        if (onDone) later(onDone, 380);
      }
    }
    type();
  }

  // Candidate (msg--in) speaks first, then Chakra (msg--out) replies.
  var first = prepare(document.querySelector(".msg--in"));
  var second = prepare(document.querySelector(".msg--out"));
  var intro = document.querySelector(".chakra__intro");
  var chakra = document.querySelector(".chakra");

  function startConversation() {
    play(first, function () {
      play(second);
    });
  }

  // Guardrail: the moment the user engages — focuses/clicks the form or
  // scrolls — (or after a hard cap) snap everything to its finished state
  // and stop all motion, so the animation never competes with sign-up.
  function finish() {
    if (finished) return;
    finished = true;
    for (var t = 0; t < timers.length; t++) clearTimeout(timers[t]);
    timers = [];
    if (intro) {
      intro.classList.remove("is-rising");
      intro.style.transform = "";
    }
    [first, second].forEach(function (ctx) {
      if (!ctx) return;
      ctx.msg.classList.add("is-revealed");
      ctx.msg.classList.remove("is-speaking");
      ctx.live.textContent = ctx.full; // show full text, no per-word animation
    });
  }

  var form = document.querySelector(".form");
  if (form) {
    form.addEventListener("focusin", finish, { once: true });
    form.addEventListener("pointerdown", finish, { once: true });
  }
  window.addEventListener("scroll", finish, { once: true, passive: true });
  later(finish, 9000); // safety cap: never keep animating past ~9s

  if (intro && chakra) {
    // Land with the Chakra logo centered in the panel, then let it rise to
    // the top to reveal the conversation below. Measure now (bubbles already
    // reserve their space) and set the centered offset with no transition.
    var offset =
      (chakra.getBoundingClientRect().height - intro.getBoundingClientRect().height) / 2;
    intro.style.transform = "translateY(" + offset + "px)";

    later(function () {
      if (finished) return;
      intro.classList.add("is-rising"); // enable the transition, then rise up
      void intro.offsetWidth; // flush styles so the change animates
      intro.style.transform = "";
      later(startConversation, 640); // begin once the logo has settled
    }, 600);
  } else {
    later(startConversation, 400);
  }
})();
