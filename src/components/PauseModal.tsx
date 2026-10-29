import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onChangeCharacter: () => void;
  onMainMenu: () => void;
}

interface PauseOption {
  label: string;
  sublabel: string;
  icon: string;
  action: () => void;
  color: string;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onChangeCharacter,
  onMainMenu,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const options: PauseOption[] = [
    {
      label: 'CONTINUAR PELEA',
      sublabel: 'Reanudar el combate activo',
      icon: '▶',
      action: onResume,
      color: 'from-emerald-600 to-green-700',
    },
    {
      label: 'REINICIAR COMBATE',
      sublabel: 'Comenzar la pelea desde el Round 1',
      icon: '🔄',
      action: onRestart,
      color: 'from-amber-600 to-orange-700',
    },
    {
      label: 'CAMBIAR DE PERSONAJE',
      sublabel: 'Volver a la selección de luchadores',
      icon: '🥊',
      action: onChangeCharacter,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      label: 'MENÚ PRINCIPAL',
      sublabel: 'Finalizar la partida y salir al inicio',
      icon: '🏠',
      action: onMainMenu,
      color: 'from-red-700 to-neutral-900',
    },
  ];

  // Keyboard navigation inside pause menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        soundManager.playSelect();
        setSelectedIndex(prev => (prev === 0 ? options.length - 1 : prev - 1));
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        soundManager.playSelect();
        setSelectedIndex(prev => (prev === options.length - 1 ? 0 : prev + 1));
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        soundManager.playCoin();
        options[selectedIndex].action();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        soundManager.playSelect();
        onResume();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, options, onResume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c1412] via-[#241a16] to-[#0d0908] border-4 border-amber-400 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.6)] p-6 md:p-8 text-center text-white overflow-hidden">
        
        {/* Background Mexican Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header Marquee */}
        <div className="relative z-10 mb-6">
          <div className="inline-block px-3 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded border border-amber-300 shadow transform -rotate-1 mb-1.5">
            ¡TIEMPO FUERA!
          </div>
          <h2 className="text-3xl md:text-4xl font-black arcade-text-gold tracking-widest uppercase">
            JUEGO EN PAUSA
          </h2>
          <p className="text-[10px] text-amber-300/80 font-mono tracking-wider mt-1">
            USA [▲ / ▼] O EL RATÓN PARA ELEGIR · [ESC / P] REANUDAR
          </p>
        </div>

        {/* Menu Options Stack */}
        <div className="relative z-10 flex flex-col space-y-3">
          {options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={opt.label}
                type="button"
                onMouseEnter={() => {
                  if (selectedIndex !== idx) {
                    soundManager.playSelect();
                    setSelectedIndex(idx);
                  }
                }}
                onClick={() => {
                  soundManager.playCoin();
                  opt.action();
                }}
                className={`relative w-full py-3 px-4 rounded-xl cursor-pointer transition-all duration-150 transform flex items-center justify-between border-2 text-left shadow-lg ${
                  isSelected
                    ? `bg-gradient-to-r ${opt.color} border-amber-300 scale-[1.03] shadow-[0_0_20px_rgba(245,158,11,0.7)] translate-x-1`
                    : 'bg-neutral-900/90 border-neutral-700 hover:border-neutral-500 opacity-90'
                }`}
              >
                {/* Left Indicator & Icon */}
                <div className="flex items-center space-x-3">
                  <span className={`text-base sm:text-lg ${isSelected ? 'animate-bounce text-amber-300' : 'text-neutral-400'}`}>
                    {isSelected ? '🥊' : opt.icon}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow">
                      {opt.label}
                    </div>
                    <div className="text-[9px] text-amber-200/70 font-sans">
                      {opt.sublabel}
                    </div>
                  </div>
                </div>

                {/* Right Arrow */}
                {isSelected && (
                  <span className="text-xs text-amber-300 animate-pulse font-mono">
                    ◄ ENTER
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Legend */}
        <div className="relative z-10 mt-6 pt-3 border-t border-amber-500/30 text-[9px] text-neutral-400 font-mono">
          [ENTER] SELECCIONAR · [ESC / P] CONTINUAR PELEA
        </div>
      </div>
    </div>
  );
};
