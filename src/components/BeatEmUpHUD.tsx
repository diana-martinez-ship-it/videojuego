import React from 'react';
import { BeatEmUpEngine } from '../game/beatemup';
import { getCharacterEmoji } from '../data/characters';

interface BeatEmUpHUDProps {
  engine?: BeatEmUpEngine;
  player?: any;
  activeEnemy?: any;
  currentWave?: number;
  totalWaves?: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onOpenControls?: () => void;
  onRetry?: () => void;
  onExit?: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const BeatEmUpHUD: React.FC<BeatEmUpHUDProps> = ({
  engine,
  player: propPlayer,
  activeEnemy: propEnemy,
  currentWave = 1,
  totalWaves = 3,
  onRetry,
  onExit,
  onToggleMute,
  isMuted,
}) => {
  // Support both BeatEmUpEngine and legacy direct player prop
  const p = engine?.player || propPlayer || {
    charDef: { id: 'gato_sombra', name: 'Gato Sombra', themeColor: '#991b1b' },
    health: 100,
    maxHealth: 100,
    superMeter: 0,
    score: 0,
  };
  const aliveEnemies = engine ? engine.enemies.filter(e => e.health > 0) : (propEnemy ? [propEnemy] : []);
  const boss = engine ? engine.enemies.find(e => e.type === 'boss' && e.health > 0) : (propEnemy?.isBoss ? propEnemy : null);
  const sector = engine ? engine.currentSector : currentWave;
  const isWaveCleared = engine ? engine.waveCleared : aliveEnemies.length === 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20">
      
      {/* Top HUD: Player Status & Score */}
      <div className="flex justify-between items-start w-full">
        
        {/* Left: Player Info Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-black/75 p-2 rounded-xl border border-amber-500/50 shadow-2xl backdrop-blur-sm pointer-events-auto">
          {/* Avatar Icon */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-2xl sm:text-3xl border-2 border-white/30 shadow-inner"
            style={{ backgroundColor: p.charDef.themeColor }}
          >
            <span>{getCharacterEmoji(p.charDef.id)}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wider uppercase drop-shadow">
                {p.charDef.name}
              </span>
              <span className="text-[9px] text-amber-300 font-mono">1P</span>
            </div>

            {/* Health Bar */}
            <div className="w-40 sm:w-56 h-3.5 bg-neutral-900 rounded border border-neutral-700 p-0.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-xs transition-all duration-100 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${Math.max(0, (p.health / p.maxHealth) * 100)}%` }}
              />
            </div>

            {/* Super Energy Meter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[8px] font-mono text-cyan-300 font-bold">SUPER:</span>
              <div className="w-32 sm:w-44 h-2 bg-neutral-900 rounded border border-neutral-700 p-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 rounded-xs transition-all duration-100 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  style={{ width: `${Math.max(0, p.superMeter)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Stage & Score Readout */}
        <div className="flex flex-col items-center bg-black/75 px-4 py-2 rounded-xl border border-amber-500/40 shadow-xl backdrop-blur-sm">
          <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono tracking-widest font-bold">
            CALLEJÓN DEL GOLPE · SECTOR {sector}/3
          </span>
          <span className="text-sm sm:text-lg font-black arcade-text-gold tracking-widest mt-0.5">
            PUNTOS: {(p.score || 0).toLocaleString()}
          </span>
          <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">
            {isWaveCleared ? '¡SECTOR DESPEJADO!' : `ENEMIGOS: ${aliveEnemies.length}`}
          </span>
        </div>

        {/* Right: Sound & Exit Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="px-2.5 py-1 bg-black/80 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-300 rounded cursor-pointer transition shadow"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onExit}
            className="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500 text-[10px] font-bold text-red-200 rounded cursor-pointer transition shadow"
          >
            SALIR [ESC]
          </button>
        </div>
      </div>

      {/* Bottom Boss Bar (when Boss is active) */}
      {boss && (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center bg-black/85 p-2.5 rounded-xl border-2 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.7)] backdrop-blur-sm animate-pulse mb-8">
          <span className="text-xs sm:text-sm font-black text-red-400 tracking-widest uppercase mb-1">
            {boss.name}
          </span>
          <div className="w-full h-4 bg-neutral-900 rounded border border-neutral-700 p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400 rounded-xs transition-all duration-75 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
              style={{ width: `${Math.max(0, (boss.health / boss.maxHealth) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Controls Legend */}
      <div className="w-full text-center text-[8px] sm:text-[9px] font-mono text-neutral-400 bg-black/70 py-1.5 px-3 rounded-lg border border-neutral-800 max-w-2xl mx-auto shadow-md">
        <span className="text-amber-300 font-bold">[WASD / FLECHAS]</span> MOVERSE EN 8D ·{' '}
        <span className="text-amber-300 font-bold">[J]</span> GOLPE ·{' '}
        <span className="text-amber-300 font-bold">[K]</span> PATADA ·{' '}
        <span className="text-amber-300 font-bold">[ESPACIO]</span> SALTAR ·{' '}
        <span className="text-amber-300 font-bold">[L]</span> ESPECIAL ·{' '}
        <span className="text-amber-300 font-bold">[FRENTE+J]</span> AGARRE
      </div>

      {/* Victory Modal Overlay */}
      {engine?.victory && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto z-40 p-4">
          <div className="bg-gradient-to-b from-[#211714] to-[#0a0706] border-4 border-amber-400 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.8)]">
            <span className="text-4xl sm:text-5xl block mb-2">🏆</span>
            <h2 className="text-2xl sm:text-3xl font-black arcade-text-gold tracking-wider uppercase mb-1">
              ¡VICTORIA CALLEJERA!
            </h2>
            <p className="text-xs sm:text-sm text-amber-200 font-bold mb-4">
              ¡HAS DERROTADO A EL GRAN BRONCO Y LIBERADO EL BARRIO!
            </p>
            <div className="bg-black/60 p-3 rounded-xl border border-amber-500/40 mb-6 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">PUNTAJE FINAL:</span>
                <span className="text-amber-300 font-black">{(p.score || 0).toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">LUCHADOR:</span>
                <span className="text-white font-bold">{p.charDef.name}</span>
              </div>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={onRetry}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition uppercase"
              >
                JUGAR DE NUEVO
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-black text-xs rounded-xl border border-neutral-600 shadow-lg cursor-pointer transition uppercase"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {engine?.gameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto z-40 p-4">
          <div className="bg-gradient-to-b from-[#211714] to-[#0a0706] border-4 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.8)]">
            <span className="text-4xl sm:text-5xl block mb-2">💀</span>
            <h2 className="text-2xl sm:text-3xl font-black arcade-text-red tracking-wider uppercase mb-1">
              ¡HAS SIDO DERROTADO!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mb-4">
              La calle es brava y el campeonato no perdona.
            </p>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={onRetry}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition uppercase"
              >
                REINTENTAR [ENTER]
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-black text-xs rounded-xl border border-neutral-600 shadow-lg cursor-pointer transition uppercase"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
