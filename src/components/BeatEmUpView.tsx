import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BeatEmUpEngine, VIEW_HEIGHT, VIEW_WIDTH } from '../game/beatemup/beatEmUpEngine';
import { BeatEmUpRenderer } from '../game/beatemup/beatEmUpRenderer';
import { BeatEmUpHUD } from './BeatEmUpHUD';
import { VirtualBeatEmUpControls } from './VirtualBeatEmUpControls';
import { soundManager } from '../audio/soundManager';

interface BeatEmUpViewProps {
  onBackToTitle: () => void;
  onOpenControls: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  crtEnabled: boolean;
}

export const BeatEmUpView: React.FC<BeatEmUpViewProps> = ({
  onBackToTitle,
  onOpenControls,
  isMuted,
  onToggleMute,
  crtEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BeatEmUpEngine>(new BeatEmUpEngine('Gato Sombra'));
  const rendererRef = useRef<BeatEmUpRenderer | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stageCleared, setStageCleared] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Active inputs
  const inputsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    jump: false,
    special: false,
  });

  // UI state updated at ~15fps for React HUD efficiency
  const [hudState, setHudState] = useState({
    player: engineRef.current.player,
    activeEnemy: null as any,
    currentWave: 0,
    totalWaves: 4,
  });

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        onOpenControls();
        return;
      }

      const inp = inputsRef.current;
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          inp.up = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          inp.down = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          inp.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inp.right = true;
          break;
        case 'KeyZ':
        case 'KeyJ':
          inp.attack = true;
          break;
        case 'KeyX':
        case 'KeyK':
          inp.jump = true;
          break;
        case 'KeyC':
        case 'KeyL':
          inp.special = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inp = inputsRef.current;
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          inp.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          inp.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          inp.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inp.right = false;
          break;
        case 'KeyZ':
        case 'KeyJ':
          inp.attack = false;
          break;
        case 'KeyX':
        case 'KeyK':
          inp.jump = false;
          break;
        case 'KeyC':
        case 'KeyL':
          inp.special = false;
          break;
      }
    };

    const handleBlur = () => {
      inputsRef.current = {
        up: false,
        down: false,
        left: false,
        right: false,
        attack: false,
        jump: false,
        special: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onOpenControls]);

  // Handle Touch Virtual Input
  const handleVirtualInput = useCallback(
    (key: 'up' | 'down' | 'left' | 'right' | 'attack' | 'jump' | 'special', active: boolean) => {
      inputsRef.current[key] = active;
    },
    []
  );

  // Initialize Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new BeatEmUpRenderer(ctx);
    soundManager.startMariachiBGM();

    let animId: number;
    let uiTimer = 0;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (!isPaused && !engine.gameOver && !engine.stageCleared) {
        engine.update(inputsRef.current);
      }

      if (renderer) {
        renderer.render(
          engine.player,
          engine.enemies,
          engine.floatingTexts,
          engine.hitSparks,
          engine.cameraX,
          engine.screenShake,
          engine.isWaveLocked,
          engine.stageCleared
        );
      }

      // Check End conditions
      if (engine.stageCleared && !stageCleared) {
        setStageCleared(true);
      }
      if (engine.gameOver && !gameOver) {
        setGameOver(true);
      }

      // Throttle HUD update to ~15fps
      uiTimer++;
      if (uiTimer % 4 === 0) {
        const activeEnemy = engine.enemies.find(e => e.health > 0) || null;
        setHudState({
          player: { ...engine.player },
          activeEnemy: activeEnemy ? { ...activeEnemy } : null,
          currentWave: engine.currentWaveIndex,
          totalWaves: 4,
        });
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPaused, stageCleared, gameOver]);

  // Restart Stage
  const handleRestart = () => {
    engineRef.current.resetGame();
    setStageCleared(false);
    setGameOver(false);
    setIsPaused(false);
    soundManager.playCoin();
    soundManager.startMariachiBGM();
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* 16:9 Canvas Viewport */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] bg-[#0c0a09] shadow-2xl flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* Retro CRT Scanlines Filter */}
        {crtEnabled && (
          <div className="crt-overlay crt-flicker pointer-events-none" />
        )}

        {/* In-Game Arcade HUD */}
        <BeatEmUpHUD
          player={hudState.player}
          activeEnemy={hudState.activeEnemy}
          currentWave={hudState.currentWave}
          totalWaves={hudState.totalWaves}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(prev => !prev)}
          onToggleMute={onToggleMute}
          isMuted={isMuted}
          onOpenControls={onOpenControls}
        />

        {/* Mobile / Touchscreen Virtual Arcade Controls */}
        <VirtualBeatEmUpControls
          onInput={handleVirtualInput}
          specialReady={hudState.player.health > 8}
        />

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-3xl md:text-5xl font-black arcade-text-gold mb-6 animate-pulse">
              ¡JUEGO EN PAUSA!
            </h2>
            <div className="flex flex-col space-y-3 w-64">
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded shadow-lg transition cursor-pointer"
              >
                CONTINUAR [ESC]
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded border border-neutral-600 transition cursor-pointer"
              >
                REINICIAR ETAPA
              </button>
              <button
                onClick={onBackToTitle}
                className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded border border-red-500 transition cursor-pointer"
              >
                SALIR AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        )}

        {/* Stage Victory Modal */}
        {stageCleared && (
          <div className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-fade-in">
            <div className="inline-block px-4 py-1 bg-emerald-600 border border-emerald-300 text-white font-black text-xs rounded uppercase tracking-widest mb-2 shadow">
              ★ ¡VICTORIA EN EL BARRIO! ★
            </div>
            <h2 className="text-3xl md:text-5xl font-black arcade-text-gold text-center mb-2">
              ¡ETAPA COMPLETADA!
            </h2>
            <p className="text-sm md:text-base text-amber-200 font-mono text-center mb-6 max-w-md">
              Gato Sombra ha derrotado a los maleantes y al Comandante Aurrera. ¡Las calles vuelven a estar seguras!
            </p>

            {/* Scorecard */}
            <div className="bg-neutral-900/90 border-2 border-amber-500/60 p-4 rounded-xl w-full max-w-sm mb-6 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">PUNTUACIÓN TOTAL:</span>
                <span className="text-amber-300 font-bold">{engineRef.current.player.score} PTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">VIDAS RESTANTES:</span>
                <span className="text-red-400 font-bold">♥ x{engineRef.current.player.lives}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">OLEADAS SUPERADAS:</span>
                <span className="text-green-400 font-bold">4 / 4 OLEADAS</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs md:text-sm rounded-lg shadow-xl border-2 border-amber-300 cursor-pointer transition transform hover:scale-105"
              >
                JUGAR DE NUEVO ↺
              </button>
              <button
                onClick={onBackToTitle}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs md:text-sm rounded-lg border border-neutral-600 cursor-pointer transition"
              >
                MENÚ PRINCIPAL ⌂
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/92 z-40 flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <h2 className="text-4xl md:text-6xl font-black arcade-text-red mb-3">
              GAME OVER
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 font-mono text-center mb-6">
              Has caído en el combate callejero. ¿Deseas insertar otra moneda?
            </p>

            <div className="flex space-x-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-xs md:text-sm rounded-lg shadow-xl border-2 border-amber-300 cursor-pointer transition transform hover:scale-105"
              >
                REINTENTAR [CONTINUAR]
              </button>
              <button
                onClick={onBackToTitle}
                className="px-6 py-3 bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs md:text-sm rounded-lg border border-neutral-600 cursor-pointer transition"
              >
                SALIR AL MENÚ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
