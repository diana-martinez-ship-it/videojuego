import React from 'react';
import { InputState } from '../types/game';

interface VirtualControlsProps {
  onVirtualInput: (key: keyof InputState, active: boolean) => void;
  superReady: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onVirtualInput,
  superReady,
}) => {
  // Mobile / touch virtual arcade buttons
  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-between px-4 z-40 select-none">
      {/* Left D-Pad Controls */}
      <div className="pointer-events-auto flex flex-col items-center bg-black/60 backdrop-blur-xs p-2 rounded-2xl border border-amber-500/30">
        {/* Up / Jump */}
        <button
          onPointerDown={() => onVirtualInput('up', true)}
          onPointerUp={() => onVirtualInput('up', false)}
          onPointerLeave={() => onVirtualInput('up', false)}
          className="w-11 h-11 bg-neutral-800 active:bg-amber-600 text-white font-black rounded-lg border-2 border-neutral-600 flex items-center justify-center text-sm shadow-md"
        >
          ▲
        </button>

        <div className="flex space-x-2 my-1">
          {/* Left / Back */}
          <button
            onPointerDown={() => onVirtualInput('left', true)}
            onPointerUp={() => onVirtualInput('left', false)}
            onPointerLeave={() => onVirtualInput('left', false)}
            className="w-11 h-11 bg-neutral-800 active:bg-amber-600 text-white font-black rounded-lg border-2 border-neutral-600 flex items-center justify-center text-sm shadow-md"
          >
            ◀
          </button>

          {/* Down / Crouch */}
          <button
            onPointerDown={() => onVirtualInput('down', true)}
            onPointerUp={() => onVirtualInput('down', false)}
            onPointerLeave={() => onVirtualInput('down', false)}
            className="w-11 h-11 bg-neutral-800 active:bg-amber-600 text-white font-black rounded-lg border-2 border-neutral-600 flex items-center justify-center text-sm shadow-md"
          >
            ▼
          </button>

          {/* Right / Forward */}
          <button
            onPointerDown={() => onVirtualInput('right', true)}
            onPointerUp={() => onVirtualInput('right', false)}
            onPointerLeave={() => onVirtualInput('right', false)}
            className="w-11 h-11 bg-neutral-800 active:bg-amber-600 text-white font-black rounded-lg border-2 border-neutral-600 flex items-center justify-center text-sm shadow-md"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Right Action Arcade Buttons */}
      <div className="pointer-events-auto flex items-end space-x-2 bg-black/60 backdrop-blur-xs p-2 rounded-2xl border border-amber-500/30">
        {/* Punch Button */}
        <button
          onPointerDown={() => onVirtualInput('punch', true)}
          onPointerUp={() => onVirtualInput('punch', false)}
          onPointerLeave={() => onVirtualInput('punch', false)}
          className="w-12 h-12 bg-emerald-600 active:bg-emerald-400 text-white font-black rounded-full border-2 border-white flex flex-col items-center justify-center shadow-lg transform active:scale-90"
        >
          <span className="text-xs">🥊</span>
          <span className="text-[7px]">GOLPE</span>
        </button>

        {/* Kick Button */}
        <button
          onPointerDown={() => onVirtualInput('kick', true)}
          onPointerUp={() => onVirtualInput('kick', false)}
          onPointerLeave={() => onVirtualInput('kick', false)}
          className="w-12 h-12 bg-blue-600 active:bg-blue-400 text-white font-black rounded-full border-2 border-white flex flex-col items-center justify-center shadow-lg transform active:scale-90"
        >
          <span className="text-xs">🦶</span>
          <span className="text-[7px]">PATADA</span>
        </button>

        {/* Special Move Button */}
        <button
          onPointerDown={() => onVirtualInput('special', true)}
          onPointerUp={() => onVirtualInput('special', false)}
          onPointerLeave={() => onVirtualInput('special', false)}
          className="w-12 h-12 bg-purple-600 active:bg-purple-400 text-white font-black rounded-full border-2 border-white flex flex-col items-center justify-center shadow-lg transform active:scale-90"
        >
          <span className="text-xs">✨</span>
          <span className="text-[7px]">ESPECIAL</span>
        </button>

        {/* Super Furia Button */}
        <button
          onPointerDown={() => onVirtualInput('super', true)}
          onPointerUp={() => onVirtualInput('super', false)}
          onPointerLeave={() => onVirtualInput('super', false)}
          className={`w-14 h-14 rounded-full border-2 border-yellow-300 flex flex-col items-center justify-center shadow-2xl transform active:scale-90 transition ${
            superReady
              ? 'bg-gradient-to-tr from-amber-500 to-red-600 text-white animate-pulse'
              : 'bg-neutral-800 text-neutral-500 opacity-60'
          }`}
        >
          <span className="text-sm">🔥</span>
          <span className="text-[7px] font-black">SUPER</span>
        </button>
      </div>
    </div>
  );
};
