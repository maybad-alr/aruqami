/* حاسبة السعرات الحرارية والاحتياج اليومي */
(function () {
  'use strict';

  var ACTIVITY = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  };

  var GOAL = { lose: -500, maintain: 0, gain: 350 };

  AQ.register('calories', {
    compute: function (v) {
      var gender = v.gender || 'male';
      var age = Number(v.age);
      var weight = Number(v.weight);
      var height = Number(v.height);
      var factor = ACTIVITY[v.activity] || ACTIVITY.light;
      var goalDelta = GOAL[v.goal] || 0;

      if (!(age > 0) || !(weight > 0) || !(height > 0)) {
        return {
          primary: { label: 'السعرات اليومية', value: '—', format: 'raw', sub: 'أدخل العمر والوزن والطول.' },
          notes: [{ text: 'أكمل بياناتك لحساب احتياجك.', tone: 'warn' }]
        };
      }

      /* معادلة Mifflin-St Jeor */
      var bmr = gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

      var tdee = bmr * factor;
      bmr = Math.round(bmr);
      tdee = Math.round(tdee);
      var target = Math.round(Math.max(1000, tdee + goalDelta));
      var water = AQ.round(weight * 35 / 1000, 1);
      var protein = Math.round(target * 0.30 / 4);
      var carbs = Math.round(target * 0.40 / 4);
      var fat = Math.round(target * 0.30 / 9);

      var notes = [
        { text: 'المعادلة المستخدمة هي <strong>Mifflin-St Jeor</strong>، وهي الأكثر دقة للأشخاص الأصحاء حسب توصية الأكاديمية الأمريكية للتغذية.' },
        { text: 'توزيع الماكروز المستخدم: 30% بروتين، 40% كربوهيدرات، 30% دهون — يمكن تعديله حسب هدفك التدريبي.' },
        { text: 'هذه الحاسبة تعليمية ولا تُغني عن أخصائي تغذية، خصوصًا للحوامل والمرضعات ومن لديهم أمراض مزمنة.', tone: 'warn' }
      ];
      if (v.goal === 'lose') {
        notes.push({ text: 'عجز 500 سعرة يوميًا يعادل فقدان نحو 0.5 كجم أسبوعيًا، وهو معدل صحي وآمن.' });
      }

      return {
        primary: {
          label: v.goal === 'lose' ? 'سعرات إنقاص الوزن اليومية' : (v.goal === 'gain' ? 'سعرات زيادة الوزن اليومية' : 'سعرات المحافظة اليومية'),
          value: target,
          format: 'raw',
          unit: '',
          sub: 'معدل الأيض الأساسي: ' + AQ.money0(bmr) + ' سعرة • الاحتياج الكلي: ' + AQ.money0(tdee) + ' سعرة'
        },
        stats: [
          { label: 'معدل الأيض الأساسي', value: bmr, format: 'raw', unit: 'سعرة' },
          { label: 'الاحتياج حسب النشاط', value: tdee, format: 'raw', unit: 'سعرة' },
          { label: 'الماء اليومي', value: water, format: 'raw', unit: 'لتر' }
        ],
        breakdownTitle: 'توزيع الماكروز',
        breakdown: [
          { label: 'البروتين', value: protein, format: 'raw', unit: 'جرام', hint: '30% من السعرات' },
          { label: 'الكربوهيدرات', value: carbs, format: 'raw', unit: 'جرام', hint: '40% من السعرات' },
          { label: 'الدهون', value: fat, format: 'raw', unit: 'جرام', hint: '30% من السعرات' },
          { label: 'إجمالي السعرات', value: target, format: 'raw', unit: 'سعرة', total: true }
        ],
        bars: [
          { label: 'البروتين', value: protein * 4, format: 'raw' },
          { label: 'الكربوهيدرات', value: carbs * 4, format: 'raw', tone: 'accent' },
          { label: 'الدهون', value: fat * 9, format: 'raw', tone: 'line' }
        ],
        notes: notes
      };
    }
  });
})();
