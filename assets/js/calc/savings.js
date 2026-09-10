/* حاسبة الادخار والاستثمار (الفائدة المركبة) */
(function () {
  'use strict';

  AQ.register('savings', {
    compute: function (v) {
      var initial = Math.max(0, Number(v.initial) || 0);
      var monthly = Math.max(0, Number(v.monthly) || 0);
      var rate = Number(v.rate);
      var inflation = Math.max(0, Number(v.inflation) || 0);
      var years = AQ.clamp(Number(v.years) || 10, 1, 50);

      if (isNaN(rate)) rate = 0;
      if (!(initial > 0) && !(monthly > 0)) {
        return {
          primary: { label: 'القيمة المستقبلية', value: '—', format: 'raw', sub: 'أدخل مبلغًا ابتدائيًا أو ادخارًا شهريًا.' },
          notes: [{ text: 'أدخل المبلغ الابتدائي أو الادخار الشهري.', tone: 'warn' }]
        };
      }

      var months = Math.round(years * 12);
      var i = Math.pow(1 + rate / 100, 1 / 12) - 1;
      var growthFactor = Math.pow(1 + i, months);
      var fvLump = initial * growthFactor;
      var fvMonthly = i === 0 ? monthly * months : monthly * ((growthFactor - 1) / i);
      var fv = fvLump + fvMonthly;
      var contributions = initial + monthly * months;
      var growth = fv - contributions;

      /* حماية من الطفح الرقمي عند إدخال مبالغ ضخمة */
      if (!isFinite(fv) || !isFinite(growth)) {
        return {
          primary: {
            label: 'القيمة المستقبلية',
            value: '—',
            format: 'raw',
            sub: 'المبالغ أو المدة المدخلة كبيرة جدًا لحساب دقيق.'
          },
          notes: [{ text: 'الأرقام المدخلة تتجاوز حدود الحساب الدقيق. قلّل المبلغ الابتدائي أو الادخار الشهري أو عدد السنوات.', tone: 'warn' }]
        };
      }
      var realValue = fv / Math.pow(1 + inflation / 100, years);
      var multiple = contributions > 0 ? AQ.round(fv / contributions, 2) : 0;

      var milestones = [1, 5, 10, 15, 20, 25, 30, 40, 50].filter(function (y) { return y <= years; });
      if (milestones[milestones.length - 1] !== Math.round(years)) milestones.push(Math.round(years));

      var breakdown = milestones.map(function (y) {
        var n = Math.round(y * 12);
        var gf = Math.pow(1 + i, n);
        var bal = initial * gf + (i === 0 ? monthly * n : monthly * ((gf - 1) / i));
        return {
          label: 'بعد ' + AQ.num(y, 0) + ' سنة',
          value: bal,
          format: 'currency0',
          unit: 'ر.س',
          hint: 'المساهمات: ' + AQ.money0(initial + monthly * n) + ' ر.س'
        };
      });

      var notes = [
        { text: 'العائد السنوي في هذه الحاسبة عائد فعّال مركّب شهريًا. العوائد الفعلية تتقلب، والأسواق قد ترتفع أو تنخفض — هذه محاكاة تعليمية لا وعد بعائد.' },
        { text: 'القيمة الحقيقية تعرض ما يعادل المبلغ المستقبلي بقوة شرائية اليوم بعد خصم التضخم.' }
      ];
      if (rate > 15) {
        notes.push({ text: 'عائد سنوي أعلى من 15% مُستبعد استمراره على المدى الطويل في أغلب الأسواق؛ استخدم أرقامًا واقعية للتخطيط.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'القيمة المستقبلية المتوقعة',
          value: fv,
          format: 'currency0',
          unit: 'ريال',
          sub: 'من مساهمات إجمالية ' + AQ.money0(contributions) + ' ر.س خلال ' + AQ.num(years, 0) + ' سنة'
        },
        stats: [
          { label: 'إجمالي المساهمات', value: contributions, format: 'currency0', unit: 'ر.س' },
          { label: 'الأرباح المركّبة', value: growth, format: 'currency0', unit: 'ر.س', tone: 'good' },
          { label: 'مضاعف رأس المال', value: multiple, format: 'raw', unit: '×' }
        ],
        breakdownTitle: 'مسار النمو',
        breakdown: breakdown,
        bars: [
          { label: 'المساهمات', value: contributions, format: 'currency0', tone: 'line' },
          { label: 'الأرباح المركّبة', value: growth, format: 'currency0' }
        ],
        notes: notes
      };
    }
  });
})();
