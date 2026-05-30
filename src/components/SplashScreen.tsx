import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Radio } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [synthSoundTriggered, setSynthSoundTriggered] = useState(false);

  // Floating particles generator
  const [particles] = useState(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6,
    }));
  });

  // Client-side Web Audio API synthesizer for the premium "RISHI RISK" launch sound
  const playLaunchSound = () => {
    if (synthSoundTriggered) return;
    setSynthSoundTriggered(true);

    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;

      const ctx = new AudioContextCtor();
      const now = ctx.currentTime;

      // Deep space sub swell
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(60, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 2.0);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.4, now + 0.4);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      // Celestial silver bell
      const bellOsc1 = ctx.createOscillator();
      const bellOsc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const bellGain = ctx.createGain();

      bellOsc1.type = "triangle";
      bellOsc2.type = "sine";

      // Perfect fifth celestial harmony
      bellOsc1.frequency.setValueAtTime(440, now); // A4
      bellOsc1.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5 spike
      bellOsc1.frequency.setValueAtTime(880, now + 0.3);

      bellOsc2.frequency.setValueAtTime(659.25, now); // E5

      filter.type = "peaking";
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(1.5, now);

      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      bellOsc1.connect(filter);
      bellOsc2.connect(filter);
      filter.connect(bellGain);
      bellGain.connect(ctx.destination);

      subOsc.start(now);
      bellOsc1.start(now);
      bellOsc2.start(now);

      subOsc.stop(now + 3.0);
      bellOsc1.stop(now + 3.0);
      bellOsc2.stop(now + 3.0);
    } catch (e) {
      console.warn("Web Audio API not allowed or initialized: ", e);
    }
  };

  useEffect(() => {
    // Increment loading text
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.25;
      });
    }, 40);

    // Auto complete redirection after 3.8 seconds
    const timeout = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div
      id="splash-screen"
      style={{ contentVisibility: "auto" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none"
    >
      {/* Background Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle bg-amber-500/10 pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-amber-950/5 rounded-full blur-[120px] -top-40 -left-20 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none"></div>

      {/* Vignette overlay for focus */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.85)] z-0"></div>

      {/* Cinematic Center Content */}
      <div className="z-10 flex flex-col items-center px-4 max-w-xl text-center">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-[1px] w-8 bg-amber-500/50"></div>
          <span className="text-[10px] tracking-[0.6em] text-amber-500 font-bold uppercase">
            Premium Digital Literature
          </span>
          <div className="h-[1px] w-8 bg-amber-500/50"></div>
        </motion.div>

        {/* Logo Heading Group */}
        <div className="relative group cursor-pointer" onClick={playLaunchSound}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-[-0.04em] text-white select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] uppercase">
              RISHI <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-600">RISK</span>
            </h1>

            {/* Audio pulse ping if not yet clicked */}
            {!synthSoundTriggered && (
              <span className="absolute -top-3 -right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}

            {/* Subtle lens flare effect */}
            <div className="absolute top-1/2 -left-10 w-40 h-1 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent rotate-12 blur-sm pointer-events-none"></div>
          </motion.div>
        </div>

        {/* Sub-branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1.0 }}
          className="mt-4 text-zinc-400 text-base sm:text-lg font-light tracking-[0.2em] italic font-serif"
        >
          Where stories live forever
        </motion.p>

        {/* Ambient audio hint button if silent */}
        {!synthSoundTriggered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            onClick={playLaunchSound}
            className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 text-[10px] uppercase font-mono tracking-widest text-amber-500 hover:bg-amber-900/30 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Tap for Launch Sound
          </motion.button>
        )}

        {synthSoundTriggered && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            className="mt-6 text-[10px] text-amber-500 font-mono tracking-widest uppercase"
          >
            🔊 Premium Audio Initialized
          </motion.div>
        )}

        {/* Loading Progress Component */}
        <div className="mt-16 flex flex-col items-center">
          {/* Progress Bar Container */}
          <div className="w-[280px] h-[3px] bg-zinc-900 rounded-full relative overflow-hidden">
            {/* Progress Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              style={{ width: `${loadingProgress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          
          {/* Status Indicators */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-500 uppercase">
              Synchronizing Story Engine ... {Math.min(100, Math.round(loadingProgress))}%
            </span>
            <div className="flex gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer micro-details */}
      <div className="absolute bottom-12 w-full px-12 hidden md:flex justify-between items-end opacity-30 select-none z-10 pointer-events-none">
        <div className="text-[10px] font-mono leading-relaxed text-zinc-500">
          BUILD VER: 4.2.0.R<br/>
          SECURE CONNECTION: ENCRYPTED
        </div>
        <div className="text-right text-zinc-500">
          <p className="text-[10px] tracking-widest font-semibold uppercase">A Global Creative Network</p>
        </div>
      </div>
    </div>
  );
}
