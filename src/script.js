// ── PAGE SWITCHING ───────────────────────────────────────────
const navbar  = document.getElementById('navbar');
const pages   = document.querySelectorAll('.page');
const navTabs = document.querySelectorAll('.nav-tab');

function switchPage(targetId, pushHistory) {
  if (pushHistory === undefined) pushHistory = true;

  pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(targetId);
  if (!target) return;
  target.classList.add('active');

  window.scrollTo(0, 0);

  if (targetId === 'page-home') {
    navbar.classList.remove('scrolled');
    setTimeout(resizeCanvas, 10);
  } else {
    navbar.classList.add('scrolled');
  }

  navTabs.forEach(tab => {
    tab.classList.toggle('nav-active', tab.dataset.target === targetId);
  });

  const fadeEls = target.querySelectorAll('.fade-in');
  fadeEls.forEach((el, i) => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), i * 70);
  });
  setTimeout(() => observeFadeIns(target), 50);

  if (targetId === 'page-publications') {
    document.querySelectorAll('#page-publications .pub-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.filter === 'all'));
    applyPubFilter('all');
  }

  if (pushHistory) {
    const hash = targetId.replace('page-', '');
    history.pushState({ page: targetId }, '', hash === 'home' ? '#' : '#' + hash);
  }
}

window.addEventListener('popstate', e => {
  const page = e.state?.page || 'page-home';
  switchPage(page, false);
});

// ── MEGA MENU ───────────────────────────────────────────────
const megaMenu = document.getElementById('mega-menu');

if (megaMenu) {
  navbar.addEventListener('mouseenter', () => {
    if (window.innerWidth >= 768) {
      megaMenu.classList.add('open');
    }
  });
  navbar.addEventListener('mouseleave', () => {
    megaMenu.classList.remove('open');
  });

  megaMenu.addEventListener('click', e => {
    const link = e.target.closest('.mega-link');
    if (!link) return;
    e.preventDefault();

    const target = link.dataset.target;
    if (target) switchPage(target);

    if (link.classList.contains('mega-boardtab') && link.dataset.subtab) {
      switchBoardPanel(link.dataset.subtab);
    }
    if (link.classList.contains('mega-filtertab') && link.dataset.filter) {
      const filter = link.dataset.filter;
      document.querySelectorAll('#page-publications .pub-tab')
        .forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
      applyPubFilter(filter);
    }

    megaMenu.classList.remove('open');
  });
}

// ── NAVBAR SCROLL (home page only) ──────────────────────────
window.addEventListener('scroll', () => {
  const homePage = document.getElementById('page-home');
  if (homePage.classList.contains('active')) {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
}, { passive: true });

// ── SCROLL-TRIGGERED ANIMATIONS ─────────────────────────────
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = (parseInt(el.dataset.delay) || 0) * 120;
      setTimeout(() => el.classList.add('visible'), delay);
      scrollObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeFadeIns(root) {
  root.querySelectorAll('.fade-in').forEach(el => {
    if (!el.classList.contains('visible')) scrollObserver.observe(el);
  });
}
observeFadeIns(document.querySelector('.page.active') || document.body);

// ── GO TO TOP ────────────────────────────────────────────────
const goTopBtn = document.getElementById('go-top');
window.addEventListener('scroll', () => {
  goTopBtn.classList.toggle('visible', window.scrollY > 200);
}, { passive: true });
goTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── HAMBURGER MENU ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.body.addEventListener('click', e => {
  const tab = e.target.closest('.nav-tab[data-target]');
  if (tab) {
    e.preventDefault();
    switchPage(tab.dataset.target);
    document.querySelectorAll('.has-dropdown').forEach(li => li.classList.remove('open'));
    navLinks.classList.remove('open');
    return;
  }
  const li = e.target.closest('.has-dropdown');
  if (li && li.closest('#navbar')) {
    const isOpen = li.classList.contains('open');
    document.querySelectorAll('.has-dropdown').forEach(el => el.classList.remove('open'));
    if (!isOpen) li.classList.add('open');
    return;
  }
  document.querySelectorAll('.has-dropdown').forEach(el => el.classList.remove('open'));
});

// ── HERO SCROLL HINT ─────────────────────────────────────────
const heroScrollHint = document.getElementById('hero-scroll-hint');
if (heroScrollHint) {
  heroScrollHint.addEventListener('click', () => {
    const teaserSection = document.querySelector('#page-home .teaser-section');
    if (teaserSection) teaserSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── HERO CANVAS (star-field) ─────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas ? canvas.getContext('2d') : null;
const stars  = [];
const STAR_COUNT = 150;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function createStar() {
  const roll = Math.random();
  let r, da;
  if (roll < 0.12) {
    r  = Math.random() * 1.2 + 1.8;
    da = (Math.random() - 0.5) * 0.010;
  } else if (roll < 0.50) {
    r  = Math.random() * 0.6 + 0.8;
    da = (Math.random() - 0.5) * 0.005;
  } else {
    r  = Math.random() * 0.55 + 0.15;
    da = (Math.random() - 0.5) * 0.003;
  }
  return {
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    r, a: Math.random(), da,
    vx: (Math.random() - 0.5) * 0.08,
    vy: (Math.random() - 0.5) * 0.08,
  };
}

function initCanvas() {
  if (!canvas) return;
  resizeCanvas();
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());
}

function drawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.a += s.da;
    s.a = Math.max(0.05, Math.min(1, s.a));
    if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
    if (s.x < 0) s.x = canvas.width;
    if (s.x > canvas.width) s.x = 0;
    if (s.y < 0) s.y = canvas.height;
    if (s.y > canvas.height) s.y = 0;

    // Glow halo for larger stars
    if (s.r > 1.4) {
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
      glow.addColorStop(0, `rgba(255,255,255,${s.a * 0.22})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core dot
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();

    // Cross sparkle for the brightest large stars
    if (s.r > 2.2) {
      ctx.strokeStyle = `rgba(255,255,255,${s.a * 0.5})`;
      ctx.lineWidth = 0.5;
      const len = s.r * 4;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
      ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
      ctx.stroke();
    }
  });

  requestAnimationFrame(drawCanvas);
}

if (canvas) {
  window.addEventListener('resize', resizeCanvas);
  initCanvas();
  drawCanvas();
}

// ── ABOUT TABS ────────────────────────────────────────────────
function switchAboutPanel(panel) {
  document.querySelectorAll('.about-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.about-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('about-panel-' + panel);
  if (target) target.classList.add('active');
  document.querySelectorAll(`.about-tab[data-panel="${panel}"]`).forEach(t => t.classList.add('active'));
}

function initAboutTabs() {
  document.querySelectorAll('.about-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAboutPanel(tab.dataset.panel));
  });
  document.querySelectorAll('.about-subtab').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage('page-about');
      navLinks.classList.remove('open');
      const panel = link.dataset.subtab;
      setTimeout(() => switchAboutPanel(panel), 60);
    });
  });
}

// ── NEWS MODAL ────────────────────────────────────────────────
// NEWS is injected as a global from the template

function openNewsModal(index) {
  if (typeof NEWS === 'undefined' || !NEWS[index]) return;
  const item = NEWS[index];
  const monthNum = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
                    Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};

  const modal   = document.getElementById('gallery-modal');
  const imgWrap = document.getElementById('gallery-modal-img-wrap');

  imgWrap.innerHTML = `<div class="news-card-placeholder" style="width:100%;height:100%">
    <span>${item.month}</span><span>${item.year}</span>
  </div>`;

  document.getElementById('gallery-modal-date').textContent  = `${item.year}-${monthNum[item.month] || '??'}`;
  document.getElementById('gallery-modal-title').textContent = item.title;
  document.getElementById('gallery-modal-text').textContent  = item.text;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── GALLERY MODAL ─────────────────────────────────────────────
// GALLERY is injected as a global from the template

function openGalleryModal(index) {
  if (typeof GALLERY === 'undefined' || !GALLERY[index]) return;
  const item   = GALLERY[index];
  const modal  = document.getElementById('gallery-modal');
  const imgWrap = document.getElementById('gallery-modal-img-wrap');
  const parts  = item.date.split(' ');

  imgWrap.innerHTML = item.cover
    ? `<img src="${item.cover}" alt="${item.title}" />`
    : `<div class="news-card-placeholder" style="width:100%;height:100%"><span>${parts[0]}</span><span>${parts.slice(1).join(' ')}</span></div>`;

  document.getElementById('gallery-modal-date').textContent  = item.date;
  document.getElementById('gallery-modal-title').textContent = item.title;
  document.getElementById('gallery-modal-text').textContent  = item.body;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
  document.getElementById('gallery-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  document.getElementById('gallery-modal-close').addEventListener('click', closeGalleryModal);
  document.getElementById('gallery-modal-backdrop').addEventListener('click', closeGalleryModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGalleryModal(); });
}

// ── BOARD PANEL SWITCHING ─────────────────────────────────────
function switchBoardPanel(panelId) {
  document.querySelectorAll('#board-tabs .pub-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.panel === panelId));
  document.querySelectorAll('.board-panel').forEach(p =>
    p.classList.toggle('active', p.id === 'board-panel-' + panelId));
  const panel = document.getElementById('board-panel-' + panelId);
  if (panel) {
    panel.querySelectorAll('.fade-in:not(.visible)').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 70);
    });
  }
}

function initBoardTabs() {
  document.querySelectorAll('#board-tabs .pub-tab').forEach(tab => {
    tab.addEventListener('click', () => switchBoardPanel(tab.dataset.panel));
  });
  document.querySelectorAll('.board-subtab').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage('page-board');
      navLinks.classList.remove('open');
      const panel = link.dataset.subtab;
      setTimeout(() => switchBoardPanel(panel), 60);
    });
  });
}

// ── PUBLICATION FILTERING (year-groups now mix pub types) ──────
function applyPubFilter(filter) {
  document.querySelectorAll('.pub-item').forEach(i =>
    i.classList.toggle('hidden', filter !== 'all' && i.dataset.type !== filter));
  document.querySelectorAll('.pub-year-group').forEach(g =>
    g.classList.toggle('hidden', !g.querySelector('.pub-item:not(.hidden)')));
}

// ── PUB FILTER NAV ────────────────────────────────────────────
function initPubFilterNav() {
  document.querySelectorAll('.pub-filtertab').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage('page-publications');
      navLinks.classList.remove('open');
      const filter = link.dataset.filter;
      setTimeout(() => {
        const tabs = document.querySelectorAll('#page-publications .pub-tab');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
        applyPubFilter(filter);
      }, 60);
    });
  });
}

// ── PUBLICATION TABS ─────────────────────────────────────────
function initPubTabs() {
  const tabs = document.querySelectorAll('#page-publications .pub-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyPubFilter(tab.dataset.filter);
    });
  });
}

// ── PROJECT TABS (toggles pre-rendered groups) ────────────────
function initProjTabs() {
  document.querySelectorAll('.proj-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.proj-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter    = tab.dataset.filter;
      const ongoing   = document.getElementById('projects-ongoing');
      const completed = document.getElementById('projects-completed');
      if (ongoing)   ongoing.classList.toggle('hidden',   filter !== 'ongoing');
      if (completed) completed.classList.toggle('hidden', filter !== 'completed');
      const activeGroup = document.getElementById('projects-' + filter);
      if (activeGroup) {
        activeGroup.querySelectorAll('.fade-in:not(.visible)').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 60);
        });
      }
    });
  });
}

// ── INITIAL SETUP ─────────────────────────────────────────────
initPubTabs();
initProjTabs();
observeFadeIns(document.getElementById('page-home'));
initAboutTabs();
initBoardTabs();
initPubFilterNav();
initGalleryModal();

(function handleInitialHash() {
  const hash = window.location.hash.replace('#', '');
  const validPages = ['about','research','projects','publications','board','contact'];
  if (hash && validPages.includes(hash)) {
    switchPage('page-' + hash, false);
  } else {
    navbar.classList.remove('scrolled');
  }
})();
