import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card, { isAlwaysFoil, isAutoSurplusRarity, isCommonRune, getPlaysetTarget } from './components/Card';
import DeckManager from './components/DeckManager';
import CardDetailModal from './components/CardDetailModal';
import VaultLockScreen from './components/VaultLockScreen';
import PublicSaleView from './components/PublicSaleView';
import appLogo from './assets/logo.png';
import { 
  Search, Filter, Layers, Database, X, 
  ChevronDown, RotateCcw, Check, ArrowUpDown, Flame, BookOpen,
  Lock, Compass, Sparkles, Tag, ShoppingBag, Copy, Shield, Package,
  Share2, ExternalLink
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

  const [visibleCount, setVisibleCount] = useState(50);
  const [domainMatchMode, setDomainMatchMode] = useState('OR');

  const [viewMode, setViewMode] = useState('all'); // 'all', 'collection', 'sale'
  const [saleSubFilter, setSaleSubFilter] = useState('all'); // 'all', 'activeOnly', 'autoOnly', 'specialOnly'
  const [copiedSaleList, setCopiedSaleList] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isPublicSaleMode, setIsPublicSaleMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.startsWith('/venta') || search.includes('view=venta') || search.includes('share=venta');
  });
  const [manualSales, setManualSales] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbard_manual_sales');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const collectionRef = useRef(collection);
  collectionRef.current = collection;
  const collectionDebounceTimers = useRef({});

  useEffect(() => {
    return () => {
      Object.values(collectionDebounceTimers.current).forEach(t => clearTimeout(t));
    };
  }, []);
  const [mainTab, setMainTab] = useState('cards'); // 'cards' or 'decks'
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [isPreviewingDeck, setIsPreviewingDeck] = useState(false);
  
  // Top expandable filter tray (Card filters accordion in header)
  const [showCardFilters, setShowCardFilters] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Filter options extraction
  const filterOptions = useMemo(() => {
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
      'ENERGY', 'POWER', 'HEALTH', 'MIGHT', 'PAY', 'DRAW', 'DISCARD', 'HEAL', 'DAMAGE',
      'KILL', 'SPEND', 'COST', 'TARGET', 'CHOOSE', 'ALLY', 'ALLIES', 'ENEMY', 'ENEMIES', 'OPPONENT',
      'BOARD', 'DECK', 'HAND', 'GRAVEYARD', 'DISCARD PILE', 'RUNE POOL',
      'BATTLEFIELD', 'ZONE', 'START', 'END', 'TURN', 'ROUND', 'PHASE',
      'ENTER', 'LEAVE', 'PLAY', 'CAST', 'RESOLVE', 'TRIGGER', 'ATTACK', 'DEFEND',
      'STRIKE', 'BLOCK', 'COMBAT', 'TRANSFORM', 'CREATE', 'SUMMON',
      'ATTACH', 'COPY', 'REVEAL', 'SEARCH', 'SHUFFLE', 'GAIN', 'DRAIN', 'ADD'
    ];

    allCards.forEach(c => {
      if (c.card_type === 'Legend' && c.name) {
        legendPrefixes.add(c.name.split(/[-–,]/)[0].trim());
      }

      if (c.set_name) {
        const exp = c.set_name.trim();
        expansionCounts[exp] = (expansionCounts[exp] || 0) + 1;
      }

      const textToScan = c.ability_text || c.effect;
      if (textToScan) {
        const kwMatches = textToScan.match(/\[(.*?)\]/g) || [];
        kwMatches.forEach(kwMatch => {
          let kw = kwMatch.replace(/\[|\]/g, '').trim();
          kw = kw.replace(/ \d+$/, ''); 
          if (
            kw &&
            kw.length > 1 &&
            !kw.includes('&') &&
            !kw.includes('<') &&
            !kw.includes('>') &&
            kw !== 'NO TEXT' &&
            !excludedKeywords.includes(kw.toUpperCase())
          ) {
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

      if (keywords.length > 0) {
        const textToScan = c.ability_text || c.effect || '';
        const cardKws = (textToScan.match(/\[(.*?)\]/g) || []).map(k => k.replace(/\[|\]/g, '').replace(/ \d+$/, '').trim().toLowerCase());
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
  }, [allCards, search, rarity, cost, type, domain, domainMatchMode, superTypes, expansions, keywords, tags, sortBy]);

  const getCardSaleData = (card, userCard) => {
    if (!card || !userCard) return null;

    // Common runes are strictly excluded from sale as players need many copies
    if (isCommonRune(card)) return null;

    const isAlwaysFoilCard = isAlwaysFoil(card);
    const normalCount = isAlwaysFoilCard ? 0 : (userCard.normal_count || 0);
    const foilCount = isAlwaysFoilCard 
      ? ((userCard.foil_count || 0) + (userCard.normal_count || 0))
      : (userCard.foil_count || 0);
    const totalOwned = normalCount + foilCount;
    if (totalOwned === 0) return null;

    const isAuto = isAutoSurplusRarity(card);
    const targetKeep = getPlaysetTarget(card); // 1 for Battlefields, 3 for other cards

    if (isAuto) {
      if (totalOwned <= targetKeep) {
        return {
          isAuto: true,
          hasSurplus: false,
          onSale: false,
          totalOwned,
          normalCount,
          foilCount,
          saleTotal: 0,
          saleNormal: 0,
          saleFoil: 0,
          keepNormal: normalCount,
          keepFoil: foilCount,
          playsetKept: totalOwned,
          targetKeep
        };
      }

      const surplus = totalOwned - targetKeep;
      const saleNormal = Math.min(normalCount, surplus);
      const saleFoil = surplus - saleNormal;
      const keepNormal = normalCount - saleNormal;
      const keepFoil = foilCount - saleFoil;

      return {
        isAuto: true,
        hasSurplus: true,
        onSale: true,
        totalOwned,
        normalCount,
        foilCount,
        saleTotal: surplus,
        saleNormal,
        saleFoil,
        keepNormal,
        keepFoil,
        playsetKept: targetKeep,
        targetKeep
      };
    } else {
      const saved = manualSales[card.id];
      const onSale = saved?.onSale === true;
      const defaultQty = totalOwned > targetKeep ? (totalOwned - targetKeep) : 1;
      let configuredSaleTotal = saved?.saleTotal !== undefined ? saved.saleTotal : defaultQty;
      configuredSaleTotal = Math.max(1, Math.min(totalOwned, configuredSaleTotal));

      const effectiveSaleQty = onSale ? configuredSaleTotal : 0;
      const saleNormal = Math.min(normalCount, effectiveSaleQty);
      const saleFoil = effectiveSaleQty - saleNormal;
      const keepNormal = normalCount - saleNormal;
      const keepFoil = foilCount - saleFoil;

      return {
        isAuto: false,
        hasSurplus: totalOwned > targetKeep,
        onSale,
        totalOwned,
        normalCount,
        foilCount,
        saleTotal: effectiveSaleQty,
        configuredSaleTotal,
        saleNormal,
        saleFoil,
        keepNormal,
        keepFoil,
        playsetKept: totalOwned - effectiveSaleQty,
        targetKeep
      };
    }
  };

  const saleStats = useMemo(() => {
    let totalCopiesOnSale = 0;
    let normalCopiesOnSale = 0;
    let foilCopiesOnSale = 0;
    let uniqueCardsOnSale = 0;
    let autoCardsCount = 0;
    let specialCardsOnSaleCount = 0;
    let totalSpecialCardsOwned = 0;
    let totalEligibleCount = 0;

    allCards.forEach(card => {
      const userCard = collection[card.id];
      if (!userCard) return;
      const saleData = getCardSaleData(card, userCard);
      if (!saleData) return;

      if (saleData.isAuto) {
        if (saleData.hasSurplus) {
          totalCopiesOnSale += saleData.saleTotal;
          normalCopiesOnSale += saleData.saleNormal;
          foilCopiesOnSale += saleData.saleFoil;
          uniqueCardsOnSale += 1;
          autoCardsCount += 1;
          totalEligibleCount += 1;
        }
      } else {
        totalSpecialCardsOwned += 1;
        totalEligibleCount += 1;
        if (saleData.onSale && saleData.saleTotal > 0) {
          totalCopiesOnSale += saleData.saleTotal;
          normalCopiesOnSale += saleData.saleNormal;
          foilCopiesOnSale += saleData.saleFoil;
          uniqueCardsOnSale += 1;
          specialCardsOnSaleCount += 1;
        }
      }
    });

    return {
      totalCopiesOnSale,
      normalCopiesOnSale,
      foilCopiesOnSale,
      uniqueCardsOnSale,
      autoCardsCount,
      specialCardsOnSaleCount,
      totalSpecialCardsOwned,
      totalEligibleCount
    };
  }, [allCards, collection, manualSales]);

  const displayedCards = useMemo(() => {
    if (viewMode === 'collection') {
      return cards.filter(card => {
        const userCard = collection[card.id];
        return userCard && (userCard.normal_count > 0 || userCard.foil_count > 0);
      });
    }
    if (viewMode === 'sale') {
      return cards.filter(card => {
        const userCard = collection[card.id];
        if (!userCard) return false;
        const saleData = getCardSaleData(card, userCard);
        if (!saleData) return false;

        if (saleSubFilter === 'activeOnly') {
          return saleData.onSale && saleData.saleTotal > 0;
        }
        if (saleSubFilter === 'autoOnly') {
          return saleData.isAuto && saleData.hasSurplus;
        }
        if (saleSubFilter === 'specialOnly') {
          return !saleData.isAuto;
        }
        return (saleData.isAuto && saleData.hasSurplus) || !saleData.isAuto;
      });
    }
    return cards;
  }, [cards, viewMode, collection, manualSales, saleSubFilter]);

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

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('riftbard_user_role') || sessionStorage.getItem('riftbard_user_role') || 'owner';
  });

  const fetchCollection = async () => {
    if (userRole === 'guest') {
      try {
        const stored = sessionStorage.getItem('riftbard_guest_collection');
        setCollection(stored ? JSON.parse(stored) : {});
      } catch {
        setCollection({});
      }
      return;
    }

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
          const data = await res.json();
          setIsAuthenticated(true);
          const currentRole = data.role || 'owner';
          setUserRole(currentRole);
          if (currentRole === 'guest') {
            sessionStorage.setItem('riftbard_user_role', 'guest');
          }
        } else {
          handleLockVault();
        }
      } catch {
        setIsAuthenticated(true);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();

    const handleVaultLockedEvent = () => handleLockVault();
    window.addEventListener('vault_locked', handleVaultLockedEvent);
    return () => window.removeEventListener('vault_locked', handleVaultLockedEvent);
  }, []);

  const fetchManualSales = async () => {
    if (userRole === 'guest') return;
    try {
      const res = await fetch(`${API_URL}/sales/manual`);
      if (res.ok) {
        const data = await res.json();
        setManualSales(prev => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem('riftbard_manual_sales', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn("Could not fetch manual sales:", err);
    }
  };

  const handleUnlockSuccess = (token, role = 'owner') => {
    setIsAuthenticated(true);
    setUserRole(role);
    if (role === 'guest') {
      sessionStorage.setItem('riftbard_user_role', 'guest');
      sessionStorage.removeItem('riftbard_guest_collection');
      sessionStorage.removeItem('riftbard_guest_decks');
      setCollection({});
    } else {
      fetchCollection();
      fetchManualSales();
    }
  };

  const handleLockVault = () => {
    localStorage.removeItem('riftbard_vault_token');
    localStorage.removeItem('riftbard_user_role');
    sessionStorage.removeItem('riftbard_vault_token');
    sessionStorage.removeItem('riftbard_user_role');
    sessionStorage.removeItem('riftbard_guest_collection');
    sessionStorage.removeItem('riftbard_guest_decks');
    setIsAuthenticated(false);
    setUserRole('owner');
    setCollection({});
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards();
      fetchCollection();
      fetchTags();
      fetchManualSales();
    }
  }, [isAuthenticated, userRole]);

  const handleUpdateCollection = (cardId, normalCount, foilCount) => {
    const updated = {
      ...collectionRef.current,
      [cardId]: { normal_count: normalCount, foil_count: foilCount }
    };
    collectionRef.current = updated;
    setCollection(updated);

    if (userRole === 'guest') {
      try {
        sessionStorage.setItem('riftbard_guest_collection', JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving guest collection:", err);
      }
      return;
    }

    // Debounced backend sync: 350ms per cardId to allow lightning-fast repeated clicks
    if (collectionDebounceTimers.current[cardId]) {
      clearTimeout(collectionDebounceTimers.current[cardId]);
    }
    collectionDebounceTimers.current[cardId] = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/collection/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, normal_count: normalCount, foil_count: foilCount })
        });
        if (!res.ok) throw new Error('Update failed');
      } catch (error) {
        console.error("Error updating collection:", error);
        fetchCollection();
      } finally {
        delete collectionDebounceTimers.current[cardId];
      }
    }, 350);
  };

  const handleToggleManualSale = (cardId, onSale) => {
    setManualSales(prev => {
      const userCard = collectionRef.current[cardId] || { normal_count: 0, foil_count: 0 };
      const card = allCards.find(c => c.id === cardId);
      const targetKeep = getPlaysetTarget(card);
      const total = (userCard.normal_count || 0) + (userCard.foil_count || 0);
      const defaultQty = total > targetKeep ? (total - targetKeep) : 1;
      const current = prev[cardId] || {};
      const nextSaleTotal = current.saleTotal !== undefined ? current.saleTotal : defaultQty;
      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          onSale: Boolean(onSale),
          saleTotal: nextSaleTotal
        }
      };
      try {
        localStorage.setItem('riftbard_manual_sales', JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving manual sales:", err);
      }

      if (userRole !== 'guest') {
        fetch(`${API_URL}/sales/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, on_sale: Boolean(onSale), sale_total: nextSaleTotal })
        }).catch(err => console.warn("Failed to sync manual sale to backend:", err));
      }

      return updated;
    });
  };

  const handleAdjustManualSale = (cardId, delta) => {
    setManualSales(prev => {
      const userCard = collectionRef.current[cardId] || { normal_count: 0, foil_count: 0 };
      const card = allCards.find(c => c.id === cardId);
      const targetKeep = getPlaysetTarget(card);
      const total = (userCard.normal_count || 0) + (userCard.foil_count || 0);
      const current = prev[cardId] || { onSale: true, saleTotal: 1 };
      const curQty = current.saleTotal !== undefined ? current.saleTotal : (total > targetKeep ? total - targetKeep : 1);
      const nextQty = Math.max(1, Math.min(total, curQty + delta));
      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          onSale: true,
          saleTotal: nextQty
        }
      };
      try {
        localStorage.setItem('riftbard_manual_sales', JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving manual sales:", err);
      }

      if (userRole !== 'guest') {
        fetch(`${API_URL}/sales/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, on_sale: true, sale_total: nextQty })
        }).catch(err => console.warn("Failed to sync manual sale to backend:", err));
      }

      return updated;
    });
  };

  const handleShareSaleLink = () => {
    const shareUrl = `${window.location.origin}/venta`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleCopySaleList = () => {
    const lines = [];
    lines.push(`📦 LISTA DE CARTAS A LA VENTA / TRADE - RIFTBOUND (RiftBard)`);
    lines.push(`Total a la venta: ${saleStats.totalCopiesOnSale} cartas (${saleStats.normalCopiesOnSale} normales, ${saleStats.foilCopiesOnSale} foils)\n`);

    const autoList = [];
    const specialList = [];

    allCards.forEach(card => {
      const userCard = collectionRef.current[card.id];
      if (!userCard) return;
      const saleData = getCardSaleData(card, userCard);
      if (saleData && saleData.onSale && saleData.saleTotal > 0) {
        let details = [];
        if (saleData.saleNormal > 0) details.push(`${saleData.saleNormal} Normal`);
        if (saleData.saleFoil > 0) details.push(`${saleData.saleFoil} Foil✨`);
        const line = `• ${saleData.saleTotal}x ${card.name} [${card.rarity}] (${details.join(', ')}) - ${card.set_name || 'Set 1'}`;
        if (saleData.isAuto) {
          autoList.push(line);
        } else {
          specialList.push(line);
        }
      }
    });

    if (autoList.length > 0) {
      lines.push(`--- COMUNES / POCO COMUNES / RARAS (EXCEDENTE) ---`);
      lines.push(...autoList);
      lines.push('');
    }

    if (specialList.length > 0) {
      lines.push(`--- ÉPICAS & ESPECIALES EN VENTA ---`);
      lines.push(...specialList);
      lines.push('');
    }

    if (autoList.length === 0 && specialList.length === 0) {
      lines.push('Actualmente no hay cartas marcadas para la venta.');
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSaleList(true);
    setTimeout(() => setCopiedSaleList(false), 2500);
  };

  const syncDatabase = async () => {
    if (!window.confirm("¿Seguro que quieres sincronizar las cartas desde la API oficial de RiftHunt?")) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "¡Sincronización completada con éxito!");
        await fetchCards();
        await fetchTags();
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

  const advancedFiltersCount = (rarity ? 1 : 0) + (cost ? 1 : 0) + type.length + domain.length + superTypes.length + expansions.length + keywords.length + tags.length + (sortBy !== 'Name' ? 1 : 0) + (groupBy !== 'None' ? 1 : 0);

  if (isPublicSaleMode) {
    return (
      <PublicSaleView 
        onExitPublicMode={() => {
          setIsPublicSaleMode(false);
          if (window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
        }} 
      />
    );
  }

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
      


      {/* Main Content Area */}
      {mainTab === 'cards' ? (
        <main className="w-full flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          
          {/* Topbar Header */}
          <header className="glass-panel border-b border-white/[0.08] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex flex-col gap-2.5 shadow-lg bg-dark-950/95 backdrop-blur-xl">
            
            {/* Top Row: Brand & Main Navigation (Cards vs Decks) & Stats & Lock */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Brand & Main Tab Switcher */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative group shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 opacity-40 blur-md group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-9 h-9 rounded-xl bg-dark-900 border border-amber-400/40 flex items-center justify-center overflow-hidden shadow-glow-primary p-0.5">
                      <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                  </div>
                  <span className="text-base sm:text-xl font-black bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent tracking-tight">
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
                {userRole !== 'guest' ? (
                  <button 
                    type="button"
                    onClick={syncDatabase} 
                    disabled={syncing}
                    title="Sincronizar cartas con RiftHunt API"
                    className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                      syncing 
                        ? 'bg-primary-600/30 text-primary-300 border border-primary-500/50 animate-pulse' 
                        : 'bg-dark-900 text-slate-400 hover:text-white hover:bg-dark-800 border border-white/[0.08]'
                    }`}
                  >
                    <Database size={13} className={syncing ? 'animate-spin text-primary-400' : ''} />
                    <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sync'}</span>
                  </button>
                ) : (
                  <div 
                    title="Modo Invitado: Estás usando una colección de prueba independiente que inicia desde 0"
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-2.5 sm:px-3 py-1 flex items-center gap-1.5 shadow-sm text-xs font-semibold"
                  >
                    <Compass size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">Modo Invitado</span>
                    <span className="sm:hidden">Invitado</span>
                  </div>
                )}

                {/* Stats Pill */}
                <div 
                  className="bg-dark-900/90 border border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1 flex items-center shadow-sm text-xs" 
                  title={userRole === 'guest' ? `Colección Invitado: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)` : `Colección: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)`}
                >
                  <span className="text-amber-400 font-black tracking-tight">{completionPercentage}%</span>
                </div>

                {/* Lock Vault */}
                <button
                  type="button"
                  onClick={handleLockVault}
                  className="bg-dark-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 rounded-xl p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  title={userRole === 'guest' ? "Salir de Modo Invitado" : "Bloquear Bóveda (Cerrar Sesión)"}
                >
                  <Lock size={14} />
                  <span className="text-xs font-bold hidden md:inline">{userRole === 'guest' ? 'Salir' : 'Bloquear'}</span>
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

              {/* View Mode Switcher: Todas vs En Posesión vs Venta */}
              <div className="flex items-center gap-1 bg-dark-900/90 border border-white/[0.08] p-1 rounded-xl shadow-inner shrink-0 justify-between sm:justify-start">
                <button 
                  type="button"
                  onClick={() => setViewMode('all')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center cursor-pointer ${
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
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center cursor-pointer ${
                    viewMode === 'collection' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  En Posesión ({uniqueCardsOwned})
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('sale')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    viewMode === 'sale' 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Tag size={12} className={viewMode === 'sale' ? 'text-white' : 'text-emerald-400'} />
                  <span>Venta ({saleStats.uniqueCardsOnSale})</span>
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
                          { label: 'Epic', value: 'Epic', color: 'bg-purple-400' },
                          { label: 'Promo', value: 'Promo', color: 'bg-rose-400' },
                          { label: 'Showcase', value: 'Showcase', color: 'bg-amber-400' },
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
            {/* Venta Mode Top Dashboard Banner */}
            {viewMode === 'sale' && !loading && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-dark-900/90 to-dark-950 border border-emerald-500/30 shadow-[0_8px_32px_rgba(16,185,129,0.12)] flex flex-col gap-4 animate-fadeIn">
                {/* Top Row: Title + Copy Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                        <span>Zona de Venta & Cambios</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Base: 3x (1x Battlefields)
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Common, Uncommon y Rare ponen a la venta su excedente (&gt;3x, o &gt;1x en Battlefields) priorizando normales sobre foil. Las runas comunes están excluidas y en el resto de rarezas tú decides.
                      </p>
                    </div>
                  </div>

                  {/* Actions: Share Link, Preview, Copy List */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Share Public Link Button */}
                    <button
                      type="button"
                      onClick={handleShareSaleLink}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer shadow-md active:scale-95 ${
                        copiedShareLink
                          ? 'bg-amber-500 text-dark-950 border-amber-400 font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-amber-300 hover:text-white border-amber-500/40 hover:border-amber-400'
                      }`}
                      title="Copiar enlace web público para compartir con tus amigos para que elijan cartas"
                    >
                      {copiedShareLink ? <Check size={14} className="text-dark-950 font-black" /> : <Share2 size={14} />}
                      <span>{copiedShareLink ? '¡Enlace de venta copiado!' : 'Compartir enlace público'}</span>
                    </button>

                    {/* Preview Public Store View */}
                    <a
                      href="/venta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border bg-dark-900/90 hover:bg-white/10 text-slate-300 hover:text-white border-white/10 hover:border-white/20 shadow-sm"
                      title="Ver el catálogo público que ven tus amigos en una pestaña nueva"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden sm:inline">Vista previa amigos</span>
                    </a>

                    {/* Copy List Button */}
                    <button
                      type="button"
                      onClick={handleCopySaleList}
                      disabled={saleStats.totalCopiesOnSale === 0}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer shadow-md active:scale-95 ${
                        copiedSaleList
                          ? 'bg-emerald-500 text-dark-950 border-emerald-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                          : 'bg-dark-900/90 hover:bg-emerald-600/20 text-emerald-300 hover:text-white border-emerald-500/40 hover:border-emerald-400'
                      }`}
                      title="Copiar lista de cartas a la venta formateada para Discord / WhatsApp / Foros"
                    >
                      {copiedSaleList ? <Check size={14} className="text-dark-950 font-black" /> : <Copy size={14} />}
                      <span>{copiedSaleList ? '¡Lista copiada!' : 'Copiar texto'}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-dark-950/70 border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total a la venta</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-2xl font-black text-emerald-300">{saleStats.totalCopiesOnSale}</span>
                      <span className="text-xs text-slate-400 font-semibold">copias</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Normales / Foils</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5 text-xs sm:text-sm font-bold">
                      <span className="text-slate-200">{saleStats.normalCopiesOnSale} norm</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-300 flex items-center gap-0.5">
                        <Sparkles size={11} className="text-amber-400" />
                        {saleStats.foilCopiesOnSale} foil
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Modelos Únicos</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-2xl font-black text-white">{saleStats.uniqueCardsOnSale}</span>
                      <span className="text-xs text-slate-400 font-semibold">cartas</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-dark-950/70 border border-purple-500/20 flex flex-col">
                    <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">Especiales en Venta</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-2xl font-black text-purple-300">{saleStats.specialCardsOnSaleCount}</span>
                      <span className="text-xs text-slate-400 font-semibold">de {saleStats.totalSpecialCardsOwned}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs font-bold pt-1 border-t border-white/[0.06]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filtrar:</span>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      saleSubFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-dark-950/80 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    Todas ({saleStats.totalEligibleCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('activeOnly')}
                    className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      saleSubFilter === 'activeOnly'
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-dark-950/80 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    Solo Activas a la Venta ({saleStats.uniqueCardsOnSale})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('autoOnly')}
                    className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      saleSubFilter === 'autoOnly'
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-dark-950/80 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    📦 Automáticas (&gt;3x) ({saleStats.autoCardsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('specialOnly')}
                    className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      saleSubFilter === 'specialOnly'
                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-dark-950/80 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    💎 Especiales ({saleStats.totalSpecialCardsOwned})
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-400">Cargando colección de cartas...</p>
              </div>
            ) : displayedCards.length === 0 ? (
              viewMode === 'sale' ? (
                <div className="w-full min-h-[40vh] flex flex-col items-center justify-center text-center p-6 select-none animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">No hay cartas para venta</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    {saleSubFilter === 'activeOnly'
                      ? 'No tienes cartas marcadas activamente para venta con los filtros actuales.'
                      : 'Las cartas Common, Uncommon y Rare con más de 3 copias aparecerán aquí automáticamente. También puedes activar cartas Épicas o Especiales manualmente.'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                    {saleSubFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSaleSubFilter('all')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
                      >
                        Ver todas las elegibles ({saleStats.totalEligibleCount})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-dark-900 hover:bg-dark-800 text-slate-300 border border-white/10 transition-all cursor-pointer"
                    >
                      Explorar catálogo completo
                    </button>
                  </div>
                </div>
              ) : viewMode === 'collection' ? (
                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6 sm:p-10 select-none animate-fadeIn">
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-dark-900 via-dark-850 to-amber-950/40 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] p-4">
                      <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
                    {userRole === 'guest' ? 'Modo Invitado • Colección de Prueba' : 'Tu Colección'}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight max-w-md">
                    {userRole === 'guest' 
                      ? 'Tu colección de prueba está vacía'
                      : 'Aún no tienes cartas en tu colección'}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                    {userRole === 'guest'
                      ? 'Explora el catálogo completo en la pestaña "Todas" y pulsa los botones [+] de las cartas para añadirlas a tu colección y testear el tracker y los mazos.'
                      : 'Cambia a la vista "Todas" y pulsa el botón [+] en las cartas que vayas consiguiendo para añadirlas a tu colección.'}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Layers size={15} />
                      <span>Explorar todas las cartas ({allCards.length})</span>
                    </button>
                    {advancedFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-dark-900 hover:bg-dark-850 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Limpiar filtros</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                    <Search size={28} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">No se encontraron cartas</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Ninguna carta coincide con los filtros de búsqueda seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white transition-all flex items-center gap-1.5 shadow-glow-primary cursor-pointer"
                  >
                    <RotateCcw size={13} /> Limpiar todos los filtros
                  </button>
                </div>
              )
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

                    {/* Responsive Grid: 3 columns on mobile, auto-fill scaling up to 6 on desktop */}
                    <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-1.5 sm:gap-3.5 md:gap-4 transition-all duration-300 select-none">
                      {groupCards.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          collection={collection[card.id]} 
                          onUpdate={handleUpdateCollection} 
                          onClickCard={setSelectedCardForModal} 
                          viewMode={viewMode}
                          saleData={getCardSaleData(card, collection[card.id])}
                          onToggleManualSale={handleToggleManualSale}
                          onAdjustManualSale={handleAdjustManualSale}
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
              <div className="flex items-center gap-2.5">
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 opacity-40 blur-md group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-dark-900 border border-amber-400/40 flex items-center justify-center overflow-hidden shadow-glow-primary p-0.5">
                    <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                </div>
                <span className="text-base sm:text-xl font-black bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent tracking-tight">
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
              {userRole === 'guest' && (
                <div 
                  title="Modo Invitado"
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-2.5 sm:px-3 py-1 flex items-center gap-1.5 shadow-sm text-xs font-semibold"
                >
                  <Compass size={13} className="text-amber-400" />
                  <span className="hidden sm:inline">Modo Invitado</span>
                  <span className="sm:hidden">Invitado</span>
                </div>
              )}

              <div 
                className="bg-dark-900/90 border border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1 flex items-center shadow-sm text-xs" 
                title={userRole === 'guest' ? `Colección Invitado: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)` : `Colección: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)`}
              >
                <span className="text-amber-400 font-black tracking-tight">{completionPercentage}%</span>
              </div>
              <button
                type="button"
                onClick={handleLockVault}
                className="bg-dark-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 rounded-xl p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                title={userRole === 'guest' ? "Salir de Modo Invitado" : "Bloquear Bóveda"}
              >
                <Lock size={14} />
                <span className="text-xs font-bold hidden md:inline">{userRole === 'guest' ? 'Salir' : 'Bloquear'}</span>
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
            userRole={userRole}
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
