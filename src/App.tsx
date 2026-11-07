/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Grid3X3, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function App() {
  // Current active page: 1 or 2
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  // Navigation direction for directional slide animation ('next' | 'prev')
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // Wireframe inspector / preview toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Audio context for tactile mechanical click sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, audioCtxRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtxRef.current.currentTime + 0.04);
        gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.045);
      }
    } catch {
      // Audio not permitted or supported; silent fallback
    }
  };

  // Switch to Page 2 ("Avanti")
  const goToPage2 = () => {
    playClickSound();
    setDirection('next');
    setCurrentPage(2);
  };

  // Switch to Page 1 ("Indietro")
  const goToPage1 = () => {
    playClickSound();
    setDirection('prev');
    setCurrentPage(1);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (currentPage === 1) {
          goToPage2();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'Escape') {
        if (currentPage === 2) {
          goToPage1();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, soundEnabled]);

  // Dynamic system time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scale to viewport height if screen is small
  useEffect(() => {
    const calculateFit = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      // Phone is 852px tall + chrome (~120px) = ~980px
      if (windowHeight < 960 || windowWidth < 450) {
        const scaleH = (windowHeight - 120) / 852;
        const scaleW = (windowWidth - 40) / 393;
        const fitScale = Math.min(scaleH, scaleW, 0.95);
        setZoomScale(Math.max(0.65, Number(fitScale.toFixed(2))));
      } else {
        setZoomScale(0.9);
      }
    };
    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, []);

  // Animation variants for smooth page sliding
  const slideVariants = {
    enter: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? 240 : -240,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 380, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? -240 : 240,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 380, damping: 32 },
        opacity: { duration: 0.15 },
        scale: { duration: 0.15 },
      },
    }),
  };

  return (
    <div className="min-h-screen w-full wireframe-canvas-bg flex flex-col justify-between items-center text-black font-sans selection:bg-black selection:text-white pb-6 pt-4 px-4 overflow-y-auto">
      
      {/* Top Wireframe Blueprint Studio Toolbar */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 bg-white border-2 border-black shadow-[4px_4px_0px_#000000] rounded-none mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border-2 border-black flex items-center justify-center bg-black text-white">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider">iPhone 15 Wireframe</h1>
              <span className="text-[11px] font-technical px-1.5 py-0.5 border border-black bg-neutral-100">
                393 × 852 px
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 font-technical">
              Monochrome Low-Fi Mockup · Navigazione 2 Pagine
            </p>
          </div>
        </div>

        {/* Page Switcher Pills / Status Indicator */}
        <div className="flex items-center gap-1.5 font-technical text-xs border border-black p-1 bg-neutral-50">
          <button
            onClick={() => {
              if (currentPage !== 1) goToPage1();
            }}
            className={`px-3 py-1 border transition-all flex items-center gap-1.5 font-bold ${
              currentPage === 1
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Pagina 1
          </button>
          
          <span className="text-neutral-400">/</span>

          <button
            onClick={() => {
              if (currentPage !== 2) goToPage2();
            }}
            className={`px-3 py-1 border transition-all flex items-center gap-1.5 font-bold ${
              currentPage === 2
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Pagina 2
          </button>
        </div>

        {/* Viewport & Wireframe Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Mostra/Nascondi griglia wireframe"
            className={`h-8 px-2.5 border-2 border-black flex items-center gap-1.5 font-technical transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              showGrid ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Griglia</span>
          </button>

          {/* Alignment Guides Toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            title="Mostra/Nascondi guide e quote"
            className={`h-8 px-2.5 border-2 border-black flex items-center gap-1.5 font-technical transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              showGuides ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disattiva feedback sonoro' : 'Attiva feedback sonoro'}
            className={`h-8 w-8 border-2 border-black flex items-center justify-center font-technical transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
              soundEnabled ? 'bg-white text-black hover:bg-neutral-100' : 'bg-neutral-200 text-neutral-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
            <button
              onClick={() => setZoomScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(1))))}
              title="Riduci zoom"
              className="p-1.5 hover:bg-neutral-100 transition-colors border-r border-black"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-technical text-[11px] min-w-[42px] text-center font-bold">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((s) => Math.min(1.1, Number((s + 0.1).toFixed(1))))}
              title="Aumenta zoom"
              className="p-1.5 hover:bg-neutral-100 transition-colors border-l border-black"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1.0)}
              title="100% (Scala 1:1)"
              className="p-1.5 hover:bg-neutral-100 transition-colors border-l border-black text-[10px] font-technical font-bold"
            >
              1:1
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area with iPhone Mockup */}
      <main className="flex-1 flex flex-col items-center justify-center w-full py-2 relative">
        
        {/* Dimension markings when guides are turned on */}
        {showGuides && (
          <div 
            className="absolute z-10 pointer-events-none flex flex-col items-center justify-center font-technical text-[10px]"
            style={{
              width: `${393 * zoomScale + 48}px`,
              height: `${852 * zoomScale + 48}px`,
            }}
          >
            {/* Top dimension bar */}
            <div className="absolute -top-7 left-6 right-6 flex items-center justify-between text-black border-b border-black">
              <span>|</span>
              <span className="bg-white px-2 font-bold tracking-widest">393 PX (WIDTH)</span>
              <span>|</span>
            </div>
            {/* Left dimension bar */}
            <div className="absolute -left-12 top-6 bottom-6 flex flex-col items-center justify-between text-black border-r border-black pr-1">
              <span>—</span>
              <span className="bg-white py-1 font-bold tracking-widest -rotate-90 whitespace-nowrap">852 PX (HEIGHT)</span>
              <span>—</span>
            </div>
          </div>
        )}

        {/* Scaled iPhone 15 Device Container */}
        <div 
          className="transition-transform duration-200 origin-center relative flex items-center justify-center"
          style={{
            transform: `scale(${zoomScale})`,
            width: '393px',
            height: '852px',
          }}
        >
          {/* External Physical Buttons (Wireframe Style) */}
          {/* Left: Action Button */}
          <div className="absolute -left-[7px] top-[140px] w-[5px] h-[30px] bg-white border-2 border-black rounded-l-[3px]" />
          {/* Left: Volume Up */}
          <div className="absolute -left-[7px] top-[185px] w-[5px] h-[58px] bg-white border-2 border-black rounded-l-[3px]" />
          {/* Left: Volume Down */}
          <div className="absolute -left-[7px] top-[255px] w-[5px] h-[58px] bg-white border-2 border-black rounded-l-[3px]" />
          {/* Right: Side Power Button */}
          <div className="absolute -right-[7px] top-[205px] w-[5px] h-[86px] bg-white border-2 border-black rounded-r-[3px]" />

          {/* iPhone 15 Outer Frame (Bezel & Chassis) */}
          <div 
            className="w-[393px] h-[852px] bg-white border-[4px] border-black rounded-[54px] relative overflow-hidden flex flex-col shadow-[12px_16px_0px_rgba(0,0,0,0.9)]"
            style={{
              // iPhone 15 display specs
              boxShadow: '10px 14px 0px 0px #000000',
            }}
          >
            {/* Subtle inner screen boundary hairline */}
            <div className="absolute inset-[3px] border border-neutral-300 rounded-[50px] pointer-events-none z-30" />

            {/* Optional Screen Wireframe Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 screen-wireframe-grid pointer-events-none z-10 opacity-75" />
            )}

            {/* Optional Alignment Guides Center Crosshairs */}
            {showGuides && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Horizontal center line */}
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/25 border-t border-dashed border-black/40" />
                {/* Vertical center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/25 border-l border-dashed border-black/40" />
                {/* Screen diagonal guide lines */}
                <svg className="absolute inset-0 w-full h-full opacity-15 stroke-black" strokeWidth="0.75" strokeDasharray="4 4">
                  <line x1="0" y1="0" x2="393" y2="852" />
                  <line x1="393" y1="0" x2="0" y2="852" />
                </svg>
              </div>
            )}

            {/* ======================================================== */}
            {/* STATUS BAR & DYNAMIC ISLAND (IPHONE 15)                  */}
            {/* ======================================================== */}
            <div className="relative w-full h-[52px] shrink-0 px-7 pt-2 flex items-center justify-between select-none z-40">
              
              {/* Left: Time (9:41) */}
              <div className="w-14 flex items-center justify-start">
                <span className="font-bold text-[14px] tracking-tight font-technical">
                  {currentTime}
                </span>
              </div>

              {/* Center: Dynamic Island (120px x 35px) */}
              <div className="absolute left-1/2 top-[11px] -translate-x-1/2 w-[122px] h-[35px] bg-black rounded-full flex items-center justify-between px-3 z-50 border border-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
                {/* Left sensor pill */}
                <div className="w-3 h-3 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-700/60" />
                </div>
                {/* Right camera aperture */}
                <div className="w-3.5 h-3.5 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-neutral-500/80" />
                </div>
              </div>

              {/* Right: Cellular Signal, WiFi, Battery Icons (Wireframe style) */}
              <div className="w-20 flex items-center justify-end gap-1.5">
                {/* Cellular Signal Bars */}
                <div className="flex items-end gap-[1.5px] h-3">
                  <div className="w-[3px] h-[3px] bg-black" />
                  <div className="w-[3px] h-[5px] bg-black" />
                  <div className="w-[3px] h-[8px] bg-black" />
                  <div className="w-[3px] h-[11px] bg-black" />
                </div>

                {/* 5G / WiFi symbol */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13a10 10 0 0 1 14 0" />
                  <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                  <path d="M12 20h.01" />
                </svg>

                {/* Battery Pill */}
                <div className="w-[22px] h-[11px] border-[1.5px] border-black rounded-[3px] p-[1.5px] flex items-center relative">
                  <div className="w-full h-full bg-black rounded-[1px]" />
                  {/* Battery terminal nub */}
                  <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] bg-black rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* SCREEN VIEWPORT CONTENT CONTAINER                        */}
            {/* ======================================================== */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col z-20">
              
              <AnimatePresence mode="wait" custom={direction}>
                {currentPage === 1 ? (
                  /* ================================================== */
                  /* PAGINA 1: Vuota, con dentro SOLO il bottone "avanti" */
                  /* ================================================== */
                  <motion.div
                    key="page-1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                  >
                    {/* Optional Minimal Wireframe Layout Indicator */}
                    <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[11px] font-technical text-neutral-400 select-none">
                      <span>PAGE_01</span>
                      <span>WIREFRAME</span>
                    </div>

                    {/* Bottone con scritto "avanti" */}
                    <button
                      id="btn-avanti"
                      onClick={goToPage2}
                      className="group relative cursor-pointer font-bold tracking-wider uppercase text-base sm:text-lg px-10 py-4 bg-white text-black border-2 border-black rounded-lg shadow-[4px_4px_0px_#000000] hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      style={{
                        minWidth: '200px',
                        minHeight: '52px',
                      }}
                    >
                      <span>avanti</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Subtle wireframe coordinates under button when guides active */}
                    {showGuides && (
                      <div className="absolute bottom-8 font-technical text-[10px] text-neutral-400">
                        x: 196.5 | y: 426 · CTA_PRIMARY
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ================================================== */
                  /* PAGINA 2: Vuota, con dentro SOLO il bottone "indietro" */
                  /* ================================================== */
                  <motion.div
                    key="page-2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                  >
                    {/* Optional Minimal Wireframe Layout Indicator */}
                    <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[11px] font-technical text-neutral-400 select-none">
                      <span>PAGE_02</span>
                      <span>WIREFRAME</span>
                    </div>

                    {/* Bottone con scritto "indietro" */}
                    <button
                      id="btn-indietro"
                      onClick={goToPage1}
                      className="group relative cursor-pointer font-bold tracking-wider uppercase text-base sm:text-lg px-10 py-4 bg-white text-black border-2 border-black rounded-lg shadow-[4px_4px_0px_#000000] hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      style={{
                        minWidth: '200px',
                        minHeight: '52px',
                      }}
                    >
                      <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                      <span>indietro</span>
                    </button>

                    {/* Subtle wireframe coordinates under button when guides active */}
                    {showGuides && (
                      <div className="absolute bottom-8 font-technical text-[10px] text-neutral-400">
                        x: 196.5 | y: 426 · CTA_SECONDARY
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* ======================================================== */}
            {/* BOTTOM HOME INDICATOR (IPHONE 15)                        */}
            {/* ======================================================== */}
            <div className="relative w-full h-[28px] shrink-0 flex items-center justify-center select-none z-40 pb-2">
              <div 
                onClick={() => {
                  // Interactive home indicator resets or toggles page
                  if (currentPage === 2) goToPage1();
                  else goToPage2();
                }}
                title="Tocca la barra per passare alla pagina successiva"
                className="w-[138px] h-[5px] bg-black rounded-full cursor-pointer hover:bg-neutral-700 transition-colors" 
              />
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Technical Wireframe Footer Specs */}
      <footer className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black font-technical text-xs text-neutral-600 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-black uppercase">Specifiche iPhone 15:</span>
          <span>Risoluzione: 393 × 852 pt</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Ratio: 19.5:9</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">Corner Radius: 54 pt</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-neutral-500">
            Tasti rapidi: [Spazio / Frecce ← →]
          </span>
          <button
            onClick={() => {
              if (currentPage === 1) goToPage2();
              else goToPage1();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-black bg-white text-black font-bold hover:bg-neutral-100 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Alterna Schermata</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
