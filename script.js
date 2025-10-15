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

const gasGameForm = document.getElementById('gas-game');

if (gasGameForm) {
  const input = gasGameForm.querySelector('input[type="number"]');
  const feedback = gasGameForm.querySelector('.game__feedback');
  const resetButton = gasGameForm.querySelector('[data-action="reset"]');
  let target = 0;
  let attempts = 0;

  const setFeedback = (message, state = null) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-warning', 'is-error');
    if (state) {
      feedback.classList.add(state);
    }
  };

  const newRound = (message = 'Guess the next base fee between 5 and 200 gwei.') => {
    target = Math.floor(Math.random() * 196) + 5;
    attempts = 0;
    if (input) {
      input.value = '';
    }
    setFeedback(message);
  };

  newRound();

  gasGameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input) return;

    const guess = Number(input.value);
    if (!Number.isFinite(guess)) {
      setFeedback('Enter a numeric guess between 5 and 200 gwei.', 'is-error');
      return;
    }

    if (guess < 5 || guess > 200) {
      setFeedback('Stay within the 5 – 200 gwei window.', 'is-warning');
      return;
    }

    attempts += 1;
    const diff = Math.abs(guess - target);

    if (diff === 0) {
      setFeedback(`Dead on! ${guess} gwei secures the block in ${attempts} ${attempts === 1 ? 'try' : 'tries'}.`, 'is-success');
      window.setTimeout(() => newRound('New mempool intel loaded. Go again when ready.'), 2600);
      return;
    }

    if (diff <= 3) {
      setFeedback(`${guess} gwei is almost there — nudge ${guess < target ? 'higher' : 'lower'} by a few.`, 'is-warning');
    } else if (guess < target) {
      setFeedback(`${guess} gwei is too conservative. Increase your bid.`, null);
    } else {
      setFeedback(`${guess} gwei overshoots the target. Trim it down.`, null);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      newRound('Round reset. Guess the next base fee between 5 and 200 gwei.');
    });
  }
}

const reactionStartButton = document.getElementById('reaction-start');
const reactionPad = document.getElementById('reaction-pad');
const reactionStatus = document.getElementById('reaction-status');

if (reactionStartButton && reactionPad && reactionStatus) {
  let timeoutId;
  let startTime = 0;
  let awaitingGlow = false;
  let readyForTap = false;

  const updateStatus = (message, state = null) => {
    reactionStatus.textContent = message;
    reactionStatus.classList.remove('is-success', 'is-warning', 'is-error');
    if (state) {
      reactionStatus.classList.add(state);
    }
  };

  const resetPad = () => {
    reactionPad.classList.remove('is-primed', 'is-go');
    awaitingGlow = false;
    readyForTap = false;
  };

  reactionStartButton.addEventListener('click', () => {
    window.clearTimeout(timeoutId);
    resetPad();
    reactionPad.classList.add('is-primed');
    awaitingGlow = true;
    updateStatus('Sequencer primed. Wait for the glow…');

    const delay = Math.random() * 2000 + 1200;
    timeoutId = window.setTimeout(() => {
      awaitingGlow = false;
      readyForTap = true;
      startTime = performance.now();
      reactionPad.classList.remove('is-primed');
      reactionPad.classList.add('is-go');
      reactionPad.focus();
      updateStatus('Go! Execute the tap!', 'is-success');
    }, delay);
  });

  const handleAttempt = () => {
    if (awaitingGlow) {
      window.clearTimeout(timeoutId);
      resetPad();
      updateStatus('Too soon! Pulse has not landed yet. Prime again.', 'is-warning');
      return;
    }

    if (readyForTap) {
      const elapsed = performance.now() - startTime;
      resetPad();
      updateStatus(`Reaction time: ${Math.round(elapsed)} ms. Prime again to beat it.`, 'is-success');
      return;
    }

    updateStatus('Prime the network first to start a new round.', 'is-warning');
  };

  reactionPad.addEventListener('click', handleAttempt);
  reactionPad.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleAttempt();
    }
  });
}

const contractVideos = document.querySelectorAll('video[data-contract-sequence]');

if (contractVideos.length) {
  const canvasSupport = typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined';
  const supportsCapture = canvasSupport && typeof MediaRecorder !== 'undefined' && 'captureStream' in document.createElement('canvas');

  const drawSequenceFrame = (ctx, width, height, progress, variant) => {
    const phase = progress * Math.PI * 2;
    ctx.clearRect(0, 0, width, height);

    const backdropGradient = ctx.createLinearGradient(0, 0, width, height);
    backdropGradient.addColorStop(0, '#080a16');
    backdropGradient.addColorStop(1, '#101528');
    ctx.fillStyle = backdropGradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
    glow.addColorStop(0, 'rgba(127, 90, 240, 0.25)');
    glow.addColorStop(1, 'rgba(127, 90, 240, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (variant === 'vault') {
      const orbitRadius = width * 0.22;
      const centerY = height * 0.48;
      const nodes = [
        { label: 'Deposits', angle: phase, color: '#7f5af0' },
        { label: 'Yield', angle: phase + (Math.PI * 2) / 3, color: '#2cb1ff' },
        { label: 'Hedging', angle: phase + (Math.PI * 4) / 3, color: '#6fedc6' },
      ];

      ctx.strokeStyle = 'rgba(127, 90, 240, 0.35)';
      ctx.beginPath();
      ctx.arc(width / 2, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      nodes.forEach((node) => {
        const x = width / 2 + Math.cos(node.angle) * orbitRadius;
        const y = centerY + Math.sin(node.angle) * (orbitRadius * 0.6);
        ctx.strokeStyle = `${node.color}55`;
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.82);
        ctx.quadraticCurveTo(width / 2, centerY, x, y);
        ctx.stroke();

        const pulseSize = 16 + Math.sin(phase * 2 + node.angle) * 4;
        const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        nodeGradient.addColorStop(0, `${node.color}aa`);
        nodeGradient.addColorStop(1, `${node.color}11`);
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '500 18px "Space Grotesk", "Poppins", sans-serif';
        ctx.fillText(node.label, x - 36, y - 22);
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(width / 2 - 110, height * 0.74, 220, 80);
      ctx.strokeStyle = 'rgba(127, 90, 240, 0.45)';
      ctx.strokeRect(width / 2 - 110, height * 0.74, 220, 80);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 26px "Space Grotesk", "Poppins", sans-serif';
      ctx.fillText('Vault Automation', 32, 52);
      ctx.font = '400 18px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(200, 210, 255, 0.75)';
      ctx.fillText('Deposits · Streaming yield · Hedging', 32, 80);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '500 20px "Space Grotesk", "Poppins", sans-serif';
      ctx.fillText('Intent Router', width / 2 - 74, height * 0.79);
      ctx.font = '400 16px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(200, 210, 255, 0.7)';
      ctx.fillText('Risk Guardrails', width / 2 - 76, height * 0.82);
    } else if (variant === 'perps') {
      const baseline = height * 0.65;
      const amplitude = height * 0.18;
      const segments = 60;
      ctx.beginPath();
      for (let i = 0; i <= segments; i += 1) {
        const ratio = i / segments;
        const x = ratio * width;
        const angle = phase * 3 + ratio * Math.PI * 4;
        const y = baseline - Math.sin(angle) * amplitude * (0.5 + Math.sin(phase + ratio * 2) * 0.2);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = 'rgba(44, 177, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();

      const markerX = ((Math.sin(phase) + 1) / 2) * width;
      const markerAngle = phase * 3 + (markerX / width) * Math.PI * 4;
      const markerY = baseline - Math.sin(markerAngle) * amplitude * 0.7;
      ctx.fillStyle = 'rgba(127, 90, 240, 0.25)';
      ctx.fillRect(markerX - 50, markerY - 80, 100, 160);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 26px "Space Grotesk", "Poppins", sans-serif';
      ctx.fillText('Perps Router', 32, 52);
      ctx.font = '400 18px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(200, 210, 255, 0.75)';
      ctx.fillText('Netting · Limits · Funding offsets', 32, 80);

      ctx.fillStyle = 'rgba(111, 237, 198, 0.6)';
      ctx.beginPath();
      ctx.arc(markerX, markerY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(111, 237, 198, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '500 16px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(200, 210, 255, 0.8)';
      ctx.fillText('Exposure', markerX - 36, markerY - 24);
    } else {
      const nodes = [
        { x: width * 0.25, y: height * 0.35, label: 'Compliance' },
        { x: width * 0.75, y: height * 0.32, label: 'Treasury' },
        { x: width * 0.3, y: height * 0.72, label: 'Vendors' },
        { x: width * 0.7, y: height * 0.72, label: 'Analytics' },
      ];

      const linkPulse = (Math.sin(phase * 2) + 1) / 2;

      const drawLink = (from, to, color) => {
        ctx.strokeStyle = `${color}${Math.floor(155 + linkPulse * 100).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3 + linkPulse * 2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(width / 2, height / 2, to.x, to.y);
        ctx.stroke();
      };

      drawLink(nodes[0], nodes[1], '#7f5af0');
      drawLink(nodes[0], nodes[2], '#ffd166');
      drawLink(nodes[1], nodes[3], '#2cb1ff');
      drawLink(nodes[2], nodes[3], '#6fedc6');

      nodes.forEach((node, index) => {
        const pulse = 22 + Math.sin(phase * 2 + index) * 4;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulse);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(12, 14, 24, 0.75)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '600 20px "Space Grotesk", "Poppins", sans-serif';
        ctx.fillText(node.label, node.x - 60, node.y - 26);
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 26px "Space Grotesk", "Poppins", sans-serif';
      ctx.fillText('Treasury Pipelines', 32, 52);
      ctx.font = '400 18px "Poppins", sans-serif';
      ctx.fillStyle = 'rgba(200, 210, 255, 0.75)';
      ctx.fillText('Screening · Batching · Onchain attest', 32, 80);
    }
  };

  const createRecorder = (stream) => {
    const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const type of types) {
      if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type)) {
        try {
          return new MediaRecorder(stream, { mimeType: type });
        } catch (error) {
          // continue trying other mime types
        }
      }
    }
    try {
      return new MediaRecorder(stream);
    } catch (error) {
      return null;
    }
  };

  const createFallbackCanvas = (variant) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Live simulation of ${variant} contract flow`);

    const loop = () => {
      const now = performance.now();
      const progress = ((now / 4000) % 1);
      drawSequenceFrame(ctx, canvas.width, canvas.height, progress, variant);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return canvas;
  };

  const synthesizeClip = (video) => {
    const container = video.parentElement;
    if (!container) return;

    const width = 640;
    const height = 360;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const stream = canvas.captureStream(30);
    const recorder = createRecorder(stream);
    if (!recorder) {
      const fallback = createFallbackCanvas(video.dataset.contractSequence || 'vault');
      container.replaceChild(fallback, video);
      container.classList.add('is-loaded');
      return;
    }

    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
      const objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('aria-label', `Contract simulation: ${video.dataset.contractSequence}`);
      video.addEventListener('loadeddata', () => {
        container.classList.add('is-loaded');
      });
      const playVideo = () => {
        video.play().catch(() => {
          /* ignore autoplay restrictions */
        });
      };
      if (document.readyState === 'complete') {
        playVideo();
      } else {
        window.addEventListener('load', playVideo, { once: true });
      }
    };

    const totalDuration = 4000;
    let start;

    const animate = (timestamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / totalDuration, 1);
      drawSequenceFrame(ctx, width, height, progress, video.dataset.contractSequence || 'vault');
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        window.setTimeout(() => recorder.stop(), 120);
      }
    };

    try {
      recorder.start();
    } catch (error) {
      const fallback = createFallbackCanvas(video.dataset.contractSequence || 'vault');
      container.replaceChild(fallback, video);
      container.classList.add('is-loaded');
      return;
    }

    requestAnimationFrame(animate);
  };

  contractVideos.forEach((video) => {
    if (supportsCapture) {
      synthesizeClip(video);
    } else if (canvasSupport) {
      const container = video.parentElement;
      if (!container) return;
      const fallback = createFallbackCanvas(video.dataset.contractSequence || 'vault');
      container.replaceChild(fallback, video);
      container.classList.add('is-loaded');
    }
  });
}
