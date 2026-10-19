import React, { useState } from 'react';
import { Plus, Minus, Sparkles, Layers } from 'lucide-react';

export default function Card({ card, collection, onUpdate, onClickCard, imageOnly = false }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const normalCount = collection?.normal_count || 0;
  const foilCount = collection?.foil_count || 0;
  const totalCount = normalCount + foilCount;

  const handleUpdate = async (type, delta) => {
    if (isUpdating) return;
    
    let newNormal = normalCount;
    let newFoil = foilCount;
    
    if (type === 'normal') {
      newNormal = Math.max(0, normalCount + delta);
    } else {
      newFoil = Math.max(0, foilCount + delta);
    }

    if (newNormal === normalCount && newFoil === foilCount) return;

    setIsUpdating(true);
    try {
      await onUpdate(card.id, newNormal, newFoil);
    } finally {
      setIsUpdating(false);
    }
  };

  const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-panel-elevated flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.35)] hover:border-primary-500/50">
      
      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none z-20">
        {/* Energy Cost Badge */}
        {card.energy_cost !== undefined && card.energy_cost !== null && !isBattlefield ? (
          <div className="bg-dark-950/85 backdrop-blur-md border border-white/15 text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg group-hover:border-primary-400 group-hover:scale-110 transition-all">
            {card.energy_cost}
          </div>
        ) : <div />}

        {/* Owned Count Badge */}
        {totalCount > 0 && (
          <div className="bg-dark-950/90 backdrop-blur-md border border-primary-500/40 text-primary-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all">
            <Layers size={11} className="text-primary-400" />
            <span>{totalCount}x</span>
            {foilCount > 0 && <Sparkles size={10} className="text-amber-400 ml-0.5" />}
          </div>
        )}
      </div>

      {/* Card Image Container */}
      <div 
        className={`relative aspect-[2.5/3.5] w-full bg-dark-950 overflow-hidden ${onClickCard ? 'cursor-pointer' : ''}`}
        onClick={() => onClickCard && onClickCard(card)}
      >
        {card.image_url ? (
          <img 
            src={card.image_url} 
            alt={card.name} 
            className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 origin-center ${isBattlefield ? 'object-contain -rotate-90 scale-[1.35] group-hover:scale-[1.4]' : 'object-cover'}`}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-semibold">
            Sin Imagen
          </div>
        )}

        {/* Subtle foil holographic shimmer when user owns foil */}
        {foilCount > 0 && (
          <div className="absolute inset-0 foil-shimmer pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
        )}
      </div>
      
      {/* Card Info Footer */}
      {!imageOnly && (
        <div className="p-3 flex flex-col justify-center bg-dark-900/60 border-t border-white/[0.04]">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-primary-300 transition-colors" title={card.name}>
            {card.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
            <span className="truncate">{card.set_name}</span>
            <span className="text-slate-600 font-bold">•</span>
            <span className="truncate">{card.card_type}</span>
          </p>
        </div>
      )}

      {/* Floating Hover Controls (Normal & Foil Trackers) */}
      {!imageOnly && (
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-dark-950/95 backdrop-blur-xl translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-250 ease-out flex flex-col gap-2 z-30 border-t border-white/10 shadow-2xl">
          {/* Normal Tracker */}
          <div className="flex items-center justify-between bg-dark-900/80 rounded-xl px-2.5 py-1.5 border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-200">
              Normal
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdate('normal', -1); }} 
                disabled={isUpdating || normalCount === 0} 
                className="w-6 h-6 rounded-lg bg-dark-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-90"
              >
                <Minus size={12} />
              </button>
              <span className="font-extrabold text-xs w-5 text-center text-white tabular-nums">{normalCount}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdate('normal', 1); }} 
                disabled={isUpdating} 
                className="w-6 h-6 rounded-lg bg-dark-800 hover:bg-primary-600 hover:text-white text-slate-300 flex items-center justify-center transition-all active:scale-90"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          
          {/* Foil Tracker */}
          <div className="flex items-center justify-between bg-dark-900/80 rounded-xl px-2.5 py-1.5 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            <span className="text-xs font-semibold text-amber-300/90 flex items-center gap-1.5 relative z-10">
              <Sparkles size={12} className="text-amber-400" />
              Foil
            </span>
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdate('foil', -1); }} 
                disabled={isUpdating || foilCount === 0} 
                className="w-6 h-6 rounded-lg bg-dark-800 hover:bg-amber-500/20 text-amber-200/70 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-90"
              >
                <Minus size={12} />
              </button>
              <span className="font-extrabold text-xs w-5 text-center text-amber-300 tabular-nums">{foilCount}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdate('foil', 1); }} 
                disabled={isUpdating} 
                className="w-6 h-6 rounded-lg bg-dark-800 hover:bg-amber-500 hover:text-dark-950 text-amber-300 flex items-center justify-center transition-all active:scale-90"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
