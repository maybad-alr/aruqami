/* حاسبة الزكاة — النقود والذهب والفضة والاستثمارات */
(function () {
  'use strict';

  var NISAB_GOLD = 85;   /* جرامًا */
  var NISAB_SILVER = 595; /* جرامًا */
  var RATE = 0.025;

  AQ.register('zakat', {
    compute: function (v) {
      var cash = Math.max(0, Number(v.cash) || 0);
      var gold = Math.max(0, Number(v.gold) || 0);
      var goldPrice = Math.max(0, Number(v.goldPrice) || 0);
      var silver = Math.max(0, Number(v.silver) || 0);
      var silverPrice = Math.max(0, Number(v.silverPrice) || 0);
      var investments = Math.max(0, Number(v.investments) || 0);
      var receivables = Math.max(0, Number(v.receivables) || 0);
      var debts = Math.max(0, Number(v.debts) || 0);
      var basis = v.nisabBasis || 'gold';

      var goldValue = gold * goldPrice;
      var silverValue = silver * silverPrice;
      var assets = cash + goldValue + silverValue + investments + receivables;
      var net = Math.max(0, assets - debts);
      var nisab = basis === 'silver' ? NISAB_SILVER * silverPrice : NISAB_GOLD * goldPrice;
      var reached = nisab > 0 && net >= nisab;
      var zakat = reached ? net * RATE : 0;

      var notes = [
        { text: 'النصاب هو الحد الأدنى للمال الذي إذا بلغه المسلم وحال عليه الحول (سنة قمرية) وجبت فيه الزكاة، ومقدارها <strong>2.5%</strong> (ربع العُشر).' },
        { text: 'نصاب الذهب 85 جرامًا (ما يعادل 20 مثقالًا)، ونصاب الفضة 595 جرامًا (200 درهم). واختيار نصاب الفضة أعلى احتياطًا لأنه أقل قيمة فيشمل أموالًا أكثر.' },
        { text: 'تُخصم الديون الحالّة عليك، أما الديون التي لك على الآخرين فتضاف إن كانت مرجوة السداد.' }
      ];

      if (!reached && nisab > 0) {
        notes.push({ text: 'صافي مالك ' + AQ.money0(net) + ' ر.س لم يبلغ النصاب (' + AQ.money0(nisab) + ' ر.س)، فلا تجب الزكاة.', tone: 'warn' });
      }
      if (nisab === 0) {
        notes.push({ text: 'أدخل سعر جرام الذهب أو الفضة لحساب النصاب بدقة.', tone: 'warn' });
      }
      notes.push({ text: 'الذهب المتخذ للزينة المباحة فيه خلاف بين الفقهاء؛ الأكثر احتياطًا إخراج زكاته.' });

      var breakdown = [
        { label: 'النقود والمدخرات', value: cash, format: 'currency', unit: 'ر.س' },
        { label: 'قيمة الذهب', value: goldValue, format: 'currency', unit: 'ر.س', hint: AQ.num(gold, 1) + ' جرام × ' + AQ.money(goldPrice) + ' ر.س' },
        { label: 'قيمة الفضة', value: silverValue, format: 'currency', unit: 'ر.س', hint: AQ.num(silver, 1) + ' جرام × ' + AQ.money(silverPrice) + ' ر.س' },
        { label: 'الأسهم والاستثمارات', value: investments, format: 'currency', unit: 'ر.س' },
        { label: 'ديون مرجوة لك', value: receivables, format: 'currency', unit: 'ر.س' },
        { label: 'إجمالي الأصول', value: assets, format: 'currency', unit: 'ر.س' },
        { label: 'الديون الحالّة عليك', value: -debts, format: 'currency', unit: 'ر.س' },
        { label: 'صافي المال الزكوي', value: net, format: 'currency', unit: 'ر.س', total: true },
        { label: 'النصاب', value: nisab, format: 'currency', unit: 'ر.س', hint: basis === 'silver' ? '595 جرام فضة' : '85 جرام ذهب' },
        { label: 'الزكاة الواجبة (2.5%)', value: zakat, format: 'currency', unit: 'ر.س', total: true }
      ];

      return {
        primary: {
          label: 'مقدار الزكاة الواجبة',
          value: zakat,
          format: 'currency',
          unit: 'ريال',
          sub: reached
            ? 'على صافي مال ' + AQ.money0(net) + ' ر.س بلغ النصاب'
            : 'لم يبلغ المال النصاب — لا تجب الزكاة'
        },
        stats: [
          { label: 'صافي المال الزكوي', value: net, format: 'currency0', unit: 'ر.س' },
          { label: 'النصاب', value: nisab, format: 'currency0', unit: 'ر.س' },
          { label: 'الحالة', value: reached ? 'بلغ النصاب' : 'دون النصاب', format: 'raw', tone: reached ? 'good' : 'warn' }
        ],
        breakdownTitle: 'تفصيل الوعاء الزكوي',
        breakdown: breakdown,
        bars: [
          { label: 'الزكاة', value: zakat, format: 'currency' },
          { label: 'المال الباقي', value: Math.max(0, net - zakat), format: 'currency', tone: 'line' }
        ],
        notes: notes
      };
    }
  });
})();
