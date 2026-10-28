import React from 'react';
import { getCharacterEmoji } from '../data/characters';
import { CharacterDef, GameMode } from '../types/game';

interface VictoryModalProps {
  winner: CharacterDef;
  loser: CharacterDef;
  p1Won: boolean;
  gameMode: GameMode;
  arcadeStageIndex: number;
  totalArcadeStages: number;
  onNextStage: () => void;
  onRematch: () => void;
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
  onBackToMenu,
}) => {
  const isArcade = gameMode === 'arcade';
  const hasMoreStages = isArcade && p1Won && arcadeStageIndex < totalArcadeStages - 1;
  const isGrandChampion = isArcade && p1Won && arcadeStageIndex >= totalArcadeStages - 1;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-4 border-amber-400 rounded-2xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl text-white relative overflow-hidden">
        {/* Mexican Confetti / Petal Flair */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-500/20 rounded-full blur-xl pointer-events-none"></div>

        {/* Top Victory Header */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-300">
            {isGrandChampion ? '¡CAMPEÓN SUPREMO DE MÉXICO!' : '¡FINAL DEL COMBATE!'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black arcade-text-gold tracking-tight mt-2 uppercase">
            {p1Won ? '¡VICTORIA!' : '¡DERROTA!'}
          </h2>
          <p className="text-xs text-amber-300 font-bold mt-1">
            {winner.name.toUpperCase()} HA GANADO EL ENCUENTRO
          </p>
        </div>

        {/* Winner Big Icon / Portrait */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div
            className="w-24 h-24 rounded-full border-4 border-amber-400 flex items-center justify-center text-5xl shadow-xl animate-bounce"
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

        {/* Actions Button Row */}
        <div className="mt-6 flex flex-col space-y-2.5">
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
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-lg shadow-md uppercase tracking-wider cursor-pointer transition"
          >
            🔄 REVANCHA / VOLVER A PELEAR
          </button>

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
