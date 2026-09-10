/* حاسبة هامش الربح والتسعير */
(function () {
  'use strict';

  var VAT = 1.15;

  AQ.register('profit-margin', {
    compute: function (v) {
      var cost = Number(v.cost);
      var target = Number(v.targetMargin);
      var withVat = !!v.vatIncluded;
      var mode = v.mode || 'margin';

      if (!(cost > 0)) {
        return {
          primary: { label: 'هامش الربح', value: '—', format: 'raw', sub: 'أدخل تكلفة الوحدة لعرض النتيجة.' },
          notes: [{ text: 'أدخل تكلفة الوحدة.', tone: 'warn' }]
        };
      }

      var priceExVat, price, profit, marginPct, markupPct, suggested;

      if (mode === 'target') {
        var t = AQ.clamp(target, 0, 95);
        priceExVat = cost / (1 - t / 100);
        price = withVat ? priceExVat * VAT : priceExVat;
        profit = priceExVat - cost;
        marginPct = t;
        markupPct = (profit / cost) * 100;
        suggested = price;
      } else {
        price = Number(v.price);
        if (!(price > 0)) {
          return {
            primary: { label: 'هامش الربح', value: '—', format: 'raw', sub: 'أدخل سعر البيع أو انتقل إلى وضع التسعير المستهدف.' },
            notes: [{ text: 'أدخل سعر البيع للوحدة.', tone: 'warn' }]
          };
        }
        priceExVat = withVat ? price / VAT : price;
        profit = priceExVat - cost;
        marginPct = priceExVat > 0 ? (profit / priceExVat) * 100 : 0;
        markupPct = (profit / cost) * 100;
        suggested = (cost / (1 - 0.3)) * (withVat ? VAT : 1);
      }

      var notes = [
        { text: '<strong>هامش الربح</strong> = الربح ÷ سعر البيع، أما <strong>نسبة الربح على التكلفة</strong> = الربح ÷ التكلفة. الخلط بين الاثنين أشهر خطأ في التسعير.' }
      ];
      if (profit < 0) {
        notes.push({ text: 'الربح بالسالب: سعر البيع أقل من التكلفة، أي أنك تبيع بخسارة.', tone: 'warn' });
      }
      if (withVat) {
        notes.push({ text: 'تم استبعاد ضريبة القيمة المضافة (15%) من سعر البيع قبل حساب الربح، لأن الضريبة ليست إيرادًا لك.' });
      }

      return {
        primary: {
          label: 'هامش الربح على سعر البيع',
          value: marginPct,
          format: 'percent',
          sub: 'ربح ' + AQ.money(profit) + ' ر.س للوحدة على تكلفة ' + AQ.money(cost) + ' ر.س'
        },
        stats: [
          { label: 'الربح للوحدة', value: profit, format: 'currency', unit: 'ر.س', tone: profit < 0 ? 'bad' : 'good' },
          { label: 'نسبة الربح على التكلفة', value: markupPct, format: 'percent' },
          { label: 'سعر بيع لهامش 30%', value: suggested, format: 'currency', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل الوحدة',
        breakdown: [
          { label: 'التكلفة', value: cost, format: 'currency', unit: 'ر.س' },
          { label: 'سعر البيع قبل الضريبة', value: priceExVat, format: 'currency', unit: 'ر.س' },
          { label: 'سعر البيع شامل الضريبة', value: withVat ? price : priceExVat * VAT, format: 'currency', unit: 'ر.س' },
          { label: 'ربح الوحدة', value: profit, format: 'currency', unit: 'ر.س' },
          { label: 'هامش الربح', value: marginPct, format: 'percent2', total: true }
        ],
        bars: [
          { label: 'التكلفة', value: Math.max(0, cost), format: 'currency', tone: 'line' },
          { label: 'الربح', value: Math.max(0, profit), format: 'currency' }
        ],
        notes: notes
      };
    }
  });
})();
