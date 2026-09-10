/* حاسبة الراتب الصافي والاستقطاعات */
(function () {
  'use strict';

  var CAP = 45000; /* الحد الأعلى للأجر الخاضع للاشتراك */

  AQ.register('salary', {
    compute: function (v) {
      var gross = Number(v.gross);
      var base = Number(v.contributionBase);
      if (!(gross > 0)) {
        return {
          primary: { label: 'الراتب الصافي', value: '—', format: 'raw', sub: 'أدخل الراتب الإجمالي لعرض النتيجة.' },
          notes: [{ text: 'أكمل حقول الراتب.', tone: 'warn' }]
        };
      }

      if (!(base > 0)) base = gross;
      var capped = Math.min(base, CAP);
      var employeeRate = AQ.clamp(Number(v.employeeRate) || 0, 0, 50);
      var employerRate = AQ.clamp(Number(v.employerRate) || 0, 0, 50);
      var other = Math.max(0, Number(v.otherDeductions) || 0);

      var employee = capped * employeeRate / 100;
      var employer = capped * employerRate / 100;
      var net = gross - employee - other;
      var netAnnual = net * 12;
      var costToEmployer = gross + employer;

      var notes = [
        { text: 'النسب الافتراضية (9.75% للموظف السعودي و11.75% لصاحب العمل) قابلة للتعديل؛ راجع مسير راتبك أو موقع التأمينات الاجتماعية للتأكد من النسب السارية.' },
        { text: 'الحد الأعلى للأجر الخاضع للاشتراك ' + AQ.num(CAP, 0) + ' ريال؛ ما زاد على ذلك لا تُحتسب عليه اشتراكات.' }
      ];

      if (v.nationality === 'non-saudi') {
        notes.push({ text: 'غير السعوديين لا يخضعون لاشتراكات التأمينات الاجتماعية (فرع المعاشات)، ويخضعون عادةً للتأمين الطبي الخاص بدلًا منها.', tone: 'warn' });
      }
      if (net < 0) {
        notes.push({ text: 'الاستقطاعات تتجاوز الراتب الإجمالي — تحقق من الأرقام المدخلة.', tone: 'warn' });
      }

      return {
        primary: {
          label: 'الراتب الصافي شهريًا',
          value: net,
          format: 'currency',
          unit: 'ريال',
          sub: 'من إجمالي ' + AQ.money(gross) + ' ر.س بعد استقطاع ' + AQ.money(employee + other) + ' ر.س'
        },
        stats: [
          { label: 'استقطاع التأمينات', value: employee, format: 'currency', unit: 'ر.س' },
          { label: 'الصافي السنوي', value: netAnnual, format: 'currency0', unit: 'ر.س' },
          { label: 'تكلفة صاحب العمل', value: costToEmployer, format: 'currency', unit: 'ر.س' }
        ],
        breakdownTitle: 'من الإجمالي إلى الصافي',
        breakdown: [
          { label: 'الراتب الإجمالي', value: gross, format: 'currency', unit: 'ر.س' },
          { label: 'الأجر الخاضع للاشتراك', value: capped, format: 'currency', unit: 'ر.س', hint: 'بحد أقصى ' + AQ.num(CAP, 0) + ' ر.س' },
          { label: 'اشتراك الموظف', value: -employee, format: 'currency', unit: 'ر.س', hint: AQ.num(employeeRate, 2) + '٪ من الأجر الخاضع' },
          { label: 'استقطاعات أخرى', value: -other, format: 'currency', unit: 'ر.س' },
          { label: 'الراتب الصافي', value: net, format: 'currency', unit: 'ر.س', total: true },
          { label: 'اشتراك صاحب العمل', value: employer, format: 'currency', unit: 'ر.س', hint: AQ.num(employerRate, 2) + '٪ من الأجر الخاضع' },
          { label: 'إجمالي تكلفة صاحب العمل', value: costToEmployer, format: 'currency', unit: 'ر.س', total: true }
        ],
        bars: [
          { label: 'الراتب الصافي', value: Math.max(0, net), format: 'currency' },
          { label: 'إجمالي الاستقطاعات', value: employee + other, format: 'currency', tone: 'accent' }
        ],
        notes: notes
      };
    },

    /* تحديث النسب تلقائيًا عند تغيير الجنسية، ما لم يعدّلها المستخدم يدويًا. */
    after: function (panel) {
      var form = panel.querySelector('form');
      if (!form) return;
      var touched = false;

      form.querySelectorAll('[data-field="employeeRate"], [data-field="employerRate"]').forEach(function (el) {
        el.addEventListener('input', function () { touched = true; });
      });

      form.querySelectorAll('[data-field="nationality"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          if (touched) return;
          var saudi = radio.value === 'saudi';
          var emp = form.querySelector('[data-field="employeeRate"]');
          var er = form.querySelector('[data-field="employerRate"]');
          if (emp) { emp.value = saudi ? '9.75' : '0'; emp.setAttribute('data-default', emp.value); }
          if (er) { er.value = saudi ? '11.75' : '0'; er.setAttribute('data-default', er.value); }
          form.dispatchEvent(new Event('input'));
        });
      });
    }
  });
})();
