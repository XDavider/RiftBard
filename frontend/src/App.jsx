import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from './components/Card';
import DeckManager from './components/DeckManager';
import CardDetailModal from './components/CardDetailModal';
import { 
  Search, Filter, Layers, Database, Upload, Menu, X, 
  ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles, ZoomIn, ZoomOut, 
  RotateCcw, Check, ArrowUpDown, ShieldCheck, Flame, BookOpen, Plus, Minus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`;

const DOMAIN_STYLES = {
  Mind: {
    border: 'hover:border-blue-500/60',
    activeBg: 'bg-blue-600 border-blue-400 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-blue-950/40 hover:text-blue-300',
    dot: 'bg-blue-400'
  },
  Order: {
    border: 'hover:border-yellow-500/60',
    activeBg: 'bg-yellow-600 border-yellow-400 text-white shadow-[0_0_16px_rgba(234,179,8,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-yellow-950/40 hover:text-yellow-300',
    dot: 'bg-yellow-400'
  },
  Body: {
    border: 'hover:border-orange-500/60',
    activeBg: 'bg-orange-600 border-orange-400 text-white shadow-[0_0_16px_rgba(249,115,22,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-orange-950/40 hover:text-orange-300',
    dot: 'bg-orange-400'
  },
  Chaos: {
    border: 'hover:border-purple-500/60',
    activeBg: 'bg-purple-600 border-purple-400 text-white shadow-[0_0_16px_rgba(168,85,247,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-purple-950/40 hover:text-purple-300',
    dot: 'bg-purple-400'
  },
  Fury: {
    border: 'hover:border-red-500/60',
    activeBg: 'bg-red-600 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-red-950/40 hover:text-red-300',
    dot: 'bg-red-400'
  },
  Calm: {
    border: 'hover:border-emerald-500/60',
    activeBg: 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-emerald-950/40 hover:text-emerald-300',
    dot: 'bg-emerald-400'
  }
};

const MultiSelectDropdown = ({ title, options, selected, onChange, defaultText = "Any" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
    else onChange([...selected, opt]);
  };

  const hasSelection = selected.length > 0;
  
  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</label>
        {hasSelection && (
          <button 
            onClick={() => onChange([])} 
            className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            Limpiar ({selected.length})
          </button>
        )}
      </div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-dark-900/90 border ${
          hasSelection 
            ? 'border-primary-500/60 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]' 
            : isOpen 
              ? 'border-primary-500 text-white' 
              : 'border-white/[0.08] text-slate-300 hover:border-white/20'
        } rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none transition-all duration-200`}
      >
        <span className="truncate pr-2">
          {hasSelection ? `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}` : defaultText}
        </span>
        <span className={`transform transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-primary-400' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-dark-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-64 animate-card-pop">
          <div className="p-2 border-b border-white/[0.06] bg-dark-950/60">
             <button 
               onClick={() => { onChange([]); setIsOpen(false); }} 
               className="text-xs font-semibold text-slate-400 hover:text-white w-full text-left px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
             >
               Cualquiera (Limpiar)
             </button>
          </div>
          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {options.map(([optName, count]) => (
              <label 
                key={optName} 
                className="flex items-center justify-between px-2.5 py-1.5 hover:bg-white/[0.06] rounded-xl cursor-pointer group transition-colors"
              >
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors truncate pr-2">{optName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {count !== '' && (
                    <span className="text-[10px] font-bold text-slate-400 bg-dark-950/80 px-2 py-0.5 rounded-full border border-white/[0.05]">
                      {count}
                    </span>
                  )}
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    selected.includes(optName) 
                      ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                      : 'border-white/20 bg-dark-950 group-hover:border-white/40'
                  }`}>
                    {selected.includes(optName) && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={selected.includes(optName)} onChange={() => toggleOption(optName)} />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchableSelect = ({ title, options, value, onChange, placeholder = "Select...", defaultText = "Any" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Layers size={13} className="text-primary-400" /> {title}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-dark-900/90 border ${
          value 
            ? 'border-primary-500/60 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]' 
            : isOpen 
              ? 'border-primary-500 text-white' 
              : 'border-white/[0.08] text-slate-300 hover:border-white/20'
        } rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none transition-all duration-200 cursor-pointer`}
      >
        <span className="truncate pr-2">{value || placeholder}</span>
        <span className={`transform transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-primary-400' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-dark-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-64 animate-card-pop">
          <div className="p-2 border-b border-white/[0.06] bg-dark-950/60">
            <input 
              type="text"
              placeholder="Buscar..."
              className="w-full bg-dark-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-500 text-white placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            <div 
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white cursor-pointer rounded-xl transition-colors font-medium"
              onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
            >
              {defaultText}
            </div>
            {filteredOptions.map(opt => (
              <div 
                key={opt}
                className={`px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-colors font-medium ${
                  value === opt ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
              >
                {opt}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-xs text-slate-500 text-center">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [allCards, setAllCards] = useState([]);
  const [collection, setCollection] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState([]);
  const [domain, setDomain] = useState([]);
  const [superTypes, setSuperTypes] = useState([]);
  const [editions, setEditions] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [sortBy, setSortBy] = useState('Name');
  const [groupBy, setGroupBy] = useState('None');
  
  // Deck Filters
  const [deckSearch, setDeckSearch] = useState('');
  const [deckDomain, setDeckDomain] = useState([]);
  const [deckLegend, setDeckLegend] = useState('');

  // UI State: Zoom with columns (persisted in localStorage, default 6)
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbound_zoom_columns');
      return saved ? Math.max(2, Math.min(12, parseInt(saved, 10))) : 6;
    } catch {
      return 6;
    }
  });

  const [visibleCount, setVisibleCount] = useState(50);
  const [domainMatchMode, setDomainMatchMode] = useState('OR');

  const [viewMode, setViewMode] = useState('all'); // 'all' or 'collection'
  const [mainTab, setMainTab] = useState('cards'); // 'cards' or 'decks'
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  
  // Sidebar starts OPEN BY DEFAULT as requested ("desplegado de fábrica")
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Floating Zoom HUD
  const [zoomToast, setZoomToast] = useState(null);
  const zoomToastTimeoutRef = useRef(null);

  const triggerZoomToast = (cols) => {
    setZoomToast(cols);
    if (zoomToastTimeoutRef.current) clearTimeout(zoomToastTimeoutRef.current);
    zoomToastTimeoutRef.current = setTimeout(() => {
      setZoomToast(null);
    }, 1300);
  };

  const changeColumns = (delta) => {
    setColumns(prev => {
      const next = Math.max(2, Math.min(12, prev + delta));
      try {
        localStorage.setItem('riftbound_zoom_columns', next.toString());
      } catch (e) {
        console.error(e);
      }
      triggerZoomToast(next);
      return next;
    });
  };

  // Browser-like Zoom with CTRL + MouseWheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // deltaY < 0 is scroll up -> Zoom in -> fewer columns (larger cards)
        // deltaY > 0 is scroll down -> Zoom out -> more columns (smaller cards)
        if (e.deltaY < 0) {
          changeColumns(-1);
        } else if (e.deltaY > 0) {
          changeColumns(1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    setVisibleCount(50);
  }, [search, rarity, cost, type, domain, superTypes, editions, expansions, keywords, tags, domainMatchMode, mainTab, viewMode, sortBy, groupBy]);

  const syncDatabase = async () => {
    if (!window.confirm("¿Deseas sincronizar todas las cartas desde RiftHunt API? Este proceso actualiza expansiones y datos.")) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/sync-cards`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('¡Base de datos sincronizada con éxito!');
        fetchCards();
      } else {
        alert('Error al sincronizar base de datos: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al sincronizar.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/tags`)
      .then(res => res.json())
      .then(data => setAvailableTags(data))
      .catch(err => console.error(err));
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_URL}/cards`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setAllCards(data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const filterOptions = useMemo(() => {
    const superTypeCounts = {};
    const editionCounts = {};
    const expansionCounts = {};
    const keywordCounts = {};

    const legendPrefixes = new Set(allCards.filter(c => c.card_type === 'Legend').map(c => c.name.split(/[-–,]/)[0].trim()));
    const excludedEditions = ['starter', '271', '272', '273', '274', 'launch exclusive', 'ultimate', 'gg ez'];
    const excludedKeywords = ['NO TEXT', '>', '>>', '&GT;', '&GT;&GT;'];

    allCards.forEach(c => {
      // Edition
      const m = c.name.match(/\(([^)]+)\)/);
      const edition = m ? m[1] : 'Standard';
      if (!excludedEditions.includes(edition.toLowerCase())) {
        editionCounts[edition] = (editionCounts[edition] || 0) + 1;
      }
      
      // Expansion
      if (c.set_name) {
        const allowedExpansions = ['radiance', 'vendetta', 'origins', 'spiritforged', 'unleashed'];
        if (allowedExpansions.includes(c.set_name.toLowerCase())) {
          expansionCounts[c.set_name] = (expansionCounts[c.set_name] || 0) + 1;
        }
      }

      // Keywords
      const text = c.ability_text || '';
      const kwMatches = text.match(/\[([^\]]+)\]/g);
      if (kwMatches) {
        kwMatches.forEach(kwMatch => {
          let kw = kwMatch.replace(/\[|\]/g, '').trim();
          kw = kw.replace(/ \d+$/, ''); 
          if (!excludedKeywords.includes(kw.toUpperCase())) {
            kw = kw.charAt(0).toUpperCase() + kw.slice(1);
            keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
          }
        });
      }

      // Super Types
      if (c.name.includes('(Signature)')) superTypeCounts['Signature'] = (superTypeCounts['Signature'] || 0) + 1;
      if (c.name.includes('Basic') || c.rarity === 'Basic') superTypeCounts['Basic'] = (superTypeCounts['Basic'] || 0) + 1;
      if (c.card_type === 'Token' || c.rarity === 'Token') superTypeCounts['Token'] = (superTypeCounts['Token'] || 0) + 1;
      if (c.card_type === 'Unit' && legendPrefixes.has(c.name.split(/[-–,]/)[0].trim())) superTypeCounts['Champion'] = (superTypeCounts['Champion'] || 0) + 1;
    });

    return {
      editions: Object.entries(editionCounts).sort((a, b) => b[1] - a[1]),
      expansions: Object.entries(expansionCounts).sort((a, b) => b[1] - a[1]),
      keywords: Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]),
      superTypes: Object.entries(superTypeCounts).sort((a, b) => b[1] - a[1]),
      legends: Array.from(legendPrefixes).sort()
    };
  }, [allCards]);

  const cards = useMemo(() => {
    const legendPrefixes = new Set(allCards.filter(c => c.card_type === 'Legend').map(c => c.name.split(/[-–,]/)[0].trim()));

    return allCards.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarity && c.rarity?.toLowerCase() !== rarity.toLowerCase()) return false;
      if (cost && c.energy_cost !== parseInt(cost)) return false;
      if (type.length > 0 && !type.some(t => c.card_type?.includes(t))) return false;
      if (domain.length > 0) {
        if (domainMatchMode === 'AND') {
          if (!domain.every(d => c.element?.includes(d))) return false;
        } else {
          if (!domain.some(d => c.element?.includes(d))) return false;
        }
      }
      
      if (superTypes.length > 0) {
        let isMatch = false;
        if (superTypes.includes('Signature') && c.name.includes('(Signature)')) isMatch = true;
        if (superTypes.includes('Basic') && (c.name.includes('Basic') || c.rarity === 'Basic')) isMatch = true;
        if (superTypes.includes('Token') && (c.card_type === 'Token' || c.rarity === 'Token')) isMatch = true;
        if (superTypes.includes('Champion') && c.card_type === 'Unit' && legendPrefixes.has(c.name.split(/[-–,]/)[0].trim())) isMatch = true;
        if (!isMatch) return false;
      }

      if (expansions.length > 0 && !expansions.includes(c.set_name)) return false;

      if (editions.length > 0) {
        const m = c.name.match(/\(([^)]+)\)/);
        const cardEdition = m ? m[1] : 'Standard';
        if (!editions.includes(cardEdition)) return false;
      }

      if (keywords.length > 0) {
        const text = c.ability_text || '';
        const hasAnyKeyword = keywords.some(kw => {
          const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\[${escapedKw}(?: \\d+)?\\]`, 'i');
          return regex.test(text);
        });
        if (!hasAnyKeyword) return false;
      }

      if (tags.length > 0) {
        if (!c.tags) return false;
        const cardTags = c.tags.split(',').map(t => t.trim());
        const hasAnyTag = tags.some(tag => cardTags.includes(tag));
        if (!hasAnyTag) return false;
      }

      return true;
    });
  }, [allCards, search, rarity, cost, type, domain, superTypes, editions, expansions, keywords, tags, domainMatchMode]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (rarity) count++;
    if (cost) count++;
    if (type.length > 0) count += type.length;
    if (domain.length > 0) count += domain.length;
    if (superTypes.length > 0) count += superTypes.length;
    if (expansions.length > 0) count += expansions.length;
    if (editions.length > 0) count += editions.length;
    if (keywords.length > 0) count += keywords.length;
    if (tags.length > 0) count += tags.length;
    return count;
  }, [search, rarity, cost, type, domain, superTypes, expansions, editions, keywords, tags]);

  const clearAllFilters = () => {
    setSearch('');
    setRarity('');
    setCost('');
    setType([]);
    setDomain([]);
    setSuperTypes([]);
    setExpansions([]);
    setEditions([]);
    setKeywords([]);
    setTags([]);
  };

  const fetchCollection = async () => {
    try {
      const res = await fetch(`${API_URL}/collection`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      const colMap = {};
      data.forEach(item => {
        colMap[item.id] = { normal_count: item.normal_count, foil_count: item.foil_count };
      });
      setCollection(colMap);
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCards(), fetchCollection()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateCollection = async (cardId, normalCount, foilCount) => {
    try {
      setCollection(prev => ({
        ...prev,
        [cardId]: { normal_count: normalCount, foil_count: foilCount }
      }));

      const res = await fetch(`${API_URL}/collection/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, normal_count: normalCount, foil_count: foilCount })
      });
      
      if (!res.ok) throw new Error('Update failed');
      await fetchCollection();
    } catch (error) {
      console.error("Error updating collection:", error);
      fetchCollection();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines[0].toLowerCase().includes('cardid')) {
        lines.shift();
      }

      const batchItems = [];
      lines.forEach(line => {
        const match = line.match(/(?:"([^"]*)"|([^,]*))(?:,|$)/g);
        if (!match) return;
        const cols = match.map(m => m.replace(/,$/, '').replace(/^"|"$/g, '').trim());
        
        if (cols.length >= 3) {
           const cardCode = cols[0];
           const normalCount = parseInt(cols[1]) || 0;
           const foilCount = parseInt(cols[2]) || 0;
           
           let card = allCards.find(c => c.card_code && c.card_code.toLowerCase() === cardCode.toLowerCase());
           
           if (!card) {
             const baseCodeMatch = cardCode.match(/^([A-Z]+)-0*(\d+)/i);
             const baseCode = baseCodeMatch ? `${baseCodeMatch[1].toUpperCase()}-${baseCodeMatch[2]}` : cardCode.toUpperCase();
             card = allCards.find(c => {
               if (!c.card_code) return false;
               const dbCodeMatch = c.card_code.match(/^([A-Z]+)-0*(\d+)/i);
               const dbBaseCode = dbCodeMatch ? `${dbCodeMatch[1].toUpperCase()}-${dbCodeMatch[2]}` : c.card_code.toUpperCase();
               return dbBaseCode === baseCode;
             });
           }
           
           if (card) {
             batchItems.push({
                card_id: card.id,
                normal_count: normalCount,
                foil_count: foilCount
             });
           }
        }
      });

      if (batchItems.length > 0) {
        try {
          const res = await fetch(`${API_URL}/collection/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: batchItems })
          });
          if (res.ok) {
            await fetchCollection();
            alert(`¡Colección importada con éxito! (${batchItems.length} cartas actualizadas)`);
          } else {
            alert('Error al importar colección.');
          }
        } catch (err) {
          console.error(err);
          alert('Error de conexión al importar colección.');
        }
      } else {
        alert('No se encontraron cartas válidas en el CSV.');
      }
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const uniqueCardsOwned = Object.keys(collection).filter(id => {
      const c = collection[id];
      return (c.normal_count > 0 || c.foil_count > 0);
  }).length;
  
  const completionPercentage = allCards.length > 0 ? Math.round((uniqueCardsOwned / allCards.length) * 100) : 0;

  const displayedCards = useMemo(() => {
    return [...(viewMode === 'collection' 
      ? cards.filter(c => collection[c.id]?.normal_count > 0 || collection[c.id]?.foil_count > 0)
      : cards)].sort((a, b) => {
        if (sortBy === 'Name') return a.name.localeCompare(b.name);
        if (sortBy === 'Cost') return (a.energy_cost || 0) - (b.energy_cost || 0) || a.name.localeCompare(b.name);
        return 0;
      });
  }, [cards, collection, viewMode, sortBy]);

  const displayedCardsSliced = displayedCards.slice(0, visibleCount);

  const getGroupedCards = () => {
    if (groupBy === 'None') return { 'Todas las Cartas': displayedCardsSliced };
    const groups = {};
    displayedCardsSliced.forEach(c => {
      let key = 'Other';
      if (groupBy === 'Type') key = c.card_type ? c.card_type.split(' - ')[0].trim() : 'Unknown';
      if (groupBy === 'Domain') key = c.element || 'Neutral';
      if (groupBy === 'Cost') key = c.energy_cost !== undefined && c.energy_cost !== null ? `Coste ${c.energy_cost}` : 'Sin Coste';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    
    if (groupBy === 'Cost') {
       return Object.keys(groups).sort((a, b) => {
         if (a === 'Sin Coste') return -1;
         if (b === 'Sin Coste') return 1;
         return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]);
       }).reduce((acc, key) => ({...acc, [key]: groups[key]}), {});
    }
    
    return Object.keys(groups).sort().reduce((acc, key) => ({...acc, [key]: groups[key]}), {});
  };

  return (
    <div className="min-h-screen flex bg-dark-950 overflow-hidden relative selection:bg-primary-500/30">
      
      {/* Ambient background atmosphere glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-primary-600/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-purple-900/10 blur-[160px] pointer-events-none z-0" />

      {/* Floating Zoom Toast HUD */}
      {zoomToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] pointer-events-none zoom-hud">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-dark-900/90 border border-primary-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(139,92,246,0.35)] backdrop-blur-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">Zoom rejilla</span>
            <span className="text-sm font-black text-white px-2.5 py-0.5 rounded-lg bg-primary-600/40 border border-primary-400/30">
              {zoomToast} columnas
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">(Ctrl + Rueda)</span>
          </div>
        </div>
      )}

      {/* Sidebar Overlay (Mobile only) */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md transition-opacity duration-300" 
          onClick={() => setShowSidebar(false)} 
        />
      )}

      {/* Unified Drawer Pull Tab with Arrow (Single control for expanding and retracting) */}
      <button
        onClick={() => setShowSidebar(prev => !prev)}
        style={{
          left: showSidebar ? '20rem' : '0rem',
        }}
        className="fixed top-[18px] sm:top-[22px] z-50 transition-all duration-300 ease-in-out flex items-center justify-center w-7 h-11 sm:h-12 bg-dark-900/95 hover:bg-primary-600 text-slate-300 hover:text-white border-y border-r border-white/20 hover:border-primary-400 rounded-r-xl shadow-[4px_0_20px_rgba(0,0,0,0.6)] backdrop-blur-2xl group cursor-pointer"
        title={showSidebar ? "Contraer panel de filtros" : "Desplegar panel de filtros"}
      >
        {showSidebar ? (
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        ) : (
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        )}
        {!showSidebar && activeFiltersCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-500 text-[9px] font-black text-white flex items-center justify-center shadow-glow-primary">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Modern Collapsible Sidebar / Filters */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 glass-panel border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out bg-dark-950/95 backdrop-blur-2xl ${
        showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/[0.06] flex flex-col gap-4 bg-dark-900/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 p-[1.5px] shadow-glow-primary">
                  <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                    <img src="./favicon.ico" alt="BardoTerra Logo" className="w-5 h-5 object-contain" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent tracking-tight">
                  RiftBard
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Caretaker's Vault</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={syncDatabase} 
                disabled={syncing}
                title="Sincronizar cartas con RiftHunt API"
                className={`p-2 rounded-xl transition-all ${
                  syncing 
                    ? 'bg-primary-600/30 text-primary-300 border border-primary-500/50 animate-pulse' 
                    : 'bg-dark-800/80 text-slate-400 hover:text-white hover:bg-dark-700 border border-white/[0.08] hover:border-white/20 active:scale-95'
                }`}
              >
                <Database size={16} className={syncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Tab Switcher: Cards vs Decks */}
          <div className="flex gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-2xl">
            <button 
              onClick={() => setMainTab('cards')} 
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mainTab === 'cards' 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Layers size={14} /> Cartas
            </button>
            <button 
              onClick={() => setMainTab('decks')} 
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mainTab === 'decks' 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <BookOpen size={14} /> Mazos
            </button>
          </div>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
          {mainTab === 'decks' && !isEditingDeck ? (
            <>
              {/* Deck Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={13} className="text-primary-400" /> Nombre del Mazo
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar mazo..." 
                    className="w-full glass-input pr-8"
                    value={deckSearch}
                    onChange={(e) => setDeckSearch(e.target.value)}
                  />
                  {deckSearch && (
                    <button 
                      onClick={() => setDeckSearch('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Deck Domains */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={13} className="text-primary-400" /> Dominios
                  </label>
                  {deckDomain.length > 0 && (
                    <button onClick={() => setDeckDomain([])} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Mind', 'Order', 'Body', 'Chaos', 'Fury', 'Calm'].map(d => {
                    const style = DOMAIN_STYLES[d];
                    const isSelected = deckDomain.includes(d);
                    return (
                      <button 
                        key={d}
                        onClick={() => setDeckDomain(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected ? style.activeBg : style.inactiveBg
                        }`}
                      >
                        <img src={`https://cdn.piltoverarchive.com/colors/${d}.webp`} alt={d} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display='none'} />
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <SearchableSelect 
                title="Leyenda" 
                options={filterOptions.legends || []} 
                value={deckLegend} 
                onChange={setDeckLegend} 
                placeholder="Nombre de leyenda..." 
                defaultText="Cualquier Leyenda" 
              />
            </>
          ) : (
            <>
              {/* Active filters summary bar with Clear button */}
              {activeFiltersCount > 0 && (
                <div className="bg-primary-950/40 border border-primary-500/30 rounded-2xl p-3 flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-300">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                    <span>{activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}</span>
                  </div>
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-900/80 hover:bg-dark-800 border border-white/10 transition-colors"
                  >
                    <RotateCcw size={12} /> Limpiar
                  </button>
                </div>
              )}

              {/* Card Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={13} className="text-primary-400" /> Búsqueda
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nombre de carta..." 
                    className="w-full glass-input pr-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Rarity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={13} className="text-primary-400" /> Rareza
                  </label>
                  {rarity && (
                    <button onClick={() => setRarity('')} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Todas', value: '' },
                    { label: 'Common', value: 'Common', color: 'bg-slate-400' },
                    { label: 'Uncommon', value: 'Uncommon', color: 'bg-emerald-400' },
                    { label: 'Rare', value: 'Rare', color: 'bg-blue-400' },
                    { label: 'Legendary', value: 'Legendary', color: 'bg-amber-400' },
                  ].map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRarity(r.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        rarity === r.value 
                          ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                          : 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-dark-850 hover:text-white'
                      }`}
                    >
                      {r.color && <span className={`w-2 h-2 rounded-full ${r.color}`} />}
                      <span className="truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Cost */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={13} className="text-primary-400" /> Coste de Energía
                  </label>
                  {cost && (
                    <button onClick={() => setCost('')} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                      Limpiar
                    </button>
                  )}
                </div>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  placeholder="Cualquier coste (ej. 3)" 
                  className="w-full glass-input"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              {/* Card Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-primary-400" /> Tipo de Carta
                  </label>
                  {type.length > 0 && (
                    <button onClick={() => setType([])} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                      Limpiar ({type.length})
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Unit', 'Spell', 'Battlefield', 'Gear', 'Legend', 'Rune'].map(t => {
                    const isSelected = type.includes(t);
                    return (
                      <button 
                        key={t}
                        onClick={() => setType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                            : 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-dark-850 hover:text-white'
                        }`}
                      >
                        <img src={`https://cdn.piltoverarchive.com/types/${t.toLowerCase()}.webp`} alt={t} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display='none'} />
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={13} className="text-primary-400" /> Dominios
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setDomainMatchMode(prev => prev === 'OR' ? 'AND' : 'OR')} 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        domainMatchMode === 'AND' 
                          ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                          : 'bg-dark-800 text-slate-400 border-white/[0.08] hover:text-white'
                      }`}
                      title="Alternar coincidencia AND / OR"
                    >
                      {domainMatchMode}
                    </button>
                    {domain.length > 0 && (
                      <button onClick={() => setDomain([])} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Mind', 'Order', 'Body', 'Chaos', 'Fury', 'Calm'].map(d => {
                    const style = DOMAIN_STYLES[d];
                    const isSelected = domain.includes(d);
                    return (
                      <button 
                        key={d}
                        onClick={() => setDomain(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected ? style.activeBg : style.inactiveBg
                        }`}
                      >
                        <img src={`https://cdn.piltoverarchive.com/colors/${d}.webp`} alt={d} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display='none'} />
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced MultiSelects */}
              <MultiSelectDropdown title="Super Tipo" options={filterOptions.superTypes} selected={superTypes} onChange={setSuperTypes} defaultText="Cualquiera" />
              <MultiSelectDropdown title="Expansión" options={filterOptions.expansions} selected={expansions} onChange={setExpansions} defaultText="Todas las expansiones" />
              <MultiSelectDropdown title="Edición" options={filterOptions.editions} selected={editions} onChange={setEditions} defaultText="Todas las ediciones" />
              <MultiSelectDropdown title="Palabra Clave (Keyword)" options={filterOptions.keywords} selected={keywords} onChange={setKeywords} defaultText="Cualquier Keyword" />
              <MultiSelectDropdown title="Etiquetas (Tags)" options={availableTags.map(t => [t, ''])} selected={tags} onChange={setTags} defaultText="Cualquier Tag" />

              {/* Sorting and Grouping */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown size={13} className="text-primary-400" /> Ordenar por
                  </label>
                  <select 
                    className="w-full glass-input appearance-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Name">Nombre</option>
                    <option value="Cost">Coste de Energía</option>
                  </select>
                </div>

                <div className="space-y-1.5 pb-6">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={13} className="text-primary-400" /> Agrupar por
                  </label>
                  <select 
                    className="w-full glass-input appearance-none cursor-pointer"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="None">Ninguno</option>
                    <option value="Type">Tipo de Carta</option>
                    <option value="Domain">Dominio</option>
                    <option value="Cost">Coste de Energía</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      {mainTab === 'cards' ? (
        <main className={`flex-1 flex flex-col h-screen overflow-hidden w-full relative z-10 transition-all duration-300 ease-in-out ${
          showSidebar ? 'md:ml-80 md:w-[calc(100%-20rem)]' : 'ml-0 w-full'
        }`}>
          
          {/* Topbar Header */}
          <header className="glass-panel border-b border-white/[0.08] px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between sticky top-0 z-30 gap-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Toggle Sidebar Button */}
              <div className="flex items-center gap-3">
              <div className={!showSidebar ? "pl-7 sm:pl-8 transition-all duration-300" : "transition-all duration-300"}>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-normal flex items-center gap-2">
                  Colección
                </h2>
                <p className="text-xs text-slate-400 hidden sm:block">Controla y amplía tus cartas físicas</p>
              </div>
              </div>
              
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-2xl shadow-inner">
                <button 
                  onClick={() => setViewMode('all')} 
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'all' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Todas ({allCards.length})
                </button>
                <button 
                  onClick={() => setViewMode('collection')} 
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'collection' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  En Posesión ({uniqueCardsOwned})
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uploading ? 'opacity-50 cursor-not-allowed text-slate-500' : 'text-primary-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title="Importar colección desde archivo CSV"
                >
                  <Upload size={14} /> {uploading ? 'Importando...' : 'Importar CSV'}
                </button>
                <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
            
            {/* Topbar Right Stats & Zoom */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Browser-like Zoom Controller */}
              <div className="flex items-center gap-1.5 bg-dark-900/90 border border-white/[0.08] rounded-2xl px-3 py-1.5 shadow-md">
                <button 
                  onClick={() => changeColumns(1)} 
                  disabled={columns >= 12}
                  className="w-7 h-7 rounded-lg bg-dark-800/90 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-dark-800 active:scale-90"
                  title="Reducir cartas / Más columnas (Ctrl + Rueda abajo)"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>

                <div className="px-2 flex flex-col items-center">
                  <span className="text-xs font-black text-white">{columns} col</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter hidden md:inline">Ctrl + Rueda</span>
                </div>

                <button 
                  onClick={() => changeColumns(-1)} 
                  disabled={columns <= 2}
                  className="w-7 h-7 rounded-lg bg-dark-800/90 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-dark-800 active:scale-90"
                  title="Ampliar cartas / Menos columnas (Ctrl + Rueda arriba)"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Unique Cards Count */}
              <div className="bg-dark-900/90 border border-white/[0.08] rounded-2xl px-4 py-1.5 flex items-center gap-3 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-white">{uniqueCardsOwned}</span>
                    <span className="text-xs font-semibold text-slate-500">/ {allCards.length}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Únicas</span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-dark-900/90 border border-white/[0.08] rounded-2xl px-4 py-1.5 flex items-center gap-3 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-amber-400">{completionPercentage}%</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Completado</span>
                </div>
              </div>

            </div>
          </header>

          {/* Cards Grid Container */}
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar"
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              if (scrollHeight - scrollTop - clientHeight < 500) {
                if (displayedCards.length > visibleCount) {
                  setVisibleCount(prev => prev + 50);
                }
              }
            }}
          >
            {loading ? (
              <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-400">Cargando colección de cartas...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8 pb-16">
                {Object.entries(getGroupedCards()).map(([groupName, groupCards]) => (
                  <div key={groupName} className="space-y-4">
                    {groupBy !== 'None' && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-glow-primary"></span>
                          <h3 className="text-lg font-black text-white tracking-wide font-display">{groupName}</h3>
                        </div>
                        <div className="h-px bg-white/[0.08] flex-1"></div>
                        <span className="text-xs font-semibold text-slate-400 bg-dark-900 px-3 py-1 rounded-full border border-white/[0.06]">
                          {groupCards.length} cartas
                        </span>
                      </div>
                    )}

                    {/* Responsive Grid with Dynamic Column Count */}
                    <div 
                      className="grid gap-3 sm:gap-4 md:gap-5 transition-all duration-300" 
                      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                    >
                      {groupCards.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          collection={collection[card.id]} 
                          onUpdate={handleUpdateCollection} 
                          onClickCard={setSelectedCardForModal}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && displayedCards.length === 0 && (
              <div className="w-full py-28 flex flex-col items-center justify-center text-slate-400 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-dark-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No se encontraron cartas</h3>
                <p className="text-sm text-slate-400 max-w-sm text-center mb-5">
                  Ninguna carta coincide con los filtros aplicados.
                </p>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="btn-secondary text-xs font-bold"
                  >
                    <RotateCcw size={14} /> Restablecer filtros
                  </button>
                )}
              </div>
            )}

            {!loading && displayedCards.length > visibleCount && (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 rounded-full border-3 border-primary-500/20 border-t-primary-500 animate-spin" />
              </div>
            )}
          </div>
        </main>
      ) : (
        /* Decks Tab */
        <div className={`flex-1 flex flex-col h-screen overflow-hidden w-full relative z-10 transition-all duration-300 ease-in-out ${
          showSidebar ? 'md:ml-80 md:w-[calc(100%-20rem)]' : 'ml-0 w-full'
        }`}>
          <div className="px-5 py-3.5 glass-panel border-b border-white/[0.08] flex justify-between items-center shrink-0">
             <div className={!showSidebar ? "pl-7 sm:pl-8 transition-all duration-300" : "transition-all duration-300"}>
               <h2 className="text-xl font-black text-white font-display tracking-normal">Gestor de Mazos</h2>
               <p className="text-xs text-slate-400 hidden sm:block">Construye, exporta y analiza tus mazos</p>
             </div>

             {/* Browser-like Zoom Controller */}
             <div className="flex items-center gap-1.5 bg-dark-900/90 border border-white/[0.08] rounded-2xl px-3 py-1.5 shadow-md">
               <button 
                 onClick={() => changeColumns(1)} 
                 disabled={columns >= 12}
                 className="w-7 h-7 rounded-lg bg-dark-800/90 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-dark-800 active:scale-90"
                 title="Reducir cartas / Más columnas (Ctrl + Rueda abajo)"
               >
                 <Minus size={13} strokeWidth={2.5} />
               </button>

               <div className="px-2 flex flex-col items-center">
                 <span className="text-xs font-black text-white">{columns} col</span>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter hidden md:inline">Ctrl + Rueda</span>
               </div>

               <button 
                 onClick={() => changeColumns(-1)} 
                 disabled={columns <= 2}
                 className="w-7 h-7 rounded-lg bg-dark-800/90 hover:bg-primary-600 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-dark-800 active:scale-90"
                 title="Ampliar cartas / Menos columnas (Ctrl + Rueda arriba)"
               >
                 <Plus size={13} strokeWidth={2.5} />
               </button>
             </div>
          </div>
          <DeckManager 
            cards={cards}
            groupedCards={getGroupedCards()}
            groupBy={groupBy}
            loading={loading}
            displayedCards={displayedCards}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            collection={collection} 
            API_URL={API_URL} 
            columns={columns}
            setColumns={setColumns}
            setType={setType}
            setDomain={setDomain}
            setSearch={setSearch}
            onClickCard={setSelectedCardForModal}
            onEditDeck={setIsEditingDeck}
            deckSearch={deckSearch}
            deckDomain={deckDomain}
            deckLegend={deckLegend}
          />
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal 
        card={selectedCardForModal} 
        onClose={() => setSelectedCardForModal(null)} 
      />
    </div>
  );
}

export default App;
