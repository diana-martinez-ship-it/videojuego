import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { CHARACTERS, getCharacterEmoji } from '../data/characters';
import { CharacterDef, GameMode } from '../types/game';

interface CharacterSelectProps {
  gameMode: GameMode;
  onConfirmSelection: (
    p1Char: CharacterDef,
    p2Char: CharacterDef,
    difficulty: 'facil' | 'normal' | 'bravo'
  ) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  gameMode,
  onConfirmSelection,
  onBack,
}) => {
  const [p1Index, setP1Index] = useState<number>(0); // Mamá Lucha by default!
  const [p2Index, setP2Index] = useState<number>(1); // Catrina by default
  const [difficulty, setDifficulty] = useState<'facil' | 'normal' | 'bravo'>('normal');

  const selectedChar1 = CHARACTERS[p1Index] || CHARACTERS[0];
  const selectedChar2 = CHARACTERS[p2Index] || CHARACTERS[1];

  const handleSelectP1 = (idx: number) => {
    setP1Index(idx);
    soundManager.playSelect();
    soundManager.announce(CHARACTERS[idx].name);
  };

  const handleSelectP2 = (idx: number) => {
    setP2Index(idx);
    soundManager.playSelect();
  };

  const handleStart = () => {
    soundManager.playCoin();
    onConfirmSelection(selectedChar1, selectedChar2, difficulty);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 md:p-5 bg-gradient-to-b from-[#18181b] via-[#27272a] to-[#09090b] select-none text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center z-10 border-b border-amber-500/30 pb-2">
        <button
          onClick={onBack}
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 rounded border border-neutral-600 cursor-pointer"
        >
          ← VOLVER AL MENÚ
        </button>

        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-black arcade-text-gold tracking-widest uppercase">
            SELECCIONA TU LUCHADOR ({CHARACTERS.length} GUERREROS)
          </h2>
          <p className="text-[9px] text-amber-200/80 font-mono">
            {gameMode === 'versus_p2'
              ? 'JUGADOR 1 Y JUGADOR 2: ELIJAN A SUS GUERREROS'
              : 'ELIGE TU CAMPEÓN PARA EL TORNEO NACIONAL'}
          </p>
        </div>

        {/* Difficulty Selector (if vs CPU or Arcade) */}
        {gameMode !== 'versus_p2' && (
          <div className="flex items-center space-x-1 bg-black/60 p-1 rounded border border-amber-500/40">
            <span className="text-[8px] text-neutral-400 font-bold mr-1">DIFICULTAD:</span>
            {(['facil', 'normal', 'bravo'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-2 py-0.5 text-[8px] font-extrabold rounded cursor-pointer uppercase transition ${
                  difficulty === diff
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {diff === 'facil' ? 'Fácil' : diff === 'normal' ? 'Normal' : 'Bravo 🔥'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Selection Area: 3 Columns (P1 Details, Roster Grid, P2/Opponent Details) */}
      <div className="grid grid-cols-12 gap-3 items-center my-auto z-10 max-h-[78vh]">
        {/* Left Column: Player 1 Card */}
        <div className="col-span-12 md:col-span-3 bg-black/80 border-2 border-red-500 rounded-lg p-3 shadow-xl">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded">
              1P (TÚ)
            </span>
            <span className="text-xs font-black text-amber-300 truncate">{selectedChar1.name}</span>
          </div>

          <p className="text-[9px] text-amber-400/90 italic mb-2 truncate">"{selectedChar1.alias}"</p>

          {/* Big Portrait Emoji & Theme Icon */}
          <div
            className="w-full h-24 rounded-md flex items-center justify-center text-5xl shadow-inner relative overflow-hidden mb-2 border border-white/20"
            style={{ backgroundColor: selectedChar1.themeColor }}
          >
            <span>{getCharacterEmoji(selectedChar1.id)}</span>
            <div className="absolute top-1 right-1 text-[8px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
              {selectedChar1.id === 'mama_lucha' ? 'AURRERA HERO' : 'LUCHADOR'}
            </div>
          </div>

          {/* Stats Readout */}
          <div className="space-y-1 text-[8px] font-mono mb-2">
            {[
              { label: 'VELOCIDAD', val: selectedChar1.stats.speed },
              { label: 'FUERZA', val: selectedChar1.stats.power },
              { label: 'ALCANCE', val: selectedChar1.stats.range },
              { label: 'DEFENSA', val: selectedChar1.stats.defense },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-neutral-400">{stat.label}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div
                      key={star}
                      className={`w-3 h-1.5 rounded-xs ${
                        star <= stat.val ? 'bg-amber-400' : 'bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Special Move Teaser */}
          <div className="bg-neutral-900 p-1.5 rounded border border-neutral-700">
            <div className="text-[7px] text-neutral-400 uppercase font-bold">Ataque Especial:</div>
            <div className="text-[9px] text-amber-300 font-bold truncate">
              {selectedChar1.moves.special.name}
            </div>
          </div>
        </div>

        {/* Center Column: Character Selection Grid (4 Columns) */}
        <div className="col-span-12 md:col-span-6 flex flex-col items-center">
          <p className="text-[9px] font-mono text-amber-400 mb-1.5 font-bold tracking-widest text-center">
            P1: HAZ CLICK PARA ELEGIR TU LUCHADOR
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 w-full max-h-[52vh] overflow-y-auto pr-1">
            {CHARACTERS.map((char, idx) => {
              const isP1 = p1Index === idx;
              const isP2 = p2Index === idx;

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectP1(idx)}
                  className={`relative p-1.5 rounded cursor-pointer transition transform hover:scale-105 border-2 shadow-md flex flex-col items-center justify-center ${
                    isP1
                      ? 'border-red-500 bg-red-950/70 ring-2 ring-amber-400'
                      : isP2
                      ? 'border-blue-500 bg-blue-950/70'
                      : 'border-neutral-700 bg-neutral-900/90 hover:border-amber-400'
                  }`}
                >
                  {/* Badges for 1P and 2P */}
                  <div className="absolute top-0.5 left-0.5 flex space-x-0.5">
                    {isP1 && (
                      <span className="bg-red-600 text-white text-[7px] font-black px-1 rounded">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="bg-blue-600 text-white text-[7px] font-black px-1 rounded">
                        2P
                      </span>
                    )}
                  </div>

                  <div className="text-2xl my-0.5">
                    {getCharacterEmoji(char.id)}
                  </div>

                  <div className="text-center text-[8px] font-black text-white truncate w-full">
                    {char.name}
                  </div>
                  <div className="text-center text-[6px] text-amber-300 font-mono truncate w-full">
                    {char.alias.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Combat CTA Button */}
          <button
            onClick={handleStart}
            className="mt-3 w-full max-w-sm py-2.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-black font-black text-xs rounded shadow-2xl transition transform hover:scale-105 cursor-pointer uppercase tracking-widest border-2 border-white animate-pulse"
          >
            ¡A PELEAR! [ENTRAR]
          </button>
        </div>

        {/* Right Column: Player 2 / CPU Card */}
        <div className="col-span-12 md:col-span-3 bg-black/80 border-2 border-blue-500 rounded-lg p-3 shadow-xl">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded">
              {gameMode === 'versus_p2' ? '2P' : 'RIVAL (CPU)'}
            </span>
            <span className="text-xs font-black text-amber-300 truncate">{selectedChar2.name}</span>
          </div>

          <p className="text-[9px] text-amber-400/90 italic mb-2 truncate">"{selectedChar2.alias}"</p>

          {/* Big Portrait Emoji */}
          <div
            className="w-full h-24 rounded-md flex items-center justify-center text-5xl shadow-inner relative overflow-hidden mb-2 border border-white/20"
            style={{ backgroundColor: selectedChar2.themeColor }}
          >
            <span>{getCharacterEmoji(selectedChar2.id)}</span>
          </div>

          {/* If 2P mode, allow selecting P2 directly with buttons */}
          {gameMode === 'versus_p2' ? (
            <div className="mb-2">
              <span className="text-[7px] text-blue-300 font-mono block mb-1">CAMBIAR JUGADOR 2:</span>
              <div className="grid grid-cols-4 gap-1 max-h-20 overflow-y-auto">
                {CHARACTERS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectP2(i)}
                    className={`py-0.5 text-xs rounded border cursor-pointer ${
                      p2Index === i
                        ? 'bg-blue-600 text-white border-white'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {getCharacterEmoji(c.id)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[8px] text-neutral-300 mb-2 leading-tight line-clamp-3">
              {selectedChar2.bio}
            </p>
          )}

          {/* Quote */}
          <div className="bg-neutral-900 p-1.5 rounded border border-neutral-700 italic text-[8px] text-amber-200 truncate">
            "{selectedChar2.quote}"
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center text-[9px] text-neutral-400 font-mono z-10">
        USA EL MOUSE O LAS FLECHAS PARA ELEGIR · PRESIONA [A PELEAR] O ENTER PARA CONTINUAR
      </div>
    </div>
  );
};
