import React, { useState } from 'react';
import { Plus, Minus, Sparkles, Layers, Tag, Check, Shield } from 'lucide-react';

export const isAlwaysFoil = (card) => {
  if (!card) return false;
  const rarity = (card.rarity || '').toLowerCase();
  const cardType = (card.card_type || '').toLowerCase();
  return (
    rarity === 'rare' ||
    rarity === 'epic' ||
    rarity === 'legendary' ||
    rarity === 'legend' ||
    rarity === 'showcase' ||
    rarity === 'promo' ||
    cardType === 'legend'
  );
};

export const isAutoSurplusRarity = (card) => {
  if (!card) return false;
  const rarity = (card.rarity || '').toLowerCase();
  return rarity === 'common' || rarity === 'uncommon' || rarity === 'rare';
};

export const isCommonRune = (card) => {
  if (!card) return false;
  const cardType = (card.card_type || '').toLowerCase();
  const rarity = (card.rarity || '').toLowerCase();
  return cardType === 'rune' && rarity === 'common';
};

export const getPlaysetTarget = (card) => {
  if (!card) return 3;
  const cardType = (card.card_type || '').toLowerCase();
  if (cardType === 'battlefield') {
    return 1;
  }
  return 3;
};

export default function Card({ 
  card, 
  collection, 
  onUpdate, 
  onClickCard, 
  imageOnly = false,
  viewMode = 'all',
  saleData = null,
  onToggleManualSale = null,
  onAdjustManualSale = null
}) {
  const isAlwaysFoilCard = isAlwaysFoil(card);
  const normalCount = isAlwaysFoilCard ? 0 : (collection?.normal_count || 0);
  const foilCount = isAlwaysFoilCard 
    ? ((collection?.foil_count || 0) + (collection?.normal_count || 0))
    : (collection?.foil_count || 0);
  const totalCount = normalCount + foilCount;

  const [activeTab, setActiveTab] = useState(() => {
    if (normalCount === 0 && foilCount > 0) return 'foil';
    return 'normal';
  });

  // Fast, instant update with zero cooldown/locks
  const handleUpdate = (type, delta) => {
    let newNormal = normalCount;
    let newFoil = foilCount;
    
    if (isAlwaysFoilCard) {
      newNormal = 0;
      newFoil = Math.max(0, foilCount + delta);
    } else if (type === 'normal') {
      newNormal = Math.max(0, normalCount + delta);
    } else {
      newFoil = Math.max(0, foilCount + delta);
    }

    if (newNormal === normalCount && newFoil === foilCount) return;

    if (onUpdate) {
      onUpdate(card.id, newNormal, newFoil);
    }
  };

  const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';
  const isSaleView = viewMode === 'sale';

  return (
    <div className={`group relative rounded-2xl overflow-hidden glass-panel-elevated flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.35)] ${
      isSaleView && saleData?.onSale 
        ? 'border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
        : 'hover:border-primary-500/50'
    }`}>
      
      {/* Top Badges */}
      <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 flex justify-between items-center pointer-events-none z-20">
        {/* Energy Cost Badge */}
        {card.energy_cost !== undefined && card.energy_cost !== null && !isBattlefield ? (
          <div className="bg-dark-950/85 backdrop-blur-md border border-white/15 text-white font-black text-[10px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg group-hover:border-primary-400 group-hover:scale-110 transition-all">
            {card.energy_cost}
          </div>
        ) : <div />}

        {/* Top Right Badge: Depends on View Mode */}
        {isSaleView && saleData ? (
          saleData.onSale && saleData.saleTotal > 0 ? (
            <div className="bg-emerald-950/95 backdrop-blur-md border border-emerald-400/60 text-emerald-300 font-black text-[9px] sm:text-[11px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all">
              <Tag size={10} className="sm:w-[11px] sm:h-[11px] text-emerald-400 shrink-0" />
              <span>{saleData.saleTotal}x venta</span>
            </div>
          ) : (
            <div className="bg-dark-950/90 backdrop-blur-md border border-slate-700/60 text-slate-400 font-bold text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <Shield size={9} className="text-slate-500 shrink-0" />
              <span>Colección ({totalCount}x)</span>
            </div>
          )
        ) : (
          /* Normal View: Owned Count Badge on Card */
          totalCount > 0 && (
            <div className="bg-dark-950/90 backdrop-blur-md border border-primary-500/40 text-primary-300 font-extrabold text-[9px] sm:text-[11px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all">
              <Layers size={10} className={`sm:w-[11px] sm:h-[11px] ${isAlwaysFoilCard ? 'text-amber-400' : 'text-primary-400'}`} />
              {isAlwaysFoilCard ? (
                <span className="text-amber-300 flex items-center gap-0.5 font-black">
                  <Sparkles size={9} className="sm:w-2.5 sm:h-2.5 text-amber-400" />
                  {foilCount}x
                </span>
              ) : normalCount > 0 && foilCount > 0 ? (
                <div className="flex items-center gap-0.5 sm:gap-1 font-bold">
                  <span>{normalCount}x</span>
                  <span className="text-slate-600 font-extrabold">•</span>
                  <span className="text-amber-300 flex items-center gap-0.5">
                    <Sparkles size={9} className="sm:w-2.5 sm:h-2.5 text-amber-400" />
                    {foilCount}x
                  </span>
                </div>
              ) : foilCount > 0 ? (
                <span className="text-amber-300 flex items-center gap-0.5 font-black">
                  <Sparkles size={9} className="sm:w-2.5 sm:h-2.5 text-amber-400" />
                  {foilCount}x
                </span>
              ) : (
                <span>{normalCount}x</span>
              )}
            </div>
          )
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
        <div className="p-1.5 sm:p-2.5 flex flex-col justify-center bg-dark-900/90 border-t border-white/[0.06] relative">
          <div className="mb-1 cursor-pointer" onClick={() => onClickCard && onClickCard(card)}>
            <h3 className="text-[11px] sm:text-sm font-bold text-slate-100 truncate group-hover:text-primary-300 transition-colors" title={card.name}>
              {card.name}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate flex items-center gap-1 sm:gap-1.5">
              <span className="truncate">{card.set_name}</span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="truncate">{card.card_type}</span>
            </p>
          </div>

          {/* VENTA MODE CONTROLS */}
          {isSaleView && saleData ? (
            saleData.isAuto ? (
              /* Automatic Surplus Card (Common, Uncommon, Rare) */
              <div className="flex flex-col gap-1 bg-dark-950/90 border border-emerald-500/25 p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-inner">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] leading-tight">
                  <span className="text-slate-400 font-medium">
                    Total: <strong className="text-slate-100 font-bold">{saleData.totalOwned}x</strong>
                  </span>
                  <span className="text-amber-400/90 font-semibold" title="Te quedas 3 cartas para tu baraja/colección">
                    Guardas: {saleData.playsetKept}x
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-white/[0.06] text-[9px] sm:text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <Tag size={9} /> Venta:
                  </span>
                  <span className="font-extrabold text-emerald-300 truncate text-right">
                    {saleData.saleNormal > 0 && `${saleData.saleNormal} norm`}
                    {saleData.saleNormal > 0 && saleData.saleFoil > 0 && ' • '}
                    {saleData.saleFoil > 0 && (
                      <span className="text-amber-300 font-black inline-flex items-center gap-0.5">
                        <Sparkles size={8} />{saleData.saleFoil} foil
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              /* Manual Selection Card (Epic, Promo, Showcase, etc.) */
              <div className={`flex flex-col gap-1 p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-inner border transition-all ${
                saleData.onSale 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-dark-950/90 border-white/[0.08]'
              }`}>
                <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Posees: <strong className="text-slate-100">{saleData.totalOwned}x</strong>
                  </span>
                  <span className="text-purple-300 font-black uppercase text-[8px] sm:text-[9px] tracking-wide">
                    {card.rarity}
                  </span>
                </div>

                {!saleData.onSale ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleManualSale && onToggleManualSale(card.id, true);
                    }}
                    className="w-full py-1 sm:py-1.5 px-2 rounded-md sm:rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Tag size={11} />
                    <span>Poner a la venta</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1 bg-dark-900/90 border border-emerald-500/30 p-0.5 sm:p-1 rounded-md sm:rounded-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustManualSale && onAdjustManualSale(card.id, -1);
                        }}
                        disabled={saleData.saleTotal <= 1}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-dark-800 hover:bg-dark-700 disabled:opacity-25 disabled:pointer-events-none text-slate-200 flex items-center justify-center font-bold transition-all active:scale-90"
                        title="Reducir copias a la venta"
                      >
                        <Minus size={11} />
                      </button>

                      <span className="font-black text-emerald-300 text-[10px] sm:text-xs">
                        {saleData.saleTotal}x venta
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustManualSale && onAdjustManualSale(card.id, 1);
                        }}
                        disabled={saleData.saleTotal >= saleData.totalOwned}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-25 disabled:pointer-events-none text-white flex items-center justify-center font-bold transition-all active:scale-90"
                        title="Aumentar copias a la venta"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleManualSale && onToggleManualSale(card.id, false);
                      }}
                      className="text-[8px] sm:text-[9px] text-slate-400 hover:text-rose-400 transition-colors text-center font-semibold cursor-pointer"
                    >
                      ✕ Quitar de venta
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* STANDARD COLLECTION CONTROLS (+ / - with NO COOLDOWN) */
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 bg-dark-950/80 border border-white/[0.08] p-0.5 sm:p-1 rounded-lg sm:rounded-xl relative shadow-inner">
              
              {/* Decrease Button (-) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate(isAlwaysFoilCard ? 'foil' : activeTab, -1);
                }}
                disabled={isAlwaysFoilCard ? foilCount === 0 : (activeTab === 'normal' ? normalCount === 0 : foilCount === 0)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-dark-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-85 shrink-0 border border-white/[0.04] cursor-pointer"
                title={isAlwaysFoilCard ? "Restar 1 copia foil" : (activeTab === 'normal' ? "Restar 1 copia normal" : "Restar 1 copia foil")}
              >
                <Minus size={13} className="sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Middle Section: Always Foil Indicator OR Normal/Foil Selection Tabs */}
              {isAlwaysFoilCard ? (
                <div 
                  className="flex-1 h-6 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center gap-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.15)] select-none pointer-events-none min-w-0"
                  title="Las cartas Rare y Legendary son siempre foil (no tienen versión normal)"
                >
                  <Sparkles size={10} className="text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">Foil</span>
                </div>
              ) : (
                <div className="flex-1 h-6 sm:h-7 p-0.5 rounded-md sm:rounded-lg bg-dark-900/90 border border-white/[0.08] flex items-center gap-0.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('normal'); }}
                    className={`flex-1 h-full px-0.5 sm:px-1 rounded text-[9px] sm:text-[10px] font-bold transition-all flex items-center justify-center min-w-0 cursor-pointer ${
                      activeTab === 'normal'
                        ? 'bg-primary-600 text-white shadow-glow-primary'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                    title={`Normal (Posees: ${normalCount})`}
                  >
                    <span className="hidden sm:inline whitespace-nowrap">Normal</span>
                    <span className="inline sm:hidden font-black">N</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('foil'); }}
                    className={`flex-1 h-full px-0.5 sm:px-1 rounded text-[9px] sm:text-[10px] font-bold transition-all flex items-center justify-center gap-0.5 min-w-0 cursor-pointer ${
                      activeTab === 'foil'
                        ? 'bg-amber-500 text-dark-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                        : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.04]'
                    }`}
                    title={`Foil (Posees: ${foilCount})`}
                  >
                    <Sparkles size={9} className={`shrink-0 ${activeTab === 'foil' ? 'text-dark-950' : 'text-amber-400'}`} />
                    <span className="hidden sm:inline whitespace-nowrap">Foil</span>
                  </button>
                </div>
              )}

              {/* Increase Button (+) with ZERO cooldown */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate(isAlwaysFoilCard ? 'foil' : activeTab, 1);
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center transition-all active:scale-85 shrink-0 border cursor-pointer ${
                  (isAlwaysFoilCard || activeTab === 'foil')
                    ? 'bg-amber-500/25 hover:bg-amber-500 border-amber-400/50 text-amber-300 hover:text-white shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                    : 'bg-primary-600/30 hover:bg-primary-600 border-primary-500/40 text-primary-300 hover:text-white shadow-glow-primary'
                }`}
                title={isAlwaysFoilCard ? "Añadir 1 copia foil" : (activeTab === 'normal' ? "Añadir 1 copia normal" : "Añadir 1 copia foil")}
              >
                <Plus size={13} className="sm:w-3.5 sm:h-3.5" />
              </button>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
