/* Сцена и квадратичные пути из лекционной анимации; физическая орбита не рассчитывается. */
(() => {
  'use strict';
  const root=document.querySelector('[data-mco-demo]');
  if(!root)return;
  const probe=root.querySelector('#marsProbe');
  const warning=root.querySelector('#marsFireball');
  const completed=root.querySelector('#marsOrbitOk');
  const receiver=root.querySelector('[data-mco-receiver]');
  const status=root.querySelector('[data-mco-status]');
  const buttons=Array.from(root.querySelectorAll('[data-mco-mode]'));
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0, mode='metric';
  const cancel=()=>{if(frame)cancelAnimationFrame(frame);frame=0;};
  const clearEffects=()=>{warning.setAttribute('opacity','0');completed.setAttribute('opacity','0');};
  const position=t=>{
    const p0={x:35,y:190};
    const p1=mode==='imperial'?{x:250,y:115}:{x:230,y:42};
    const p2=mode==='imperial'?{x:430,y:100}:{x:490,y:43};
    const inv=1-t;
    const x=inv*inv*p0.x+2*inv*t*p1.x+t*t*p2.x;
    const y=inv*inv*p0.y+2*inv*t*p1.y+t*t*p2.y;
    const angle=Math.atan2(2*inv*(p1.y-p0.y)+2*t*(p2.y-p1.y),2*inv*(p1.x-p0.x)+2*t*(p2.x-p1.x))*180/Math.PI;
    probe.setAttribute('transform',`translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${(angle+90).toFixed(1)})`);
  };
  const finish=()=>{
    position(1);
    (mode==='imperial'?warning:completed).setAttribute('opacity','1');
    status.textContent=mode==='imperial'
      ? 'Ошибочное прочтение: программа приняла 100 Н·с вместо приблизительно 444,822 Н·с. Импульс недооценён примерно в 4,44822 раза. Аппарат достиг конца условного ошибочного пути.'
      : 'Перевод единиц выполнен: 100 lbf·s ≈ 444,822 Н·с. Аппарат достиг конца условного согласованного пути. Исправление этой ошибки само по себе не гарантирует успех миссии.';
  };
  const launch=selected=>{
    cancel();clearEffects();mode=selected;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mcoMode===mode)));
    root.querySelector('#marsArcMetric').setAttribute('stroke-opacity',mode==='metric'?'.95':'.2');
    root.querySelector('#marsArcImperial').setAttribute('stroke-opacity',mode==='imperial'?'.95':'.2');
    receiver.textContent=mode==='metric'?'≈ 444,822 Н·с — правильный перевод':'100 Н·с — ошибочное прочтение числа';
    status.textContent=mode==='metric'?'Показ условного пути при правильном переводе единиц.':'Показ условного пути при ошибочном прочтении: импульс недооценён примерно в 4,44822 раза.';
    position(0);
    if(reduce.matches){finish();return;}
    const start=performance.now();
    const tick=now=>{
      const t=Math.min(1,(now-start)/1800);
      position(t);
      if(t<1)frame=requestAnimationFrame(tick);
      else{frame=0;finish();}
    };
    frame=requestAnimationFrame(tick);
  };
  buttons.forEach(button=>button.addEventListener('click',()=>launch(button.dataset.mcoMode)));
  const stop=()=>{cancel();status.textContent='Движение остановлено. Выберите режим для нового запуска или сбросьте схему.';};
  root.querySelector('[data-mco-stop]').addEventListener('click',stop);
  root.querySelector('[data-mco-reset]').addEventListener('click',()=>{
    cancel();clearEffects();position(0);buttons.forEach(button=>button.setAttribute('aria-pressed','false'));
    receiver.textContent='Выберите режим запуска';
    status.textContent='Схема сброшена. Физический импульс в обоих режимах: учебные 100 lbf·s ≈ 444,822 Н·с.';
  });
  const motionChanged=()=>{if(reduce.matches&&frame){cancel();finish();}};
  if(reduce.addEventListener)reduce.addEventListener('change',motionChanged);else reduce.addListener(motionChanged);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)stop();});
  position(0);clearEffects();
})();
