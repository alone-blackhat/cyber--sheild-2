/**
 * CyberShield Awareness Login Page - Core Logic
 * High-performance vanilla JS for background canvas (Matrix + Nodes),
 * UI interactions, custom ripple effects, and dynamic cyber safety tips.
 */

// Cyber Safety Tips Database
const CYBER_TIPS = [
  "Enable Multi-Factor Authentication (MFA) everywhere. It prevents over 99.9% of automated account takeover attacks.",
  "Use a unique, long passphrase for every key account. Combining four random words is stronger and easier to remember.",
  "Always inspect the sender's complete email domain before clicking links. Phishing attacks rely on urgent, fake domains.",
  "Never type sensitive login credentials on public Wi-Fi without an active, encrypted Virtual Private Network (VPN).",
  "Ensure your browser has HTTPS active. Check the padlock icon before entering credentials on any website.",
  "Keep your operating system, browser, and security firmware updated. Zero-day exploits target unpatched software.",
  "Be suspicious of unsolicited files or attachments, especially macros (.docm, .xlsm) or executables disguised as PDFs.",
  "A secure password manager helps prevent clipboard sniffing and stops you from entering keys on phishing copies."
];

// Load random Cyber Safety Tip
function initCyberSafetyTip() {
  const tipTextEl = document.getElementById('safety-tip-text');
  if (tipTextEl) {
    const randomIndex = Math.floor(Math.random() * CYBER_TIPS.length);
    tipTextEl.textContent = CYBER_TIPS[randomIndex];
  }
}

// Interactive Ripple Effect for Buttons
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  // Remove existing ripples if any
  const ripples = button.getElementsByClassName("ripple");
  for (let r of ripples) {
    r.remove();
  }

  button.appendChild(circle);
}

// Show Custom Notification Toast
function showNotification(message, type = 'info', duration = 4000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `notification-toast ${type}`;
  
  let iconSvg = '';
  if (type === 'error') {
    iconSvg = `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else if (type === 'success') {
    iconSvg = `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger Slide-in Animation
  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  // Auto-remove Toast
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, duration);
}

// Password Field Visibility Toggle
function initPasswordToggle() {
  const passwordInput = document.getElementById('password-input');
  const toggleBtn = document.getElementById('password-toggle');
  
  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Update SVG Icon based on state
      if (type === 'text') {
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  }
}

// Background Dual-system Canvas (Matrix Code Rain + Floating Nodes Graph)
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;

  // Set sizing
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 1. Matrix Code Rain Configuration
  const matrixChars = "0101110010101011000101101ABCDEFUXZ&%#@$*";
  const charArray = matrixChars.split("");
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize) + 1;
  let drops = [];
  
  // Initialize drops position
  function initDrops() {
    columns = Math.floor(canvas.width / fontSize) + 1;
    drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // staggered offset above screen
    }
  }
  initDrops();

  // Handle columns updates on resize
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastWidth) > 50) {
      initDrops();
      lastWidth = window.innerWidth;
    }
  });

  // 2. Network Node Particle System Configuration
  const particles = [];
  const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
  const maxDistance = 120;
  
  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Dual-system Draw loop
  let lastTime = 0;
  const fpsInterval = 1000 / 30; // Limit matrix rain draw to 30fps for authentic look

  function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Part A: Network Node Particles (Needs 60fps for smooth flow) ---
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting lines between close nodes
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // --- Part B: Matrix Code Rain (Drawn at 30fps for look & performance) ---
    if (timestamp - lastTime > fpsInterval) {
      // We overlay character strings in canvas
      lastTime = timestamp;
    }

    // Always draw Matrix characters to avoid flickering
    ctx.font = `bold ${fontSize}px var(--font-mono)`;
    ctx.shadowBlur = 0;

    for (let i = 0; i < drops.length; i++) {
      // Pick random glyph
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      
      // Determine green/cyan glow mix
      const isLead = Math.random() > 0.98;
      ctx.fillStyle = isLead ? '#ffffff' : (i % 2 === 0 ? 'rgba(0, 242, 254, 0.15)' : 'rgba(57, 255, 20, 0.15)');
      
      if (isLead) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 242, 254, 1)';
      }

      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      ctx.shadowBlur = 0; // Reset

      // Increment drops
      drops[i]++;

      // Reset drops returning to top after reaching bottom with randomized offsets
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  // Start loop
  animationId = requestAnimationFrame(animate);
}

// Interactive Mouse Parallax for ambient atmosphere
function initMouseParallax() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return;

  const wrapper = document.querySelector('.login-card-wrapper');
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;

    // Soft tilt on Card
    if (wrapper) {
      const rotX = y * 12; // 12 degrees max
      const rotY = -x * 12;
      wrapper.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(0)`;
    }

    // Glows follow mouse slightly
    if (glow1) {
      glow1.style.transform = `translate(${x * 80}px, ${y * 50}px) scale(1)`;
    }
    if (glow2) {
      glow2.style.transform = `translate(${x * -100}px, ${y * -60}px) scale(1.1)`;
    }
  });

  // Reset card transition when mouse leaves
  const mainEl = document.querySelector('main');
  if (mainEl && wrapper) {
    mainEl.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      wrapper.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    mainEl.addEventListener('mouseenter', () => {
      wrapper.style.transition = 'none';
    });
  }
}

// Handle Form Submission and Cyber Security Simulation Flow
function initFormSubmit() {
  const form = document.getElementById('login-form');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderStatus = document.getElementById('loader-status');

  if (form && loaderOverlay && loaderStatus) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email-input');
      const passwordInput = document.getElementById('password-input');

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Basic client-side checks
      if (!email) {
        showNotification('Identity Email address is required.', 'error');
        emailInput.focus();
        return;
      }

      if (!password) {
        showNotification('Security passphrase is required.', 'error');
        passwordInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Invalid cyber identity format.', 'error');
        emailInput.focus();
        return;
      }

      // Enter simulation loading state
      loaderOverlay.classList.add('active');
      
      const steps = [
        "Initializing secure handshake...",
        "Establishing encrypted TLS tunnel...",
        "Resolving server keys in Zero-Trust zone...",
        "Decrypting authentication payload...",
        "Querying simulated CyberShield ledger...",
        "Verifying device biometrics hash...",
        "ACCESS SECURED. Decryption successful!"
      ];

      let currentStep = 0;
      loaderStatus.textContent = steps[0];

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          loaderStatus.textContent = steps[currentStep];
        } else {
          clearInterval(interval);
          // Hide spinner
          loaderOverlay.classList.remove('active');
          
          // Clear form fields
          emailInput.value = '';
          passwordInput.value = '';
          emailInput.blur();
          passwordInput.blur();

          // Show Success notification
          showNotification(`CyberShield Node Connected: Welcoming back user: ${email}`, 'success');
          
          // Redirect to dashboard page
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1500);
        }
      }, 550); // cycle through gorgeous cyber phases
    });
  }
}

// Social Buttons simulation feedbacks
function initSocialButtons() {
  const googleBtn = document.getElementById('google-login');
  const githubBtn = document.getElementById('github-login');

  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      createRipple(e);
      showNotification('Google Sign-In simulation requested.', 'info');
    });
  }

  if (githubBtn) {
    githubBtn.addEventListener('click', (e) => {
      createRipple(e);
      showNotification('GitHub Sign-In simulation requested.', 'info');
    });
  }
}

// Bind Ripple handlers to relevant interactive controls
function initRippleButtons() {
  const buttons = document.querySelectorAll('.btn-login, .social-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', createRipple);
  });
}

// DOMContentLoaded Entry point
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initPasswordToggle();
  initCyberSafetyTip();
  initMouseParallax();
  initFormSubmit();
  initSocialButtons();
  initRippleButtons();

  // Welcome toast on load
  setTimeout(() => {
    showNotification('CyberShield Gateway Active. Welcome back.', 'info', 3500);
  }, 1000);
});
