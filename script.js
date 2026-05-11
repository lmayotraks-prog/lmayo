/* =========================================
   ULTRA-PREMIUM COMBINED BACKGROUND ENGINE
   Harmonic Neural Net  +  3D Star Field
   +  Floating Orbs  +  Twinkling Particles
   +  Cursor Ripple  +  Cyan/Purple Palette
   + FULLY RESPONSIVE (mobile-first)
========================================= */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

// ─── Responsive Config (recomputed on resize) ─
let RES = {}; // all adaptive values live here

function getResponsiveConfig() {
    const W = window.innerWidth;
    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1200;
    return {
        isMobile,
        isTablet,
        dpr: Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 3),
        starCount:  isMobile ? 100 : isTablet ? 200 : 320,
        orbCount:   isMobile ? 4   : isTablet ? 5   : 7,
        sparkCount: isMobile ? 30  : isTablet ? 55  : 80,
        nodeCount:  isMobile ? 28  : isTablet ? 45  : 60,
        ambientCount: isMobile ? 40 : isTablet ? 90 : 150,
        sphereR:    isMobile ? 130 : isTablet ? 240 : 350,
        connectDist: isMobile ? 200 : isTablet ? 270 : 320,
        rippleProb: isMobile ? 0 : 0.25, // no ripples on touch (handled separately)
    };
}

function resizeCanvas() {
    RES = getResponsiveConfig();
    // Use devicePixelRatio for crisp rendering on Retina / high-DPI screens
    canvas.width  = window.innerWidth  * RES.dpr;
    canvas.height = window.innerHeight * RES.dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(RES.dpr, RES.dpr);
    initStars(); // re-seed stars after resize
}

// ─── Shared State ────────────────────────
const originalColors = ['#00f3ff', '#9d00ff'];
const fov = 700;
let angleX = 0, angleY = 0;
let targetAngleX = 0, targetAngleY = 0;
let time = 0;
let mouseX = 0, mouseY = 0;

// Cursor ripples
const ripples = [];

function spawnRipple(x, y) {
    ripples.push({ x, y, r: 0, alpha: 0.4,
        color: originalColors[Math.floor(Math.random() * 2)] });
}

// Mouse events (desktop)
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetAngleY = (e.clientX - window.innerWidth / 2) * 0.0012;
    targetAngleX = (e.clientY - window.innerHeight / 2) * 0.0012;
    if (Math.random() < 0.25) spawnRipple(e.clientX, e.clientY);
});

// Touch events (mobile) — gyroscopic-style parallax + touch ripples
window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    targetAngleY = (t.clientX - window.innerWidth  / 2) * 0.0015;
    targetAngleX = (t.clientY - window.innerHeight / 2) * 0.0015;
    if (Math.random() < 0.4) spawnRipple(t.clientX, t.clientY);
}, { passive: true });

window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    spawnRipple(t.clientX, t.clientY);
}, { passive: true });

// ─── Helpers ─────────────────────────────
function hexToRgba(hex, alpha) {
    let r, g, b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function rotate3D(x, y, z, ax, ay) {
    let cosY = Math.cos(ay), sinY = Math.sin(ay);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let cosX = Math.cos(ax), sinX = Math.sin(ax);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
}

// ─── LAYER 1: Deep 3D Star Field ─────────
// (Inspired by reference site's Three.js star field)
let stars = [];

function initStars() {
    if (!RES.starCount) return; // guard before first resize
    stars = [];
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < RES.starCount; i++) {
        stars.push({
            x: (Math.random() - 0.5) * W * 3,
            y: (Math.random() - 0.5) * H * 3,
            z: Math.random() * 2000 + 100,
            size: Math.random() * 1.2 + 0.2,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.03 + Math.random() * 0.05,
            color: Math.random() < 0.7 ? '#ffffff' : originalColors[Math.floor(Math.random()*2)]
        });
    }
}

function drawStars(ax, ay) {
    const W = window.innerWidth, H = window.innerHeight;
    stars.forEach(s => {
        // Gentle parallax drift based on camera angle
        let px3d = s.x + Math.sin(ay) * s.z * 0.15;
        let py3d = s.y + Math.sin(ax) * s.z * 0.15;
        let scale = fov / (fov + s.z);
        let sx = px3d * scale + W / 2;
        let sy = py3d * scale + H / 2;

        if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;

        // Twinkling effect — the key visual from the reference site
        s.twinklePhase += s.twinkleSpeed;
        let twinkle = 0.3 + 0.7 * Math.abs(Math.sin(s.twinklePhase));
        let displaySize = s.size * scale * twinkle;
        let alpha = scale * twinkle * 0.9;

        if (s.color === '#ffffff') {
            // Classic white star
            ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.8).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(0.3, displaySize), 0, Math.PI * 2);
            ctx.fill();

            // occasional bright spike (sparkle cross)
            if (twinkle > 0.92 && s.size > 0.8) {
                ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.5).toFixed(3)})`;
                ctx.lineWidth = 0.5;
                let len = displaySize * 3;
                ctx.beginPath();
                ctx.moveTo(sx - len, sy); ctx.lineTo(sx + len, sy);
                ctx.moveTo(sx, sy - len); ctx.lineTo(sx, sy + len);
                ctx.stroke();
            }
        } else {
            // Colored neon star (cyan or purple)
            ctx.fillStyle = hexToRgba(s.color, alpha * 0.7);
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 6 * twinkle;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(0.3, displaySize * 1.3), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
}

// ─── LAYER 2: Floating Glowing Orbs ──────
// (Inspired by the soft drifting glow orbs in the reference site)
const orbs = [];

function initOrbs() {
    orbs.length = 0;
    const W = window.innerWidth, H = window.innerHeight;
    const baseR = RES.isMobile ? 50 : 120;
    for (let i = 0; i < RES.orbCount; i++) {
        orbs.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            baseR: baseR * (0.5 + Math.random()),
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.008 + Math.random() * 0.008,
            color: originalColors[i % 2],
            alpha: 0.03 + Math.random() * 0.05
        });
    }
}

function drawOrbs() {
    const W = window.innerWidth, H = window.innerHeight;
    orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.baseR) orb.x = W + orb.baseR;
        if (orb.x > W + orb.baseR) orb.x = -orb.baseR;
        if (orb.y < -orb.baseR) orb.y = H + orb.baseR;
        if (orb.y > H + orb.baseR) orb.y = -orb.baseR;

        orb.pulsePhase += orb.pulseSpeed;
        let r = orb.baseR * (1 + 0.15 * Math.sin(orb.pulsePhase));

        let grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0, hexToRgba(orb.color, orb.alpha * 1.8));
        grad.addColorStop(0.5, hexToRgba(orb.color, orb.alpha * 0.6));
        grad.addColorStop(1, hexToRgba(orb.color, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ─── LAYER 3: Twinkling Data Particles ───
// (The tiny rapid blinkers seen on the reference site)
const sparkles = [];

function initSparkles() {
    sparkles.length = 0;
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < RES.sparkCount; i++) {
        sparkles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: 0.08 + Math.random() * 0.12,
            size: 0.8 + Math.random() * 1.5,
            color: originalColors[Math.floor(Math.random() * 2)]
        });
    }
}

function drawSparkles() {
    const W = window.innerWidth, H = window.innerHeight;
    sparkles.forEach(sp => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        // wrap
        if (sp.x < 0) sp.x = W;
        if (sp.x > W) sp.x = 0;
        if (sp.y < 0) sp.y = H;
        if (sp.y > H) sp.y = 0;

        sp.phase += sp.speed;
        let brightness = Math.pow(Math.abs(Math.sin(sp.phase)), 3); // sharp pulse
        if (brightness < 0.1) return; // invisible frames — saves draw calls

        ctx.fillStyle = hexToRgba(sp.color, brightness * 0.85);
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = brightness * 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * brightness, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

// ─── LAYER 4: Cursor Ripples ─────────────
function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        let rp = ripples[i];
        rp.r += 1.8;
        rp.alpha -= 0.018;
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(rp.color, rp.alpha);
        ctx.lineWidth = 1.0;
        ctx.stroke();
    }
}

// ─── LAYER 5: Harmonic 3D Neural Network ─
// (Our original harmonic neural web — now adaptive)
const nodes = [];
const ambientParticles = [];

class HarmonicNode {
    constructor(i, totalCount) {
        let phi = Math.acos(1 - 2 * (i + 0.5) / totalCount);
        let theta = Math.PI * (1 + Math.sqrt(5)) * i;
        let R = RES.sphereR || 350; // adaptive sphere radius
        this.cx = Math.sin(phi) * Math.cos(theta) * R;
        this.cy = Math.sin(phi) * Math.sin(theta) * R;
        this.cz = Math.cos(phi) * R;
        this.rx = Math.random() * 80 + 30;
        this.ry = Math.random() * 80 + 30;
        this.rz = Math.random() * 80 + 30;
        this.sx = (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        this.sy = (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        this.sz = (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        this.px = Math.random() * Math.PI * 2;
        this.py = Math.random() * Math.PI * 2;
        this.pz = Math.random() * Math.PI * 2;
        this.color = originalColors[Math.floor(Math.random() * originalColors.length)];
        this.baseSize = Math.random() * 1.5 + 0.5;
    }
    update(t) {
        this.x = this.cx + this.rx * Math.sin(t * this.sx + this.px);
        this.y = this.cy + this.ry * Math.sin(t * this.sy + this.py);
        this.z = this.cz + this.rz * Math.sin(t * this.sz + this.pz);
    }
}

class AmbientParticle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = (Math.random() - 0.5) * window.innerWidth * 2;
        this.y = (Math.random() - 0.5) * window.innerHeight * 2;
        this.z = (Math.random() - 0.5) * 1500;
        this.speedZ = (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        this.color = originalColors[Math.floor(Math.random() * originalColors.length)];
    }
    update() {
        this.z += this.speedZ;
        if (this.z > 800) this.z = -1500;
        if (this.z < -1500) this.z = 800;
        this.x += Math.sin(time + this.z * 0.01) * 0.15;
        this.y += Math.cos(time + this.z * 0.01) * 0.15;
    }
}

function initNetwork() {
    nodes.length = 0;
    ambientParticles.length = 0;
    const nc = RES.nodeCount || 60;
    const ac = RES.ambientCount || 150;
    for (let i = 0; i < nc; i++) nodes.push(new HarmonicNode(i, nc));
    for (let i = 0; i < ac; i++) ambientParticles.push(new AmbientParticle());
}

function drawNeuralNetwork(ax, ay) {
    const nc = nodes.length;
    const W = window.innerWidth, H = window.innerHeight;
    // Ambient 3D particles
    ambientParticles.forEach(p => {
        p.update();
        let rot = rotate3D(p.x, p.y, p.z, ax, ay);
        let scale = fov / (fov + rot.z);
        if (scale > 0 && scale < 3) {
            let px = rot.x * scale + W / 2;
            let py = rot.y * scale + H / 2;
            ctx.fillStyle = hexToRgba(p.color, Math.min(1, scale * 0.5) * 0.25);
            ctx.beginPath();
            ctx.arc(px, py, scale * 1.0, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    let projected = [];
    for (let i = 0; i < nc; i++) {
        let n = nodes[i];
        n.update(time);
        let rot = rotate3D(n.x, n.y, n.z, ax, ay);
        let scale = fov / (fov + rot.z);
        projected.push({
            id: i, node: n, scale,
            x: rot.x * scale + W / 2,
            y: rot.y * scale + H / 2,
            z: rot.z, color: n.color, size: n.baseSize * scale
        });
    }
    projected.sort((a, b) => b.z - a.z);

    ctx.lineWidth = RES.isMobile ? 0.4 : 0.6;
    const maxD = RES.connectDist || 320;
    for (let i = 0; i < projected.length; i++) {
        let p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
            let p2 = projected[j];
            let dx = p1.node.x - p2.node.x, dy = p1.node.y - p2.node.y, dz = p1.node.z - p2.node.z;
            let d = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (d < maxD && p1.scale > 0 && p2.scale > 0) {
                let dA = 1 - Math.pow(d / maxD, 2);
                let depA = Math.max(0, Math.min(1, fov / (fov + (p1.z + p2.z) / 2)));
                let a = dA * depA * 0.7;
                if (a > 0.01) {
                    let g = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    g.addColorStop(0, hexToRgba(p1.color, a));
                    g.addColorStop(1, hexToRgba(p2.color, a));
                    ctx.strokeStyle = g;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        if (p1.scale > 0) {
            let dA = Math.min(1, Math.max(0.1, fov / (fov + p1.z)));
            let glow = ctx.createRadialGradient(p1.x, p1.y, 0, p1.x, p1.y, p1.size * 6);
            glow.addColorStop(0, hexToRgba(p1.color, dA * 0.3));
            glow.addColorStop(1, hexToRgba(p1.color, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.size * 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${dA.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ─── Master Render Loop ───────────────────
function render() {
    // Clear using logical (CSS) pixel dimensions so DPR scaling stays correct
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    time += 0.004;

    angleX += (targetAngleX - angleX) * 0.02;
    angleY += (targetAngleY - angleY) * 0.02;
    let ax = angleX + Math.sin(time * 0.3) * 0.1;
    let ay = angleY + time * 0.15;

    // Draw all layers back → front
    drawStars(ax, ay);       // Layer 1: deep star field with twinkling
    drawOrbs();              // Layer 2: floating glowing orbs
    drawSparkles();          // Layer 3: rapid twinkling data particles
    drawNeuralNetwork(ax, ay); // Layer 4: harmonic 3D neural mesh
    drawRipples();           // Layer 5: cursor ripple trails (on top)

    requestAnimationFrame(render);
}

// ─── Initialise Everything ────────────────
// resizeCanvas() sets RES + DPR, then seeds all particle systems
function initAll() {
    resizeCanvas();   // sets RES, DPR-scales canvas
    initOrbs();       // seeds with RES.orbCount
    initSparkles();   // seeds with RES.sparkCount
    initNetwork();    // seeds with RES.nodeCount
}

// Re-initialise on orientation/viewport change (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initAll, 200);
});

initAll();
render();

// Scroll Animation with Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Select elements to animate and set initial state
document.querySelectorAll('.feature-card, .service-item, .project-card, .store-item').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    observer.observe(el);
});


// Mobile menu toggle (simple version)
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileBtn.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--bg-glass)';
        navLinks.style.backdropFilter = 'blur(12px)';
        navLinks.style.padding = '1rem';
        navLinks.style.borderRadius = '16px';
        navLinks.style.border = '1px solid var(--border-glass)';
    }
});

// Custom Cursor Animation
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

// Check if device supports hover (ignores touch screens)
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let outlineX = window.innerWidth / 2;
    let outlineY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;

        // Immediate dot update
        cursorDot.style.left = `${cursorX}px`;
        cursorDot.style.top = `${cursorY}px`;
    });

    // Smooth outline delay
    function animateCursor() {
        let ease = 0.15;
        outlineX += (cursorX - outlineX) * ease;
        outlineY += (cursorY - outlineY) * ease;

        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .hover-glow, .gallery-item, .video-container, .project-card, input, textarea, select, .store-item, .play-overlay');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hover');
            cursorOutline.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hover');
            cursorOutline.classList.remove('hover');
        });
    });
} else {
    // Hide custom cursor on mobile/touch devices
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

// =============================================
// Beatport Player Logic (L MAYO)
// =============================================
function initBeatportPlayer() {
    const playlist = [
        { name: "1. YEA! YEA!", file: "assets/music/YEA! YEA!.wav" },
        { name: "2. BELLS OF THE SKY", file: "assets/music/BELLS OF THE SKY.wav" },
        { name: "3. TREMOLO VOICE", file: "assets/music/TREMOLO VOICE.wav" },
        { name: "4. DON´T PLAY WITH FIRE", file: "assets/music/DON´T PLAY WITH FIRE.wav" },
        { name: "5. KIK OUT TRAVIS SCOTT", file: "assets/music/KIK OUT TRAVIS SCOTT FT L MAYO.wav" },
        { name: "6. AMGQMEC", file: "assets/music/AMGQMEC.wav" },
        { name: "7. COME ON ! L MAYO FT BABEEE", file: "assets/music/COME ON ! L MAYO FT BABEEE.wav" },
        { name: "8. FEID - NOS DESCONOXIMOS REMIX", file: "assets/music/FEID - NOS DESCONOXIMOS REMIX (L MAYO).wav" },
        { name: "9. Candy Factori", file: "assets/music/candy factori.wav" },
        { name: "10. Candy Factori B min", file: "assets/music/candy factori b min.wav" }
    ];

    const audio = new Audio();
    // Allow background playing for premium look
    let currentIdx = 0;
    
    const playBtn = document.getElementById("play-pause-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const trackTitle = document.getElementById("current-track-title");
    const playlistUl = document.getElementById("playlist-ul");
    const progressBar = document.getElementById("progress-bar");
    const progressThumb = document.querySelector(".progress-thumb");
    const curTimeSpan = document.getElementById("current-time");
    const durTimeSpan = document.getElementById("duration-time");
    const playingBars = document.getElementById("playing-bars");

    if(!playBtn || !playlistUl) return;

    // Build Playlist DOM
    playlist.forEach((track, i) => {
        const li = document.createElement("li");
        li.className = "playlist-item" + (i === 0 ? " playing" : "");
        li.innerHTML = `
            <span class="p-name">` + track.name + `</span>
            <div class="reaction-btns">
                <button class="react-btn" title="Like"><i class="fas fa-heart"></i> <span class="vc">0</span></button>
                <button class="react-btn" title="Fire"><i class="fas fa-fire"></i> <span class="vc">0</span></button>
            </div>
        `;
        li.querySelector(".p-name").addEventListener("click", () => {
            loadTrack(i);
            playTrack();
        });
        
        // Reaction logic
        li.querySelectorAll(".react-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                btn.classList.toggle("liked");
                let vcSpan = btn.querySelector(".vc");
                let vc = parseInt(vcSpan.innerText);
                vcSpan.innerText = btn.classList.contains("liked") ? vc + 1 : vc - 1;
            });
        });

        playlistUl.appendChild(li);
    });

    const loadTrack = (index) => {
        currentIdx = index;
        audio.src = playlist[currentIdx].file;
        trackTitle.innerText = playlist[currentIdx].name;
        
        // update UI classes
        const items = playlistUl.querySelectorAll(".playlist-item");
        items.forEach((item, i) => {
            if(i === index) item.classList.add("playing");
            else item.classList.remove("playing");
        });
    };

    const playTrack = () => {
        let promise = audio.play();
        if (promise !== undefined) {
          promise.then(_ => {
            playBtn.innerHTML = "<i class=\"fas fa-pause\"></i>";
            playingBars.classList.add("active");
          }).catch(error => {
            console.log("Auto-play prevented", error);
          });
        }
    };

    const pauseTrack = () => {
        audio.pause();
        playBtn.innerHTML = "<i class=\"fas fa-play\"></i>";
        playingBars.classList.remove("active");
    };

    playBtn.addEventListener("click", () => {
        if(audio.src === "" || audio.src.endsWith("/")) {
            loadTrack(0);
        }
        if(audio.paused) playTrack();
        else pauseTrack();
    });

    prevBtn.addEventListener("click", () => {
        let nIdx = currentIdx - 1;
        if(nIdx < 0) nIdx = playlist.length - 1;
        loadTrack(nIdx);
        playTrack();
    });

    nextBtn.addEventListener("click", () => {
        let nIdx = currentIdx + 1;
        if(nIdx >= playlist.length) nIdx = 0;
        loadTrack(nIdx);
        playTrack();
    });

    // Time Formatting
    const formatTime = (timeInSecs) => {
        if(isNaN(timeInSecs)) return "0:00";
        let min = Math.floor(timeInSecs / 60);
        let sec = Math.floor(timeInSecs % 60);
        if(sec < 10) sec = "0" + sec;
        return min + ":" + sec;
    };

    audio.addEventListener("timeupdate", () => {
        curTimeSpan.innerText = formatTime(audio.currentTime);
        let progress = (audio.currentTime / audio.duration) * 100;
        if(isNaN(progress)) progress = 0;
        progressThumb.style.width = progress + "%";
    });

    audio.addEventListener("loadeddata", () => {
        durTimeSpan.innerText = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
        nextBtn.click();
    });

    // Seek
    progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });

    loadTrack(0);
}

// =============================================
// Comments Form Submissions
// =============================================
function initComments() {
    const form = document.getElementById("comment-form");
    const wall = document.getElementById("comments-list");
    
    if(!form || !wall) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("comment-name").value;
        const text = document.getElementById("comment-text").value;
        
        const newDiv = document.createElement("div");
        newDiv.className = "comment-item";
        newDiv.innerHTML = `
            <div class="comment-avatar" style="background:#ff2a54;"><i class="fas fa-headphones"></i></div>
            <div class="comment-content">
                <h5>` + name + ` <span class="comment-time">Hace un momento</span></h5>
                <p>` + text + `</p>
            </div>
        `;
        
        wall.insertBefore(newDiv, wall.firstChild);
        form.reset();
        
        // Scroll to top of wall
        wall.parentElement.scrollTop = 0;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initBeatportPlayer();
    initComments();
});

// =============================================
// Booking Form WhatsApp Submission
// =============================================
function sendBookingToWhatsApp(event) {
    event.preventDefault();
    const name = document.getElementById("book-name").value;
    const eventType = document.getElementById("book-event").value;
    const date = document.getElementById("book-date").value;
    const city = document.getElementById("book-city").value;
    const message = document.getElementById("book-message").value;

    const text = `Hola L MAYO, me gustaría hacer una reserva para un evento.
*Nombre:* ${name}
*Tipo de Evento:* ${eventType}
*Fecha:* ${date}
*Ciudad/País:* ${city}
*Mensaje Adicional:* ${message ? message : 'N/A'}`;

    const phoneNumber = "573022780781";
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, "_blank");
}

