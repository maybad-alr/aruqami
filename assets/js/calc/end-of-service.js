/* حاسبة مكافأة نهاية الخدمة — نظام العمل السعودي (المواد 84، 85، 87) */
(function () {
  'use strict';

  AQ.register('end-of-service', {
    compute: function (v) {
      var wage = Number(v.wage);
      var start = AQ.parseDate(v.startDate);
      var end = AQ.parseDate(v.endDate);
      var reason = v.reason || 'employer';
      var vacationDays = AQ.clamp(Number(v.vacationDays) || 0, 0, 3650);

      if (!start || !end || !(wage > 0) || end <= start) {
        return {
          primary: {
            label: 'مكافأة نهاية الخدمة',
            value: '—',
            format: 'raw',
            sub: 'أدخل الأجر الأخير وتاريخ بداية ونهاية العلاقة العمالية.'
          },
          notes: [{ text: 'أكمل الحقول المطلوبة لعرض النتيجة.', tone: 'warn' }]
        };
      }

      var days = AQ.daysBetween(start, end);
      var years = days / 365;

      /* الأجر المستحق عن مدة الخدمة كاملة: نصف شهر لكل سنة من الخمس الأولى،
         وشهر كامل لكل سنة تالية. */
      var fullReward = years <= 5
        ? (wage / 2) * years
        : (wage / 2) * 5 + wage * (years - 5);

      var ratio = 1;
      var ratioLabel = 'المكافأة كاملة';
      var ratioTone = 'good';
      var ratioNote = '';

      if (reason === 'article80') {
        ratio = 0;
        ratioLabel = 'لا تُستحق مكافأة';
        ratioTone = 'bad';
        ratioNote = 'إنهاء العقد لأحد الأسباب المشروعة في المادة (الثمانين) من نظام العمل يُسقط الحق في مكافأة نهاية الخدمة.';
      } else if (reason === 'resignation') {
        if (years < 2) {
          ratio = 0;
          ratioLabel = 'لا تُستحق مكافأة';
          ratioTone = 'bad';
          ratioNote = 'الاستقالة قبل إكمال سنتين لا يترتب عليها استحقاق مكافأة نهاية الخدمة.';
        } else if (years < 5) {
          ratio = 1 / 3;
          ratioLabel = 'ثلث المكافأة';
          ratioTone = 'warn';
          ratioNote = 'الاستقالة بعد إكمال سنتين وقبل خمس سنوات: يُستحق ثلث المكافأة.';
        } else if (years < 10) {
          ratio = 2 / 3;
          ratioLabel = 'ثلثا المكافأة';
          ratioTone = 'warn';
          ratioNote = 'الاستقالة بعد إكمال خمس سنوات وقبل عشر: يُستحق ثلثا المكافأة.';
        } else {
          ratio = 1;
          ratioLabel = 'المكافأة كاملة';
          ratioTone = 'good';
          ratioNote = 'الاستقالة بعد إكمال عشر سنوات تمنح الحق في المكافأة كاملة.';
        }
      } else {
        ratioNote = 'إنهاء العلاقة من صاحب العمل (أو انتهاء مدة العقد دون تجديد) يمنح الحق في المكافأة كاملة.';
      }

      var reward = fullReward * ratio;
      var dailyWage = wage / 30;
      var vacationPay = dailyWage * vacationDays;
      var total = reward + vacationPay;

      var notes = [];
      if (ratioNote) notes.push({ text: ratioNote, tone: ratioTone === 'bad' ? 'warn' : '' });
      notes.push({
        text: 'الأجر المعتمد هو <strong>الأجر الأخير</strong>. والعرف العملي في حساب المكافأة هو استخدام الراتب الأساسي دون البدلات، ما لم ينص العقد أو اللائحة على خلاف ذلك.'
      });
      notes.push({
        text: 'مكافأة نهاية الخدمة معفاة من ضريبة الدخل ولا تدخل في الوعاء الزكوي للفرد.'
      });
      if (vacationDays > 0) {
        notes.push({
          text: 'بدل الإجازات محسوب على أساس أجر يومي = الأجر الشهري ÷ 30 يومًا × ' + AQ.num(vacationDays, 0) + ' يومًا.'
        });
      }

      return {
        primary: {
          label: 'إجمالي المستحق',
          value: total,
          format: 'currency',
          unit: 'ريال',
          sub: 'مكافأة نهاية الخدمة: ' + AQ.money(reward) + ' ر.س' +
            (vacationPay > 0 ? ' + بدل إجازات: ' + AQ.money(vacationPay) + ' ر.س' : '')
        },
        stats: [
          { label: 'مدة الخدمة', value: AQ.duration(days), format: 'raw' },
          { label: 'الأجر اليومي', value: dailyWage, format: 'currency', unit: 'ر.س' },
          { label: 'نسبة الاستحقاق', value: ratioLabel, format: 'raw', tone: ratioTone }
        ],
        breakdownTitle: 'تفصيل المكافأة',
        breakdown: [
          { label: 'مدة الخدمة المحسوبة', value: AQ.round(years, 2), unit: 'سنة', format: 'raw' },
          { label: 'المكافأة الكاملة قبل نسبة الاستحقاق', value: fullReward, format: 'currency', unit: 'ر.س' },
          { label: 'نسبة الاستحقاق', value: AQ.round(ratio * 100, 2), format: 'raw', unit: '٪' },
          { label: 'المكافأة المستحقة', value: reward, format: 'currency', unit: 'ر.س' },
          { label: 'بدل الإجازات غير المستخدمة', value: vacationPay, format: 'currency', unit: 'ر.س' },
          { label: 'الإجمالي المستحق', value: total, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'مكافأة نهاية الخدمة', value: reward, format: 'currency' },
          { label: 'بدل الإجازات', value: vacationPay, format: 'currency', tone: 'accent' }
        ].filter(function (b) { return b.value > 0; }),
        notes: notes
      };
    }
  });
})();
