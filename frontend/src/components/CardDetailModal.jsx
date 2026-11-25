import React, { useEffect, useState } from 'react';
import { X, Shield, Swords, Zap, Loader2, ExternalLink, Tag, ShoppingCart, Sparkles, Bookmark, Plus, Minus } from 'lucide-react';

const formatCardTextHTML = (text) => {
  if (!text) return '';
  let formatted = text;
  
  // Keywords [Texto]
  formatted = formatted.replace(/\[(.*?)\]/g, (match, p1) => {
    if (p1 === '>') {
      return `<span class="inline-block text-primary-400 font-bold mx-0.5">➔</span>`;
    }
    
    let keywordName = p1;
    let numberPart = '';
    const matchNumber = p1.match(/^([a-zA-Z\s]+?)\s+(\d+)$/);
    if (matchNumber) {
      keywordName = matchNumber[1].trim();
      numberPart = `<span class="inline-block text-slate-200 font-black ml-1 text-xs">${matchNumber[2]}</span>`;
    }

    const svgName = keywordName.toUpperCase().replace(/\s+/g, '_');
    const titleCaseName = keywordName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');
    const fallbackHTML = `<span class="inline-block bg-primary-900/60 text-primary-300 border border-primary-700/50 px-1.5 py-0.5 rounded text-xs font-black uppercase tracking-wider mx-0.5 shadow-sm">${p1}</span>`.replace(/"/g, '&quot;');
    
    return `<span class="inline-flex items-center mx-0.5 align-text-bottom"><img src="https://cdn.piltoverarchive.com/description_keywords/${svgName}.svg" class="inline-block h-[22px] object-contain" alt="${keywordName}" onerror="if(!this.dataset.retry){ this.dataset.retry='1'; this.src='https://cdn.piltoverarchive.com/description_keywords/${titleCaseName}.svg'; } else { this.parentElement.outerHTML='${fallbackHTML}'; }" />${numberPart}</span>`;
  });

  // Energy: :rb_energy_X:
  formatted = formatted.replace(/:rb_energy_(\d+):/g, (match, p1) => {
    return `<span class="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-slate-100 border border-slate-300 text-dark-950 text-xs font-black mx-0.5 shadow-inner" style="vertical-align: text-bottom;">${p1}</span>`;
  });

  // Might: :rb_might:
  formatted = formatted.replace(/:rb_might:/g, () => {
    return `<img src="https://cdn.piltoverarchive.com/icons/might.webp" class="inline-block w-[20px] h-[20px] mx-0.5 object-contain" style="vertical-align: -0.2em;" alt="might" onerror="this.style.display='none'" />`;
  });

  // Exhaust: :rb_exhaust:
  formatted = formatted.replace(/:rb_exhaust:/g, () => {
    return `<img src="https://cdn.piltoverarchive.com/icons/tap.webp" class="inline-block w-[20px] h-[20px] mx-0.5 object-contain" style="vertical-align: -0.2em;" alt="exhaust" onerror="this.style.display='none'" />`;
  });

  // Runes: :rb_rune_domain:
  formatted = formatted.replace(/:rb_rune_([a-zA-Z0-9_]+):/g, (match, p1) => {
    if (p1.toLowerCase() === 'rainbow') {
      return `<img src="https://cdn.piltoverarchive.com/icons/rune.webp" class="inline-block w-[20px] h-[20px] mx-0.5 object-contain" style="vertical-align: -0.2em;" alt="${p1}" onerror="this.style.display='none'" />`;
    }
    const dNorm = p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase();
    return `<img src="https://cdn.piltoverarchive.com/colors/${dNorm}.webp" class="inline-block w-[20px] h-[20px] mx-0.5 object-contain" style="vertical-align: -0.2em;" alt="${p1}" onerror="this.style.display='none'" />`;
  });

  if (!formatted.includes('<p>') && !formatted.includes('<br>')) {
      formatted = formatted.replace(/\n/g, '<br>');
  }

  return formatted;
};

export default function CardDetailModal({ card, onClose, isWishlisted = false, wishlistQty = 0, onToggleWishlist = null, onSetWishlistCount = null }) {
  const [richData, setRichData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!card) return;
    setRichData(null);
    const fetchRichData = async () => {
      setLoading(true);
      try {
        const exactName = card.name.replace(' - ', ', ');
        let res = await fetch(`https://api.rifthunt.com/cards/named?exact=${encodeURIComponent(exactName)}`);
        if (!res.ok && card.name.includes(' - ')) {
          res = await fetch(`https://api.rifthunt.com/cards/named?exact=${encodeURIComponent(card.name)}`);
        }
        if (!res.ok) {
          const prefix = card.name.split(/[-–,]/)[0].trim();
          res = await fetch(`https://api.rifthunt.com/cards/search?q=${encodeURIComponent(prefix)}`);
        }
        if (res.ok) {
          const data = await res.json();
          const item = data.data && Array.isArray(data.data) ? data.data[0] : (data.object === 'card' ? data : (data.items && data.items[0]));
          if (item) {
            setRichData(item);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rich data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRichData();
  }, [card]);

  if (!card) return null;

  const displayCard = { ...card };
  if (richData) {
    displayCard.text_rich = richData.text?.rich || richData.rich || displayCard.text_rich;
    displayCard.text_plain = richData.text?.plain || richData.rules_text || richData.text || displayCard.text_plain || displayCard.ability_text;
    
    if (richData.power !== undefined && richData.power !== null) displayCard.attack = richData.power;
    else if (richData.attributes?.power !== undefined) displayCard.attack = richData.attributes.power;
    else if (richData.attributes?.attack !== undefined) displayCard.attack = richData.attributes.attack;
    
    if (richData.might !== undefined && richData.might !== null) displayCard.health = richData.might;
    else if (richData.attributes?.might !== undefined) displayCard.health = richData.attributes.might;
    else if (richData.attributes?.health !== undefined) displayCard.health = richData.attributes.health;

    if (richData.energy !== undefined && richData.energy !== null) displayCard.energy_cost = richData.energy;
    else if (richData.attributes?.energy !== undefined) displayCard.energy_cost = richData.attributes.energy;
  } else {
    displayCard.text_plain = displayCard.ability_text || displayCard.text_plain;
  }

  const isBattlefield = displayCard.card_type?.toLowerCase() === 'battlefield';

  const getPowerColorClasses = (domainStr) => {
    if (!domainStr) return { bg: 'bg-red-500/10', border: 'border-red-500/20', textLight: 'text-red-500/70', textBold: 'text-red-400', icons: [] };
    
    const domains = domainStr.split(',').map(d => d.trim()).filter(Boolean);
    const icons = domains.map(d => {
      const dNorm = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
      return `https://cdn.piltoverarchive.com/colors/${dNorm}.webp`;
    });

    const getColors = (d) => {
      switch (d.toLowerCase()) {
        case 'mind': return { from: 'from-blue-500/20', to: 'to-blue-500/20', bg: 'bg-blue-500/10', border: 'border-blue-500/20', light: 'text-blue-500/70', bold: 'text-blue-400' };
        case 'order': return { from: 'from-yellow-500/20', to: 'to-yellow-500/20', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', light: 'text-yellow-500/70', bold: 'text-yellow-400' };
        case 'body': return { from: 'from-orange-500/20', to: 'to-orange-500/20', bg: 'bg-orange-500/10', border: 'border-orange-500/20', light: 'text-orange-500/70', bold: 'text-orange-400' };
        case 'chaos': return { from: 'from-purple-500/20', to: 'to-purple-500/20', bg: 'bg-purple-500/10', border: 'border-purple-500/20', light: 'text-purple-500/70', bold: 'text-purple-400' };
        case 'fury': return { from: 'from-red-500/20', to: 'to-red-500/20', bg: 'bg-red-500/10', border: 'border-red-500/20', light: 'text-red-500/70', bold: 'text-red-400' };
        case 'calm': return { from: 'from-green-500/20', to: 'to-green-500/20', bg: 'bg-green-500/10', border: 'border-green-500/20', light: 'text-green-500/70', bold: 'text-green-400' };
        case 'life': return { from: 'from-green-500/20', to: 'to-green-500/20', bg: 'bg-green-500/10', border: 'border-green-500/20', light: 'text-green-500/70', bold: 'text-green-400' };
        case 'death': return { from: 'from-purple-500/20', to: 'to-purple-500/20', bg: 'bg-purple-500/10', border: 'border-purple-500/20', light: 'text-purple-500/70', bold: 'text-purple-400' };
        case 'elemental': return { from: 'from-orange-500/20', to: 'to-orange-500/20', bg: 'bg-orange-500/10', border: 'border-orange-500/20', light: 'text-orange-500/70', bold: 'text-orange-400' };
        default: return { from: 'from-red-500/20', to: 'to-red-500/20', bg: 'bg-red-500/10', border: 'border-red-500/20', light: 'text-red-500/70', bold: 'text-red-400' };
      }
    };

    if (domains.length <= 1) {
      const c = getColors(domains[0] || '');
      return { bg: c.bg, border: c.border, textLight: c.light, textBold: c.bold, icons };
    } else {
      const c1 = getColors(domains[0]);
      const c2 = getColors(domains[1]);
      return {
        bg: `bg-gradient-to-br ${c1.from} ${c2.to}`,
        border: `border-white/10`,
        textLight: `text-white/70`,
        textBold: `text-white`,
        icons
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6 md:p-10 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-surface border border-line rounded-t-2xl sm:rounded-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[88dvh]">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="sticky md:absolute top-3 right-3 ml-auto mr-3 mt-3 md:m-0 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center bg-surface/95 hover:bg-subtle text-ink-secondary hover:text-ink-primary rounded-xl border border-line transition-colors active:scale-95 shrink-0"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Left side: Image */}
        <div className="w-full md:w-1/2 lg:w-5/12 bg-app px-5 pb-4 pt-1 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-line relative shrink-0">
           <div className={`relative w-full max-w-[155px] sm:max-w-[220px] md:max-w-sm rounded-xl overflow-hidden border border-line bg-surface ${isBattlefield ? 'aspect-[88/63]' : 'aspect-[63/88]'}`}>
             {displayCard.image_url ? (
               <img src={displayCard.image_url} alt={displayCard.name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-subtle flex items-center justify-center text-ink-muted font-semibold text-sm">Sin Imagen</div>
             )}
           </div>
        </div>

        {/* Right side: Info */}
        <div className="w-full md:w-1/2 lg:w-7/12 p-4 sm:p-8 flex flex-col gap-4 sm:gap-5 md:overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pr-12 md:pr-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-primary font-display tracking-tight">{displayCard.name}</h2>
              {(onToggleWishlist || onSetWishlistCount) && (
                wishlistQty > 0 ? (
                  <div className="flex items-center gap-1.5 bg-app border border-blue-300 dark:border-blue-700/60 p-1 sm:p-1.5 rounded-xl shrink-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-[#1D4ED8] dark:text-blue-300 px-1.5">
                      <Bookmark size={13} className="fill-current" />
                      <span className="hidden sm:inline">WishList:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSetWishlistCount ? onSetWishlistCount(displayCard.id, Math.max(0, wishlistQty - 1)) : onToggleWishlist && onToggleWishlist(displayCard.id)}
                      className="min-w-[32px] min-h-[32px] rounded-lg bg-surface hover:bg-red-50 dark:hover:bg-red-950/50 text-ink-primary hover:text-[#B91C1C] flex items-center justify-center transition-colors text-xs font-bold border border-line cursor-pointer"
                      title="Restar 1 copia deseada"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-extrabold text-xs sm:text-sm text-ink-primary px-1.5 min-w-[24px] text-center tabular-nums">
                      {wishlistQty}x
                    </span>
                    <button
                      type="button"
                      onClick={() => onSetWishlistCount ? onSetWishlistCount(displayCard.id, wishlistQty + 1) : null}
                      className="min-w-[32px] min-h-[32px] rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Añadir 1 copia deseada más"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetWishlistCount ? onSetWishlistCount(displayCard.id, 0) : onToggleWishlist && onToggleWishlist(displayCard.id)}
                      className="min-w-[28px] min-h-[28px] rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-ink-secondary hover:text-[#B91C1C] flex items-center justify-center transition-colors ml-0.5 cursor-pointer text-xs"
                      title="Quitar de WishList"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetWishlistCount ? onSetWishlistCount(displayCard.id, 1) : onToggleWishlist && onToggleWishlist(displayCard.id)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border bg-app hover:bg-blue-50 dark:hover:bg-blue-950/40 text-ink-primary hover:text-[#1D4ED8] dark:hover:text-blue-300 border-line hover:border-blue-300"
                    title="Añadir a WishList"
                  >
                    <Bookmark size={14} />
                    <span>+ Añadir a WishList</span>
                  </button>
                )
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3.5">
              {displayCard.card_type && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-app border border-line text-xs font-bold uppercase tracking-wider text-ink-primary">
                  <img 
                    src={`https://cdn.piltoverarchive.com/types/${displayCard.card_type.toLowerCase()}.webp`} 
                    alt={displayCard.card_type}
                    className="w-4 h-4 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {displayCard.card_type}
                </span>
              )}
              {displayCard.element && displayCard.element.split(',').map(d => {
                const domain = d.trim();
                const dNorm = domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
                return (
                  <span key={domain} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-app border border-line text-xs font-bold uppercase tracking-wider text-ink-primary">
                    <img src={`https://cdn.piltoverarchive.com/colors/${dNorm}.webp`} alt={domain} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    {domain}
                  </span>
                );
              })}
              {displayCard.rarity && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-700/60 text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-200">
                  <img 
                    src={`https://cdn.piltoverarchive.com/rarities/${displayCard.rarity.toLowerCase().replace(/\s+/g, '_')}.webp`} 
                    alt={displayCard.rarity}
                    className="w-4 h-4 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {displayCard.rarity}
                </span>
              )}
              {displayCard.set_name && (
                <span className="px-3 py-1 rounded-lg bg-app border border-line text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  {displayCard.set_name}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-line w-full" />

          {/* Attributes */}
          {(displayCard.energy_cost !== undefined && displayCard.energy_cost !== null) || (displayCard.attack !== undefined && displayCard.attack !== null) || (displayCard.health !== undefined && displayCard.health !== null) ? (
            <div className="flex flex-wrap gap-3">
              {displayCard.energy_cost !== undefined && displayCard.energy_cost !== null && (
                <div className="flex items-center gap-3 bg-app border border-line px-4 py-2.5 rounded-xl">
                  <Zap className="text-[#B45309]" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-ink-secondary tracking-wider">Energía</span>
                    <span className="text-xl font-extrabold text-ink-primary leading-none tabular-nums">{displayCard.energy_cost}</span>
                  </div>
                </div>
              )}
              {displayCard.attack !== undefined && displayCard.attack !== null && (() => {
                const colors = getPowerColorClasses(displayCard.element);
                return (
                  <div className="flex items-center gap-3 bg-app border border-line px-4 py-2.5 rounded-xl">
                    <div className="flex -space-x-2">
                      {colors.icons.length > 0 ? colors.icons.map((icon, idx) => (
                        <img key={idx} src={icon} alt="Domain Rune" className="w-5 h-5 object-contain relative" style={{ zIndex: colors.icons.length - idx }} onError={(e) => e.target.style.display = 'none'} />
                      )) : (
                        <Swords className="text-[#B91C1C]" size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-ink-secondary tracking-wider">Power</span>
                      <span className="text-xl font-extrabold text-ink-primary leading-none tabular-nums">{displayCard.attack}</span>
                    </div>
                  </div>
                );
              })()}
              {displayCard.health !== undefined && displayCard.health !== null && (
                <div className="flex items-center gap-3 bg-app border border-line px-4 py-2.5 rounded-xl">
                  <Shield className="text-ink-secondary" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-ink-secondary tracking-wider">Might</span>
                    <span className="text-xl font-extrabold text-ink-primary leading-none tabular-nums">{displayCard.health}</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Text Content */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8 bg-app rounded-xl border border-line border-dashed">
                <Loader2 className="animate-spin text-[#B45309]" size={24} />
                <span className="ml-3 text-ink-secondary text-sm">Cargando detalles...</span>
              </div>
            ) : displayCard.text_rich || displayCard.text_plain ? (
              <div className="bg-app border border-line rounded-xl p-5">
                <h4 className="text-[11px] font-bold text-ink-secondary uppercase tracking-widest mb-3">Efecto de carta</h4>
                {displayCard.text_rich ? (
                  <div className="text-ink-primary text-sm md:text-base leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatCardTextHTML(displayCard.text_rich) }}></div>
                ) : (
                  <div className="text-ink-primary text-sm md:text-base leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatCardTextHTML(displayCard.text_plain) }}></div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-app rounded-xl border border-line border-dashed">
                <span className="text-ink-muted italic text-sm">Sin texto disponible</span>
              </div>
            )}
          </div>

          {/* Mercado y Precios */}
          {(() => {
            const prices = richData?.prices;
            const cleanCardName = (displayCard.name || '')
              .replace(/\s*\([^)]*\)/g, '')
              .replace(/[-–,]/g, ' ')
              .trim();

            const cmBaseUrl = `https://www.cardmarket.com/en/Riftbound/Products/Search?searchString=${encodeURIComponent(cleanCardName)}&sortBy=price_asc`;
            const cmEnglishUrl = `https://www.cardmarket.com/en/Riftbound/Products/Search?searchString=${encodeURIComponent(cleanCardName)}&idLanguage=1&sortBy=price_asc`;
            const cmSpainUrl = `https://www.cardmarket.com/en/Riftbound/Products/Search?searchString=${encodeURIComponent(cleanCardName)}&idLanguage=1&sellerCountry=37&sortBy=price_asc`;
            const tcgUrl = richData?.purchase_uris?.tcgplayer;

            const toEur = (usd) => {
              if (usd === null || usd === undefined || isNaN(usd)) return null;
              return (usd * 0.92).toFixed(2);
            };

            return (
              <div className="bg-app border border-line rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 flex items-center justify-center text-[#15803D] dark:text-green-400">
                      <Tag size={15} />
                    </div>
                    <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">Mercado y Precios</h4>
                  </div>
                  {prices?.updated_at && (
                    <span className="text-[11px] text-ink-secondary font-medium">
                      Actualizado: {new Date(prices.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Prices Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Normal Finish */}
                  <div className="bg-surface border border-line rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-ink-primary">Versión Normal</span>
                      <span className="text-[10px] font-semibold text-ink-muted uppercase">TCG Market</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ink-secondary">Precio más bajo:</span>
                        <span className="text-sm font-bold text-ink-primary">
                          {prices?.normal?.low !== null && prices?.normal?.low !== undefined ? (
                            <span>${prices.normal.low.toFixed(2)} <span className="text-[11px] font-medium text-ink-secondary">({toEur(prices.normal.low)}€)</span></span>
                          ) : <span className="text-ink-muted font-normal text-xs">-</span>}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ink-secondary">Precio mercado:</span>
                        <span className="text-sm font-bold text-[#15803D] dark:text-green-400">
                          {prices?.normal?.market !== null && prices?.normal?.market !== undefined ? (
                            <span>${prices.normal.market.toFixed(2)} <span className="text-[11px] font-medium text-[#15803D]/80 dark:text-green-400/80">({toEur(prices.normal.market)}€)</span></span>
                          ) : <span className="text-ink-muted font-normal text-xs">-</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Foil Finish */}
                  <div className="bg-surface border border-[#FDE68A] dark:border-amber-700/60 rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#92400E] dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#B45309] dark:text-amber-400" /> Versión Foil
                      </span>
                      <span className="text-[10px] font-semibold text-[#B45309] dark:text-amber-400 uppercase">TCG Foil</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ink-secondary">Precio más bajo:</span>
                        <span className="text-sm font-bold text-ink-primary">
                          {prices?.foil?.low !== null && prices?.foil?.low !== undefined ? (
                            <span>${prices.foil.low.toFixed(2)} <span className="text-[11px] font-medium text-ink-secondary">({toEur(prices.foil.low)}€)</span></span>
                          ) : <span className="text-ink-muted font-normal text-xs">-</span>}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ink-secondary">Precio mercado:</span>
                        <span className="text-sm font-bold text-[#B45309] dark:text-amber-400">
                          {prices?.foil?.market !== null && prices?.foil?.market !== undefined ? (
                            <span>${prices.foil.market.toFixed(2)} <span className="text-[11px] font-medium text-[#B45309]/80 dark:text-amber-400/80">({toEur(prices.foil.market)}€)</span></span>
                          ) : <span className="text-ink-muted font-normal text-xs">-</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cardmarket & Purchase Links */}
                <div className="space-y-2.5 pt-2 border-t border-line">
                  <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
                    Explorar en Cardmarket (Europa)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href={cmBaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-[#1D4ED8] dark:text-blue-300 text-xs font-bold transition-colors"
                      title="Ver todas las ofertas en Cardmarket ordenadas por menor precio"
                    >
                      <ShoppingCart size={13} />
                      <span>Más bajo</span>
                      <ExternalLink size={11} className="opacity-60 ml-0.5" />
                    </a>

                    <a
                      href={cmEnglishUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-surface hover:bg-subtle border border-line text-ink-primary text-xs font-bold transition-colors"
                      title="Filtrar en Cardmarket por idioma Inglés al menor precio"
                    >
                      <span>🇬🇧 En Inglés</span>
                      <ExternalLink size={11} className="opacity-60 ml-0.5" />
                    </a>

                    <a
                      href={cmSpainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#FFFBEB] hover:bg-[#FEF3C7] dark:bg-amber-950/50 dark:hover:bg-amber-900/50 border border-[#FDE68A] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 text-xs font-bold transition-colors"
                      title="Filtrar en Cardmarket por vendedores en España en Inglés"
                    >
                      <span>🇪🇸 España (EN)</span>
                      <ExternalLink size={11} className="opacity-60 ml-0.5" />
                    </a>
                  </div>

                  {tcgUrl && (
                    <div className="pt-1 flex justify-end">
                      <a 
                        href={tcgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <span>Ver listado oficial en TCGplayer</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
