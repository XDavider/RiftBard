import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from './components/Card';
import DeckManager from './components/DeckManager';
import CardDetailModal from './components/CardDetailModal';
import VaultLockScreen from './components/VaultLockScreen';
import appLogo from './assets/logo.png';
import { 
  Search, Filter, Layers, Database, X, 
  ChevronDown, RotateCcw, Check, ArrowUpDown, Flame, BookOpen,
  Lock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('172.') ||
    window.location.hostname.startsWith('10.')
  )
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : '/api'
);

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
            type="button"
            onClick={() => onChange([])} 
            className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            Limpiar ({selected.length})
          </button>
        )}
      </div>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-dark-900/90 border ${
          hasSelection 
            ? 'border-primary-500/60 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]' 
            : isOpen 
              ? 'border-primary-500 text-white' 
              : 'border-white/[0.08] text-slate-300 hover:border-white/20'
        } rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none transition-all duration-200`}
      >
        <span className="truncate pr-2">
          {hasSelection ? `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}` : defaultText}
        </span>
        <ChevronDown size={13} className={`transform transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-dark-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-64 animate-card-pop">
          <div className="p-2 border-b border-white/[0.06] bg-dark-950/60">
             <button 
               type="button"
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

function App() {
  const [allCards, setAllCards] = useState([]);
  const [collection, setCollection] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Card Filters
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

  // UI State: Zoom with columns (persisted in localStorage, default 2 on mobile, 6 on desktop)
  const [columns, setColumns] = useState(() => {
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const storageKey = isMobile ? 'riftbound_zoom_columns_mobile' : 'riftbound_zoom_columns';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const val = parseInt(saved, 10);
        return isMobile ? Math.max(1, Math.min(5, val)) : Math.max(2, Math.min(12, val));
      }
      return isMobile ? 2 : 6;
    } catch {
      return typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 6;
    }
  });

  const [visibleCount, setVisibleCount] = useState(50);
  const [domainMatchMode, setDomainMatchMode] = useState('OR');

  const [viewMode, setViewMode] = useState('all'); // 'all' or 'collection'
  const [mainTab, setMainTab] = useState('cards'); // 'cards' or 'decks'
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [isPreviewingDeck, setIsPreviewingDeck] = useState(false);
  
  // Top expandable filter tray (Card filters accordion in header)
  const [showCardFilters, setShowCardFilters] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [syncing, setSyncing] = useState(false);
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const minCols = isMobile ? 1 : 2;
    const maxCols = isMobile ? 5 : 12;

    setColumns(prev => {
      const next = Math.max(minCols, Math.min(maxCols, prev + delta));
      try {
        const storageKey = isMobile ? 'riftbound_zoom_columns_mobile' : 'riftbound_zoom_columns';
        localStorage.setItem(storageKey, next.toString());
      } catch (e) {
        console.error(e);
      }
      triggerZoomToast(next);
      return next;
    });
  };

  // Browser-like Zoom with CTRL + MouseWheel (PC)
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
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

  // Touch Pinch-to-Zoom Gesture for Mobile (Google Pixel 9 Pro XL, smartphones)
  useEffect(() => {
    let initialPinchDistance = null;
    const PINCH_THRESHOLD = 35;

    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialPinchDistance = getTouchDistance(e.touches);
      } else {
        initialPinchDistance = null;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && initialPinchDistance !== null) {
        if (e.cancelable) e.preventDefault();

        const currentDistance = getTouchDistance(e.touches);
        const diff = currentDistance - initialPinchDistance;

        if (diff > PINCH_THRESHOLD) {
          changeColumns(-1);
          initialPinchDistance = currentDistance;
        } else if (diff < -PINCH_THRESHOLD) {
          changeColumns(1);
          initialPinchDistance = currentDistance;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        initialPinchDistance = null;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Filter options extraction
  const filterOptions = useMemo(() => {
    const editionCounts = {};
    const expansionCounts = {};
    const keywordCounts = {};
    const superTypeCounts = {
      'Signature': 0,
      'Basic': 0,
      'Token': 0,
      'Champion': 0
    };
    const legendPrefixes = new Set();

    const excludedKeywords = [
      'ACTION', 'REACTION', 'FAST', 'SLOW', 'BURST', 'FOCUS', 'FLEETING',
      'EXHAUST', 'CHANNEL', 'PASSIVE', 'PAY', 'DRAW', 'DISCARD', 'HEAL', 'DAMAGE',
      'KILL', 'STUN', 'RECALL', 'SPEND', 'COST', 'ENERGY', 'POWER', 'HEALTH', 'MIGHT',
      'TARGET', 'CHOOSE', 'ALLY', 'ALLIES', 'ENEMY', 'ENEMIES', 'OPPONENT',
      'BOARD', 'DECK', 'HAND', 'GRAVEYARD', 'DISCARD PILE', 'RUNE POOL',
      'BATTLEFIELD', 'ZONE', 'START', 'END', 'TURN', 'ROUND', 'PHASE',
      'ENTER', 'LEAVE', 'PLAY', 'CAST', 'RESOLVE', 'TRIGGER', 'ATTACK', 'DEFEND',
      'STRIKE', 'BLOCK', 'COMBAT', 'LEVEL', 'TRANSFORM', 'CREATE', 'SUMMON',
      'ATTACH', 'EQUIP', 'COPY', 'REVEAL', 'SEARCH', 'SHUFFLE', 'GAIN', 'DRAIN'
    ];

    allCards.forEach(c => {
      if (c.card_type === 'Legend' && c.name) {
        legendPrefixes.add(c.name.split(/[-–,]/)[0].trim());
      }

      if (c.edition) {
        const ed = c.edition.trim();
        editionCounts[ed] = (editionCounts[ed] || 0) + 1;
      }

      if (c.set_name) {
        const exp = c.set_name.trim();
        expansionCounts[exp] = (expansionCounts[exp] || 0) + 1;
      }

      if (c.effect) {
        const kwMatches = c.effect.match(/\[(.*?)\]/g) || [];
        kwMatches.forEach(kwMatch => {
          let kw = kwMatch.replace(/\[|\]/g, '').trim();
          kw = kw.replace(/ \d+$/, ''); 
          if (!excludedKeywords.includes(kw.toUpperCase())) {
            kw = kw.charAt(0).toUpperCase() + kw.slice(1);
            keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
          }
        });
      }

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

      if (editions.length > 0 && !editions.includes(c.edition)) return false;
      if (expansions.length > 0 && !expansions.includes(c.set_name)) return false;

      if (keywords.length > 0) {
        const cardKws = (c.effect?.match(/\[(.*?)\]/g) || []).map(k => k.replace(/\[|\]/g, '').replace(/ \d+$/, '').trim().toLowerCase());
        if (!keywords.some(k => cardKws.includes(k.toLowerCase()))) return false;
      }

      if (tags.length > 0) {
        const cardTags = (c.tags || []).map(t => t.name.toLowerCase());
        if (!tags.some(t => cardTags.includes(t.toLowerCase()))) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      if (sortBy === 'Cost') {
        const costA = a.energy_cost !== null && a.energy_cost !== undefined ? a.energy_cost : 999;
        const costB = b.energy_cost !== null && b.energy_cost !== undefined ? b.energy_cost : 999;
        return costA - costB;
      }
      return 0;
    });
  }, [allCards, search, rarity, cost, type, domain, domainMatchMode, superTypes, editions, expansions, keywords, tags, sortBy]);

  const displayedCards = useMemo(() => {
    if (viewMode === 'collection') {
      return cards.filter(card => {
        const userCard = collection[card.id];
        return userCard && (userCard.normal_count > 0 || userCard.foil_count > 0);
      });
    }
    return cards;
  }, [cards, viewMode, collection]);

  const getGroupedCards = () => {
    if (groupBy === 'None') return { 'All Cards': displayedCards.slice(0, visibleCount) };
    
    const groups = {};
    displayedCards.slice(0, visibleCount).forEach(c => {
      let key = 'Other';
      if (groupBy === 'Type') key = c.card_type || 'Unknown';
      else if (groupBy === 'Domain') key = c.element || 'Neutral';
      else if (groupBy === 'Cost') key = c.energy_cost !== null && c.energy_cost !== undefined ? `Cost ${c.energy_cost}` : 'No Cost';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_URL}/cards`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setAllCards(data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
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

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token'));
  });
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_URL}/tags`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
      if (!token) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('riftbard_vault_token');
          sessionStorage.removeItem('riftbard_vault_token');
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(true);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  const handleUnlockSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLockVault = () => {
    localStorage.removeItem('riftbard_vault_token');
    sessionStorage.removeItem('riftbard_vault_token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards();
      fetchCollection();
      fetchTags();
    }
  }, [isAuthenticated]);

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

  const syncDatabase = async () => {
    if (!window.confirm("¿Seguro que quieres sincronizar las cartas desde la API oficial de RiftHunt?")) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "¡Sincronización completada!");
        fetchCards();
      } else {
        alert("Error en la sincronización: " + (data.error || "Desconocido"));
      }
    } catch (err) {
      alert("Error conectando al servidor para sincronizar.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setRarity('');
    setCost('');
    setType([]);
    setDomain([]);
    setSuperTypes([]);
    setEditions([]);
    setExpansions([]);
    setKeywords([]);
    setTags([]);
    setSortBy('Name');
    setGroupBy('None');
  };

  const uniqueCardsOwned = Object.keys(collection).filter(id => {
    const item = collection[id];
    return item && (item.normal_count > 0 || item.foil_count > 0);
  }).length;

  const completionPercentage = allCards.length > 0 ? ((uniqueCardsOwned / allCards.length) * 100).toFixed(1) : 0;

  const advancedFiltersCount = (rarity ? 1 : 0) + (cost ? 1 : 0) + type.length + domain.length + superTypes.length + editions.length + expansions.length + keywords.length + tags.length + (sortBy !== 'Name' ? 1 : 0) + (groupBy !== 'None' ? 1 : 0);

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-950">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <VaultLockScreen API_URL={API_URL} onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-950 font-sans text-slate-100 select-none">
      
      {/* Zoom Feedback Floating Toast */}
      {zoomToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-dark-950/95 border border-primary-500/60 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl animate-card-pop flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          <span>Zoom: {zoomToast} columnas</span>
        </div>
      )}

      {/* Main Content Area */}
      {mainTab === 'cards' ? (
        <main className="w-full flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          
          {/* Topbar Header */}
          <header className="glass-panel border-b border-white/[0.08] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex flex-col gap-2.5 shadow-lg bg-dark-950/95 backdrop-blur-xl">
            
            {/* Top Row: Brand & Main Navigation (Cards vs Decks) & Stats & Lock */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Brand & Main Tab Switcher */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 p-[1.5px] shadow-glow-primary shrink-0">
                    <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                      <img src={appLogo} alt="RiftBard" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <span className="text-base sm:text-xl font-black bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent tracking-tight">
                    RiftBard
                  </span>
                </div>

                {/* Main Tab Switcher: Cards vs Decks */}
                <div className="flex items-center gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-xl shadow-inner">
                  <button 
                    type="button"
                    onClick={() => setMainTab('cards')} 
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      mainTab === 'cards' 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Layers size={13} /> <span>Cartas</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMainTab('decks'); setShowCardFilters(false); }} 
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      mainTab === 'decks' 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <BookOpen size={13} /> <span>Mazos</span>
                  </button>
                </div>
              </div>

              {/* Topbar Right Stats & Lock Button */}
              <div className="flex items-center gap-2">
                {/* Sync API button */}
                <button 
                  type="button"
                  onClick={syncDatabase} 
                  disabled={syncing}
                  title="Sincronizar cartas con RiftHunt API"
                  className={`p-1.5 sm:p-2 rounded-xl transition-all hidden sm:flex items-center gap-1.5 text-xs font-bold ${
                    syncing 
                      ? 'bg-primary-600/30 text-primary-300 border border-primary-500/50 animate-pulse' 
                      : 'bg-dark-900 text-slate-400 hover:text-white hover:bg-dark-800 border border-white/[0.08]'
                  }`}
                >
                  <Database size={13} className={syncing ? 'animate-spin' : ''} />
                  <span className="hidden lg:inline">Sync</span>
                </button>

                {/* Stats Pill */}
                <div className="bg-dark-900/90 border border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1 flex items-center gap-2 shadow-sm text-xs">
                  <span className="text-primary-400 font-black">{uniqueCardsOwned}</span>
                  <span className="text-slate-500 text-[10px]">/ {allCards.length}</span>
                  <span className="text-amber-400 font-bold hidden sm:inline">({completionPercentage}%)</span>
                </div>

                {/* Lock Vault */}
                <button
                  type="button"
                  onClick={handleLockVault}
                  className="bg-dark-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 rounded-xl p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Bloquear Bóveda (Cerrar Sesión)"
                >
                  <Lock size={14} />
                  <span className="text-xs font-bold hidden md:inline">Bloquear</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Direct Search Bar, Filters Accordion Toggle, and View Mode */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              
              {/* Search input (Always visible outside the panel!) */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Buscar cartas por nombre, tipo..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-dark-900/90 border border-white/[0.08] text-white rounded-xl pl-9 pr-9 py-2 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all shadow-inner"
                  />
                  {search && (
                    <button 
                      type="button"
                      onClick={() => setSearch('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Open Filters Button (with active filter count badge and chevron) */}
                <button
                  type="button"
                  onClick={() => setShowCardFilters(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                    advancedFiltersCount > 0 
                      ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                      : showCardFilters
                        ? 'bg-dark-800 border-primary-500/50 text-white'
                        : 'bg-dark-900/90 border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                  title="Filtros avanzados de cartas"
                >
                  <Filter size={14} className={advancedFiltersCount > 0 ? 'text-white' : 'text-primary-400'} />
                  <span>Filtros</span>
                  {advancedFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-primary-700 text-[10px] font-black flex items-center justify-center">
                      {advancedFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${showCardFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* View Mode Switcher: Todas vs En Posesión */}
              <div className="flex items-center gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-xl shadow-inner shrink-0 justify-between sm:justify-start">
                <button 
                  type="button"
                  onClick={() => setViewMode('all')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center ${
                    viewMode === 'all' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Todas ({allCards.length})
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('collection')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center ${
                    viewMode === 'collection' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  En Posesión ({uniqueCardsOwned})
                </button>
              </div>
            </div>

            {/* Expandable Top Filter Tray Accordion (Stretches the header smoothly!) */}
            {showCardFilters && (
              <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-3.5 animate-fade-in max-h-[72vh] overflow-y-auto custom-scrollbar">
                
                {/* Accordion Header: Summary & Clear All & Close */}
                <div className="flex items-center justify-between bg-dark-900/80 border border-white/[0.06] p-2.5 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-300">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                    <span>{advancedFiltersCount > 0 ? `${advancedFiltersCount} filtro(s) activo(s)` : 'Filtros de Colección'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {advancedFiltersCount > 0 && (
                      <button 
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 border border-white/10 transition-colors"
                      >
                        <RotateCcw size={12} /> Limpiar todo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCardFilters(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                      title="Ocultar filtros"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Filter Panels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Column 1: Rareza & Coste de Energía */}
                  <div className="space-y-3 bg-dark-900/50 border border-white/[0.05] p-3 rounded-xl">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Filter size={12} className="text-primary-400" /> Rareza
                        </label>
                        {rarity && (
                          <button type="button" onClick={() => setRarity('')} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { label: 'Todas', value: '' },
                          { label: 'Common', value: 'Common', color: 'bg-slate-400' },
                          { label: 'Uncommon', value: 'Uncommon', color: 'bg-emerald-400' },
                          { label: 'Rare', value: 'Rare', color: 'bg-blue-400' },
                          { label: 'Legendary', value: 'Legendary', color: 'bg-amber-400' },
                        ].map(r => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setRarity(r.value)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              rarity === r.value 
                                ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                                : 'bg-dark-900 text-slate-300 border-white/[0.06] hover:bg-dark-850 hover:text-white'
                            }`}
                          >
                            {r.color && <span className={`w-1.5 h-1.5 rounded-full ${r.color}`} />}
                            <span className="truncate">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame size={12} className="text-primary-400" /> Coste de Energía
                        </label>
                        {cost !== '' && (
                          <button type="button" onClick={() => setCost('')} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {['', '0', '1', '2', '3', '4', '5', '6', '7'].map(cVal => (
                          <button
                            key={cVal}
                            type="button"
                            onClick={() => setCost(cVal)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all border ${
                              cost === cVal 
                                ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                                : 'bg-dark-900 text-slate-300 border-white/[0.06] hover:bg-dark-800'
                            }`}
                          >
                            {cVal === '' ? 'All' : cVal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Tipos de Carta */}
                  <div className="space-y-2 bg-dark-900/50 border border-white/[0.05] p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={12} className="text-primary-400" /> Tipo de Carta
                      </label>
                      {type.length > 0 && (
                        <button type="button" onClick={() => setType([])} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                          Limpiar ({type.length})
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Unit', 'Spell', 'Battlefield', 'Gear', 'Legend', 'Rune'].map(t => {
                        const isSelected = type.includes(t);
                        return (
                          <button 
                            key={t}
                            type="button"
                            onClick={() => setType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-primary-600 border-primary-500 text-white shadow-glow-primary' 
                                : 'bg-dark-900 text-slate-300 border-white/[0.06] hover:bg-dark-850 hover:text-white'
                            }`}
                          >
                            <img src={`https://cdn.piltoverarchive.com/types/${t.toLowerCase()}.webp`} alt={t} className="w-3.5 h-3.5 object-contain" onError={(e) => e.target.style.display='none'} />
                            <span className="truncate">{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Dominios con AND/OR */}
                  <div className="space-y-2 bg-dark-900/50 border border-white/[0.05] p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Database size={12} className="text-primary-400" /> Dominios
                      </label>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setDomainMatchMode(prev => prev === 'OR' ? 'AND' : 'OR')} 
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                            domainMatchMode === 'AND' 
                              ? 'bg-primary-600 border-primary-500 text-white' 
                              : 'bg-dark-800 text-slate-400 border-white/[0.08]'
                          }`}
                          title="Alternar coincidencia AND / OR"
                        >
                          {domainMatchMode}
                        </button>
                        {domain.length > 0 && (
                          <button type="button" onClick={() => setDomain([])} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold">
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Mind', 'Order', 'Body', 'Chaos', 'Fury', 'Calm'].map(d => {
                        const style = DOMAIN_STYLES[d];
                        const isSelected = domain.includes(d);
                        return (
                          <button 
                            key={d}
                            type="button"
                            onClick={() => setDomain(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              isSelected ? style.activeBg : style.inactiveBg
                            }`}
                          >
                            <img src={`https://cdn.piltoverarchive.com/colors/${d}.webp`} alt={d} className="w-3.5 h-3.5 object-contain" onError={(e) => e.target.style.display='none'} />
                            <span className="truncate">{d}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 4: Desplegables Avanzados & Ordenación */}
                  <div className="space-y-2.5 bg-dark-900/50 border border-white/[0.05] p-3 rounded-xl">
                    <MultiSelectDropdown title="Super Tipo" options={filterOptions.superTypes} selected={superTypes} onChange={setSuperTypes} defaultText="Cualquiera" />
                    <MultiSelectDropdown title="Expansión" options={filterOptions.expansions} selected={expansions} onChange={setExpansions} defaultText="Todas las expansiones" />
                    <MultiSelectDropdown title="Edición" options={filterOptions.editions} selected={editions} onChange={setEditions} defaultText="Todas las ediciones" />
                    <MultiSelectDropdown title="Palabra Clave" options={filterOptions.keywords} selected={keywords} onChange={setKeywords} defaultText="Cualquier Keyword" />

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ArrowUpDown size={11} className="text-primary-400" /> Ordenar
                        </label>
                        <select 
                          className="w-full glass-input appearance-none cursor-pointer py-1.5 text-xs rounded-lg"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="Name">Nombre</option>
                          <option value="Cost">Coste</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Filter size={11} className="text-primary-400" /> Agrupar
                        </label>
                        <select 
                          className="w-full glass-input appearance-none cursor-pointer py-1.5 text-xs rounded-lg"
                          value={groupBy}
                          onChange={(e) => setGroupBy(e.target.value)}
                        >
                          <option value="None">Ninguno</option>
                          <option value="Type">Tipo</option>
                          <option value="Domain">Dominio</option>
                          <option value="Cost">Coste</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom tray close & apply bar */}
                <div className="flex justify-end pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowCardFilters(false)}
                    className="btn-primary py-1.5 px-4 text-xs font-bold"
                  >
                    Ver {displayedCards.length} cartas filtradas
                  </button>
                </div>

              </div>
            )}

          </header>

          {/* Cards Grid Container */}
          <div 
            className="flex-1 overflow-y-auto p-2.5 sm:p-6 custom-scrollbar touch-pan-y"
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

                    {/* Responsive Grid with Dynamic Column Count from pinch / ctrl+wheel */}
                    <div 
                      className="grid gap-2 sm:gap-4 md:gap-5 transition-all duration-300 select-none" 
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
          </div>

        </main>
      ) : (
        /* Mazos Section */
        <div className="w-full flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          
          {/* Topbar Header for Decks (Only Row 1 Brand & Tab Switcher) */}
          <header className="glass-panel border-b border-white/[0.08] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 bg-dark-950/95 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 p-[1.5px] shadow-glow-primary shrink-0">
                  <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                    <img src={appLogo} alt="RiftBard" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-base sm:text-xl font-black bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent tracking-tight">
                  RiftBard
                </span>
              </div>

              {/* Main Tab Switcher */}
              <div className="flex items-center gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-xl shadow-inner">
                <button 
                  type="button"
                  onClick={() => setMainTab('cards')} 
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                >
                  <Layers size={13} /> <span>Cartas</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setMainTab('decks')} 
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary"
                >
                  <BookOpen size={13} /> <span>Mazos</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-dark-900/90 border border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1 flex items-center gap-2 shadow-sm text-xs">
                <span className="text-primary-400 font-black">{uniqueCardsOwned}</span>
                <span className="text-slate-500 text-[10px]">/ {allCards.length}</span>
              </div>
              <button
                type="button"
                onClick={handleLockVault}
                className="bg-dark-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 rounded-xl p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                title="Bloquear Bóveda"
              >
                <Lock size={14} />
                <span className="text-xs font-bold hidden md:inline">Bloquear</span>
              </button>
            </div>
          </header>

          <DeckManager 
            cards={allCards}
            allCards={allCards}
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
            onPreviewDeck={setIsPreviewingDeck}
            deckSearch={deckSearch}
            setDeckSearch={setDeckSearch}
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
