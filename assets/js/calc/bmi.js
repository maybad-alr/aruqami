/* حاسبة مؤشر كتلة الجسم */
(function () {
  'use strict';

  var RANGES = [
    { max: 18.5, label: 'نقص في الوزن', tone: 'warn' },
    { max: 24.9, label: 'وزن طبيعي', tone: 'good' },
    { max: 29.9, label: 'زيادة في الوزن', tone: 'warn' },
    { max: 34.9, label: 'سمنة من الدرجة الأولى', tone: 'bad' },
    { max: 39.9, label: 'سمنة من الدرجة الثانية', tone: 'bad' },
    { max: Infinity, label: 'سمنة مفرطة', tone: 'bad' }
  ];

  AQ.register('bmi', {
    compute: function (v) {
      var weight = Number(v.weight);
      var height = Number(v.height);

      if (!(weight > 0) || !(height > 0)) {
        return {
          primary: { label: 'مؤشر كتلة الجسم', value: '—', format: 'raw', sub: 'أدخل الوزن بالكيلوجرام والطول بالسنتيمتر.' },
          notes: [{ text: 'أدخل الوزن والطول لحساب المؤشر.', tone: 'warn' }]
        };
      }

      var m = height / 100;
      var bmiRaw = weight / (m * m);
      var bmi = AQ.round(bmiRaw, 2);
      var info = RANGES.filter(function (r) { return bmiRaw < r.max; })[0] || RANGES[RANGES.length - 1];
      var low = AQ.round(18.5 * m * m, 1);
      var high = AQ.round(24.9 * m * m, 1);
      var toHealthy = bmiRaw < 18.5 ? low - weight : (bmiRaw > 24.9 ? weight - high : 0);

      var notes = [
        { text: 'مؤشر كتلة الجسم مقياس إحصائي سريع، ولا يميّز بين الدهون والعضلات؛ الرياضيون قد يظهرون بمؤشر مرتفع دون زيادة دهون.' },
        { text: 'لتقييم أدق، يُدمج المؤشر مع محيط الخصر ونسبة الدهون والحالة الصحية العامة.' }
      ];
      if (info.tone === 'bad') {
        notes.push({ text: 'الفئة الحالية تشير إلى سمنة. استشارة أخصائي تغذية أو طبيب خطوة عملية للحصول على خطة مناسبة.', tone: 'warn' });
      }
      notes.push({ text: 'قطعت منظمة الصحة العالمية لمجتمعات آسيا والشرق الأوسط بحدود أدنى (زيادة الوزن من 23، والسمنة من 25) — راجع طبيبك لمعرفة المقياس المناسب لك.' });

      return {
        primary: {
          label: 'مؤشر كتلة الجسم',
          value: bmi,
          format: 'raw',
          sub: 'التصنيف: <strong>' + info.label + '</strong>'
        },
        stats: [
          { label: 'التصنيف', value: info.label, format: 'raw', tone: info.tone },
          { label: 'الوزن الصحي للطول', value: AQ.num(low, 1), format: 'raw', unit: 'كجم' },
          { label: 'الفرق للوزن الصحي', value: toHealthy, format: 'currency0', unit: 'كجم', tone: toHealthy > 0 ? 'warn' : 'good' }
        ],
        breakdownTitle: 'نطاق الوزن الصحي',
        breakdown: [
          { label: 'الحد الأدنى للوزن الصحي', value: low, format: 'currency', unit: 'كجم', hint: 'عند مؤشر 18.5' },
          { label: 'الحد الأعلى للوزن الصحي', value: high, format: 'currency', unit: 'كجم', hint: 'عند مؤشر 24.9' },
          { label: 'وزنك الحالي', value: weight, format: 'currency', unit: 'كجم', total: true }
        ],
        bars: [
          { label: 'مؤشر كتلة الجسم', value: Math.min(bmi, 45), format: 'raw' },
          { label: 'الحد الأعلى الطبيعي (24.9)', value: 24.9, format: 'raw', tone: 'line' }
        ],
        notes: notes
      };
    }
  });
})();
