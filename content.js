/**
 * WaitMate Content Script - Enhanced Version
 * Handles the loading overlay, interactive particles, adaptive messaging, and progress bar.
 */

(function () {
  const GENERIC_MESSAGES = [
    "Thinking...", "Overthinking...", "Convincing the server...",
    "Loading... but emotionally.", "Analyzing life choices...",
    "Reticulating splines...", "Detecting procrastination...", "Preparing pixels...",
    "Warming up the internet...", "Downloading patience...", "Please wait... or don’t.",
    "Summoning content...", "Negotiating with the server...", "This could have been instant...",
    "Making things look fast...", "Probably worth the wait..."
  ];

  const SITE_SPECIFIC = {
    "youtube.com": "Buffering dopamine from {site}...",
    "x.com": "Loading opinions from {site}...",
    "twitter.com": "Loading opinions from {site}...",
    "linkedin.com": "Generating motivation for {site}...",
    "reddit.com": "Loading arguments on {site}...",
    "amazon.com": "Checking fake reviews on {site}...",
    "chatgpt.com": "Asking AI to ask AI about {site}...",
    "openai.com": "Asking AI to ask AI about {site}...",
    "google.com": "Googling your Google on {site}..."
  };

  const MOOD_MESSAGES = {
    impatient: [
      "Still here? Me too.",
      "The server is taking a nap...",
      "Maybe try refreshing? (Just kidding, don't).",
      "Is your wifi okay?",
      "Checking under the rug for data..."
    ],
    existential: [
      "Is the content even worth it?",
      "We are all just bits in a machine.",
      "Time is a flat circle. Especially now.",
      "What if it never loads?",
      "Lost in the digital void..."
    ]
  };

  const AI_SEQUENCE = [
    "Analyzing page...",
    "Reading content...",
    "Checking if useful...",
    "Detecting ads...",
    "Final verdict: Loading anyway..."
  ];

  const FAST_LOAD_MESSAGES = [
    "That was fast.",
    "You have good internet.",
    "WaitMate didn’t even get time to think.",
    "Speed: Illegal.",
    "Teach me your WiFi."
  ];

  let startTime = Date.now();
  let isAiSequenceActive = false;
  let isRemoving = false;
  let aiSequenceIndex = 0;
  let progress = 0;
  let overlay, messageEl, progressBar, canvas, ctx;
  let particles = [];
  let mouse = { x: 0, y: 0 };

  function createOverlay() {
    if (document.getElementById('waitmate-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'waitmate-overlay';

    // Particle Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'waitmate-canvas';
    overlay.appendChild(canvas);

    // Glow effect
    const glow = document.createElement('div');
    glow.id = 'waitmate-overlay-glow';
    overlay.appendChild(glow);

    const container = document.createElement('div');
    container.id = 'waitmate-container';

    // Loader
    const loader = document.createElement('div');
    loader.className = 'waitmate-loader';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'waitmate-dot';
        loader.appendChild(dot);
    }

    // Message
    messageEl = document.createElement('div');
    messageEl.id = 'waitmate-message';
    messageEl.textContent = getAdaptiveMessage();

    // Progress
    const progressContainer = document.createElement('div');
    progressContainer.id = 'waitmate-progress-container';
    progressBar = document.createElement('div');
    progressBar.id = 'waitmate-progress-bar';
    progressContainer.appendChild(progressBar);

    const subtext = document.createElement('div');
    subtext.id = 'waitmate-subtext';
    subtext.textContent = "WaitMate Loading Engine v2.0";

    container.appendChild(loader);
    container.appendChild(messageEl);
    container.appendChild(progressContainer);
    container.appendChild(subtext);
    overlay.appendChild(container);

    (document.head || document.documentElement).appendChild(overlay);

    setupParticles();
    
    overlay.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      overlay.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      overlay.style.setProperty('--mouse-y', `${(e.innerHeight / window.innerHeight) * 100}%`);
    });
  }

  function getAdaptiveMessage() {
    const elapsed = (Date.now() - startTime) / 1000;
    const hostname = window.location.hostname.replace('www.', '');
    const siteName = hostname.split('.')[0].toUpperCase();

    if (elapsed > 7) {
      return MOOD_MESSAGES.existential[Math.floor(Math.random() * MOOD_MESSAGES.existential.length)];
    } else if (elapsed > 4) {
      return MOOD_MESSAGES.impatient[Math.floor(Math.random() * MOOD_MESSAGES.impatient.length)];
    }

    // Check site specific
    for (const key in SITE_SPECIFIC) {
      if (hostname.includes(key)) {
        return SITE_SPECIFIC[key].replace('{site}', siteName);
      }
    }

    // Default
    let msg = GENERIC_MESSAGES[Math.floor(Math.random() * GENERIC_MESSAGES.length)];
    if (Math.random() > 0.5) {
       msg = msg.replace('...', ` ${siteName}...`);
    }
    return msg;
  }

  function updateMessage() {
    if (!messageEl || isRemoving) return;

    messageEl.classList.add('msg-fade');
    
    setTimeout(() => {
      let nextMsg;
      
      if (!isAiSequenceActive && Math.random() < 0.15) {
        isAiSequenceActive = true;
        aiSequenceIndex = 0;
      }

      if (isAiSequenceActive) {
        nextMsg = AI_SEQUENCE[aiSequenceIndex];
        aiSequenceIndex++;
        if (aiSequenceIndex >= AI_SEQUENCE.length) isAiSequenceActive = false;
      } else {
        nextMsg = getAdaptiveMessage();
      }

      messageEl.textContent = nextMsg;
      messageEl.classList.remove('msg-fade');
    }, 300);
  }

  // Particle System
  function setupParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    particles = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    function animate() {
      if (!document.getElementById('waitmate-overlay')) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Mouse attraction (subtle)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += dx * 0.01;
          p.y += dy * 0.01;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  function animateProgress() {
    if (!progressBar) return;
    if (progress < 90) {
      progress += Math.random() * (90 - progress) / 15;
      progressBar.style.width = progress + '%';
      setTimeout(animateProgress, 400 + Math.random() * 600);
    }
  }

  function removeOverlay() {
    if (!overlay || isRemoving) return;
    isRemoving = true;
    
    const elapsed = Date.now() - startTime;
    let delay = 300;

    // Fast load handling
    if (elapsed < 1000) {
      if (messageEl) {
        messageEl.textContent = FAST_LOAD_MESSAGES[Math.floor(Math.random() * FAST_LOAD_MESSAGES.length)];
      }
      delay = 1200; // Give them time to read the fast message
    }

    if (progressBar) progressBar.style.width = '100%';
    
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 600);
    }, delay);
  }

  // Init
  createOverlay();
  animateProgress();
  const messageInterval = setInterval(updateMessage, 2000);

  window.addEventListener('load', () => {
    clearInterval(messageInterval);
    removeOverlay();
  });

  // Handle resize for canvas
  window.addEventListener('resize', () => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  // Safety
  setTimeout(() => {
    if (document.getElementById('waitmate-overlay')) {
      clearInterval(messageInterval);
      removeOverlay();
    }
  }, 12000);
})();
