import React from 'react';
import { CHARACTERS, getCharacterEmoji } from '../data/characters';
import { CharacterDef } from '../types/game';

interface MoveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChar?: CharacterDef;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({
  isOpen,
  onClose,
  currentChar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border-2 border-amber-400 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-amber-500/40 bg-neutral-950">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📖</span>
            <h3 className="text-sm md:text-base font-black arcade-text-gold tracking-wider uppercase">
              GUÍA DE CONTROLES Y COMBOS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-xs font-black rounded cursor-pointer transition"
          >
            ✕ CERRAR
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Controls Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 Controls */}
            <div className="bg-neutral-800/80 p-3 rounded-lg border border-red-500/40">
              <h4 className="text-red-400 font-black text-xs mb-2 uppercase flex items-center space-x-1">
                <span>🔴</span>
                <span>JUGADOR 1 (TECLADO)</span>
              </h4>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-neutral-400">Moverse / Agacharse:</span><span className="text-amber-300 font-bold">W, A, S, D</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Saltar:</span><span className="text-amber-300 font-bold">W / Flecha Arriba</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Cubrirse / Bloqueo:</span><span className="text-amber-300 font-bold">Mantener Atrás (A)</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Golpe Rápido:</span><span className="text-emerald-400 font-bold">J</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Patada Pesada:</span><span className="text-blue-400 font-bold">K</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Ataque Especial:</span><span className="text-purple-400 font-bold">L</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">¡SUPER FURIA! (100%):</span><span className="text-yellow-400 font-bold">U</span></div>
              </div>
            </div>

            {/* Player 2 Controls */}
            <div className="bg-neutral-800/80 p-3 rounded-lg border border-blue-500/40">
              <h4 className="text-blue-400 font-black text-xs mb-2 uppercase flex items-center space-x-1">
                <span>🔵</span>
                <span>JUGADOR 2 (TECLADO NUMÉRICO)</span>
              </h4>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-neutral-400">Moverse / Agacharse:</span><span className="text-amber-300 font-bold">Flechas de dirección</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Saltar:</span><span className="text-amber-300 font-bold">Flecha Arriba</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Cubrirse / Bloqueo:</span><span className="text-amber-300 font-bold">Mantener Atrás</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Golpe Rápido:</span><span className="text-emerald-400 font-bold">NumPad 4 / I</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Patada Pesada:</span><span className="text-blue-400 font-bold">NumPad 5 / O</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Ataque Especial:</span><span className="text-purple-400 font-bold">NumPad 6 / P</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">¡SUPER FURIA! (100%):</span><span className="text-yellow-400 font-bold">NumPad 1 / 8</span></div>
              </div>
            </div>
          </div>

          {/* Fighters Special Moves Breakdown */}
          <div>
            <h4 className="text-amber-400 font-black text-xs mb-3 uppercase tracking-wider">
              💥 MOVIMIENTOS ESPECIALES DE LOS LUCHADORES
            </h4>

            <div className="space-y-3">
              {CHARACTERS.map(char => {
                const isSelected = currentChar?.id === char.id;
                return (
                  <div
                    key={char.id}
                    className={`p-3 rounded-lg border ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30'
                        : 'border-neutral-800 bg-neutral-950/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-lg">
                        {getCharacterEmoji(char.id)}
                      </span>
                      <span className="text-xs font-black text-white">{char.name}</span>
                      <span className="text-[9px] text-amber-300">({char.alias})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-neutral-900 p-2 rounded">
                        <span className="text-purple-300 font-bold block mb-0.5">
                          ESPECIAL: {char.moves.special.name}
                        </span>
                        <p className="text-neutral-400 text-[9px]">{char.moves.special.description}</p>
                      </div>

                      <div className="bg-neutral-900 p-2 rounded border border-yellow-600/30">
                        <span className="text-yellow-300 font-bold block mb-0.5">
                          SUPER: {char.moves.super.name}
                        </span>
                        <p className="text-neutral-400 text-[9px]">{char.moves.super.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded uppercase cursor-pointer"
          >
            ¡ENTENDIDO, A LLEVARSE EL TROFEO!
          </button>
        </div>
      </div>
    </div>
  );
};
