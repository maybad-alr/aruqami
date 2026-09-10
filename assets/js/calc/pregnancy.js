/* حاسبة الحمل وتاريخ الولادة المتوقع */
(function () {
  'use strict';

  AQ.register('pregnancy', {
    compute: function (v) {
      var lmp = AQ.parseDate(v.lmp);
      var cycle = AQ.clamp(Number(v.cycle) || 28, 20, 45);

      if (!lmp) {
        return {
          primary: { label: 'تاريخ الولادة المتوقع', value: '—', format: 'raw', sub: 'أدخل أول يوم من آخر دورة شهرية.' },
          notes: [{ text: 'أدخل تاريخ آخر دورة شهرية لحساب موعد الولادة.', tone: 'warn' }]
        };
      }

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var adjust = cycle - 28;
      var due = AQ.addDays(lmp, 280 + adjust);
      var conception = AQ.addDays(lmp, 14 + adjust);
      var daysPregnant = AQ.daysBetween(lmp, today);
      var weeks = Math.floor(daysPregnant / 7);
      var days = daysPregnant % 7;
      var trimester = weeks < 14 ? 'الثلث الأول' : (weeks < 28 ? 'الثلث الثاني' : 'الثلث الثالث');
      var remaining = AQ.daysBetween(today, due);
      var progress = AQ.clamp(daysPregnant / 280 * 100, 0, 100);

      var notes = [
        { text: 'المدة المعتمدة هي <strong>280 يومًا</strong> (40 أسبوعًا) من أول يوم لآخر دورة، وهي قاعدة «نيغل». ولدورة غير منتظمة يُعدّل التاريخ بفرق عدد الأيام عن 28.' },
        { text: 'هذا تقدير طبي شائع، ويظل التاريخ الفعلي للولادة متغيرًا. الموجات فوق الصوتية في الثلث الأول هي الأدق لتحديد العمر.' },
        { text: 'استشيري طبيب النساء والتوليد لمتابعة الحمل وتفسير أي نتائج.', tone: 'warn' }
      ];

      if (daysPregnant < 0) {
        notes.unshift({ text: 'تاريخ آخر دورة في المستقبل — تحققي من التاريخ المدخل.', tone: 'warn' });
        return {
          primary: { label: 'تاريخ الولادة المتوقع', value: AQ.formatDate(due), format: 'raw', sub: 'تحققي من تاريخ آخر دورة.' },
          notes: notes
        };
      }

      return {
        primary: {
          label: 'تاريخ الولادة المتوقع',
          value: AQ.formatDate(due),
          format: 'raw',
          sub: 'عمر الحمل الآن: <strong>' + weeks + ' أسبوعًا و' + days + ' يومًا</strong> — ' + trimester
        },
        stats: [
          { label: 'عمر الحمل', value: weeks + ' أسبوعًا و' + days + ' يومًا', format: 'raw' },
          { label: 'الأيام المتبقية', value: Math.max(0, remaining), format: 'raw', unit: 'يوم' },
          { label: 'تاريخ الإخصاب التقديري', value: AQ.formatDate(conception), format: 'raw' }
        ],
        breakdownTitle: 'محطات الحمل',
        breakdown: [
          { label: 'أول يوم من آخر دورة', value: AQ.formatDate(lmp), format: 'raw' },
          { label: 'نهاية الثلث الأول (13 أسبوعًا)', value: AQ.formatDate(AQ.addDays(lmp, 91 + adjust)), format: 'raw' },
          { label: 'نهاية الثلث الثاني (27 أسبوعًا)', value: AQ.formatDate(AQ.addDays(lmp, 189 + adjust)), format: 'raw' },
          { label: 'الأسبوع 37 (اكتمال الحمل)', value: AQ.formatDate(AQ.addDays(lmp, 259 + adjust)), format: 'raw' },
          { label: 'تاريخ الولادة المتوقع', value: AQ.formatDate(due), format: 'raw', total: true }
        ],
        bars: [
          { label: 'تقدّم الحمل', value: progress, format: 'raw' },
          { label: 'المتبقي', value: Math.max(0, 100 - progress), format: 'raw', tone: 'line' }
        ],
        notes: notes
      };
    }
  });
})();
