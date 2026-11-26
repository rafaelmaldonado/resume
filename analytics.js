(() => {
  // Limit production events to the published CV, excluding embedded previews.
  if (location.origin !== "https://rafaelmaldonado.github.io" ||
      !/^\/resume\/(?:index\.html)?$/.test(location.pathname) || window.top !== window) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === "1") return;

  const token = "phc_vZ2Yw6iy5soyWxxBhNCHZJuA9TNEuTyy2QL7MnFs2ESa";
  const apiHost = "https://us.i.posthog.com";
  const choiceKey = "rafael-resume-analytics";
  const panel = document.getElementById("analytics-preferences");
  const settings = document.getElementById("privacy-settings");
  const replay = document.getElementById("analytics-replay");
  const ownerExcluded = new URLSearchParams(location.search).get("analytics") === "off";
  let choice;
  let sdk;
  let loading = false;
  let restoreFocus = false;

  try {
    if (ownerExcluded) localStorage.setItem(choiceKey, "off");
    choice = localStorage.getItem(choiceKey);
  } catch {
    // If storage is unavailable, the choice applies to the current page.
  }

  const allowed = () => !ownerExcluded && (choice === "analytics" || choice === "replay");

  function showPreferences(open) {
    replay.checked = choice === "replay";
    panel.hidden = !open;
    settings.setAttribute("aria-expanded", String(open));
    if (restoreFocus) {
      (open ? panel.querySelector("button") : settings).focus();
      if (!open) restoreFocus = false;
    }
  }

  function cleanUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin === location.origin ? url.origin + url.pathname : url.origin;
      }
    } catch {
      // PostHog uses non-URL markers such as "$direct".
    }
    return value === "$direct" ? value : "";
  }

  function cleanEventUrls(properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === "string" && /(?:url|referrer)$/.test(key)) {
        properties[key] = cleanUrl(value);
      } else if (value && typeof value === "object" && (key === "$set" || key === "$set_once")) {
        cleanEventUrls(value);
      }
    }
  }

  function startAnalytics() {
    if (loading || sdk || !allowed()) return;
    loading = true;
    const script = document.createElement("script");
    script.src = "https://us-assets.i.posthog.com/static/1/array.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.onerror = () => { loading = false; script.remove(); };
    script.onload = () => {
      loading = false;
      if (!allowed() || !window.posthog?.init) return;
      sdk = window.posthog.init(token, {
        api_host: apiHost,
        person_profiles: "never",
        persistence: "localStorage",
        respect_dnt: true,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: true,
        capture_performance: false,
        disable_surveys: true,
        disable_session_recording: choice !== "replay",
        enable_recording_console_log: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: "*",
          blockSelector: ".ph-no-capture, a[href^='mailto:']",
          recordBody: false,
          recordHeaders: false,
          maskCapturedNetworkRequestFn: request => ({ ...request, name: cleanUrl(request.name) })
        },
        before_send: event => {
          if (!allowed() || (event?.event === "$snapshot" && choice !== "replay")) return null;
          if (event?.properties) cleanEventUrls(event.properties);
          return event;
        }
      });
      sdk?.opt_in_capturing({ captureEventName: false });
      measureReading();
    };
    document.head.append(script);
  }

  function applyChoice(value) {
    choice = value;
    showPreferences(false);
    if (allowed()) {
      if (sdk) {
        sdk.set_config({ disable_session_recording: choice !== "replay" });
        sdk.opt_in_capturing({ captureEventName: false });
        scheduleReading();
      } else {
        startAnalytics();
      }
      return;
    }
    sdk?.stopSessionRecording();
    sdk?.opt_out_capturing();
    section = "";
  }

  const cv = document.getElementById("cv-content");
  const sections = [...cv.querySelectorAll(":scope > .hero, :scope > .skills, :scope > .content-section")];
  const milestones = [25, 50, 75, 100];
  let section = "";
  let sectionStart = 0;
  let frame = 0;

  function endSection() {
    const seconds = Math.floor((performance.now() - sectionStart) / 1000);
    if (section && seconds >= 1 && allowed()) {
      sdk?.capture("cv_section_viewed", { section, visible_seconds: seconds }, { transport: "sendBeacon", send_instantly: true });
    }
    section = "";
  }

  function measureReading() {
    frame = 0;
    if (!sdk || !allowed() || document.hidden || cv.hidden) return;
    const readingLine = window.innerHeight * 0.4;
    const visible = sections.find(element => {
      const { top, bottom } = element.getBoundingClientRect();
      return top <= readingLine && bottom > readingLine;
    });
    let current = "";
    if (visible) current = visible.id || (visible.classList.contains("hero") ? "intro" : "skills");
    if (current !== section) {
      endSection();
      section = current;
      sectionStart = performance.now();
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    while (maxScroll > 0 && milestones.length && window.scrollY + 1 >= maxScroll * milestones[0] / 100) {
      sdk.capture("cv_scroll_depth", { percent: milestones.shift() });
    }
  }

  function scheduleReading() {
    if (sdk && allowed() && !frame) frame = requestAnimationFrame(measureReading);
  }

  document.addEventListener("click", event => {
    if (!sdk || !allowed() || event.defaultPrevented) return;
    const link = event.target.closest?.("a");
    if (!link) return;
    const options = { transport: "sendBeacon", send_instantly: true };
    if (link.id === "hero-download" || link.id === "hero-text") {
      sdk.capture("cv_download_clicked", { format: link.id === "hero-download" ? "pdf" : "txt" }, options);
    } else if (link.matches("a[href^='mailto:']")) {
      sdk.capture("cv_contact_clicked", { placement: link.id === "hero-email" ? "hero" : "contact" }, options);
    } else if (link.matches(".credential-card a")) {
      const credential = link.closest(".credential-card").querySelector("h3").textContent;
      sdk.capture("cv_credential_clicked", { credential }, options);
    }
  });
  window.addEventListener("scroll", scheduleReading, { passive: true });
  window.addEventListener("resize", scheduleReading);
  window.addEventListener("pagehide", endSection);
  window.addEventListener("pageshow", scheduleReading);
  document.addEventListener("cv-content-ready", scheduleReading);
  document.addEventListener("toggle", scheduleReading, true);
  document.addEventListener("visibilitychange", () => document.hidden ? endSection() : scheduleReading());
  window.addEventListener("storage", event => {
    if (event.key === choiceKey || event.key === null) applyChoice(event.newValue);
  });

  if (ownerExcluded) return;
  settings.hidden = false;
  settings.addEventListener("click", () => {
    restoreFocus = true;
    showPreferences(panel.hidden);
  });
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") showPreferences(false);
  });
  document.getElementById("analytics-choice").addEventListener("submit", event => {
    event.preventDefault();
    const value = event.submitter?.value === "allow" ? (replay.checked ? "replay" : "analytics") : "off";
    try {
      localStorage.setItem(choiceKey, value);
    } catch {
      // Keep the choice in memory for this visit.
    }
    applyChoice(value);
  });

  if (allowed()) startAnalytics();
  else if (choice !== "off") showPreferences(true);
})();
