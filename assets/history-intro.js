(() => {
  'use strict';
  const demo = document.querySelector('[data-cubits-demo]');
  if (demo) {
    const a = demo.querySelector('[data-cubit-a]');
    const b = demo.querySelector('[data-cubit-b]');
    const format = value => value.toLocaleString('ru-RU', {minimumFractionDigits:2,maximumFractionDigits:2});
    const set = (selector, name, value) => demo.querySelector(selector).setAttribute(name,String(value));
    const render = () => {
      const av=Number(a.value), bv=Number(b.value);
      const al=av/10, bl=bv/10, ah=av*.03, bh=bv*.03;
      demo.querySelector('[data-cubit-a-size]').textContent=av;
      demo.querySelector('[data-cubit-b-size]').textContent=bv;
      for(const [key,value] of [['a-result',al],['b-result',bl],['a-height',ah],['b-height',bh]]) demo.querySelector(`[data-cubit-${key}]`).textContent=format(value);
      // Общий масштаб по обеим осям: 420 SVG-единиц соответствуют 9 метрам.
      const scale=420/9, aw=al*scale, bw=bl*scale, ay=150-ah*scale, by=150-bh*scale;
      set('[data-bridge-a-span]','width',aw); set('[data-bridge-a-span]','y',ay-10);
      set('[data-bridge-a-pillar]','x',90+aw-8); set('[data-bridge-a-pillar]','y',ay); set('[data-bridge-a-pillar]','height',150-ay);
      set('[data-bridge-a-shore]','y',ay); set('[data-bridge-a-shore]','height',150-ay);
      set('[data-bridge-b-span]','x',510-bw); set('[data-bridge-b-span]','width',bw); set('[data-bridge-b-span]','y',by-10);
      set('[data-bridge-b-pillar]','x',510-bw); set('[data-bridge-b-pillar]','y',by); set('[data-bridge-b-pillar]','height',150-by);
      set('[data-bridge-b-shore]','y',by); set('[data-bridge-b-shore]','height',150-by);
      const gap=9-al-bl;
      const geometry=Math.abs(gap)<.00001 ? 'Концы совпадают по горизонтали.' : gap>0 ? `Задание не согласовано с шириной реки: зазор ${format(gap)} м.` : `Задание не согласовано с шириной реки: перекрытие ${format(-gap)} м.`;
      demo.querySelector('[data-bridge-status]').textContent=av===45&&bv===45
        ? 'Мерки одинаковы, геометрия соответствует учебному проекту: обе половины по 4,50 м, обе опоры по 1,35 м. Стык на середине реки.'
        : av===bv ? `Мерки одинаковы. ${geometry} Высоты опор одинаковы: ${format(ah)} м.`
        : `Размеры мерок различаются; высоты опор отличаются на ${format(Math.abs(ah-bh))} м. ${geometry}`;
      demo.querySelector('[data-cubit-common]').setAttribute('aria-pressed',String(av===45&&bv===45));
      demo.querySelector('[data-cubit-reset]').setAttribute('aria-pressed',String(av===38&&bv===52));
    };
    a.addEventListener('input',render); b.addEventListener('input',render);
    demo.querySelector('[data-cubit-common]').addEventListener('click',()=>{a.value=45;b.value=45;render();});
    demo.querySelector('[data-cubit-reset]').addEventListener('click',()=>{a.value=38;b.value=52;render();});
    render();
  }
  const meter=document.querySelector('[data-meter-demo]');
  if(meter){
    const buttons=Array.from(meter.querySelectorAll('[data-meter-era]'));
    const panels=Array.from(meter.querySelectorAll('[data-meter-panel]'));
    buttons.forEach(button=>button.addEventListener('click',()=>{
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      panels.forEach(panel=>{panel.hidden=panel.dataset.meterPanel!==button.dataset.meterEra;});
      meter.querySelector('[data-meter-status]').textContent=`Выбран способ: ${button.textContent}. Сохраняется преемственность размера единицы.`;
    }));
    panels.forEach((panel,i)=>{panel.hidden=i!==0;});
  }
})();
