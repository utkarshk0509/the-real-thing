import React, { useEffect, useRef } from 'react';

/**
 * CosmicNebulaBackground
 *
 * A canvas-driven deep-space nebula with:
 *  - Layered star fields (near / mid / far) with parallax on mouse
 *  - Slow-rotating nebula dust clouds (radial gradient blobs)
 *  - Shooting stars that streak across the canvas periodically
 *  - Mouse: stars near cursor illuminate + subtle parallax layers shift
 *  - Scroll: deeper layers drift upward as page scrolls (parallax)
 *
 * Variants (per-page palettes):
 *  'poems'   — deep violet + gold
 *  'stories' — midnight blue + teal
 *  'about'   — warm rose + amber
 *  'reader'  — deep indigo + soft lavender
 */

const PALETTES = {
  poems: {
    clouds: [
      { r: 120, g: 60,  b: 200 },
      { r: 80,  g: 20,  b: 160 },
      { r: 213, g: 176, b: 108 },
      { r: 160, g: 80,  b: 220 },
    ],
    starColor: { r: 213, g: 176, b: 108 },
    shootingStarColor: 'rgba(213, 176, 108, 0.9)',
    coreGlow: 'rgba(120, 60, 200, 0.12)',
  },
  stories: {
    clouds: [
      { r: 20,  g: 60,  b: 180 },
      { r: 10,  g: 120, b: 160 },
      { r: 30,  g: 80,  b: 200 },
      { r: 0,   g: 160, b: 180 },
    ],
    starColor: { r: 140, g: 220, b: 255 },
    shootingStarColor: 'rgba(100, 220, 255, 0.9)',
    coreGlow: 'rgba(10, 80, 160, 0.12)',
  },
  about: {
    clouds: [
      { r: 200, g: 80,  b: 100 },
      { r: 213, g: 140, b: 60  },
      { r: 180, g: 60,  b: 80  },
      { r: 240, g: 180, b: 80  },
    ],
    starColor: { r: 255, g: 210, b: 160 },
    shootingStarColor: 'rgba(255, 200, 120, 0.9)',
    coreGlow: 'rgba(200, 80, 80, 0.10)',
  },
  reader: {
    clouds: [
      { r: 40,  g: 30,  b: 140 },
      { r: 80,  g: 60,  b: 180 },
      { r: 120, g: 100, b: 220 },
      { r: 60,  g: 40,  b: 160 },
    ],
    starColor: { r: 200, g: 190, b: 255 },
    shootingStarColor: 'rgba(190, 180, 255, 0.9)',
    coreGlow: 'rgba(60, 40, 160, 0.12)',
  },
};

function rand(min, max) { return Math.random() * (max - min) + min; }

export default function CosmicNebulaBackground({ variant = 'reader' }) {
  const canvasRef = useRef(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let time = 0;
    let scrollY = 0;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Star layers
    const makeStars = (count, minSize, maxSize, speedFactor, parallaxFactor) =>
      Array.from({ length: count }, () => ({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        size: rand(minSize, maxSize),
        baseOpacity: rand(0.15, 0.7),
        twinkleOffset: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.3, 1.2),
        speedX: (Math.random() - 0.5) * 0.04 * speedFactor,
        speedY: (Math.random() - 0.5) * 0.04 * speedFactor - 0.008 * speedFactor,
        parallax: parallaxFactor,
      }));

    const farStars  = makeStars(120, 0.2, 0.6, 0.4, 0.02);
    const midStars  = makeStars(60,  0.5, 1.2, 0.7, 0.06);
    const nearStars = makeStars(25,  1.0, 2.2, 1.0, 0.12);

    // Nebula clouds
    const clouds = Array.from({ length: 7 }, () => ({
      cx: rand(0.1, 0.9),
      cy: rand(0.05, 0.85),
      rx: rand(0.12, 0.38),
      ry: rand(0.10, 0.30),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: (Math.random() - 0.5) * 0.00015,
      colorIndex: Math.floor(rand(0, 4)),
      baseAlpha: rand(0.025, 0.065),
      pulseOffset: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.0003, 0.001),
      parallax: rand(0.005, 0.018),
    }));

    // Shooting stars
    const shooters = [];
    const spawnShooter = () => {
      shooters.push({
        x: rand(0.1, 0.9) * window.innerWidth,
        y: rand(0.0, 0.3) * window.innerHeight,
        length: rand(80, 180),
        angle: rand(Math.PI * 0.1, Math.PI * 0.45),
        speed: rand(6, 14),
        life: 1.0,
        decay: rand(0.012, 0.025),
        width: rand(1.0, 2.2),
      });
    };
    spawnShooter(); spawnShooter();
    const shooterInterval = setInterval(() => {
      if (Math.random() < 0.5) spawnShooter();
    }, 2800);

    const render = () => {
      time += 0.008;
      const W = canvas.width;
      const H = canvas.height;
      const pal = PALETTES[variantRef.current] || PALETTES.reader;
      const { starColor, clouds: cloudColors, shootingStarColor, coreGlow } = pal;

      ctx.clearRect(0, 0, W, H);

      // Core ambient radial glow
      const coreGrad = ctx.createRadialGradient(W / 2, H * 0.1, 0, W / 2, H * 0.4, W * 0.7);
      coreGrad.addColorStop(0, coreGlow);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, W, H);

      // Nebula clouds
      clouds.forEach((cloud) => {
        const col = cloudColors[cloud.colorIndex];
        const pulse = Math.sin(time * cloud.pulseSpeed * 1000 + cloud.pulseOffset) * 0.015;
        const alpha = Math.max(0, cloud.baseAlpha + pulse);
        const mx = (mouse.x / W - 0.5) * cloud.parallax * W * 0.6;
        const my = (mouse.y / H - 0.5) * cloud.parallax * H * 0.4;
        const sy = scrollY * cloud.parallax * 0.3;
        const cx = cloud.cx * W + mx;
        const cy = cloud.cy * H + my - sy;
        const rx = cloud.rx * W;
        const ry = cloud.ry * H;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(cloud.rotation + time * cloud.rotationSpeed * 100);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
        grad.addColorStop(0,   `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.4})`);
        grad.addColorStop(1,   `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
        ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
        cloud.rotation += cloud.rotationSpeed;
      });

      // Star layers
      const drawStarLayer = (stars) => {
        stars.forEach((s) => {
          s.x += s.speedX;
          s.y += s.speedY;
          if (s.x < 0) s.x = W;
          if (s.x > W) s.x = 0;
          if (s.y < 0) s.y = H;
          if (s.y > H) s.y = 0;

          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = dist < 160 ? (1 - dist / 160) * 0.7 : 0;
          const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * 6 + s.twinkleOffset);
          const opacity = Math.min(1, s.baseOpacity * (0.6 + 0.4 * twinkle) + proximity);

          const px = (mouse.x / W - 0.5) * s.parallax * W;
          const py = (mouse.y / H - 0.5) * s.parallax * H;
          const sy2 = scrollY * s.parallax * 0.5;
          const sx = s.x + px;
          const sy3 = s.y + py - sy2;

          // Glow halo for near stars
          if (s.size > 1.2) {
            const halo = ctx.createRadialGradient(sx, sy3, 0, sx, sy3, s.size * 4);
            halo.addColorStop(0, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${opacity * 0.3})`);
            halo.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(sx, sy3, s.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(sx, sy3, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${opacity})`;
          ctx.fill();

          // Cross sparkle for brightest near stars
          if (s.size > 1.8 && opacity > 0.5) {
            const armLen = s.size * 5;
            ctx.save();
            ctx.strokeStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${opacity * 0.25})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(sx - armLen, sy3); ctx.lineTo(sx + armLen, sy3);
            ctx.moveTo(sx, sy3 - armLen); ctx.lineTo(sx, sy3 + armLen);
            ctx.stroke();
            ctx.restore();
          }
        });
      };

      drawStarLayer(farStars);
      drawStarLayer(midStars);
      drawStarLayer(nearStars);

      // Constellation threads near cursor
      const allStars = [...midStars, ...nearStars];
      for (let i = 0; i < allStars.length; i++) {
        const a = allStars[i];
        const dax = mouse.x - a.x;
        const day = mouse.y - a.y;
        const distA = Math.sqrt(dax * dax + day * day);
        if (distA > 200) continue;
        for (let j = i + 1; j < allStars.length; j++) {
          const b = allStars[j];
          const ab = Math.hypot(a.x - b.x, a.y - b.y);
          if (ab < 90) {
            const threadAlpha = 0.07 * (1 - ab / 90) * (1 - distA / 200);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${threadAlpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.life -= sh.decay;
        if (sh.life <= 0) { shooters.splice(i, 1); continue; }

        const tailX = sh.x - Math.cos(sh.angle) * sh.length * sh.life;
        const tailY = sh.y - Math.sin(sh.angle) * sh.length * sh.life;
        const grad = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y);
        grad.addColorStop(0, 'transparent');
        const alpha = (sh.life * 0.9).toFixed(2);
        grad.addColorStop(1, shootingStarColor.replace('0.9', alpha));

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sh.x, sh.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = sh.width * sh.life;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(shooterInterval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
