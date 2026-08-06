import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const CelestialAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const lfoRef = useRef(null);

  const startCelestialSoundscape = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3); // Soft 3s fade in
      gainNodeRef.current = masterGain;

      // Lowpass Filter for warm atmospheric tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // 432Hz Warm Harmonic Chord (A3, C#4, E4, G#4 celestial chord)
      const frequencies = [216.0, 272.2, 324.0, 432.0, 540.0];
      const oscs = [];

      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle detuning for spatial warmth
        const detuneAmt = (Math.random() - 0.5) * 8;
        osc.detune.setValueAtTime(detuneAmt, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;

      // Subtle LFO modulation for breathing celestial swell
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 0.1Hz pulse
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(150, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoRef.current = lfo;

      setIsPlaying(true);
    } catch (e) {
      console.warn('[CelestialAudio] Failed to initialize Web Audio:', e);
    }
  };

  const stopCelestialSoundscape = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      // Soft 1.5s fade out
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try { osc.stop(); } catch (_) {}
        });
        if (lfoRef.current) {
          try { lfoRef.current.stop(); } catch (_) {}
        }
        if (audioCtxRef.current) {
          try { audioCtxRef.current.close(); } catch (_) {}
        }
        audioCtxRef.current = null;
        setIsPlaying(false);
      }, 1500);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopCelestialSoundscape();
    } else {
      startCelestialSoundscape();
    }
  };

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (_) {}
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        type="button"
        onClick={toggleSound}
        className={`group flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all cursor-pointer backdrop-blur-md shadow-xl ${
          isPlaying
            ? 'bg-[#D5B06C]/20 border-[#D5B06C] text-[#D5B06C] shadow-[0_0_20px_rgba(213,176,108,0.3)]'
            : 'bg-[#0F1216]/80 border-[#8A8177]/30 text-[#8A8177] hover:text-[#D5B06C] hover:border-[#D5B06C]/50'
        }`}
        title={isPlaying ? 'Mute Celestial Soundscape' : 'Enable Celestial Ambient Soundscape'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#D5B06C]" />
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold">
              Celestial Ambience
            </span>
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-3 bg-[#D5B06C] animate-[bounce_1s_infinite_100ms] rounded-full" />
              <span className="w-1 h-4 bg-[#D5B06C] animate-[bounce_1s_infinite_300ms] rounded-full" />
              <span className="w-1 h-2 bg-[#D5B06C] animate-[bounce_1s_infinite_200ms] rounded-full" />
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span className="font-sans text-[10px] uppercase tracking-widest hidden sm:inline">
              Ambient Audio
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default CelestialAudioPlayer;
