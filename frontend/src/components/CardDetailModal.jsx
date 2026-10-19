import React, { useEffect, useState } from 'react';
import { X, Shield, Swords, Zap, Loader2 } from 'lucide-react';

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

export default function CardDetailModal({ card, onClose }) {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
      <div 
        className="absolute inset-0 bg-dark-950/85 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl glass-panel border border-white/10 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col md:flex-row overflow-hidden max-h-[92vh] animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-dark-800/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 p-2.5 rounded-2xl backdrop-blur-lg border border-white/10 hover:border-red-500/30 transition-all duration-200 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Left side: Image */}
        <div className="w-full md:w-1/2 lg:w-5/12 bg-dark-950/80 p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.08] relative overflow-y-auto hidden-scrollbar">
           {/* Ambient background glow */}
           <div className="absolute inset-0 bg-primary-600/10 blur-3xl pointer-events-none rounded-full" />
           <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.8)] border border-white/10 group ${isBattlefield ? 'aspect-[88/63]' : 'aspect-[63/88]'}`}>
             {displayCard.image_url ? (
               <img src={displayCard.image_url} alt={displayCard.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             ) : (
               <div className="w-full h-full bg-dark-850 flex items-center justify-center text-slate-500 font-semibold text-sm">Sin Imagen</div>
             )}
           </div>
        </div>

        {/* Right side: Info */}
        <div className="w-full md:w-1/2 lg:w-7/12 p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">{displayCard.name}</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3.5">
              {displayCard.card_type && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-dark-800/90 border border-white/[0.08] text-xs font-bold uppercase tracking-wider text-slate-200 shadow-sm">
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
                const colors = getPowerColorClasses(domain);
                return (
                  <span key={domain} className={`flex items-center gap-1.5 px-3 py-1 rounded-xl ${colors.bg} border ${colors.border} text-xs font-bold uppercase tracking-wider ${colors.text} shadow-sm`}>
                    <img src={`https://cdn.piltoverarchive.com/colors/${dNorm}.webp`} alt={domain} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    {domain}
                  </span>
                );
              })}
              {displayCard.rarity && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs font-bold uppercase tracking-wider text-purple-300 shadow-sm">
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
                <span className="px-3 py-1 rounded-xl bg-dark-800/90 border border-white/[0.08] text-xs font-bold uppercase tracking-wider text-slate-300 shadow-sm">
                  {displayCard.set_name}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/[0.08] w-full my-0.5" />

          {/* Attributes */}
          {(displayCard.energy_cost !== undefined && displayCard.energy_cost !== null) || (displayCard.attack !== undefined && displayCard.attack !== null) || (displayCard.health !== undefined && displayCard.health !== null) ? (
            <div className="flex flex-wrap gap-3.5">
              {displayCard.energy_cost !== undefined && displayCard.energy_cost !== null && (() => {
                const colors = getPowerColorClasses(displayCard.element);
                return (
                  <div className={`flex items-center gap-3 ${colors.bg} border ${colors.border} px-4 py-2.5 rounded-2xl shadow-sm`}>
                    <Zap className="text-white" size={22} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase text-white/70 tracking-wider">Energía</span>
                      <span className="text-2xl font-black text-white leading-none tabular-nums">{displayCard.energy_cost}</span>
                    </div>
                  </div>
                );
              })()}
              {displayCard.attack !== undefined && displayCard.attack !== null && (() => {
                const colors = getPowerColorClasses(displayCard.element);
                return (
                  <div className={`flex items-center gap-3 ${colors.bg} border ${colors.border} px-4 py-2.5 rounded-2xl shadow-sm`}>
                    <div className="flex -space-x-2">
                      {colors.icons.length > 0 ? colors.icons.map((icon, idx) => (
                        <img key={idx} src={icon} alt="Domain Rune" className="w-5 h-5 object-contain drop-shadow-md relative" style={{ zIndex: colors.icons.length - idx }} onError={(e) => e.target.style.display = 'none'} />
                      )) : (
                        <Swords className="text-red-400" size={22} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-extrabold uppercase ${colors.textLight} tracking-wider`}>Power</span>
                      <span className={`text-2xl font-black ${colors.textBold} leading-none tabular-nums`}>{displayCard.attack}</span>
                    </div>
                  </div>
                );
              })()}
              {displayCard.health !== undefined && displayCard.health !== null && (
                <div className="flex items-center gap-3 bg-slate-500/10 border border-slate-500/25 px-4 py-2.5 rounded-2xl shadow-sm">
                  <Shield className="text-slate-300" size={22} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Might</span>
                    <span className="text-2xl font-black text-white leading-none tabular-nums">{displayCard.health}</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Text Content */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8 bg-dark-950/30 rounded-xl border border-dark-800 border-dashed">
                <Loader2 className="animate-spin text-primary-500" size={24} />
                <span className="ml-3 text-slate-400 text-sm">Loading card details...</span>
              </div>
            ) : displayCard.text_rich || displayCard.text_plain ? (
              <div className="bg-dark-950/50 border border-dark-800/50 rounded-xl p-5 shadow-inner">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Card Effect</h4>
                {displayCard.text_rich ? (
                  <div className="text-slate-200 text-sm md:text-base leading-relaxed prose prose-invert prose-p:my-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatCardTextHTML(displayCard.text_rich) }}></div>
                ) : (
                  <div className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatCardTextHTML(displayCard.text_plain) }}></div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-dark-950/30 rounded-xl border border-dark-800 border-dashed">
                <span className="text-slate-500 italic text-sm">No card text available</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
