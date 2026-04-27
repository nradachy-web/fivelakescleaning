/* ===== FIVE LAKES CLEANING - MAIN JS v2 ===== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  let lastScroll = 0;
  if (header) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 20);
      lastScroll = y;
    }, { passive: true });
  }

  // --- Mobile menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // --- Scroll animations (IntersectionObserver) ---
  const animatedElements = document.querySelectorAll('.fade-up, .slide-left, .slide-right, .scale-in');
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });
    animatedElements.forEach(el => observer.observe(el));
  }

  // --- Counter animation for stat numbers ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // --- Contact form ---
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      if (!data.name || !data.email || !data.phone || !data.service) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          showNotification('Thank you! We\'ll be in touch within 1 business hour.', 'success');
          form.reset();
        } else {
          showNotification('Something went wrong. Please call us directly.', 'error');
        }
      }).catch(() => {
        showNotification('Something went wrong. Please call us directly.', 'error');
      }).finally(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  // --- Phone click tracking ---
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_to_call', {
          event_category: 'engagement',
          event_label: link.getAttribute('href')
        });
      }
    });
  });

  // --- Pause hero video when out of view for performance ---
  const heroVideo = document.querySelector('.hero-video-bg video');
  if (heroVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroVideo.play();
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0.1 });
    videoObserver.observe(heroVideo);
  }
});

// --- Notification ---
function showNotification(message, type) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const n = document.createElement('div');
  n.className = `notification notification-${type}`;
  n.style.cssText = `
    position: fixed; top: 88px; right: 24px; z-index: 9999;
    padding: 16px 24px; border-radius: 12px;
    font-weight: 600; font-size: 0.9rem;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    animation: notifIn 0.4s cubic-bezier(0.4,0,0.2,1);
    max-width: 380px;
    background: ${type === 'success' ? '#E0FFF8' : '#FEE2E2'};
    color: ${type === 'success' ? '#0A2540' : '#991B1B'};
    border: 1px solid ${type === 'success' ? '#00C9A7' : '#F87171'};
  `;
  n.textContent = message;
  document.body.appendChild(n);

  setTimeout(() => {
    n.style.animation = 'notifOut 0.3s forwards';
    setTimeout(() => n.remove(), 300);
  }, 5000);
}

// --- Inject keyframes ---
const style = document.createElement('style');
style.textContent = `
  @keyframes notifIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes notifOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-10px); } }
`;
document.head.appendChild(style);
