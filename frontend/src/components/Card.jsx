import React, { useState } from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';

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
    await onUpdate(card.id, newNormal, newFoil);
    setIsUpdating(false);
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 group relative">
      {totalCount > 0 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-dark-900 border border-t-0 border-primary-500 text-primary-400 font-black text-xs px-3 py-1 rounded-b-lg shadow-lg z-20 pointer-events-none">
          {totalCount}
        </div>
      )}
      <div 
        className={`relative aspect-[2.5/3.5] w-full bg-dark-900 overflow-hidden ${onClickCard ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={() => onClickCard && onClickCard(card)}
      >
        {card.image_url ? (
          <img 
            src={card.image_url} 
            alt={card.name} 
            className={`w-full h-full transition-transform origin-center ${card.card_type?.toLowerCase() === 'battlefield' ? 'object-contain -rotate-90 scale-[1.35]' : 'object-cover'}`}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            No Image
          </div>
        )}
      </div>
      
      {!imageOnly && (
        <>
          <div className="p-4 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1 truncate" title={card.name}>{card.name}</h3>
            <p className="text-xs text-slate-400 mb-0">{card.set_name} • {card.card_type}</p>
          </div>
            
          <div className="absolute inset-x-0 bottom-0 p-3 bg-dark-950/90 backdrop-blur-md translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-3 z-10 border-t border-dark-700">
          {/* Normal Tracker */}
          <div className="flex items-center justify-between bg-dark-900/50 rounded-lg p-2 border border-dark-700">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Normal
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => handleUpdate('normal', -1)} disabled={isUpdating} className="btn-icon w-7 h-7">
                <Minus size={14} />
              </button>
              <span className="font-bold w-4 text-center">{normalCount}</span>
              <button onClick={() => handleUpdate('normal', 1)} disabled={isUpdating} className="btn-icon w-7 h-7">
                <Plus size={14} />
              </button>
            </div>
          </div>
          
          {/* Foil Tracker */}
          <div className="flex items-center justify-between bg-dark-900/50 rounded-lg p-2 border border-dark-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            <span className="text-sm font-medium text-amber-200/90 flex items-center gap-2 relative z-10">
              <Sparkles size={14} className="text-amber-400" />
              Foil
            </span>
            <div className="flex items-center gap-3 relative z-10">
              <button onClick={() => handleUpdate('foil', -1)} disabled={isUpdating} className="btn-icon w-7 h-7 text-amber-200/70 hover:text-amber-400 hover:bg-amber-500/20">
                <Minus size={14} />
              </button>
              <span className="font-bold w-4 text-center text-amber-100">{foilCount}</span>
              <button onClick={() => handleUpdate('foil', 1)} disabled={isUpdating} className="btn-icon w-7 h-7 text-amber-200/70 hover:text-amber-400 hover:bg-amber-500/20">
                <Plus size={14} />
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
