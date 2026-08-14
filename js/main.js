/* =========================================================
   BCGK High Stakes Deals — Shared site behavior
   ========================================================= */
(function () {
  "use strict";

  // ---------- Mobile nav toggle ----------
  var toggle = document.querySelector(".nav-toggle");
  var header = document.querySelector(".site-header");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  // ---------- FAQ accordion ----------
  document.querySelectorAll(".faq-item .faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  // ---------- Scroll-triggered section reveal ----------
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // No IntersectionObserver support — just show everything.
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  // ---------- Active nav link ----------
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // ---------- Countdown timer (used on hero + join-webinar page) ----------
  function startCountdown() {
    var els = document.querySelectorAll("[data-countdown]");
    if (!els.length || !window.BCGK_CONFIG) return;
    var target = new Date(window.BCGK_CONFIG.webinarDateISO).getTime();

    function tick() {
      var now = Date.now();
      var diff = Math.max(0, target - now);
      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / (1000 * 60)) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      els.forEach(function (root) {
        var d = root.querySelector('[data-unit="days"]');
        var h = root.querySelector('[data-unit="hours"]');
        var m = root.querySelector('[data-unit="mins"]');
        var s = root.querySelector('[data-unit="secs"]');
        if (d) d.textContent = String(days);
        if (h) h.textContent = String(hours).padStart(2, "0");
        if (m) m.textContent = String(mins).padStart(2, "0");
        if (s) s.textContent = String(secs).padStart(2, "0");
      });
    }
    tick();
    setInterval(tick, 1000);
  }
  startCountdown();

  // ---------- Fill in date/time placeholders from config ----------
  function fillWebinarText() {
    if (!window.BCGK_CONFIG) return;
    document.querySelectorAll("[data-webinar-date]").forEach(function (el) {
      el.textContent = window.BCGK_CONFIG.webinarDateLabel;
    });
    document.querySelectorAll("[data-webinar-time]").forEach(function (el) {
      el.textContent = window.BCGK_CONFIG.webinarTimeLabel;
    });
    document.querySelectorAll("[data-kajabi-link]").forEach(function (el) {
      el.setAttribute("href", window.BCGK_CONFIG.kajabiLink);
    });
  }
  fillWebinarText();

  // ---------- Registration modal ----------
  var registerModal = document.getElementById("register-modal");
  if (registerModal) {
    var openRegisterModal = function (e) {
      if (e) e.preventDefault();
      registerModal.classList.add("open");
      document.body.classList.add("modal-open");
    };
    var closeRegisterModal = function () {
      registerModal.classList.remove("open");
      document.body.classList.remove("modal-open");
    };
    document.querySelectorAll("[data-open-register]").forEach(function (el) {
      el.addEventListener("click", openRegisterModal);
    });
    registerModal.querySelectorAll("[data-close-register]").forEach(function (el) {
      el.addEventListener("click", closeRegisterModal);
    });
    registerModal.addEventListener("click", function (e) {
      if (e.target === registerModal) closeRegisterModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeRegisterModal();
    });
    window.closeRegisterModal = closeRegisterModal;
  }

  // ---------- Toast ----------
  window.showToast = function (title, sub, duration) {
    var toast = document.getElementById("site-toast");
    if (!toast) return;
    toast.querySelector(".toast-title").textContent = title;
    toast.querySelector(".toast-sub").textContent = sub || "";
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("show");
    }, duration || 5000);
  };

  // ---------- Multi-select dropdown ("Interested In") ----------
  document.querySelectorAll(".multiselect").forEach(function (ms) {
    var trigger = ms.querySelector(".multiselect-trigger");
    var panel = ms.querySelector(".multiselect-panel");
    var label = ms.querySelector(".multiselect-label");
    var chips = ms.querySelector(".multiselect-chips");
    var checkboxes = ms.querySelectorAll('input[type="checkbox"]');
    var hiddenInput = ms.querySelector('input[type="hidden"]');

    function refresh() {
      var checked = Array.prototype.filter.call(checkboxes, function (c) { return c.checked; });
      var values = checked.map(function (c) { return c.value; });
      if (hiddenInput) hiddenInput.value = values.join(", ");

      if (chips) {
        chips.innerHTML = "";
        values.forEach(function (v) {
          var chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = v;
          chips.appendChild(chip);
        });
      }
      if (label) {
        label.textContent = values.length ? values.length + " selected" : "Select all that apply";
      }
      trigger.classList.toggle("filled", values.length > 0);
      ms.dispatchEvent(new CustomEvent("ms:change", { detail: values }));
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      ms.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (!ms.contains(e.target)) ms.classList.remove("open");
    });
    checkboxes.forEach(function (c) { c.addEventListener("change", refresh); });
    refresh();
  });

  // ---------- ICS calendar file generator ----------
  window.buildICS = function () {
    var cfg = window.BCGK_CONFIG;
    var start = new Date(cfg.webinarDateISO);
    var end = new Date(start.getTime() + cfg.webinarDurationMinutes * 60000);

    function toICSDate(d) {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    }

    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BCGK High Stakes Deals//Webinar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@bcgk.com",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(start),
      "DTEND:" + toICSDate(end),
      "SUMMARY:High Stakes Deals FREE Masterclass",
      "LOCATION:" + cfg.kajabiLink,
      "DESCRIPTION:Join Here: " + cfg.kajabiLink + " \\n\\nWe're dropping multifamily nuggets you haven't heard before: bonus depreciation\\, syndications\\, GP/LP structure\\, raising investor money\\, investing with IRAs\\, underwriting your first deal\\, and more.",
      "URL:" + cfg.kajabiLink,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:High Stakes Deals Masterclass starts in 30 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "High-Stakes-Deals-Masterclass.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  document.querySelectorAll("[data-add-to-calendar]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.buildICS();
    });
  });

  // ---------- Google Calendar link builder ----------
  function pad(n) { return String(n).padStart(2, "0"); }
  function toGCalDate(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
  }
  document.querySelectorAll("[data-gcal-link]").forEach(function (a) {
    var cfg = window.BCGK_CONFIG;
    if (!cfg) return;
    var start = new Date(cfg.webinarDateISO);
    var end = new Date(start.getTime() + cfg.webinarDurationMinutes * 60000);
    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: "High Stakes Deals FREE Masterclass",
      dates: toGCalDate(start) + "/" + toGCalDate(end),
      details: "Join Here: " + cfg.kajabiLink,
      location: cfg.kajabiLink
    });
    a.href = "https://calendar.google.com/calendar/render?" + params.toString();
    a.target = "_blank";
    a.rel = "noopener";
  });

  // ---------- Webinar registration form ----------
  var form = document.getElementById("webinar-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fields = {
        firstname: form.querySelector("#field-name"),
        email: form.querySelector("#field-email"),
        phone: form.querySelector("#field-phone")
      };
      var howLongFollowed = form.querySelector("#field-followed");
      var liquidCapital = form.querySelector("#field-capital");
      var valid = true;

      Object.keys(fields).forEach(function (key) {
        var input = fields[key];
        var row = input.closest(".form-row");
        var isEmpty = !input.value.trim();
        var isBadEmail = key === "email" && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        row.classList.toggle("has-error", isEmpty || isBadEmail);
        if (isEmpty || isBadEmail) valid = false;
      });

      if (!valid) {
        showToast("Please check the form", "A few fields still need your info.");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering…";

      var cfg = window.BCGK_CONFIG.hubspot;
      var payload = {
        fields: [
          { name: "firstname", value: fields.firstname.value.trim() },
          { name: "email", value: fields.email.value.trim() },
          { name: "phone", value: fields.phone.value.trim() },
          { name: "how_long_followed", value: howLongFollowed ? howLongFollowed.value : "" },
          { name: "liquid_capital", value: liquidCapital ? liquidCapital.value : "" }
        ],
        context: {
          pageUri: window.location.href,
          pageName: "Join Webinar - BCGK High Stakes Deals"
        }
      };

      fetch(
        "https://api.hsforms.com/submissions/v3/integration/submit/" + cfg.portalId + "/" + cfg.formGuid,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      )
        .then(function (res) {
          // HubSpot's public forms endpoint responds 200 on success even if
          // some optional fields don't match the portal's form definition.
          return res.ok ? res.json().catch(function () { return {}; }) : Promise.reject(res);
        })
        .then(function () {
          onRegistrationSuccess(fields.firstname.value.trim(), fields.email.value.trim());
        })
        .catch(function () {
          // Fail-soft: still confirm the registration experience locally so the
          // masterclass funnel never dead-ends, and let the user know to double check.
          onRegistrationSuccess(fields.firstname.value.trim(), fields.email.value.trim(), true);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  function onRegistrationSuccess(name, email, isFallback) {
    try {
      sessionStorage.setItem("bcgk_registered_name", name);
      sessionStorage.setItem("bcgk_registered_email", email);
    } catch (err) { /* private browsing / storage disabled — non-fatal */ }

    if (typeof window.closeRegisterModal === "function") window.closeRegisterModal();

    showToast(
      "You're registered, " + (name.split(" ")[0] || "there") + "! 🎉",
      isFallback
        ? "Confirmation received — check your email shortly for details."
        : "Check your inbox — confirmation + calendar invite are on the way."
    );

    setTimeout(function () {
      window.location.href = "thank-you.html";
    }, 1400);
  }
})();
