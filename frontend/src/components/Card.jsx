import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Sparkles, Layers, Check } from 'lucide-react';

export default function Card({ card, collection, onUpdate, onClickCard, imageOnly = false }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQuickPicker, setShowQuickPicker] = useState(false);
  const pickerRef = useRef(null);
  
  const normalCount = collection?.normal_count || 0;
  const foilCount = collection?.foil_count || 0;
  const totalCount = normalCount + foilCount;

  // Close picker on outside click
  useEffect(() => {
    if (!showQuickPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowQuickPicker(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showQuickPicker]);

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

  const handleSetExact = async (newNormal, newFoil = foilCount) => {
    if (isUpdating) return;
    if (newNormal === normalCount && newFoil === foilCount) {
      setShowQuickPicker(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(card.id, Math.max(0, newNormal), Math.max(0, newFoil));
    } finally {
      setIsUpdating(false);
      setShowQuickPicker(false);
    }
  };

  const handleFoilCycle = async () => {
    if (isUpdating) return;
    // Cycle foil: 0 -> 1 -> 2 -> 3 -> 0
    const nextFoil = foilCount >= 3 ? 0 : foilCount + 1;
    setIsUpdating(true);
    try {
      await onUpdate(card.id, normalCount, nextFoil);
    } finally {
      setIsUpdating(false);
    }
  };

  const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-panel-elevated flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.35)] hover:border-primary-500/50">
      
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

      {/* Card Image Container (Clicking opens Inspection modal) */}
      <div 
        className={`relative aspect-[2.5/3.5] w-full bg-dark-950 overflow-hidden cursor-pointer select-none`}
        onClick={() => onClickCard && onClickCard(card)}
        title="Toca para ver la carta en detalle"
      >
        {card.image_url ? (
          <img 
            src={card.image_url} 
            alt={card.name} 
            className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 origin-center ${isBattlefield ? 'object-contain rotate-90 scale-[1.35] group-hover:scale-[1.4]' : 'object-cover'}`}
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
        <div className="p-2 sm:p-2.5 flex flex-col justify-center bg-dark-900/90 border-t border-white/[0.06] relative">
          <div className="mb-1.5 cursor-pointer" onClick={() => onClickCard && onClickCard(card)}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-primary-300 transition-colors" title={card.name}>
              {card.name}
            </h3>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
              <span className="truncate">{card.set_name}</span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="truncate">{card.card_type}</span>
            </p>
          </div>

          {/* Ergonomic Tactile Collection Controls (Always accessible, thumb-friendly!) */}
          <div className="flex items-center justify-between gap-1 bg-dark-950/80 border border-white/[0.08] p-1 rounded-xl relative shadow-inner">
            
            {/* Decrease Button (-) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleUpdate('normal', -1); }}
              disabled={isUpdating || normalCount === 0}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-dark-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-85 shrink-0 border border-white/[0.04]"
              title="Restar 1 copia normal"
            >
              <Minus size={15} />
            </button>

            {/* Tap to Quick-Pick Count (1-tap 0, 1, 2, 3) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowQuickPicker(prev => !prev); }}
              className={`flex-1 h-8 sm:h-7 px-1 rounded-lg flex items-center justify-center gap-1 text-xs font-black transition-all border ${
                normalCount > 0 
                  ? 'bg-primary-950/70 border-primary-500/40 text-primary-300 shadow-glow-primary' 
                  : 'bg-dark-900/60 border-transparent text-slate-400 hover:text-white'
              }`}
              title="Toca para seleccionar cantidad rápida (0, 1, 2, 3)"
            >
              <span>{normalCount}</span>
              <span className="text-[9px] text-slate-500 font-medium">norm</span>
            </button>

            {/* Increase Button (+) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleUpdate('normal', 1); }}
              disabled={isUpdating}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-primary-600/30 hover:bg-primary-600 text-primary-300 hover:text-white flex items-center justify-center transition-all active:scale-85 shrink-0 border border-primary-500/40"
              title="Añadir 1 copia normal"
            >
              <Plus size={15} />
            </button>

            {/* Foil Cycle Button (✨) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleFoilCycle(); }}
              disabled={isUpdating}
              className={`h-8 sm:h-7 px-1.5 rounded-lg flex items-center justify-center gap-0.5 text-[10px] font-black transition-all border shrink-0 active:scale-85 ${
                foilCount > 0 
                  ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                  : 'bg-dark-800 text-slate-500 hover:text-amber-300 border-white/[0.04]'
              }`}
              title={`Foil: ${foilCount}. Toca para cambiar (0 → 1 → 2 → 3)`}
            >
              <Sparkles size={11} className={foilCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
              <span>{foilCount > 0 ? foilCount : ''}</span>
            </button>

            {/* 1-Tap Quick Count Picker Popover */}
            {showQuickPicker && (
              <div 
                ref={pickerRef}
                className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-dark-950/95 border border-primary-500/50 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1.5 animate-card-pop"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Fijar copias de {card.name}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleSetExact(val)}
                      className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                        normalCount === val 
                          ? 'bg-primary-600 text-white shadow-glow-primary border border-primary-400' 
                          : 'bg-dark-800 hover:bg-dark-700 text-slate-200 border border-white/5'
                      }`}
                    >
                      {val} {val === 3 ? '★' : ''}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    <Sparkles size={10} /> Foil: {foilCount}
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((fVal) => (
                      <button
                        key={fVal}
                        onClick={() => handleSetExact(normalCount, fVal)}
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${
                          foilCount === fVal 
                            ? 'bg-amber-500 text-dark-950' 
                            : 'bg-dark-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
