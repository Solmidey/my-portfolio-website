const navToggle = document.querySelector('.site-nav__toggle');
const navMenu = document.querySelector('.site-nav__menu');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const prefersFinePointer = window.matchMedia
  ? window.matchMedia('(pointer: fine)').matches
  : false;

if (prefersFinePointer) {
  const projectCards = document.querySelectorAll('[data-tilt]');

  const handleTilt = (event) => {
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const percentX = (event.clientX - centerX) / (bounds.width / 2);
    const percentY = (event.clientY - centerY) / (bounds.height / 2);

    const inner = card.querySelector('.project-card__inner');
    if (!inner) return;

    inner.style.transform = `rotateX(${percentY * -6}deg) rotateY(${percentX * 6}deg) translateY(-6px)`;
  };

  const resetTilt = (card) => {
    const inner = card.querySelector('.project-card__inner');
    if (!inner) return;
    inner.style.transform = '';
  };

  projectCards.forEach((card) => {
    card.addEventListener('pointermove', handleTilt);
    card.addEventListener('pointerleave', () => resetTilt(card));
  });

  const galleryCards = document.querySelectorAll('.gallery-card');

  const parallax = (event) => {
    galleryCards.forEach((card) => {
      const depth = Number(card.dataset.depth || 0.5);
      const bounds = card.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const percentX = (event.clientX - centerX) / (bounds.width / 2);
      const percentY = (event.clientY - centerY) / (bounds.height / 2);

      card.style.transform = `translate3d(${percentX * depth * 12}px, ${percentY * depth * 12}px, 0)`;
    });
  };

  document.addEventListener('pointermove', parallax);

  galleryCards.forEach((card) => {
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const revealElements = document.querySelectorAll('.panel, .timeline-item, .project-card, .gallery-card');

revealElements.forEach((el) => el.classList.add('will-reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const statusElement = contactForm.querySelector('.form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const endpoint = 'https://formsubmit.co/ajax/olorunfemiosolomon@gmail.com';

  contactForm.addEventListener('submit', async (event) => {
    if (!statusElement) return;

    event.preventDefault();
    statusElement.textContent = 'Sending message…';
    statusElement.classList.remove('is-error');

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      statusElement.textContent = 'Message sent! I will respond soon.';
      contactForm.reset();

      window.setTimeout(() => {
        if (statusElement.textContent === 'Message sent! I will respond soon.') {
          statusElement.textContent = '';
        }
      }, 8000);
    } catch (error) {
      statusElement.textContent = 'Something went wrong. Email me directly at olorunfemiosolomon@gmail.com.';
      statusElement.classList.add('is-error');
      console.error(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
