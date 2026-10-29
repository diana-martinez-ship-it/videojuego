import React, { useState, useEffect, useCallback } from 'react';
import { soundManager } from '../audio/soundManager';
import { CHARACTERS, getCharacterEmoji } from '../data/characters';
import { CharacterDef, GameMode } from '../types/game';

interface CharacterSelectProps {
  gameMode: GameMode;
  onConfirmSelection: (
    p1Char: CharacterDef,
    p2Char: CharacterDef,
    difficulty: 'facil' | 'normal' | 'bravo',
    isRandomRival?: boolean
  ) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  gameMode,
  onConfirmSelection,
  onBack,
}) => {
  // Two-step selection state: Step 1 (Player 1) -> Step 2 (Rival / Player 2 / CPU)
  const [selectionStep, setSelectionStep] = useState<'step1_p1' | 'step2_rival'>('step1_p1');
  const [p1Index, setP1Index] = useState<number>(0);
  const [p2Index, setP2Index] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<'facil' | 'normal' | 'bravo'>('normal');

  const selectedChar1 = CHARACTERS[p1Index] || CHARACTERS[0];
  const selectedChar2 = CHARACTERS[p2Index] || CHARACTERS[1];

  // Character selection click / arrow navigate
  const handleSelectChar = useCallback((idx: number) => {
    soundManager.playSelect();
    if (selectionStep === 'step1_p1') {
      setP1Index(idx);
      soundManager.announce(CHARACTERS[idx].name);
    } else {
      setP2Index(idx);
      soundManager.announce(CHARACTERS[idx].name);
    }
  }, [selectionStep]);

  // Confirm Step 1 or Final Match Start
  const handleAdvanceStep = useCallback(() => {
    if (selectionStep === 'step1_p1') {
      if (gameMode === 'beatemup') {
        // Beat Em Up only needs 1 character
        soundManager.playCoin();
        onConfirmSelection(selectedChar1, selectedChar2, difficulty, false);
      } else {
        // Advance to Step 2: Rival selection
        soundManager.playCoin();
        setSelectionStep('step2_rival');
        // If P2 index is same as P1, advance P2 index by 1
        if (p1Index === p2Index) {
          setP2Index((p1Index + 1) % CHARACTERS.length);
        }
        if (gameMode === 'arcade') {
          soundManager.announce('¡ELIGE A TU PRIMER RIVAL!');
        } else if (gameMode === 'versus_p2') {
          soundManager.announce('¡JUGADOR DOS, ELIGE!');
        } else {
          soundManager.announce('¡ELIGE AL OPONENTE CPU!');
        }
      }
    } else {
      // Step 2 confirmed: Start match!
      soundManager.playCoin();
      onConfirmSelection(selectedChar1, selectedChar2, difficulty, false);
    }
  }, [selectionStep, gameMode, selectedChar1, selectedChar2, difficulty, p1Index, p2Index, onConfirmSelection]);

  // Random Rival selection (Arcade / vs CPU)
  const handleRandomRival = useCallback(() => {
    soundManager.playCoin();
    // Pick random index different from P1
    const available = CHARACTERS.map((_, i) => i).filter(i => i !== p1Index);
    const randomIdx = available[Math.floor(Math.random() * available.length)] ?? 1;
    const randomChar = CHARACTERS[randomIdx];
    setP2Index(randomIdx);
    soundManager.announce(`¡RIVAL ALEATORIO: ${randomChar.name}!`);
    setTimeout(() => {
      onConfirmSelection(selectedChar1, randomChar, difficulty, true);
    }, 400);
  }, [p1Index, selectedChar1, difficulty, onConfirmSelection]);

  // Back button handling
  const handleBackStep = useCallback(() => {
    if (selectionStep === 'step2_rival') {
      soundManager.playSelect();
      setSelectionStep('step1_p1');
    } else {
      onBack();
    }
  }, [selectionStep, onBack]);

  // Keyboard navigation for arcade feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cols = 4;
      const total = CHARACTERS.length;
      const currentIdx = selectionStep === 'step1_p1' ? p1Index : p2Index;

      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        const next = (currentIdx + 1) % total;
        handleSelectChar(next);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        const prev = (currentIdx - 1 + total) % total;
        handleSelectChar(prev);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        const down = (currentIdx + cols) % total;
        handleSelectChar(down);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        const up = (currentIdx - cols + total) % total;
        handleSelectChar(up);
      } else if (e.code === 'KeyR' && (gameMode === 'arcade' || gameMode === 'versus_cpu')) {
        // Quick Random Rival shortcut
        e.preventDefault();
        handleRandomRival();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleAdvanceStep();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleBackStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionStep, p1Index, p2Index, gameMode, handleSelectChar, handleAdvanceStep, handleRandomRival, handleBackStep]);

  const getStepSubtitle = () => {
    if (selectionStep === 'step1_p1') {
      return gameMode === 'beatemup'
        ? 'PASO 1 DE 1: ELIGE A TU GUERRERO CALLEJERO'
        : 'PASO 1 DE 2: JUGADOR 1 (TÚ) — ELIGE A TU CAMPEÓN';
    } else {
      if (gameMode === 'arcade') {
        return 'PASO 2 DE 2: ELIGE A TU PRIMER RIVAL O SELECCIONA RIVAL ALEATORIO';
      }
      if (gameMode === 'versus_p2') {
        return 'PASO 2 DE 2: JUGADOR 2 (2P) — ELIGE A TU GUERRERO';
      }
      return 'PASO 2 DE 2: ELIGE AL OPONENTE CONTROLADO POR LA COMPUTADORA (CPU)';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 md:p-5 bg-gradient-to-b from-[#140e0c] via-[#211714] to-[#090706] select-none text-white overflow-hidden">
      
      {/* Background Arena Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ef4444 1px, #0c0a09 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* Papel Picado Garland */}
      <div className="absolute top-0 inset-x-0 flex justify-around opacity-90 pointer-events-none z-10 overflow-hidden">
        {['#ec4899', '#ea580c', '#16a34a', '#facc15', '#06b6d4', '#e11d48', '#8b5cf6'].map((col, idx) => (
          <div
            key={idx}
            className="w-12 sm:w-16 h-8 sm:h-10 shadow-md transform -skew-x-3"
            style={{ backgroundColor: col }}
          >
            <div className="w-5 h-5 mx-auto mt-2 bg-neutral-900/40 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-wrap justify-between items-center z-20 border-b border-amber-500/40 pb-2 pt-3 sm:pt-4">
        <button
          onClick={handleBackStep}
          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 hover:border-amber-400 text-amber-300 hover:text-white text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition shadow-md flex items-center space-x-1"
        >
          <span>◀</span>
          <span>{selectionStep === 'step2_rival' ? 'CAMBIAR 1P [ESC]' : 'MENÚ PRINCIPAL [ESC]'}</span>
        </button>

        <div className="text-center my-1">
          <h2 className="text-sm sm:text-xl md:text-2xl font-black arcade-text-gold tracking-wider uppercase">
            SELECCIÓN DE LUCHADORES ({CHARACTERS.length} GUERREROS)
          </h2>
          <div className="inline-block mt-0.5 px-3 py-0.5 bg-black/75 border border-amber-400/60 rounded-full text-[9px] sm:text-[10px] text-amber-300 font-mono tracking-wider animate-pulse">
            {getStepSubtitle()}
          </div>
        </div>

        {/* Difficulty Selector */}
        {gameMode !== 'versus_p2' && (
          <div className="flex items-center space-x-1 bg-black/70 px-2 py-1 rounded-lg border border-amber-500/50 shadow-md">
            <span className="text-[8px] sm:text-[9px] text-neutral-400 font-bold mr-1">DIFICULTAD:</span>
            {(['facil', 'normal', 'bravo'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-black rounded cursor-pointer uppercase transition ${
                  difficulty === diff
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {diff === 'facil' ? 'Fácil' : diff === 'normal' ? 'Normal' : 'Bravo 🔥'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main 3-Column Layout: P1 Info, Roster Grid, Rival Info */}
      <div className="grid grid-cols-12 gap-3 md:gap-4 items-center my-auto z-10 w-full max-w-6xl mx-auto py-2">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: PLAYER 1 CARD */}
        {/* ============================================================== */}
        <div className={`col-span-12 md:col-span-3 bg-neutral-950/90 border-2 rounded-xl p-3 sm:p-4 shadow-2xl transition duration-200 ${
          selectionStep === 'step1_p1'
            ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] ring-2 ring-red-400/50'
            : 'border-emerald-500/70 opacity-90'
        }`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded uppercase tracking-wider shadow">
              1P (TÚ)
            </span>
            <span className="text-[9px] font-mono font-bold">
              {selectionStep === 'step1_p1' ? (
                <span className="text-amber-300 animate-pulse">◄ ELIGIENDO</span>
              ) : (
                <span className="text-emerald-400 font-black">✓ 1P LISTO</span>
              )}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white truncate tracking-wide">
            {selectedChar1.name}
          </h3>
          <p className="text-[9px] text-amber-400 italic mb-2 truncate">"{selectedChar1.alias}"</p>

          {/* Hero Mascot Portrait */}
          <div
            className="w-full h-24 sm:h-28 rounded-lg flex items-center justify-center text-5xl sm:text-6xl shadow-inner relative overflow-hidden mb-3 border-2 border-white/20"
            style={{
              background: `radial-gradient(circle, ${selectedChar1.accentColor}44 0%, ${selectedChar1.themeColor} 100%)`,
            }}
          >
            <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transform hover:scale-110 transition duration-150">
              {getCharacterEmoji(selectedChar1.id)}
            </span>
            <div className="absolute top-1 right-1 text-[8px] font-bold bg-black/75 px-1.5 py-0.5 rounded text-amber-300 border border-amber-400/30">
              {selectedChar1.id === 'mama_lucha' ? '★ AURRERA' : '★ LUCHADOR'}
            </div>
          </div>

          {/* Graphical Stat Bars */}
          <div className="space-y-1.5 text-[8px] sm:text-[9px] font-mono mb-3 bg-black/60 p-2 rounded-lg border border-neutral-800">
            {[
              { label: 'FUERZA', val: selectedChar1.stats.power, color: '#ef4444' },
              { label: 'VELOCIDAD', val: selectedChar1.stats.speed, color: '#22c55e' },
              { label: 'ALCANCE', val: selectedChar1.stats.range, color: '#38bdf8' },
              { label: 'DEFENSA', val: selectedChar1.stats.defense, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold">{stat.label}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div
                      key={star}
                      className="w-3.5 h-2 rounded-xs transition-colors"
                      style={{
                        backgroundColor: star <= stat.val ? stat.color : '#262626',
                        boxShadow: star <= stat.val ? `0 0 5px ${stat.color}88` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Moves Teaser */}
          <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 space-y-1">
            <div className="text-[8px] text-amber-300 uppercase font-black flex items-center space-x-1">
              <span>⚡</span>
              <span>SUPER GOLPE:</span>
            </div>
            <div className="text-[9px] text-white font-bold truncate">
              {selectedChar1.moves.super.name}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTER COLUMN: CHARACTER ROSTER GRID */}
        {/* ============================================================== */}
        <div className="col-span-12 md:col-span-6 flex flex-col items-center">
          
          {/* Step Banner & Quick Actions */}
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                selectionStep === 'step1_p1' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>
                1. TU LUCHADOR
              </span>
              {gameMode !== 'beatemup' && (
                <>
                  <span className="text-neutral-600">➔</span>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                    selectionStep === 'step2_rival' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    2. RIVAL ({gameMode === 'arcade' ? 'ARCADE' : gameMode === 'versus_p2' ? '2P' : 'CPU'})
                  </span>
                </>
              )}
            </div>

            {/* Random Rival Button (Active in Step 2 for Arcade / vs CPU) */}
            {(gameMode === 'arcade' || gameMode === 'versus_cpu') && selectionStep === 'step2_rival' && (
              <button
                type="button"
                onClick={handleRandomRival}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[9px] font-black rounded-lg border border-purple-300 shadow-md cursor-pointer transition transform hover:scale-105 flex items-center space-x-1"
                title="Elegir rival al azar [R]"
              >
                <span>🎲</span>
                <span>RIVAL ALEATORIO [R]</span>
              </button>
            )}
          </div>

          {/* Grid of 11 Fighters */}
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 w-full max-h-[44vh] sm:max-h-[48vh] overflow-y-auto p-1">
            {CHARACTERS.map((char, idx) => {
              const isP1 = p1Index === idx;
              const isP2 = p2Index === idx;
              const isCurrentSelection = selectionStep === 'step1_p1' ? isP1 : isP2;

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectChar(idx)}
                  style={{
                    backgroundColor: isCurrentSelection
                      ? selectionStep === 'step1_p1' ? '#450a0a' : '#172554'
                      : isP1 ? '#271111' : isP2 ? '#0f172a' : '#171717',
                  }}
                  className={`relative p-2 rounded-xl cursor-pointer transition-all duration-150 transform hover:scale-105 border-2 shadow-xl flex flex-col items-center justify-center ${
                    isCurrentSelection
                      ? selectionStep === 'step1_p1'
                        ? 'border-red-500 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                        : 'border-blue-500 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.7)]'
                      : isP1
                      ? 'border-red-900/80 opacity-80'
                      : isP2
                      ? 'border-blue-900/80 opacity-80'
                      : 'border-neutral-700 hover:border-amber-400'
                  }`}
                >
                  {/* Indicators 1P & 2P */}
                  <div className="absolute top-1 left-1 flex space-x-1 z-10">
                    {isP1 && (
                      <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow">
                        {gameMode === 'versus_p2' ? '2P' : 'RIVAL'}
                      </span>
                    )}
                  </div>

                  {/* Character Emoji */}
                  <div className="text-3xl sm:text-4xl my-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {getCharacterEmoji(char.id)}
                  </div>

                  {/* Name and Tag */}
                  <div className="text-center text-[9px] sm:text-[10px] font-black text-white truncate w-full tracking-wider">
                    {char.name}
                  </div>
                  <div className="text-center text-[7px] text-amber-300 font-mono truncate w-full">
                    {char.alias.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Confirmation CTA Button */}
          <div className="w-full flex space-x-2 mt-3 max-w-md">
            {selectionStep === 'step2_rival' && (
              <button
                type="button"
                onClick={handleBackStep}
                className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-black text-xs rounded-xl border border-neutral-600 shadow cursor-pointer transition uppercase"
              >
                ◀ VOLVER A 1P
              </button>
            )}

            <button
              type="button"
              onClick={handleAdvanceStep}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-black font-black text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.8)] transition transform hover:scale-105 cursor-pointer uppercase tracking-widest border-2 border-white flex items-center justify-center space-x-2 animate-pulse"
            >
              <span>🥊</span>
              <span>
                {selectionStep === 'step1_p1' && gameMode !== 'beatemup'
                  ? 'CONFIRMAR 1P ➔ ELEGIR RIVAL'
                  : '¡A PELEAR! [ENTER]'}
              </span>
              <span>🥊</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: RIVAL / OPPONENT CARD */}
        {/* ============================================================== */}
        <div className={`col-span-12 md:col-span-3 bg-neutral-950/90 border-2 rounded-xl p-3 sm:p-4 shadow-2xl transition duration-200 ${
          selectionStep === 'step2_rival'
            ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/50'
            : 'border-neutral-800 opacity-80'
        }`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-wider shadow">
              {gameMode === 'versus_p2' ? '2P (JUGADOR 2)' : 'RIVAL (CPU)'}
            </span>
            <span className="text-[9px] font-mono font-bold">
              {selectionStep === 'step2_rival' ? (
                <span className="text-cyan-300 animate-pulse">◄ ELIGIENDO</span>
              ) : (
                <span className="text-neutral-500">PENDIENTE</span>
              )}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white truncate tracking-wide">
            {selectedChar2.name}
          </h3>
          <p className="text-[9px] text-amber-400 italic mb-2 truncate">"{selectedChar2.alias}"</p>

          {/* Rival Emblem Box */}
          <div
            className="w-full h-24 sm:h-28 rounded-lg flex items-center justify-center text-5xl sm:text-6xl shadow-inner relative overflow-hidden mb-3 border-2 border-white/20"
            style={{
              background: `radial-gradient(circle, ${selectedChar2.accentColor}44 0%, ${selectedChar2.themeColor} 100%)`,
            }}
          >
            <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transform hover:scale-110 transition duration-150">
              {getCharacterEmoji(selectedChar2.id)}
            </span>
          </div>

          {/* Stats Bar */}
          <div className="space-y-1.5 text-[8px] sm:text-[9px] font-mono mb-3 bg-black/60 p-2 rounded-lg border border-neutral-800">
            {[
              { label: 'FUERZA', val: selectedChar2.stats.power, color: '#ef4444' },
              { label: 'VELOCIDAD', val: selectedChar2.stats.speed, color: '#22c55e' },
              { label: 'ALCANCE', val: selectedChar2.stats.range, color: '#38bdf8' },
              { label: 'DEFENSA', val: selectedChar2.stats.defense, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold">{stat.label}</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div
                      key={star}
                      className="w-3.5 h-2 rounded-xs"
                      style={{
                        backgroundColor: star <= stat.val ? stat.color : '#262626',
                        boxShadow: star <= stat.val ? `0 0 5px ${stat.color}88` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="bg-neutral-900/90 p-2 rounded-lg border border-neutral-800 italic text-[8px] sm:text-[9px] text-amber-200 line-clamp-2">
            "{selectedChar2.quote}"
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="text-center text-[9px] sm:text-[10px] text-neutral-400 font-mono z-20 pt-1">
        <p className="arcade-text-gold font-bold">
          [FLECHAS / WASD] NAVEGAR · [ENTER] CONFIRMAR PASO · [R] RIVAL ALEATORIO · [ESC] VOLVER
        </p>
      </div>
    </div>
  );
};
