/* محوّل التاريخ الهجري والميلادي — تقويم أم القرى */
(function () {
  'use strict';

  var HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  /* يقرأ المكوّنات الهجرية من التاريخ الميلادي عبر تقويم أم القرى */
  function hijriParts(date) {
    try {
      var parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        year: 'numeric', month: 'numeric', day: 'numeric'
      }).formatToParts(date);
      var out = {};
      parts.forEach(function (p) {
        if (p.type === 'year' || p.type === 'month' || p.type === 'day') {
          out[p.type] = parseInt(p.value, 10);
        }
      });
      return (out.year && out.month && out.day) ? out : null;
    } catch (e) {
      return null;
    }
  }

  /* بحث عن التاريخ الميلادي الموافق لتاريخ هجري محدّد */
  function gregorianForHijri(hy, hm, hd) {
    var epoch = new Date(622, 6, 16).getTime(); /* 16 يوليو 622م — بداية التقويم الهجري */
    var approx = epoch + ((hy - 1) * 354.367 + (hm - 1) * 29.5306 + (hd - 1)) * 86400000;
    var base = new Date(approx);
    base.setHours(12, 0, 0, 0);

    for (var i = -75; i <= 75; i++) {
      var cand = new Date(base.getTime() + i * 86400000);
      cand.setHours(12, 0, 0, 0);
      var h = hijriParts(cand);
      if (h && h.year === hy && h.month === hm && h.day === hd) {
        return new Date(cand.getFullYear(), cand.getMonth(), cand.getDate());
      }
    }
    return null;
  }

  function hijriLabel(h) {
    return h.day + ' ' + HIJRI_MONTHS[h.month - 1] + ' ' + h.year + ' هـ';
  }

  AQ.register('hijri-date', {
    compute: function (v) {
      var mode = v.mode || 'toHijri';

      if (mode === 'toHijri') {
        var g = AQ.parseDate(v.greg);
        if (!g) {
          return {
            primary: { label: 'التاريخ الهجري', value: '—', format: 'raw', sub: 'أدخل تاريخًا ميلاديًا.' },
            notes: [{ text: 'أدخل التاريخ الميلادي للتحويل.', tone: 'warn' }]
          };
        }
        var h = hijriParts(g);
        if (!h) {
          return {
            primary: { label: 'التاريخ الهجري', value: '—', format: 'raw', sub: 'تعذّر التحويل في هذا المتصفح.' },
            notes: [{ text: 'متصفحك لا يدعم تقويم أم القرى. جرّب متصفحًا أحدث.', tone: 'warn' }]
          };
        }

        var weekday = new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long' }).format(g);
        var now = new Date(); now.setHours(0, 0, 0, 0);
        var diffDays = AQ.daysBetween(g, now);

        return {
          primary: {
            label: 'التاريخ الهجري',
            value: hijriLabel(h),
            format: 'raw',
            sub: 'الموافق ' + AQ.formatDate(g) + ' (' + weekday + ')'
          },
          stats: [
            { label: 'اليوم', value: weekday, format: 'raw' },
            { label: 'الشهر الهجري', value: HIJRI_MONTHS[h.month - 1], format: 'raw' },
            { label: 'مقارنة باليوم', value: diffDays === 0 ? 'اليوم' : (diffDays > 0 ? 'قبل ' + diffDays + ' يومًا' : 'بعد ' + Math.abs(diffDays) + ' يومًا'), format: 'raw' }
          ],
          breakdownTitle: 'تفصيل التحويل',
          breakdown: [
            { label: 'التاريخ الميلادي', value: AQ.formatDate(g), format: 'raw' },
            { label: 'اليوم الهجري', value: h.day, format: 'raw', unit: 'يوم' },
            { label: 'الشهر الهجري', value: HIJRI_MONTHS[h.month - 1], format: 'raw' },
            { label: 'السنة الهجرية', value: h.year, format: 'raw', unit: 'هـ' },
            { label: 'التاريخ الهجري الكامل', value: hijriLabel(h), format: 'raw', total: true }
          ],
          notes: [
            { text: 'التحويل يعتمد تقويم <strong>أم القرى</strong> المعتمد رسميًا في السعودية.' },
            { text: 'السنة الهجرية أقصر من الميلادية بنحو 11 يومًا؛ لذلك يتقدّم التاريخ الهجري للميلاد نفسه نحو 11 يومًا كل سنة ميلادية.' }
          ]
        };
      }

      /* Hijri -> Gregorian */
      var hy = Number(v.hy), hm = Number(v.hm), hd = Number(v.hd);
      if (!(hy >= 1300 && hy <= 1600) || !(hm >= 1 && hm <= 12) || !(hd >= 1 && hd <= 30)) {
        return {
          primary: { label: 'التاريخ الميلادي', value: '—', format: 'raw', sub: 'أدخل سنة هجرية بين 1300 و1600 ويومًا بين 1 و30.' },
          notes: [{ text: 'تأكد من صحة التاريخ الهجري المدخل.', tone: 'warn' }]
        };
      }

      var found = gregorianForHijri(hy, hm, hd);
      if (!found) {
        return {
          primary: { label: 'التاريخ الميلادي', value: '—', format: 'raw', sub: 'لم يُعثر على تاريخ مطابق.' },
          notes: [{ text: 'تحقق من صحة اليوم في الشهر الهجري (بعض الشهور 29 يومًا فقط).', tone: 'warn' }]
        };
      }

      var weekdayAr = new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long' }).format(found);
      var now2 = new Date(); now2.setHours(0, 0, 0, 0);
      var d2 = AQ.daysBetween(found, now2);

      return {
        primary: {
          label: 'التاريخ الميلادي',
          value: AQ.formatDate(found),
          format: 'raw',
          sub: weekdayAr + ' — ' + AQ.formatDateShort(found)
        },
        stats: [
          { label: 'اليوم', value: weekdayAr, format: 'raw' },
          { label: 'التاريخ الهجري المدخل', value: hijriLabel({ day: hd, month: hm, year: hy }), format: 'raw' },
          { label: 'مقارنة باليوم', value: d2 === 0 ? 'اليوم' : (d2 > 0 ? 'قبل ' + d2 + ' يومًا' : 'بعد ' + Math.abs(d2) + ' يومًا'), format: 'raw' }
        ],
        breakdownTitle: 'تفصيل التحويل',
        breakdown: [
          { label: 'اليوم الهجري', value: hd, format: 'raw', unit: 'يوم' },
          { label: 'الشهر الهجري', value: HIJRI_MONTHS[hm - 1], format: 'raw' },
          { label: 'السنة الهجرية', value: hy, format: 'raw', unit: 'هـ' },
          { label: 'التاريخ الميلادي', value: AQ.formatDate(found), format: 'raw', total: true },
          { label: 'بصيغة مختصرة', value: AQ.formatDateShort(found), format: 'raw' }
        ],
        notes: [
          { text: 'التحويل من الهجري إلى الميلادي يتم بالبحث عن أقرب موافق في تقويم <strong>أم القرى</strong>، وليس بمعادلة حسابية تقريبية.' },
          { text: 'بدايات الشهور الهجرية تعتمد على الرؤية؛ قد يختلف اليوم في بلد آخر عن تقويم أم القرى بيوم واحد.' }
        ]
      };
    }
  });
})();
