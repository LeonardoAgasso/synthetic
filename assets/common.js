(function () {
  "use strict";

  var STRINGS = {
    it: {
      "meta.homeTitle": "Synthetic: i brand che usano modelle e modelli generati con l’AI",
      "meta.methodTitle": "Come funziona: Synthetic",
      "nav.home": "Registro",
      "nav.method": "Come funziona",
      "nav.repo": "GitHub",
      "nav.lang": "Lingua",

      "hero.title": "Quali brand usano modelle e modelli generati con l’AI?",
      "hero.intro": "Un registro pubblico dei brand che hanno dichiarato di usare persone generate con l’intelligenza artificiale nella loro pubblicità. Ogni voce ha la sua fonte.",
      "hero.report": "Segnala un brand",
      "hero.method": "Come scegliamo i casi",

      "label.title": "Composizione",
      "label.brands": ["{n} brand", "{n} brand"],
      "label.countries": ["in {n} paese", "in {n} paesi"],
      "label.rule": "Solo casi dichiarati o confermati dal brand.",
      "label.updated": "Aggiornato il {date}",

      "tabs.label": "Mostra",
      "tabs.ai": "Usano modelli AI",
      "tabs.noai": "Hanno scelto di non usarli",

      "filters.search": "Cerca",
      "filters.searchPlaceholder": "Brand, paese, campagna…",
      "filters.sector": "Settore",
      "filters.use": "Uso",
      "filters.year": "Anno",
      "filters.all": "Tutti",
      "filters.clear": "Azzera filtri",

      "results.loading": "Caricamento del registro…",
      "results.count": ["{n} risultato", "{n} risultati"],
      "results.empty": "Nessun brand corrisponde a questi filtri.",
      "results.emptyHint": "Conosci un caso che manca? Segnalalo.",

      "entry.disclosure": "Come l’ha dichiarato",
      "entry.sources": "Fonti",
      "entry.fix": "Segnala un errore",
      "entry.pledge": "Impegno pubblico",

      "error.load": "Non riesco a caricare i dati del registro.",
      "error.loadLocal": "Se hai aperto il file direttamente dal computer, avvia un piccolo server locale: le istruzioni sono nel README.",

      "footer.disclaimer": "Progetto indipendente, non affiliato ai brand citati. I marchi appartengono ai rispettivi titolari. Non pubblichiamo immagini delle campagne: rimandiamo sempre alle fonti.",
      "footer.data": "Scarica i dati",
      "footer.contribute": "Partecipa",
      "footer.report": "Segnala un brand",
      "footer.correct": "Chiedi una correzione",
      "footer.email": "Scrivici",

      "sector.fashion": "Moda",
      "sector.ecommerce": "E-commerce",
      "sector.food": "Cibo e bevande",
      "sector.beauty": "Bellezza",
      "sector.tech": "Tecnologia",
      "sector.auto": "Auto",
      "sector.other": "Altro",

      "use.campaign": "Campagna pubblicitaria",
      "use.social": "Social",
      "use.ecommerce": "Foto prodotto",
      "use.video": "Spot video",
      "use.digital-twins": "Gemelli digitali",
      "use.virtual-influencer": "Influencer virtuale"
    },

    en: {
      "meta.homeTitle": "Synthetic: brands that use AI-generated models",
      "meta.methodTitle": "How it works: Synthetic",
      "nav.home": "Register",
      "nav.method": "How it works",
      "nav.repo": "GitHub",
      "nav.lang": "Language",

      "hero.title": "Which brands use AI-generated models in their ads?",
      "hero.intro": "A public register of brands that have said they use AI-generated people in their advertising. Every entry comes with its source.",
      "hero.report": "Report a brand",
      "hero.method": "How we choose cases",

      "label.title": "Composition",
      "label.brands": ["{n} brand", "{n} brands"],
      "label.countries": ["in {n} country", "in {n} countries"],
      "label.rule": "Only cases the brand disclosed or confirmed.",
      "label.updated": "Updated {date}",

      "tabs.label": "Show",
      "tabs.ai": "Use AI models",
      "tabs.noai": "Pledged not to",

      "filters.search": "Search",
      "filters.searchPlaceholder": "Brand, country, campaign…",
      "filters.sector": "Sector",
      "filters.use": "Use",
      "filters.year": "Year",
      "filters.all": "All",
      "filters.clear": "Clear filters",

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

      "footer.disclaimer": "An independent project, not affiliated with any of the brands listed. Trademarks belong to their owners. We don’t publish campaign images: we always link to the sources.",
      "footer.data": "Download the data",
      "footer.contribute": "Contribute",
      "footer.report": "Report a brand",
      "footer.correct": "Request a correction",
      "footer.email": "Email us",

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
    }
  };

  var SUPPORTED = ["it", "en"];
  var config = window.SITE_CONFIG || {};
  var lang = detectLang();

  function detectLang() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
    try {
      var saved = window.localStorage.getItem("lang");
      if (SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* storage non disponibile: si va avanti */ }
    var browser = (navigator.language || "").slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(browser) !== -1) return browser;
    return SUPPORTED.indexOf(config.defaultLang) !== -1 ? config.defaultLang : "en";
  }

  function t(key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var value = table[key];
    if (value === undefined) value = STRINGS.en[key];
    if (value === undefined) return key;
    if (Array.isArray(value)) {
      var n = vars && typeof vars.n === "number" ? vars.n : 0;
      value = new Intl.PluralRules(lang).select(n) === "one" ? value[0] : value[1];
    }
    if (vars) {
      value = value.replace(/\{(\w+)\}/g, function (m, name) {
        return vars[name] !== undefined ? vars[name] : m;
      });
    }
    return value;
  }

  function has(key) {
    return STRINGS.en[key] !== undefined;
  }

  function repoUrl() {
    return (config.repoUrl || "").replace(/\/+$/, "");
  }

  function reportUrl() {
    return config.reportFormUrl || repoUrl() + "/issues/new?template=nuovo-brand.yml";
  }

  function correctionUrl(entry) {
    var url = repoUrl() + "/issues/new?template=correzione.yml";
    if (entry) {
      url += "&title=" + encodeURIComponent("[Correzione] " + entry.brand) +
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

  function apply() {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang") !== lang;
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
    });

    var titleKey = document.body.getAttribute("data-title");
    if (titleKey) document.title = t(titleKey);

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function setLang(next) {
    if (SUPPORTED.indexOf(next) === -1 || next === lang) return;
    lang = next;
    try { window.localStorage.setItem("lang", lang); } catch (e) { /* ignora */ }

    // Se il link contiene ?lang=, lo aggiorna così chi lo copia condivide la lingua giusta.
    var params = new URLSearchParams(window.location.search);
    if (params.has("lang")) {
      params.set("lang", lang);
      history.replaceState(null, "", window.location.pathname + "?" + params.toString() + window.location.hash);
    }
    apply();
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-set-lang"));
    });
  });

  window.Site = {
    t: t,
    has: has,
    getLang: function () { return lang; },
    correctionUrl: correctionUrl,
    reportUrl: reportUrl
  };

  setLinks();
  apply();
})();
