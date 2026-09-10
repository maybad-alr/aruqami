/* حاسبة ضريبة القيمة المضافة */
(function () {
  'use strict';

  AQ.register('vat', {
    compute: function (v) {
      var amount = Number(v.amount);
      var rate = Number(v.rate) || 0;
      var mode = v.mode || 'exclude';

      if (v.amount === null || v.amount === '' || !(amount >= 0)) {
        return {
          primary: { label: 'المبلغ', value: '—', format: 'raw', sub: 'أدخل المبلغ لحساب الضريبة.' },
          notes: [{ text: 'أدخل المبلغ المطلوب.', tone: 'warn' }]
        };
      }

      var base, vatAmount, total;
      if (mode === 'include') {
        total = amount;
        base = amount / (1 + rate / 100);
        vatAmount = total - base;
      } else {
        base = amount;
        vatAmount = amount * rate / 100;
        total = base + vatAmount;
      }

      var notes = [
        { text: 'النسبة الأساسية في السعودية <strong>15%</strong>. الإمارات 5%، البحرين 10%، عُمان 5%، وقطر لا تطبّق ضريبة القيمة المضافة حاليًا.' }
      ];
      if (rate === 0) {
        notes.push({ text: 'النسبة المختارة 0% — تأكد من أنها الفئة الصحيحة (معفاة أم صفرية) لمنشأتك.', tone: 'warn' });
      }

      return {
        primary: {
          label: mode === 'include' ? 'المبلغ قبل الضريبة' : 'الإجمالي شامل الضريبة',
          value: mode === 'include' ? base : total,
          format: 'currency',
          unit: 'ريال',
          sub: 'ضريبة القيمة المضافة: ' + AQ.money(vatAmount) + ' ر.س بنسبة ' + AQ.num(rate, 0) + '٪'
        },
        stats: [
          { label: 'المبلغ قبل الضريبة', value: base, format: 'currency', unit: 'ر.س' },
          { label: 'الضريبة', value: vatAmount, format: 'currency', unit: 'ر.س' },
          { label: 'الإجمالي شامل الضريبة', value: total, format: 'currency', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل الفاتورة',
        breakdown: [
          { label: 'المبلغ الأساسي', value: base, format: 'currency', unit: 'ر.س' },
          { label: 'ضريبة القيمة المضافة (' + AQ.num(rate, 0) + '٪)', value: vatAmount, format: 'currency', unit: 'ر.س' },
          { label: 'الإجمالي', value: total, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'المبلغ الأساسي', value: base, format: 'currency' },
          { label: 'الضريبة', value: vatAmount, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    }
  });
})();
