import React, { useState } from 'react';
import { Plus, Minus, Sparkles, Tag, Star, Bookmark } from 'lucide-react';

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

export const isPromoCard = (card) => {
  if (!card) return false;
  const setName = (card.set_name || '').toLowerCase();
  const rarity = (card.rarity || '').toLowerCase();
  return (
    setName.includes('promotional') ||
    setName.includes('promo') ||
    rarity === 'promo'
  );
};

export const isAutoSurplusRarity = (card) => {
  if (!card) return false;
  if (isPromoCard(card)) return false;
  const rarity = (card.rarity || '').toLowerCase();
  return rarity === 'common' || rarity === 'uncommon';
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
  onAdjustManualSale = null,
  onToggleFeaturedSale = null,
  isWishlisted = false,
  wishlistQty = 0,
  onToggleWishlist = null,
  onSetWishlistCount = null
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
    if (onUpdate) onUpdate(card.id, newNormal, newFoil);
  };

  const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';
  const isSaleView = viewMode === 'sale';

  return (
    <article
      className={`group rounded-xl overflow-hidden bg-surface border flex flex-col transition-colors duration-150 ${
        isSaleView && saleData?.onSale
          ? saleData.featured
            ? 'border-[#B45309] ring-1 ring-[#B45309]/25'
            : 'border-[#15803D]'
          : 'border-line hover:border-[#B45309]/60'
      }`}
    >
      {/* Pure Artwork Area — Zero floating buttons or cluttered badges */}
      <div
        className="relative aspect-[2.5/3.5] w-full bg-subtle overflow-hidden cursor-pointer select-none"
        onClick={() => onClickCard && onClickCard(card)}
        title="Ver detalle de carta"
      >
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.name}
            className={`w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.03] origin-center ${
              isBattlefield ? 'object-contain rotate-90 scale-[1.35] group-hover:scale-[1.4]' : 'object-cover'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-xs font-medium">
            Sin Imagen
          </div>
        )}

        {foilCount > 0 && (
          <div className="absolute inset-0 foil-shimmer pointer-events-none opacity-35 group-hover:opacity-65 transition-opacity duration-300" />
        )}
      </div>

      {/* Structured Solid Footer */}
      {!imageOnly && (
        <div className="p-1.5 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 bg-surface border-t border-line flex-1 justify-between">
          {/* Row 1: Title + Ownership / Status Pill + Wishlist */}
          <div className="flex items-start justify-between gap-1">
            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => onClickCard && onClickCard(card)}
            >
              <h3
                className="text-[11px] sm:text-sm font-semibold text-ink-primary leading-tight truncate group-hover:text-[#B45309] transition-colors"
                title={card.name}
              >
                {card.name}
              </h3>
              <p className="text-[9px] sm:text-[11px] text-ink-secondary truncate mt-0.5">
                {card.set_name} · {card.card_type}
              </p>
            </div>

            {/* Right: Wishlist Quick Toggle or Ownership Count */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {totalCount > 0 && !isSaleView && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-bold tabular-nums border ${
                    foilCount > 0 && normalCount === 0
                      ? 'bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border-[#FDE68A] dark:border-amber-700/60'
                      : 'bg-app text-ink-primary border-line'
                  }`}
                  title={`Posees ${normalCount} normal y ${foilCount} foil`}
                >
                  {isAlwaysFoilCard || (normalCount === 0 && foilCount > 0) ? (
                    <>
                      <Sparkles size={9} className="text-[#B45309]" />
                      {foilCount}
                    </>
                  ) : normalCount > 0 && foilCount > 0 ? (
                    `${normalCount}+${foilCount}F`
                  ) : (
                    `${normalCount}x`
                  )}
                </span>
              )}

              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(card.id);
                  }}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-colors border cursor-pointer ${
                    isWishlisted
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                      : 'bg-app hover:bg-subtle text-ink-secondary hover:text-[#1D4ED8] border-line'
                  }`}
                  title={isWishlisted ? `En WishList: ${wishlistQty || 1}x` : 'Añadir a WishList'}
                  aria-label="WishList"
                >
                  <Bookmark size={12} className={`sm:w-3.5 sm:h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Contextual Controls */}
          {viewMode === 'wishlist' ? (
            <div className="flex items-center justify-between gap-1 bg-app border border-line p-1 rounded-[10px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = Math.max(0, (wishlistQty || 1) - 1);
                  if (onSetWishlistCount) onSetWishlistCount(card.id, next);
                  else if (onToggleWishlist && next === 0) onToggleWishlist(card.id);
                }}
                className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg bg-surface hover:bg-red-50 text-ink-primary hover:text-[#B91C1C] border border-line flex items-center justify-center transition-colors active:scale-95"
                title="Restar 1 copia deseada"
              >
                <Minus size={14} />
              </button>

              <span className="text-xs font-bold text-[#1D4ED8] tabular-nums px-1">
                Buscas {wishlistQty || 1}x
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSetWishlistCount) onSetWishlistCount(card.id, (wishlistQty || 1) + 1);
                }}
                className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white flex items-center justify-center transition-colors active:scale-95"
                title="Añadir 1 copia deseada"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : isSaleView && saleData ? (
            saleData.isAuto ? (
              <div className="flex flex-col gap-1.5 bg-app border border-line p-2 rounded-[10px]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-secondary">
                    Total: <strong className="text-ink-primary">{saleData.totalOwned}x</strong>
                  </span>
                  <span className="text-[#92400E] dark:text-amber-300 font-medium">
                    Guardas: {saleData.playsetKept}x
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-line text-[11px]">
                  <span className="text-[#15803D] font-bold flex items-center gap-1">
                    <Tag size={11} /> Venta:
                  </span>
                  <span className="font-bold text-[#15803D]">
                    {saleData.saleNormal > 0 && `${saleData.saleNormal} norm`}
                    {saleData.saleNormal > 0 && saleData.saleFoil > 0 && ' · '}
                    {saleData.saleFoil > 0 && `${saleData.saleFoil} foil`}
                  </span>
                </div>
                {saleData.hasSurplus && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFeaturedSale && onToggleFeaturedSale(card.id, !saleData.featured);
                    }}
                    className={`w-full min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                      saleData.featured
                        ? 'bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border-[#FCD34D] dark:border-amber-700/60'
                        : 'bg-surface text-ink-secondary hover:text-[#B45309] border-line'
                    }`}
                  >
                    <Star size={12} className={saleData.featured ? 'fill-current text-[#B45309]' : ''} />
                    <span>{saleData.featured ? 'Destacada' : 'Destacar'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`flex flex-col gap-1.5 p-2 rounded-[10px] border ${
                  saleData.onSale ? 'bg-green-50/60 border-green-200' : 'bg-app border-line'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-secondary">
                    Posees: <strong className="text-ink-primary">{saleData.totalOwned}x</strong>
                  </span>
                  <span className="font-bold uppercase text-[10px] text-[#92400E] dark:text-amber-300">
                    {isPromoCard(card) ? 'PROMO' : card.rarity}
                  </span>
                </div>

                {!saleData.onSale ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleManualSale && onToggleManualSale(card.id, true);
                    }}
                    className="w-full min-h-[40px] px-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Tag size={12} />
                    <span>Poner a la venta</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 bg-surface border border-green-200 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustManualSale && onAdjustManualSale(card.id, -1);
                        }}
                        disabled={saleData.saleTotal <= 1}
                        className="min-w-[36px] min-h-[36px] rounded-md bg-app hover:bg-subtle disabled:opacity-30 text-ink-primary flex items-center justify-center"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-[#15803D] text-xs">
                        {saleData.saleTotal}x venta
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustManualSale && onAdjustManualSale(card.id, 1);
                        }}
                        disabled={saleData.saleTotal >= saleData.totalOwned}
                        className="min-w-[36px] min-h-[36px] rounded-md bg-[#15803D] hover:bg-[#166534] disabled:opacity-30 text-white flex items-center justify-center"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeaturedSale && onToggleFeaturedSale(card.id, !saleData.featured);
                        }}
                        className={`flex-1 min-h-[34px] px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 border cursor-pointer ${
                          saleData.featured
                            ? 'bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border-[#FCD34D] dark:border-amber-700/60'
                            : 'bg-surface text-ink-secondary border-line'
                        }`}
                      >
                        <Star size={11} className={saleData.featured ? 'fill-current text-[#B45309]' : ''} />
                        <span>{saleData.featured ? 'Destacada' : 'Destacar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleManualSale && onToggleManualSale(card.id, false);
                        }}
                        className="min-h-[34px] px-2.5 rounded-md text-[11px] font-semibold text-[#B91C1C] bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Standard Collection Controls — compact for 3-col mobile */
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 bg-app border border-line p-0.5 sm:p-1 rounded-lg sm:rounded-[10px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate(isAlwaysFoilCard ? 'foil' : activeTab, -1);
                }}
                disabled={isAlwaysFoilCard ? foilCount === 0 : (activeTab === 'normal' ? normalCount === 0 : foilCount === 0)}
                className="w-7 h-8 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-surface hover:bg-red-50 text-ink-primary hover:text-[#B91C1C] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors active:scale-95 shrink-0 border border-line cursor-pointer"
                title={isAlwaysFoilCard ? 'Restar 1 foil' : (activeTab === 'normal' ? 'Restar 1 normal' : 'Restar 1 foil')}
              >
                <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>

              {isAlwaysFoilCard ? (
                <div
                  className="flex-1 h-8 rounded-md sm:rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 select-none pointer-events-none min-w-0 px-0.5"
                  title="Carta siempre Foil"
                >
                  <Sparkles size={10} className="text-[#B45309] shrink-0" />
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">Foil</span>
                </div>
              ) : (
                <div className="flex-1 h-8 p-0.5 rounded-md sm:rounded-lg bg-subtle border border-line flex items-center gap-0.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('normal'); }}
                    className={`flex-1 h-full px-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition-colors flex items-center justify-center min-w-0 cursor-pointer ${
                      activeTab === 'normal'
                        ? 'bg-surface text-ink-primary shadow-sm'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    <span className="hidden sm:inline">Norm</span>
                    <span className="inline sm:hidden font-bold">N</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('foil'); }}
                    className={`flex-1 h-full px-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition-colors flex items-center justify-center gap-0.5 min-w-0 cursor-pointer ${
                      activeTab === 'foil'
                        ? 'bg-[#B45309] text-white'
                        : 'text-ink-secondary hover:text-[#92400E] dark:text-amber-300'
                    }`}
                  >
                    <Sparkles size={9} className="shrink-0" />
                    <span className="hidden sm:inline">Foil</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate(isAlwaysFoilCard ? 'foil' : activeTab, 1);
                }}
                className={`w-7 h-8 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-colors active:scale-95 shrink-0 border cursor-pointer ${
                  (isAlwaysFoilCard || activeTab === 'foil')
                    ? 'bg-[#FFFBEB] dark:bg-amber-950/50 hover:bg-[#B45309] border-[#FCD34D] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 hover:text-white'
                    : 'bg-surface hover:bg-[#B45309] border-line text-ink-primary hover:text-white'
                }`}
                title={isAlwaysFoilCard ? 'Añadir 1 foil' : (activeTab === 'normal' ? 'Añadir 1 normal' : 'Añadir 1 foil')}
              >
                <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
