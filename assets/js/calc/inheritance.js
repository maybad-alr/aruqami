/* حاسبة الميراث — فروض وتركات مع حساب العول والرد والحجب */
(function () {
  'use strict';

  /* ---- حساب كسري دقيق ---- */
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fr(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(Math.abs(n), Math.abs(d));
    return { n: n / g, d: d / g };
  }
  function add(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return fr(a.n * b.n, a.d * b.d); }
  function div(a, b) { return fr(a.n * b.d, a.d * b.n); }
  function cmp(a, b) { return a.n * b.d - b.n * a.d; }
  function val(a) { return a.n / a.d; }

  var ONE = fr(1, 1), ZERO = fr(0, 1);

  var LABELS = {
    husband: 'الزوج',
    wife: 'الزوجة',
    father: 'الأب',
    mother: 'الأم',
    sons: 'الابن',
    daughters: 'البنت',
    fullBrothers: 'الأخ الشقيق',
    fullSisters: 'الأخت الشقيقة',
    maternal: 'الإخوة لأم'
  };

  var ORDER = ['husband', 'wife', 'father', 'mother', 'sons', 'daughters', 'fullBrothers', 'fullSisters', 'maternal'];

  AQ.register('inheritance', {
    compute: function (v) {
      var estate = Math.max(0, Number(v.estate) || 0);
      var spouse = v.spouse || 'none';
      var wives = AQ.clamp(Math.round(Number(v.wives) || 1), 1, 4);
      var father = !!v.father;
      var mother = !!v.mother;
      var sons = Math.max(0, Math.round(Number(v.sons) || 0));
      var daughters = Math.max(0, Math.round(Number(v.daughters) || 0));
      var fullBrothers = Math.max(0, Math.round(Number(v.fullBrothers) || 0));
      var fullSisters = Math.max(0, Math.round(Number(v.fullSisters) || 0));
      var maternal = Math.max(0, Math.round(Number(v.maternalSiblings) || 0));

      var hasDesc = (sons + daughters) > 0;
      var hasMaleDesc = sons > 0;
      var siblingCount = fullBrothers + fullSisters + maternal;

      if (!(estate > 0)) {
        return {
          primary: { label: 'التركة الموزَّعة', value: '—', format: 'raw', sub: 'أدخل صافي التركة لعرض التوزيع.' },
          notes: [{ text: 'أدخل صافي التركة بعد سداد الديون وتنفيذ الوصية.', tone: 'warn' }]
        };
      }
      if (spouse === 'none' && !father && !mother && !hasDesc && siblingCount === 0) {
        return {
          primary: { label: 'التركة الموزَّعة', value: '—', format: 'raw', sub: 'لا يوجد وارثون ضمن نطاق الحاسبة.' },
          notes: [{ text: 'حدّد وارثًا واحدًا على الأقل.', tone: 'warn' }]
        };
      }

      var shares = {};
      function set(key, f) { if (cmp(f, ZERO) > 0) shares[key] = f; }
      function get(key) { return shares[key] || ZERO; }

      /* ---- 1) الزوجية ---- */
      var spouseFrac = ZERO;
      if (spouse === 'husband') {
        spouseFrac = hasDesc ? fr(1, 4) : fr(1, 2);
        set('husband', spouseFrac);
      } else if (spouse === 'wife') {
        spouseFrac = hasDesc ? fr(1, 8) : fr(1, 4);
        set('wife', spouseFrac);
      }

      /* ---- 2) الأم (مع مراعاة العمريتين) ---- */
      if (mother) {
        if (father && !hasDesc && siblingCount < 2 && spouse !== 'none') {
          set('mother', mul(fr(1, 3), sub(ONE, spouseFrac)));
        } else if (hasDesc || siblingCount >= 2) {
          set('mother', fr(1, 6));
        } else {
          set('mother', fr(1, 3));
        }
      }

      /* ---- 3) الأب ---- */
      var fatherAsaba = false;
      if (father) {
        if (sons > 0) {
          set('father', fr(1, 6));
        } else if (daughters > 0) {
          set('father', fr(1, 6));
          fatherAsaba = true;
        } else {
          fatherAsaba = true;
        }
      }

      /* ---- 4) البنات عند عدم وجود ابن ---- */
      if (daughters > 0 && sons === 0) {
        set('daughters', daughters === 1 ? fr(1, 2) : fr(2, 3));
      }

      /* ---- 5) الإخوة الأشقاء والأخوات الشقيقات ---- */
      var fullBlocked = father || hasMaleDesc;
      if (!fullBlocked) {
        if (fullBrothers === 0 && fullSisters > 0 && !hasDesc) {
          set('fullSisters', fullSisters === 1 ? fr(1, 2) : fr(2, 3));
        }
      }

      /* ---- 6) الإخوة لأم ---- */
      var maternalBlocked = father || hasDesc;
      if (!maternalBlocked && maternal > 0) {
        set('maternal', maternal === 1 ? fr(1, 6) : fr(1, 3));
      }

      /* ---- 7) مجاميع وردّ وعول ---- */
      var total = ZERO;
      ORDER.forEach(function (k) { if (shares[k]) total = add(total, shares[k]); });

      var asaba = null;
      if (sons > 0) asaba = 'children';
      else if (fatherAsaba) asaba = 'father';
      else if (fullBrothers > 0 && !fullBlocked) asaba = 'fullBrothers';
      else if (fullSisters > 0 && !fullBlocked && hasDesc) asaba = 'fullSisters';

      var notes = [];
      var awlApplied = false;
      var raddApplied = false;

      if (cmp(total, ONE) > 0) {
        /* عول: تُنقص الأنصبة بالتناسب */
        var scale = div(ONE, total);
        ORDER.forEach(function (k) { if (shares[k]) shares[k] = mul(shares[k], scale); });
        total = ONE;
        awlApplied = true;
      }

      var residue = sub(ONE, total);
      if (cmp(residue, ZERO) > 0) {
        if (asaba === 'children') {
          /* الأنصبة تُخزَّن كمجموع لكل صنف، وتُقسَّم فرديًا عند العرض */
          var units = sons * 2 + daughters;
          set('sons', mul(residue, fr(2 * sons, units)));
          if (daughters > 0) set('daughters', mul(residue, fr(daughters, units)));
        } else if (asaba === 'father') {
          set('father', add(get('father'), residue));
        } else if (asaba === 'fullBrothers') {
          var unitsB = fullBrothers * 2 + fullSisters;
          set('fullBrothers', mul(residue, fr(2 * fullBrothers, unitsB)));
          if (fullSisters > 0) set('fullSisters', mul(residue, fr(fullSisters, unitsB)));
        } else if (asaba === 'fullSisters') {
          set('fullSisters', residue);
        } else {
          /* الرد: يعود الباقي على أصحاب الفروض عدا الزوجين بنسبة فروضهم */
          var eligible = ORDER.filter(function (k) {
            return k !== 'husband' && k !== 'wife' && shares[k] && cmp(shares[k], ZERO) > 0;
          });
          if (eligible.length) {
            var nonSpouse = ZERO;
            eligible.forEach(function (k) { nonSpouse = add(nonSpouse, shares[k]); });
            var s2 = div(sub(ONE, spouseFrac), nonSpouse);
            eligible.forEach(function (k) { shares[k] = mul(shares[k], s2); });
            raddApplied = true;
          } else {
            notes.push({ text: 'لا يوجد من يستحق الباقي ضمن نطاق الحاسبة (الزوج/الزوجة فقط)، والباقي يُصرف لذوي الأرحام أو بيت المال.', tone: 'warn' });
          }
        }
      }

      /* ---- 8) التحويل إلى مبالغ ونسب ---- */
      var rows = ORDER.filter(function (k) { return shares[k] && cmp(shares[k], ZERO) > 0; }).map(function (k) {
        return { key: k, frac: shares[k], pct: val(shares[k]) * 100, amount: val(shares[k]) * estate };
      });

      /* ضبط التقريب ليصل المجموع إلى التركة بالضبط */
      var rounded = rows.map(function (r) {
        return { key: r.key, pct: AQ.round(r.pct, 2), amount: AQ.round(r.amount, 2), frac: r.frac };
      });
      var sumAmounts = rounded.reduce(function (a, r) { return a + r.amount; }, 0);
      var diff = AQ.round(estate - sumAmounts, 2);
      if (Math.abs(diff) >= 0.01 && rounded.length) {
        var biggest = rounded.reduce(function (a, r) { return r.amount > a.amount ? r : a; }, rounded[0]);
        biggest.amount = AQ.round(biggest.amount + diff, 2);
      }

      /* ---- 9) التسميات والحصص الفردية ---- */
      function labelFor(k) {
        if (k === 'wife') return wives > 1 ? 'الزوجات (' + wives + ')' : 'الزوجة';
        if (k === 'sons') return sons > 1 ? 'الأبناء (' + sons + ')' : 'الابن';
        if (k === 'daughters') return daughters > 1 ? 'البنات (' + daughters + ')' : 'البنت';
        if (k === 'fullBrothers') return fullBrothers > 1 ? 'الإخوة الأشقاء (' + fullBrothers + ')' : 'الأخ الشقيق';
        if (k === 'fullSisters') return fullSisters > 1 ? 'الأخوات الشقيقات (' + fullSisters + ')' : 'الأخت الشقيقة';
        if (k === 'maternal') return maternal > 1 ? 'الإخوة لأم (' + maternal + ')' : 'الأخ لأم';
        return LABELS[k];
      }

      function hintFor(r) {
        var per = null, count = 1, who = '';
        if (r.key === 'wife') { count = wives; who = 'لكل زوجة'; }
        else if (r.key === 'sons') { count = sons; who = 'لكل ابن'; }
        else if (r.key === 'daughters') { count = daughters; who = 'لكل بنت'; }
        else if (r.key === 'fullBrothers') { count = fullBrothers; who = 'لكل أخ'; }
        else if (r.key === 'fullSisters') { count = fullSisters; who = 'لكل أخت'; }
        else if (r.key === 'maternal') { count = maternal; who = 'لكل واحد'; }
        var out = AQ.num(r.pct, 2) + '٪';
        if (count > 1) {
          per = r.amount / count;
          out += ' • ' + who + ': ' + AQ.money(per) + ' ر.س';
        }
        return out;
      }

      var breakdown = rounded.map(function (r) {
        return {
          label: labelFor(r.key),
          value: r.amount,
          format: 'currency',
          unit: 'ر.س',
          hint: hintFor(r)
        };
      });
      breakdown.push({ label: 'إجمالي التركة الموزَّعة', value: estate, format: 'currency', unit: 'ر.س', total: true });

      /* ---- 10) الملاحظات ---- */
      if (awlApplied) notes.push({ text: 'طُبِّق <strong>العول</strong>: مجموع الفروض تجاوز أصل التركة، فنُقصت الأنصبة بالتناسب كما في الفقه.' });
      if (raddApplied) notes.push({ text: 'طُبِّق <strong>الردّ</strong>: تبقّى فائض بعد الفروض ولا توجد عصبة، فعاد الفائض لأصحاب الفروض (عدا الزوجين) بنسبة فروضهم.' });
      if (father && (fullBrothers + fullSisters + maternal) > 0) notes.push({ text: 'وجود الأب يحجب الإخوة والأخوات جميعًا (إلا الإخوة لأم فيُحجبون بالأب أيضًا).' });
      if (hasMaleDesc && !father && (fullBrothers + fullSisters) > 0) notes.push({ text: 'وجود الابن يحجب الإخوة والأخوات الأشقاء.' });
      if (hasDesc && maternal > 0) notes.push({ text: 'وجود الفرع الوارث (ابن أو بنت) يحجب الإخوة لأم.' });
      if (fatherAsaba && daughters > 0) notes.push({ text: 'الأب مع البنات يأخذ السدس فرضًا والباقي تعصيبًا.' });
      notes.push({ text: 'هذه الحاسبة تقديرية وتعرض التوزيع على الوارثين المدخلين وفق الفروض والتعصيب. لا تشمل أولاد الابن، الأجداد، الإخوة لأب، والأعمام وذوي الأرحام. اعتمد على جهة شرعية أو المحكمة في المسائل الفعلية.' , tone: 'warn' });
      notes.push({ text: 'تُخرج الديون والوصية (بحد أقصى ثلث التركة) قبل التوزيع، وهذا الرقم يُدخل كصافي التركة.' });

      return {
        primary: {
          label: 'التركة الموزَّعة',
          value: estate,
          format: 'currency',
          unit: 'ريال',
          sub: 'موزّعة على ' + rows.length + ' من الوارثين'
        },
        stats: [
          { label: 'عدد أصحاب الأنصبة', value: rows.length, format: 'raw' },
          { label: 'أعلى نصيب', value: rows.length ? Math.max.apply(null, rows.map(function (r) { return val(r.frac) * 100; })) : 0, format: 'percent' },
          { label: 'حالة المسألة', value: awlApplied ? 'عول' : (raddApplied ? 'ردّ' : 'فروض وتعصيب'), format: 'raw' }
        ],
        breakdownTitle: 'الأنصبة',
        breakdown: breakdown,
        notes: notes
      };
    }
  });
})();
