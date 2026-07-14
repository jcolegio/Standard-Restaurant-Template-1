// ==========================================================
// Noir & Vine — script.js
// ==========================================================
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(navToggle && navLinks){
    navToggle.addEventListener('click', ()=>{
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el=> io.observe(el));
  } else {
    revealEls.forEach(el=> el.classList.add('is-visible'));
  }

  /* ---------- To-top button ---------- */
  const toTop = document.querySelector('.to-top');
  if(toTop){
    window.addEventListener('scroll', ()=>{
      toTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive:true });
    toTop.addEventListener('click', ()=>{
      window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Hero 3D tilt (glass + background parallax) ---------- */
  const hero = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero-bg');
  const glassStage = document.querySelector('.glass-stage');
  if(hero && !reduceMotion){
    hero.addEventListener('mousemove', (e)=>{
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      if(heroBg) heroBg.style.transform = `translateZ(-200px) scale(1.28) translate(${-x*20}px, ${-y*20}px)`;
      if(glassStage) glassStage.style.transform = `rotateX(${8 - y*16}deg) rotateY(${-14 + x*24}deg)`;
    });
    hero.addEventListener('mouseleave', ()=>{
      if(heroBg) heroBg.style.transform = 'translateZ(-200px) scale(1.28)';
      if(glassStage) glassStage.style.transform = 'rotateX(8deg) rotateY(-14deg)';
    });
  }

  /* ---------- Pointer tilt for value-item cards ---------- */
  if(!reduceMotion){
    document.querySelectorAll('.value-item').forEach(card=>{
      card.addEventListener('mouseenter', ()=>{ card.style.transition = 'box-shadow .3s'; });
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left)/r.width - 0.5;
        const y = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = `rotateX(${-y*12}deg) rotateY(${x*12}deg)`;
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transition = 'transform .4s ease-out, box-shadow .3s';
        card.style.transform = 'rotateX(0) rotateY(0)';
      });
    });
  }

  /* ---------- Dish cards: 3D flip on click / hover ---------- */
  document.querySelectorAll('.dish-card').forEach(card=>{
    card.setAttribute('tabindex','0');
    const flip = ()=> card.classList.toggle('is-flipped');
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); }
    });
  });

  /* ---------- Review slider: 3D coverflow ---------- */
  const slider = document.querySelector('.review-slider');
  if(slider){
    const slides = Array.from(slider.querySelectorAll('.review-slide'));
    const dotsHost = slider.querySelector('.slider-dots');
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    let current = slides.findIndex(s => s.classList.contains('active'));
    if(current < 0) current = 0;

    if(dotsHost){
      dotsHost.innerHTML = '';
      slides.forEach((_, i)=>{
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to review ${i+1}`);
        dot.addEventListener('click', ()=>{ current = i; render(); });
        dotsHost.appendChild(dot);
      });
    }

    function render(){
      const total = slides.length;
      slides.forEach((slide, i)=>{
        slide.classList.remove('is-active','is-prev','is-next','active');
        if(i === current){ slide.classList.add('is-active','active'); }
        else if(i === (current - 1 + total) % total){ slide.classList.add('is-prev'); }
        else if(i === (current + 1) % total){ slide.classList.add('is-next'); }
      });
      if(dotsHost){
        Array.from(dotsHost.children).forEach((dot, i)=> dot.classList.toggle('active', i === current));
      }
    }
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ current = (current - 1 + slides.length) % slides.length; render(); });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ current = (current + 1) % slides.length; render(); });
    render();

    if(!reduceMotion){
      let autoplay = setInterval(()=>{ current = (current + 1) % slides.length; render(); }, 6000);
      slider.addEventListener('mouseenter', ()=> clearInterval(autoplay));
      slider.addEventListener('mouseleave', ()=>{
        autoplay = setInterval(()=>{ current = (current + 1) % slides.length; render(); }, 6000);
      });
    }
  }

  /* ---------- Live open/closed status near the reserve CTA ---------- */
  const ctaBand = document.querySelector('.cta-band .container');
  if(ctaBand){
    const pill = document.createElement('div');
    pill.className = 'status-pill';
    pill.innerHTML = '<span class="status-dot"></span><span class="status-text"></span>';
    const eyebrow = ctaBand.querySelector('.eyebrow');
    if(eyebrow) eyebrow.after(pill);
    else ctaBand.prepend(pill);

    function updateStatus(){
      const dot = pill.querySelector('.status-dot');
      const text = pill.querySelector('.status-text');
      const now = new Date();
      const day = now.getDay(); // 0 Sun ... 6 Sat
      const minutes = now.getHours()*60 + now.getMinutes();
      const open5 = 17*60 + 30;
      let closeTime, isServiceDay;
      if(day === 2 || day === 3 || day === 4){ closeTime = 22*60; isServiceDay = true; }       // Tue-Thu
      else if(day === 5 || day === 6){ closeTime = 23*60; isServiceDay = true; }                // Fri-Sat
      else { isServiceDay = false; }

      const isOpen = isServiceDay && minutes >= open5 && minutes < closeTime;
      dot.classList.toggle('open', isOpen);
      dot.classList.toggle('closed', !isOpen);
      const timeStr = now.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
      text.textContent = isOpen ? `Open now · ${timeStr}` : `Closed now · ${timeStr}`;
    }
    updateStatus();
    setInterval(updateStatus, 30000);
  }

  /* ---------- Ambient ember canvas ---------- */
  const canvas = document.createElement('canvas');
  canvas.id = 'ember-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const COLORS = ['#c9a227', '#e4c567', '#9c2b3f'];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function makeParticle(){
    return {
      x: Math.random()*w,
      y: h + Math.random()*100,
      r: 1 + Math.random()*2.4,
      speed: 0.25 + Math.random()*0.6,
      drift: (Math.random()-0.5)*0.4,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      alpha: 0.15 + Math.random()*0.4,
      flicker: Math.random()*Math.PI*2
    };
  }
  function init(){
    resize();
    const count = Math.min(60, Math.floor(w/22));
    particles = Array.from({length:count}, ()=>{
      const p = makeParticle();
      p.y = Math.random()*h;
      return p;
    });
  }
  let mouseX = null, mouseY = null;
  window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; });

  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.y -= p.speed;
      p.x += p.drift;
      p.flicker += 0.05;
      if(mouseX !== null){
        const dx = p.x - mouseX, dy = p.y - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 90){
          p.x += (dx/dist) * 1.4;
          p.y += (dy/dist) * 1.4;
        }
      }
      if(p.y < -20){ Object.assign(p, makeParticle(), { y: h + 10 }); }
      const a = p.alpha * (0.6 + 0.4*Math.sin(p.flicker));
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if(!reduceMotion) requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  init();
  if(!reduceMotion){
    requestAnimationFrame(tick);
  } else {
    // draw a single static frame for texture, then stop
    tick = null;
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      ctx.beginPath(); ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
})();
