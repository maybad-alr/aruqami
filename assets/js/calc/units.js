/* محول الوحدات */
(function () {
  'use strict';

  var TABLES = {
    length: {
      title: 'الطول',
      units: [
        { id: 'mm', label: 'مليمتر (mm)', f: 0.001 },
        { id: 'cm', label: 'سنتيمتر (cm)', f: 0.01 },
        { id: 'm', label: 'متر (m)', f: 1 },
        { id: 'km', label: 'كيلومتر (km)', f: 1000 },
        { id: 'in', label: 'إنش (in)', f: 0.0254 },
        { id: 'ft', label: 'قدم (ft)', f: 0.3048 },
        { id: 'yd', label: 'يارد (yd)', f: 0.9144 },
        { id: 'mi', label: 'ميل (mi)', f: 1609.344 },
        { id: 'nmi', label: 'ميل بحري', f: 1852 }
      ],
      def: ['m', 'ft']
    },
    weight: {
      title: 'الوزن',
      units: [
        { id: 'mg', label: 'مليجرام (mg)', f: 0.000001 },
        { id: 'g', label: 'جرام (g)', f: 0.001 },
        { id: 'kg', label: 'كيلوجرام (kg)', f: 1 },
        { id: 't', label: 'طن (t)', f: 1000 },
        { id: 'oz', label: 'أونصة (oz)', f: 0.028349523125 },
        { id: 'lb', label: 'رطل (lb)', f: 0.45359237 },
        { id: 'ct', label: 'قيراط (ct)', f: 0.0002 }
      ],
      def: ['kg', 'lb']
    },
    area: {
      title: 'المساحة',
      units: [
        { id: 'cm2', label: 'سنتيمتر مربع', f: 0.0001 },
        { id: 'm2', label: 'متر مربع', f: 1 },
        { id: 'km2', label: 'كيلومتر مربع', f: 1000000 },
        { id: 'ha', label: 'هكتار', f: 10000 },
        { id: 'ac', label: 'أكر', f: 4046.8564224 },
        { id: 'ft2', label: 'قدم مربع', f: 0.09290304 },
        { id: 'yd2', label: 'يارد مربع', f: 0.83612736 },
        { id: 'mi2', label: 'ميل مربع', f: 2589988.110336 }
      ],
      def: ['m2', 'ft2']
    },
    volume: {
      title: 'الحجم',
      units: [
        { id: 'ml', label: 'مليلتر (ml)', f: 0.001 },
        { id: 'l', label: 'لتر (L)', f: 1 },
        { id: 'm3', label: 'متر مكعب', f: 1000 },
        { id: 'cm3', label: 'سنتيمتر مكعب', f: 0.001 },
        { id: 'galus', label: 'جالون أمريكي', f: 3.785411784 },
        { id: 'galuk', label: 'جالون بريطاني', f: 4.54609 },
        { id: 'qt', label: 'كوارت', f: 0.946352946 },
        { id: 'pt', label: 'باينت', f: 0.473176473 },
        { id: 'cup', label: 'كوب', f: 0.2365882365 },
        { id: 'floz', label: 'أونصة سائلة', f: 0.0295735295625 },
        { id: 'tbsp', label: 'ملعقة كبيرة', f: 0.01478676478125 },
        { id: 'tsp', label: 'ملعقة صغيرة', f: 0.00492892159375 }
      ],
      def: ['l', 'galus']
    },
    speed: {
      title: 'السرعة',
      units: [
        { id: 'ms', label: 'متر/ثانية', f: 1 },
        { id: 'kmh', label: 'كيلومتر/ساعة', f: 0.2777777778 },
        { id: 'mph', label: 'ميل/ساعة', f: 0.44704 },
        { id: 'kn', label: 'عقدة بحرية', f: 0.5144444444 },
        { id: 'fts', label: 'قدم/ثانية', f: 0.3048 }
      ],
      def: ['kmh', 'mph']
    },
    time: {
      title: 'الزمن',
      units: [
        { id: 'ms', label: 'مللي ثانية', f: 0.001 },
        { id: 's', label: 'ثانية', f: 1 },
        { id: 'min', label: 'دقيقة', f: 60 },
        { id: 'hour', label: 'ساعة', f: 3600 },
        { id: 'day', label: 'يوم', f: 86400 },
        { id: 'week', label: 'أسبوع', f: 604800 },
        { id: 'month', label: 'شهر (30 يومًا)', f: 2592000 },
        { id: 'year', label: 'سنة (365 يومًا)', f: 31536000 }
      ],
      def: ['hour', 'min']
    },
    data: {
      title: 'البيانات',
      units: [
        { id: 'byte', label: 'بايت', f: 1 },
        { id: 'kb', label: 'كيلوبايت (KB)', f: 1024 },
        { id: 'mb', label: 'ميجابايت (MB)', f: 1048576 },
        { id: 'gb', label: 'جيجابايت (GB)', f: 1073741824 },
        { id: 'tb', label: 'تيرابايت (TB)', f: 1099511627776 },
        { id: 'bit', label: 'بت (bit)', f: 0.125 }
      ],
      def: ['mb', 'gb']
    },
    temperature: {
      title: 'درجة الحرارة',
      units: [
        { id: 'c', label: 'مئوية (°C)', f: 1 },
        { id: 'f', label: 'فهرنهايت (°F)', f: 1 },
        { id: 'k', label: 'كلفن (K)', f: 1 }
      ],
      def: ['c', 'f']
    }
  };

  function toCelsius(v, id) {
    if (id === 'f') return (v - 32) * 5 / 9;
    if (id === 'k') return v - 273.15;
    return v;
  }

  function fromCelsius(c, id) {
    if (id === 'f') return c * 9 / 5 + 32;
    if (id === 'k') return c + 273.15;
    return c;
  }

  function unitOf(cat, id) {
    var t = TABLES[cat];
    if (!t) return null;
    for (var i = 0; i < t.units.length; i++) if (t.units[i].id === id) return t.units[i];
    return null;
  }

  function convert(cat, from, to, value) {
    if (cat === 'temperature') return fromCelsius(toCelsius(value, from), to);
    var a = unitOf(cat, from), b = unitOf(cat, to);
    if (!a || !b) return NaN;
    return value * a.f / b.f;
  }

  function decimalsFor(n) {
    var a = Math.abs(n);
    if (!isFinite(a)) return 2;
    if (a === 0) return 2;
    if (a >= 1000) return 2;
    if (a >= 100) return 3;
    if (a >= 1) return 4;
    if (a >= 0.001) return 6;
    return 9;
  }

  /* عرض مرن: يحافظ على الدقة المطلوبة ويمنع الأصفار الزائدة */
  function fmtLoose(n) {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('ar-SA-u-nu-latn', { maximumFractionDigits: 6 }).format(n);
  }

  function fmt(n) { return fmtLoose(n); }

  AQ.register('units', {
    compute: function (v) {
      var cat = v.category || 'length';
      var table = TABLES[cat] || TABLES.length;
      var value = Number(v.value);
      var fromId = v.from;
      var toId = v.to;

      if (!fromId || !unitOf(cat, fromId)) fromId = table.def[0];
      if (!toId || !unitOf(cat, toId)) toId = table.def[1];

      if (v.value === null || v.value === '' || isNaN(value)) {
        return {
          primary: { label: 'القيمة المحوَّلة', value: '—', format: 'raw', sub: 'أدخل القيمة المراد تحويلها.' },
          notes: [{ text: 'أدخل القيمة المطلوبة.', tone: 'warn' }]
        };
      }

      var result = convert(cat, fromId, toId, value);
      var reverse = convert(cat, toId, fromId, 1);
      var a = unitOf(cat, fromId), b = unitOf(cat, toId);

      var notes = [
        { text: 'الوحدات المترية (المتر، الكيلوجرام، اللتر) هي الوحدات الرسمية في السعودية ودول الخليج، وتُستخدم الإنش والقدم والرطل في بعض المجالات التقنية.' }
      ];
      if (cat === 'data') {
        notes.push({ text: 'وحدات البيانات محسوبة بالنظام الثنائي (1 كيلوبايت = 1024 بايت) كما تعرضها أنظمة التشغيل.' });
      }
      if (cat === 'temperature') {
        notes.push({ text: 'درجة الحرارة لا تُحوَّل بالضرب بل بمعادلات خاصة بسبب اختلاف نقطتي الصفر والتجمد.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'القيمة المحوَّلة',
          value: fmt(result),
          format: 'raw',
          sub: fmtLoose(value) + ' ' + (a ? a.label : '') + ' = ' + fmt(result) + ' ' + (b ? b.label : '')
        },
        stats: [
          { label: 'القيمة الأصلية', value: fmtLoose(value), format: 'raw', unit: a ? a.label : '' },
          { label: 'القيمة بعد التحويل', value: fmt(result), format: 'raw', unit: b ? b.label : '' },
          { label: 'التحويل العكسي', value: fmtLoose(reverse), format: 'raw', unit: 'لـ 1 ' + (b ? b.label : '') }
        ],
        breakdownTitle: 'تفصيل التحويل',
        breakdown: [
          { label: 'الفئة', value: table.title, format: 'raw' },
          { label: 'من', value: a ? a.label : '—', format: 'raw' },
          { label: 'إلى', value: b ? b.label : '—', format: 'raw' },
          { label: 'القيمة المحوَّلة', value: fmt(result), format: 'raw', unit: b ? b.label : '', total: true }
        ],
        notes: notes
      };
    },

    after: function (panel) {
      var form = panel.querySelector('form');
      if (!form) return;
      var catEl = form.querySelector('[data-field="category"]');
      var fromEl = form.querySelector('[data-field="from"]');
      var toEl = form.querySelector('[data-field="to"]');
      if (!catEl || !fromEl || !toEl) return;

      function fill(select, units, selected) {
        select.innerHTML = units.map(function (u) {
          return '<option value="' + u.id + '"' + (u.id === selected ? ' selected' : '') + '>' + u.label + '</option>';
        }).join('');
      }

      function applyCategory(reset) {
        var cat = catEl.value;
        var table = TABLES[cat] || TABLES.length;
        var keepFrom = !reset && unitOf(cat, fromEl.value) ? fromEl.value : table.def[0];
        var keepTo = !reset && unitOf(cat, toEl.value) ? toEl.value : table.def[1];
        fill(fromEl, table.units, keepFrom);
        fill(toEl, table.units, keepTo);
      }

      catEl.addEventListener('change', function () {
        applyCategory(true);
        form.dispatchEvent(new Event('input'));
      });

      applyCategory(false);
    }
  });
})();
