import React, { useState, useEffect } from 'react';
import { getCharacterEmoji } from '../data/characters';
import { CharacterDef, GameMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  winner: CharacterDef;
  loser: CharacterDef;
  p1Won: boolean;
  gameMode: GameMode;
  arcadeStageIndex: number;
  totalArcadeStages: number;
  onNextStage: () => void;
  onRematch: () => void;
  onChangeFighter?: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  loser: _loser,
  p1Won,
  gameMode,
  arcadeStageIndex,
  totalArcadeStages,
  onNextStage,
  onRematch,
  onChangeFighter,
  onBackToMenu,
}) => {
  const isArcade = gameMode === 'arcade';
  const hasMoreStages = isArcade && p1Won && arcadeStageIndex < totalArcadeStages - 1;
  const isGrandChampion = isArcade && p1Won && arcadeStageIndex >= totalArcadeStages - 1;

  // Classic Arcade Countdown (9 to 0) when losing in arcade mode
  const [continueTimer, setContinueTimer] = useState<number>(9);

  useEffect(() => {
    if (!p1Won && isArcade && continueTimer > 0) {
      const timer = setTimeout(() => {
        setContinueTimer(prev => {
          if (prev > 1) {
            soundManager.playSelect();
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [p1Won, isArcade, continueTimer]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-4 border-amber-400 rounded-2xl p-6 md:p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white relative overflow-hidden">
        
        {/* Mexican Confetti / Petal Flair */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-500/20 rounded-full blur-xl pointer-events-none"></div>

        {/* Top Victory Header */}
        <div className="mb-4">
          <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase tracking-widest border ${
            p1Won
              ? 'bg-emerald-700 border-emerald-400'
              : 'bg-red-700 border-red-400'
          }`}>
            {isGrandChampion
              ? '¡CAMPEÓN SUPREMO DE MÉXICO!'
              : p1Won
              ? '¡FINAL DEL COMBATE!'
              : '¡COMBATE PERDIDO!'}
          </span>

          <h2 className={`text-3xl md:text-5xl font-black tracking-tight mt-2 uppercase ${
            p1Won ? 'arcade-text-gold' : 'arcade-text-red'
          }`}>
            {p1Won ? '¡VICTORIA!' : '¡DERROTA!'}
          </h2>

          <p className="text-xs text-amber-300 font-bold mt-1">
            {winner.name.toUpperCase()} HA GANADO EL ENCUENTRO
          </p>
        </div>

        {/* Winner Big Icon / Portrait */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-xl ${
              p1Won ? 'border-amber-400 animate-bounce' : 'border-red-500'
            }`}
            style={{ backgroundColor: winner.themeColor }}
          >
            <span>{getCharacterEmoji(winner.id)}</span>
          </div>

          {/* Authentic Mexican Win Quote */}
          <div className="mt-4 p-3 bg-neutral-900 border border-amber-500/40 rounded-xl max-w-sm">
            <p className="text-xs text-amber-200 italic font-mono">
              "{winner.quote}"
            </p>
          </div>
        </div>

        {/* Arcade Continue Countdown for Defeat in Arcade */}
        {!p1Won && isArcade && (
          <div className="my-3 p-3 bg-red-950/80 border-2 border-red-500 rounded-xl flex items-center justify-between shadow-inner">
            <div className="text-left">
              <span className="text-[10px] font-black text-amber-300 block uppercase tracking-wider">
                ¿DESEAS CONTINUAR?
              </span>
              <span className="text-[9px] text-neutral-300 font-mono">
                Reintenta contra el mismo rival o elige otro
              </span>
            </div>
            <div className="w-12 h-12 bg-black border-2 border-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-black text-red-500 animate-pulse font-mono">
                {continueTimer}
              </span>
            </div>
          </div>
        )}

        {/* Actions Button Row */}
        <div className="mt-5 flex flex-col space-y-2.5">
          {hasMoreStages && (
            <button
              onClick={onNextStage}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-yellow-400 hover:from-emerald-500 hover:to-yellow-300 text-black font-black text-sm rounded-lg shadow-xl uppercase tracking-widest cursor-pointer transition transform hover:scale-105 border-2 border-white animate-pulse"
            >
              ➔ SIGUIENTE NIVEL ({arcadeStageIndex + 2}/{totalArcadeStages})
            </button>
          )}

          <button
            onClick={onRematch}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-lg shadow-md uppercase tracking-wider cursor-pointer transition flex items-center justify-center space-x-2"
          >
            <span>🔄</span>
            <span>{isArcade && !p1Won ? 'CONTINUAR / REINTENTAR PELEA' : 'REVANCHA / VOLVER A PELEAR'}</span>
          </button>

          {onChangeFighter && (
            <button
              onClick={onChangeFighter}
              className="w-full py-2.5 bg-blue-900/90 hover:bg-blue-800 text-white font-black text-xs rounded-lg shadow-md uppercase tracking-wider cursor-pointer transition border border-blue-500 flex items-center justify-center space-x-2"
            >
              <span>👥</span>
              <span>{isArcade ? 'ELEGIR OTRO RIVAL O LUCHADOR' : 'CAMBIAR DE PERSONAJE'}</span>
            </button>
          )}

          <button
            onClick={onBackToMenu}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-lg uppercase cursor-pointer transition border border-neutral-700"
          >
            🏠 VOLVER AL MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
