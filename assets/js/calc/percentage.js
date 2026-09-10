/* حاسبة النسبة المئوية */
(function () {
  'use strict';

  function need(msg) {
    return {
      primary: { label: 'النتيجة', value: '—', format: 'raw', sub: 'أكمل الحقول المطلوبة.' },
      notes: [{ text: msg, tone: 'warn' }]
    };
  }

  AQ.register('percentage', {
    compute: function (v) {
      var mode = v.mode || 'of';
      var percent = Number(v.percent);
      var base = Number(v.base);
      var part = Number(v.part);
      var whole = Number(v.whole);
      var from = Number(v.from);
      var to = Number(v.to);
      var up = v.direction !== 'down';

      if (mode === 'of') {
        if (!isFinite(percent) || !isFinite(base)) return need('أدخل النسبة والرقم لحساب قيمة النسبة.');
        var out = base * percent / 100;
        return {
          primary: { label: percent + '٪ من ' + AQ.money0(base) + ' ر.س', value: out, format: 'currency', unit: 'ريال' },
          stats: [
            { label: 'النسبة', value: percent, format: 'raw', unit: '٪' },
            { label: 'الرقم', value: base, format: 'currency0', unit: 'ر.س' },
            { label: 'قيمة النسبة', value: out, format: 'currency', unit: 'ر.س' }
          ],
          breakdownTitle: 'تفصيل الحساب',
          breakdown: [
            { label: 'الرقم', value: base, format: 'currency', unit: 'ر.س' },
            { label: 'النسبة المطبّقة', value: percent, format: 'raw', unit: '٪' },
            { label: 'قيمة النسبة', value: out, format: 'currency', unit: 'ر.س', total: true },
            { label: 'المتبقي من الرقم', value: base - out, format: 'currency', unit: 'ر.س' }
          ],
          bars: [
            { label: 'قيمة النسبة', value: out, format: 'currency' },
            { label: 'المتبقي', value: base - out, format: 'currency', tone: 'line' }
          ],
          notes: [{ text: 'لاستخراج الضريبة أو الخصم من فاتورة، استخدم وضع «زيادة أو نقصان» أو حاسبة ضريبة القيمة المضافة.' }]
        };
      }

      if (mode === 'ratio') {
        if (!isFinite(part) || !isFinite(whole) || whole === 0) return need('أدخل الجزء والكل (ولا يكون الكل صفرًا).');
        var pct = (part / whole) * 100;
        return {
          primary: { label: 'النسبة من الكل', value: pct, format: 'percent' },
          stats: [
            { label: 'الجزء', value: part, format: 'currency0', unit: 'ر.س' },
            { label: 'الكل', value: whole, format: 'currency0', unit: 'ر.س' },
            { label: 'النسبة', value: pct, format: 'percent' }
          ],
          breakdownTitle: 'تفصيل الحساب',
          breakdown: [
            { label: 'الجزء', value: part, format: 'currency', unit: 'ر.س' },
            { label: 'الكل', value: whole, format: 'currency', unit: 'ر.س' },
            { label: 'النسبة', value: pct, format: 'percent2', total: true },
            { label: 'المتبقي', value: whole - part, format: 'currency', unit: 'ر.س', hint: (100 - pct).toFixed(1) + '٪ من الكل' }
          ],
          bars: [
            { label: 'الجزء', value: part, format: 'currency' },
            { label: 'المتبقي', value: Math.max(0, whole - part), format: 'currency', tone: 'line' }
          ],
          notes: [{ text: 'مثال عملي: 2,500 من 10,000 = 25٪.' }]
        };
      }

      if (mode === 'change') {
        if (!isFinite(from) || !isFinite(to) || from === 0) return need('أدخل القيمة الأصلية والقيمة الجديدة (والأصلية ليست صفرًا).');
        var diff = to - from;
        var changePct = (diff / from) * 100;
        var grew = diff >= 0;
        return {
          primary: { label: 'نسبة التغير', value: changePct, format: 'percent', sub: grew ? 'ارتفاع' : 'انخفاض' },
          stats: [
            { label: 'مقدار التغير', value: diff, format: 'currency', unit: 'ر.س', tone: grew ? 'good' : 'bad' },
            { label: 'القيمة الأصلية', value: from, format: 'currency0', unit: 'ر.س' },
            { label: 'القيمة الجديدة', value: to, format: 'currency0', unit: 'ر.س' }
          ],
          breakdownTitle: 'تفصيل التغير',
          breakdown: [
            { label: 'القيمة الأصلية', value: from, format: 'currency', unit: 'ر.س' },
            { label: 'القيمة الجديدة', value: to, format: 'currency', unit: 'ر.س' },
            { label: 'مقدار التغير', value: diff, format: 'currency', unit: 'ر.س' },
            { label: 'نسبة التغير', value: changePct, format: 'percent2', total: true }
          ],
          bars: [
            { label: 'الأصلية', value: from, format: 'currency', tone: 'line' },
            { label: 'الجديدة', value: to, format: 'currency', tone: grew ? '' : 'accent' }
          ],
          notes: [{ text: 'يُحسب التغير دائمًا على أساس القيمة الأصلية، وهو المعنى المتعارف عليه في الأسعار والأداء.' }]
        };
      }

      /* adjust */
      if (!isFinite(percent) || !isFinite(base)) return need('أدخل الرقم والنسبة لحساب الزيادة أو النقصان.');
      var delta = base * percent / 100;
      var result = up ? base + delta : base - delta;
      return {
        primary: {
          label: up ? 'القيمة بعد الزيادة' : 'القيمة بعد النقصان',
          value: result,
          format: 'currency',
          unit: 'ريال',
          sub: (up ? 'زيادة ' : 'نقصان ') + AQ.money(delta) + ' ر.س بنسبة ' + AQ.num(percent, 2) + '٪'
        },
        stats: [
          { label: 'القيمة الأصلية', value: base, format: 'currency0', unit: 'ر.س' },
          { label: 'مقدار التغير', value: delta, format: 'currency', unit: 'ر.س', tone: up ? 'good' : 'warn' },
          { label: 'القيمة النهائية', value: result, format: 'currency', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل الحساب',
        breakdown: [
          { label: 'القيمة الأصلية', value: base, format: 'currency', unit: 'ر.س' },
          { label: 'نسبة التعديل', value: percent, format: 'raw', unit: '٪' },
          { label: 'مقدار التغير', value: delta, format: 'currency', unit: 'ر.س' },
          { label: 'القيمة النهائية', value: result, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'القيمة الأصلية', value: base, format: 'currency', tone: 'line' },
          { label: up ? 'الزيادة' : 'النقصان', value: delta, format: 'currency', tone: up ? '' : 'accent' }
        ],
        notes: [{
          text: up
            ? 'مثال: خدمة بسعر 1,000 ر.س عليها ضريبة 15٪ ← الناتج 1,150 ر.س.'
            : 'مثال: سلعة بـ 800 ر.س وعليها خصم 25٪ ← الناتج 600 ر.س.'
        }]
      };
    }
  });
})();
