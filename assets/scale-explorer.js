/* Дополнения к главе 03. Существующие lecture-models не изменяются. */
(() => {
  'use strict';
  const fmt=(n,digits=2)=>Number(n).toLocaleString('ru-RU',{maximumFractionDigits:digits});
  const setup={
    nominal(root,q,text){
      const codes=[[1,2,3],[3,1,2],[2,3,1]];let state=0;
      const update=()=>{['copper','aluminium','steel'].forEach((name,i)=>text(name,`Код ${codes[state][i]}`));text('result',`Медь: ${codes[state][0]}; алюминий: ${codes[state][1]}; сталь: ${codes[state][2]}. Это названия классов. Переназначение кодов не меняет материал и его свойства.`);};
      q('recode').addEventListener('click',()=>{state=(state+1)%codes.length;update();});update();
    },
    wind(root,q,text){
      const ranges=['0–0,2','0,3–1,5','1,6–3,3','3,4–5,4','5,5–7,9','8,0–10,7','10,8–13,8','13,9–17,1','17,2–20,7','20,8–24,4','24,5–28,4','28,5–32,6','не менее 32,7'];
      const names=['Штиль','Тихий','Лёгкий','Слабый','Умеренный','Свежий','Сильный','Крепкий','Очень крепкий','Шторм','Сильный шторм','Жестокий шторм','Ураган'];
      const observations=['Дым поднимается вертикально. Флаг висит, поверхность воды спокойная.','Дым слегка отклоняется. Флаг почти висит.','Дым заметно отклоняется; листья слегка шевелятся.','Флаг расправляется, листья и тонкие ветви движутся.','Флаг вытянут, небольшие ветви отклоняются, на воде заметны волны.','Небольшое дерево заметно отклоняется, волны становятся выраженнее.','Движутся крупные ветви; на воде показаны белые барашки.','Крона дерева сильно отклоняется, на волнах больше белой пены.','Дерево и флаг заметно отклонены, волны высокие в условном рисунке.','Сильный наклон кроны, плотные облака и выраженная пена показывают шторм.','На рисунке усилены наклон кроны и волны; это условный образ сильного шторма.','Низкие тёмные облака и крупные волны — условный образ жестокого шторма.','Условная буря: флаг вытянут, крона сильно наклонена, на воде много пены.'];
      const update=()=>{
        const b=Number(q('force').value),f=b/12;
        text('force-value',String(b));text('category',`${b} — ${names[b]}`);text('speed',`${ranges[b]} м/с`);text('observation',observations[b]);
        text('result',`Категория ${b}: ${names[b]}. Средняя скорость на высоте 10 м — ${ranges[b]} м/с. ${observations[b]}`);
        q('scene').setAttribute('aria-label',`Условный пейзаж: ${names[b]}, ${b} баллов. ${observations[b]}`);
        q('sky').setAttribute('fill',b<6?'#ccebf2':b<9?'#c5dde3':'#aabfc9');
        q('clouds').setAttribute('opacity',String(.15+.75*f));q('sun').setAttribute('opacity',String(1-.85*f));
        q('tree').setAttribute('transform',`rotate(${b*2.6} 450 222)`);
        const length=b===0?12:Math.min(100,22+b*12),drop=b===0?37:Math.max(9,28-b*2);
        q('flag').setAttribute('d',b===0?'M250 84 Q261 91 258 119 L250 121 Z':`M250 84 Q${250+length*.45} ${78-f*7} ${250+length} ${84+drop*.2} L${250+length} ${103+drop*.2} Q${250+length*.45} ${98-f*7} 250 108 Z`);
        const dx=b===0?0:12+b*7;
        q('smoke').setAttribute('d',`M94 142 C${94+dx*.2} 121 ${94+dx*.65} 116 ${94+dx} 91`);
        const amplitude=b===0?0:1+b*.85;
        const wave=(y,shift)=>{let d=`M-30 ${y}`;for(let x=-30;x<630;x+=60)d+=` q15 ${-amplitude-shift} 30 0 t30 0`;return d;};
        q('wave-a').setAttribute('d',wave(257,0));q('wave-b').setAttribute('d',wave(282,b===0?0:1));
        q('foam').setAttribute('opacity',b<6?'0':String(.35+.65*(b-6)/6));
      };q('force').addEventListener('input',update);update();
    },
    ratios(root,q,text){
      const update=()=>{const a=Number(q('length-a').value),b=Number(q('length-b').value),mm=q('unit').value==='mm',factor=mm?10:1,unit=mm?'мм':'см';
        text('length-a-value',`${a} см`);text('length-b-value',`${b} см`);
        q('bar-a').setAttribute('width',String(a*26));q('bar-b').setAttribute('width',String(b*26));
        root.querySelector('svg').setAttribute('aria-label',`Два отрезка: A длиной ${a} см и B длиной ${b} см.`);
        text('result',`A = ${a*factor} ${unit}, B = ${b*factor} ${unit}. Разность A − B = ${(a-b)*factor} ${unit}. ${b===0?'Отношение A/B не определено: делить на ноль нельзя.':`Отношение A/B = ${fmt(a/b,3)} (без единицы).`} Смена единицы не меняет длины и их отношение, когда оно определено.`);
      };['length-a','length-b'].forEach(r=>q(r).addEventListener('input',update));q('unit').addEventListener('change',update);update();
    },
    count(root,q,text){
      let count=4;const items=[...root.querySelectorAll('[data-item]')];
      const update=()=>{items.forEach((item,i)=>item.setAttribute('display',i<count?'inline':'none'));q('minus').disabled=count===0;q('plus').disabled=count===12;text('result',`Число предметов N = ${count}. ${count===0?'Предметов нет: это естественный ноль счёта.':'Каждый предмет добавляет ровно одну единицу счёта.'} Значение целое; единица — один предмет.`);q('objects').setAttribute('aria-label',`На рисунке ${count} отдельных предметов.`);};
      q('minus').addEventListener('click',()=>{count=Math.max(0,count-1);update();});q('plus').addEventListener('click',()=>{count=Math.min(12,count+1);update();});update();
    },
    logarithm(root,q,text){
      const update=()=>{const level=Number(q('level').value),ratio=10**(level/10),x=40+8.5*level;
        text('level-value',`${level} дБ`);q('level-pointer').setAttribute('x1',String(x));q('level-pointer').setAttribute('x2',String(x));q('level-dot').setAttribute('cx',String(x));
        text('result',`L = ${level} дБ: P₂/P₁ = 10^(L/10) = ${fmt(ratio,3)}. ${level===0?'Нулевой уровень здесь означает равные мощности, а не отсутствие мощности.':'Это отношение мощностей, без единицы.'} Прибавка 10 дБ умножает отношение мощностей на 10.`);
      };q('level').addEventListener('input',update);update();
    }
  };
  document.querySelectorAll('[data-scale-explorer]').forEach(root=>{
    const q=role=>root.querySelector(`[data-sx="${role}"]`),text=(role,value)=>{q(role).textContent=value;};
    const init=setup[root.dataset.scaleExplorer];if(!init)return;
    root.querySelectorAll('button,input,select').forEach(control=>{control.disabled=false;});
    init(root,q,text);root.classList.add('is-ready');
  });
  // Слушаем уже имеющиеся ползунки температуры, не меняя их расчёты или обработчики.
  const temperature=document.getElementById('demo-temperature');
  if(temperature){
    const visual=temperature.querySelector('[data-temperature-visual]');
    if(visual){const update=()=>{
      if(visual.dataset.temperatureFour){
        const scales={c:{convert:x=>x,unit:'°C'},k:{convert:x=>x+273.15,unit:'K'},f:{convert:x=>x*1.8+32,unit:'°F'},r:{convert:x=>x*.8,unit:'°R'}};
        visual.querySelectorAll('[data-temp-scale]').forEach(panel=>{
          const scale=scales[panel.dataset.tempScale],values={};
          ['a','b'].forEach(name=>{const value=Number(temperature.querySelector(`[data-role="temp-${name}"]`).value),x=20+280*(value+273.15)/473.15;values[name]=fmt(scale.convert(value));
            const pointer=panel.querySelector(`[data-temp-marker="${name}"]`);pointer.setAttribute('x1',String(x));pointer.setAttribute('x2',String(x));panel.querySelector(`[data-temp-dot="${name}"]`).setAttribute('cx',String(x));panel.querySelector(`[data-temp-number="${name}"]`).textContent=`${name.toUpperCase()}: ${values[name]} ${scale.unit}`;
          });
          panel.querySelector('svg').setAttribute('aria-label',`Температуры A: ${values.a} ${scale.unit}; B: ${values.b} ${scale.unit}.`);
        });return;
      }
      ['a','b'].forEach(name=>{const input=temperature.querySelector(`[data-role="temp-${name}"]`),value=Number(input.value),y=240-(value+200)*.45;
        const column=visual.querySelector(`[data-therm-column="${name}"]`),pointer=visual.querySelector(`[data-therm-pointer="${name}"]`);
        column.setAttribute('y',String(y));column.setAttribute('height',String(252-y));pointer.setAttribute('y1',String(y));pointer.setAttribute('y2',String(y));
      });
      visual.querySelector('svg').setAttribute('aria-label',`Два термометра: A ${temperature.querySelector('[data-role="temp-a"]').value} градусов Цельсия; B ${temperature.querySelector('[data-role="temp-b"]').value} градусов Цельсия. Слева отметки Цельсия, справа кельвинов.`);
    };['a','b'].forEach(name=>temperature.querySelector(`[data-role="temp-${name}"]`).addEventListener('input',update));update();visual.classList.add('is-ready');}
  }
})();
