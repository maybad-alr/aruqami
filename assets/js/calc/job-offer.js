/* مقارنة عرضين وظيفيين */
(function () {
  'use strict';

  var GOSI_EMPLOYEE = 0.0975;
  var GOSI_CAP = 45000;

  function evaluate(salary, bonusMonths, benefits, weeklyHours) {
    salary = Math.max(0, salary || 0);
    bonusMonths = Math.max(0, bonusMonths || 0);
    benefits = Math.max(0, benefits || 0);
    weeklyHours = Math.max(1, weeklyHours || 45);

    var base = salary * 12;
    var bonus = salary * bonusMonths;
    var annualCash = base + bonus + benefits;
    var gosiBase = Math.min(salary, GOSI_CAP);
    var gosi = gosiBase * GOSI_EMPLOYEE * 12;
    var net = annualCash - gosi;
    var hoursPerYear = weeklyHours * 52;
    return {
      annualCash: annualCash,
      gosi: gosi,
      net: net,
      hourly: hoursPerYear > 0 ? net / hoursPerYear : 0,
      monthlyNet: net / 12,
      hoursPerYear: hoursPerYear
    };
  }

  AQ.register('job-offer', {
    compute: function (v) {
      var a = evaluate(Number(v.aSalary), Number(v.aBonus), Number(v.aBenefits), Number(v.aHours));
      var b = evaluate(Number(v.bSalary), Number(v.bBonus), Number(v.bBenefits), Number(v.bHours));

      if (!(Number(v.aSalary) > 0) || !(Number(v.bSalary) > 0)) {
        return {
          primary: { label: 'العرض الأفضل', value: '—', format: 'raw', sub: 'أدخل راتب العرضين للمقارنة.' },
          notes: [{ text: 'أدخل راتب كل عرض لحساب المقارنة.', tone: 'warn' }]
        };
      }

      var diff = a.net - b.net;
      var better = Math.abs(diff) < 1 ? 'both' : (diff > 0 ? 'a' : 'b');
      var winner = better === 'both' ? 'العرضان متقاربان' : (better === 'a' ? 'العرض الأول' : 'العرض الثاني');
      var hourlyDiff = Math.abs(a.hourly - b.hourly);

      var notes = [
        { text: 'المقارنة على أساس <strong>الصافي السنوي</strong>: الراتب الأساسي + المكافأة + المزايا النقدية − استقطاع التأمينات (9.75% بحد أقصى 45,000 ر.س شهريًا).' },
        { text: 'القيمة الفعلية للساعة توضّح الفرق عند اختلاف ساعات العمل: عرض براتب أعلى وساعات أطول قد يكون أقل قيمة للساعة.' },
        { text: 'لا تشمل المقارنة المزايا غير النقدية كالتأمين الطبي والبدلات العينية وبدل السكن؛ أضف قيمتها التقديرية في حقل المزايا النقدية.' }
      ];
      if (better !== 'both' && hourlyDiff > 1) {
        notes.push({
          text: 'لاحظ أن الأفضل بالراتب السنوي هو ' + winner + '، والفرق في قيمة الساعة ' + AQ.money(hourlyDiff) + ' ر.س لصالح ' +
            (a.hourly > b.hourly ? 'العرض الأول' : 'العرض الثاني') + '.',
          tone: 'warn'
        });
      }

      return {
        primary: {
          label: 'الأفضل ماديًا',
          value: winner,
          format: 'raw',
          sub: better === 'both'
            ? 'لا فرق يُذكر بين العرضين'
            : 'بفرق صافي سنوي ' + AQ.money(Math.abs(diff)) + ' ر.س'
        },
        stats: [
          { label: 'صافي العرض الأول سنويًا', value: a.net, format: 'currency0', unit: 'ر.س', tone: better === 'a' ? 'good' : '' },
          { label: 'صافي العرض الثاني سنويًا', value: b.net, format: 'currency0', unit: 'ر.س', tone: better === 'b' ? 'good' : '' },
          { label: 'الفرق السنوي', value: Math.abs(diff), format: 'currency0', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل المقارنة',
        breakdown: [
          { label: 'العرض الأول — إجمالي سنوي', value: a.annualCash, format: 'currency0', unit: 'ر.س' },
          { label: 'العرض الأول — استقطاع التأمينات', value: -a.gosi, format: 'currency0', unit: 'ر.س' },
          { label: 'العرض الأول — الصافي السنوي', value: a.net, format: 'currency0', unit: 'ر.س' },
          { label: 'العرض الثاني — إجمالي سنوي', value: b.annualCash, format: 'currency0', unit: 'ر.س' },
          { label: 'العرض الثاني — استقطاع التأمينات', value: -b.gosi, format: 'currency0', unit: 'ر.س' },
          { label: 'العرض الثاني — الصافي السنوي', value: b.net, format: 'currency0', unit: 'ر.س' }
        ],
        bars: [
          { label: 'صافي العرض الأول', value: a.net, format: 'currency0' },
          { label: 'صافي العرض الثاني', value: b.net, format: 'currency0', tone: 'accent' }
        ],
        tables: [{
          title: 'تفصيل إضافي',
          columns: ['المؤشر', 'العرض الأول', 'العرض الثاني'],
          rows: [
            ['الصافي الشهري', AQ.money0(a.monthlyNet) + ' ر.س', AQ.money0(b.monthlyNet) + ' ر.س'],
            ['قيمة ساعة العمل', AQ.money(a.hourly) + ' ر.س', AQ.money(b.hourly) + ' ر.س'],
            ['ساعات العمل السنوية', AQ.num(a.hoursPerYear, 0) + ' ساعة', AQ.num(b.hoursPerYear, 0) + ' ساعة']
          ]
        }],
        notes: notes
      };
    }
  });
})();
