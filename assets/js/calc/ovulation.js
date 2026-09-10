/* حاسبة التبويض ونافذة الخصوبة */
(function () {
  'use strict';

  AQ.register('ovulation', {
    compute: function (v) {
      var lmp = AQ.parseDate(v.lmp);
      var cycle = AQ.clamp(Number(v.cycle) || 28, 20, 45);
      var luteal = AQ.clamp(Number(v.luteal) || 14, 9, 18);

      if (!lmp) {
        return {
          primary: { label: 'موعد التبويض المتوقع', value: '—', format: 'raw', sub: 'أدخل أول يوم من آخر دورة شهرية.' },
          notes: [{ text: 'أدخل تاريخ آخر دورة شهرية لحساب أيام التبويض والخصوبة.', tone: 'warn' }]
        };
      }
      if (luteal >= cycle) {
        return {
          primary: { label: 'موعد التبويض المتوقع', value: '—', format: 'raw', sub: 'طول الدورة يجب أن يكون أكبر من طول طور ما بعد التبويض.' },
          notes: [{ text: 'عدّل طول الدورة أو طور ما بعد التبويض: طول الدورة يجب أن يتجاوز طور ما بعد التبويض.', tone: 'warn' }]
        };
      }

      var today = new Date();
      today.setHours(0, 0, 0, 0);

      /* تقدّم بموعد التبويض حتى نصل إلى أقرب تاريخ قادم */
      var ovulation = AQ.addDays(lmp, cycle - luteal);
      var lastPeriod = new Date(lmp.getTime());
      var guard = 0;
      while (ovulation < today && guard++ < 400) {
        ovulation = AQ.addDays(ovulation, cycle);
        lastPeriod = AQ.addDays(lastPeriod, cycle);
      }
      while (lastPeriod < today && guard++ < 400) {
        lastPeriod = AQ.addDays(lastPeriod, cycle);
      }

      var windowStart = AQ.addDays(ovulation, -5);
      var windowEnd = AQ.addDays(ovulation, 1);
      var cycleDay = (AQ.daysBetween(lmp, today) % cycle) + 1;
      var daysTo = AQ.daysBetween(today, ovulation);
      var fertileNow = today >= windowStart && today <= windowEnd;

      function row(label, date) {
        return {
          label: label,
          value: AQ.formatDate(date),
          format: 'raw',
          hint: AQ.formatDateShort(date)
        };
      }

      var nextCycles = [];
      var ov = ovulation;
      for (var i = 0; i < 3; i++) {
        nextCycles.push({
          label: 'الدورة ' + (i + 1),
          value: AQ.formatDate(AQ.addDays(ov, -5)) + ' — ' + AQ.formatDate(AQ.addDays(ov, 1)),
          format: 'raw',
          hint: 'التبويض: ' + AQ.formatDateShort(ov)
        });
        ov = AQ.addDays(ov, cycle);
      }

      return {
        primary: {
          label: 'موعد التبويض المتوقع',
          value: AQ.formatDate(ovulation),
          format: 'raw',
          sub: 'بعد ' + daysTo + ' يومًا' + (fertileNow ? ' • نافذة الخصوبة مفتوحة الآن' : '')
        },
        stats: [
          { label: 'أيام الخصوبة', value: AQ.formatDate(windowStart) + ' — ' + AQ.formatDate(windowEnd), format: 'raw' },
          { label: 'الدورة القادمة', value: AQ.formatDate(lastPeriod), format: 'raw' },
          { label: 'يوم الدورة الحالي', value: cycleDay, format: 'raw', unit: 'يوم' }
        ],
        breakdownTitle: 'التفاصيل',
        breakdown: [
          row('أول يوم من آخر دورة', lmp),
          row('بداية نافذة الخصوبة', windowStart),
          row('يوم التبويض', ovulation),
          row('نهاية نافذة الخصوبة', windowEnd),
          row('موعد الدورة القادمة', lastPeriod)
        ],
        tables: [{
          title: 'نافذة الخصوبة في الدورات القادمة',
          columns: ['الدورة', 'أيام الخصوبة'],
          rows: nextCycles.map(function (r) { return [r.label, r.value]; })
        }],
        notes: [
          { text: 'المعتمد في الحساب أن طور ما بعد التبويض ثابت (14 يومًا افتراضيًا)، ويُقدَّر يوم التبويض = طول الدورة − طول هذا الطور.' },
          { text: 'أيام الخصوبة العليا هي الأيام الخمسة السابقة للتبويض ويوم التبويض نفسه ويوم بعده؛ لأن الحيوانات المنوية تعيش أيامًا والبويضة ساعات.' },
          { text: 'هذه الحاسبة تقديرية للتخطيط، ولا تُغني عن المتابعة مع طبيب النساء، ولا تُستخدم كوسيلة منع حمل موثوقة.', tone: 'warn' }
        ]
      };
    }
  });
})();
