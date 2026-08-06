import React, { useEffect, useRef } from 'react';

export const MagicStardustTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Disable on mobile touch devices
    if ('ontouchstart' in window && window.innerWidth < 768) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let particles = [];
    let lastMousePos = { x: -100, y: -100 };
    let idleTimer;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const COLORS = ['#D5B06C', '#FEEFFF', '#E2B36E', '#7CB9E8', '#F5E8D0'];

    const spawnParticles = (x, y) => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.15,
          size: Math.random() * 2.2 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 0,
          maxLife: Math.random() * 25 + 20,
        });
      }

      if (particles.length > 80) {
        particles = particles.slice(particles.length - 80);
      }
    };

    const handleMouseMove = (e) => {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        spawnParticles(e.clientX, e.clientY);
        lastMousePos = { x: e.clientX, y: e.clientY };
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {}, 150);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y -= p.vy * 0.5;

        const progress = p.life / p.maxLife;
        const opacity = Math.max(0, 1 - progress);

        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 opacity-90"
    />
  );
};

export default MagicStardustTrail;
