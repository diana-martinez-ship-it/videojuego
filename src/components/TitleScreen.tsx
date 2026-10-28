import React from 'react';
import { GameMode } from '../types/game';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenControls: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenControls,
  onToggleMute,
  isMuted,
  crtEnabled,
  onToggleCrt,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#0c0a09] overflow-hidden select-none">
      {/* Background Mexican Papel Picado Row */}
      <div className="absolute top-0 inset-x-0 flex justify-around opacity-90 pointer-events-none">
        {['#ec4899', '#ea580c', '#16a34a', '#facc15', '#06b6d4', '#e11d48', '#8b5cf6'].map((col, idx) => (
          <div
            key={idx}
            className="w-16 h-12 rounded-b-md shadow-md transform -skew-x-3"
            style={{ backgroundColor: col }}
          >
            <div className="w-6 h-6 mx-auto mt-3 bg-neutral-900/40 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Floating Cempasúchil petals overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-2 rounded-full bg-amber-500 opacity-70 animate-pulse"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 23) % 95}%`,
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Top Bar: Controls & Sound Toggle */}
      <div className="w-full flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-700/80 border border-emerald-400 text-white text-[10px] rounded font-bold">
            MAMÁ LUCHA EDITION
          </span>
          <span className="px-3 py-1 bg-amber-700/80 border border-amber-400 text-white text-[10px] rounded font-bold">
            DÍA DE MUERTOS
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleCrt}
            className={`px-3 py-1 text-[10px] font-bold rounded border transition cursor-pointer ${
              crtEnabled
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-neutral-800 text-neutral-300 border-neutral-600'
            }`}
          >
            FILTRO CRT: {crtEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={onToggleMute}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-[10px] font-bold text-neutral-200 rounded cursor-pointer transition"
          >
            {isMuted ? '🔇 SILENCIO' : '🔊 MÚSICA ON'}
          </button>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-10 max-w-3xl">
        <div className="inline-block px-4 py-1 mb-2 bg-red-600 text-white text-xs font-black tracking-widest uppercase rounded shadow border-2 border-amber-300 transform -rotate-1">
          ¡CAMPEONATO DE BARRIO!
        </div>

        <h1 className="text-4xl md:text-6xl font-black arcade-text-gold tracking-tight leading-tight uppercase mb-2">
          LUCHA CALLEJERA
        </h1>

        <p className="text-sm md:text-lg text-amber-200 font-bold tracking-widest cempasuchil-glow mb-6">
          TORNEO NACIONAL DEL GOLPE Y LA OFRENDA
        </p>

        {/* Featured Champions Mini Banner */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 bg-black/60 px-4 py-2.5 rounded-xl border border-amber-500/40 backdrop-blur-sm max-w-2xl">
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">🦸‍♀️</span>
            <span className="text-[10px] text-green-400 font-bold">Mamá Lucha</span>
          </div>
          <span className="text-neutral-500">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">🗡️</span>
            <span className="text-[10px] text-red-400 font-bold">Zorro Negro</span>
          </div>
          <span className="text-neutral-500">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">🏄‍♀️</span>
            <span className="text-[10px] text-purple-400 font-bold">Dafne</span>
          </div>
          <span className="text-neutral-500">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">🐱</span>
            <span className="text-[10px] text-emerald-400 font-bold">Gato Sombra</span>
          </div>
          <span className="text-neutral-500">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">🧛</span>
            <span className="text-[10px] text-rose-400 font-bold">Conde Cilindro</span>
          </div>
          <span className="text-neutral-500">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl">💀</span>
            <span className="text-[10px] text-orange-400 font-bold">Catrina</span>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          <button
            onClick={() => onStartGame('arcade')}
            className="group px-6 py-3.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs md:text-sm font-black rounded border-2 border-amber-300 shadow-xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>🥊</span>
            <span>MODO ARCADE (HISTORIA)</span>
          </button>

          <button
            onClick={() => onStartGame('versus_cpu')}
            className="group px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs md:text-sm font-black rounded border-2 border-amber-500 shadow-xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>🤖</span>
            <span>1P VS COMPUTADORA</span>
          </button>

          <button
            onClick={() => onStartGame('versus_p2')}
            className="group px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-300 text-xs md:text-sm font-black rounded border-2 border-emerald-500 shadow-xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>👥</span>
            <span>1P VS 2P (LOCAL MISMO TECLADO)</span>
          </button>

          <button
            onClick={() => onStartGame('training')}
            className="group px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 text-xs md:text-sm font-black rounded border-2 border-cyan-500 shadow-xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>🥋</span>
            <span>MODO ENTRENAMIENTO</span>
          </button>
        </div>

        {/* Help button */}
        <button
          onClick={onOpenControls}
          className="mt-4 text-xs text-amber-300 hover:text-white underline cursor-pointer font-bold tracking-wider"
        >
          🎮 GUÍA DE CONTROLES Y COMBOS
        </button>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center text-[10px] text-neutral-400 font-mono z-20">
        <p className="arcade-text-gold font-bold">
          [ESPACIO / ENTER] PARA INICIAR · ESC PARA PAUSA
        </p>
        <p className="mt-1 text-neutral-500">
          ESCENARIOS: BODEGA AURRERA · MERCADO DE ABASTOS · PLAZA DÍA DE MUERTOS
        </p>
      </div>
    </div>
  );
};
