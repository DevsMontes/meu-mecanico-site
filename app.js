(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.menu-toggle'), nav = $('#nav-links');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  nav.addEventListener('focusout', e => {
    if (!nav.contains(e.relatedTarget) && e.relatedTarget !== menu) closeMenu();
  });
  // WordPress archive templates share the navigation but not the homepage widgets.
  if (!$('.hero')) return;

  // Accessible native tabs: pointer, touch and roving keyboard focus.
  const tabs = $$('.care-tabs [role="tab"]');
  function selectTab(tab, focus = false) {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectTab(tabs[next], true); }
    });
  });

  // The page is visible without JavaScript. Motion is an optional enhancement.
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-seen'); revealObserver.unobserve(entry.target); }
    }), {threshold: .08});
    if (!reduced.matches) $$('.reveal').forEach(el => revealObserver.observe(el));
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('a', nav).forEach(a => {
        if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }), {rootMargin: '-20% 0px -45% 0px'});
    $$('main > section[id]').forEach(el => sectionObserver.observe(el));
    const stepsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.journey-step').forEach(el => el.classList.toggle('is-active', el === entry.target));
        const counter = $('.journey-counter');
        counter.firstChild.textContent = entry.target.dataset.step;
      });
    }, {rootMargin: '-30% 0px -35% 0px'});
    $$('.journey-step').forEach(el => stepsObserver.observe(el));
  }
  let ticking = false;
  function renderScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress i').style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    const photo = $('.hero-image img'), hero = $('.hero');
    if (!reduced.matches && innerWidth > 850 && scrollY > 1 && scrollY < hero.offsetHeight) {
      photo.style.transform = `translateY(${Math.min(scrollY * .08, 55)}px) scale(1.035)`;
    } else { photo.style.transform = ''; }
    ticking = false;
  }
  function scheduleScroll() { if (!ticking) { ticking = true; requestAnimationFrame(renderScroll); } }
  addEventListener('scroll', scheduleScroll, {passive:true});
  addEventListener('resize', scheduleScroll, {passive:true});
  reduced.addEventListener('change', scheduleScroll);
  renderScroll();

  const track = $('.gallery-track'), previous = $('#gallery-prev'), next = $('#gallery-next');
  function galleryState() {
    previous.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  function moveGallery(direction) {
    const item = $('figure', track);
    track.scrollBy({left:direction * (item.getBoundingClientRect().width + 24),behavior:reduced.matches?'instant':'smooth'});
  }
  previous.addEventListener('click', () => moveGallery(-1));
  next.addEventListener('click', () => moveGallery(1));
  track.addEventListener('scroll', galleryState, {passive:true});
  addEventListener('resize', galleryState, {passive:true});
  galleryState();

  const contactDialog = $('#contact-dialog'), photoDialog = $('#photo-dialog');
  let dialogTrigger;
  function openDialog(dialog, trigger) {
    dialogTrigger = trigger; dialog.showModal(); document.body.classList.add('modal-open');
    $('[data-close]', dialog).focus();
  }
  $$('[data-open-contact]').forEach(button => button.addEventListener('click', () => {
    if (typeof contactDialog.showModal !== 'function') { location.href='https://wa.me/5561981181027'; return; }
    openDialog(contactDialog, button);
  }));
  $$('.gallery-open').forEach(button => button.addEventListener('click', () => {
    if (typeof photoDialog.showModal !== 'function') return;
    $('#photo-full').src = button.dataset.photo;
    $('#photo-full').alt = $('img', button).alt;
    $('#photo-caption').textContent = button.dataset.caption;
    openDialog(photoDialog, button);
  }));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  [contactDialog,photoDialog].forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (dialogTrigger?.isConnected) dialogTrigger.focus({preventScroll:true});
    });
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const b=dialog.getBoundingClientRect();
      if (e.clientX<b.left || e.clientX>b.right || e.clientY<b.top || e.clientY>b.bottom) dialog.close();
    });
  });
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const vehicle = $('#vehicle').value.trim(), reason = $('#reason').value, observation = $('#observation').value.trim();
    let message = `Olá! Conheci o site da Meu Mecânico e gostaria de conversar sobre ${reason}.`;
    if (vehicle) message += `\nMeu carro: ${vehicle}.`;
    if (observation) message += `\n${observation}`;
    const url = 'https://wa.me/5561981181027?text=' + encodeURIComponent(message);
    // Opens a draft in WhatsApp; no message is sent automatically.
    window.open(url,'_blank','noopener,noreferrer');
  });
})();
