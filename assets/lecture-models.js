/* Автономные модели: нативные элементы управления, без сети и библиотек. */
(() => {
  'use strict';
  const fmt = (n, digits = 2) => Number(n).toLocaleString('ru-RU', { maximumFractionDigits: digits });
  const init = {
    units(root, q, text) {
      const units = {
        m: { factor: 1, symbol: 'м', name: 'метр', size: '1 м', comparison: 'При записи в метрах числовое значение равно длине, выраженной в метрах.' },
        cm: { factor: .01, symbol: 'см', name: 'сантиметр', size: '1 см = 0,01 м', comparison: 'Сантиметр в 100 раз меньше метра. Для той же длины число в 100 раз больше, чем при записи в метрах.' },
        mm: { factor: .001, symbol: 'мм', name: 'миллиметр', size: '1 мм = 0,001 м', comparison: 'Миллиметр в 1000 раз меньше метра. Для той же длины число в 1000 раз больше, чем при записи в метрах. Миллиметр также в 10 раз меньше сантиметра.' }
      };
      const update = (action = 'initial') => {
        const length = Number(q('length').value), key = root.querySelector('[data-role="unit"]:checked').value, unit = units[key];
        const number = length / unit.factor, end = 36 + length / 2 * 328;
        q('object').setAttribute('width', String(length / 2 * 328));
        q('object-end').setAttribute('x1', String(end)); q('object-end').setAttribute('x2', String(end));
        text('length-value', `${fmt(length,1)} м`); q('length').setAttribute('aria-valuetext', `${fmt(length,1)} метра`);
        text('number', fmt(number,3)); text('symbol', unit.symbol);
        text('unit-size', `Выбранная единица — ${unit.name}: [L] = ${unit.size}.`);
        text('scale-unit', `Шкала, ${unit.symbol}`);
        text('scale-range', `Линейка: от 0 до ${fmt(2/unit.factor)} ${unit.symbol}. Её диапазон при выборе единицы остаётся тем же.`);
        root.querySelectorAll('[data-unit-tick]').forEach(tick => { tick.textContent = fmt(Number(tick.dataset.unitTick)/unit.factor); });
        root.querySelectorAll('[data-unit-card]').forEach(card => { card.dataset.selected = String(card.dataset.unitCard === key); });
        for (const [id, data] of Object.entries(units)) text(`equiv-${id}`, `${fmt(length/data.factor,3)} ${data.symbol}`);
        text('picture-description', `Длина предмета ${fmt(number,3)} ${unit.symbol}; его конец находится на отметке ${fmt(number,3)} линейки от 0 до ${fmt(2/unit.factor)} ${unit.symbol}. Схема условная.`);
        text('comparison', unit.comparison);
        const intro = action === 'length' ? 'Новая длина: меняются предмет и число.' : action === 'unit' ? 'Новая единица: длина предмета та же.' : 'Смените единицу — предмет останется тем же.';
        text('result', `${intro} L = ${fmt(number,3)} ${unit.symbol}.`);
      };
      root.querySelectorAll('[data-role="unit"]').forEach(control => control.addEventListener('change', () => update('unit')));
      q('length').addEventListener('input', () => update('length')); update();
    },
    temperature(root, q, text) {
      const update = () => {
        const a = Number(q('temp-a').value), b = Number(q('temp-b').value);
        const ka = a + 273.15, kb = b + 273.15;
        text('a-value', `${fmt(a)} °C = ${fmt(ka)} K`); text('b-value', `${fmt(b)} °C = ${fmt(kb)} K`);
        text('result', `Разность B − A: ${fmt(b-a)} °C, или ${fmt(b-a)} K. Ноль °C условен: вдвое больше градусов не значит вдвое выше температура.`);
        text('temperature-ratio', `Отношение температур в кельвинах: B к A = ${fmt(kb/ka, 3)}.`);
      };
      ['temp-a','temp-b'].forEach(r => q(r).addEventListener('input',update)); update();
    },
    scales(root, q, text) {
      const masses = [135,165,127,85,172,115]; let index = 0;
      const buttons = [...root.querySelectorAll('[data-weight]')];
      const update = () => {
        const sum = buttons.reduce((s,b) => s + (b.getAttribute('aria-pressed') === 'true' ? Number(b.dataset.weight) : 0),0);
        const diff = sum - masses[index];
        const angle = diff === 0 ? 0 : Math.sign(diff)*Math.min(14,3+Math.abs(diff)*.1);
        q('beam').setAttribute('transform',`rotate(${angle} 200 70)`);
        q('pan-left').setAttribute('transform',`translate(65 70) rotate(${-angle})`);
        q('pan-right').setAttribute('transform',`translate(335 70) rotate(${-angle})`);
        text('weight-sum', `${sum} г`); text('mass', diff === 0 ? `${masses[index]} г` : '?');
        text('result', diff === 0 ? `Равновесие: mₓ = ${sum} г. Нулевой указатель означает равенство моментов сил, а при равных плечах — равенство масс.` : `На правой чаше ${sum} г. ${diff < 0 ? 'Левая чаша с деталью тяжелее — добавьте гири.' : 'Правая чаша с гирями тяжелее — уберите гири.'} Указатель ещё не на нуле.`);
      };
      const reset = () => { buttons.forEach(b=>b.setAttribute('aria-pressed','false')); update(); };
      buttons.forEach(b=>b.addEventListener('click',()=>{b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed') !== 'true'));update();}));
      q('reset').addEventListener('click',reset);
      q('new').addEventListener('click',()=>{index=(index+1)%masses.length;reset();}); update();
    },
    bridge(root, q, text) {
      const targets = [145,115,175,125]; let index = 0;
      const update = () => {
        const r0 = Number(q('r0').value), rx = targets[index];
        // Делители без нагрузки; гальванометр условный. Между верхним и нижним узлами 10 V.
        const va = 10*rx/(100+rx), vb = 10*r0/(100+r0), delta = va-vb;
        text('r0-value',`${r0} Ом`); text('r0-svg',`${r0} Ом`); text('rx-svg',delta === 0 ? `${rx} Ом` : '?');
        // Положительный поворот вертикальной стрелки направлен к плюсу справа.
        q('bridge-needle').setAttribute('transform',`rotate(${Math.max(-40,Math.min(40,delta*20))} 270 234)`);
        text('result', delta === 0 ? `UAB = 0 В: мост уравновешен. При R₁ = R₂ получаем Rₓ = R₀ = ${rx} Ом.` : `UAB = VA − VB = ${fmt(delta,3)} В. Потенциал — напряжение узла относительно нижней точки: VA = ${fmt(va,3)} В; VB = ${fmt(vb,3)} В. Подберите R₀ до нуля.`);
      };
      q('r0').addEventListener('input',update); q('new').addEventListener('click',()=>{index=(index+1)%targets.length; q('r0').value='100';update();}); update();
    },
    target(root, q, text) {
      // Нерегулярное облако без зеркальных пар; средние обеих координат равны нулю.
      // Масштабирование сохраняет среднее в (bias, 0), не создавая новую выборку.
      const points = [[-1.25,-.5],[-.75,.875],[-.375,-.125],[.125,.5],[.375,-1.125],[.625,.125],[1.125,.625],[.125,-.375]];
      const ns='http://www.w3.org/2000/svg';
      q('dots').replaceChildren();
      const dots = points.map(()=>{const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','4');dot.setAttribute('fill','#a54424');q('dots').append(dot);return dot;});
      const update=()=>{const bias=Number(q('bias').value), spread=Number(q('spread').value);
        dots.forEach((dot,i)=>{dot.setAttribute('cx',150+bias+points[i][0]*spread);dot.setAttribute('cy',105+points[i][1]*spread);});
        q('mean').setAttribute('cx',150+bias); text('bias-value',`${bias} усл. ед.`);text('spread-value',`${spread} усл. ед.`);
        text('result',`Центр группы смещён вправо на ${bias} усл. ед.; масштаб разброса — ${spread} усл. ед. ${bias===0?'Среднее группы совпадает с опорным центром.':'Тесная группа может оставаться вдали от опорного центра.'} Изменение разброса не сдвигает среднее этой группы.`);
      }; ['bias','spread'].forEach(r=>q(r).addEventListener('input',update));update();
    },
    error(root, q, text) {
      const update = () => {
        const x = Number(q('voltage').value);
        text('voltage-value', `${x} В`);
        text('bar-voltage', `${x} В`);
        text('ratio', x === 0 ? 'Не определена' : `${fmt(100/x)}%`);
        q('ratio').classList.toggle('voltage-undefined', x === 0);
        text('fraction', x === 0 ? 'При 0 В долю не вычисляют' : `1 В от ${x} В`);
        q('voltage-bar').style.width = `${x}%`;
        q('voltage').setAttribute('aria-valuetext', `${x} вольт`);
        q('chart').setAttribute('aria-label', `Общая шкала от 0 до 100 вольт. Опорное напряжение ${x} вольт. Модуль предела погрешности постоянно равен 1 вольту.`);
      };
      q('voltage').addEventListener('input', update); update();
    },
    sensitivity(root, q, text) {
      let completed = false;
      const update = () => {
        text('input-value', completed ? '2 → 2,5 В' : '2 В');
        text('change-value', completed ? 'Изменение +0,5 В' : 'До изменения');
        text('step', completed ? 'Повторить опыт' : 'Увеличить напряжение на 0,5 В');
        q('step').setAttribute('aria-label', completed ? 'Повторить опыт: вернуть напряжение к 2 вольтам' : 'Увеличить напряжение на 0,5 вольта: с 2 до 2,5 вольта');
        [10,5].forEach(span => {
          const initial = 40 / span, delta = 10 / span;
          const start = 10 + initial * 15, position = start + (completed ? delta * 15 : 0);
          text(`reading-label-${span}`, completed ? 'Перемещение:' : 'Положение:');
          text(`reading-${span}`, `${completed ? delta : initial} дел.`);
          q(`pointer-${span}`).setAttribute('x1', position);
          q(`pointer-${span}`).setAttribute('x2', position);
          q(`previous-${span}`).style.visibility = completed ? 'visible' : 'hidden';
          q(`path-${span}`).setAttribute('width', completed ? delta * 15 : 0);
          q(`scale-${span}`).setAttribute('aria-label', completed
            ? `Шкала от 0 до ${span} вольт: 20 равных делений. Напряжение изменилось с 2 до 2,5 вольта. Прежнее положение ${initial} делений, новое ${initial+delta} делений. Перемещение ${delta} делений.`
            : `Шкала от 0 до ${span} вольт: 20 равных делений. При 2 вольтах положение стрелки ${initial} делений.`);
        });
        text('result', completed
          ? 'Изменение одинаковое — 0,5 В. На диапазоне 0–5 В стрелка переместилась вдвое дальше: чувствительность выше.'
          : 'На какой шкале движение стрелки будет заметнее? Увеличьте напряжение и сравните перемещения.');
      };
      q('step').addEventListener('click', () => { completed = !completed; update(); });
      update();
    }
  };
  document.querySelectorAll('[data-lecture-model]').forEach(root => {
    const q = role => root.querySelector(`[data-role="${role}"]`);
    const text = (role, value) => { q(role).textContent = value; };
    const setup = init[root.dataset.lectureModel];
    if (!setup) return;
    setup(root,q,text);
    root.querySelectorAll('input,select,button').forEach(control=>{control.disabled=false;});
    root.classList.add('is-ready');
  });
})();
