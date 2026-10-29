import React, { useState, useEffect, useCallback } from 'react';
import { GameMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenControls: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

interface MenuOption {
  id: GameMode;
  numberKey: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: string;
  activeGradient: string;
  activeBorder: string;
  glowColor: string;
  accentText: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: 'arcade',
    numberKey: '1',
    title: 'MODO 1V1 ARCADE',
    subtitle: 'TORNEO CLÁSICO ESTILO STREET FIGHTER II',
    tag: '1V1 HISTORIA',
    icon: '🥊',
    activeGradient: 'from-amber-500 via-orange-600 to-red-700',
    activeBorder: 'border-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    accentText: 'text-amber-200',
  },
  {
    id: 'beatemup',
    numberKey: '2',
    title: 'MODO CALLEJERO',
    subtitle: 'AVENTURA FINAL FIGHT · OLEADAS Y JEFES',
    tag: 'BEAT EM UP',
    icon: '💥',
    activeGradient: 'from-rose-500 via-purple-600 to-indigo-800',
    activeBorder: 'border-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    accentText: 'text-rose-200',
  },
  {
    id: 'versus_cpu',
    numberKey: '3',
    title: '1P VS COMPUTADORA',
    subtitle: 'DUELO 1V1 CONTRA INTELIGENCIA ARTIFICIAL',
    tag: 'VS CPU',
    icon: '🤖',
    activeGradient: 'from-cyan-500 via-blue-600 to-indigo-800',
    activeBorder: 'border-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    accentText: 'text-cyan-200',
  },
  {
    id: 'versus_p2',
    numberKey: '4',
    title: '1P VS 2P LOCAL',
    subtitle: 'COMBATE 1V1 EN EL MISMO TECLADO O PANTALLA',
    tag: '2P VERSUS',
    icon: '👥',
    activeGradient: 'from-emerald-400 via-green-600 to-teal-800',
    activeBorder: 'border-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.65)',
    accentText: 'text-emerald-200',
  },
  {
    id: 'training',
    numberKey: '5',
    title: 'MODO ENTRENAMIENTO',
    subtitle: 'PRÁCTICA LIBRE, HITBOXES Y SUPER COMBOS',
    tag: 'DOJO LIBRE',
    icon: '🥋',
    activeGradient: 'from-yellow-400 via-amber-500 to-orange-700',
    activeBorder: 'border-yellow-300',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    accentText: 'text-yellow-200',
  },
];

// SVG Lucha Libre Mask Cursor (Street Fighter II inspired active indicator)
const LuchaMaskCursor: React.FC = () => (
  <div className="flex items-center space-x-1 sm:space-x-2 animate-cursor-bounce">
    {/* Street Fighter II Style Sparkling Stars */}
    <span className="text-amber-300 text-xs sm:text-sm animate-pulse hidden sm:inline">★</span>
    
    {/* Lucha Mask Badge */}
    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 via-red-600 to-neutral-900 p-0.5 shadow-[0_0_15px_rgba(251,191,36,0.9)] border border-amber-200 flex items-center justify-center">
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        {/* Mask Base Dome */}
        <path
          d="M18 3C11 3 6 8 6 16C6 23 10 30 18 33C26 30 30 23 30 16C30 8 25 3 18 3Z"
          fill="#DC2626"
          stroke="#FDE047"
          strokeWidth="1.5"
        />
        {/* Forehead Golden Horn / Crest */}
        <path
          d="M18 4L20 11H16L18 4Z"
          fill="#F59E0B"
          stroke="#FEF08A"
          strokeWidth="0.8"
        />
        {/* Lucha Eye Cutouts with Glowing Neon Pupils */}
        <path
          d="M10 14C12 13 14 14 15 17C14 18 12 18 10 17C9 16 9 15 10 14Z"
          fill="#171717"
          stroke="#FEF08A"
          strokeWidth="1"
        />
        <circle cx="12.5" cy="15.5" r="1.2" fill="#22D3EE" />
        
        <path
          d="M26 14C24 13 22 14 21 17C22 18 24 18 26 17C27 16 27 15 26 14Z"
          fill="#171717"
          stroke="#FEF08A"
          strokeWidth="1"
        />
        <circle cx="23.5" cy="15.5" r="1.2" fill="#22D3EE" />

        {/* Nose Line */}
        <path d="M18 16V22" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />

        {/* Mouth Mesh Opening */}
        <path
          d="M13 25C15 26.5 21 26.5 23 25C21 27.5 15 27.5 13 25Z"
          fill="#000000"
          stroke="#FEF08A"
          strokeWidth="1"
        />

        {/* Cheek Flame Accents */}
        <path d="M7 19C9 20 9 22 8 24" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" />
        <path d="M29 19C27 20 27 22 28 24" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>

    {/* Neon Arrow Pointer */}
    <div className="w-0 h-0 border-y-[6px] sm:border-y-[8px] border-y-transparent border-l-[10px] sm:border-l-[14px] border-l-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,1)]"></div>
  </div>
);

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenControls,
  onToggleMute,
  isMuted,
  crtEnabled,
  onToggleCrt,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Trigger game start for currently selected mode
  const handleSelectMode = useCallback(
    (mode: GameMode) => {
      soundManager.playCoin();
      soundManager.startMariachiBGM();
      onStartGame(mode);
    },
    [onStartGame]
  );

  // Full Arcade Keyboard Navigation (Street Fighter II style: Up/Down / W/S / Enter/Space / Numbers 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigate Up
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        soundManager.playSelect();
        setSelectedIndex(prev => (prev === 0 ? MENU_OPTIONS.length - 1 : prev - 1));
        return;
      }

      // Navigate Down
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        soundManager.playSelect();
        setSelectedIndex(prev => (prev === MENU_OPTIONS.length - 1 ? 0 : prev + 1));
        return;
      }

      // Confirm / Select
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        const activeOption = MENU_OPTIONS[selectedIndex];
        handleSelectMode(activeOption.id);
        return;
      }

      // Number keys 1-5 quick select
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5'].includes(e.code)) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= MENU_OPTIONS.length) {
          e.preventDefault();
          const targetIndex = num - 1;
          setSelectedIndex(targetIndex);
          handleSelectMode(MENU_OPTIONS[targetIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleSelectMode]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#19110d] via-[#201815] to-[#0a0706] overflow-y-auto overflow-x-hidden select-none">
      
      {/* Background Arena Texture & Subtle Ring Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ef4444 1px, #0c0a09 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Traditional Mexican Papel Picado Row (Top Border) */}
      <div className="absolute top-0 inset-x-0 flex justify-around opacity-95 pointer-events-none z-10 overflow-hidden">
        {[
          { color: '#ec4899', motif: '💀' },
          { color: '#ea580c', motif: '🥊' },
          { color: '#16a34a', motif: '🇲🇽' },
          { color: '#facc15', motif: '⚡' },
          { color: '#06b6d4', motif: '🕯️' },
          { color: '#e11d48', motif: '★' },
          { color: '#8b5cf6', motif: '💀' },
          { color: '#ea580c', motif: '🌶️' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="w-12 sm:w-16 h-10 sm:h-12 shadow-lg transform -skew-x-2 relative flex items-center justify-center border-t-2 border-amber-200/40"
            style={{ backgroundColor: item.color }}
          >
            {/* Cutout punch hole detailing */}
            <div className="absolute inset-1 border border-dashed border-black/25 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs opacity-75">{item.motif}</span>
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-around">
              <div className="w-2 h-2 bg-[#19110d] rotate-45"></div>
              <div className="w-2 h-2 bg-[#19110d] rotate-45"></div>
              <div className="w-2 h-2 bg-[#19110d] rotate-45"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cempasúchil Petals Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full shadow-sm animate-petal pointer-events-none"
            style={{
              width: `${(i % 3) * 3 + 8}px`,
              height: `${(i % 2) * 2 + 6}px`,
              backgroundColor: i % 2 === 0 ? '#f59e0b' : '#ea580c',
              top: `${(i * 17) % 94}%`,
              left: `${(i * 23) % 96}%`,
              animationDelay: `${(i * 0.4).toFixed(1)}s`,
              animationDuration: `${5 + (i % 4)}s`,
              filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.8))',
            }}
          />
        ))}
      </div>

      {/* Top Header Controls Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center z-20 pt-4 sm:pt-6">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="px-2.5 py-1 bg-emerald-800/90 border border-emerald-400 text-emerald-100 text-[9px] sm:text-[10px] rounded font-black tracking-wider shadow-sm flex items-center space-x-1">
            <span className="text-amber-300">⚡</span>
            <span>MAMÁ LUCHA EDITION</span>
          </span>
          <span className="px-2.5 py-1 bg-amber-800/90 border border-amber-400 text-amber-100 text-[9px] sm:text-[10px] rounded font-black tracking-wider shadow-sm flex items-center space-x-1">
            <span>🕯️</span>
            <span>DÍA DE MUERTOS</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleCrt}
            className={`px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold rounded border-2 transition cursor-pointer flex items-center space-x-1.5 shadow-md ${
              crtEnabled
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            <span>📺</span>
            <span>CRT: {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>
          
          <button
            onClick={onToggleMute}
            className="px-2.5 sm:px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 hover:border-amber-400 text-[9px] sm:text-[10px] font-bold text-neutral-200 rounded cursor-pointer transition shadow-md flex items-center space-x-1"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'MUTE' : 'MÚSICA'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Stage Container */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-4xl z-10 py-3 sm:py-5">
        
        {/* Banner Tag */}
        <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 mb-2 bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase rounded shadow-[0_2px_10px_rgba(220,38,38,0.6)] border-2 border-amber-300 transform -rotate-1">
          <span className="text-amber-300">★</span>
          <span>¡CAMPEONATO DE BARRIO!</span>
          <span className="text-amber-300">★</span>
        </div>

        {/* Arcade Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black arcade-text-gold tracking-tight leading-tight uppercase text-center mb-1 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
          LUCHA CALLEJERA
        </h1>

        {/* Subtitle with Cempasúchil Glow */}
        <p className="text-xs sm:text-sm md:text-base text-amber-200 font-bold tracking-widest cempasuchil-glow text-center mb-4 sm:mb-5">
          TORNEO NACIONAL DEL GOLPE Y LA OFRENDA
        </p>

        {/* Featured Champions Roster Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 bg-black/75 px-3 sm:px-5 py-2 rounded-xl border border-amber-500/50 backdrop-blur-md shadow-2xl max-w-2xl">
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">🦸‍♀️</span>
            <span className="text-[9px] sm:text-[10px] text-green-400 font-bold">Mamá Lucha</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">🗡️</span>
            <span className="text-[9px] sm:text-[10px] text-red-400 font-bold">Zorro Negro</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">🏄‍♀️</span>
            <span className="text-[9px] sm:text-[10px] text-purple-400 font-bold">Dafne</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">🐱</span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">Gato Sombra</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">🧛</span>
            <span className="text-[9px] sm:text-[10px] text-rose-400 font-bold">Conde Cilindro</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">💀</span>
            <span className="text-[9px] sm:text-[10px] text-orange-400 font-bold">Catrina</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* REDESIGNED VERTICAL CENTERED MENU (STREET FIGHTER II INSPIRED) */}
        {/* ============================================================== */}
        <div className="w-full max-w-xl flex flex-col space-y-2.5 sm:space-y-3 px-2">
          {MENU_OPTIONS.map((option, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={option.id}
                className="relative flex items-center w-full"
                onMouseEnter={() => {
                  if (selectedIndex !== idx) {
                    soundManager.playSelect();
                    setSelectedIndex(idx);
                  }
                }}
              >
                {/* Active Selection Cursor on the Left */}
                <div className="absolute -left-10 sm:-left-14 flex items-center justify-center w-10 sm:w-14 z-20 pointer-events-none">
                  {isSelected ? (
                    <LuchaMaskCursor />
                  ) : (
                    <div className="w-8 h-8 opacity-0"></div>
                  )}
                </div>

                {/* Retro Arcade Beveled Button */}
                <button
                  type="button"
                  onClick={() => handleSelectMode(option.id)}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 25px ${option.glowColor}, inset 0 2px 3px rgba(255,255,255,0.45), 0 6px 12px rgba(0,0,0,0.85)`
                      : '0 4px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
                  }}
                  className={`w-full relative group cursor-pointer transition-all duration-150 transform rounded-lg text-left overflow-hidden py-3 px-4 sm:px-5 flex items-center justify-between border-2 ${
                    isSelected
                      ? `bg-gradient-to-r ${option.activeGradient} ${option.activeBorder} scale-[1.02] border-t-amber-200 border-l-amber-200 border-b-neutral-950 border-r-neutral-950 translate-x-1`
                      : 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-[#141212] border-neutral-700 hover:border-neutral-500 border-b-black border-r-black opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Metallic Bevel Top Highlight Shimmer */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                  {/* Corner Rivet Details (Industrial Arcade Bezel) */}
                  <div className="absolute top-1 left-1.5 text-[8px] text-white/30 pointer-events-none">⬡</div>
                  <div className="absolute top-1 right-1.5 text-[8px] text-white/30 pointer-events-none">⬡</div>
                  <div className="absolute bottom-1 left-1.5 text-[8px] text-white/30 pointer-events-none">⬡</div>
                  <div className="absolute bottom-1 right-1.5 text-[8px] text-white/30 pointer-events-none">⬡</div>

                  {/* Left Column: Icon & Titles */}
                  <div className="flex items-center space-x-3 sm:space-x-4 z-10">
                    {/* Mode Emblem / Stamp */}
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center text-lg sm:text-xl border shadow-inner transition-colors ${
                        isSelected
                          ? 'bg-black/40 border-white/50 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <span>{option.icon}</span>
                    </div>

                    {/* Mode Title & Subtitle */}
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs sm:text-sm md:text-base font-black tracking-wider uppercase transition-colors ${
                            isSelected
                              ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                              : 'text-neutral-200'
                          }`}
                        >
                          {option.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-yellow-200 animate-pulse font-mono hidden sm:inline">
                            ◄ OK
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] font-sans font-semibold tracking-wide mt-0.5 transition-colors ${
                          isSelected ? option.accentText : 'text-neutral-400'
                        }`}
                      >
                        {option.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Arcade Tag & Key Indicator */}
                  <div className="flex items-center space-x-2 z-10 shrink-0 ml-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold tracking-wider uppercase border ${
                        isSelected
                          ? 'bg-black/50 text-amber-200 border-amber-300/60 shadow-sm'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {option.tag}
                    </span>
                    <span className="hidden md:inline-block px-1.5 py-0.5 bg-black/60 border border-neutral-600 rounded text-[9px] font-mono text-neutral-300">
                      [{option.numberKey}]
                    </span>
                  </div>

                  {/* Street Fighter II Style Flashing Pulse bar for active item */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-amber-200/10 to-transparent pointer-events-none animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Help / Move List Button */}
        <button
          onClick={onOpenControls}
          className="mt-5 px-4 py-2 bg-neutral-900/90 hover:bg-neutral-800 border-2 border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-white rounded-lg text-xs font-bold tracking-widest cursor-pointer transition shadow-lg flex items-center space-x-2"
        >
          <span>🎮</span>
          <span>GUÍA DE CONTROLES Y COMBOS</span>
          <span className="text-[10px] text-neutral-400 font-mono">[TAB]</span>
        </button>
      </div>

      {/* Footer Navigation Hints */}
      <div className="w-full text-center text-[9px] sm:text-[10px] font-mono z-20 pb-2">
        <p className="arcade-text-gold font-bold tracking-wider">
          [▲ / ▼ ó W / S] ELEGIR MODO · [ENTER / ESPACIO] SELECCIONAR · [ESC] PAUSA
        </p>
        <p className="mt-1 text-neutral-500 tracking-wide text-[8px] sm:text-[9px]">
          ESCENARIOS: BODEGA AURRERA (MAMÁ LUCHA) · MERCADO DE ABASTOS · PLAZA DÍA DE MUERTOS
        </p>
      </div>
    </div>
  );
};
