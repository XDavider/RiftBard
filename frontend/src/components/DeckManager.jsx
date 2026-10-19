import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Layers, Plus, Trash2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Edit2, X, Download, Upload, Heart,
  LayoutGrid, List, SlidersHorizontal, BarChart2, Search, Flame, Sparkles, Copy, Check
} from 'lucide-react';
import Card from './Card';
import ImportExportModal from './ImportExportModal';
import DeckComparator from './DeckComparator';

import { showHoverCard, hideHoverCard, showHoverDeck, hideHoverDeck } from '../utils/hoverEvents';
export { showHoverCard, hideHoverCard, showHoverDeck, hideHoverDeck };


const HoverCardPreviewSingleton = () => {
   const [card, setCard] = useState(null);
   const domRef = useRef(null);

   useEffect(() => {
     const show = (e) => {
       const newCard = e.detail.card;
       setCard(newCard);
       const ev = e.detail.mouseEvent;
       if (newCard && ev && domRef.current) {
         const isBattlefield = newCard?.card_type?.toLowerCase() === 'battlefield';
         const cardWidth = isBattlefield ? 384 : 280;
         const cardHeight = isBattlefield ? 275 : 391;
         
         const isRightHalf = ev.clientX > window.innerWidth / 2;
         const isBottomHalf = ev.clientY > window.innerHeight / 2;

         let x = isRightHalf ? ev.clientX - cardWidth - 20 : ev.clientX + 20;
         let y = isBottomHalf ? ev.clientY - cardHeight - 20 : ev.clientY + 20;
         
         if (x + cardWidth > window.innerWidth - 10) x = window.innerWidth - cardWidth - 10;
         if (x < 10) x = 10;
         if (y + cardHeight > window.innerHeight - 10) y = window.innerHeight - cardHeight - 10;
         if (y < 10) y = 10;
         
         domRef.current.style.left = `${x}px`;
         domRef.current.style.top = `${y}px`;
       }
     };

     const hide = () => setCard(null);

     window.addEventListener('show-hover-card', show);
     window.addEventListener('hide-hover-card', hide);
     return () => {
        window.removeEventListener('show-hover-card', show);
        window.removeEventListener('hide-hover-card', hide);
     };
   }, []);

   useEffect(() => {
     const handleMouseMove = (e) => {
       if (card && domRef.current) {
         const isBattlefield = card?.card_type?.toLowerCase() === 'battlefield';
         const cardWidth = isBattlefield ? 384 : 280;
         const cardHeight = isBattlefield ? 275 : 391;
         
         const isRightHalf = e.clientX > window.innerWidth / 2;
         const isBottomHalf = e.clientY > window.innerHeight / 2;

         let x = isRightHalf ? e.clientX - cardWidth - 20 : e.clientX + 20;
         let y = isBottomHalf ? e.clientY - cardHeight - 20 : e.clientY + 20;
         
         if (x + cardWidth > window.innerWidth - 10) x = window.innerWidth - cardWidth - 10;
         if (x < 10) x = 10;
         if (y + cardHeight > window.innerHeight - 10) y = window.innerHeight - cardHeight - 10;
         if (y < 10) y = 10;
         
         domRef.current.style.left = `${x}px`;
         domRef.current.style.top = `${y}px`;
       }
     };
     if (card) window.addEventListener('mousemove', handleMouseMove);
     return () => window.removeEventListener('mousemove', handleMouseMove);
   }, [card]);

   if (!card) return null;

   return (
      <div 
        ref={domRef}
        className={`hidden lg:block fixed z-[100] pointer-events-none ${card.card_type?.toLowerCase() === 'battlefield' ? 'w-[384px]' : 'w-[280px]'}`}
      >
         <div className={`animate-card-pop relative rounded-xl overflow-hidden shadow-2xl border border-dark-600 shadow-black/50 ${card.card_type?.toLowerCase() === 'battlefield' ? 'aspect-[88/63]' : 'aspect-[63/88]'}`}>
           <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
         </div>
      </div>
   );
};

const HoverDeckPreviewSingleton = () => {
   const [visible, setVisible] = useState(false);
   const [deck, setDeck] = useState(null);
   const [rect, setRect] = useState(null);
   const scrollRef = useRef(null);

   useEffect(() => {
     const show = (e) => {
        const newDeck = e.detail.deck;
        const el = e.detail.domElement;
        if (newDeck && el) {
          setDeck(newDeck);
          setRect(el.getBoundingClientRect());
          setVisible(true);
        }
     };

     const hide = () => setVisible(false);

     window.addEventListener('show-hover-deck', show);
     window.addEventListener('hide-hover-deck', hide);
     return () => {
        window.removeEventListener('show-hover-deck', show);
        window.removeEventListener('hide-hover-deck', hide);
     };
   }, []);

   useEffect(() => {
     if (!visible || !scrollRef.current) return;
     
     const handleGlobalWheel = (e) => {
       e.preventDefault();
       scrollRef.current.scrollTop += e.deltaY;
     };

     window.addEventListener('wheel', handleGlobalWheel, { passive: false });
     return () => window.removeEventListener('wheel', handleGlobalWheel);
   }, [visible]);

   if (!deck || !rect) return null;

   const previewWidth = 480;
   let x = rect.right + 20;
   let y = rect.top;

   let isRight = true;
   if (x + previewWidth > window.innerWidth - 10) {
      x = rect.left - previewWidth - 20;
      isRight = false;
   }
   if (y + rect.height > window.innerHeight - 10) {
      y = window.innerHeight - rect.height - 10;
   }
   if (y < 10) y = 10;

   const arrowClass = isRight 
      ? "before:-left-[7px] before:top-10 before:border-l before:border-b" 
      : "before:-right-[7px] before:top-10 before:border-r before:border-t";

   return (
      <div 
        className={`hidden lg:block fixed z-[100] pointer-events-none transition-all duration-300 origin-center ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ left: x, top: y, width: previewWidth, height: rect.height }}
      >
         <div className={`h-full bg-dark-900 border border-primary-500/50 shadow-2xl rounded-2xl p-5 shadow-black/80 flex flex-col gap-4 relative overflow-hidden before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-dark-900 before:border-primary-500/50 before:rotate-45 ${arrowClass}`}>
            {deck.legend_image && <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${deck.legend_image})` }} />}
            <div className="relative z-10 flex items-start justify-between border-b border-dark-700/50 pb-3">
               <div className="flex gap-2">
                  {deck.battlefields && deck.battlefields.length > 0 ? (
                     deck.battlefields.map((c, idx) => (
                        <div key={idx} className="relative">
                           <img src={c.image_url} alt="Battlefield" className="w-24 aspect-[88/63] rounded-lg border border-dark-600 shadow-md object-cover relative z-10" />
                           {c.quantity > 1 && (
                              <div className="absolute -bottom-2 -right-1 z-20 bg-dark-900 border border-primary-500 rounded px-1.5 py-0.5 text-[10px] font-black text-white shadow-lg">
                                x{c.quantity}
                              </div>
                           )}
                        </div>
                     ))
                  ) : (
                     <span className="text-sm font-bold text-slate-500 italic flex items-center h-full">No Battlefields</span>
                  )}
               </div>
               {deck.rune_counts && (
                  <div className="flex gap-1 flex-wrap justify-end pl-4">
                     {Object.entries(deck.rune_counts).map(([domain, count]) => {
                        const dNorm = domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
                        return (
                           <div key={domain} className="flex items-center gap-1.5 bg-dark-950 px-2 py-1 rounded-lg border border-dark-700 shadow-inner">
                              <img src={`https://cdn.piltoverarchive.com/colors/${dNorm}.webp`} alt={domain} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                              <span className="text-sm font-black text-white">{count}</span>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar pointer-events-auto">
               {(deck.card_list || []).map((card, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-dark-950/70 border border-white/[0.04] hover:bg-dark-800/60 transition-colors">
                     <div className="flex items-center gap-2 min-w-0">
                       {card.energy_cost !== undefined && card.energy_cost !== null && (
                         <span className="w-4 h-4 rounded-full bg-dark-900 border border-white/20 text-[9px] font-black text-white flex items-center justify-center shrink-0">
                           {card.energy_cost}
                         </span>
                       )}
                       <span className="font-bold text-slate-200 truncate">{card.name}</span>
                       <span className="text-[9px] text-slate-500 uppercase shrink-0 font-medium">{card.card_type}</span>
                     </div>
                     <span className="font-black text-primary-400 shrink-0 bg-primary-950/80 border border-primary-500/30 px-1.5 py-0.5 rounded text-[10px]">x{card.quantity}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default function DeckManager({
  cards, collection, API_URL, columns, setColumns, setType, setDomain, setSearch, onClickCard, onEditDeck, onPreviewDeck, 
  deckSearch, setDeckSearch, deckDomain, deckLegend,
  groupedCards, groupBy, displayedCards, visibleCount, setVisibleCount
}) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDeck, setCurrentDeck] = useState(null); 
  const [previewDeck, setPreviewDeck] = useState(null); 
  const [previewData, setPreviewData] = useState(null);

  // Deck builder state
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [deckCards, setDeckCards] = useState([]);
  const [targetSection, setTargetSection] = useState(null);
  
  // UI States
  const [sidebarTab, setSidebarTab] = useState('deck'); 
  const [previewSidebarTab, setPreviewSidebarTab] = useState('deck'); 
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importExportInitialMode, setImportExportInitialMode] = useState('import');
  const [deckToDelete, setDeckToDelete] = useState(null);

  // Mobile navigation tabs inside preview and editor
  const [mobilePreviewTab, setMobilePreviewTab] = useState('visual'); 
  const [mobileEditorTab, setMobileEditorTab] = useState('catalog'); 
  const [mainFilterCategory, setMainFilterCategory] = useState('all');

  // Deck comparison
  const [isComparing, setIsComparing] = useState(false);
  const [decksToCompare, setDecksToCompare] = useState([]);
  const [dropTargetDeckId, setDropTargetDeckId] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Mobile Quick Preview (Long-Press)
  const [mobileQuickDeck, setMobileQuickDeck] = useState(null);
  const touchTimerRef = useRef(null);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    if (onEditDeck) onEditDeck(currentDeck !== null);
  }, [currentDeck, onEditDeck]);

  useEffect(() => {
    if (onPreviewDeck) onPreviewDeck(previewDeck !== null);
  }, [previewDeck, onPreviewDeck]);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/decks`);
      if (!res.ok) throw new Error('Error al cargar mazos');
      const data = await res.json();
      setDecks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeckDetails = async (id) => {
    try {
      const res = await fetch(`${API_URL}/decks/${id}`);
      if (!res.ok) throw new Error('Error al cargar mazo');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const openPreview = async (id) => {
    setLoading(true);
    const data = await fetchDeckDetails(id);
    if (data) {
      setPreviewData(data);
      setPreviewDeck(id);
      setMobilePreviewTab('visual');
      setPreviewSidebarTab('deck');
      setMainFilterCategory('all');
    }
    setLoading(false);
  };

  const loadDeckForEdit = async (id, existingData = null) => {
    setLoading(true);
    const data = existingData || await fetchDeckDetails(id);
    if (data) {
      setCurrentDeck(data.id);
      setDeckName(data.name || '');
      setDeckDescription(data.description || '');
      
      const mappedCards = (data.cards || []).map(c => ({
        card: { ...c, id: c.card_id },
        section: c.section,
        quantity: c.quantity
      }));
      setDeckCards(mappedCards);
      setPreviewDeck(null);
      setMobileEditorTab('catalog');
      setSidebarTab('deck');
      setTargetSection(null);
    }
    setLoading(false);
  };

  const saveDeck = async () => {
    try {
      const legend = deckCards.find(c => c.section === 'legend')?.card;
      const champion = deckCards.find(c => c.section === 'champion')?.card;
      
      let finalName = deckName.trim();
      if (!finalName) {
        finalName = legend ? `${legend.name.split(/[-–,]/)[0].trim()} Deck` : 'Nuevo Mazo';
      }
      
      const payload = {
        id: currentDeck === 'new' ? undefined : currentDeck,
        name: finalName,
        description: deckDescription,
        legend_id: legend?.id || null,
        champion_id: champion?.id || null,
        cards: deckCards.map(c => ({
          card_id: c.card.id,
          section: c.section,
          quantity: c.quantity
        }))
      };

      const res = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentDeck(null);
        setPreviewDeck(null);
        setShowSaveModal(false);
        fetchDecks();
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar el mazo');
    }
  };

  const deleteDeck = (id) => {
    setDeckToDelete(id);
  };

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return;
    try {
      await fetch(`${API_URL}/decks/${deckToDelete}`, { method: 'DELETE' });
      if (previewDeck === deckToDelete) {
        setPreviewDeck(null);
        setPreviewData(null);
      }
      setDeckToDelete(null);
      fetchDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavoriteDeck = async (id, currentFavorite) => {
    try {
      setDecks(prev => prev.map(d => d.id === id ? { ...d, favorite: !currentFavorite } : d).sort((a, b) => {
        if (a.id === id) a = { ...a, favorite: !currentFavorite };
        if (b.id === id) b = { ...b, favorite: !currentFavorite };
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return (a.position || 0) - (b.position || 0);
      }));

      await fetch(`${API_URL}/decks/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !currentFavorite })
      });
      fetchDecks();
    } catch (err) {
      console.error(err);
      fetchDecks();
    }
  };

  const startNewDeck = () => {
    setPreviewDeck(null);
    setPreviewData(null);
    setCurrentDeck('new');
    setDeckName('');
    setDeckDescription('');
    setDeckCards([]);
    setTargetSection(null);
    setMobileEditorTab('catalog');
  };

  // Deck Builder Card Mutation
  const addCardToDeck = (card) => {
    let section = targetSection;
    if (!section) {
      const type = card.card_type?.toLowerCase();
      if (type === 'legend') section = 'legend';
      else if (type === 'rune') section = 'rune';
      else if (type === 'battlefield') section = 'battlefield';
      else section = 'main';
    }

    setDeckCards(prev => {
      const isRune = card.card_type?.toLowerCase() === 'rune';
      const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';
      const isLegend = card.card_type?.toLowerCase() === 'legend';
      
      const totalCopiesInDeck = prev
        .filter(c => c.card.id === card.id)
        .reduce((sum, c) => sum + c.quantity, 0);

      const existing = prev.find(c => c.card.id === card.id && c.section === section);

      if (section === 'legend') {
        if (!isLegend) {
          alert('Solo cartas tipo Leyenda pueden ir aquí.');
          return prev;
        }
        return prev.filter(c => c.section !== 'legend').concat({ card, section: 'legend', quantity: 1 });
      }

      if (section === 'champion') {
        if (card.card_type?.toLowerCase() !== 'unit') {
          alert('Solo cartas tipo Unidad pueden ser Campeón.');
          return prev;
        }
        if (totalCopiesInDeck >= 3) {
          alert('Máximo 3 copias de esta carta en todo el mazo.');
          return prev;
        }
        return prev.filter(c => c.section !== 'champion').concat({ card, section, quantity: 1 });
      }
      
      let maxCopies = 3;
      if (isRune) maxCopies = 12;
      if (isBattlefield) maxCopies = 1; 
      
      const sectionTotal = prev.filter(c => c.section === section).reduce((sum, c) => sum + c.quantity, 0);
      
      if (existing) {
        if (totalCopiesInDeck >= maxCopies) return prev;
        if (section === 'main' && sectionTotal >= 39) return prev;
        if (section === 'rune' && sectionTotal >= 12) return prev;
        if (section === 'battlefield' && sectionTotal >= 3) return prev;
        if (section === 'sideboard' && sectionTotal >= 10) return prev;
        
        return prev.map(c => c === existing ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        if (totalCopiesInDeck >= maxCopies) return prev;
        if (section === 'main' && sectionTotal >= 39) return prev;
        if (section === 'rune' && sectionTotal >= 12) return prev;
        if (section === 'battlefield' && sectionTotal >= 3) return prev;
        if (section === 'sideboard' && sectionTotal >= 10) return prev;
      }
      
      return [...prev, { card, section, quantity: 1 }];
    });
  };

  const removeCardFromDeck = (cardId, section) => {
    setDeckCards(prev => {
      const existing = prev.find(c => c.card.id === cardId && c.section === section);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(c => c === existing ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c !== existing);
    });
  };

  const copyDecklistToClipboard = (deck) => {
    if (!deck) return;
    const cards = deck.cards || [];
    const lines = [`// RiftBard Deck: ${deck.name || 'Mazo'}`];
    ['legend', 'champion', 'rune', 'battlefield', 'main', 'sideboard'].forEach(sec => {
      const secCards = cards.filter(c => c.section === sec);
      if (secCards.length > 0) {
        lines.push(`\n// ${sec.toUpperCase()}`);
        secCards.forEach(c => lines.push(`${c.quantity}x ${c.name}`));
      }
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const validation = useMemo(() => {
    const v = { errors: [], warnings: [] };
    const legend = deckCards.find(c => c.section === 'legend');
    if (!legend) v.errors.push('Falta Leyenda');

    const runes = deckCards.filter(c => c.section === 'rune');
    const totalRunes = runes.reduce((sum, c) => sum + c.quantity, 0);
    if (totalRunes !== 12) v.errors.push(`Runas: ${totalRunes}/12`);
    
    const runeDomains = new Set(runes.map(r => r.card.element).filter(Boolean));
    if (runeDomains.size > 2) v.errors.push(`Máx 2 dominios para Runas`);

    const battlefields = deckCards.filter(c => c.section === 'battlefield');
    const totalBF = battlefields.reduce((sum, c) => sum + c.quantity, 0);
    if (totalBF !== 3) v.errors.push(`Campos de Batalla: ${totalBF}/3`);

    const main = deckCards.filter(c => c.section === 'main');
    const champion = deckCards.find(c => c.section === 'champion');
    let totalMain = main.reduce((sum, c) => sum + c.quantity, 0);
    if (champion) totalMain += 1;
    
    if (totalMain !== 40) v.errors.push(`Mazo Principal: ${totalMain}/40`);
    if (!champion) v.errors.push('Falta Campeón');

    return v;
  }, [deckCards]);

  const getDomainGradients = (domains) => {
    const dList = (domains || []).filter(Boolean);
    if (dList.length === 0) return 'from-dark-800 to-dark-900';
    
    const colorMapFrom = {
      'chaos': 'from-purple-900/90', 'order': 'from-yellow-900/90', 'mind': 'from-blue-900/90',
      'body': 'from-orange-900/90', 'fury': 'from-red-900/90', 'calm': 'from-emerald-900/90'
    };
    const colorMapTo = {
      'chaos': 'to-purple-950/90', 'order': 'to-yellow-950/90', 'mind': 'to-blue-950/90',
      'body': 'to-orange-950/90', 'fury': 'to-red-950/90', 'calm': 'to-emerald-950/90'
    };
    
    const d1 = dList[0]?.toLowerCase();
    const d2 = dList[1]?.toLowerCase();
    
    if (dList.length === 1) return `${colorMapFrom[d1] || 'from-dark-800'} to-dark-950`;
    return `${colorMapFrom[d1] || 'from-dark-800'} ${colorMapTo[d2] || 'to-dark-950'}`;
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
      calm: { single: 'bg-emerald-500', from: 'from-emerald-500', to: 'to-emerald-500' }
    };

    const d1 = gradientMap[domains[0]] || { single: 'bg-dark-700', from: 'from-dark-700', to: 'to-dark-700' };
    
    if (domains.length > 1) {
       const d2 = gradientMap[domains[1]] || { single: 'bg-dark-700', from: 'from-dark-700', to: 'to-dark-700' };
       return `bg-gradient-to-br ${d1.from} from-50% ${d2.to} to-50%`;
    }
    
    return d1.single;
  };

  const sharedModals = (
    <>
      <HoverCardPreviewSingleton />
      <HoverDeckPreviewSingleton />
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl max-w-md w-full border border-dark-600 space-y-4">
             <h3 className="text-lg font-black text-white">Guardar Mazo</h3>
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-400">Nombre del mazo</label>
               <input 
                 type="text" 
                 value={deckName} 
                 onChange={e => setDeckName(e.target.value)} 
                 placeholder="Ej. Ahri Control"
                 className="w-full glass-input"
                 autoFocus
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-400">Descripción (Opcional)</label>
               <textarea 
                 value={deckDescription} 
                 onChange={e => setDeckDescription(e.target.value)} 
                 placeholder="Estrategia, notas..."
                 className="w-full glass-input min-h-[80px]"
               />
             </div>
             <div className="flex gap-2 pt-2">
               <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2 rounded-xl font-bold text-xs bg-dark-800 hover:bg-dark-700 text-slate-300">
                 Cancelar
               </button>
               <button onClick={saveDeck} className="flex-1 py-2 rounded-xl font-bold text-xs btn-primary shadow-glow-primary">
                 Guardar Mazo
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deckToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="glass-panel p-5 sm:p-6 rounded-2xl max-w-sm w-full border border-red-500/30 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">¿Eliminar este mazo?</h3>
                <p className="text-xs text-slate-400 mt-1">Esta acción es permanente y no se puede deshacer.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setDeckToDelete(null)} className="flex-1 py-2 rounded-xl font-bold text-xs bg-dark-800 text-slate-300 hover:bg-dark-700">
                  Cancelar
                </button>
                <button onClick={confirmDeleteDeck} className="flex-1 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20">
                  Eliminar
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Mobile Quick Preview Modal (Triggered by Long-Press) */}
      {mobileQuickDeck && (
        <div 
          className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setMobileQuickDeck(null)}
        >
          <div 
            className="bg-dark-900 border border-primary-500/40 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-card-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle (Mobile) */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="p-4 border-b border-dark-700/60 flex items-center justify-between shrink-0 bg-dark-950/50">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white truncate">{mobileQuickDeck.name}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary-950/80 border border-primary-500/40 text-primary-300">
                    {mobileQuickDeck.main_total_cards || 0}/40
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {mobileQuickDeck.rune_domains ? mobileQuickDeck.rune_domains.join(' • ') : 'Neutral'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setMobileQuickDeck(null)}
                className="w-8 h-8 rounded-full bg-dark-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Battlefields & Runes Strip */}
            <div className="p-3 bg-dark-950/80 border-b border-dark-800 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {/* Battlefields */}
              <div className="flex items-center gap-2">
                {mobileQuickDeck.battlefields && mobileQuickDeck.battlefields.length > 0 ? (
                  mobileQuickDeck.battlefields.map((bf, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <img 
                        src={bf.image_url} 
                        alt="Battlefield" 
                        className="w-20 aspect-[88/63] rounded-lg border border-dark-600 shadow object-cover" 
                      />
                      {bf.quantity > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-dark-900 border border-primary-500 rounded px-1 text-[9px] font-black text-white">
                          x{bf.quantity}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Sin campos</span>
                )}
              </div>

              {/* Runes */}
              {mobileQuickDeck.rune_counts && (
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {Object.entries(mobileQuickDeck.rune_counts).map(([dom, count]) => {
                    const dNorm = dom.charAt(0).toUpperCase() + dom.slice(1).toLowerCase();
                    return (
                      <div key={dom} className="flex items-center gap-1 bg-dark-900 px-2 py-1 rounded-lg border border-dark-700 text-xs font-black text-white">
                        <img src={`https://cdn.piltoverarchive.com/colors/${dNorm}.webp`} alt={dom} className="w-3.5 h-3.5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar touch-pan-y">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cartas del Mazo ({mobileQuickDeck.card_list ? mobileQuickDeck.card_list.reduce((a,c)=>a+c.quantity, 0) : 0})
              </div>
              {(mobileQuickDeck.card_list || []).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-dark-950/80 border border-white/[0.04] text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.energy_cost !== undefined && c.energy_cost !== null && (
                      <span className="w-5 h-5 rounded-full bg-dark-900 border border-white/20 text-[10px] font-black text-white flex items-center justify-center shrink-0">
                        {c.energy_cost}
                      </span>
                    )}
                    <span className="font-bold text-white truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 uppercase">{c.card_type}</span>
                  </div>
                  <span className="text-xs font-black text-primary-400 bg-primary-950/80 border border-primary-500/30 px-2 py-0.5 rounded-lg shrink-0">
                    x{c.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="p-3 border-t border-dark-700/60 bg-dark-950/90 flex gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setMobileQuickDeck(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-dark-800 text-slate-300 hover:text-white transition-colors"
              >
                Cerrar
              </button>
              <button 
                type="button"
                onClick={() => {
                  const deckId = mobileQuickDeck.id;
                  setMobileQuickDeck(null);
                  openPreview(deckId);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs btn-primary shadow-glow-primary flex items-center justify-center gap-1.5"
              >
                <span>Abrir Mazo Completo</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // --- VIEW: DECK COMPARATOR ---
  if (decksToCompare.length === 2) {
    const handleCreateMergedDeck = (mergedCards) => {
      setDecksToCompare([]);
      setIsComparing(false);
      setCurrentDeck('new');
      setDeckName('Merged Deck');
      setDeckDescription('Creado desde comparación de mazos.');
      
      const mappedCards = mergedCards.map(c => ({
        card: { ...c, id: c.card_id },
        section: c.section,
        quantity: c.quantity
      }));
      setDeckCards(mappedCards);
    };

    return (
      <DeckComparator 
        deck1Id={decksToCompare[0]} 
        deck2Id={decksToCompare[1]} 
        API_URL={API_URL} 
        collection={collection} 
        onBack={() => { setDecksToCompare([]); setIsComparing(false); }} 
        onCreateMergedDeck={handleCreateMergedDeck}
      />
    );
  }

  // --- VIEW: RE-IMAGINED DECK PREVIEW ---
  if (previewDeck && previewData) {
    const pLegend = previewData.cards.find(c => c.section === 'legend');
    const pChampion = previewData.cards.find(c => c.section === 'champion');
    const pRunes = previewData.cards.filter(c => c.section === 'rune');
    const pBattlefields = previewData.cards.filter(c => c.section === 'battlefield');
    
    // Main deck cards: sort cleanly by energy cost, then name
    const pMainCards = previewData.cards
      .filter(c => c.section === 'main' || (c.section !== 'legend' && c.section !== 'champion' && c.section !== 'battlefield' && c.section !== 'rune' && c.section !== 'sideboard'))
      .sort((a, b) => {
        const costA = a.energy_cost ?? 99;
        const costB = b.energy_cost ?? 99;
        if (costA !== costB) return costA - costB;
        return (a.name || '').localeCompare(b.name || '');
      });

    const pSideboard = previewData.cards.filter(c => c.section === 'sideboard');

    // Filter main cards by category pill if selected
    const filteredMainCards = pMainCards.filter(c => {
      if (mainFilterCategory === 'units') return c.card_type?.toLowerCase() === 'unit';
      if (mainFilterCategory === 'spells') return c.card_type?.toLowerCase() === 'spell';
      if (mainFilterCategory === 'gears') return c.card_type?.toLowerCase() === 'gear';
      return true;
    });

    const totalMainCardsCount = pMainCards.reduce((acc, c) => acc + c.quantity, 0) + (pChampion ? 1 : 0);
    const totalPreviewCards = previewData.cards.reduce((acc, c) => acc + c.quantity, 0);

    // Group Runes by Domain for a compact, neat display
    const runesByDomain = {};
    pRunes.forEach(r => {
      const d = r.element || 'Neutral';
      if (!runesByDomain[d]) runesByDomain[d] = [];
      runesByDomain[d].push(r);
    });

    const renderCardTile = (c, i) => {
      const isRune = c.section === 'rune' || (c.card_type && c.card_type.toLowerCase().includes('rune'));
      const isBattlefield = c.card_type && c.card_type.toLowerCase().includes('battlefield');
      const owned = (collection[c.card_id]?.normal_count || 0) + (collection[c.card_id]?.foil_count || 0);
      const isMissingAll = !isRune && owned === 0;
      const isPartial = !isRune && owned > 0 && owned < c.quantity;
      const badgeColor = isRune ? 'text-primary-300' : isMissingAll ? 'text-rose-400 bg-rose-950/80 border-rose-500/40' : isPartial ? 'text-amber-400 bg-amber-950/80 border-amber-500/40' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';

      return (
        <div 
          key={c.card_id + '-' + i} 
          className={`relative group rounded-xl overflow-hidden glass-panel-elevated cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary-500/20 hover:border-primary-500/50 w-full h-full ${
            isBattlefield ? 'aspect-[88/63]' : 'aspect-[2.5/3.5]'
          } ${isMissingAll ? 'grayscale-[40%] opacity-85' : ''}`}
          onClick={() => onClickCard && onClickCard({ ...c, id: c.card_id })}
          onMouseEnter={(e) => showHoverCard({ ...c, id: c.card_id }, e)}
          onMouseLeave={hideHoverCard}
        >
          {/* Energy cost top left */}
          {c.energy_cost !== undefined && c.energy_cost !== null && !isBattlefield && (
            <div className="absolute top-1.5 left-1.5 z-20 w-5 h-5 rounded-full bg-dark-950/90 border border-white/20 text-[10px] font-black text-white flex items-center justify-center shadow-md">
              {c.energy_cost}
            </div>
          )}

          {/* Quantity badge top right */}
          <div className="absolute top-1.5 right-1.5 z-20">
            <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-black border shadow-lg flex items-center gap-1 ${badgeColor}`}>
              <span>{c.quantity}x</span>
            </div>
          </div>

          <img 
            src={c.image_url} 
            alt={c.name} 
            className="w-full h-full object-cover"
            loading="lazy" 
          />

          {/* Bottom title gradient */}
          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent pointer-events-none">
            <p className="text-[10px] font-bold text-white truncate drop-shadow">{c.name}</p>
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden relative">
        
        {/* Toast Copied */}
        {copiedToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[300] bg-primary-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl animate-card-pop flex items-center gap-2">
            <Check size={14} /> Decklist copiada al portapapeles
          </div>
        )}

        {/* Hero Deck Header */}
        <header className="sticky top-0 z-40 glass-panel border-b border-dark-700/50 px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center bg-dark-900/95 backdrop-blur-xl shadow-xl shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button 
              type="button"
              onClick={() => { setPreviewDeck(null); setPreviewData(null); }} 
              className="p-2 hover:bg-dark-700 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0 bg-dark-800/80 border border-white/10"
              title="Volver a la lista de mazos"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white drop-shadow-sm truncate">{previewData.name}</h2>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  totalMainCardsCount === 40 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {totalMainCardsCount === 40 ? 'Legal (40/40)' : `${totalMainCardsCount}/40`}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {totalPreviewCards} cartas en total • {pRunes.length} Runas • {pBattlefields.length} Campos
              </p>
            </div>
          </div>
          
          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => copyDecklistToClipboard(previewData)} 
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
              title="Copiar decklist"
            >
              <Copy size={14} /> <span className="hidden sm:inline">Copiar</span>
            </button>
            <button 
              type="button"
              onClick={() => loadDeckForEdit(previewData.id, previewData)} 
              className="btn-primary py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-glow-primary"
            >
              <Edit2 size={14} /> <span>Editar</span>
            </button>
          </div>
        </header>

        {/* View Tabs Switcher (Visual vs Decklist vs Stats) */}
        <div className="flex bg-dark-900/95 border-b border-white/[0.08] p-1.5 gap-1 shrink-0 z-30">
          <button 
            type="button"
            onClick={() => setMobilePreviewTab('visual')} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobilePreviewTab === 'visual' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} /> Visual
          </button>
          <button 
            type="button"
            onClick={() => { setMobilePreviewTab('list'); setPreviewSidebarTab('deck'); }} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobilePreviewTab === 'list' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={13} /> Lista ({totalPreviewCards})
          </button>
          <button 
            type="button"
            onClick={() => { setMobilePreviewTab('stats'); setPreviewSidebarTab('stats'); }} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobilePreviewTab === 'stats' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 size={13} /> Estadísticas
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* TAB 1: VISUAL (Reimagined contiguous grid with ZERO empty gaps) */}
          {mobilePreviewTab === 'visual' && (
            <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-6 custom-scrollbar pb-24 touch-pan-y">
              
              {/* Shelf 1: Command Zone & Runes & Battlefields */}
              <div className="bg-dark-900/60 border border-white/[0.08] p-3 sm:p-4 rounded-2xl space-y-3">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={13} className="text-primary-400" />
                  <span>Zona de Mando & Fundamentos</span>
                </div>

                <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                  {/* Legend Card */}
                  {pLegend && (
                    <div className="w-24 sm:w-28 space-y-1 shrink-0">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block text-center">Leyenda</span>
                      <div className="w-full aspect-[2.5/3.5]">
                        {renderCardTile(pLegend, 'leg')}
                      </div>
                    </div>
                  )}

                  {/* Champion Card */}
                  {pChampion && (
                    <div className="w-24 sm:w-28 space-y-1 shrink-0">
                      <span className="text-[9px] font-bold text-primary-400 uppercase tracking-wider block text-center">Campeón</span>
                      <div className="w-full aspect-[2.5/3.5]">
                        {renderCardTile(pChampion, 'champ')}
                      </div>
                    </div>
                  )}

                  {/* Battlefields */}
                  {pBattlefields.length > 0 && (
                    <div className="space-y-1 shrink-0 max-w-full">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Campos de Batalla ({pBattlefields.reduce((a,c)=>a+c.quantity, 0)})
                      </span>
                      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1.5 custom-scrollbar touch-pan-x">
                        {pBattlefields.map((bf, idx) => (
                          <div key={idx} className="w-36 sm:w-44 aspect-[88/63] shrink-0">
                            {renderCardTile(bf, `bf-${idx}`)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Runes Affinity Clusters (Compact, neat, no 12 empty cells!) */}
                {pRunes.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runas (12):</span>
                    {Object.entries(runesByDomain).map(([domain, rCards]) => {
                      const count = rCards.reduce((a, c) => a + c.quantity, 0);
                      const dNorm = domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
                      return (
                        <div 
                          key={domain} 
                          className="flex items-center gap-1.5 bg-dark-950 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-bold text-white shadow-inner cursor-pointer hover:border-primary-500/50 transition-colors"
                          onClick={() => onClickCard && onClickCard({ ...rCards[0], id: rCards[0].card_id })}
                          title={`Ver Runa ${domain}`}
                        >
                          <img src={`https://cdn.piltoverarchive.com/colors/${dNorm}.webp`} alt={domain} className="w-3.5 h-3.5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                          <span>{count}x {domain}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Shelf 2: Main Deck Single Contiguous Grid (Scales seamlessly with columns!) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      Mazo Principal ({totalMainCardsCount}/40)
                    </h3>
                  </div>

                  {/* Filter Pills for quick inspection */}
                  <div className="flex items-center gap-1 bg-dark-900 border border-white/[0.06] p-0.5 rounded-xl text-[10px] font-bold">
                    <button 
                      type="button"
                      onClick={() => setMainFilterCategory('all')} 
                      className={`px-2 py-1 rounded-lg transition-all ${mainFilterCategory === 'all' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Todas ({pMainCards.length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMainFilterCategory('units')} 
                      className={`px-2 py-1 rounded-lg transition-all ${mainFilterCategory === 'units' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Unidades
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMainFilterCategory('spells')} 
                      className={`px-2 py-1 rounded-lg transition-all ${mainFilterCategory === 'spells' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Hechizos
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMainFilterCategory('gears')} 
                      className={`px-2 py-1 rounded-lg transition-all ${mainFilterCategory === 'gears' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Equipos
                    </button>
                  </div>
                </div>

                {/* Fixed-size Responsive Grid (Stable, proportional cards, no fluctuating zoom) */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 transition-all duration-300">
                  {filteredMainCards.map((c, i) => renderCardTile(c, i))}
                </div>
              </div>

              {/* Shelf 3: Sideboard (if any) */}
              {pSideboard.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider">
                    Banquillo ({pSideboard.reduce((a,c)=>a+c.quantity, 0)}/10)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 transition-all duration-300">
                    {pSideboard.map((c, i) => renderCardTile(c, `sb-${i}`))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DECKLIST (List rows grouped by section) */}
          {mobilePreviewTab === 'list' && (
            <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 custom-scrollbar pb-24">
              {['legend', 'champion', 'rune', 'battlefield', 'main', 'sideboard'].map(sec => {
                const secCards = previewData.cards.filter(c => c.section === sec);
                if (secCards.length === 0) return null;
                const secTotal = secCards.reduce((acc, c) => acc + c.quantity, 0);

                return (
                  <div key={sec} className="bg-dark-900/60 p-3 rounded-2xl border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 border-b border-white/[0.06] pb-1.5">
                      <span>{sec === 'main' ? 'Mazo Principal' : sec.toUpperCase()}</span>
                      <span className="text-primary-400 font-bold">{secTotal}</span>
                    </div>
                    <div className="space-y-1">
                      {secCards.map((c, i) => {
                        const isRune = sec === 'rune';
                        const owned = (collection[c.card_id]?.normal_count || 0) + (collection[c.card_id]?.foil_count || 0);
                        const isMissing = !isRune && owned < c.quantity;

                        return (
                          <div 
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-dark-950/80 hover:bg-dark-800 border border-white/[0.04] transition-colors cursor-pointer"
                            onClick={() => onClickCard && onClickCard({ ...c, id: c.card_id })}
                            onMouseEnter={(e) => showHoverCard({ ...c, id: c.card_id }, e)}
                            onMouseLeave={hideHoverCard}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {c.energy_cost !== undefined && c.energy_cost !== null && (
                                <span className="w-5 h-5 rounded-full bg-dark-900 text-white font-black text-[10px] flex items-center justify-center border border-white/10 shrink-0">
                                  {c.energy_cost}
                                </span>
                              )}
                              <span className="text-xs font-bold text-white truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">{c.card_type}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isMissing && (
                                <span className="text-[9px] font-black text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30">
                                  Falta {c.quantity - owned}
                                </span>
                              )}
                              <span className="text-xs font-black text-primary-400 bg-primary-950/60 px-2 py-0.5 rounded-lg border border-primary-500/30">
                                x{c.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: STATS (Mana curve & domains) */}
          {mobilePreviewTab === 'stats' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar pb-24 max-w-2xl mx-auto">
              {(() => {
                const mainCards = previewData.cards.filter(c => c.section === 'main' || c.section === 'champion');
                const totalCards = mainCards.reduce((acc, c) => acc + c.quantity, 0);
                
                let totalEnergy = 0;
                let energyCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 }; 
                let domainCounts = {};
                let typeCounts = { Unit:0, Spell:0, Gear:0 };

                mainCards.forEach(c => {
                   const q = c.quantity;
                   if (c.energy_cost !== undefined && c.energy_cost !== null) {
                      totalEnergy += c.energy_cost * q;
                      const eCost = Math.min(7, c.energy_cost);
                      energyCounts[eCost] = (energyCounts[eCost] || 0) + q;
                   }
                   
                   const cType = c.card_type ? c.card_type.split(' - ')[0].trim() : 'Other';
                   if (typeCounts[cType] !== undefined) typeCounts[cType] += q;

                   const doms = c.element ? c.element.split(',').map(d => d.trim()) : ['Neutral'];
                   doms.forEach(d => {
                      domainCounts[d] = (domainCounts[d] || 0) + q;
                   });
                });

                const avgEnergy = totalCards > 0 ? (totalEnergy / totalCards).toFixed(1) : '0.0';
                const maxE = Math.max(...Object.values(energyCounts), 1);

                return (
                  <div className="space-y-4">
                     {/* Summary pills */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-dark-900 p-3 rounded-2xl border border-white/[0.08] flex flex-col items-center">
                          <span className="text-2xl font-black text-white">{totalCards}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Cartas Principales</span>
                        </div>
                        <div className="bg-dark-900 p-3 rounded-2xl border border-white/[0.08] flex flex-col items-center">
                          <span className="text-2xl font-black text-primary-400">{avgEnergy}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Coste Promedio</span>
                        </div>
                     </div>

                     {/* Energy Curve */}
                     <div className="bg-dark-900 p-4 rounded-2xl border border-white/[0.08] space-y-3">
                       <h4 className="text-xs uppercase font-bold text-slate-300 flex items-center justify-between">
                          <span>Curva de Energía</span>
                          <span className="text-primary-400 bg-primary-950/60 px-2 py-0.5 rounded text-[10px]">Media {avgEnergy}</span>
                       </h4>
                       <div className="flex items-end justify-between h-28 gap-1.5 pt-4">
                         {[0,1,2,3,4,5,6,7].map(cost => {
                           const count = energyCounts[cost] || 0;
                           const height = (count / maxE) * 100;
                           return (
                             <div key={cost} className="flex flex-col items-center flex-1 h-full gap-1">
                               <div className="w-full bg-dark-950 rounded-t-lg h-full flex items-end justify-center">
                                  <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all relative" style={{ height: `${height}%` }}>
                                     {count > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-white">{count}</span>}
                                  </div>
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">{cost}{cost===7?'+':''}</span>
                             </div>
                           );
                         })}
                       </div>
                     </div>

                     {/* Types */}
                     <div className="bg-dark-900 p-4 rounded-2xl border border-white/[0.08] space-y-2">
                       <h4 className="text-xs uppercase font-bold text-slate-300">Tipos de Cartas</h4>
                       <div className="flex gap-2">
                         {Object.entries(typeCounts).map(([type, count]) => (
                           <div key={type} className="flex items-center gap-2 bg-dark-950 px-3 py-2 rounded-xl border border-white/[0.06] flex-1 justify-center">
                             <span className="text-sm font-black text-white">{count}</span>
                             <span className="text-[10px] uppercase text-slate-400 font-bold">{type}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Domains */}
                     <div className="bg-dark-900 p-4 rounded-2xl border border-white/[0.08] space-y-2">
                       <h4 className="text-xs uppercase font-bold text-slate-300">Dominios</h4>
                       <div className="flex flex-wrap gap-2">
                         {Object.entries(domainCounts).map(([domain, count]) => (
                           <div key={domain} className="flex items-center gap-2 bg-dark-950 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                             <span className="text-sm font-black text-primary-400">{count}</span>
                             <span className="text-[10px] uppercase text-slate-300 font-bold">{domain}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {sharedModals}
      </div>
    );
  }

  // --- VIEW: DECK BUILDER / EDITOR ---
  if (currentDeck !== null) {
    const totalMainCards = deckCards.filter(c => c.section === 'main' || c.section === 'champion').reduce((sum, c) => sum + c.quantity, 0);

    return (
      <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden relative">
        {/* Top Header */}
        <header className="glass-panel border-b border-dark-700/50 px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center bg-dark-900/95 backdrop-blur-xl z-30 shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <button 
              type="button"
              onClick={() => {
                setCurrentDeck(null);
                if (setType) setType([]);
                if (setDomain) setDomain([]);
              }} 
              className="p-2 hover:bg-dark-700 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0 bg-dark-800 border border-white/10" 
              title="Volver a la lista de mazos"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-0 flex-1 max-w-sm">
              <input 
                type="text" 
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                placeholder="Nombre del Mazo..."
                className="w-full bg-dark-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="hidden sm:flex items-center">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                validation.errors.length === 0 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {validation.errors.length === 0 ? 'Mazo Legal (40/40)' : `${totalMainCards}/40 • ${validation.errors.length} pendiente(s)`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSaveModal(true)} 
              className="btn-primary py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-glow-primary"
            >
              <CheckCircle2 size={15} /> <span>Guardar</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-dark-900/95 border-b border-white/[0.08] p-1.5 gap-1 shrink-0 z-30">
          <button 
            type="button"
            onClick={() => setMobileEditorTab('catalog')} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileEditorTab === 'catalog' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={13} /> Catálogo
          </button>
          <button 
            type="button"
            onClick={() => setMobileEditorTab('deck')} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileEditorTab === 'deck' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} /> Mazo ({totalMainCards}/40)
          </button>
        </div>

        {/* Builder Content: Left Catalog, Right Decklist */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
          
          {/* CATALOG SECTION */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden ${
            mobileEditorTab !== 'catalog' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Target Section Picker Pills */}
            <div className="p-2 sm:p-3 bg-dark-900/90 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto shrink-0 custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Destino:</span>
              {[
                { id: 'main', label: 'Principal', max: 40, count: totalMainCards },
                { id: 'legend', label: 'Leyenda', max: 1, count: deckCards.filter(c => c.section === 'legend').length },
                { id: 'champion', label: 'Campeón', max: 1, count: deckCards.filter(c => c.section === 'champion').length },
                { id: 'rune', label: 'Runas', max: 12, count: deckCards.filter(c => c.section === 'rune').reduce((a,c)=>a+c.quantity, 0) },
                { id: 'battlefield', label: 'Campos', max: 3, count: deckCards.filter(c => c.section === 'battlefield').reduce((a,c)=>a+c.quantity, 0) },
                { id: 'sideboard', label: 'Banquillo', max: 10, count: deckCards.filter(c => c.section === 'sideboard').reduce((a,c)=>a+c.quantity, 0) },
              ].map(sec => {
                const isActive = (targetSection === sec.id) || (!targetSection && sec.id === 'main');
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setTargetSection(sec.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shrink-0 ${
                      isActive 
                        ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                        : 'bg-dark-800 text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span>{sec.label}</span>
                    <span className={`text-[10px] ${sec.count > sec.max ? 'text-rose-300 font-black' : 'opacity-80'}`}>
                      {sec.count}/{sec.max}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Catalog Grid */}
            <div 
              className="flex-1 overflow-y-auto p-2.5 sm:p-4 custom-scrollbar touch-pan-y"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop - clientHeight < 500) {
                  if (displayedCards && visibleCount && displayedCards.length > visibleCount && setVisibleCount) {
                    setVisibleCount(visibleCount + 50);
                  }
                }
              }}
            >
              <div 
                className="grid gap-2 sm:gap-3.5 pb-24"
                style={{ gridTemplateColumns: `repeat(${columns || 2}, minmax(0, 1fr))` }}
              >
                {displayedCards.slice(0, visibleCount).map(card => {
                  const inDeck = deckCards.filter(c => c.card.id === card.id).reduce((a, c) => a + c.quantity, 0);
                  const maxAllowed = card.card_type?.toLowerCase() === 'rune' ? 12 : card.card_type?.toLowerCase() === 'battlefield' ? 1 : 3;
                  const isMax = inDeck >= maxAllowed;

                  return (
                    <div 
                      key={card.id}
                      className="relative group cursor-pointer"
                      onClick={() => addCardToDeck(card)}
                      onMouseEnter={(e) => showHoverCard(card, e)}
                      onMouseLeave={hideHoverCard}
                    >
                      <div className="pointer-events-none">
                        <Card card={card} collection={collection[card.id]} onUpdate={() => {}} imageOnly={true} />
                      </div>

                      {/* In-deck badge */}
                      {inDeck > 0 && (
                        <div className="absolute bottom-2 right-2 z-30">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-lg ${
                            isMax 
                              ? 'bg-amber-500 text-dark-950 border-amber-300 font-extrabold' 
                              : 'bg-primary-600 text-white border-primary-400'
                          }`}>
                            {isMax ? 'MAX (3)' : `${inDeck} en mazo`}
                          </span>
                        </div>
                      )}

                      {/* Click overlay */}
                      <div className="absolute inset-0 bg-primary-500/0 hover:bg-primary-500/20 rounded-2xl transition-colors flex items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg">
                          <Plus size={24} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Mobile Jump to Decklist Pill */}
            {mobileEditorTab === 'catalog' && (
              <button 
                type="button"
                onClick={() => setMobileEditorTab('deck')}
                className="lg:hidden fixed bottom-6 right-5 z-40 btn-primary py-2.5 px-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.5)] text-xs font-bold flex items-center gap-2 animate-hud-bounce cursor-pointer"
              >
                <span>Ver Mazo ({totalMainCards}/40)</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>

          {/* DECKLIST TRAY (Right on desktop, tab on mobile) */}
          <div className={`w-full lg:w-[24rem] xl:w-[26rem] flex flex-col bg-dark-950 border-t lg:border-t-0 lg:border-l border-dark-700/50 relative z-20 shadow-2xl h-full ${
            mobileEditorTab !== 'deck' ? 'hidden lg:flex' : 'flex'
          }`}>
            <div className="p-3 border-b border-dark-700 bg-dark-900 flex items-center justify-between shrink-0">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Cartas en Mazo ({deckCards.reduce((a,c)=>a+c.quantity, 0)})
              </span>
              <button 
                type="button"
                onClick={() => setShowSaveModal(true)} 
                className="btn-primary py-1 px-3 text-xs font-bold"
              >
                Guardar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar pb-24">
              {['legend', 'champion', 'rune', 'battlefield', 'main', 'sideboard'].map(sec => {
                const secCards = deckCards.filter(c => c.section === sec);
                const secTotal = secCards.reduce((a, c) => a + c.quantity, 0);

                const renderDeckCardRow = (c) => {
                  const owned = (collection[c.card.id]?.normal_count || 0) + (collection[c.card.id]?.foil_count || 0);
                  const isRune = c.section === 'rune';
                  const missing = !isRune ? Math.max(0, c.quantity - owned) : 0;

                  return (
                    <div 
                      key={c.card.id + c.section}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-dark-950 hover:bg-dark-850 border border-white/[0.04] text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {c.card.energy_cost !== undefined && c.card.energy_cost !== null && c.section !== 'battlefield' && (
                          <span className="w-5 h-5 rounded-full bg-dark-900 border border-white/20 text-[10px] font-black text-white flex items-center justify-center shrink-0">
                            {c.card.energy_cost}
                          </span>
                        )}
                        <span 
                          className="font-bold text-white truncate max-w-[140px] cursor-pointer hover:text-primary-300"
                          title={c.card.name}
                          onClick={() => onClickCard && onClickCard(c.card)}
                        >
                          {c.card.name}
                        </span>
                        {missing > 0 && (
                          <span className="text-[9px] text-rose-400 font-bold bg-rose-950/80 px-1 rounded shrink-0">
                            -{missing}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => removeCardFromDeck(c.card.id, c.section)}
                          className="w-6 h-6 rounded bg-dark-800 text-slate-300 hover:text-rose-400 flex items-center justify-center active:scale-90 transition-transform"
                          title="Restar 1 copia"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-black text-white">{c.quantity}</span>
                        <button
                          type="button"
                          onClick={() => addCardToDeck(c.card)}
                          className="w-6 h-6 rounded bg-dark-800 text-slate-300 hover:text-primary-400 flex items-center justify-center active:scale-90 transition-transform"
                          title="Añadir 1 copia"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeckCards(prev => prev.filter(x => !(x.card.id === c.card.id && x.section === c.section)));
                          }}
                          className="w-6 h-6 rounded text-slate-500 hover:text-rose-400 flex items-center justify-center ml-0.5 active:scale-90 transition-transform"
                          title="Eliminar del mazo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                };

                if (sec === 'main') {
                  const sortByCost = (a, b) => {
                    const costA = a.card.energy_cost ?? 99;
                    const costB = b.card.energy_cost ?? 99;
                    if (costA !== costB) return costA - costB;
                    return (a.card.name || '').localeCompare(b.card.name || '');
                  };

                  const units = secCards.filter(c => c.card.card_type?.toLowerCase() === 'unit').sort(sortByCost);
                  const spells = secCards.filter(c => c.card.card_type?.toLowerCase() === 'spell').sort(sortByCost);
                  const gears = secCards.filter(c => c.card.card_type?.toLowerCase() === 'gear').sort(sortByCost);
                  const others = secCards.filter(c => {
                    const t = c.card.card_type?.toLowerCase();
                    return t !== 'unit' && t !== 'spell' && t !== 'gear';
                  }).sort(sortByCost);

                  const mainCategories = [
                    { id: 'units', label: 'Unidades', items: units },
                    { id: 'spells', label: 'Hechizos', items: spells },
                    { id: 'gears', label: 'Equipos', items: gears },
                    { id: 'others', label: 'Otras', items: others },
                  ].filter(cat => cat.items.length > 0);

                  return (
                    <div key={sec} className="bg-dark-900/60 p-2.5 rounded-xl border border-white/[0.05] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/[0.06] pb-1">
                        <span className="uppercase font-black text-white">Mazo Principal</span>
                        <span className="text-primary-400 font-black">{secTotal}/40</span>
                      </div>

                      {mainCategories.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-1 text-center">No hay cartas en el mazo principal</p>
                      ) : (
                        mainCategories.map(cat => (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pt-0.5">
                              <span>{cat.label}</span>
                              <span className="text-primary-400 font-bold">{cat.items.reduce((a, c) => a + c.quantity, 0)}</span>
                            </div>
                            {cat.items.map(c => renderDeckCardRow(c))}
                          </div>
                        ))
                      )}
                    </div>
                  );
                }

                // Non-main sections
                const sortedNonMain = [...secCards].sort((a, b) => {
                  const costA = a.card.energy_cost ?? 99;
                  const costB = b.card.energy_cost ?? 99;
                  if (costA !== costB) return costA - costB;
                  return (a.card.name || '').localeCompare(b.card.name || '');
                });

                return (
                  <div key={sec} className="bg-dark-900/60 p-2.5 rounded-xl border border-white/[0.05] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/[0.06] pb-1">
                      <span className="uppercase">
                        {sec === 'battlefield' ? 'Campos' : sec === 'rune' ? 'Runas' : sec === 'champion' ? 'Campeón' : sec === 'legend' ? 'Leyenda' : sec === 'sideboard' ? 'Banquillo' : sec}
                      </span>
                      <span className="text-primary-400 font-bold">{secTotal}</span>
                    </div>

                    {sortedNonMain.map(c => renderDeckCardRow(c))}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {sharedModals}
      </div>
    );
  }

  // --- VIEW: DECK LIST (`currentDeck === null && previewDeck === null`) ---
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  // Scalable deck columns hooked to pinch / ctrl+wheel columns!
  // On mobile: scales between 1 and 4 columns, defaulting to 2 so 2 fit side-by-side!
  const deckCols = isMobile
    ? Math.max(1, Math.min(4, Math.round(columns * 0.75) || 2))
    : Math.max(2, Math.min(8, Math.round(columns * 0.8) || 4));

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-y-auto custom-scrollbar touch-pan-y">
      
      {/* Deck Action Header Bar */}
      <header className="glass-panel border-b border-white/[0.08] p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sticky top-0 z-30 bg-dark-950/95 backdrop-blur-xl shadow-md">
        
        {/* Left: Title & Quick Search */}
        <div className="flex items-center gap-3 flex-1">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white">Tus Mazos</h2>
            <p className="text-[10px] sm:text-xs text-slate-400">{decks.length} mazos registrados</p>
          </div>

          <div className="relative flex-1 max-w-xs ml-auto sm:ml-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input 
              type="text"
              placeholder="Buscar mazo..."
              value={deckSearch || ''}
              onChange={(e) => setDeckSearch && setDeckSearch(e.target.value)}
              className="w-full bg-dark-900 border border-white/[0.08] rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
            />
            {deckSearch && (
              <button 
                type="button" 
                onClick={() => setDeckSearch && setDeckSearch('')} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Prominent Interface Buttons (+ Nuevo Mazo, Importar, Comparar) */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={startNewDeck}
            className="btn-primary py-2 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-glow-primary active:scale-95"
            title="Crear un nuevo mazo"
          >
            <Plus size={15} /> <span>Nuevo Mazo</span>
          </button>

          <button 
            type="button"
            onClick={() => { setImportExportInitialMode('import'); setShowImportExport(true); }}
            className="bg-dark-900 hover:bg-dark-800 text-slate-200 border border-white/10 hover:border-white/20 py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Importar mazo desde código o texto"
          >
            <Upload size={14} /> <span>Importar</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setIsComparing(!isComparing);
              setDecksToCompare([]);
            }} 
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border shadow-sm ${
              isComparing 
                ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                : 'bg-dark-900 text-slate-300 border-white/10 hover:bg-dark-800'
            }`}
          >
            <Layers size={14} /> <span>{isComparing ? 'Cancelar' : 'Comparar'}</span>
          </button>
        </div>

      </header>

      {/* Comparison Instruction Banner */}
      {isComparing && (
        <div className="mx-3 sm:mx-6 mt-3 p-3 bg-primary-950/60 border border-primary-500/40 rounded-xl flex items-center justify-between text-xs font-bold text-primary-300">
          <span>Selecciona 2 mazos para compararlos ({decksToCompare.length}/2)</span>
          <button type="button" onClick={() => { setIsComparing(false); setDecksToCompare([]); }} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Decks Grid (Hooked to pinch and Ctrl+wheel columns!) */}
      <div 
        className="p-3 sm:p-6 grid gap-3 sm:gap-5 pb-24 transition-all duration-300"
        style={{ gridTemplateColumns: `repeat(${deckCols}, minmax(0, 1fr))` }}
      >
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
          </div>
        ) : (
          decks.filter(deck => {
            if (deckSearch && !deck.name?.toLowerCase().includes(deckSearch.toLowerCase())) return false;
            return true;
          }).map(deck => (
            <div 
              key={deck.id} 
              className={`relative group cursor-pointer aspect-[2.5/3.5] w-full rounded-2xl overflow-hidden glass-panel-elevated transition-transform hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary-500/50 select-none ${
                decksToCompare.includes(deck.id) ? 'ring-4 ring-primary-500 scale-[1.02]' : ''
              }`}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
                longPressFiredRef.current = false;
                if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                touchTimerRef.current = setTimeout(() => {
                  longPressFiredRef.current = true;
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(50); } catch (_) {}
                  }
                  setMobileQuickDeck(deck);
                }, 450);
              }}
              onTouchMove={(e) => {
                if (!touchTimerRef.current) return;
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
                const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
                if (dx > 10 || dy > 10) {
                  clearTimeout(touchTimerRef.current);
                  touchTimerRef.current = null;
                }
              }}
              onTouchEnd={() => {
                if (touchTimerRef.current) {
                  clearTimeout(touchTimerRef.current);
                  touchTimerRef.current = null;
                }
              }}
              onClick={(e) => {
                if (longPressFiredRef.current) {
                  longPressFiredRef.current = false;
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isComparing) {
                  if (decksToCompare.includes(deck.id)) {
                    setDecksToCompare(decksToCompare.filter(d => d !== deck.id));
                  } else if (decksToCompare.length < 2) {
                    setDecksToCompare([...decksToCompare, deck.id]);
                  }
                } else {
                  openPreview(deck.id);
                }
              }}
              onMouseEnter={(e) => showHoverDeck(deck, e.currentTarget)}
              onMouseLeave={hideHoverDeck}
            >
              {/* Background Champion / Legend Art */}
              {deck.legend_image && (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={deck.legend_image} 
                    alt="Legend" 
                    className="w-full h-full object-cover object-[center_20%] opacity-45 group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy"
                  />
                </div>
              )}

              {/* Gradient Overlays */}
              <div className={`absolute inset-0 z-10 bg-gradient-to-br ${getDomainGradients(deck.rune_domains)} opacity-25 group-hover:opacity-60 transition-opacity duration-500`}></div>
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent"></div>

              {/* Content */}
              <div className="relative z-20 p-3 sm:p-4 flex flex-col h-full justify-between">
                
                {/* Top Action Icons (Heart & Trash) */}
                <div className="flex justify-between items-start gap-2">
                  {/* Legality Tag */}
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-dark-950/80 border border-white/10 text-white backdrop-blur shadow">
                    {deck.main_total_cards || 0}/40
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavoriteDeck(deck.id, deck.favorite); }} 
                      className={`p-1.5 rounded-full shadow backdrop-blur transition-colors ${
                        deck.favorite ? 'bg-rose-500/25 text-rose-400' : 'bg-dark-900/80 text-slate-400 hover:text-rose-400'
                      }`}
                      title={deck.favorite ? 'Quitar de favoritos' : 'Favorito'}
                    >
                      <Heart size={14} className={deck.favorite ? 'fill-current' : ''} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteDeck(deck.id); }} 
                      className="bg-dark-900/80 hover:bg-rose-600 text-slate-400 hover:text-white p-1.5 rounded-full shadow backdrop-blur transition-colors"
                      title="Eliminar mazo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-white drop-shadow-md line-clamp-2 leading-tight">
                    {deck.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span>{deck.rune_domains ? deck.rune_domains.join(' • ') : 'Neutral'}</span>
                    <span className="text-slate-400 text-[9px]">{new Date(deck.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {sharedModals}

      <ImportExportModal 
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        deckCards={deckCards}
        deckName={deckName}
        setDeckCards={setDeckCards}
        setDeckName={setDeckName}
        API_URL={API_URL}
        initialMode={importExportInitialMode}
        onImportSuccess={() => setCurrentDeck('new')}
      />
    </div>
  );
}
