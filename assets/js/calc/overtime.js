/* حاسبة أجر العمل الإضافي */
(function () {
  'use strict';

  AQ.register('overtime', {
    compute: function (v) {
      var wage = Number(v.wage);
      var hours = Number(v.hours);
      var workDays = AQ.clamp(Number(v.workDays) || 26, 1, 31);
      var dailyHours = AQ.clamp(Number(v.dailyHours) || 8, 1, 24);

      if (!(wage > 0) || !(hours > 0)) {
        return {
          primary: { label: 'أجر الساعات الإضافية', value: '—', format: 'raw', sub: 'أدخل الأجر الشهري وعدد الساعات الإضافية.' },
          notes: [{ text: 'أكمل حقول الأجر وعدد الساعات.', tone: 'warn' }]
        };
      }

      var multiplier = v.hoursType === 'holiday' ? 2 : 1.5;
      var monthlyHours = workDays * dailyHours;
      var hourly = wage / monthlyHours;
      var overtimeHourly = hourly * multiplier;
      var total = overtimeHourly * hours;
      var premium = total - (hourly * hours);

      var notes = [
        { text: 'المادة (107) من نظام العمل: يُمنح العامل عن ساعات العمل الإضافية أجرًا يعادل أجره الفعلي مضافًا إليه 50% منه، أي <strong>1.5 ضعف أجر الساعة</strong>.' }
      ];
      if (multiplier === 2) {
        notes.push({ text: 'احتساب ساعات العمل في أيام الراحة والأعياد بـ 2 ضعف أجر الساعة ممارسة شائعة؛ يُفضّل الرجوع إلى لائحة المنشأة والعقد.', tone: 'warn' });
      }
      notes.push({ text: 'أجر الساعة = الأجر الشهري ÷ (عدد أيام العمل × عدد ساعات العمل اليومية). عدّل عدد الأيام والساعات ليطابق واقع منشأتك.' });

      return {
        primary: {
          label: 'إجمالي أجر الساعات الإضافية',
          value: total,
          format: 'currency',
          unit: 'ريال',
          sub: AQ.num(hours, 1) + ' ساعة × ' + AQ.money(overtimeHourly) + ' ر.س للساعة'
        },
        stats: [
          { label: 'أجر الساعة العادية', value: hourly, format: 'currency', unit: 'ر.س' },
          { label: 'أجر الساعة الإضافية', value: overtimeHourly, format: 'currency', unit: 'ر.س' },
          { label: 'العلاوة الإضافية', value: premium, format: 'currency', unit: 'ر.س' }
        ],
        breakdownTitle: 'تفصيل الاحتساب',
        breakdown: [
          { label: 'الأجر الشهري', value: wage, format: 'currency', unit: 'ر.س' },
          { label: 'ساعات العمل الشهرية', value: monthlyHours, format: 'raw', unit: 'ساعة' },
          { label: 'أجر الساعة', value: hourly, format: 'currency', unit: 'ر.س' },
          { label: 'معامل الساعات الإضافية', value: multiplier, format: 'raw', unit: '×' },
          { label: 'عدد الساعات الإضافية', value: hours, format: 'raw', unit: 'ساعة' },
          { label: 'إجمالي المستحق', value: total, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'الأجر الأساسي للساعات', value: hourly * hours, format: 'currency' },
          { label: 'العلاوة الإضافية', value: premium, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    }
  });
})();
