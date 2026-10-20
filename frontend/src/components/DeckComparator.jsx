import React, { useState, useMemo } from 'react';
import { ChevronLeft, Layers, GitCompare, List, LayoutGrid } from 'lucide-react';
import { showHoverCard, hideHoverCard } from './DeckManager';

export default function DeckComparator({ deck1Id, deck2Id, API_URL, collection, onBack, onCreateMergedDeck }) {
  const [deck1, setDeck1] = useState(null);
  const [deck2, setDeck2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedExtras, setSelectedExtras] = useState({});

  React.useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const [res1, res2] = await Promise.all([
          fetch(`${API_URL}/decks/${deck1Id}`),
          fetch(`${API_URL}/decks/${deck2Id}`)
        ]);
        const data1 = await res1.json();
        const data2 = await res2.json();
        setDeck1(data1);
        setDeck2(data2);
      } catch (err) {
        console.error('Error fetching decks for comparison:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [deck1Id, deck2Id, API_URL]);

  const sections = ['legend', 'champion', 'rune', 'battlefield', 'main', 'sideboard'];

  const comparisonData = useMemo(() => {
    if (!deck1 || !deck2) return null;
    const data = {};
    sections.forEach(section => {
      const s1 = deck1.cards.filter(c => c.section === section);
      const s2 = deck2.cards.filter(c => c.section === section);

      const allCardIds = new Set([...s1.map(c => c.card_id), ...s2.map(c => c.card_id)]);
      
      const unique1 = [];
      const shared = [];
      const unique2 = [];

      allCardIds.forEach(id => {
        const c1 = s1.find(c => c.card_id === id);
        const c2 = s2.find(c => c.card_id === id);
        
        const q1 = c1 ? c1.quantity : 0;
        const q2 = c2 ? c2.quantity : 0;
        
        const cardData = c1 || c2; 

        if (q1 > 0 && q2 > 0) {
          const minQ = Math.min(q1, q2);
          shared.push({ ...cardData, quantity: minQ });
          
          if (q1 > q2) {
            unique1.push({ ...cardData, quantity: q1 - q2 });
          } else if (q2 > q1) {
            unique2.push({ ...cardData, quantity: q2 - q1 });
          }
        } else if (q1 > 0) {
          unique1.push({ ...cardData, quantity: q1 });
        } else if (q2 > 0) {
          unique2.push({ ...cardData, quantity: q2 });
        }
      });

      data[section] = { unique1, shared, unique2 };
    });
    return data;
  }, [deck1, deck2]);

  const handleCreateDeck = () => {
    let allMerged = [];
    sections.forEach(sec => {
      const cards = getMergedCardsForSection(sec);
      cards.forEach(c => {
        allMerged.push({ ...c, section: sec });
      });
    });
    if (onCreateMergedDeck) onCreateMergedDeck(allMerged);
  };

  if (loading || !comparisonData) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-dark-900 justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <p className="text-slate-400 mt-4 font-bold animate-pulse">Loading decks for comparison...</p>
      </div>
    );
  }

  const toggleExtra = (card, section, maxQty) => {
     const key = `${card.card_id}_${section}`;
     setSelectedExtras(prev => {
        const current = prev[key] || 0;
        const next = current === maxQty ? 0 : current + 1;
        if (next === 0) {
           const { [key]: _, ...rest } = prev;
           return rest;
        }
        return { ...prev, [key]: next };
     });
  };

  const getMergedCardsForSection = (sectionName) => {
    const { shared, unique1, unique2 } = comparisonData[sectionName];
    const map = new Map();
    
    shared.forEach(c => {
       map.set(c.card_id, { ...c, quantity: c.quantity });
    });

    const addUnique = (uniqueCards) => {
       uniqueCards.forEach(c => {
          const key = `${c.card_id}_${sectionName}`;
          const selectedQty = selectedExtras[key] || 0;
          if (selectedQty > 0) {
             if (map.has(c.card_id)) {
                map.get(c.card_id).quantity += selectedQty;
             } else {
                map.set(c.card_id, { ...c, quantity: selectedQty });
             }
          }
       });
    };

    addUnique(unique1);
    addUnique(unique2);

    return Array.from(map.values()).sort((a,b) => (a.energy_cost || 0) - (b.energy_cost || 0));
  };

  const getDomainBorderGradient = (domainString) => {
    if (!domainString) return 'bg-dark-700';
    const domains = domainString.split(',').map(d => d.trim().toLowerCase());
    const gradientMap = {
      mind: { single: 'bg-blue-500', from: 'from-blue-500', to: 'to-blue-500' },
      order: { single: 'bg-yellow-400', from: 'from-yellow-400', to: 'to-yellow-400' },
      body: { single: 'bg-orange-500', from: 'from-orange-500', to: 'to-orange-500' },
      chaos: { single: 'bg-purple-500', from: 'from-purple-500', to: 'to-purple-500' },
      fury: { single: 'bg-red-500', from: 'from-red-500', to: 'to-red-500' },
      calm: { single: 'bg-green-500', from: 'from-green-500', to: 'to-green-500' },
      life: { single: 'bg-green-500', from: 'from-green-500', to: 'to-green-500' },
      death: { single: 'bg-purple-500', from: 'from-purple-500', to: 'to-purple-500' },
      elemental: { single: 'bg-orange-500', from: 'from-orange-500', to: 'to-orange-500' }
    };
    const d1 = gradientMap[domains[0]] || { single: 'bg-dark-700', from: 'from-dark-700', to: 'to-dark-700' };
    if (domains.length > 1) {
       const d2 = gradientMap[domains[1]] || { single: 'bg-dark-700', from: 'from-dark-700', to: 'to-dark-700' };
       return `bg-gradient-to-br ${d1.from} from-50% ${d2.to} to-50%`;
    }
    return d1.single;
  };

  const renderCardRowReadOnly = (c, colorClass = "text-primary-400 border-dark-600", isInteractive = false, selectedQty = 0, availableQty = 0, onClick = null) => {
    const gradientClass = getDomainBorderGradient(c.element);
    const isFullySelected = isInteractive && selectedQty > 0 && selectedQty === availableQty;
    const isPartiallySelected = isInteractive && selectedQty > 0 && selectedQty < availableQty;
    
    return (
      <div 
        key={c.card_id + c.section} 
        onClick={onClick}
        className={`relative group h-[56px] rounded-[13px] p-[2px] ${gradientClass} shadow-md mb-2 ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 ${isFullySelected ? 'grayscale opacity-50 scale-[0.98] hover:scale-[1.01] hover:opacity-80' : 'hover:scale-[1.02] hover:z-10'}`} 
        onMouseEnter={(e) => showHoverCard(c, e)}
        onMouseLeave={() => hideHoverCard()}
      >
        <div className={`w-full h-full relative rounded-[11px] bg-dark-800 overflow-hidden`}>
          <div className="absolute inset-0">
             {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover object-[center_30%] opacity-100 group-hover:scale-110 group-hover:brightness-110 transition-all duration-300" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/40 to-transparent group-hover:from-dark-900/70 group-hover:via-transparent flex items-center justify-between p-2 pointer-events-none transition-all">
            <div className="flex items-center gap-3">
               <div className={`px-1 min-w-[24px] h-6 rounded border flex items-center justify-center bg-dark-950/80 backdrop-blur-sm font-bold text-[10px] shadow-inner pointer-events-auto transition-all ${colorClass}`}>
                 <span>x{isInteractive ? availableQty : c.quantity}</span>
               </div>
               {c.section !== 'rune' && <span className="text-sm font-bold text-white drop-shadow-md truncate max-w-[180px]">{c.name}</span>}
            </div>
            
            <div className="flex items-center gap-2">
              {isPartiallySelected && (
                 <div className="text-[10px] uppercase font-bold text-green-400 bg-green-950/90 px-2 py-0.5 rounded shadow-sm border border-green-500/30">
                   {selectedQty}/{availableQty}
                 </div>
              )}
              {isFullySelected && (
                 <div className="text-[10px] uppercase font-bold text-slate-300 bg-dark-950/90 px-2 py-0.5 rounded shadow-sm border border-slate-700">
                   Selected
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewCard = (c, colorClass, isBattlefield, isInteractive = false, selectedQty = 0, availableQty = 0, onClick = null) => {
    const aspect = isBattlefield ? 'aspect-[88/63]' : 'aspect-[63/88]';
    const borderColor = colorClass.includes('red') ? 'border-red-500/50' : colorClass.includes('blue') ? 'border-blue-500/50' : 'border-primary-500/50';
    const textColor = colorClass.includes('red') ? 'text-red-400' : colorClass.includes('blue') ? 'text-blue-400' : 'text-primary-400';
    
    const isFullySelected = isInteractive && selectedQty > 0 && selectedQty === availableQty;
    const isPartiallySelected = isInteractive && selectedQty > 0 && selectedQty < availableQty;

    return (
      <div 
        key={c.card_id + c.section} 
        onClick={onClick}
        className={`relative group ${aspect} rounded-xl overflow-hidden shadow-md border ${borderColor} ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 ${isFullySelected ? 'grayscale opacity-60 scale-[0.98] hover:opacity-100 hover:scale-[1.02]' : 'hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:z-10'} bg-dark-800`}
        onMouseEnter={(e) => showHoverCard(c, e)}
        onMouseLeave={() => hideHoverCard()}
      >
         {c.image_url && <img src={c.image_url} alt={c.name} className={`w-full h-full object-cover ${isBattlefield ? 'object-center' : 'object-top'} transition-all`} />}
         
         <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black to-transparent text-center pointer-events-none">
            <span className={`inline-flex items-center justify-center font-bold ${textColor} bg-black/80 px-2 min-w-[28px] h-5 rounded-full text-[11px] pointer-events-auto transition-all`}>
               <span className="tracking-tighter">x{isInteractive ? availableQty : c.quantity}</span>
            </span>
         </div>
         
         {isPartiallySelected && (
            <div className="absolute top-1 right-1 bg-green-900/90 text-green-400 border border-green-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm z-10">
              {selectedQty}/{availableQty}
            </div>
         )}
         {isFullySelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 transition-colors group-hover:bg-black/10">
               <span className="bg-dark-900/95 border border-dark-600 text-slate-300 text-[10px] uppercase font-bold px-3 py-1 rounded-lg shadow-2xl backdrop-blur-md">Selected</span>
            </div>
         )}
      </div>
    );
  };

  const renderSection = (sectionName) => {
    const { unique1, shared, unique2 } = comparisonData[sectionName];
    
    if (unique1.length === 0 && shared.length === 0 && unique2.length === 0) return null;

    return (
      <div key={sectionName} className="mb-6">
        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 border-b border-dark-700 pb-2 flex gap-2 items-center">
          {sectionName === 'main' ? 'Main Deck' : sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
        </h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Deck 1 Unique */}
          <div className="bg-dark-900/50 p-3 rounded-xl border border-red-500/20">
             <h4 className="text-xs uppercase font-bold text-red-400 mb-3 flex justify-between">
                <span>Unique to {deck1.name}</span>
                <span>{unique1.reduce((a,c) => a + c.quantity, 0)}</span>
             </h4>
             {viewMode === 'list' ? (
               <div className="space-y-1">
                 {unique1.map(c => {
                   const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
                   return renderCardRowReadOnly(c, "text-red-400 border-red-500/50", true, selQty, c.quantity, () => toggleExtra(c, sectionName, c.quantity));
                 })}
               </div>
             ) : (
               <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                 {unique1.map(c => {
                   const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
                   return renderPreviewCard(c, "text-red-400 border-red-500/50", sectionName === 'battlefield', true, selQty, c.quantity, () => toggleExtra(c, sectionName, c.quantity));
                 })}
               </div>
             )}
          </div>

          {/* Shared */}
          <div className="bg-dark-900/50 p-3 rounded-xl border border-primary-500/20">
             <h4 className="text-xs uppercase font-bold text-primary-400 mb-3 flex justify-between">
                <span>Shared (Auto-included)</span>
                <span>{shared.reduce((a,c) => a + c.quantity, 0)}</span>
             </h4>
             {viewMode === 'list' ? (
               <div className="space-y-1">
                 {shared.map(c => renderCardRowReadOnly(c, "text-primary-400 border-primary-500/50", false))}
               </div>
             ) : (
               <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                 {shared.map(c => renderPreviewCard(c, "text-primary-400 border-primary-500/50", sectionName === 'battlefield', false))}
               </div>
             )}
          </div>

          {/* Deck 2 Unique */}
          <div className="bg-dark-900/50 p-3 rounded-xl border border-blue-500/20">
             <h4 className="text-xs uppercase font-bold text-blue-400 mb-3 flex justify-between">
                <span>Unique to {deck2.name}</span>
                <span>{unique2.reduce((a,c) => a + c.quantity, 0)}</span>
             </h4>
             {viewMode === 'list' ? (
               <div className="space-y-1">
                 {unique2.map(c => {
                   const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
                   return renderCardRowReadOnly(c, "text-blue-400 border-blue-500/50", true, selQty, c.quantity, () => toggleExtra(c, sectionName, c.quantity));
                 })}
               </div>
             ) : (
               <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                 {unique2.map(c => {
                   const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
                   return renderPreviewCard(c, "text-blue-400 border-blue-500/50", sectionName === 'battlefield', true, selQty, c.quantity, () => toggleExtra(c, sectionName, c.quantity));
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-dark-950 overflow-hidden">
      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-dark-700/50 p-4 flex flex-col xl:flex-row justify-between items-center bg-dark-900/90 backdrop-blur-xl shadow-xl gap-4">
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <button onClick={onBack} className="p-2 hover:bg-dark-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-white drop-shadow-sm flex items-center gap-2">
                <GitCompare size={24} className="text-primary-500" /> Deck Comparison
              </h2>
            </div>
          </div>
          
          <div className="flex items-center w-full xl:w-auto gap-4 flex-1 max-w-3xl justify-center">
             <div className="flex-1 text-center bg-red-950/30 border border-red-500/30 py-2 px-4 rounded-xl">
               <span className="text-xs uppercase font-bold text-red-500 block mb-1">Deck 1</span>
               <span className="text-sm font-black text-white truncate block">{deck1.name}</span>
             </div>
             
             <div className="flex flex-col items-center gap-2">
               <div className="text-slate-500 font-bold">VS</div>
               <div className="flex items-center gap-1 bg-dark-800 p-1 rounded-lg border border-dark-700">
                 <button 
                   onClick={() => setViewMode('list')} 
                   className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'}`}
                   title="List View"
                 >
                   <List size={16} />
                 </button>
                 <button 
                   onClick={() => setViewMode('visual')} 
                   className={`p-1.5 rounded-md transition-colors ${viewMode === 'visual' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'}`}
                   title="Visual View"
                 >
                   <LayoutGrid size={16} />
                 </button>
               </div>
             </div>
  
             <div className="flex-1 text-center bg-blue-950/30 border border-blue-500/30 py-2 px-4 rounded-xl">
               <span className="text-xs uppercase font-bold text-blue-500 block mb-1">Deck 2</span>
               <span className="text-sm font-black text-white truncate block">{deck2.name}</span>
             </div>
          </div>
        </header>
  
        {/* Content */}
        <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-2 pb-12">
          {sections.map(sec => renderSection(sec))}
        </div>
      </div>
      
      {/* Right Sidebar: Merged Deck */}
      <div className="w-full lg:w-[24rem] flex flex-col bg-dark-950 border-t lg:border-t-0 lg:border-l border-dark-700/50 relative z-20 shadow-2xl h-[50vh] lg:h-full shrink-0">
        <div className="p-5 border-b border-dark-700 bg-dark-900">
           <h2 className="text-lg font-black text-white flex items-center gap-2">
             <Layers size={18} className="text-primary-500" /> Merged Deck
           </h2>
           <p className="text-xs text-slate-400 mt-1 leading-relaxed">
             Click unique cards in the comparison to fill the remaining slots with your preferred choices.
           </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
           {sections.map(sec => {
              const cards = getMergedCardsForSection(sec);
              if (cards.length === 0 && sec !== 'main' && sec !== 'legend' && sec !== 'champion') return null;
              
              const total = cards.reduce((a,c) => a + c.quantity, 0);
              const max = sec === 'legend' || sec === 'champion' ? 1 : sec === 'rune' ? 12 : sec === 'battlefield' ? 3 : sec === 'main' ? 39 : 10;
              
              return (
                <div key={sec} className="bg-dark-900/50 p-3 rounded-xl border border-dark-800/50 shadow-inner">
                  <h4 className="text-[10px] uppercase font-bold mb-3 flex justify-between p-1 -mx-1 text-slate-500 border-b border-dark-800 pb-2">
                    <span className="flex items-center gap-2 tracking-wider">
                      {sec === 'main' ? 'Main Deck' : sec.charAt(0).toUpperCase() + sec.slice(1)}
                    </span>
                    <span className={total > max ? 'text-red-400' : total === max ? 'text-green-400' : 'text-primary-400'}>{total}/{max}</span>
                  </h4>
                  <div className="space-y-1">
                    {cards.map(c => renderCardRowReadOnly(c, "text-primary-400 border-dark-600", false))}
                  </div>
                </div>
              );
           })}
        </div>
        <div className="p-4 border-t border-dark-700 bg-dark-900">
          <button 
             onClick={handleCreateDeck}
             className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
             <GitCompare size={18} /> Create Merged Deck
          </button>
        </div>
      </div>
    </div>
  );
}
