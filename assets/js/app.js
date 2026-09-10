/* ==========================================================================
   أرقامي — shared runtime
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* ---------------- Theme ---------------- */
  var THEME_KEY = 'aruqami-theme';

  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) {
      var dark = theme === 'dark' ||
        (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      meta.setAttribute('content', dark ? '#0d1a1e' : '#0a1f24');
    }
  }

  (function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(stored);

    doc.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme');
        if (!current) {
          current = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    });
  })();

  /* ---------------- Mobile nav ---------------- */
  (function initMobileNav() {
    var toggle = doc.querySelector('[data-nav-toggle]');
    var nav = doc.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;

    var iconMenu = toggle.querySelector('[data-icon="menu"]');
    var iconClose = toggle.querySelector('[data-icon="x"]');

    function setOpen(open) {
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (iconMenu) iconMenu.style.display = open ? 'none' : '';
      if (iconClose) iconClose.style.display = open ? '' : 'none';
    }

    setOpen(false);
    toggle.addEventListener('click', function () { setOpen(nav.hidden); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !nav.hidden) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820 && !nav.hidden) setOpen(false);
    });
  })();

  /* ---------------- Toast ---------------- */
  var toastEl = null;
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  /* ---------------- Formatting ---------------- */
  var CURRENCY = 'ر.س';

  function num(value, decimals) {
    if (value === null || value === undefined || value === '') return '—';
    var n = Number(value);
    /* درع حماية: القيم غير المنتهية أو غير الرقمية تُعرض كشرطة بدل ∞ أو NaN */
    if (!isFinite(n)) return '—';
    var d = decimals === undefined ? 2 : decimals;
    return new Intl.NumberFormat('ar-SA-u-nu-latn', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(n);
  }

  function money(value) { return num(Math.abs(Number(value)) < 1e-9 ? 0 : value, 2); }
  function money0(value) { return num(Math.abs(Number(value)) < 1e-9 ? 0 : value, 0); }

  function pct(value, decimals) {
    if (value === null || value === undefined || !isFinite(Number(value))) return '—';
    var d = decimals === undefined ? 1 : decimals;
    return num(value, d) + '٪';
  }

  function int(value) { return num(value, 0); }

  function formatValue(value, format) {
    switch (format) {
      case 'currency': return money(value);
      case 'currency0': return money0(value);
      case 'percent': return pct(value);
      case 'percent0': return pct(value, 0);
      case 'percent2': return pct(value, 2);
      case 'int': return int(value);
      case 'raw': return String(value);
      default: return num(value, 2);
    }
  }

  /* ---------------- Public API ---------------- */
  var AQ = window.AQ = window.AQ || {};
  AQ.num = num;
  AQ.money = money;
  AQ.money0 = money0;
  AQ.pct = pct;
  AQ.int = int;
  AQ.formatValue = formatValue;
  AQ.toast = toast;
  AQ.currency = CURRENCY;

  AQ.escape = function (str) {
    return String(str === null || str === undefined ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  AQ.clamp = function (v, min, max) {
    if (typeof v !== 'number' || isNaN(v)) return min;
    if (min !== undefined && v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  AQ.round = function (v, d) {
    var f = Math.pow(10, d === undefined ? 2 : d);
    return Math.round((v + Number.EPSILON) * f) / f;
  };

  AQ.parseDate = function (str) {
    if (!str) return null;
    var parts = String(str).split('-');
    if (parts.length !== 3) return null;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  };

  AQ.daysBetween = function (a, b) {
    if (!a || !b) return 0;
    var utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcB - utcA) / 86400000);
  };

  AQ.addDays = function (date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  };

  AQ.formatDate = function (date, opts) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', opts || {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(date);
  };

  AQ.formatDateShort = function (date) {
    if (!date) return '—';
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '/' + m + '/' + d;
  };

  /* Umm al-Qura (Hijri) — supported by all modern browsers. */
  AQ.formatHijri = function (date) {
    if (!date) return '—';
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
        year: 'numeric', month: 'long', day: 'numeric'
      }).format(date);
    } catch (e) {
      return '—';
    }
  };

  AQ.duration = function (days) {
    days = Math.max(0, Math.round(days));
    var years = Math.floor(days / 365.25);
    var rest = days - Math.round(years * 365.25);
    var months = Math.floor(rest / 30.4375);
    var d = Math.round(rest - months * 30.4375);
    var out = [];
    if (years) out.push(years + ' سنة');
    if (months) out.push(months + ' شهر');
    if (d || !out.length) out.push(d + ' يوم');
    return out.join(' و ');
  };

  /* ---------------- Calculator engine ---------------- */
  var registry = {};
  AQ.register = function (slug, definition) { registry[slug] = definition; };

  function readForm(form) {
    var values = {};
    form.querySelectorAll('[data-field]').forEach(function (el) {
      var name = el.getAttribute('data-field');
      var type = el.getAttribute('data-type') || el.type;

      if (el.type === 'checkbox') { values[name] = el.checked; return; }
      if (type === 'radio') {
        if (el.checked) values[name] = el.value;
        else if (!(name in values)) values[name] = null;
        return;
      }
      if (el.type === 'number' || type === 'number') {
        var v = el.value === '' ? NaN : Number(el.value);
        values[name] = isNaN(v) ? null : v;
        return;
      }
      values[name] = el.value;
    });
    return values;
  }

  function renderResult(container, result) {
    if (!result) { container.innerHTML = ''; return; }
    var html = '';

    if (result.primary) {
      var p = result.primary;
      html += '<div class="result-primary">';
      html += '<div class="result-primary-label">' + AQ.escape(p.label) + '</div>';
      html += '<div class="result-primary-value">' + AQ.escape(formatValue(p.value, p.format)) +
        (p.unit ? '<span class="unit">' + AQ.escape(p.unit) + '</span>' : '') + '</div>';
      if (p.sub) html += '<div class="result-primary-sub">' + p.sub + '</div>';
      html += '</div>';
    }

    if (result.stats && result.stats.length) {
      html += '<div class="result-stats">';
      result.stats.forEach(function (s) {
        html += '<div class="stat' + (s.tone ? ' is-' + s.tone : '') + '">';
        html += '<div class="stat-label">' + AQ.escape(s.label) + '</div>';
        html += '<div class="stat-value">' + AQ.escape(formatValue(s.value, s.format)) +
          (s.unit ? '<span class="unit">' + AQ.escape(s.unit) + '</span>' : '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (result.bars && result.bars.length) {
      var max = 0;
      result.bars.forEach(function (b) { max = Math.max(max, Math.abs(Number(b.value) || 0)); });
      html += '<div class="bars">';
      result.bars.forEach(function (b) {
        var w = max > 0 ? Math.max(1.5, Math.abs(Number(b.value) || 0) / max * 100) : 0;
        html += '<div class="bar-row">';
        html += '<div class="bar-head"><span>' + AQ.escape(b.label) + '</span><span class="v">' +
          AQ.escape(formatValue(b.value, b.format)) + '</span></div>';
        html += '<div class="bar-track"><div class="bar-fill' + (b.tone ? ' is-' + b.tone : '') +
          '" style="width:' + w.toFixed(2) + '%"></div></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (result.breakdown && result.breakdown.length) {
      html += '<div class="breakdown"><div class="breakdown-title">' +
        AQ.escape(result.breakdownTitle || 'تفصيل الحساب') + '</div><div class="breakdown-list">';
      result.breakdown.forEach(function (row) {
        html += '<div class="breakdown-row' + (row.total ? ' is-total' : '') + '">';
        html += '<span class="k">' + AQ.escape(row.label) +
          (row.hint ? '<span class="hint">' + AQ.escape(row.hint) + '</span>' : '') + '</span>';
        html += '<span class="v">' + AQ.escape(formatValue(row.value, row.format)) +
          (row.unit ? ' ' + AQ.escape(row.unit) : '') + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    if (result.notes && result.notes.length) {
      html += '<div class="result-notes">';
      result.notes.forEach(function (n) {
        var text = typeof n === 'string' ? n : n.text;
        var tone = typeof n === 'string' ? '' : (n.tone || '');
        html += '<div class="note' + (tone ? ' is-' + tone : '') + '">' +
          '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>' +
          '<span>' + text + '</span></div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;
  }

  function initCalculator() {
    var panel = doc.querySelector('[data-calc]');
    if (!panel) return;

    var slug = panel.getAttribute('data-calc');
    var form = panel.querySelector('form');
    var resultEl = panel.querySelector('[data-result]');
    var def = registry[slug];
    if (!form || !resultEl) return;

    var current = { values: null, result: null };

    function compute() {
      var values = readForm(form);
      current.values = values;
      var result = null;
      try {
        result = def && def.compute ? def.compute(values) : null;
      } catch (err) {
        if (window.console) console.error('[aruqami] compute failed for ' + slug, err);
      }
      current.result = result;
      renderResult(resultEl, result);
      syncUrl(values);
    }

    var raf = null;
    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { raf = null; compute(); });
    }

    form.addEventListener('input', schedule);
    form.addEventListener('change', schedule);
    form.addEventListener('submit', function (e) { e.preventDefault(); compute(); });

    form.querySelectorAll('[data-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        form.querySelectorAll('[data-field]').forEach(function (el) {
          var type = el.getAttribute('data-type') || el.type;
          if (el.type === 'checkbox') {
            el.checked = el.getAttribute('data-default') === 'true';
          } else if (el.tagName === 'SELECT') {
            el.value = el.getAttribute('data-default') || el.options[0].value;
          } else if (type === 'radio') {
            el.checked = el.value === el.getAttribute('data-default');
          } else {
            el.value = el.getAttribute('data-default') || '';
          }
        });
        applyUrlState();
        compute();
        toast('تمت إعادة التعيين');
      });
    });

    /* Shareable URL state */
    var urlTimer = null;
    function syncUrl(values) {
      if (!window.history || !window.history.replaceState) return;
      clearTimeout(urlTimer);
      urlTimer = setTimeout(function () {
        var params = new URLSearchParams();
        Object.keys(values).forEach(function (k) {
          var v = values[k];
          if (v === null || v === '' || v === false) return;
          var el = form.querySelector('[data-field="' + k + '"]');
          var def0 = el ? el.getAttribute('data-default') : null;
          if (def0 !== null && String(v) === String(def0)) return;
          params.set(k, String(v));
        });
        var qs = params.toString();
        var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
        window.history.replaceState(null, '', url);
      }, 400);
    }

    function applyUrlState() {
      var params = new URLSearchParams(window.location.search);
      if (!params.toString()) return;
      form.querySelectorAll('[data-field]').forEach(function (el) {
        var name = el.getAttribute('data-field');
        if (!params.has(name)) return;
        var val = params.get(name);
        var type = el.getAttribute('data-type') || el.type;
        if (el.type === 'checkbox') el.checked = val === 'true' || val === '1';
        else if (type === 'radio') el.checked = el.value === val;
        else el.value = val;
      });
    }

    panel.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        if (action === 'print') window.print();
        else if (action === 'share') copyText(window.location.href, 'تم نسخ رابط النتيجة');
        else if (action === 'copy-link') copyText(window.location.href, 'تم نسخ الرابط');
        else if (action === 'copy-result') copyResult();
      });
    });

    function copyResult() {
      var r = current.result;
      if (!r || !r.primary) { toast('لا يوجد نتيجة لنسخها'); return; }
      var lines = [];
      lines.push('أرقامي — ' + (r.primary.label || ''));
      lines.push('النتيجة: ' + formatValue(r.primary.value, r.primary.format) +
        (r.primary.unit ? ' ' + r.primary.unit : ''));
      if (r.breakdown) {
        lines.push('');
        r.breakdown.forEach(function (row) {
          lines.push(row.label + ': ' + formatValue(row.value, row.format) + (row.unit ? ' ' + row.unit : ''));
        });
      }
      lines.push('');
      lines.push(window.location.href);
      copyText(lines.join('\n'), 'تم نسخ النتيجة');
    }

    function copyText(text, message) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { toast(message); },
          function () { fallbackCopy(text, message); }
        );
      } else {
        fallbackCopy(text, message);
      }
    }

    function fallbackCopy(text, message) {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      doc.body.appendChild(ta);
      ta.select();
      try { doc.execCommand('copy'); toast(message); } catch (e) { toast('تعذّر النسخ'); }
      doc.body.removeChild(ta);
    }

    applyUrlState();
    compute();

    if (def && def.after) {
      try { def.after(panel, current); } catch (e) {}
    }
  }

  /* ---------------- Search dialog ---------------- */
  function initSearch() {
    var dialog = doc.querySelector('[data-search-dialog]');
    if (!dialog) return;

    var input = dialog.querySelector('[data-search-input]');
    var results = dialog.querySelector('[data-search-results]');
    var empty = dialog.querySelector('[data-search-empty]');
    var dataEl = doc.getElementById('search-index');

    var index = [];
    if (dataEl) {
      try { index = JSON.parse(dataEl.textContent); } catch (e) {}
    }

    var activeIndex = 0;
    var visible = [];

    function normalize(str) {
      return String(str || '')
        .toLowerCase()
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    var normIndex = index.map(function (item) {
      return {
        item: item,
        haystack: normalize([item.name, item.short, item.tagline, item.keywords].join(' '))
      };
    });

    function search(query) {
      var q = normalize(query);
      if (!q) return index.slice(0, 8);
      var terms = q.split(' ').filter(Boolean);
      var scored = [];
      normIndex.forEach(function (row) {
        var score = 0;
        var ok = true;
        terms.forEach(function (term) {
          var idx = row.haystack.indexOf(term);
          if (idx === -1) { ok = false; return; }
          score += row.haystack.indexOf(term) === 0 ? 8 : (idx < 12 ? 5 : 3);
        });
        if (!ok) return;
        scored.push({ item: row.item, score: score });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, 9).map(function (s) { return s.item; });
    }

    function render(list) {
      visible = list;
      activeIndex = 0;
      if (!list.length) {
        results.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      results.innerHTML = list.map(function (item, i) {
        return '<a class="dialog-item' + (i === 0 ? ' is-active' : '') + '" href="' + item.url + '" data-idx="' + i + '">' +
          '<span class="dialog-item-icon">' + (item.icon || '') + '</span>' +
          '<span class="dialog-item-text"><strong>' + AQ.escape(item.name) + '</strong>' +
          '<span>' + AQ.escape(item.tagline) + '</span></span></a>';
      }).join('');
    }

    function setActive(i) {
      activeIndex = i;
      results.querySelectorAll('.dialog-item').forEach(function (el, idx) {
        el.classList.toggle('is-active', idx === i);
        if (idx === i && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      });
    }

    function open() {
      if (dialog.hasAttribute('open')) return;
      dialog.setAttribute('open', '');
      input.value = '';
      render(search(''));
      setTimeout(function () { input.focus(); }, 30);
    }

    function close() { dialog.removeAttribute('open'); }

    doc.querySelectorAll('[data-search-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
      if (e.target.closest('.dialog-item')) close();
    });

    input.addEventListener('input', function () { render(search(input.value)); });

    doc.addEventListener('keydown', function (e) {
      var isOpen = dialog.hasAttribute('open');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close(); else open();
        return;
      }
      if (e.key === '/' && !isOpen) {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        open();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIndex + 1, visible.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); }
      else if (e.key === 'Enter') {
        var el = results.querySelectorAll('.dialog-item')[activeIndex];
        if (el) { e.preventDefault(); window.location.href = el.getAttribute('href'); }
      }
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initCalculator();
    initSearch();
    doc.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* Deferred scripts run when readyState is already "interactive" but before
     DOMContentLoaded, so we must wait for that event to let the per-page
     calculator module register first. */
  if (doc.readyState === 'complete') boot();
  else doc.addEventListener('DOMContentLoaded', boot);
})();
