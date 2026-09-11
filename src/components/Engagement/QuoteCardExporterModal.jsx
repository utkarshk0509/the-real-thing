import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Copy, Check, Sparkles, X, Share2, Palette, 
  Smartphone, Square, Type, Sliders, Moon, Compass, Edit3
} from 'lucide-react';

const STYLES = {
  eclipse: {
    id: 'eclipse',
    name: 'Celestial Eclipse',
    subtitle: 'Obsidian velvet & molten gold foil',
    bg: '#07080B',
    gradientEnd: '#0D1117',
    foilStops: ['#FDE68A', '#D5B06C', '#8C6826', '#E9C775', '#B89245'],
    glowColor: 'rgba(213, 176, 108, 0.22)',
    textColor: '#FEEFFF',
    accentColor: '#D5B06C',
    subTextColor: '#9CA3AF',
    starColor: '#FEEFFF',
    constellationColor: 'rgba(213, 176, 108, 0.25)',
  },
  nebula: {
    id: 'nebula',
    name: 'Cosmic Nebula',
    subtitle: 'Deep galactic indigo & stardust',
    bg: '#0A0718',
    gradientEnd: '#1A1235',
    foilStops: ['#F3E8FF', '#C084FC', '#7E22CE', '#D8B4FE', '#9333EA'],
    glowColor: 'rgba(168, 85, 247, 0.22)',
    textColor: '#FAF5FF',
    accentColor: '#C084FC',
    subTextColor: '#A1A1AA',
    starColor: '#E9D5FF',
    constellationColor: 'rgba(192, 132, 252, 0.28)',
  },
  parchment: {
    id: 'parchment',
    name: 'Antique Monolith',
    subtitle: 'Smoked espresso & burnished bronze',
    bg: '#120F0D',
    gradientEnd: '#1C1713',
    foilStops: ['#FDE2C7', '#C88A58', '#784624', '#E2A97B', '#A06437'],
    glowColor: 'rgba(200, 138, 88, 0.22)',
    textColor: '#FDF8F3',
    accentColor: '#C88A58',
    subTextColor: '#A8998C',
    starColor: '#FFE7D1',
    constellationColor: 'rgba(200, 138, 88, 0.28)',
  },
  editorial: {
    id: 'editorial',
    name: 'Vogue Minimalist',
    subtitle: 'Cinematic typography & champagne lines',
    bg: '#050608',
    gradientEnd: '#050608',
    foilStops: ['#FFFFFF', '#E2D5C0', '#998D7B', '#FFFFFF', '#C7B9A5'],
    glowColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#FFFFFF',
    accentColor: '#E2D5C0',
    subTextColor: '#71717A',
    starColor: '#FFFFFF',
    constellationColor: 'rgba(255, 255, 255, 0.15)',
  }
};

const FONT_OPTIONS = {
  garamond: {
    id: 'garamond',
    name: 'Romantic Lyric',
    subtitle: 'Cormorant Garamond',
    cssFont: '"Cormorant Garamond", Georgia, serif',
    isItalic: true,
    baseFontSize: (ratio) => (ratio === '1:1' ? 42 : 46),
    minFontSize: 18,
    lineMultiplier: 1.65,
    letterSpacing: '0px',
  },
  playfair: {
    id: 'playfair',
    name: 'Editorial Luxury',
    subtitle: 'Playfair Display',
    cssFont: '"Playfair Display", Georgia, serif',
    isItalic: true,
    baseFontSize: (ratio) => (ratio === '1:1' ? 36 : 40),
    minFontSize: 16,
    lineMultiplier: 1.65,
    letterSpacing: '0px',
  },
  cinzel: {
    id: 'cinzel',
    name: 'Mythic Classical',
    subtitle: 'Cinzel Roman',
    cssFont: '"Cinzel", Georgia, serif',
    isItalic: false,
    baseFontSize: (ratio) => (ratio === '1:1' ? 30 : 34),
    minFontSize: 14,
    lineMultiplier: 1.7,
    letterSpacing: '1.2px',
  },
  mono: {
    id: 'mono',
    name: 'Midnight Typewriter',
    subtitle: 'Space Mono',
    cssFont: '"Space Mono", monospace',
    isItalic: false,
    baseFontSize: (ratio) => (ratio === '1:1' ? 24 : 28),
    minFontSize: 13,
    lineMultiplier: 1.6,
    letterSpacing: '0px',
  }
};

export const QuoteCardExporterModal = ({ isOpen, onClose, quoteText, workTitle, author, workSlug }) => {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState('eclipse');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' or '9:16'
  const [fontStyle, setFontStyle] = useState('garamond');
  
  // Customization Toggles
  const [showAura, setShowAura] = useState(true);
  const [showConstellations, setShowConstellations] = useState(true);
  const [showWaxSeal, setShowWaxSeal] = useState(true);

  // Editable text
  const [editableText, setEditableText] = useState(quoteText || '');
  const [isEditingText, setIsEditingText] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setEditableText(quoteText || '');
  }, [quoteText]);

  // Main Canvas Rendering Engine
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    let isMounted = true;
    const selectedFont = FONT_OPTIONS[fontStyle] || FONT_OPTIONS.garamond;
    const style = STYLES[activeTheme] || STYLES.eclipse;

    const renderCard = () => {
      if (!isMounted || !canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

      // High-resolution canvas dimensions
      const width = 1080;
      const height = aspectRatio === '1:1' ? 1080 : 1920;

      canvas.width = width;
      canvas.height = height;

      // 1. Background Fill
      if (style.gradientEnd !== style.bg) {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, style.bg);
        bgGrad.addColorStop(0.5, style.gradientEnd);
        bgGrad.addColorStop(1, style.bg);
        ctx.fillStyle = bgGrad;
      } else {
        ctx.fillStyle = style.bg;
      }
      ctx.fillRect(0, 0, width, height);

      // 2. Luminous Celestial Moon / Aura
      if (showAura) {
        const auraCenterX = width / 2;
        const auraCenterY = height / 2 - (aspectRatio === '1:1' ? 30 : 60);
        const auraRadius = width * 0.46;

        const auraGrad = ctx.createRadialGradient(
          auraCenterX, auraCenterY, 40,
          auraCenterX, auraCenterY, auraRadius
        );
        auraGrad.addColorStop(0, style.glowColor);
        auraGrad.addColorStop(0.45, style.glowColor.replace(/[\d\.]+\)$/, '0.08)'));
        auraGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(auraCenterX, auraCenterY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Astrolabe Ring in Aura
        ctx.strokeStyle = style.foilStops[1];
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.22;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(auraCenterX, auraCenterY, auraRadius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(auraCenterX, auraCenterY, auraRadius * 0.48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
      }

      // 3. Interconnected Constellation Map in Background
      if (showConstellations) {
        const constellationStars = [
          { x: 180, y: 220 },
          { x: 280, y: 160 },
          { x: 420, y: 240 },
          { x: 580, y: 190 },
          { x: 740, y: 230 },
          { x: 890, y: 170 },
          { x: 220, y: height - 260 },
          { x: 380, y: height - 190 },
          { x: 690, y: height - 210 },
          { x: 860, y: height - 280 },
        ];

        ctx.strokeStyle = style.constellationColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < constellationStars.length - 1; i++) {
          if (i === 5) continue;
          ctx.moveTo(constellationStars[i].x, constellationStars[i].y);
          ctx.lineTo(constellationStars[i + 1].x, constellationStars[i + 1].y);
        }
        ctx.stroke();

        // Star nodes
        constellationStars.forEach((star) => {
          ctx.fillStyle = style.starColor;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = style.foilStops[1];
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 5.5, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Ambient Stardust Specks
        const seedStars = 70;
        for (let i = 0; i < seedStars; i++) {
          const sx = (Math.sin(i * 733 + 41) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 419 + 83) * 0.5 + 0.5) * height;
          const sRadius = (Math.sin(i * 29) * 0.5 + 0.5) * 2.0 + 0.5;
          const sAlpha = (Math.cos(i * 13) * 0.5 + 0.5) * 0.45 + 0.15;

          ctx.fillStyle = style.starColor;
          ctx.globalAlpha = sAlpha;
          ctx.beginPath();
          ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // 4. Gold Foil Gradient Helpers
      const createFoilGradient = (x1, y1, x2, y2) => {
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const stops = style.foilStops;
        stops.forEach((color, idx) => {
          grad.addColorStop(idx / (stops.length - 1), color);
        });
        return grad;
      };

      // 5. Ornate Golden Borders & Framing
      const margin = aspectRatio === '1:1' ? 64 : 88;
      const innerMargin = margin + 20;

      const foilGrad = createFoilGradient(margin, margin, width - margin, height - margin);

      // Outer Thin Foil Border
      ctx.strokeStyle = foilGrad;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

      // Inner Delicate Filigree Border
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = 0.45;
      ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);
      ctx.globalAlpha = 1.0;

      // Corner Ornaments
      const drawCornerOrnament = (cx, cy, rot) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.fillStyle = foilGrad;
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', 0, 0);

        ctx.strokeStyle = foilGrad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(34, 0);
        ctx.moveTo(0, 14);
        ctx.lineTo(0, 34);
        ctx.stroke();

        ctx.restore();
      };

      drawCornerOrnament(margin, margin, 0);
      drawCornerOrnament(width - margin, margin, Math.PI / 2);
      drawCornerOrnament(width - margin, height - margin, Math.PI);
      drawCornerOrnament(margin, height - margin, -Math.PI / 2);

      // Helper to safely set/reset letter spacing without polluting subsequent draws
      const setLetterSpacing = (val) => {
        if ('letterSpacing' in ctx) {
          ctx.letterSpacing = val;
        }
      };

      // 6. Header Zone
      const headerY = margin + 55;

      ctx.fillStyle = foilGrad;
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      setLetterSpacing('0px');
      ctx.fillText('✧   ✦   ✧', width / 2, headerY - 14);

      ctx.font = '600 12px "Cinzel", Georgia, serif';
      setLetterSpacing('7px');
      ctx.fillStyle = style.accentColor;
      ctx.fillText('THE REAL THING • LITERARY SANCTUARY', width / 2, headerY + 16);

      ctx.font = '400 10px "Space Mono", monospace';
      setLetterSpacing('3px');
      ctx.fillStyle = style.subTextColor;
      ctx.fillText('CELESTIAL ARCHIVE • RA 18h 36m / DEC +38°', width / 2, headerY + 38);
      setLetterSpacing('0px'); // Reset letter spacing immediately

      const headerBottomY = headerY + 54;
      ctx.strokeStyle = foilGrad;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, headerBottomY);
      ctx.lineTo(width / 2 + 120, headerBottomY);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // 7. Footer Boundaries & Elements Anchors
      const sealRadius = 24;
      const sealY = showWaxSeal ? height - margin - 38 : null;
      const titleY = showWaxSeal ? height - margin - 84 : height - margin - 44;
      const authorY = titleY - 34;

      // 8. Safe Text Bounds & Collision Prevention Engine
      // contentBottomMax is strictly 36px above the author credit to prevent any overlap
      const contentTopMin = headerBottomY + 32;
      const contentBottomMax = authorY - 36;
      const availableHeight = contentBottomMax - contentTopMin;
      const maxTextWidth = width - (innerMargin * 2 + 80);

      const textToRender = editableText || 'The starlight remains long after the celestial body has turned to dust.';

      // Helper to compute wrapped lines, max width, and total height for a given font size
      const computeLayoutForSize = (fSize) => {
        const lineMultiplier = selectedFont.lineMultiplier || 1.65;
        const lHeight = Math.round(fSize * lineMultiplier);
        const fontPrefix = selectedFont.isItalic ? 'italic ' : '';
        ctx.font = `${fontPrefix}${fSize}px ${selectedFont.cssFont}`;
        setLetterSpacing(selectedFont.letterSpacing || '0px');

        const rawParagraphs = textToRender.split('\n').filter((p) => p.trim() !== '');
        const lines = [];
        let maxLineWidth = 0;

        rawParagraphs.forEach((p, pIdx) => {
          const words = p.split(/\s+/).filter(Boolean);
          let curLine = '';

          words.forEach((w) => {
            const testLine = curLine ? `${curLine} ${w}` : w;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && curLine) {
              lines.push(curLine);
              const m = ctx.measureText(curLine);
              if (m.width > maxLineWidth) maxLineWidth = m.width;
              curLine = w;
            } else {
              curLine = testLine;
            }
          });
          if (curLine) {
            lines.push(curLine);
            const m = ctx.measureText(curLine);
            if (m.width > maxLineWidth) maxLineWidth = m.width;
          }
          if (pIdx < rawParagraphs.length - 1) {
            lines.push(''); // Gap between stanzas
          }
        });

        // Compute total height with compact stanza spacing (0.6x line height)
        const totalH = lines.reduce((acc, line) => {
          return acc + (line === '' ? Math.round(lHeight * 0.6) : lHeight);
        }, 0);

        return { lines, lHeight, totalH, maxLineWidth };
      };

      // Starting font size tailored to typography characteristics
      let currentFontSize = selectedFont.baseFontSize(aspectRatio);
      let layout = computeLayoutForSize(currentFontSize);

      // Auto-step down font size if total text height exceeds availableHeight OR any line exceeds maxTextWidth
      while (
        (layout.totalH > availableHeight || layout.maxLineWidth > maxTextWidth) && 
        currentFontSize > (selectedFont.minFontSize || 14)
      ) {
        currentFontSize -= 1;
        layout = computeLayoutForSize(currentFontSize);
      }

      const { lines: wrappedLines, lHeight: lineHeight, totalH: totalBlockHeight } = layout;

      // Vertically center inside safe zone [contentTopMin, contentBottomMax]
      const safeCenterY = (contentTopMin + contentBottomMax) / 2;
      let blockTopY = safeCenterY - totalBlockHeight / 2;

      // Guaranteed bounds clamping
      if (blockTopY < contentTopMin) {
        blockTopY = contentTopMin;
      }
      if (blockTopY + totalBlockHeight > contentBottomMax) {
        blockTopY = Math.max(contentTopMin, contentBottomMax - totalBlockHeight);
      }

      // Draw Opening Quotation Mark ONLY if generous safe space exists above first line
      const spaceAbove = blockTopY - contentTopMin;
      if (spaceAbove >= 52) {
        const markSize = Math.min(38, Math.round(currentFontSize * 1.1));
        ctx.font = `italic ${markSize}px "Cormorant Garamond", Georgia, serif`;
        setLetterSpacing('0px');
        ctx.fillStyle = foilGrad;
        ctx.globalAlpha = 0.35;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // Baseline bottom at blockTopY - 14 ensures a guaranteed 14px gap above line 1
        ctx.fillText('“', width / 2, blockTopY - 14);
        ctx.globalAlpha = 1.0;
      }

      // Draw the Stanza Text Lines
      const fontPrefix = selectedFont.isItalic ? 'italic ' : '';
      ctx.font = `${fontPrefix}${currentFontSize}px ${selectedFont.cssFont}`;
      setLetterSpacing(selectedFont.letterSpacing || '0px');
      ctx.fillStyle = style.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let currentLineY = blockTopY;
      wrappedLines.forEach((line) => {
        if (line === '') {
          currentLineY += Math.round(lineHeight * 0.6);
        } else {
          const lineCenterY = currentLineY + lineHeight / 2;
          ctx.fillText(line, width / 2, lineCenterY);
          currentLineY += lineHeight;
        }
      });
      setLetterSpacing('0px'); // Reset letter spacing immediately

      // 9. Footer: Author Credit & Work Title
      ctx.font = 'italic 600 28px "Cormorant Garamond", Georgia, serif';
      setLetterSpacing('0px');
      ctx.fillStyle = foilGrad;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`— ${author || 'Anonymous'}`, width / 2, authorY);

      ctx.font = '600 13px "Cinzel", Georgia, serif';
      setLetterSpacing('4px');
      ctx.fillStyle = style.subTextColor;
      ctx.fillText(`FROM "${(workTitle || 'STARS').toUpperCase()}"`, width / 2, titleY);
      setLetterSpacing('0px'); // Reset letter spacing immediately

      // 10. Sanctuary Wax Seal Emblem
      if (showWaxSeal && sealY) {
        ctx.save();
        ctx.translate(width / 2, sealY);

        ctx.strokeStyle = foilGrad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 0.6;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, sealRadius - 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = foilGrad;
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◈', 0, 0);

        ctx.restore();
      }
    } catch (err) {
      console.error('Canvas render error in QuoteCardExporterModal:', err);
    }
  };

    // Initial render
    renderCard();

    // Re-render when web fonts finish downloading into the browser engine
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (isMounted) {
          renderCard();
        }
      }).catch(() => {});

      if (document.fonts.load && selectedFont?.cssFont) {
        const fontSpec = `${selectedFont.isItalic ? 'italic ' : ''}32px ${selectedFont.cssFont}`;
        document.fonts.load(fontSpec).then(() => {
          if (isMounted) renderCard();
        }).catch(() => {});
      }
    }

    return () => {
      isMounted = false;
    };
  }, [
    isOpen, editableText, workTitle, author, 
    activeTheme, aspectRatio, fontStyle, 
    showAura, showConstellations, showWaxSeal
  ]);

  // Download Action
  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeSlug = (workSlug || 'sanctuary').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `the-real-thing-${safeSlug}-${aspectRatio === '1:1' ? 'feed' : 'story'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  // Copy Image Action
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2500);
        } else {
          await navigator.clipboard.writeText(`"${editableText}" — ${author} (${workTitle})`);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2500);
        }
      });
    } catch (e) {
      try {
        await navigator.clipboard.writeText(`"${editableText}" — ${author} (${workTitle})`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (err) {}
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#090B0E] border border-[#D5B06C]/40 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] text-[#FEEFFF] overflow-hidden my-auto flex flex-col lg:flex-row max-h-[95vh]"
          >
          {/* Ambient Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#D5B06C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* LEFT: Live Interactive Canvas Preview */}
          <div className="flex-1 bg-[#040507] p-4 sm:p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between w-full mb-3 text-xs text-[#8A8177] font-sans uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-[#D5B06C]">
                <Sparkles className="w-3.5 h-3.5" /> High-DPI Canvas Preview
              </span>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {aspectRatio === '1:1' ? '1080 × 1080 px' : '1080 × 1920 px'}
              </span>
            </div>

            <div className="w-full flex justify-center items-center h-full max-h-[50vh] lg:max-h-[65vh]">
              <canvas
                ref={canvasRef}
                className={`rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 object-contain transition-all duration-300 ${
                  aspectRatio === '1:1' 
                    ? 'max-h-[46vh] lg:max-h-[60vh] aspect-square' 
                    : 'max-h-[46vh] lg:max-h-[60vh] aspect-[9/16]'
                }`}
              />
            </div>
          </div>

          {/* RIGHT: Customization Studio Controls */}
          <div className="w-full lg:w-[420px] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[92vh] space-y-5 bg-[#090B0E]/95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#D5B06C] font-semibold block">
                  Art Studio
                </span>
                <h3 className="font-serif text-xl text-[#FEEFFF] font-normal">
                  Celestial Quote Inscription
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#8A8177] hover:text-[#FEEFFF] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customization Options */}
            <div className="space-y-4">
              {/* 1. Theme Presets */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest text-[#8A8177]">
                  <Palette className="w-3.5 h-3.5 text-[#D5B06C]" /> Card Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(STYLES).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setActiveTheme(st.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeTheme === st.id
                          ? 'border-[#D5B06C] bg-[#D5B06C]/15 shadow-[0_0_15px_rgba(213,176,108,0.2)]'
                          : 'border-white/10 bg-[#12151B] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0" 
                          style={{ background: st.accentColor }}
                        />
                        <span className={`text-xs font-serif font-medium truncate ${activeTheme === st.id ? 'text-[#D5B06C]' : 'text-[#FEEFFF]'}`}>
                          {st.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#8A8177] block line-clamp-1">
                        {st.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Format Toggle */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest text-[#8A8177]">
                  <Share2 className="w-3 h-3 text-[#D5B06C]" /> Canvas Aspect Ratio
                </label>
                <div className="flex gap-2 bg-[#12151B] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setAspectRatio('1:1')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === '1:1'
                        ? 'bg-[#D5B06C] text-[#080A06] font-semibold shadow'
                        : 'text-[#8A8177] hover:text-[#FEEFFF]'
                    }`}
                  >
                    <Square className="w-3 h-3" /> 1:1 Feed Post
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-[#D5B06C] text-[#080A06] font-semibold shadow'
                        : 'text-[#8A8177] hover:text-[#FEEFFF]'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> 9:16 Story / Reel
                  </button>
                </div>
              </div>

              {/* 3. Typography Selection Studio */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest text-[#8A8177]">
                  <Type className="w-3 h-3 text-[#D5B06C]" /> Typography Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(FONT_OPTIONS).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontStyle(f.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        fontStyle === f.id
                          ? 'border-[#D5B06C] bg-[#D5B06C]/15 shadow-[0_0_15px_rgba(213,176,108,0.2)]'
                          : 'border-white/10 bg-[#12151B] hover:border-white/20'
                      }`}
                    >
                      <div className={`text-xs font-medium truncate ${fontStyle === f.id ? 'text-[#D5B06C]' : 'text-[#FEEFFF]'}`}>
                        {f.name}
                      </div>
                      <span className="text-[9px] text-[#8A8177] block line-clamp-1">
                        {f.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Celestial Elements Toggles */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest text-[#8A8177]">
                  <Sliders className="w-3 h-3 text-[#D5B06C]" /> Celestial Accents
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAura(!showAura)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-sans uppercase tracking-wider transition-all cursor-pointer ${
                      showAura
                        ? 'border-[#D5B06C]/60 bg-[#D5B06C]/15 text-[#D5B06C]'
                        : 'border-white/10 bg-[#12151B] text-[#8A8177]'
                    }`}
                  >
                    Moon Aura {showAura ? '✓' : ''}
                  </button>

                  <button
                    onClick={() => setShowConstellations(!showConstellations)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-sans uppercase tracking-wider transition-all cursor-pointer ${
                      showConstellations
                        ? 'border-[#D5B06C]/60 bg-[#D5B06C]/15 text-[#D5B06C]'
                        : 'border-white/10 bg-[#12151B] text-[#8A8177]'
                    }`}
                  >
                    Stars {showConstellations ? '✓' : ''}
                  </button>

                  <button
                    onClick={() => setShowWaxSeal(!showWaxSeal)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-sans uppercase tracking-wider transition-all cursor-pointer ${
                      showWaxSeal
                        ? 'border-[#D5B06C]/60 bg-[#D5B06C]/15 text-[#D5B06C]'
                        : 'border-white/10 bg-[#12151B] text-[#8A8177]'
                    }`}
                  >
                    Seal Stamp {showWaxSeal ? '✓' : ''}
                  </button>
                </div>
              </div>

              {/* 4. Edit Text Dropdown / Toggle */}
              <div className="space-y-1.5">
                <button
                  onClick={() => setIsEditingText(!isEditingText)}
                  className="flex items-center justify-between w-full text-[10px] font-sans uppercase tracking-widest text-[#8A8177] hover:text-[#D5B06C] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3 text-[#D5B06C]" /> Custom Quote Inscription
                  </span>
                  <span>{isEditingText ? 'Hide Editor ▲' : 'Edit Text ▼'}</span>
                </button>

                {isEditingText && (
                  <textarea
                    rows={3}
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    placeholder="Enter or customize the poetic inscription..."
                    className="w-full p-2.5 rounded-xl bg-[#050608] border border-white/15 text-[#FEEFFF] text-xs font-serif focus:outline-none focus:border-[#D5B06C] resize-none"
                  />
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
              <button
                onClick={handleCopyImage}
                className="flex-1 py-2.5 px-3 rounded-xl border border-white/20 bg-[#12151B] text-xs font-sans uppercase tracking-wider text-[#FEEFFF] hover:border-[#D5B06C] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D5B06C]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-[1.5] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D5B06C] via-[#F5D77F] to-[#D5B06C] hover:brightness-110 text-[#080A06] text-xs font-sans uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(213,176,108,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Inscribing...' : 'Download HD Card'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default QuoteCardExporterModal;
