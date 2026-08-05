import React, { useEffect, useRef } from 'react';

export default function AtmosphericBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse position for subtle interactivity
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate floating particles (stardust / embers)
    const particleCount = Math.floor((width * height) / 18000);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2 - 0.05, // Slight upward drift
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient radial glow at the top center
      const gradient = ctx.createRadialGradient(width / 2, 0, 50, width / 2, height / 2, width);
      gradient.addColorStop(0, 'rgba(213, 176, 108, 0.04)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around screen boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Distance check to mouse for interactive illumination
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let currentOpacity = p.opacity;

        if (dist < 120) {
          currentOpacity = Math.min(1, p.opacity + (1 - dist / 120) * 0.6);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(213, 176, 108, ${currentOpacity})`;
        ctx.fill();

        // Draw faint constellation threads between close particles near the cursor
        particles.forEach((p2) => {
          const distanceBetweenParticles = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distanceBetweenParticles < 80 && dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(213, 176, 108, {0.08 * (1 - dist / 150))}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}