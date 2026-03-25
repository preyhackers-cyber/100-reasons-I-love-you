// ── GOLDEN STAR & PARTICLE SYSTEM ──

const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initStars(); });

// Colour palette: golds, warm whites, blush rose
const palettes = [
  { r: 255, g: 220, b: 120 }, // bright gold
  { r: 232, g: 195, b: 120 }, // warm gold
  { r: 201, g: 168, b:  76 }, // deep gold
  { r: 255, g: 245, b: 200 }, // champagne
  { r: 240, g: 200, b: 160 }, // amber
  { r: 255, g: 230, b: 180 }, // peach-gold
  { r: 232, g: 160, b: 176 }, // blush rose (subtle)
];

let stars = [];

class Star {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x     = Math.random() * canvas.width;
    this.y     = initial ? Math.random() * canvas.height : Math.random() * canvas.height;
    this.baseR = 0.4 + Math.random() * 2.2;
    this.r     = this.baseR;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.008 + Math.random() * 0.025;
    this.glow  = 0.3 + Math.random() * 0.7;
    this.cross = Math.random() < 0.18;
    const c    = palettes[Math.floor(Math.random() * palettes.length)];
    this.r0 = c.r; this.g0 = c.g; this.b0 = c.b;
    this.vx = (Math.random() - 0.5) * 0.06;
    this.vy = (Math.random() - 0.5) * 0.04;
  }

  update() {
    this.phase += this.speed;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10) this.x = canvas.width  + 10;
    if (this.x > canvas.width  + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;
  }

  draw() {
    const brightness = (Math.sin(this.phase) + 1) / 2;
    const alpha  = 0.08 + brightness * this.glow;
    const radius = this.baseR * (0.5 + brightness * 0.85);
    const { r0: r, g0: g, b0: b } = this;

    // Soft outer glow
    const glowR = radius * 5;
    const grad  = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
    grad.addColorStop(0,    `rgba(${r},${g},${b},${(alpha * 0.55).toFixed(3)})`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},${(alpha * 0.2 ).toFixed(3)})`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core bright dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(alpha * 1.8, 1).toFixed(3)})`;
    ctx.fill();

    // Cross sparkle arms for some stars
    if (this.cross && brightness > 0.55) {
      const armLen   = radius * 5 * brightness;
      const armAlpha = (alpha * 1.1).toFixed(3);
      ctx.save();
      ctx.globalAlpha = parseFloat(armAlpha);
      ctx.lineWidth   = 0.6;

      // Horizontal arm
      const hGrad = ctx.createLinearGradient(this.x - armLen, this.y, this.x + armLen, this.y);
      hGrad.addColorStop(0,   'rgba(0,0,0,0)');
      hGrad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
      hGrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.strokeStyle = hGrad;
      ctx.beginPath();
      ctx.moveTo(this.x - armLen, this.y);
      ctx.lineTo(this.x + armLen, this.y);
      ctx.stroke();

      // Vertical arm
      const vGrad = ctx.createLinearGradient(this.x, this.y - armLen, this.x, this.y + armLen);
      vGrad.addColorStop(0,   'rgba(0,0,0,0)');
      vGrad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
      vGrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.strokeStyle = vGrad;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - armLen);
      ctx.lineTo(this.x, this.y + armLen);
      ctx.stroke();

      ctx.restore();
    }
  }
}

// Floating golden dust mote
class Mote {
  constructor() { this.reset(); }

  reset() {
    this.x       = Math.random() * canvas.width;
    this.y       = canvas.height + 10;
    this.size    = 0.8 + Math.random() * 1.4;
    this.vy      = -(0.15 + Math.random() * 0.35);
    this.vx      = (Math.random() - 0.5) * 0.2;
    this.life    = 0;
    this.maxLife = 180 + Math.random() * 220;
    const c      = palettes[Math.floor(Math.random() * 5)];
    this.r0 = c.r; this.g0 = c.g; this.b0 = c.b;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset();
  }

  draw() {
    const t     = this.life / this.maxLife;
    const alpha = Math.sin(t * Math.PI) * 0.55;
    const { r0: r, g0: g, b0: b } = this;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

function initStars() {
  const count = Math.floor((canvas.width * canvas.height) / 6000);
  stars = [];
  for (let i = 0; i < Math.min(count, 200); i++) stars.push(new Star());
  for (let i = 0; i < 40; i++) {
    const m  = new Mote();
    m.life   = Math.floor(Math.random() * m.maxLife);
    stars.push(m);
  }
}
initStars();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) { s.update(); s.draw(); }
  requestAnimationFrame(animate);
}
animate();

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.scrapbook-card, .viewer-wrapper, .gold-border-frame').forEach(el => {
  el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  observer.observe(el);
});
