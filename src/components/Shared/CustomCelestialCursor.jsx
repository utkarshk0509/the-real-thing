import React, { useEffect, useRef } from 'react';

export const CustomCelestialCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Disable on touch / mobile devices
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
      return;
    }

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHovered = false;
    let isClicking = false;
    let isTextInput = false;
    let animId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseDown = () => {
      isClicking = true;
    };

    const handleMouseUp = () => {
      isClicking = false;
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || target.nodeType !== 1) return;

      const isText = target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.isContentEditable ||
        target.closest?.('textarea, input, [contenteditable="true"]');

      isTextInput = !!isText;

      if (!isTextInput) {
        const isClickable = target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.getAttribute?.('role') === 'button' ||
          target.closest?.('button, a, [role="button"], .cursor-pointer');
        isHovered = !!isClickable;
      } else {
        isHovered = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    // Smooth RAF animation loop without React state re-renders
    const render = () => {
      if (isTextInput) {
        cursorEl.style.opacity = '0';
      } else {
        cursorEl.style.opacity = '1';
        // Gentle lerp for celestial trailing feel
        currentX += (mouseX - currentX) * 0.28;
        currentY += (mouseY - currentY) * 0.28;

        const size = isHovered ? 36 : 24;
        const scale = isClicking ? 0.75 : isHovered ? 1.25 : 1;
        const borderColor = isHovered ? '#FFE8A3' : 'rgba(213, 176, 108, 0.45)';
        const bg = isHovered
          ? 'rgba(213, 176, 108, 0.16)'
          : isClicking
          ? 'rgba(213, 176, 108, 0.25)'
          : 'rgba(213, 176, 108, 0.04)';

        cursorEl.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0) scale(${scale})`;
        cursorEl.style.width = `${size}px`;
        cursorEl.style.height = `${size}px`;
        cursorEl.style.borderColor = borderColor;
        cursorEl.style.backgroundColor = bg;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <div
        ref={cursorRef}
        style={{ willChange: 'transform, opacity' }}
        className="fixed top-0 left-0 rounded-full border shadow-[0_0_15px_rgba(213,176,108,0.35)] backdrop-blur-[0.5px] pointer-events-none opacity-0 transition-[border-color,background-color] duration-150"
      />
    </div>
  );
};

export default CustomCelestialCursor;
