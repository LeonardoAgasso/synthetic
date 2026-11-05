(function () {
  "use strict";

  var t = Site.t;
  var state = { data: null, category: "ai", q: "", sector: "", use: "", year: "" };

  var els = {
    list: document.getElementById("list"),
    status: document.getElementById("status"),
    count: document.getElementById("count"),
    clear: document.getElementById("clear"),
    search: document.getElementById("search"),
    sector: document.getElementById("filter-sector"),
    use: document.getElementById("filter-use"),
    useWrap: document.getElementById("filter-use-wrap"),
    year: document.getElementById("filter-year"),
    tabs: document.querySelectorAll("[data-category]"),
    labelBrands: document.getElementById("label-brands"),
    labelCountries: document.getElementById("label-countries"),
    labelUpdated: document.getElementById("label-updated"),
    csv: document.getElementById("download-csv")
  };

  // ---------- Utility ----------

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function safeUrl(url) {
    return /^https?:\/\//i.test(url || "") ? url : "#";
  }

  function countryName(code) {
    try {
      return new Intl.DisplayNames([Site.lang], { type: "region" }).of(code) || code;
    } catch (e) {
      return code;
    }
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-").map(Number);
    if (parts.length === 1) return String(parts[0]);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] || 1));
    var options = parts.length === 2
      ? { month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    return new Intl.DateTimeFormat(Site.lang, options).format(date);
  }

  function label(prefix, key) {
    var full = prefix + "." + key;
    return Site.has(full) ? t(full) : key;
  }

  function yearOf(entry) {
    return (entry.date || "").slice(0, 4);
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  // ---------- Data ----------

  function entriesIn(category) {
    return state.data.entries
      .filter(function (e) { return e.category === category; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
  }

  function haystack(entry) {
    return [
      entry.brand,
      entry.note,
      entry.disclosure,
      countryName(entry.country), entry.country,
      label("sector", entry.sector),
      (entry.uses || []).map(function (u) { return label("use", u); }).join(" "),
      (entry.sources || []).map(function (s) { return s.publisher; }).join(" ")
    ].join(" ").toLowerCase();
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return entriesIn(state.category).filter(function (e) {
      if (state.sector && e.sector !== state.sector) return false;
      if (state.use && (e.uses || []).indexOf(state.use) === -1) return false;
      if (state.year && yearOf(e) !== state.year) return false;
      if (q && haystack(e).indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- Rendering ----------

  function fillSelect(select, values, labelFn, current) {
    var html = "<option value=\"\">" + esc(t("filters.all")) + "</option>";
    values.forEach(function (v) {
      html += "<option value=\"" + esc(v) + "\">" + esc(labelFn(v)) + "</option>";
    });
    select.innerHTML = html;
    select.value = values.indexOf(current) !== -1 ? current : "";
    return select.value;
  }

  function renderFilters() {
    var pool = entriesIn(state.category);

    var sectors = unique(pool.map(function (e) { return e.sector; }))
      .sort(function (a, b) { return label("sector", a).localeCompare(label("sector", b), Site.lang); });
    state.sector = fillSelect(els.sector, sectors, function (v) { return label("sector", v); }, state.sector);

    var uses = unique([].concat.apply([], pool.map(function (e) { return e.uses || []; })))
      .sort(function (a, b) { return label("use", a).localeCompare(label("use", b), Site.lang); });
    state.use = fillSelect(els.use, uses, function (v) { return label("use", v); }, state.use);
    els.useWrap.hidden = uses.length === 0;

    var years = unique(pool.map(yearOf)).sort().reverse();
    state.year = fillSelect(els.year, years, String, state.year);
  }

  function renderLabel() {
    var ai = state.data.entries.filter(function (e) { return e.category === "ai"; });
    var brands = unique(ai.map(function (e) { return e.brand; })).length;
    var countries = unique(ai.map(function (e) { return e.country; })).length;
    els.labelBrands.textContent = t("label.brands", { n: brands });
    els.labelCountries.textContent = t("label.countries", { n: countries });
    els.labelUpdated.textContent = t("label.updated", { date: formatDate(state.data.updated) });
  }

  function renderTabs() {
    els.tabs.forEach(function (tab) {
      var category = tab.getAttribute("data-category");
      tab.setAttribute("aria-pressed", String(category === state.category));
      var counter = tab.querySelector(".tab-count");
      if (counter) counter.textContent = entriesIn(category).length;
    });
  }

  function renderEntry(entry, showYear) {
    var meta = [label("sector", entry.sector), countryName(entry.country), formatDate(entry.date)]
      .filter(Boolean).join(", ");

    var tags = entry.category === "no-ai"
      ? [t("entry.pledge")]
      : (entry.uses || []).map(function (u) { return label("use", u); });

    var sources = (entry.sources || []).map(function (s) {
      var year = s.date ? " (" + esc(s.date.slice(0, 4)) + ")" : "";
      return "<a href=\"" + esc(safeUrl(s.url)) + "\" rel=\"noopener\" target=\"_blank\">" + esc(s.publisher) + "</a>" + year;
    }).join(", ");

    return "" +
      "<li class=\"entry\">" +
        "<div class=\"entry-year\" aria-hidden=\"true\">" + (showYear ? esc(yearOf(entry)) : "") + "</div>" +
        "<article class=\"entry-body\">" +
          "<h3 class=\"entry-brand\">" + esc(entry.brand) + "</h3>" +
          "<p class=\"entry-meta\">" + esc(meta) + "</p>" +
          (tags.length ? "<ul class=\"tags\">" + tags.map(function (tag) {
            return "<li class=\"tag\">" + esc(tag) + "</li>";
          }).join("") + "</ul>" : "") +
          "<p class=\"entry-note\">" + esc(entry.note) + "</p>" +
          "<p class=\"entry-detail\"><span class=\"entry-key\">" + esc(t("entry.disclosure")) + "</span> " + esc(entry.disclosure) + "</p>" +
          "<p class=\"entry-detail\"><span class=\"entry-key\">" + esc(t("entry.sources")) + "</span> " + sources + "</p>" +
          "<p class=\"entry-fix\"><a href=\"" + esc(Site.correctionUrl(entry)) + "\" rel=\"noopener\" target=\"_blank\">" + esc(t("entry.fix")) + "</a></p>" +
        "</article>" +
      "</li>";
  }

  function renderList() {
    var items = filtered();
    var active = Boolean(state.q || state.sector || state.use || state.year);

    els.count.textContent = t("results.count", { n: items.length });
    els.clear.hidden = !active;

    if (items.length === 0) {
      els.list.innerHTML = "";
      els.status.hidden = false;
      els.status.innerHTML =
        "<p>" + esc(t("results.empty")) + "</p>" +
        "<p><a href=\"" + esc(Site.reportUrl()) + "\" rel=\"noopener\" target=\"_blank\">" + esc(t("results.emptyHint")) + "</a></p>";
      return;
    }

    els.status.hidden = true;
    var previousYear = null;
    els.list.innerHTML = items.map(function (entry) {
      var year = yearOf(entry);
      var show = year !== previousYear;
      previousYear = year;
      return renderEntry(entry, show);
    }).join("");
  }

  function renderAll() {
    if (!state.data) return;
    renderLabel();
    renderTabs();
    renderFilters();
    renderList();
  }

  function showError() {
    els.list.innerHTML = "";
    els.status.hidden = false;
    var html = "<p>" + esc(t("error.load")) + "</p>";
    if (window.location.protocol === "file:") html += "<p>" + esc(t("error.loadLocal")) + "</p>";
    els.status.innerHTML = html;
    els.count.textContent = "";
  }

  // ---------- CSV ----------

  function toCsv(entries) {
    var columns = ["id", "brand", "category", "sector", "country", "date", "uses",
      "note", "disclosure", "sources"];
    var rows = entries.map(function (e) {
      return [
        e.id, e.brand, e.category, e.sector, e.country, e.date,
        (e.uses || []).join("; "),
        e.note, e.disclosure,
        (e.sources || []).map(function (s) { return s.url; }).join(" ")
      ];
    });
    function cell(v) {
      var s = String(v == null ? "" : v);
      return /[",;\r\n]/.test(s) ? "\"" + s.replace(/"/g, "\"\"") + "\"" : s;
    }
    // The leading BOM makes Excel open accented characters correctly.
    return "\ufeff" + [columns].concat(rows).map(function (r) { return r.map(cell).join(","); }).join("\r\n");
  }

  function downloadCsv() {
    if (!state.data) return;
    var blob = new Blob([toCsv(state.data.entries)], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "synthetic-brands.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ---------- Events ----------

  els.search.addEventListener("input", function () {
    state.q = els.search.value;
    renderList();
  });

  [["sector", els.sector], ["use", els.use], ["year", els.year]].forEach(function (pair) {
    pair[1].addEventListener("change", function () {
      state[pair[0]] = pair[1].value;
      renderList();
    });
  });

  els.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var category = tab.getAttribute("data-category");
      if (category === state.category) return;
      state.category = category;
      state.sector = state.use = state.year = "";
      renderTabs();
      renderFilters();
      renderList();
    });
  });

  els.clear.addEventListener("click", function () {
    state.q = state.sector = state.use = state.year = "";
    els.search.value = "";
    renderFilters();
    renderList();
    els.search.focus();
  });

  els.csv.addEventListener("click", downloadCsv);

  // ---------- Start ----------

  els.status.hidden = false;
  els.status.innerHTML = "<p>" + esc(t("results.loading")) + "</p>";

  fetch("data/brands.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (json) {
      state.data = json;
      renderAll();
    })
    .catch(showError);
})();
