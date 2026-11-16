/* Общая навигация. Обычный скрипт: работает и при открытии через file://. */
(() => {
  'use strict';
  const chapters = [
    'Введение: история метрологии', 'Метрология', 'Величины и единицы', 'Измерительные шкалы', 'Измерение',
    'Результаты измерений', 'Погрешность измерения', 'Средства измерительной техники',
    'Эталоны', 'Прослеживаемость', 'Государственное регулирование',
    'Организационные основы обеспечения единства измерений'
  ];
  const current = document.body.dataset.chapter || '';
  const prefix = current ? '../' : '';
  const header = document.getElementById('site-header');
  const nav = document.getElementById('site-nav');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `<a class="brand" href="${prefix}index.html"><span class="brand-mark" aria-hidden="true">м</span><span>Метрология<small>Электронное пособие</small></span></a><div class="header-actions"><button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false">Оглавление <span aria-hidden="true">☰</span></button></div>`;
  }
  if (nav) {
    document.body.classList.add('has-navigation');
    nav.innerHTML = `<a class="nav-home" href="${prefix}index.html"${!current ? ' aria-current="page"' : ''}>Обзор пособия</a><p class="nav-label">Оглавление</p><label class="search-label" for="chapter-search">Найти главу</label><input id="chapter-search" type="search" placeholder="Название или номер" autocomplete="off"><ol class="chapter-list">${chapters.map((title, i) => {
      const id = String(i).padStart(2, '0');
      return `<li data-search="${id} ${i} ${title.toLocaleLowerCase('ru')}"><a href="${prefix}chapters/${id}.html"${current === id ? ' aria-current="page"' : ''}><span class="nav-number" aria-hidden="true">${id}</span><span>${title}</span></a></li>`;
    }).join('')}</ol><p class="search-result" role="status" aria-live="polite"></p>`;
    const sourceLink = document.createElement('a');
    sourceLink.className = 'nav-home';
    sourceLink.href = `${prefix}sources.html`;
    sourceLink.textContent = 'Об издании и источники';
    if (document.body.dataset.page === 'sources') {
      sourceLink.setAttribute('aria-current', 'page');
      nav.querySelector('.nav-home').removeAttribute('aria-current');
    }
    nav.append(sourceLink);
    const search = nav.querySelector('input');
    const items = Array.from(nav.querySelectorAll('li'));
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е');
      let count = 0;
      items.forEach(item => {
        item.hidden = !item.dataset.search.replace(/ё/g, 'е').includes(query);
        if (!item.hidden) count++;
      });
      nav.querySelector('.search-result').textContent = query ? (count ? `Найдено глав: ${count}` : 'Главы не найдены. Измените запрос.') : '';
    });
  }
  const main = document.getElementById('main');
  if (current && main && !main.querySelector('.page-contents')) {
    const headings = Array.from(main.querySelectorAll('h2,h3'));
    if (headings.length) {
      const contents = document.createElement('nav');
      contents.className = 'page-contents';
      contents.setAttribute('aria-label', 'В этой главе');
      const title = document.createElement('p');
      title.textContent = 'В этой главе';
      contents.append(title);
      const list = document.createElement('ol');
      headings.forEach((heading, i) => {
        if (!heading.id) heading.id = `section-${i + 1}`;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        item.append(link);
        list.append(item);
      });
      contents.append(list);
      const chapterHeader = main.querySelector('.chapter-header');
      if (chapterHeader) chapterHeader.after(contents);
      else main.prepend(contents);
    }
  }
  const toggle = document.querySelector('.menu-toggle');
  if (toggle && nav) {
    const narrow = window.matchMedia('(max-width: 760px)');
    const storageKey = 'metrology-desktop-navigation';
    let desktopOpen = true;
    let mobileOpen = false;
    try {
      desktopOpen = window.localStorage.getItem(storageKey) !== 'closed';
    } catch (_) { /* Навигация работает и без доступа к хранилищу. */ }
    const renderNavigation = () => {
      const open = narrow.matches ? mobileOpen : desktopOpen;
      if (!open && nav.contains(document.activeElement)) toggle.focus();
      document.body.classList.toggle('menu-open', narrow.matches && open);
      document.body.classList.toggle('navigation-collapsed', !narrow.matches && !open);
      nav.hidden = !open;
      nav.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      const label = open ? 'Скрыть оглавление' : 'Показать оглавление';
      toggle.textContent = narrow.matches ? 'Оглавление' : label;
      toggle.setAttribute('aria-label', label);
    };
    const setOpen = open => {
      if (narrow.matches) mobileOpen = open;
      else {
        desktopOpen = open;
        try {
          window.localStorage.setItem(storageKey, open ? 'open' : 'closed');
        } catch (_) { /* Выбранное состояние сохраняется в текущей странице. */ }
      }
      renderNavigation();
    };
    renderNavigation();
    const changeBreakpoint = () => {
      mobileOpen = false;
      renderNavigation();
    };
    if (narrow.addEventListener) narrow.addEventListener('change', changeBreakpoint);
    else narrow.addListener(changeBreakpoint);
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => {
      if (narrow.matches && event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', event => {
      if (narrow.matches && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
  }
})();
