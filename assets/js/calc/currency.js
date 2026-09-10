/* محول العملات — أسعار حية مع بديل محلي عند تعذر الاتصال */
(function () {
  'use strict';

  /* أسعار احتياطية لكل 1 ريال سعودي (تاريخ تحديث محفوظ). */
  var FALLBACK = {
    SAR: 1, USD: 0.266667, EUR: 0.229215, GBP: 0.196807, AED: 0.979333,
    KWD: 0.082122, QAR: 0.970667, BHD: 0.100267, OMR: 0.102533, JOD: 0.189067,
    EGP: 13.652963, TRY: 12.938152, INR: 25.365165, PKR: 73.992225, IDR: 4667.190263,
    MYR: 1.085085, JPY: 40.954787, CNY: 1.793471, CAD: 0.367848, AUD: 0.369258,
    CHF: 0.215865, MAD: 2.495933, DZD: 35.4726, TND: 0.774139, IQD: 349.666656,
    YER: 63.162991, SDG: 145.183962, BDT: 32.793554, PHP: 16.673161, KRW: 357.01415,
    SGD: 0.337121, HKD: 2.091302, RUB: 22.76268, ZAR: 4.277473, NGN: 353.593661,
    KES: 34.524826
  };

  var cache = {};
  var lastError = false;
  var loading = false;

  function ensure(from, done) {
    if (cache[from] || loading) { if (done) done(); return; }
    loading = true;
    fetch('https://open.er-api.com/v6/latest/' + encodeURIComponent(from))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.rates) { cache[from] = { rates: j.rates, time: j.time_last_update_utc }; lastError = false; }
        else lastError = true;
      })
      .catch(function () { lastError = true; })
      .then(function () { loading = false; if (done) done(); });
  }

  AQ.register('currency', {
    compute: function (v) {
      var amount = Number(v.amount);
      var from = v.from || 'SAR';
      var to = v.to || 'USD';
      var custom = Number(v.customRate);

      if (v.amount === null || v.amount === '' || isNaN(amount)) {
        return {
          primary: { label: 'المبلغ المحوَّل', value: '—', format: 'raw', sub: 'أدخل المبلغ المراد تحويله.' },
          notes: [{ text: 'أدخل المبلغ.', tone: 'warn' }]
        };
      }
      if (!FALLBACK[from] || !FALLBACK[to]) {
        return {
          primary: { label: 'المبلغ المحوَّل', value: '—', format: 'raw', sub: 'اختر عملتين مدعومتين.' },
          notes: [{ text: 'عملة غير مدعومة.', tone: 'warn' }]
        };
      }

      var live = cache[from];
      var rate;
      var source;
      if (custom > 0) {
        rate = custom;
        source = 'custom';
      } else if (live && live.rates[to]) {
        rate = live.rates[to];
        source = 'live';
      } else {
        rate = FALLBACK[to] / FALLBACK[from];
        source = 'fallback';
      }

      var result = amount * rate;
      var inverse = rate > 0 ? 1 / rate : 0;

      function dec(n) {
        var a = Math.abs(n);
        if (a >= 1000) return 2;
        if (a >= 1) return 3;
        return 4;
      }

      var notes = [];
      if (source === 'live') {
        notes.push({ text: 'سعر الصرف محدَّث بتاريخ ' + (live.time || '') + ' من مصدر أسعار مرجعي. الأسعار تتغير لحظيًا وقد يختلف سعر البنك عنها.', tone: 'good' });
      } else if (source === 'custom') {
        notes.push({ text: 'أنت تستخدم سعر صرف مخصص؛ احذف القيمة للعودة إلى السعر المرجعي.' });
      } else {
        notes.push({ text: (lastError
          ? 'تعذّر الوصول إلى أسعار الصرف المباشرة، '
          : 'جارٍ تحميل أسعار الصرف المباشرة، ') + 'ويُعرض حاليًا سعر تقديري. أدخل السعر يدويًا إن أردت قيمة دقيقة.', tone: 'warn' });
      }
      notes.push({ text: 'التحويل للأغراض التقديرية؛ العمليات الفعلية في البنوك تُضاف إليها فروق أسعار ورسوم.' });

      return {
        primary: {
          label: 'المبلغ المحوَّل',
          value: AQ.num(result, dec(result)),
          format: 'raw',
          unit: '',
          sub: AQ.money0(amount) + ' ' + from + ' ← ' + AQ.money(result) + ' ' + to
        },
        stats: [
          { label: 'سعر الصرف', value: AQ.num(rate, 6), format: 'raw', unit: 'لكل ' + from + ' واحد' },
          { label: 'السعر العكسي', value: AQ.num(inverse, 6), format: 'raw', unit: 'لكل ' + to + ' واحد' },
          { label: 'المصدر', value: source === 'live' ? 'سعر مباشر' : (source === 'custom' ? 'سعر مخصص' : 'سعر تقديري'), format: 'raw', tone: source === 'live' ? 'good' : 'warn' }
        ],
        breakdownTitle: 'تفصيل التحويل',
        breakdown: [
          { label: 'المبلغ الأصلي', value: amount, format: 'currency', unit: from },
          { label: 'سعر الصرف', value: AQ.num(rate, 6), format: 'raw', unit: 'لكل ' + from + ' واحد' },
          { label: 'المبلغ بعد التحويل', value: AQ.num(result, dec(result)), format: 'raw', unit: to, total: true }
        ],
        notes: notes
      };
    },

    after: function (panel) {
      var form = panel.querySelector('form');
      if (!form) return;
      var fromEl = form.querySelector('[data-field="from"]');
      var toEl = form.querySelector('[data-field="to"]');
      if (!fromEl) return;

      var refresh = function () {
        ensure(fromEl.value, function () {
          form.dispatchEvent(new Event('input'));
        });
      };
      fromEl.addEventListener('change', refresh);
      if (toEl) toEl.addEventListener('change', refresh);
      refresh();
    }
  });
})();
