/* حاسبة العمر والفرق بين تاريخين */
(function () {
  'use strict';

  /* تواريخ بداية كل برج بصيغة (شهر × 100 + يوم) */
  var ZODIAC_STARTS = [
    ['الدلو', 120], ['الحوت', 219], ['الحمل', 321], ['الثور', 420],
    ['الجوزاء', 521], ['السرطان', 621], ['الأسد', 723], ['العذراء', 823],
    ['الميزان', 923], ['العقرب', 1023], ['القوس', 1122], ['الجدي', 1222]
  ];

  function zodiacFor(date) {
    var key = (date.getMonth() + 1) * 100 + date.getDate();
    var sign = 'الجدي'; /* ما قبل 20 يناير يبقى على الجدي */
    for (var i = 0; i < ZODIAC_STARTS.length; i++) {
      if (key >= ZODIAC_STARTS[i][1]) sign = ZODIAC_STARTS[i][0];
    }
    return sign;
  }

  function ageYMD(from, to) {
    var y = to.getFullYear() - from.getFullYear();
    var m = to.getMonth() - from.getMonth();
    var d = to.getDate() - from.getDate();
    if (d < 0) {
      m -= 1;
      d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (m < 0) { y -= 1; m += 12; }
    return { y: y, m: m, d: d };
  }

  var WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  AQ.register('age', {
    compute: function (v) {
      var mode = v.mode || 'age';
      var birth = AQ.parseDate(v.birthDate);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var target = mode === 'diff' ? AQ.parseDate(v.secondDate) : today;

      if (!birth || !target) {
        return {
          primary: { label: mode === 'diff' ? 'الفرق بين التاريخين' : 'العمر', value: '—', format: 'raw', sub: 'أدخل التاريخ المطلوب.' },
          notes: [{ text: 'أدخل التاريخ لحساب النتيجة.', tone: 'warn' }]
        };
      }

      var from = birth;
      var to = target;
      var negative = false;
      if (to < from) { var t = from; from = to; to = t; negative = true; }

      var ymd = ageYMD(from, to);
      var totalDays = AQ.daysBetween(from, to);
      var totalMonths = ymd.y * 12 + ymd.m;
      var totalWeeks = Math.floor(totalDays / 7);
      var totalHours = totalDays * 24;

      var durationText = [];
      if (ymd.y) durationText.push(ymd.y + ' سنة');
      if (ymd.m) durationText.push(ymd.m + ' شهر');
      if (ymd.d || !durationText.length) durationText.push(ymd.d + ' يوم');

      var notes = [
        { text: 'الحساب مبني على التقويم الميلادي، ويُراعي السنوات الكبيسة واختلاف عدد أيام الشهور.' },
        { text: 'التاريخ الهجري محسوب بتقويم <strong>أم القرى</strong> المعتمد في السعودية.' }
      ];
      if (negative) notes.push({ text: 'التاريخ الأول بعد الثاني، وتم احتساب الفرق بينهما دون اعتبار الترتيب.', tone: 'warn' });

      if (mode === 'diff') {
        return {
          primary: {
            label: 'الفرق بين التاريخين',
            value: durationText.join(' و'),
            format: 'raw',
            sub: AQ.formatDate(from) + ' ← ' + AQ.formatDate(to)
          },
          stats: [
            { label: 'إجمالي الأيام', value: totalDays, format: 'raw', unit: 'يوم' },
            { label: 'إجمالي الأسابيع', value: totalWeeks, format: 'raw', unit: 'أسبوع' },
            { label: 'إجمالي الشهور', value: totalMonths, format: 'raw', unit: 'شهر' }
          ],
          breakdownTitle: 'تفصيل المدة',
          breakdown: [
            { label: 'السنوات', value: ymd.y, format: 'raw', unit: 'سنة' },
            { label: 'الشهور', value: ymd.m, format: 'raw', unit: 'شهر' },
            { label: 'الأيام', value: ymd.d, format: 'raw', unit: 'يوم' },
            { label: 'إجمالي الأيام', value: totalDays, format: 'raw', unit: 'يوم', total: true }
          ],
          notes: notes
        };
      }

      /* العمر */
      var next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
      var daysToBirthday = AQ.daysBetween(today, next);
      var turning = next.getFullYear() - birth.getFullYear();

      return {
        primary: {
          label: 'العمر',
          value: durationText.join(' و'),
          format: 'raw',
          sub: 'تاريخ الميلاد: ' + AQ.formatDate(birth) + ' • ' + AQ.formatHijri(birth)
        },
        stats: [
          { label: 'إجمالي الأيام', value: totalDays, format: 'raw', unit: 'يوم' },
          { label: 'إجمالي الأسابيع', value: totalWeeks, format: 'raw', unit: 'أسبوع' },
          { label: 'عيد الميلاد القادم', value: 'بعد ' + daysToBirthday + ' يوم', format: 'raw' }
        ],
        breakdownTitle: 'تفاصيل العمر',
        breakdown: [
          { label: 'السنوات', value: ymd.y, format: 'raw', unit: 'سنة' },
          { label: 'الشهور', value: ymd.m, format: 'raw', unit: 'شهر' },
          { label: 'الأيام', value: ymd.d, format: 'raw', unit: 'يوم' },
          { label: 'إجمالي الشهور', value: totalMonths, format: 'raw', unit: 'شهر' },
          { label: 'إجمالي الساعات', value: totalHours, format: 'raw', unit: 'ساعة' },
          { label: 'يوم الميلاد', value: WEEKDAYS[birth.getDay()], format: 'raw' },
          { label: 'البرج', value: zodiacFor(birth), format: 'raw' },
          { label: 'العمر عند عيد الميلاد القادم', value: turning + ' سنة', format: 'raw', total: true }
        ],
        bars: [
          { label: 'إجمالي السنوات', value: ymd.y, format: 'raw' },
          { label: 'إجمالي الشهور', value: totalMonths, format: 'raw', tone: 'line' }
        ],
        notes: notes
      };
    }
  });
})();
