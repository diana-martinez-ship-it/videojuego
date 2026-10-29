import React from 'react';

interface VirtualBeatEmUpControlsProps {
  onInput: (key: 'up' | 'down' | 'left' | 'right' | 'attack' | 'jump' | 'special', active: boolean) => void;
  specialReady: boolean;
}

export const VirtualBeatEmUpControls: React.FC<VirtualBeatEmUpControlsProps> = ({
  onInput,
  specialReady,
}) => {
  const handleTouch = (
    key: 'up' | 'down' | 'left' | 'right' | 'attack' | 'jump' | 'special',
    active: boolean
  ) => {
    return (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      onInput(key, active);
    };
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-4 flex justify-between items-end pointer-events-none z-30 select-none md:hidden">
      {/* 8-Way Virtual D-Pad */}
      <div className="relative w-36 h-36 pointer-events-auto bg-black/40 rounded-full border-2 border-neutral-700 p-2 backdrop-blur-sm">
        {/* UP */}
        <button
          onTouchStart={handleTouch('up', true)}
          onTouchEnd={handleTouch('up', false)}
          onMouseDown={handleTouch('up', true)}
          onMouseUp={handleTouch('up', false)}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-neutral-800 active:bg-amber-500 rounded-t-lg border border-neutral-600 flex items-center justify-center text-amber-300 font-bold text-xs"
        >
          ▲
        </button>

        {/* DOWN */}
        <button
          onTouchStart={handleTouch('down', true)}
          onTouchEnd={handleTouch('down', false)}
          onMouseDown={handleTouch('down', true)}
          onMouseUp={handleTouch('down', false)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-neutral-800 active:bg-amber-500 rounded-b-lg border border-neutral-600 flex items-center justify-center text-amber-300 font-bold text-xs"
        >
          ▼
        </button>

        {/* LEFT */}
        <button
          onTouchStart={handleTouch('left', true)}
          onTouchEnd={handleTouch('left', false)}
          onMouseDown={handleTouch('left', true)}
          onMouseUp={handleTouch('left', false)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-neutral-800 active:bg-amber-500 rounded-l-lg border border-neutral-600 flex items-center justify-center text-amber-300 font-bold text-xs"
        >
          ◀
        </button>

        {/* RIGHT */}
        <button
          onTouchStart={handleTouch('right', true)}
          onTouchEnd={handleTouch('right', false)}
          onMouseDown={handleTouch('right', true)}
          onMouseUp={handleTouch('right', false)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-neutral-800 active:bg-amber-500 rounded-r-lg border border-neutral-600 flex items-center justify-center text-amber-300 font-bold text-xs"
        >
          ▶
        </button>
      </div>

      {/* Action Arcade Buttons (Z: Attack, X: Jump, C: Special) */}
      <div className="relative w-44 h-36 pointer-events-auto flex items-center justify-end space-x-2">
        {/* Special Button (C) */}
        <button
          onTouchStart={handleTouch('special', true)}
          onTouchEnd={handleTouch('special', false)}
          onMouseDown={handleTouch('special', true)}
          onMouseUp={handleTouch('special', false)}
          className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transform active:scale-95 transition ${
            specialReady
              ? 'bg-gradient-to-br from-rose-600 to-red-800 border-rose-300 text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse'
              : 'bg-neutral-800 border-neutral-600 text-neutral-400'
          }`}
        >
          <span className="text-base">💥</span>
          <span className="text-[8px] font-bold font-mono">ESP (C)</span>
        </button>

        {/* Attack Button (Z) */}
        <button
          onTouchStart={handleTouch('attack', true)}
          onTouchEnd={handleTouch('attack', false)}
          onMouseDown={handleTouch('attack', true)}
          onMouseUp={handleTouch('attack', false)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 active:from-amber-400 active:to-orange-600 border-2 border-amber-300 text-white flex flex-col items-center justify-center shadow-lg transform active:scale-95 transition"
        >
          <span className="text-lg">🥊</span>
          <span className="text-[9px] font-bold font-mono">GOLPE (Z)</span>
        </button>

        {/* Jump Button (X) */}
        <button
          onTouchStart={handleTouch('jump', true)}
          onTouchEnd={handleTouch('jump', false)}
          onMouseDown={handleTouch('jump', true)}
          onMouseUp={handleTouch('jump', false)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 active:from-cyan-400 active:to-blue-600 border-2 border-cyan-300 text-white flex flex-col items-center justify-center shadow-lg transform active:scale-95 transition"
        >
          <span className="text-base">🦘</span>
          <span className="text-[8px] font-bold font-mono">SALTO (X)</span>
        </button>
      </div>
    </div>
  );
};
