import React from 'react';
import { getCharacterEmoji } from '../data/characters';
import { FighterState } from '../types/game';

interface ArcadeHUDProps {
  p1: FighterState;
  p2: FighterState;
  roundTimer: number;
  currentRound: number;
  p1Score: number;
  p2Score: number;
  comboNotification: { text: string; timer: number } | null;
  roundAnnounceText: string | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenMoveList: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  p1,
  p2,
  roundTimer,
  currentRound: _currentRound,
  p1Score,
  p2Score,
  comboNotification,
  roundAnnounceText,
  isPaused,
  onTogglePause,
  onOpenMoveList,
  onToggleMute,
  isMuted,
}) => {
  const p1HealthPercent = Math.max(0, (p1.health / p1.maxHealth) * 100);
  const p2HealthPercent = Math.max(0, (p2.health / p2.maxHealth) * 100);

  const p1SuperPercent = Math.min(100, p1.superMeter);
  const p2SuperPercent = Math.min(100, p2.superMeter);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Header: 1P Score, KO 99, 2P Score */}
      <div>
        <div className="flex justify-between items-center text-xs tracking-wider mb-1 font-mono font-bold">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 font-extrabold arcade-text-red">1P</span>
            <span className="text-amber-300 font-mono text-sm tracking-widest">
              {p1Score.toString().padStart(7, '0')}
            </span>
          </div>

          <div className="text-center">
            <span className="text-amber-400 font-extrabold text-[10px] tracking-widest uppercase">
              TORNEO MEXICANO
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-amber-300 font-mono text-sm tracking-widest">
              {p2Score > 0 ? p2Score.toString().padStart(7, '0') : 'INSERT COIN'}
            </span>
            <span className="text-blue-400 font-extrabold arcade-text-blue">2P</span>
          </div>
        </div>

        {/* Health Bars Row */}
        <div className="grid grid-cols-12 items-center gap-1">
          {/* P1 Portrait + Health Bar (Columns 1 to 5) */}
          <div className="col-span-5 flex items-center space-x-2">
            {/* P1 Portrait Frame */}
            <div className="w-12 h-12 bg-neutral-900 border-2 border-amber-400 rounded-sm overflow-hidden shrink-0 shadow-lg flex items-center justify-center relative">
              <span className="text-2xl">
                {getCharacterEmoji(p1.charDef.id)}
              </span>
              <div className="absolute bottom-0 inset-x-0 bg-red-800 text-[6px] text-white text-center font-bold py-0.5 truncate px-0.5">
                {p1.charDef.name.slice(0, 8)}
              </div>
            </div>

            {/* P1 Health Bar Frame */}
            <div className="flex-1">
              <div className="flex justify-between items-center text-[10px] text-amber-300 font-bold mb-0.5 uppercase">
                <span>{p1.charDef.name}</span>
                {/* Win Markers (Skulls) */}
                <div className="flex space-x-1">
                  {[0, 1].map(idx => (
                    <span
                      key={idx}
                      className={`text-[11px] ${
                        idx < p1.roundsWon ? 'text-amber-400 animate-pulse' : 'text-neutral-700'
                      }`}
                    >
                      💀
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar container: yellow bar shrinking from right to left */}
              <div className="h-6 bg-red-950 border-2 border-white rounded-none p-0.5 relative shadow-inner overflow-hidden">
                {/* Red damage ghost underneath */}
                <div className="absolute inset-y-0.5 right-0.5 left-0.5 bg-red-700"></div>
                {/* Main Yellow Health Bar */}
                <div
                  className="h-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 transition-all duration-75 relative z-10"
                  style={{ width: `${p1HealthPercent}%` }}
                >
                  <div className="h-1 bg-white/40 w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: KO & Timer (Columns 6 to 7) */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <span className="arcade-text-red font-black text-xs tracking-widest leading-none">
              KO
            </span>
            <div className="bg-neutral-900 border-2 border-amber-400 px-3 py-1 rounded shadow-md mt-0.5">
              <span className="text-amber-400 font-black text-2xl tracking-wider font-mono">
                {roundTimer < 10 ? `0${roundTimer}` : roundTimer}
              </span>
            </div>
          </div>

          {/* P2 Health Bar + Portrait (Columns 8 to 12) */}
          <div className="col-span-5 flex items-center space-x-2 flex-row-reverse space-x-reverse">
            {/* P2 Portrait Frame */}
            <div className="w-12 h-12 bg-neutral-900 border-2 border-amber-400 rounded-sm overflow-hidden shrink-0 shadow-lg flex items-center justify-center relative">
              <span className="text-2xl">
                {getCharacterEmoji(p2.charDef.id)}
              </span>
              <div className="absolute bottom-0 inset-x-0 bg-blue-900 text-[6px] text-white text-center font-bold py-0.5 truncate px-0.5">
                {p2.charDef.name.slice(0, 8)}
              </div>
            </div>

            {/* P2 Health Bar Frame */}
            <div className="flex-1">
              <div className="flex justify-between items-center text-[10px] text-amber-300 font-bold mb-0.5 uppercase flex-row-reverse">
                <span>{p2.charDef.name}</span>
                {/* Win Markers */}
                <div className="flex space-x-1">
                  {[0, 1].map(idx => (
                    <span
                      key={idx}
                      className={`text-[11px] ${
                        idx < p2.roundsWon ? 'text-amber-400 animate-pulse' : 'text-neutral-700'
                      }`}
                    >
                      💀
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar container: yellow bar shrinking from left to right */}
              <div className="h-6 bg-red-950 border-2 border-white rounded-none p-0.5 relative shadow-inner overflow-hidden flex justify-end">
                <div className="absolute inset-y-0.5 right-0.5 left-0.5 bg-red-700"></div>
                <div
                  className="h-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 transition-all duration-75 relative z-10"
                  style={{ width: `${p2HealthPercent}%` }}
                >
                  <div className="h-1 bg-white/40 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Screen Round Announcements / KO / Combo Alerts */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none">
        {roundAnnounceText && (
          <div className="bg-black/85 border-4 border-amber-400 px-6 py-3 rounded-lg shadow-2xl animate-bounce text-center">
            <h1 className="text-3xl md:text-5xl font-black arcade-text-gold tracking-widest">
              {roundAnnounceText}
            </h1>
          </div>
        )}

        {comboNotification && comboNotification.timer > 0 && (
          <div className="mt-2 bg-gradient-to-r from-red-600 to-amber-500 px-4 py-1.5 border-2 border-white rounded-full shadow-lg transform scale-110 animate-pulse">
            <span className="text-white font-extrabold text-sm md:text-base tracking-wider drop-shadow">
              {comboNotification.text}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Super Meters & Quick Control Buttons */}
      <div className="flex justify-between items-end">
        {/* P1 Super Meter */}
        <div className="w-56">
          <div className="flex justify-between text-[9px] font-bold text-amber-300 mb-0.5">
            <span className={p1SuperPercent >= 100 ? 'text-yellow-300 animate-pulse font-extrabold' : ''}>
              {p1SuperPercent >= 100 ? '¡FURIA MAX! (U / Num1)' : 'MEDIDOR DE FURIA'}
            </span>
            <span>{Math.round(p1SuperPercent)}%</span>
          </div>
          <div className="h-4 bg-neutral-900 border-2 border-amber-400 p-0.5 rounded-sm overflow-hidden shadow">
            <div
              className={`h-full transition-all duration-100 ${
                p1SuperPercent >= 100
                  ? 'bg-gradient-to-r from-amber-400 via-red-500 to-yellow-300 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${p1SuperPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Toolbar (Pause, Move List, Mute) */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-black/70 backdrop-blur-xs p-1.5 rounded-md border border-amber-400/50">
          <button
            onClick={onOpenMoveList}
            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-[9px] text-white font-bold rounded cursor-pointer transition shadow"
            title="Ver Movimientos"
          >
            📖 MOVIMIENTOS
          </button>
          <button
            onClick={onTogglePause}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-[9px] text-white font-bold rounded cursor-pointer transition shadow"
          >
            {isPaused ? '▶ CONTINUAR' : '⏸ PAUSA'}
          </button>
          <button
            onClick={onToggleMute}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-[10px] text-white rounded cursor-pointer transition"
            title="Mute / Unmute"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* P2 Super Meter */}
        <div className="w-56 text-right">
          <div className="flex justify-between text-[9px] font-bold text-amber-300 mb-0.5 flex-row-reverse">
            <span className={p2SuperPercent >= 100 ? 'text-yellow-300 animate-pulse font-extrabold' : ''}>
              {p2SuperPercent >= 100 ? '¡FURIA MAX!' : 'MEDIDOR DE FURIA'}
            </span>
            <span>{Math.round(p2SuperPercent)}%</span>
          </div>
          <div className="h-4 bg-neutral-900 border-2 border-amber-400 p-0.5 rounded-sm overflow-hidden shadow flex justify-end">
            <div
              className={`h-full transition-all duration-100 ${
                p2SuperPercent >= 100
                  ? 'bg-gradient-to-l from-amber-400 via-red-500 to-yellow-300 animate-pulse'
                  : 'bg-gradient-to-l from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${p2SuperPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
