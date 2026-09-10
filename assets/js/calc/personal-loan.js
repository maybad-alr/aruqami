/* حاسبة القرض الشخصي */
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

  AQ.register('personal-loan', {
    compute: function (v) {
      var amount = Number(v.amount);
      var rate = Math.max(0, Number(v.rate) || 0);
      var months = AQ.clamp(Math.round(Number(v.months) || 36), 6, 120);
      var method = v.method || 'annuity';
      var fees = Math.max(0, Number(v.fees) || 0);
      var income = Math.max(0, Number(v.income) || 0);

      if (!(amount > 0)) {
        return {
          primary: { label: 'القسط الشهري', value: '—', format: 'raw', sub: 'أدخل مبلغ التمويل لعرض النتيجة.' },
          notes: [{ text: 'أدخل مبلغ التمويل المطلوب.', tone: 'warn' }]
        };
      }

      var res = pmt(amount, rate, months, method);
      var totalWithFees = res.total + fees;
      var monthly = totalWithFees / months;
      var dbr = income > 0 ? (monthly / income) * 100 : null;

      var notes = [
        { text: 'نسبة الاستقطاع من الراتب (DBR) لدى البنوك السعودية لا تتجاوز عادةً <strong>33%</strong> من الراتب الشهري للقطاع الخاص و<strong>45%</strong> للمتقاعدين والعسكريين.' }
      ];
      if (dbr !== null) {
        if (dbr > 33) {
          notes.push({ text: 'نسبة الاستقطاع المحسوبة ' + AQ.pct(dbr, 1) + ' تتجاوز الحد المعتاد 33%، وقد يُرفض الطلب أو يُطلب راتب أعلى.', tone: 'warn' });
        } else {
          notes.push({ text: 'نسبة الاستقطاع المحسوبة ' + AQ.pct(dbr, 1) + ' داخل الحد المعتاد.', tone: 'good' });
        }
      }

      return {
        primary: {
          label: 'القسط الشهري',
          value: monthly,
          format: 'currency',
          unit: 'ريال',
          sub: 'على مدى ' + AQ.num(months, 0) + ' شهرًا بنسبة ' + AQ.num(rate, 2) + '٪'
        },
        stats: [
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency0', unit: 'ر.س', tone: 'warn' },
          { label: 'إجمالي السداد', value: totalWithFees, format: 'currency0', unit: 'ر.س' },
          { label: 'نسبة الاستقطاع', value: dbr === null ? '—' : dbr, format: dbr === null ? 'raw' : 'percent', tone: dbr !== null && dbr > 33 ? 'warn' : 'good' }
        ],
        breakdownTitle: 'تفصيل القرض',
        breakdown: [
          { label: 'مبلغ التمويل', value: amount, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', unit: 'ر.س' },
          { label: 'الرسوم الإدارية', value: fees, format: 'currency', unit: 'ر.س' },
          { label: 'إجمالي السداد', value: totalWithFees, format: 'currency', unit: 'ر.س', total: true },
          { label: 'عدد الأقساط', value: months, format: 'raw', unit: 'قسط' }
        ],
        bars: [
          { label: 'أصل مبلغ التمويل', value: amount, format: 'currency' },
          { label: 'إجمالي الأرباح', value: res.profit, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    }
  });
})();
