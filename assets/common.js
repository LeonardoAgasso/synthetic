(function () {
  "use strict";

  var STRINGS = {
    "label.brands": ["{n} brand", "{n} brands"],
    "label.countries": ["in {n} country", "in {n} countries"],
    "label.updated": "Updated {date}",

    "filters.all": "All",

    "results.loading": "Loading the register…",
    "results.count": ["{n} result", "{n} results"],
    "results.empty": "No brands match these filters.",
    "results.emptyHint": "Know a case that’s missing? Report it.",

    "entry.disclosure": "How it was disclosed",
    "entry.sources": "Sources",
    "entry.fix": "Report an error",
    "entry.pledge": "Public pledge",

    "error.load": "The register data couldn’t be loaded.",
    "error.loadLocal": "If you opened the file straight from your computer, start a small local server: instructions are in the README.",

    "sector.fashion": "Fashion",
    "sector.ecommerce": "E-commerce",
    "sector.food": "Food and drink",
    "sector.beauty": "Beauty",
    "sector.tech": "Tech",
    "sector.auto": "Automotive",
    "sector.other": "Other",

    "use.campaign": "Ad campaign",
    "use.social": "Social media",
    "use.ecommerce": "Product photos",
    "use.video": "Video ad",
    "use.digital-twins": "Digital twins",
    "use.virtual-influencer": "Virtual influencer"
  };

  var LANG = "en";
  var config = window.SITE_CONFIG || {};

  function t(key, vars) {
    var value = STRINGS[key];
    if (value === undefined) return key;
    if (Array.isArray(value)) {
      var n = vars && typeof vars.n === "number" ? vars.n : 0;
      value = new Intl.PluralRules(LANG).select(n) === "one" ? value[0] : value[1];
    }
    if (vars) {
      value = value.replace(/\{(\w+)\}/g, function (m, name) {
        return vars[name] !== undefined ? vars[name] : m;
      });
    }
    return value;
  }

  function has(key) {
    return STRINGS[key] !== undefined;
  }

  function repoUrl() {
    return (config.repoUrl || "").replace(/\/+$/, "");
  }

  function reportUrl() {
    return config.reportFormUrl || repoUrl() + "/issues/new?template=new-brand.yml";
  }

  function correctionUrl(entry) {
    var url = repoUrl() + "/issues/new?template=correction.yml";
    if (entry) {
      url += "&title=" + encodeURIComponent("[Correction] " + entry.brand) +
        "&entry=" + encodeURIComponent(entry.id);
    }
    return url;
  }

  function setLinks() {
    var targets = {
      report: reportUrl(),
      correct: correctionUrl(),
      repo: repoUrl()
    };
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var href = targets[el.getAttribute("data-link")];
      if (href) el.setAttribute("href", href);
    });
    document.querySelectorAll("[data-email]").forEach(function (el) {
      if (config.contactEmail) {
        var a = el.querySelector("a");
        if (a) a.setAttribute("href", "mailto:" + config.contactEmail);
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  window.Site = {
    t: t,
    has: has,
    lang: LANG,
    correctionUrl: correctionUrl,
    reportUrl: reportUrl
  };

  setLinks();
})();
