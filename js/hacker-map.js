/**
 * Premium 3D Earth Globe Live SOC Attack Matrix Simulation Engine
 * Implements a high-performance 3D orthographic projected Globe on HTML5 Canvas
 * with custom mathematical rotation matrices, uniform-density continental dot mapping,
 * drag-to-rotate inertia, scroll-to-zoom, 3D atmospheric halo, glowing parallels/meridians,
 * 3D Bezier attack curves, flowing tracer particles, and synchronized 3D impact shockwaves.
 *
 * Fully integrated with the Cyber Shield Dashboard controls, counters, and telemetry log.
 * Optimized for locked 60 FPS, zero external dependencies, and complete memory hygiene.
 */

(function () {
  // Original continent boundaries in flat 1000x500 space
  const CONTINENTS = {
    northAmerica: [
      { x: 80, y: 100 }, { x: 140, y: 60 }, { x: 220, y: 60 }, { x: 280, y: 50 },
      { x: 340, y: 100 }, { x: 310, y: 140 }, { x: 340, y: 180 }, { x: 280, y: 220 },
      { x: 240, y: 230 }, { x: 220, y: 260 }, { x: 190, y: 240 }, { x: 170, y: 200 },
      { x: 140, y: 180 }, { x: 100, y: 140 }
    ],
    southAmerica: [
      { x: 240, y: 250 }, { x: 280, y: 260 }, { x: 320, y: 300 }, { x: 350, y: 350 },
      { x: 310, y: 430 }, { x: 280, y: 460 }, { x: 260, y: 440 }, { x: 240, y: 370 },
      { x: 220, y: 320 }, { x: 225, y: 275 }
    ],
    greenland: [
      { x: 310, y: 45 }, { x: 360, y: 35 }, { x: 400, y: 40 }, { x: 380, y: 75 },
      { x: 330, y: 65 }
    ],
    africa: [
      { x: 450, y: 240 }, { x: 510, y: 210 }, { x: 570, y: 230 }, { x: 610, y: 270 },
      { x: 600, y: 340 }, { x: 550, y: 400 }, { x: 500, y: 410 }, { x: 470, y: 370 },
      { x: 430, y: 310 }, { x: 435, y: 270 }
    ],
    eurasia: [
      { x: 410, y: 110 }, { x: 470, y: 80 }, { x: 540, y: 70 }, { x: 640, y: 55 },
      { x: 740, y: 55 }, { x: 860, y: 75 }, { x: 910, y: 95 }, { x: 940, y: 140 },
      { x: 910, y: 230 }, { x: 850, y: 270 }, { x: 790, y: 300 }, { x: 730, y: 290 },
      { x: 690, y: 270 }, { x: 650, y: 250 }, { x: 600, y: 220 }, { x: 540, y: 210 },
      { x: 450, y: 200 }, { x: 420, y: 170 }, { x: 400, y: 130 }
    ],
    australia: [
      { x: 770, y: 330 }, { x: 840, y: 320 }, { x: 870, y: 350 }, { x: 850, y: 400 },
      { x: 790, y: 400 }, { x: 750, y: 360 }
    ],
    indiaSE: [
      { x: 650, y: 230 }, { x: 700, y: 230 }, { x: 720, y: 265 }, { x: 680, y: 275 }
    ]
  };

  // High-fidelity node mappings using actual world coordinates
  const MAP_NODES = [
    { id: 'was', name: 'Washington SOC', lon: -77.03, lat: 38.90, country: 'USA', color: '#00ffcc' },
    { id: 'lon', name: 'London Core', lon: -0.12, lat: 51.50, country: 'GBR', color: '#38bdf8' },
    { id: 'fra', name: 'Frankfurt Relay', lon: 8.68, lat: 50.11, country: 'DEU', color: '#22d3ee' },
    { id: 'tok', name: 'Tokyo Ingress', lon: 139.69, lat: 35.67, country: 'JPN', color: '#ff3366' },
    { id: 'syd', name: 'Sydney Relay', lon: 151.20, lat: -33.86, country: 'AUS', color: '#38bdf8' },
    { id: 'cpt', name: 'Cape Town Endpoint', lon: 18.42, lat: -33.92, country: 'ZAF', color: '#00ffcc' },
    { id: 'sao', name: 'Sao Paulo Host', lon: -46.63, lat: -23.55, country: 'BRA', color: '#10b981' },
    { id: 'sin', name: 'Singapore Gateway', lon: 103.85, lat: 1.35, country: 'SGP', color: '#ff3366' },
    { id: 'rey', name: 'Reykjavik Node', lon: -21.82, lat: 64.14, country: 'ISL', color: '#22d3ee' },
    { id: 'mum', name: 'Mumbai Shield', lon: 72.87, lat: 19.07, country: 'IND', color: '#10b981' }
  ];

  const ATTACK_TYPES = [
    { name: 'DDOS Volumetric Flood', risk: 'CRITICAL', color: '#ef4444', port: 80 },
    { name: 'Brute-Force SSH Ingress', risk: 'HIGH', color: '#f59e0b', port: 22 },
    { name: 'SQL Injection Pipeline Probe', risk: 'HIGH', color: '#f59e0b', port: 443 },
    { name: 'Phishing Credential Harvest', risk: 'MODERATE', color: '#3b82f6', port: 25 },
    { name: 'Ransomware Payload Ingestion', risk: 'CRITICAL', color: '#ef4444', port: 445 },
    { name: 'Zero-Day LDAP Remote Exploit', risk: 'CRITICAL', color: '#ef4444', port: 389 },
    { name: 'Kubernetes API Gate Bypass', risk: 'HIGH', color: '#f59e0b', port: 6443 }
  ];

  // Helper: Ray casting algorithm for point-in-polygon verification
  function isPointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
        (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Helper: Convert geographic spherical coordinates to unit Cartesian coordinates
  function getUnitCartesian(lon, lat) {
    const lambda = lon * Math.PI / 180;
    const phi = lat * Math.PI / 180;
    return {
      x: Math.cos(phi) * Math.sin(lambda),
      y: -Math.sin(phi),
      z: Math.cos(phi) * Math.cos(lambda)
    };
  }

  // Helper: Apply 3D pitch/yaw rotation matrices to a 3D point and project to orthographic 2D screen coordinates
  function rotateAndProject(p, rotX, rotY, radius, centerX, centerY) {
    // 1. Yaw rotation (Y-axis)
    const x1 = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
    const z1 = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    const y1 = p.y;

    // 2. Pitch rotation (X-axis)
    const x2 = x1;
    const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

    return {
      x: centerX + x2 * radius,
      y: centerY + y2 * radius,
      z: z2 // Normal depth reference (z > 0 is front hemisphere)
    };
  }

  // Helper: Interpolate 3D quadratic Bezier curve points
  function getBezierPoint3D(S_cart, D_cart, bulgeHeight, t) {
    // Determine control point by projecting unit midpoint outwards with bulged elevation
    const mx = (S_cart.x + D_cart.x) / 2;
    const my = (S_cart.y + D_cart.y) / 2;
    const mz = (S_cart.z + D_cart.z) / 2;
    const len = Math.sqrt(mx * mx + my * my + mz * mz) || 1;

    const elevation = 1 + bulgeHeight;
    const cx = (mx / len) * elevation;
    const cy = (my / len) * elevation;
    const cz = (mz / len) * elevation;

    // Standard quadratic bezier formula: (1-t)^2 * S + 2(1-t)t * C + t^2 * D
    const omt = 1 - t;
    return {
      x: omt * omt * S_cart.x + 2 * omt * t * cx + t * t * D_cart.x,
      y: omt * omt * S_cart.y + 2 * omt * t * cy + t * t * D_cart.y,
      z: omt * omt * S_cart.z + 2 * omt * t * cz + t * t * D_cart.z
    };
  }

  class HackerMap3D {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.active = false;
      this.animationId = null;
      this.generatorTimer = null;

      // 3D Engine Constants & Interaction State
      this.R = 155; // Initial sphere radius
      this.rotationX = 0.35; // Tilt pitch
      this.rotationY = 0; // Axis yaw
      this.velocityX = 0; // Momentum cache X
      this.velocityY = 0.002; // Momentum cache Y
      this.isDragging = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;

      this.particles = [];
      this.explosions = [];
      this.dotMap = []; // Uniform spacing landmass dot coordinates
      this.intensity = 3000; // standard 3s interval

      // Counters and Stats
      this.stats = {
        totalAttacks: 142,
        exploitsStopped: 84,
        zeroTrustBlocks: 46,
        connections: 12,
        threatScore: 35
      };

      // Event handlers bounds for strict removal on destruction
      this.resizeHandler = this.handleResize.bind(this);
      this.dragStartHandler = this.handleDragStart.bind(this);
      this.dragMoveHandler = this.handleDragMove.bind(this);
      this.dragEndHandler = this.handleDragEnd.bind(this);
      this.touchStartHandler = this.handleTouchStart.bind(this);
      this.touchMoveHandler = this.handleTouchMove.bind(this);
      this.touchEndHandler = this.handleTouchEnd.bind(this);
      this.zoomHandler = this.handleZoom.bind(this);
    }

    init() {
      this.canvas = document.getElementById('soc-hacker-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.handleResize();

      // Hook up all resize and interactive handlers
      window.addEventListener('resize', this.resizeHandler);
      this.canvas.addEventListener('mousedown', this.dragStartHandler);
      window.addEventListener('mousemove', this.dragMoveHandler);
      window.addEventListener('mouseup', this.dragEndHandler);
      this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      window.addEventListener('touchmove', this.touchMoveHandler, { passive: true });
      window.addEventListener('touchend', this.touchEndHandler);
      this.canvas.addEventListener('wheel', this.zoomHandler, { passive: false });

      // Generate mathematically uniform dotted globe points to avoid clustering at the poles
      this.dotMap = [];
      const densityStep = 3.6; // step in degrees for uniform spacing
      for (let lat = -88; lat <= 88; lat += densityStep) {
        const cosLat = Math.cos(lat * Math.PI / 180);
        const stepLon = densityStep / Math.max(0.1, cosLat);
        
        for (let lon = -180; lon < 180; lon += stepLon) {
          // Convert spherical coordinates back to existing flat 1000x500 space to check boundaries
          const flatX = ((lon + 180) / 360) * 1000;
          const flatY = ((90 - lat) / 180) * 500;
          const pt = { x: flatX, y: flatY };

          let isLand = false;
          for (const contName in CONTINENTS) {
            if (isPointInPoly(pt, CONTINENTS[contName])) {
              isLand = true;
              break;
            }
          }
          if (isLand) {
            this.dotMap.push({
              cart: getUnitCartesian(lon, lat),
              lon,
              lat
            });
          }
        }
      }

      // Precompute Cartesian nodes to optimize performance during frame renders
      MAP_NODES.forEach(node => {
        node.cart = getUnitCartesian(node.lon, node.lat);
      });

      this.registerControls();
      this.start();
    }

    handleResize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentNode.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = 420; // Exact standardized widget height
      this.R = Math.min(this.canvas.width * 0.28, 160); // Dynamic bounding scale
    }

    // Interactive Drag handlers
    handleDragStart(e) {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.velocityX = 0;
      this.velocityY = 0;
    }

    handleDragMove(e) {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;

      this.rotationY += dx * 0.005;
      this.rotationX += dy * 0.005;
      
      // Limit vertical pitch to prevent flipping upside-down
      this.rotationX = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.rotationX));

      // Cache raw friction velocities for momentum calculations
      this.velocityY = dx * 0.003;
      this.velocityX = dy * 0.003;

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }

    handleDragEnd() {
      this.isDragging = false;
    }

    // Touch Support for Tablets/Mobiles
    handleTouchStart(e) {
      if (e.touches.length !== 1) return;
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
      this.velocityX = 0;
      this.velocityY = 0;
    }

    handleTouchMove(e) {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;

      this.rotationY += dx * 0.005;
      this.rotationX += dy * 0.005;
      this.rotationX = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.rotationX));

      this.velocityY = dx * 0.003;
      this.velocityX = dy * 0.003;

      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }

    handleTouchEnd() {
      this.isDragging = false;
    }

    // Zoom on wheel events
    handleZoom(e) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      this.R = Math.max(90, Math.min(240, this.R * factor));
    }

    registerControls() {
      const startBtn = document.getElementById('btn-sim-start');
      const stopBtn = document.getElementById('btn-sim-stop');
      const resetBtn = document.getElementById('btn-sim-reset');

      if (startBtn) {
        startBtn.onclick = () => {
          this.start();
          showNotification('SOC Live Simulation engine initialized.', 'success');
        };
      }
      if (stopBtn) {
        stopBtn.onclick = () => {
          this.pause();
          showNotification('SOC Live Simulation engine suspended.', 'info');
        };
      }
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.reset();
          showNotification('Simulation statistics and metrics reset.', 'success');
        };
      }

      const rates = ['slow', 'standard', 'intense', 'redalert'];
      rates.forEach(rate => {
        const btn = document.getElementById(`btn-rate-${rate}`);
        if (btn) {
          btn.onclick = () => {
            rates.forEach(r => {
              const otherBtn = document.getElementById(`btn-rate-${r}`);
              if (otherBtn) otherBtn.classList.remove('active');
            });
            btn.classList.add('active');
            
            let interval = 3000;
            if (rate === 'slow') interval = 6000;
            if (rate === 'standard') interval = 3000;
            if (rate === 'intense') interval = 1200;
            if (rate === 'redalert') interval = 600;

            this.intensity = interval;
            if (this.active) {
              this.stopGenerator();
              this.startGenerator();
            }
            showNotification(`Simulation load rate toggled: ${rate.toUpperCase()}`, 'success');
          };
        }
      });
    }

    start() {
      if (this.active) return;
      this.active = true;

      const startBtn = document.getElementById('btn-sim-start');
      const stopBtn = document.getElementById('btn-sim-stop');
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'inline-flex';

      this.startGenerator();
      this.loop();
    }

    pause() {
      this.active = false;

      const startBtn = document.getElementById('btn-sim-start');
      const stopBtn = document.getElementById('btn-sim-stop');
      if (startBtn) startBtn.style.display = 'inline-flex';
      if (stopBtn) stopBtn.style.display = 'none';

      this.stopGenerator();
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    reset() {
      this.particles = [];
      this.explosions = [];
      this.stats = {
        totalAttacks: 0,
        exploitsStopped: 0,
        zeroTrustBlocks: 0,
        connections: 0,
        threatScore: 0
      };
      this.updateCountersUI();
      const logger = document.getElementById('sim-terminal-rows');
      if (logger) logger.innerHTML = '';
      this.pause();
      this.start();
    }

    startGenerator() {
      this.generatorTimer = setInterval(() => {
        this.generateRandomAttack();
      }, this.intensity);
    }

    stopGenerator() {
      if (this.generatorTimer) {
        clearInterval(this.generatorTimer);
        this.generatorTimer = null;
      }
    }

    generateRandomAttack() {
      if (!this.active) return;

      const srcIndex = Math.floor(Math.random() * MAP_NODES.length);
      let destIndex = Math.floor(Math.random() * MAP_NODES.length);
      while (destIndex === srcIndex) {
        destIndex = Math.floor(Math.random() * MAP_NODES.length);
      }

      const src = MAP_NODES[srcIndex];
      const dest = MAP_NODES[destIndex];
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];

      // Calculate Euclidean distance to dynamically size the flight elevation arc
      const dx = src.cart.x - dest.cart.x;
      const dy = src.cart.y - dest.cart.y;
      const dz = src.cart.z - dest.cart.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const bulgeHeight = distance * 0.28; // Arc proportional elevation

      // Launch tracer particle
      this.particles.push({
        src,
        dest,
        type,
        progress: 0,
        speed: 0.005 + Math.random() * 0.004, // Smooth flight path velocity curves
        bulgeHeight,
        color: type.color
      });

      // Update interactive counters
      this.stats.totalAttacks++;
      if (type.risk === 'CRITICAL') {
        this.stats.exploitsStopped += Math.random() > 0.3 ? 1 : 0;
      } else {
        this.stats.zeroTrustBlocks++;
      }
      this.stats.connections = Math.floor(Math.random() * 15 + 5);

      // Thread score math based on active particle quantities and payload pace
      const baseScore = Math.floor(this.particles.length * 15 + (this.intensity === 600 ? 55 : this.intensity === 1200 ? 30 : 10));
      this.stats.threatScore = Math.min(Math.max(baseScore, 10), 100);

      this.updateCountersUI();
      this.appendTerminalLog(src, dest, type);
    }

    appendTerminalLog(src, dest, type) {
      const logger = document.getElementById('sim-terminal-rows');
      if (!logger) return;

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const status = Math.random() > 0.15 ? 'BLOCKED' : 'RESOLVING';
      const statusColorClass = status === 'BLOCKED' ? 'text-emerald' : 'text-rose';

      const logRow = document.createElement('div');
      logRow.style.padding = '3px 0';
      logRow.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
      logRow.style.fontSize = '11px';
      logRow.className = 'font-mono';
      logRow.innerHTML = `
        <span class="text-muted">[${timeStr}]</span> 
        <span style="color:${type.color}">${type.name}</span>: 
        <span class="text-cyan">${src.name} (${src.country})</span> 
        <span style="color: rgba(255,255,255,0.2); margin: 0 4px;">&rarr;</span> 
        <span class="text-secondary">${dest.name}</span> 
        on Port <span class="text-amber">${type.port}</span> 
        - <strong class="${statusColorClass}">${status}</strong>
      `;

      logger.insertBefore(logRow, logger.firstChild);

      // Terminal overflow prevention
      while (logger.children.length > 40) {
        logger.removeChild(logger.lastChild);
      }
    }

    updateCountersUI() {
      const totalEl = document.getElementById('sim-total-attacks');
      const criticalEl = document.getElementById('sim-critical-stopped');
      const blocksEl = document.getElementById('sim-zerotrust-blocks');
      const connEl = document.getElementById('sim-connections');
      const scoreNumEl = document.getElementById('sim-threat-score-num');
      const scoreFillEl = document.getElementById('sim-score-fill');
      const statusTitleEl = document.getElementById('sim-status-title');

      if (totalEl) totalEl.innerText = this.stats.totalAttacks;
      if (criticalEl) criticalEl.innerText = this.stats.exploitsStopped;
      if (blocksEl) blocksEl.innerText = this.stats.zeroTrustBlocks;
      if (connEl) connEl.innerText = this.stats.connections;
      
      if (scoreNumEl) scoreNumEl.innerText = this.stats.threatScore;
      if (scoreFillEl) {
        scoreFillEl.style.width = `${this.stats.threatScore}%`;
        if (this.stats.threatScore > 75) {
          scoreFillEl.style.background = 'var(--rose-glow)';
          if (statusTitleEl) {
            statusTitleEl.innerText = 'RED THREAT ALERT - CRITICAL DEFENSES ENGAGED';
            statusTitleEl.className = 'font-display text-rose text-xs font-bold';
          }
        } else if (this.stats.threatScore > 40) {
          scoreFillEl.style.background = 'var(--yellow-glow)';
          if (statusTitleEl) {
            statusTitleEl.innerText = 'HIGH LOAD WARNING - MITIGATION IN PROGRESS';
            statusTitleEl.className = 'font-display text-amber text-xs font-bold';
          }
        } else {
          scoreFillEl.style.background = 'var(--cyan-glow)';
          if (statusTitleEl) {
            statusTitleEl.innerText = 'CLEAN ENVIRONMENT - STANDBY OBSERVATION';
            statusTitleEl.className = 'font-display text-emerald text-xs font-bold';
          }
        }
      }
    }

    loop() {
      if (!this.active) return;
      this.draw();
      this.animationId = requestAnimationFrame(() => this.loop());
    }

    draw() {
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const centerX = cw / 2;
      const centerY = ch / 2;
      const R = this.R;

      // Clear frame with custom alpha fading trail effect for smooth glowing lines
      ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
      ctx.fillRect(0, 0, cw, ch);

      // Handle interactive momentum decay or slow continuous rotation
      if (this.isDragging) {
        // Active rotation
      } else {
        this.rotationY += this.velocityY;
        this.rotationX += this.velocityX;
        
        // Boundaries constraints
        this.rotationX = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.rotationX));

        // Soft damping
        this.velocityY *= 0.95;
        this.velocityX *= 0.95;

        // Reset to steady auto-rotation when user interaction velocity completes
        if (Math.abs(this.velocityY) < 0.0001 && Math.abs(this.velocityX) < 0.0001) {
          this.rotationY += 0.0012; // Beautiful slow rotation
        }
      }

      // --- 1. RENDER 3D ATMOSPHERIC HALO ---
      const halo = ctx.createRadialGradient(centerX, centerY, R * 0.95, centerX, centerY, R * 1.25);
      halo.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      halo.addColorStop(0.3, 'rgba(6, 182, 212, 0.12)');
      halo.addColorStop(0.7, 'rgba(56, 189, 248, 0.03)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(centerX, centerY, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Draw subtle space backdrop horizon bounding circle
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      ctx.stroke();

      // --- 2. RENDER PARALLELS AND MERIDIANS GRID ---
      ctx.lineWidth = 0.5;
      // Parallels (latitude circles)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let firstSegment = true;
        for (let lon = -180; lon <= 180; lon += 8) {
          const uCart = getUnitCartesian(lon, lat);
          const p2d = rotateAndProject(uCart, this.rotationX, this.rotationY, R, centerX, centerY);

          if (p2d.z > 0) { // Render only on front hemisphere
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
            if (firstSegment) {
              ctx.moveTo(p2d.x, p2d.y);
              firstSegment = false;
            } else {
              ctx.lineTo(p2d.x, p2d.y);
            }
          } else {
            firstSegment = true; // Break path for hidden segments
          }
        }
        ctx.stroke();
      }
      // Meridians (longitude curves)
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let firstSegment = true;
        for (let lat = -80; lat <= 80; lat += 8) {
          const uCart = getUnitCartesian(lon, lat);
          const p2d = rotateAndProject(uCart, this.rotationX, this.rotationY, R, centerX, centerY);

          if (p2d.z > 0) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
            if (firstSegment) {
              ctx.moveTo(p2d.x, p2d.y);
              firstSegment = false;
            } else {
              ctx.lineTo(p2d.x, p2d.y);
            }
          } else {
            firstSegment = true;
          }
        }
        ctx.stroke();
      }

      // --- 3. RENDER LANDMASS DOTS ---
      for (let i = 0; i < this.dotMap.length; i++) {
        const d = this.dotMap[i];
        const p2d = rotateAndProject(d.cart, this.rotationX, this.rotationY, R, centerX, centerY);

        // Render point with selective alpha based on front/back depth
        if (p2d.z > 0) {
          // Dynamic light reactivity when tracers fly close by
          let activeLight = false;
          let lightColor = 'rgba(6, 182, 212, 0.38)';
          
          for (let p = 0; p < this.particles.length; p++) {
            const pt = this.particles[p];
            const pt3D = getBezierPoint3D(pt.src.cart, pt.dest.cart, pt.bulgeHeight, pt.progress);
            const dist = Math.pow(d.cart.x - pt3D.x, 2) + Math.pow(d.cart.y - pt3D.y, 2) + Math.pow(d.cart.z - pt3D.z, 2);
            
            if (dist < 0.06) {
              activeLight = true;
              lightColor = pt.color + '44';
              break;
            }
          }

          ctx.fillStyle = activeLight ? lightColor : 'rgba(34, 211, 238, 0.28)';
          ctx.fillRect(p2d.x - 1, p2d.y - 1, 1.8, 1.8);
        } else {
          // Draw faint backside landmasses to emphasize full transparency/depth
          ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
          ctx.fillRect(p2d.x - 0.5, p2d.y - 0.5, 1.2, 1.2);
        }
      }

      // --- 4. RENDER ATTACK BEZIER ARCS & PARTICLES ---
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          // Target hit: Spawn a 3D locked expanding shockwave
          this.explosions.push({
            cart: p.dest.cart,
            radius: 2,
            maxRadius: 24,
            opacity: 1,
            color: p.color
          });

          showNotification(`MITIGATED: ${p.type.name} to ${p.dest.name}`, 'info');
          this.particles.splice(i, 1);
          continue;
        }

        // Draw entire arc curve as small segmented lines with front-vs-back lighting
        const segments = 28;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        
        let lastX = 0, lastY = 0;
        let drawnFirst = false;

        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const pos3D = getBezierPoint3D(p.src.cart, p.dest.cart, p.bulgeHeight, t);
          const p2d = rotateAndProject(pos3D, this.rotationX, this.rotationY, R, centerX, centerY);

          if (s === 0) {
            ctx.moveTo(p2d.x, p2d.y);
            drawnFirst = true;
          } else {
            // Apply higher brightness on front elements, translucent on back
            ctx.strokeStyle = p2d.z > 0 ? (p.color + '26') : (p.color + '0a');
            ctx.lineTo(p2d.x, p2d.y);
          }
        }
        ctx.stroke();

        // Calculate tracer position along flight trajectory
        const pt3D = getBezierPoint3D(p.src.cart, p.dest.cart, p.bulgeHeight, p.progress);
        const p2d = rotateAndProject(pt3D, this.rotationX, this.rotationY, R, centerX, centerY);

        if (p2d.z > 0) {
          // Flowing halo ring
          ctx.beginPath();
          ctx.arc(p2d.x, p2d.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color + '33';
          ctx.fill();

          // Flight core tracer
          ctx.beginPath();
          ctx.arc(p2d.x, p2d.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      // --- 5. RENDER SHOCKWAVE EXPLOSIONS IN 3D SPACE ---
      for (let i = this.explosions.length - 1; i >= 0; i--) {
        const ex = this.explosions[i];
        ex.radius += 0.8;
        ex.opacity -= 0.038;

        if (ex.opacity <= 0) {
          this.explosions.splice(i, 1);
          continue;
        }

        const p2d = rotateAndProject(ex.cart, this.rotationX, this.rotationY, R, centerX, centerY);

        if (p2d.z > 0) {
          ctx.strokeStyle = ex.color + Math.floor(ex.opacity * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p2d.x, p2d.y, ex.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // --- 6. RENDER DYNAMIC 3D MAP NODES ---
      for (let i = 0; i < MAP_NODES.length; i++) {
        const node = MAP_NODES[i];
        const p2d = rotateAndProject(node.cart, this.rotationX, this.rotationY, R, centerX, centerY);

        // Render only if on the visible front hemisphere
        if (p2d.z > 0) {
          const pulse = 1.2 + Math.sin(Date.now() * 0.0035 + i) * 1.2;

          // External pulsing glow circle
          ctx.beginPath();
          ctx.arc(p2d.x, p2d.y, 3.5 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '26';
          ctx.fill();

          // Main node point core
          ctx.beginPath();
          ctx.arc(p2d.x, p2d.y, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Tactical human-labeled text identifiers
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = '8px "JetBrains Mono", var(--font-mono)';
          ctx.textAlign = 'center';
          ctx.fillText(node.id.toUpperCase(), p2d.x, p2d.y - 7);
        }
      }

      // --- 7. TACTICAL TERMINAL INFO OVERLAY ---
      ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.font = '8.5px "JetBrains Mono", var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.fillText('SOC_PROJ_3D: IN LINE', 15, 20);
      ctx.fillText(`YAW: ${(this.rotationY % (Math.PI * 2)).toFixed(2)}rad`, 15, ch - 15);
      ctx.textAlign = 'right';
      ctx.fillText(`ZOOM: ${(R / 155 * 100).toFixed(0)}%`, cw - 15, 20);
      ctx.fillText(`PITCH: ${this.rotationX.toFixed(2)}rad`, cw - 15, ch - 15);
    }

    destroy() {
      this.pause();
      
      // Strict events cleanup to guarantee zero browser memory leaks
      window.removeEventListener('resize', this.resizeHandler);
      if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this.dragStartHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('wheel', this.zoomHandler);
      }
      window.removeEventListener('mousemove', this.dragMoveHandler);
      window.removeEventListener('mouseup', this.dragEndHandler);
      window.removeEventListener('touchmove', this.touchMoveHandler);
      window.removeEventListener('touchend', this.touchEndHandler);

      this.canvas = null;
      this.ctx = null;
    }
  }

  // Bind the high-fidelity 3D Earth Engine to the global window
  window.HackerMapEngine = {
    instance: null,
    init: function () {
      if (!this.instance) {
        this.instance = new HackerMap3D();
      }
      this.instance.init();
    },
    start: function () {
      if (this.instance) this.instance.start();
    },
    pause: function () {
      if (this.instance) this.instance.pause();
    },
    reset: function () {
      if (this.instance) this.instance.reset();
    },
    destroy: function () {
      if (this.instance) {
        this.instance.destroy();
        this.instance = null;
      }
    }
  };
})();
