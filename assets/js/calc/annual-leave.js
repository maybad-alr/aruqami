/* حاسبة الإجازة السنوية وبدل الإجازة */
(function () {
  'use strict';

  AQ.register('annual-leave', {
    compute: function (v) {
      var wage = Number(v.wage);
      var start = AQ.parseDate(v.startDate);
      var end = AQ.parseDate(v.endDate);
      var taken = Math.max(0, Number(v.taken) || 0);

      if (!start || !end || end <= start || !(wage > 0)) {
        return {
          primary: { label: 'رصيد الإجازات', value: '—', format: 'raw', sub: 'أكمل الأجر وتواريخ العمل.' },
          notes: [{ text: 'أدخل الأجر الشهري وتاريخ بداية ونهاية فترة الحساب.', tone: 'warn' }]
        };
      }

      var days = AQ.daysBetween(start, end);
      var years = days / 365;
      var rate = years > 5 ? 30 : 21;
      var accrued = (days / 365) * rate;
      var balance = accrued - taken;
      var daily = wage / 30;
      var value = daily * Math.max(0, balance);

      var notes = [
        { text: 'المادة (109) من نظام العمل: للعامل إجازة سنوية لا تقل عن <strong>21 يومًا</strong>، وتُزاد إلى <strong>30 يومًا</strong> إذا أمضى في خدمة صاحب العمل خمس سنوات متصلة.' },
        { text: 'الاستحقاق محسوب بالتناسب مع المدة الفعلية: (عدد أيام الخدمة ÷ 365) × الاستحقاق السنوي.' },
        { text: 'بدل الإجازة يُحسب على الأجر الفعلي، وأجر اليوم = الأجر الشهري ÷ 30.' }
      ];
      if (years > 5) {
        notes.push({ text: 'أكملت أكثر من خمس سنوات خدمة، فاستحقاقك السنوي 30 يومًا.', tone: 'good' });
      }
      if (balance < 0) {
        notes.push({ text: 'الإجازات التي أخذتها تتجاوز رصيدك المستحق بمقدار ' + AQ.num(Math.abs(balance), 1) + ' يومًا.', tone: 'warn' });
      }
      if (years < 1) {
        notes.push({ text: 'لم تكتمل سنة خدمة بعد؛ الرصيد المعروض استحقاق تناسبي عن المدة الفعلية.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'رصيد الإجازات المتبقي',
          value: AQ.round(balance, 1) + ' يومًا',
          format: 'raw',
          sub: 'قيمته نقديًا ' + AQ.money(value) + ' ر.س'
        },
        stats: [
          { label: 'مدة الخدمة', value: AQ.duration(days), format: 'raw' },
          { label: 'الاستحقاق السنوي', value: rate, format: 'raw', unit: 'يوم/سنة' },
          { label: 'قيمة الرصيد', value: value, format: 'currency', unit: 'ر.س', tone: 'good' }
        ],
        breakdownTitle: 'تفصيل الرصيد',
        breakdown: [
          { label: 'مدة الخدمة', value: AQ.round(years, 2), format: 'raw', unit: 'سنة' },
          { label: 'الاستحقاق السنوي', value: rate, format: 'raw', unit: 'يوم' },
          { label: 'إجمالي الاستحقاق', value: AQ.round(accrued, 1), format: 'raw', unit: 'يوم' },
          { label: 'إجازات مستخدمة', value: taken, format: 'raw', unit: 'يوم' },
          { label: 'الرصيد المتبقي', value: AQ.round(balance, 1), format: 'raw', unit: 'يوم', total: true },
          { label: 'أجر اليوم', value: daily, format: 'currency', unit: 'ر.س' },
          { label: 'قيمة الرصيد نقديًا', value: value, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'إجازات مستخدمة', value: taken, format: 'raw', tone: 'line' },
          { label: 'الرصيد المتبقي', value: Math.max(0, balance), format: 'raw' }
        ],
        notes: notes
      };
    }
  });
})();
