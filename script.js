/* ==========================================================================
   NOIR & VINE — site behavior
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header shrink on scroll ---------- */
  const header = document.querySelector('.site-header');
  const toTopBtn = document.querySelector('.to-top');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    if (toTopBtn){
      if (window.scrollY > 600) toTopBtn.classList.add('visible');
      else toTopBtn.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTopBtn){
    toTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks){
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Active nav link highlighting ---------- */
  const current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')){
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Menu page: category filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  if (filterBtns.length && menuItems.length){
    const applyFilter = (filter) => {
      menuItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('show', match);
      });
      document.querySelectorAll('.menu-course').forEach(course => {
        const visible = course.querySelectorAll('.menu-item.show').length > 0;
        course.style.display = visible ? '' : 'none';
      });
    };
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });
    applyFilter('all');
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-answer');
    if (!q || !answer) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-answer').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen){
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Review slider ---------- */
  const slides = document.querySelectorAll('.review-slide');
  const dotsWrap = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  if (slides.length){
    let idx = 0;
    let timer;
    const show = (n) => {
      slides.forEach((s,i) => s.classList.toggle('active', i === n));
      if (dotsWrap){
        dotsWrap.querySelectorAll('button').forEach((d,i) => d.classList.toggle('active', i === n));
      }
      idx = n;
    };
    const next = () => show((idx + 1) % slides.length);
    const prev = () => show((idx - 1 + slides.length) % slides.length);

    if (dotsWrap){
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Show review ${i + 1}`);
        dot.addEventListener('click', () => { show(i); restart(); });
        dotsWrap.appendChild(dot);
      });
    }
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

    function restart(){
      clearInterval(timer);
      timer = setInterval(next, 7000);
    }
    show(0);
    restart();
  }

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector('#contact-form');
  if (form){
    const status = document.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fields = [
        { el: form.querySelector('#name'), error: 'Please tell us your name.' },
        { el: form.querySelector('#email'), error: 'Enter a valid email address.', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { el: form.querySelector('#message'), error: 'Let us know how we can help.' }
      ];

      fields.forEach(({ el, error, pattern }) => {
        if (!el) return;
        const errorEl = el.closest('.form-group').querySelector('.field-error');
        const value = el.value.trim();
        const invalid = !value || (pattern && !pattern.test(value));
        if (invalid){
          valid = false;
          if (errorEl) errorEl.textContent = error;
          el.style.borderColor = 'var(--wine-lt)';
        } else {
          if (errorEl) errorEl.textContent = '';
          el.style.borderColor = 'rgba(247,244,236,0.3)';
        }
      });

      if (valid){
        if (status){
          status.textContent = 'Thank you — your message has been sent. We will reply within one business day.';
          status.classList.add('visible');
        }
        form.reset();
      } else if (status){
        status.classList.remove('visible');
      }
    });
  }

});
