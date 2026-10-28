/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundManager } from './audio/soundManager';
import { CHARACTERS } from './data/characters';
import { STAGES } from './data/stages';
import {
  CharacterDef,
  FighterState,
  GameMode,
  GamePhase,
  InputState,
  StageDef,
} from './types/game';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  calculateCpuInput,
  createFighter,
  GROUND_Y,
  PhysicsEngine,
} from './game/physics';
import { GameRenderer } from './game/renderer';
import { ArcadeHUD } from './components/ArcadeHUD';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { StageSelect } from './components/StageSelect';
import { MoveListModal } from './components/MoveListModal';
import { VirtualControls } from './components/VirtualControls';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  // Navigation & Game State
  const [phase, setPhase] = useState<GamePhase>('title');
  const [gameMode, setGameMode] = useState<GameMode>('arcade');
  const [difficulty, setDifficulty] = useState<'facil' | 'normal' | 'bravo'>('normal');

  // Selected Fighters & Stage
  const [p1Char, setP1Char] = useState<CharacterDef>(CHARACTERS[0]); // Mamá Lucha by default
  const [p2Char, setP2Char] = useState<CharacterDef>(CHARACTERS[1]); // Catrina by default
  const [currentStage, setCurrentStage] = useState<StageDef>(STAGES[0]); // Bodega Aurrera by default!
  const [arcadeStageIndex, setArcadeStageIndex] = useState<number>(0);

  // Settings
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMoveList, setShowMoveList] = useState<boolean>(false);

  // Round & Match Info
  const [roundTimer, setRoundTimer] = useState<number>(99);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [p1Score, setP1Score] = useState<number>(34500);
  const [p2Score, setP2Score] = useState<number>(0);
  const [roundAnnounceText, setRoundAnnounceText] = useState<string | null>(null);
  const [comboNotification, setComboNotification] = useState<{ text: string; timer: number } | null>(null);

  // Victory State
  const [matchWinner, setMatchWinner] = useState<CharacterDef | null>(null);
  const [matchLoser, setMatchLoser] = useState<CharacterDef | null>(null);
  const [p1Won, setP1Won] = useState<boolean>(false);

  // Canvas & Engine References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const physicsRef = useRef<PhysicsEngine>(new PhysicsEngine());

  // Mutable Game Loop State (preventing React re-renders during 60fps simulation)
  const fightersRef = useRef<{ p1: FighterState; p2: FighterState }>({
    p1: createFighter(1, CHARACTERS[0], 220, 1),
    p2: createFighter(2, CHARACTERS[1], 670, -1),
  });

  const inputsRef = useRef<{ p1: InputState; p2: InputState }>({
    p1: { up: false, down: false, left: false, right: false, punch: false, kick: false, special: false, super: false },
    p2: { up: false, down: false, left: false, right: false, punch: false, kick: false, special: false, super: false },
  });

  const superFreezeRef = useRef<{ active: boolean; char: CharacterDef | null; timer: number }>({
    active: false,
    char: null,
    timer: 0,
  });

  const mamaLuchaIntroRef = useRef<number>(1.0); // 1.0 down to 0 for Bodega Aurrera entrance flyby
  const roundTimerAccRef = useRef<number>(0);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid browser scrolling with arrow keys / space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowMoveList(prev => !prev);
        return;
      }

      // Title screen quick start
      if (phase === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        soundManager.playCoin();
        soundManager.startMariachiBGM();
        setPhase('char_select');
        return;
      }

      const inp = inputsRef.current;

      // P1 Keyboard Controls (WASD + J, K, L, U / Space)
      switch (e.code) {
        case 'KeyW': inp.p1.up = true; break;
        case 'KeyS': inp.p1.down = true; break;
        case 'KeyA': inp.p1.left = true; break;
        case 'KeyD': inp.p1.right = true; break;
        case 'KeyJ': inp.p1.punch = true; break;
        case 'KeyK': inp.p1.kick = true; break;
        case 'KeyL': inp.p1.special = true; break;
        case 'KeyU':
        case 'Space': inp.p1.super = true; break;
      }

      // P2 Keyboard Controls (Arrow Keys + NumPad 4, 5, 6, 1 / I, O, P, 8)
      switch (e.code) {
        case 'ArrowUp': inp.p2.up = true; break;
        case 'ArrowDown': inp.p2.down = true; break;
        case 'ArrowLeft': inp.p2.left = true; break;
        case 'ArrowRight': inp.p2.right = true; break;
        case 'Numpad4':
        case 'KeyI': inp.p2.punch = true; break;
        case 'Numpad5':
        case 'KeyO': inp.p2.kick = true; break;
        case 'Numpad6':
        case 'KeyP': inp.p2.special = true; break;
        case 'Numpad1':
        case 'Digit8': inp.p2.super = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inp = inputsRef.current;

      // P1 Controls
      switch (e.code) {
        case 'KeyW': inp.p1.up = false; break;
        case 'KeyS': inp.p1.down = false; break;
        case 'KeyA': inp.p1.left = false; break;
        case 'KeyD': inp.p1.right = false; break;
        case 'KeyJ': inp.p1.punch = false; break;
        case 'KeyK': inp.p1.kick = false; break;
        case 'KeyL': inp.p1.special = false; break;
        case 'KeyU':
        case 'Space': inp.p1.super = false; break;
      }

      // P2 Controls
      switch (e.code) {
        case 'ArrowUp': inp.p2.up = false; break;
        case 'ArrowDown': inp.p2.down = false; break;
        case 'ArrowLeft': inp.p2.left = false; break;
        case 'ArrowRight': inp.p2.right = false; break;
        case 'Numpad4':
        case 'KeyI': inp.p2.punch = false; break;
        case 'Numpad5':
        case 'KeyO': inp.p2.kick = false; break;
        case 'Numpad6':
        case 'KeyP': inp.p2.special = false; break;
        case 'Numpad1':
        case 'Digit8': inp.p2.super = false; break;
      }
    };

    const handleBlur = () => {
      // Clear held keys on window blur
      inputsRef.current.p1 = { up: false, down: false, left: false, right: false, punch: false, kick: false, special: false, super: false };
      inputsRef.current.p2 = { up: false, down: false, left: false, right: false, punch: false, kick: false, special: false, super: false };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  // Handle Touch Virtual Input
  const handleVirtualInput = (key: keyof InputState, active: boolean) => {
    inputsRef.current.p1[key] = active;
  };

  // Sound & Filter Toggles
  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.startMariachiBGM();
    }
  }, []);

  const handleToggleCrt = useCallback(() => {
    setCrtEnabled(prev => !prev);
  }, []);

  // Initialize Match / Round
  const startMatch = useCallback((
    stage: StageDef,
    c1: CharacterDef,
    c2: CharacterDef
  ) => {
    setCurrentStage(stage);
    setP1Char(c1);
    setP2Char(c2);

    // Create fresh fighters
    fightersRef.current.p1 = createFighter(1, c1, 220, 1);
    fightersRef.current.p2 = createFighter(2, c2, 670, -1);

    physicsRef.current.resetArena();
    setRoundTimer(99);
    setCurrentRound(1);
    setIsPaused(false);
    mamaLuchaIntroRef.current = stage.id === 'aurrera' ? 1.0 : 0;

    setPhase('intro');
    soundManager.startMariachiBGM();

    // Announce Round 1
    setRoundAnnounceText('¡ROUND 1!');
    soundManager.announce('¡ROUND UNO!');

    setTimeout(() => {
      setRoundAnnounceText('¡LUCHEN!');
      soundManager.announce('¡LUCHEN!');

      setTimeout(() => {
        setRoundAnnounceText(null);
        setPhase('fighting');
      }, 900);
    }, 1400);
  }, []);

  // Start Next Round (after a round win)
  const startNextRound = useCallback((roundNum: number) => {
    const { p1, p2 } = fightersRef.current;
    p1.health = 100;
    p1.x = 220;
    p1.y = GROUND_Y - 110;
    p1.vx = 0;
    p1.vy = 0;
    p1.state = 'idle';
    p1.stateTimer = 0;

    p2.health = 100;
    p2.x = 670;
    p2.y = GROUND_Y - 110;
    p2.vx = 0;
    p2.vy = 0;
    p2.state = 'idle';
    p2.stateTimer = 0;

    physicsRef.current.resetArena();
    setRoundTimer(99);
    setCurrentRound(roundNum);

    setPhase('intro');
    setRoundAnnounceText(`¡ROUND ${roundNum}!`);
    soundManager.announce(roundNum === 2 ? '¡ROUND DOS!' : '¡ROUND FINAL!');

    setTimeout(() => {
      setRoundAnnounceText('¡LUCHEN!');
      soundManager.announce('¡LUCHEN!');

      setTimeout(() => {
        setRoundAnnounceText(null);
        setPhase('fighting');
      }, 900);
    }, 1400);
  }, []);

  // Mode Selection from Title Screen
  const handleStartGame = (mode: GameMode) => {
    soundManager.playCoin();
    soundManager.startMariachiBGM();
    setGameMode(mode);

    if (mode === 'arcade') {
      setArcadeStageIndex(0);
      // In arcade mode, always starts with Bodega Aurrera (con Mamá Lucha!)
      setCurrentStage(STAGES[0]);
      setPhase('char_select');
    } else {
      setPhase('char_select');
    }
  };

  // Character Confirmation
  const handleConfirmCharacterSelection = (
    c1: CharacterDef,
    c2: CharacterDef,
    diff: 'facil' | 'normal' | 'bravo'
  ) => {
    setP1Char(c1);
    setP2Char(c2);
    setDifficulty(diff);

    if (gameMode === 'arcade') {
      // In arcade mode, Stage 1 is Bodega Aurrera, opponent is Catrina or Catrín
      const opponent = c1.id === 'catrina' ? CHARACTERS[2] : CHARACTERS[1];
      setP2Char(opponent);
      startMatch(STAGES[0], c1, opponent);
    } else {
      setPhase('stage_select');
    }
  };

  // Stage Confirmation
  const handleSelectStage = (stage: StageDef) => {
    startMatch(stage, p1Char, p2Char);
  };

  // Next Arcade Stage
  const handleNextArcadeStage = () => {
    const nextIdx = arcadeStageIndex + 1;
    setArcadeStageIndex(nextIdx);
    const nextStage = STAGES[nextIdx % STAGES.length];
    // Next opponent from roster
    const nextOpponent = CHARACTERS[(nextIdx + 1) % CHARACTERS.length];
    startMatch(nextStage, p1Char, nextOpponent);
  };

  // Rematch
  const handleRematch = () => {
    startMatch(currentStage, p1Char, p2Char);
  };

  // Main 60fps Game Loop
  useEffect(() => {
    if (phase !== 'fighting' && phase !== 'intro' && phase !== 'round_end') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(ctx);
    }

    let animationFrameId: number;

    const gameLoop = () => {
      const { p1, p2 } = fightersRef.current;
      const physics = physicsRef.current;
      const renderer = rendererRef.current!;

      // Bodega Aurrera Mamá Lucha intro swoop progress
      if (mamaLuchaIntroRef.current > 0) {
        mamaLuchaIntroRef.current -= 0.008;
      }

      // Handle CPU input if playing vs CPU
      let p2Input = inputsRef.current.p2;
      if (gameMode !== 'versus_p2') {
        p2Input = calculateCpuInput(p2, p1, physics.projectiles, difficulty);
      }

      if (phase === 'fighting' && !isPaused) {
        // Super freeze check
        if (superFreezeRef.current.active) {
          superFreezeRef.current.timer--;
          if (superFreezeRef.current.timer <= 0) {
            superFreezeRef.current.active = false;
          }
        }

        // Update Physics
        physics.update(
          p1,
          p2,
          inputsRef.current.p1,
          p2Input,
          (f) => {
            // On Super Move Triggered
            superFreezeRef.current = {
              active: true,
              char: f.charDef,
              timer: 30,
            };
          },
          (attacker, hits) => {
            // On Combo Hit Connected
            let txt = `¡${hits} HITS!`;
            if (hits === 2) txt = '¡2 HITS! ¡DURO!';
            else if (hits === 3) txt = '¡3 HITS! ¡SABROSO!';
            else if (hits === 4) txt = '¡4 HITS! ¡COMBO MATÓN!';
            else if (hits >= 5) txt = '¡DESMADRE TOTAL!';

            setComboNotification({ text: txt, timer: 45 });
            setP1Score(prev => prev + hits * 500);
          }
        );

        // Update Round Timer (1 sec every 60 frames)
        roundTimerAccRef.current++;
        if (roundTimerAccRef.current >= 60) {
          roundTimerAccRef.current = 0;
          setRoundTimer(prev => {
            if (prev <= 1) {
              // Time Over!
              if (p1.health > p2.health) {
                p2.state = 'defeat';
              } else if (p2.health > p1.health) {
                p1.state = 'defeat';
              }
              return 0;
            }
            return prev - 1;
          });
        }

        // Check Round End Conditions (KO or Defeat)
        if (p1.health <= 0 || p2.health <= 0 || p1.state === 'defeat' || p2.state === 'defeat') {
          setPhase('round_end');

          const p1WonThisRound = p1.health > 0;
          if (p1WonThisRound) {
            p1.roundsWon++;
            p1.state = 'victory';
          } else {
            p2.roundsWon++;
            p2.state = 'victory';
          }

          setRoundAnnounceText('¡K.O.!');

          setTimeout(() => {
            if (p1.roundsWon >= 2 || p2.roundsWon >= 2) {
              // Match Finished!
              const winner = p1.roundsWon >= 2 ? p1.charDef : p2.charDef;
              const loser = p1.roundsWon >= 2 ? p2.charDef : p1.charDef;
              setMatchWinner(winner);
              setMatchLoser(loser);
              setP1Won(p1.roundsWon >= 2);
              setPhase('match_end');
              soundManager.announce(p1.roundsWon >= 2 ? '¡GANADOR!' : '¡HAS SIDO DERROTADO!');
            } else {
              // Advance to next round
              startNextRound(currentRound + 1);
            }
          }, 2400);
        }
      }

      // Render the frame onto canvas
      renderer.render(
        currentStage,
        p1,
        p2,
        physics.projectiles,
        physics.particles,
        physics.screenShake,
        superFreezeRef.current.active,
        superFreezeRef.current.char,
        mamaLuchaIntroRef.current
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, isPaused, gameMode, difficulty, currentStage, currentRound, startNextRound]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans flex items-center justify-center">
      {/* Aspect Ratio Box (16:9 Arcade Canvas Viewport) */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video flex items-center justify-center shadow-2xl bg-black">
        {/* HTML5 Game Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* Retro CRT Scanlines & Screen Curvature Filter */}
        {crtEnabled && (
          <div className="crt-overlay crt-flicker pointer-events-none" />
        )}

        {/* Phase: TITLE SCREEN */}
        {phase === 'title' && (
          <div className="absolute inset-0 z-30">
            <TitleScreen
              onStartGame={handleStartGame}
              onOpenControls={() => setShowMoveList(true)}
              onToggleMute={handleToggleMute}
              isMuted={isMuted}
              crtEnabled={crtEnabled}
              onToggleCrt={handleToggleCrt}
            />
          </div>
        )}

        {/* Phase: CHARACTER SELECT */}
        {phase === 'char_select' && (
          <div className="absolute inset-0 z-30">
            <CharacterSelect
              gameMode={gameMode}
              onConfirmSelection={handleConfirmCharacterSelection}
              onBack={() => setPhase('title')}
            />
          </div>
        )}

        {/* Phase: STAGE SELECT */}
        {phase === 'stage_select' && (
          <div className="absolute inset-0 z-30">
            <StageSelect
              onSelectStage={handleSelectStage}
              onBack={() => setPhase('char_select')}
            />
          </div>
        )}

        {/* In-Game HUD (Street Fighter style) */}
        {(phase === 'intro' || phase === 'fighting' || phase === 'round_end') && (
          <ArcadeHUD
            p1={fightersRef.current.p1}
            p2={fightersRef.current.p2}
            roundTimer={roundTimer}
            currentRound={currentRound}
            p1Score={p1Score}
            p2Score={p2Score}
            comboNotification={comboNotification}
            roundAnnounceText={roundAnnounceText}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(prev => !prev)}
            onOpenMoveList={() => setShowMoveList(true)}
            onToggleMute={handleToggleMute}
            isMuted={isMuted}
          />
        )}

        {/* Mobile / Touchscreen Virtual Arcade Controls */}
        {(phase === 'fighting' || phase === 'intro') && (
          <VirtualControls
            onVirtualInput={handleVirtualInput}
            superReady={fightersRef.current.p1.superMeter >= 100}
          />
        )}

        {/* Victory / Game Over Modal */}
        {phase === 'match_end' && matchWinner && matchLoser && (
          <VictoryModal
            winner={matchWinner}
            loser={matchLoser}
            p1Won={p1Won}
            gameMode={gameMode}
            arcadeStageIndex={arcadeStageIndex}
            totalArcadeStages={STAGES.length}
            onNextStage={handleNextArcadeStage}
            onRematch={handleRematch}
            onBackToMenu={() => setPhase('title')}
          />
        )}

        {/* Move List & Controls Modal */}
        <MoveListModal
          isOpen={showMoveList}
          onClose={() => setShowMoveList(false)}
          currentChar={p1Char}
        />
      </div>
    </div>
  );
}
