
// Hamburger menu functionality with sidebar overlay
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('sidebarOverlay');

  function openMenu() {
    hamburgerMenu?.classList.add('active');
    mobileMenu?.classList.add('active');
    hamburgerMenu?.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    hamburgerMenu?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    hamburgerMenu?.setAttribute('aria-expanded', 'false');
  }

  if (hamburgerMenu && mobileMenu) {
    hamburgerMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileMenu.classList.contains('active');
      if (open) closeMenu(); else openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    overlay?.addEventListener('click', closeMenu);

    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('active')) return;
      const header = document.querySelector('header.header');
      if (header && !header.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const form = document.getElementById('forumForm');
  const list = document.getElementById('forumList');
  function renderComments() {

    if (!list) return;
    const comments = JSON.parse(localStorage.getItem('zen_comments') || '[]');
    list.innerHTML = comments.map(c => `<div class="forum-item"><strong>${escapeHtml(c.name)}</strong><div style="font-size:14px;margin-top:6px">${escapeHtml(c.msg)}</div><div style="font-size:12px;color:#777;margin-top:8px">${c.time}</div></div>`).join('') || '<div style="padding:12px;color:#777">No hay comentarios aún.</div>';
  }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m]; }); }
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim() || 'Anónimo';
      const msg = document.getElementById('message').value.trim();
      if (!msg) return alert('Escribe un mensaje antes de enviar.');
      const comments = JSON.parse(localStorage.getItem('zen_comments') || '[]');
      comments.unshift({ name, msg, time: new Date().toLocaleString() });
      localStorage.setItem('zen_comments', JSON.stringify(comments));
      document.getElementById('message').value = '';
      renderComments();
    });
  }
  renderComments();


  function limitItemsToFit() {
    document.querySelectorAll('.grid.single-row').forEach(grid => {
      const cards = Array.from(grid.children).filter(n => n.nodeType === 1);
      if (cards.length === 0) return;
      const gridStyle = getComputedStyle(grid);
      const gap = parseFloat(gridStyle.gap || gridStyle.columnGap) || 20;
      const containerWidth = grid.clientWidth;


      let cardMin = 220;
      try {
        const cs = getComputedStyle(cards[0]);
        const mw = cs.minWidth;
        if (mw && mw.endsWith('px')) cardMin = parseFloat(mw);
        else cardMin = Math.max(cards[0].getBoundingClientRect().width || cardMin, cardMin);
      } catch (e) {/* ignore */ }

      const slot = cardMin + gap;
      let fit = Math.max(1, Math.floor((containerWidth + gap) / slot));


      fit = Math.min(fit, cards.length);

      cards.forEach((c, i) => {
        c.style.display = i < fit ? '' : 'none';
      });
    });
  }


  limitItemsToFit();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(limitItemsToFit, 120);
  });


  document.querySelectorAll('.toggle-details').forEach(btn => {
    btn.addEventListener('click', e => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const details = btn.nextElementSibling;
      if (details) {
        if (expanded) {
          details.setAttribute('hidden', '');
        } else {
          details.removeAttribute('hidden');
        }
      }
    });
  });


  function loadMetasState() {
    try { return JSON.parse(localStorage.getItem('zen_metas') || '{}'); }
    catch (e) { return {}; }
  }
  function saveMetasState(state) {
    try { localStorage.setItem('zen_metas', JSON.stringify(state)); } catch (e) { }
  }

  function updateMetaButton(btn, done) {
    if (done) {
      btn.textContent = 'Hecho';
      btn.classList.add('meta-done');
    } else {
      btn.textContent = 'Marcar como hecho';
      btn.classList.remove('meta-done');
    }
  }


  (function initMetas() {

    const calendar = loadCalendar();
    const todayKey = isoDate(new Date());
    document.querySelectorAll('.card[data-id]').forEach(card => {
      const id = card.getAttribute('data-id');
      const btn = card.querySelector('.meta-toggle');
      const doneToday = Array.isArray(calendar[todayKey]) && calendar[todayKey].indexOf(id) !== -1;
      if (btn) updateMetaButton(btn, doneToday);
      if (btn) {
        btn.addEventListener('click', () => {
          // reload calendar state and toggle only today's date for this meta
          const cal = loadCalendar();
          const key = isoDate(new Date());
          const list = cal[key] = Array.isArray(cal[key]) ? cal[key] : [];
          const idx = list.indexOf(id);
          let nowDone;
          if (idx === -1) {
            list.push(id);
            nowDone = true;
          } else {
            list.splice(idx, 1);
            nowDone = false;
          }
          if (cal[key].length === 0) delete cal[key];
          saveCalendar(cal);
          updateMetaButton(btn, nowDone);
          renderCalendar();
        });
      }
    });
  })();


  function loadCalendar() {
    try { return JSON.parse(localStorage.getItem('zen_metas_calendar') || '{}'); } catch (e) { return {}; }
  }
  function saveCalendar(cal) {
    try { localStorage.setItem('zen_metas_calendar', JSON.stringify(cal)); } catch (e) { }
  }

  function isoDate(d) {
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dt.toISOString().slice(0, 10);
  }


  function addDateToCalendar(d, metaId) {
    if (!metaId) return;
    const cal = loadCalendar();
    const key = isoDate(d);
    cal[key] = cal[key] || [];
    if (cal[key].indexOf(metaId) === -1) cal[key].push(metaId);
    saveCalendar(cal);
  }
  function removeDateFromCalendar(d, metaId) {
    if (!metaId) return;
    const cal = loadCalendar();
    const key = isoDate(d);
    if (!Array.isArray(cal[key])) return;
    const idx = cal[key].indexOf(metaId);
    if (idx !== -1) cal[key].splice(idx, 1);
    if (cal[key].length === 0) delete cal[key];
    saveCalendar(cal);
  }

  function renderCalendar() {
    const el = document.getElementById('metasCalendar');
    if (!el) return;
    const cal = loadCalendar();

    const now = new Date();
    const monthToShow = (typeof renderCalendar.viewMonth === 'number') ? renderCalendar.viewMonth : now.getMonth();
    const yearToShow = (typeof renderCalendar.viewYear === 'number') ? renderCalendar.viewYear : now.getFullYear();

    const first = new Date(yearToShow, monthToShow, 1);
    const last = new Date(yearToShow, monthToShow + 1, 0);

    const labelEl = document.getElementById('calMonthLabel');
    if (labelEl) labelEl.textContent = first.toLocaleString(undefined, { month: 'long', year: 'numeric' });


    let html = '';
    const startWeekday = first.getDay();
    for (let i = 0; i < startWeekday; i++) html += `<div class="day" style="visibility:hidden"></div>`;
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(yearToShow, monthToShow, d);
      const key = isoDate(date);
      const metaIds = Array.isArray(cal[key]) ? cal[key] : [];
      const active = metaIds.length > 0;

      let listHtml = '';
      if (metaIds.length) {
        listHtml = '<div class="meta-list">' + metaIds.map(id => {
          const titleEl = document.querySelector(`.card[data-id="${id}"] h3, .card[data-id="${id}"] .recipe-title, .card[data-id="${id}"] h2`);
          const title = titleEl ? titleEl.textContent.trim() : id;
          return `<div class="meta-item">${escapeHtml(title)}</div>`;
        }).join('') + '</div>';
      }
      html += `<div class="day${active ? ' active' : ''}" title="${key}" data-date="${key}"><div class="day-number">${d}</div>${listHtml}</div>`;
    }
    el.innerHTML = html;
  }


  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');

  const now = new Date();
  renderCalendar.viewMonth = now.getMonth();
  renderCalendar.viewYear = now.getFullYear();
  if (calPrev) calPrev.addEventListener('click', () => {
    let m = renderCalendar.viewMonth; let y = renderCalendar.viewYear;
    m--; if (m < 0) { m = 11; y--; }
    renderCalendar.viewMonth = m; renderCalendar.viewYear = y; renderCalendar();
  });
  if (calNext) calNext.addEventListener('click', () => {
    let m = renderCalendar.viewMonth; let y = renderCalendar.viewYear;
    m++; if (m > 11) { m = 0; y++; }
    renderCalendar.viewMonth = m; renderCalendar.viewYear = y; renderCalendar();
  });

  renderCalendar();
});
