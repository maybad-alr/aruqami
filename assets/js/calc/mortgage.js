/* حاسبة التمويل العقاري */
(function () {
  'use strict';

  function pmt(principal, annualRate, months, method) {
    if (method === 'flat') {
      var years = months / 12;
      var profit = principal * (annualRate / 100) * years;
      var total = principal + profit;
      return { payment: total / months, total: total, profit: profit };
    }
    var r = annualRate / 100 / 12;
    var payment = r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
    var total = payment * months;
    return { payment: payment, total: total, profit: total - principal };
  }

  AQ.register('mortgage', {
    compute: function (v) {
      var price = Number(v.price);
      var down = Math.max(0, Number(v.downPayment) || 0);
      var rate = Math.max(0, Number(v.rate) || 0);
      var years = AQ.clamp(Number(v.years) || 25, 1, 30);
      var method = v.method || 'annuity';

      if (!(price > 0)) {
        return {
          primary: { label: 'القسط الشهري', value: '—', format: 'raw', sub: 'أدخل قيمة العقار لعرض النتيجة.' },
          notes: [{ text: 'أدخل قيمة العقار والدفعة الأولى.', tone: 'warn' }]
        };
      }
      if (down >= price) {
        return {
          primary: { label: 'القسط الشهري', value: 0, format: 'currency', unit: 'ريال', sub: 'لا يوجد تمويل — الدفعة الأولى تغطي كامل القيمة.' },
          notes: [{ text: 'الدفعة الأولى تساوي قيمة العقار أو تتجاوزها، فلا حاجة للتمويل.' }]
        };
      }

      var principal = price - down;
      var months = Math.round(years * 12);
      var res = pmt(principal, rate, months, method);
      var ltv = (principal / price) * 100;
      var tax = price * 0.05;

      var notes = [
        { text: 'ضريبة التصرفات العقارية <strong>5%</strong> من قيمة العقار، ولا تُموَّل عادةً مع التمويل العقاري. ويُعفى المواطن غالبًا عند شراء مسكنه الأول — تحقق من هيئة الزكاة والضريبة والجمارك.' },
        { text: 'الطريقة المتناقصة (القسط الثابت) هي الأكثر استخدامًا لدى البنوك؛ أما طريقة الربح المسطح فتُحسب فيها الأرباح على كامل المبلغ طوال المدة وتكون التكلفة أعلى غالبًا.' }
      ];
      if (ltv > 85) {
        notes.push({ text: 'نسبة التمويل ' + AQ.pct(ltv, 1) + ' من قيمة العقار مرتفعة؛ الحد المتعارف عليه للمسكن الأول للمواطنين يصل إلى 85% بالاستفادة من الدعم السكني.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'القسط الشهري',
          value: res.payment,
          format: 'currency',
          unit: 'ريال',
          sub: 'مبلغ التمويل ' + AQ.money0(principal) + ' ر.س على ' + AQ.num(years, 0) + ' سنة بنسبة ' + AQ.num(rate, 2) + '٪'
        },
        stats: [
          { label: 'مبلغ التمويل', value: principal, format: 'currency0', unit: 'ر.س' },
          { label: 'إجمالي الربح', value: res.profit, format: 'currency0', unit: 'ر.س', tone: 'warn' },
          { label: 'نسبة التمويل', value: ltv, format: 'percent', tone: ltv > 85 ? 'warn' : 'good' }
        ],
        breakdownTitle: 'تفصيل التمويل',
        breakdown: [
          { label: 'قيمة العقار', value: price, format: 'currency', unit: 'ر.س' },
          { label: 'الدفعة الأولى', value: down, format: 'currency', unit: 'ر.س' },
          { label: 'مبلغ التمويل', value: principal, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي المدفوعات', value: res.total, format: 'currency', unit: 'ر.س', total: true },
          { label: 'ضريبة التصرفات العقارية (5%)', value: tax, format: 'currency', unit: 'ر.س', hint: 'غير مضمّنة في قسط التمويل' }
        ],
        bars: [
          { label: 'أصل مبلغ التمويل', value: principal, format: 'currency' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', tone: 'accent' }
        ],
        tables: [{
          title: 'جدول السداد السنوي',
          columns: ['السنة', 'من أصل المبلغ (ر.س)', 'الأرباح (ر.س)', 'إجمالي المدفوع (ر.س)', 'الرصيد المتبقي (ر.س)'],
          rows: AQ.amortization(principal, rate, months, method).map(function (y) {
            return [y.year, AQ.money0(y.principal), AQ.money0(y.profit), AQ.money0(y.payment), AQ.money0(y.closing)];
          })
        }],
        notes: notes
      };
    }
  });
})();
