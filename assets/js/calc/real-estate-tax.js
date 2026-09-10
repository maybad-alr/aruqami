/* حاسبة ضريبة التصرفات العقارية */
(function () {
  'use strict';

  var RATE = 0.05;

  AQ.register('real-estate-tax', {
    compute: function (v) {
      var price = Number(v.price);
      var fees = Math.max(0, Number(v.fees) || 0);
      var firstHome = !!v.firstHome;

      if (!(price > 0)) {
        return {
          primary: { label: 'ضريبة التصرفات العقارية', value: '—', format: 'raw', sub: 'أدخل قيمة العقار لحساب الضريبة.' },
          notes: [{ text: 'أدخل قيمة العقار.', tone: 'warn' }]
        };
      }

      var tax = price * RATE;
      var paid = firstHome ? 0 : tax;
      var total = price + paid + fees;

      var notes = [
        { text: 'ضريبة التصرفات العقارية نسبتها <strong>5%</strong> من قيمة العقار، وتُحسب على القيمة المتصرف بها، ويُستحق أغلبها عند نقل الملكية.' },
        { text: 'يستفيد المواطن غالبًا من إعفاء عند شراء مسكنه الأول بشروط محددة؛ يُتحقق منها لدى هيئة الزكاة والضريبة والجمارك قبل إتمام البيع.' }
      ];
      if (firstHome) {
        notes.push({ text: 'تم اختيار «مسكن أول»، فتُعرض الضريبة كإعفاء. تأكد من انطباق شروط الإعفاء عليك قبل الاعتماد على ذلك.', tone: 'warn' });
      }
      notes.push({ text: 'الضريبة معمول بها على التصرفات العقارية كالبيع والشراء والإفراغ، وهي غير ضريبة القيمة المضافة.' });

      return {
        primary: {
          label: firstHome ? 'الضريبة بعد الإعفاء' : 'ضريبة التصرفات العقارية',
          value: paid,
          format: 'currency',
          unit: 'ريال',
          sub: firstHome
            ? 'الضريبة 5% = ' + AQ.money(tax) + ' ر.س، وتُعفى منها كمسكن أول'
            : 'بنسبة 5٪ من قيمة العقار'
        },
        stats: [
          { label: 'قيمة العقار', value: price, format: 'currency0', unit: 'ر.س' },
          { label: 'الضريبة قبل الإعفاء', value: tax, format: 'currency0', unit: 'ر.س' },
          { label: 'إجمالي المطلوب', value: total, format: 'currency0', unit: 'ر.س', tone: firstHome ? 'good' : 'warn' }
        ],
        breakdownTitle: 'تفصيل التكلفة',
        breakdown: [
          { label: 'قيمة العقار', value: price, format: 'currency', unit: 'ر.س' },
          { label: 'ضريبة التصرفات العقارية (5٪)', value: tax, format: 'currency', unit: 'ر.س' },
          { label: 'الإعفاء المطبّق', value: firstHome ? -tax : 0, format: 'currency', unit: 'ر.س' },
          { label: 'رسوم أخرى (تسجيل، سمسرة)', value: fees, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي المطلوب', value: total, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'قيمة العقار', value: price, format: 'currency', tone: 'line' },
          { label: 'الضريبة المستحقة', value: paid, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    }
  });
})();
