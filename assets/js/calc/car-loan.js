/* حاسبة تمويل السيارات */
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

  AQ.register('car-loan', {
    compute: function (v) {
      var price = Number(v.price);
      var down = Math.max(0, Number(v.downPayment) || 0);
      var rate = Math.max(0, Number(v.rate) || 0);
      var months = AQ.clamp(Math.round(Number(v.months) || 60), 6, 120);
      var method = v.method || 'annuity';
      var fees = Math.max(0, Number(v.fees) || 0);

      if (!(price > 0)) {
        return {
          primary: { label: 'القسط الشهري', value: '—', format: 'raw', sub: 'أدخل سعر السيارة لعرض النتيجة.' },
          notes: [{ text: 'أدخل سعر السيارة والدفعة الأولى.', tone: 'warn' }]
        };
      }
      if (down >= price) {
        return {
          primary: { label: 'القسط الشهري', value: 0, format: 'currency', unit: 'ريال', sub: 'لا يوجد تمويل.' },
          notes: [{ text: 'الدفعة الأولى تغطي كامل سعر السيارة.' }]
        };
      }

      var principal = price - down;
      var res = pmt(principal, rate, months, method);
      var totalWithFees = res.total + fees;

      var notes = [
        { text: 'الطريقة المتناقصة تُحسب فيها الأرباح على الرصيد المتبقي، وهي الأقل تكلفة. أما الربح المسطح فيُحسب على كامل المبلغ طوال المدة.' },
        { text: 'أضف رسوم التأمين الشامل والرسوم الإدارية في حقل الرسوم للحصول على التكلفة الكاملة.' }
      ];
      if (method === 'flat') {
        notes.push({ text: 'انتبه: التمويل بطريقة الربح المسطح يرفع التكلفة الإجمالية بشكل ملحوظ مقارنة بالطريقة المتناقصة.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'القسط الشهري',
          value: (totalWithFees) / months,
          format: 'currency',
          unit: 'ريال',
          sub: 'مبلغ التمويل ' + AQ.money0(principal) + ' ر.س على ' + AQ.num(months, 0) + ' شهرًا'
        },
        stats: [
          { label: 'مبلغ التمويل', value: principal, format: 'currency0', unit: 'ر.س' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency0', unit: 'ر.س', tone: 'warn' },
          { label: 'التكلفة الإجمالية', value: totalWithFees, format: 'currency0', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل التمويل',
        breakdown: [
          { label: 'سعر السيارة', value: price, format: 'currency', unit: 'ر.س' },
          { label: 'الدفعة الأولى', value: down, format: 'currency', unit: 'ر.س' },
          { label: 'مبلغ التمويل', value: principal, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', unit: 'ر.س' },
          { label: 'الرسوم والتأمين', value: fees, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي المدفوعات', value: totalWithFees, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'أصل مبلغ التمويل', value: principal, format: 'currency' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    }
  });
})();
