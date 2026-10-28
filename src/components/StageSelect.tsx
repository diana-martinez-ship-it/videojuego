import React from 'react';
import { soundManager } from '../audio/soundManager';
import { STAGES } from '../data/stages';
import { StageDef } from '../types/game';

interface StageSelectProps {
  onSelectStage: (stage: StageDef) => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({ onSelectStage, onBack }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#18181b] via-[#27272a] to-[#09090b] text-white select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-amber-500/30 pb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 rounded border border-neutral-600 cursor-pointer"
        >
          ← ELEGIR LUCHADOR
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black arcade-text-gold tracking-widest uppercase">
            ELIGE EL ESCENARIO
          </h2>
          <p className="text-[10px] text-amber-200/80 font-mono">
            DONDE SE DEFINIRÁ EL HONOR MEXICANO
          </p>
        </div>

        <div className="w-24"></div>
      </div>

      {/* Stages Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto max-w-5xl mx-auto w-full max-h-[72vh] overflow-y-auto p-1">
        {STAGES.map(stage => {
          return (
            <div
              key={stage.id}
              onClick={() => {
                soundManager.playSelect();
                onSelectStage(stage);
              }}
              className="group bg-black/80 rounded-xl border-2 border-neutral-700 hover:border-amber-400 p-3.5 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Banner Tag */}
              {stage.hasMamaLuchaBanner && (
                <div className="absolute top-2.5 right-2.5 bg-green-600 text-yellow-300 text-[7px] font-black px-2 py-0.5 rounded shadow border border-yellow-300 animate-pulse">
                  ¡ABRE MAMÁ LUCHA!
                </div>
              )}

              <div>
                {/* Visual Icon / Thumbnail Box */}
                <div
                  className="w-full h-28 rounded-lg mb-2.5 flex flex-col items-center justify-center text-4xl relative overflow-hidden shadow-inner border border-white/20"
                  style={{ backgroundColor: stage.bannerColor }}
                >
                  <span>
                    {stage.id === 'aurrera' ? '🛒' :
                     stage.id === 'mercado' ? '🥑' :
                     stage.id === 'sayulita' ? '🏄‍♂️' :
                     stage.id === 'anubis_temple' ? '🏺' : '🕯️'}
                  </span>
                  <div className="absolute bottom-1.5 inset-x-2 bg-black/70 backdrop-blur-xs py-0.5 px-2 rounded text-center">
                    <span className="text-[9px] font-black text-amber-300 uppercase truncate block">
                      {stage.ambientFlavor}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                  {stage.name}
                </h3>
                <p className="text-[9px] text-amber-400 font-mono mb-2">{stage.location}</p>

                <p className="text-[10px] text-neutral-300 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center text-[10px] font-bold text-amber-400 group-hover:text-amber-200">
                <span>SELECCIONAR</span>
                <span>➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center text-[9px] text-neutral-500 font-mono">
        BODEGA AURRERA CUENTA CON LA APARICIÓN DE MAMÁ LUCHA EN EL INICIO DEL COMBATE
      </div>
    </div>
  );
};
