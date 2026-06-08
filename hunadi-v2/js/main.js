/* ═══════════════════════════════════════════
   HUNADI — FOR YOU 💙  v2
   main.js
═══════════════════════════════════════════ */

/* ── 1. STAR CANVAS ── */
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const stars = [];
  const COUNT = 150;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
    };
  }

  function init() { resize(); stars.length = 0; for (let i = 0; i < COUNT; i++) stars.push(makeStar()); }

  let raf, lastT = 0;
  function draw(t) {
    const dt = t - lastT; lastT = t;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed * (dt || 16);
      const a = 0.12 + 0.75 * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  init();
  raf = requestAnimationFrame(draw);
  const ro = new ResizeObserver(init);
  ro.observe(document.body);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else { lastT = 0; raf = requestAnimationFrame(draw); }
  });
})();


/* ── 2. PAGE SWITCHING ── */
let currentPage = 1;

function showPage(num, btn) {
  if (num === currentPage) return;
  const leaving  = document.getElementById('page' + currentPage);
  const arriving = document.getElementById('page' + num);

  leaving.classList.remove('active');
  leaving.classList.add('exiting');

  setTimeout(() => {
    leaving.classList.remove('exiting');
    arriving.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    currentPage = num;
    observeReveal();
  }, 290);

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-current', 'page');
}


/* ── 3. INTERSECTION OBSERVER REVEAL ── */
function observeReveal() {
  const targets = document.querySelectorAll(
    '.memory-card:not(.visible), .quote-strip:not(.visible), ' +
    '.promise-item:not(.visible), .progress-wrap:not(.visible), ' +
    '.final-card:not(.visible), .mood-section:not(.visible), ' +
    '.form-card:not(.visible)'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add('visible'), +el.dataset.delay || 0);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => io.observe(el));
}

// Stagger delays (5 memory cards now)
document.querySelectorAll('.memory-card').forEach((el, i)  => el.dataset.delay = i * 95);
document.querySelectorAll('.promise-item').forEach((el, i) => el.dataset.delay = i * 75);

window.addEventListener('DOMContentLoaded', observeReveal);


/* ── 4. PROMISES & PROGRESS ── */
const TOTAL = 6;
let checkedCount = 0;

function togglePromise(el) {
  const wasChecked = el.classList.contains('checked');
  el.classList.toggle('checked');
  el.setAttribute('aria-checked', String(!wasChecked));
  checkedCount = wasChecked ? checkedCount - 1 : checkedCount + 1;

  if (!wasChecked) burstHearts(el);

  const pct = (checkedCount / TOTAL) * 100;
  document.querySelector('.progress-bar-fill').style.width = pct + '%';
  document.querySelector('.progress-count').textContent = checkedCount + ' / ' + TOTAL;

  if (checkedCount === TOTAL) {
    setTimeout(launchConfetti, 400);
    setTimeout(() => {
      if (!document.querySelector('.reward-msg')) {
        const msg = document.createElement('p');
        msg.className = 'reward-msg';
        msg.textContent = '✅ She checked them all. He better not forget. 😤💙';
        document.querySelector('.accept-btn').insertAdjacentElement('afterend', msg);
      }
    }, 700);
  }
}

// keyboard support for promises
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('promise-item')) {
    e.preventDefault();
    togglePromise(e.target);
  }
});


/* ── 5. HEARTS BURST ── */
function burstHearts(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const symbols = ['💙','💙','💙','✨','💫','🌟'];

  for (let i = 0; i < 9; i++) {
    const h = document.createElement('span');
    h.className = 'burst-heart';
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist  = 55 + Math.random() * 85;
    h.style.cssText = `
      left:${cx}px; top:${cy}px;
      --tx:${(Math.cos(angle)*dist).toFixed(1)}px;
      --ty:${(Math.sin(angle)*dist).toFixed(1)}px;
      --rot:${(Math.random()*70-35).toFixed(1)}deg;
      animation-delay:${i*45}ms;
    `;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2700);
  }
}


/* ── 6. CONFETTI ── */
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const colors = ['#3a7bd5','#00c9c8','#ff9eb5','#c8e3ff','#ffd700','#ffffff'];
  const pieces = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 200,
    r: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltSpeed: Math.random() * 0.12 + 0.05,
    speed: Math.random() * 3.5 + 2,
    opacity: 1,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed; p.tilt += p.tiltSpeed; p.x += Math.sin(p.tilt) * 1.5;
      if (frame > 90) p.opacity -= 0.008;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.45, p.tilt, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    frame++;
    if (frame < 220) requestAnimationFrame(draw);
    else { canvas.style.display = 'none'; }
  }
  requestAnimationFrame(draw);
}


/* ── 7. ACCEPT BUTTON ── */
function handleAccept() {
  const btn = document.querySelector('.accept-btn');
  if (btn.classList.contains('clicked')) return;
  btn.classList.add('clicked');
  btn.textContent = '💙 She said yes!!';
  launchConfetti();
  burstHearts(btn);
  setTimeout(() => burstHearts(btn), 350);
  setTimeout(() => burstHearts(btn), 700);
}


/* ── 8. MOOD SELECTOR ── */
function selectMood(el) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const emoji = el.querySelector('.mood-emoji').textContent;
  const name  = el.querySelector('.mood-name').textContent;
  document.getElementById('hidden-mood').value = emoji + ' ' + name;
  burstHearts(el);
}


/* ── 9. TEXTAREA CHAR COUNT ── */
const msgArea  = document.getElementById('her-message');
const charDisp = document.getElementById('char-count');
const MAX_CHARS = 1000;

if (msgArea && charDisp) {
  msgArea.addEventListener('input', () => {
    const left = MAX_CHARS - msgArea.value.length;
    charDisp.textContent = left + ' characters left';
    charDisp.classList.toggle('warn', left < 80);
    if (msgArea.value.length > MAX_CHARS) msgArea.value = msgArea.value.slice(0, MAX_CHARS);
  });
}


/* ── 10. FORMSPREE SUBMIT ── */
const form      = document.getElementById('response-form');
const sendBtn   = document.getElementById('send-btn');
const spinner   = document.getElementById('send-spinner');
const btnText   = document.getElementById('btn-text');
const errorBox  = document.getElementById('form-error');
const formWrap  = document.getElementById('form-wrap');
const successEl = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('her-name').value.trim();
    const msg  = document.getElementById('her-message').value.trim();

    if (!name || !msg) {
      showError('Please fill in your name and message before sending. 💙');
      return;
    }

    // Show loading
    sendBtn.disabled = true;
    spinner.style.display = 'block';
    btnText.textContent = 'Sending…';
    errorBox.style.display = 'none';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        // Success!
        formWrap.style.display = 'none';
        successEl.style.display = 'block';
        launchConfetti();
        setTimeout(() => burstHearts(successEl), 500);
      } else {
        const json = await res.json().catch(() => ({}));
        const msg  = json?.errors?.[0]?.message || 'Something went wrong. Try again.';
        showError(msg);
        resetBtn();
      }
    } catch (err) {
      showError('Could not send — check your connection and try again.');
      resetBtn();
    }
  });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function resetBtn() {
  sendBtn.disabled = false;
  spinner.style.display = 'none';
  btnText.textContent = 'Send to Tebu 💙';
}
