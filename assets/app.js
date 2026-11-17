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
    const practiceLink = document.createElement('a');
    practiceLink.className = 'nav-home';
    practiceLink.href = `${prefix}index.html#practice`;
    practiceLink.textContent = 'Практические работы';
    nav.append(practiceLink, sourceLink);
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
  // Carry an explicit lecture origin across material pages, including new tabs and file://.
  const siteRoot = new URL(prefix || './', window.location.href);
  const validOrigin = value => typeof value === 'string' && /^chapters\/(?:0[0-9]|1[01])\.html(?:#[A-Za-z][A-Za-z0-9_.:-]{0,127})?$/.test(value) ? value : '';
  const materialPage = window.location.pathname.startsWith(`${siteRoot.pathname}materials/`);
  let lectureOrigin = materialPage ? validOrigin(new URL(window.location.href).searchParams.get('from')) : '';
  const returnLinks = Array.from(document.querySelectorAll('a.material-return'));
  if (materialPage && !lectureOrigin && returnLinks.length) {
    const fallback = new URL(returnLinks[0].href, window.location.href);
    if (fallback.origin === siteRoot.origin && fallback.pathname.startsWith(siteRoot.pathname)) {
      lectureOrigin = validOrigin(fallback.pathname.slice(siteRoot.pathname.length) + fallback.hash);
    }
  }
  if (materialPage && lectureOrigin) {
    returnLinks.forEach(link => { link.href = new URL(lectureOrigin, siteRoot).href; });
  }
  let materialLinkNumber = 0;
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== siteRoot.origin || !url.pathname.startsWith(`${siteRoot.pathname}materials/`) || !url.pathname.endsWith('.html')) return;
    let origin = materialPage ? lectureOrigin : '';
    if (/^(?:0[0-9]|1[01])$/.test(current)) {
      materialLinkNumber++;
      if (!link.id) {
        let id = `material-link-${materialLinkNumber}`;
        while (document.getElementById(id)) id += '-return';
        link.id = id;
      }
      link.setAttribute('data-material-origin', 'true');
      origin = validOrigin(`chapters/${current}.html#${link.id}`) || `chapters/${current}.html`;
    }
    if (origin) url.searchParams.set('from', origin);
    else url.searchParams.delete('from');
    link.href = url.href;
  });
  // Fragment navigation must also reveal content inside collapsed disclosures.
  let fragmentScroll = 0;
  const revealFragment = (hash, focus = false) => {
    // A later navigation, including an ordinary fragment, cancels a pending scroll.
    const request = ++fragmentScroll;
    if (!hash || hash === '#') return false;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); }
    catch (_) { return false; }
    const target = document.getElementById(id);
    if (!target) return false;
    const disclosures = [];
    for (let element = target; element; element = element.parentElement) {
      if (element.tagName === 'DETAILS') disclosures.push(element);
    }
    if (!disclosures.length && !target.hasAttribute('data-material-origin')) return false;
    disclosures.reverse().forEach(details => { details.open = true; });
    if (focus) {
      const destination = target.tagName === 'DETAILS' ? target.querySelector('summary') : target;
      if (destination) {
        const temporaryTabindex = !destination.hasAttribute('tabindex') && destination.tabIndex < 0;
        if (temporaryTabindex) {
          destination.setAttribute('tabindex', '-1');
          destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
        }
        destination.focus({ preventScroll: true });
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (request !== fragmentScroll) return;
      const offset = (header ? header.getBoundingClientRect().height : 0) + 16;
      window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: 'instant' });
    }));
    return true;
  };
  window.addEventListener('hashchange', () => revealFragment(window.location.hash));
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
    if (revealFragment(url.hash, true) && url.hash === window.location.hash) event.preventDefault();
  });
  let reloading = false;
  try {
    const timing = window.performance;
    const navigation = timing && timing.getEntriesByType && timing.getEntriesByType('navigation')[0];
    reloading = navigation ? navigation.type === 'reload' : !!(timing && timing.navigation && timing.navigation.type === 1);
  } catch (_) { /* Fragment links remain usable without navigation timing. */ }
  if (reloading) {
    // A saved fragment is not a new request to expand an explanation on refresh.
    let target = null;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
    catch (_) { /* Ignore malformed fragments. */ }
    for (let element = target; element; element = element.parentElement) {
      if (element.tagName === 'DETAILS') element.open = false;
    }
  } else {
    revealFragment(window.location.hash);
    // Local resources may move the target after the first layout.
    window.addEventListener('load', () => revealFragment(window.location.hash), { once: true });
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
