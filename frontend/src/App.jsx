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
  Lock, Compass, Sparkles, Tag, ShoppingBag, Copy,
  Share2, ExternalLink, Bookmark, BookmarkCheck, Shield, Menu, Sun, Moon
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
    border: 'hover:border-blue-400',
    activeBg: 'bg-[#1D4ED8] border-[#1D4ED8] text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-blue-50 hover:text-[#1D4ED8]',
    dot: 'bg-blue-500'
  },
  Order: {
    border: 'hover:border-amber-400',
    activeBg: 'bg-[#B45309] border-[#B45309] text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-amber-50 hover:text-[#B45309]',
    dot: 'bg-amber-500'
  },
  Body: {
    border: 'hover:border-orange-400',
    activeBg: 'bg-orange-600 border-orange-600 text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-orange-50 hover:text-orange-700',
    dot: 'bg-orange-500'
  },
  Chaos: {
    border: 'hover:border-purple-400',
    activeBg: 'bg-purple-700 border-purple-700 text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-purple-50 hover:text-purple-700',
    dot: 'bg-purple-500'
  },
  Fury: {
    border: 'hover:border-red-400',
    activeBg: 'bg-[#B91C1C] border-[#B91C1C] text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-red-50 hover:text-[#B91C1C]',
    dot: 'bg-red-500'
  },
  Calm: {
    border: 'hover:border-green-400',
    activeBg: 'bg-[#15803D] border-[#15803D] text-white',
    inactiveBg: 'bg-surface text-ink-primary border-line hover:bg-green-50 hover:text-[#15803D]',
    dot: 'bg-green-500'
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
        <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">{title}</label>
        {hasSelection && (
          <button 
            type="button"
            onClick={() => onChange([])} 
            className="text-[11px] text-[#B45309] hover:text-[#92400E] dark:text-amber-300 font-semibold transition-colors"
          >
            Limpiar ({selected.length})
          </button>
        )}
      </div>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] flex items-center justify-between bg-surface border ${
          hasSelection 
            ? 'border-[#B45309] text-ink-primary' 
            : isOpen 
              ? 'border-[#B45309] text-ink-primary' 
              : 'border-line text-ink-primary hover:border-line-strong'
        } rounded-[10px] px-3.5 py-2 text-xs font-medium focus:outline-none transition-colors`}
      >
        <span className="truncate pr-2">
          {hasSelection ? `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}` : defaultText}
        </span>
        <ChevronDown size={14} className={`transform transition-transform duration-200 text-ink-secondary ${isOpen ? 'rotate-180 text-[#B45309]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-surface border border-line rounded-xl shadow-lg overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-line bg-app">
             <button 
               type="button"
               onClick={() => { onChange([]); setIsOpen(false); }} 
               className="text-xs font-semibold text-ink-secondary hover:text-ink-primary w-full text-left px-2 py-1.5 rounded-lg hover:bg-subtle transition-colors"
             >
               Cualquiera (Limpiar)
             </button>
          </div>
          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {options.map(([optName, count]) => (
              <label 
                key={optName} 
                className="flex items-center justify-between px-2.5 py-2 hover:bg-app rounded-lg cursor-pointer transition-colors"
              >
                <span className="text-xs text-ink-primary truncate pr-2">{optName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {count !== '' && (
                    <span className="text-[10px] font-bold text-ink-secondary bg-subtle px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selected.includes(optName) 
                      ? 'bg-[#B45309] border-[#B45309] text-white' 
                      : 'border-line-strong bg-surface'
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

  const [viewMode, setViewMode] = useState('all'); // 'all', 'collection', 'sale', 'wishlist'
  const [wishlist, setWishlist] = useState(() => {
    try {
      const role = localStorage.getItem('riftbard_user_role') || sessionStorage.getItem('riftbard_user_role');
      if (role === 'guest') {
        const stored = sessionStorage.getItem('riftbard_guest_wishlist');
        return stored ? JSON.parse(stored) : {};
      }
      return {};
    } catch {
      return {};
    }
  });
  const [saleSubFilter, setSaleSubFilter] = useState('all'); // 'all', 'activeOnly', 'autoOnly', 'specialOnly'
  const [copiedSaleList, setCopiedSaleList] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isPublicSaleMode, setIsPublicSaleMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/venta') || search.includes('view=venta') || search.includes('share=venta') || hash.includes('venta');
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/venta') || search.includes('view=venta') || search.includes('share=venta') || hash.includes('venta')) {
        setIsPublicSaleMode(true);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);
  const [manualSales, setManualSales] = useState(() => {
    try {
      const role = localStorage.getItem('riftbard_user_role') || sessionStorage.getItem('riftbard_user_role');
      if (role === 'guest') {
        const stored = sessionStorage.getItem('riftbard_guest_manual_sales');
        return stored ? JSON.parse(stored) : {};
      }
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbard_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#191B20' : '#FFFFFF');
    try {
      localStorage.setItem('riftbard_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
          featured: Boolean(manualSales[card.id]?.featured),
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
        featured: Boolean(manualSales[card.id]?.featured),
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
      const featured = Boolean(saved?.featured);
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
        featured: onSale ? featured : false,
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
    let featuredCardsCount = 0;

    allCards.forEach(card => {
      const userCard = collection[card.id];
      if (!userCard) return;
      const saleData = getCardSaleData(card, userCard);
      if (!saleData) return;

      if (saleData.onSale && saleData.featured) {
        featuredCardsCount += 1;
      }

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
      totalEligibleCount,
      featuredCardsCount
    };
  }, [allCards, collection, manualSales]);

  const displayedCards = useMemo(() => {
    if (viewMode === 'collection') {
      return cards.filter(card => {
        const userCard = collection[card.id];
        return userCard && (userCard.normal_count > 0 || userCard.foil_count > 0);
      });
    }
    if (viewMode === 'wishlist') {
      return cards.filter(card => {
        const val = wishlist[card.id];
        return typeof val === 'number' ? val > 0 : Boolean(val);
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
        if (saleSubFilter === 'featuredOnly') {
          return saleData.onSale && saleData.featured;
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
  }, [cards, viewMode, collection, manualSales, saleSubFilter, wishlist]);

  const wishlistCount = useMemo(() => {
    return Object.keys(wishlist).filter(id => {
      const val = wishlist[id];
      return typeof val === 'number' ? val > 0 : Boolean(val);
    }).length;
  }, [wishlist]);

  const wishlistTotalCopies = useMemo(() => {
    return Object.values(wishlist).reduce((acc, val) => {
      if (typeof val === 'number') return acc + val;
      return acc + (val ? 1 : 0);
    }, 0);
  }, [wishlist]);

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
      } catch (err) {
        console.warn("Backend unreachable during auth check, keeping locked:", err);
        setIsAuthenticated(false);
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
    if (userRole === 'guest') {
      try {
        const stored = sessionStorage.getItem('riftbard_guest_manual_sales');
        setManualSales(stored ? JSON.parse(stored) : {});
      } catch {
        setManualSales({});
      }
      return;
    }
    try {
      let localSales = {};
      try {
        const saved = localStorage.getItem('riftbard_manual_sales');
        if (saved) localSales = JSON.parse(saved);
      } catch {}

      const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/sales/manual`, { headers });
      let serverMap = {};
      if (res.ok) {
        serverMap = await res.json();
      }

      const merged = { ...localSales, ...serverMap };
      
      const localEntries = Object.entries(localSales);
      if (localEntries.length > 0) {
        const missingOnServer = localEntries.filter(([k]) => serverMap[k] === undefined);
        if (missingOnServer.length > 0) {
          fetch(`${API_URL}/sales/manual/batch`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ sales: localSales })
          }).catch(e => console.warn('Could not batch sync manual sales to server:', e));
        }
      }

      setManualSales(merged);
      try {
        localStorage.setItem('riftbard_manual_sales', JSON.stringify(merged));
      } catch {}
    } catch (err) {
      console.warn("Could not fetch manual sales:", err);
    }
  };

  const fetchWishlist = async () => {
    if (userRole === 'guest') {
      try {
        const stored = sessionStorage.getItem('riftbard_guest_wishlist');
        setWishlist(stored ? JSON.parse(stored) : {});
      } catch {
        setWishlist({});
      }
      return;
    }
    try {
      const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/wishlist`, { headers });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach(item => {
          map[item.id] = parseInt(item.quantity, 10) || 1;
        });
        setWishlist(map);
      }
    } catch (err) {
      console.warn("Could not fetch wishlist:", err);
    }
  };

  const handleSetWishlistCount = async (cardId, newCount) => {
    const qty = Math.max(0, parseInt(newCount, 10) || 0);
    const updated = { ...wishlist };
    if (qty === 0) {
      delete updated[cardId];
    } else {
      updated[cardId] = qty;
    }
    setWishlist(updated);

    if (userRole === 'guest') {
      try {
        sessionStorage.setItem('riftbard_guest_wishlist', JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to save guest wishlist:", err);
      }
      return;
    }

    try {
      const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ card_id: cardId, desired: qty > 0, quantity: qty })
      });
    } catch (err) {
      console.warn("Failed to sync wishlist to backend:", err);
    }
  };

  const handleToggleWishlist = async (cardId) => {
    const cur = typeof wishlist[cardId] === 'number' ? wishlist[cardId] : (wishlist[cardId] ? 1 : 0);
    if (cur > 0) {
      await handleSetWishlistCount(cardId, 0);
    } else {
      await handleSetWishlistCount(cardId, 1);
    }
  };

  const handleUnlockSuccess = (token, role = 'owner') => {
    setIsAuthenticated(true);
    setUserRole(role);
    if (role === 'guest') {
      sessionStorage.setItem('riftbard_user_role', 'guest');
      sessionStorage.removeItem('riftbard_guest_collection');
      sessionStorage.removeItem('riftbard_guest_decks');
      sessionStorage.removeItem('riftbard_guest_manual_sales');
      sessionStorage.removeItem('riftbard_guest_wishlist');
      setCollection({});
      setManualSales({});
      setWishlist({});
    } else {
      fetchCollection();
      fetchManualSales();
      fetchWishlist();
    }
  };

  const handleLockVault = () => {
    localStorage.removeItem('riftbard_vault_token');
    localStorage.removeItem('riftbard_user_role');
    sessionStorage.removeItem('riftbard_vault_token');
    sessionStorage.removeItem('riftbard_user_role');
    sessionStorage.removeItem('riftbard_guest_collection');
    sessionStorage.removeItem('riftbard_guest_decks');
    sessionStorage.removeItem('riftbard_guest_manual_sales');
    sessionStorage.removeItem('riftbard_guest_wishlist');
    setIsAuthenticated(false);
    setUserRole('owner');
    setCollection({});
    setManualSales({});
    setWishlist({});
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards();
      fetchCollection();
      fetchTags();
      fetchManualSales();
      fetchWishlist();
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
      const nextFeatured = onSale ? (current.featured || false) : false;
      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          onSale: Boolean(onSale),
          saleTotal: nextSaleTotal,
          featured: nextFeatured
        }
      };
      if (userRole === 'guest') {
        try {
          sessionStorage.setItem('riftbard_guest_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving guest manual sales:", err);
        }
      } else {
        try {
          localStorage.setItem('riftbard_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving manual sales:", err);
        }

        const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`${API_URL}/sales/manual`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            card_id: cardId, 
            on_sale: Boolean(onSale), 
            sale_total: nextSaleTotal,
            featured: nextFeatured
          })
        }).catch(err => console.warn("Failed to sync manual sale to backend:", err));
      }

      return updated;
    });
  };

  const handleToggleFeaturedSale = (cardId, featured) => {
    setManualSales(prev => {
      const userCard = collectionRef.current[cardId] || { normal_count: 0, foil_count: 0 };
      const card = allCards.find(c => c.id === cardId);
      const targetKeep = getPlaysetTarget(card);
      const isAuto = isAutoSurplusRarity(card);
      const total = (userCard.normal_count || 0) + (userCard.foil_count || 0);
      const defaultQty = total > targetKeep ? (total - targetKeep) : 1;
      const current = prev[cardId] || {};
      const nextSaleTotal = current.saleTotal !== undefined ? current.saleTotal : defaultQty;
      const nextOnSale = isAuto ? true : (featured ? true : (current.onSale ?? false));

      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          onSale: nextOnSale,
          saleTotal: nextSaleTotal,
          featured: Boolean(featured)
        }
      };

      if (userRole === 'guest') {
        try {
          sessionStorage.setItem('riftbard_guest_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving guest manual sales:", err);
        }
      } else {
        try {
          localStorage.setItem('riftbard_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving manual sales:", err);
        }

        const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`${API_URL}/sales/manual`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            card_id: cardId,
            on_sale: nextOnSale,
            sale_total: nextSaleTotal,
            featured: Boolean(featured)
          })
        }).catch(err => console.warn("Failed to sync featured sale to backend:", err));
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
          saleTotal: nextQty,
          featured: current.featured || false
        }
      };
      if (userRole === 'guest') {
        try {
          sessionStorage.setItem('riftbard_guest_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving guest manual sales:", err);
        }
      } else {
        try {
          localStorage.setItem('riftbard_manual_sales', JSON.stringify(updated));
        } catch (err) {
          console.error("Error saving manual sales:", err);
        }

        const token = localStorage.getItem('riftbard_vault_token') || sessionStorage.getItem('riftbard_vault_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`${API_URL}/sales/manual`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            card_id: cardId, 
            on_sale: true, 
            sale_total: nextQty,
            featured: current.featured || false
          })
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
      lines.push(`--- COMUNES / POCO COMUNES (EXCEDENTE) ---`);
      lines.push(...autoList);
      lines.push('');
    }

    if (specialList.length > 0) {
      lines.push(`--- RARAS, ÉPICAS, PROMOS & ESPECIALES EN VENTA ---`);
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
      <div className="flex h-screen w-screen items-center justify-center bg-app">
        <div className="w-10 h-10 rounded-full border-4 border-[#B45309]/20 border-t-[#B45309] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <VaultLockScreen API_URL={API_URL} onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-app font-sans text-ink-primary select-none">
      


      {/* Main Content Area */}
      {mainTab === 'cards' ? (
        <main className="w-full min-w-0 flex-1 flex flex-col h-screen overflow-hidden relative pb-16 md:pb-0">
          
          {/* Topbar Header */}
          <header className="border-b border-line px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex flex-col gap-2.5 bg-surface/95 backdrop-blur-md">
            
            {/* Top Row: Brand & Main Navigation (Cards vs Decks) & Stats & Lock */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Brand & Main Tab Switcher */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-subtle border border-line flex items-center justify-center overflow-hidden p-0.5 shrink-0">
                    <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <span className="text-base sm:text-xl font-display font-extrabold text-ink-primary tracking-tight">
                    RiftBard
                  </span>
                </div>

                {/* Desktop Tab Switcher: Cards vs Decks */}
                <div className="hidden md:flex items-center gap-1 bg-subtle border border-line p-1 rounded-[10px]">
                  <button 
                    type="button"
                    onClick={() => setMainTab('cards')} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mainTab === 'cards' 
                        ? 'bg-[#B45309] text-white' 
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface/60'
                    }`}
                  >
                    <Layers size={14} /> <span>Cartas</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMainTab('decks'); setShowCardFilters(false); }} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mainTab === 'decks' 
                        ? 'bg-[#B45309] text-white' 
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface/60'
                    }`}
                  >
                    <BookOpen size={14} /> <span>Mazos</span>
                  </button>
                </div>
              </div>

              {/* Topbar Right Stats & Actions */}
              <div className="flex items-center gap-2">
                {userRole === 'guest' && (
                  <div
                    title="Modo Invitado: Colección de prueba independiente"
                    className="bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Compass size={13} className="text-[#B45309]" />
                    <span className="hidden sm:inline">Invitado</span>
                  </div>
                )}

                {/* Stats Pill */}
                <div
                  className="bg-subtle border border-line rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs"
                  title={`Colección: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)`}
                >
                  <span className="text-[#B45309] font-bold tabular-nums">{completionPercentage}%</span>
                  <span className="hidden sm:inline text-ink-secondary font-medium">
                    ({uniqueCardsOwned}/{allCards.length})
                  </span>
                </div>

                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center rounded-lg border border-line bg-surface hover:bg-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  aria-label="Cambiar tema"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {/* Desktop-only quick actions (in mobile they live in the Menú Action Sheet) */}
                {userRole !== 'guest' && (
                  <button
                    type="button"
                    onClick={syncDatabase}
                    disabled={syncing}
                    title="Sincronizar cartas con RiftHunt API"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-line bg-surface hover:bg-subtle text-ink-primary transition-colors disabled:opacity-50"
                  >
                    <Database size={13} className={syncing ? 'animate-spin text-[#B45309]' : 'text-ink-secondary'} />
                    <span>{syncing ? 'Sincronizando...' : 'Sync'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLockVault}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-line bg-surface hover:bg-red-50 text-ink-secondary hover:text-[#B91C1C] hover:border-red-200 transition-colors cursor-pointer"
                  title={userRole === 'guest' ? 'Salir de Modo Invitado' : 'Bloquear Bóveda'}
                >
                  <Lock size={13} />
                  <span>{userRole === 'guest' ? 'Salir' : 'Bloquear'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Direct Search Bar, Filters Accordion Toggle, and View Mode */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 min-w-0 w-full">
              
              {/* Search input (Always visible outside the panel!) */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Buscar cartas por nombre, tipo..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-h-[44px] bg-surface border border-line text-ink-primary rounded-[10px] pl-10 pr-10 py-2 text-base sm:text-sm font-medium placeholder:text-ink-muted focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
                  />
                  {search && (
                    <button 
                      type="button"
                      onClick={() => setSearch('')} 
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-secondary hover:text-ink-primary rounded-lg transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Open Filters Button (with active filter count badge and chevron) */}
                <button
                  type="button"
                  onClick={() => setShowCardFilters(prev => !prev)}
                  className={`px-3 py-2 min-h-[44px] rounded-[10px] text-xs font-semibold transition-colors flex items-center gap-1.5 border shrink-0 ${
                    advancedFiltersCount > 0 
                      ? 'bg-[#B45309] border-[#B45309] text-white' 
                      : showCardFilters
                        ? 'bg-subtle border-[#B45309]/50 text-ink-primary'
                        : 'bg-surface border-line text-ink-primary hover:bg-subtle'
                  }`}
                  title="Filtros avanzados de cartas"
                >
                  <Filter size={14} className={advancedFiltersCount > 0 ? 'text-white' : 'text-[#B45309]'} />
                  <span>Filtros</span>
                  {advancedFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-surface text-[#B45309] text-[10px] font-bold flex items-center justify-center">
                      {advancedFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${showCardFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* View Mode Switcher: Todas vs En Posesión vs Venta vs Deseadas */}
              <div className="flex items-center gap-1 bg-subtle border border-line p-1 rounded-[10px] w-full sm:w-auto overflow-x-auto no-scrollbar max-w-full">
                <button 
                  type="button"
                  onClick={() => setViewMode('all')} 
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap text-center cursor-pointer shrink-0 ${
                    viewMode === 'all' 
                      ? 'bg-[#B45309] text-white' 
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface/60'
                  }`}
                >
                  Todas ({allCards.length})
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('collection')} 
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap text-center cursor-pointer shrink-0 ${
                    viewMode === 'collection' 
                      ? 'bg-[#B45309] text-white' 
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface/60'
                  }`}
                >
                  <span className="sm:hidden">Posesión ({uniqueCardsOwned})</span>
                  <span className="hidden sm:inline">En Posesión ({uniqueCardsOwned})</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('sale')} 
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    viewMode === 'sale' 
                      ? 'bg-[#15803D] text-white' 
                      : 'text-ink-secondary hover:text-[#15803D] hover:bg-surface/60'
                  }`}
                >
                  <Tag size={12} className={viewMode === 'sale' ? 'text-white' : 'text-[#15803D]'} />
                  <span>Venta ({saleStats.uniqueCardsOnSale})</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode('wishlist')} 
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    viewMode === 'wishlist' 
                      ? 'bg-[#1D4ED8] text-white' 
                      : 'text-ink-secondary hover:text-[#1D4ED8] hover:bg-surface/60'
                  }`}
                >
                  <BookmarkCheck size={12} className={viewMode === 'wishlist' ? 'text-white' : 'text-[#1D4ED8]'} />
                  <span>WishList ({wishlistCount})</span>
                </button>
              </div>
            </div>

          </header>

          {/* Filters Bottom-Sheet (Mobile) / Right Drawer (Desktop) */}
          {showCardFilters && (
            <div
              className="fixed inset-0 z-[60] flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCardFilters(false)}
            >
              <div
                className="w-full sm:max-w-md bg-surface border-t sm:border-t-0 sm:border-l border-line rounded-t-2xl sm:rounded-none flex flex-col max-h-[88vh] sm:max-h-full sm:h-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                  <div className="w-10 h-1 rounded-full bg-[#D0CEC6]" />
                </div>

                <div className="px-4 py-3 border-b border-line bg-app flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink-primary">
                    <Filter size={15} className="text-[#B45309]" />
                    <span>{advancedFiltersCount > 0 ? `Filtros (${advancedFiltersCount} activos)` : 'Filtros de Colección'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {advancedFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-semibold text-[#B45309] hover:text-[#92400E] dark:text-amber-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60"
                      >
                        <RotateCcw size={12} /> Limpiar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCardFilters(false)}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-subtle"
                      aria-label="Cerrar filtros"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                  {/* Rareza */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Rareza</label>
                      {rarity && (
                        <button type="button" onClick={() => setRarity('')} className="text-[11px] text-[#B45309] font-semibold">Limpiar</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Todas', value: '' },
                        { label: 'Common', value: 'Common', color: 'bg-slate-400' },
                        { label: 'Uncommon', value: 'Uncommon', color: 'bg-emerald-500' },
                        { label: 'Rare', value: 'Rare', color: 'bg-blue-500' },
                        { label: 'Epic', value: 'Epic', color: 'bg-purple-500' },
                        { label: 'Promo', value: 'Promo', color: 'bg-rose-500' },
                        { label: 'Showcase', value: 'Showcase', color: 'bg-amber-500' },
                      ].map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRarity(r.value)}
                          className={`min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors border ${
                            rarity === r.value
                              ? 'bg-[#B45309] border-[#B45309] text-white'
                              : 'bg-surface text-ink-primary border-line hover:bg-app'
                          }`}
                        >
                          {r.color && <span className={`w-2 h-2 rounded-full ${r.color}`} />}
                          <span className="truncate">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coste de Energía */}
                  <div className="space-y-2 pt-3 border-t border-line">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Flame size={12} className="text-[#B45309]" /> Coste de Energía
                      </label>
                      {cost !== '' && (
                        <button type="button" onClick={() => setCost('')} className="text-[11px] text-[#B45309] font-semibold">Limpiar</button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['', '0', '1', '2', '3', '4', '5', '6', '7'].map(cVal => (
                        <button
                          key={cVal}
                          type="button"
                          onClick={() => setCost(cVal)}
                          className={`min-w-[40px] min-h-[40px] px-2.5 rounded-[10px] text-xs font-bold flex items-center justify-center transition-colors border ${
                            cost === cVal
                              ? 'bg-[#B45309] border-[#B45309] text-white'
                              : 'bg-surface text-ink-primary border-line hover:bg-app'
                          }`}
                        >
                          {cVal === '' ? 'Todos' : cVal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tipos de Carta */}
                  <div className="space-y-2 pt-3 border-t border-line">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Tipo de Carta</label>
                      {type.length > 0 && (
                        <button type="button" onClick={() => setType([])} className="text-[11px] text-[#B45309] font-semibold">Limpiar ({type.length})</button>
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
                            className={`min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors border ${
                              isSelected
                                ? 'bg-[#B45309] border-[#B45309] text-white'
                                : 'bg-surface text-ink-primary border-line hover:bg-app'
                            }`}
                          >
                            <img src={`https://cdn.piltoverarchive.com/types/${t.toLowerCase()}.webp`} alt={t} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <span className="truncate">{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dominios */}
                  <div className="space-y-2 pt-3 border-t border-line">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Dominios</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDomainMatchMode(prev => prev === 'OR' ? 'AND' : 'OR')}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                            domainMatchMode === 'AND'
                              ? 'bg-[#B45309] border-[#B45309] text-white'
                              : 'bg-subtle text-ink-secondary border-line'
                          }`}
                        >
                          {domainMatchMode}
                        </button>
                        {domain.length > 0 && (
                          <button type="button" onClick={() => setDomain([])} className="text-[11px] text-[#B45309] font-semibold">Limpiar</button>
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
                            className={`min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors border ${
                              isSelected ? style.activeBg : style.inactiveBg
                            }`}
                          >
                            <img src={`https://cdn.piltoverarchive.com/colors/${d}.webp`} alt={d} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <span className="truncate">{d}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avanzados y Ordenación */}
                  <div className="space-y-3 pt-3 border-t border-line">
                    <MultiSelectDropdown title="Super Tipo" options={filterOptions.superTypes} selected={superTypes} onChange={setSuperTypes} defaultText="Cualquiera" />
                    <MultiSelectDropdown title="Expansión" options={filterOptions.expansions} selected={expansions} onChange={setExpansions} defaultText="Todas las expansiones" />
                    <MultiSelectDropdown title="Palabra Clave" options={filterOptions.keywords} selected={keywords} onChange={setKeywords} defaultText="Cualquier Keyword" />

                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1">
                          <ArrowUpDown size={11} className="text-[#B45309]" /> Ordenar
                        </label>
                        <select
                          className="w-full min-h-[44px] bg-surface border border-line text-ink-primary rounded-[10px] px-3 text-sm sm:text-xs font-medium focus:outline-none focus:border-[#B45309]"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="Name">Nombre</option>
                          <option value="Cost">Coste</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1">
                          <Filter size={11} className="text-[#B45309]" /> Agrupar
                        </label>
                        <select
                          className="w-full min-h-[44px] bg-surface border border-line text-ink-primary rounded-[10px] px-3 text-sm sm:text-xs font-medium focus:outline-none focus:border-[#B45309]"
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

                <div className="p-4 border-t border-line bg-app pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
                  <button
                    type="button"
                    onClick={() => setShowCardFilters(false)}
                    className="w-full min-h-[44px] bg-[#B45309] hover:bg-[#92400E] text-white font-semibold text-sm rounded-[10px] transition-colors"
                  >
                    Ver {displayedCards.length} cartas
                  </button>
                </div>
              </div>
            </div>
          )}

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
              <div className="mb-4 p-3 sm:p-5 rounded-xl bg-surface border border-line border-l-4 border-l-[#15803D] flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[10px] bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 flex items-center justify-center text-[#15803D] dark:text-green-400 shrink-0">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-extrabold text-ink-primary font-display flex flex-wrap items-center gap-1.5">
                        <span>Zona de Venta & Cambios</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50 text-[#15803D] dark:text-green-300 border border-green-200 dark:border-green-800">
                          Base: 3x
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-ink-secondary mt-0.5 leading-snug">
                        Common/Uncommon venden excedente (&gt;3x). Raras y Promos son manuales.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                    {userRole !== 'guest' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleShareSaleLink}
                          className={`min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
                            copiedShareLink
                              ? 'bg-[#B45309] text-white border-[#B45309]'
                              : 'bg-[#FFFBEB] dark:bg-amber-950/50 hover:bg-[#FEF3C7] text-[#92400E] dark:text-amber-300 border-[#FDE68A] dark:border-amber-700/60'
                          }`}
                        >
                          {copiedShareLink ? <Check size={14} /> : <Share2 size={14} />}
                          <span className="truncate">{copiedShareLink ? '¡Copiado!' : 'Compartir'}</span>
                        </button>

                        <a
                          href="/venta"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border bg-app hover:bg-subtle text-ink-primary border-line"
                        >
                          <ExternalLink size={13} />
                          <span>Ver /venta</span>
                        </a>
                      </>
                    ) : (
                      <div className="col-span-2 px-3 py-2 rounded-[10px] text-xs font-semibold bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-700/60 flex items-center justify-center gap-1.5">
                        <Shield size={13} />
                        <span>Sesión de invitado</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleCopySaleList}
                      disabled={saleStats.totalCopiesOnSale === 0}
                      className={`col-span-2 sm:col-span-1 min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer disabled:opacity-40 ${
                        copiedSaleList
                          ? 'bg-[#15803D] text-white border-[#15803D]'
                          : 'bg-surface hover:bg-green-50 dark:hover:bg-green-950/40 text-[#15803D] dark:text-green-400 border-green-300 dark:border-green-800'
                      }`}
                    >
                      {copiedSaleList ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedSaleList ? '¡Lista copiada!' : 'Copiar texto'}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-[10px] bg-app border border-line flex flex-col">
                    <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">A la venta</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-extrabold text-[#15803D] dark:text-green-400 tabular-nums">{saleStats.totalCopiesOnSale}</span>
                      <span className="text-[11px] text-ink-secondary">copias</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[10px] bg-app border border-line flex flex-col">
                    <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">Norm / Foil</span>
                    <div className="flex items-baseline gap-1 mt-0.5 text-xs font-bold">
                      <span className="text-ink-primary">{saleStats.normalCopiesOnSale} N</span>
                      <span className="text-ink-muted">·</span>
                      <span className="text-[#B45309] dark:text-amber-400">{saleStats.foilCopiesOnSale} F</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[10px] bg-app border border-line flex flex-col">
                    <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">Modelos</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-extrabold text-ink-primary tabular-nums">{saleStats.uniqueCardsOnSale}</span>
                      <span className="text-[11px] text-ink-secondary">cartas</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[10px] bg-app border border-line flex flex-col">
                    <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">Especiales</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-extrabold text-[#B45309] dark:text-amber-400 tabular-nums">{saleStats.specialCardsOnSaleCount}</span>
                      <span className="text-[11px] text-ink-secondary">de {saleStats.totalSpecialCardsOwned}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs font-semibold pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('all')}
                    className={`min-h-[36px] px-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                      saleSubFilter === 'all'
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-app hover:bg-subtle text-ink-secondary border-line'
                    }`}
                  >
                    Todas ({saleStats.totalEligibleCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('activeOnly')}
                    className={`min-h-[36px] px-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                      saleSubFilter === 'activeOnly'
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-app hover:bg-subtle text-ink-secondary border-line'
                    }`}
                  >
                    Activas ({saleStats.uniqueCardsOnSale})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('featuredOnly')}
                    className={`min-h-[36px] px-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                      saleSubFilter === 'featuredOnly'
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-app hover:bg-subtle text-ink-secondary border-line'
                    }`}
                  >
                    Destacadas ({saleStats.featuredCardsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('autoOnly')}
                    className={`min-h-[36px] px-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                      saleSubFilter === 'autoOnly'
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-app hover:bg-subtle text-ink-secondary border-line'
                    }`}
                  >
                    Auto ({saleStats.autoCardsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleSubFilter('specialOnly')}
                    className={`min-h-[36px] px-2.5 rounded-lg transition-colors shrink-0 cursor-pointer border ${
                      saleSubFilter === 'specialOnly'
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-app hover:bg-subtle text-ink-secondary border-line'
                    }`}
                  >
                    Especiales ({saleStats.totalSpecialCardsOwned})
                  </button>
                </div>
              </div>
            )}

            {/* Wishlist Mode Top Dashboard Banner */}
            {viewMode === 'wishlist' && !loading && (
              <div className="mb-4 p-3 sm:p-5 rounded-xl bg-surface border border-line border-l-4 border-l-[#1D4ED8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400 shrink-0">
                    <BookmarkCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-lg font-extrabold text-ink-primary font-display flex flex-wrap items-center gap-1.5">
                      <span>WishList</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {wishlistCount} {wishlistCount === 1 ? 'carta' : 'cartas'}
                        {wishlistTotalCopies > wishlistCount ? ` (${wishlistTotalCopies} copias)` : ''}
                      </span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-ink-secondary mt-0.5">
                      {userRole === 'guest'
                        ? 'Cartas que buscas conseguir en esta sesión.'
                        : <>Aparecen en el escaparate de <b>/venta</b> para cambios.</>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className="min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-semibold bg-app hover:bg-subtle text-ink-primary border border-line transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search size={13} />
                    <span>Explorar</span>
                  </button>
                  {userRole !== 'guest' && (
                    <a
                      href="/venta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#1D4ED8] dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      <ExternalLink size={13} />
                      <span>Ver /venta</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-[#B45309]/20 border-t-[#B45309] animate-spin" />
                <p className="text-sm font-medium text-ink-secondary">Cargando colección...</p>
              </div>
            ) : displayedCards.length === 0 ? (
              viewMode === 'wishlist' ? (
                <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] mb-4">
                    <BookmarkCheck size={26} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-ink-primary">No tienes cartas en tu WishList</h3>
                  <p className="mt-1 text-xs text-ink-secondary max-w-sm">
                    Explora el catálogo en <b>"Todas"</b> o pulsa el icono de marcador en cualquier carta para añadirla.
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className="mt-5 min-h-[44px] px-5 py-2 rounded-[10px] text-xs font-semibold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-colors cursor-pointer"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : viewMode === 'sale' ? (
                <div className="w-full min-h-[40vh] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-[#15803D] mb-4">
                    <ShoppingBag size={26} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-ink-primary">No hay cartas para venta</h3>
                  <p className="mt-1 text-xs text-ink-secondary max-w-sm">
                    {saleSubFilter === 'activeOnly'
                      ? 'No tienes cartas activas para venta con los filtros actuales.'
                      : 'Common y Uncommon con más de 3 copias aparecen aquí automáticamente. Raras y Promos se activan manualmente.'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                    {saleSubFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSaleSubFilter('all')}
                        className="min-h-[44px] px-4 py-2 rounded-[10px] text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white transition-colors cursor-pointer"
                      >
                        Ver elegibles ({saleStats.totalEligibleCount})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="min-h-[44px] px-4 py-2 rounded-[10px] text-xs font-semibold bg-surface hover:bg-subtle text-ink-primary border border-line transition-colors cursor-pointer"
                    >
                      Explorar catálogo
                    </button>
                  </div>
                </div>
              ) : viewMode === 'collection' ? (
                <div className="w-full min-h-[55vh] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-[#B45309]" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-700/60 mb-3">
                    {userRole === 'guest' ? 'Modo Invitado' : 'Tu Colección'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-ink-primary font-display max-w-md">
                    {userRole === 'guest' ? 'Tu colección de prueba está vacía' : 'Aún no tienes cartas en tu colección'}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-md leading-relaxed">
                    Cambia a la pestaña "Todas" y pulsa + en las cartas que consigas para añadirlas.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="min-h-[44px] px-5 py-2.5 rounded-[10px] font-semibold text-xs sm:text-sm bg-[#B45309] hover:bg-[#92400E] text-white transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Layers size={15} />
                      <span>Explorar todas ({allCards.length})</span>
                    </button>
                    {advancedFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="min-h-[44px] px-4 py-2.5 rounded-[10px] font-semibold text-xs sm:text-sm bg-surface hover:bg-subtle text-ink-primary border border-line transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Limpiar filtros</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center text-ink-muted mb-4">
                    <Search size={24} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-ink-primary">No se encontraron cartas</h3>
                  <p className="mt-1 text-xs text-ink-secondary max-w-xs">
                    Ninguna carta coincide con los filtros seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 min-h-[44px] px-4 py-2 rounded-[10px] text-xs font-semibold bg-[#B45309] hover:bg-[#92400E] text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} /> Limpiar filtros
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-8 pb-20 md:pb-12">
                {Object.entries(getGroupedCards()).map(([groupName, groupCards]) => (
                  <div key={groupName} className="space-y-4">
                    {groupBy !== 'None' && (
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span>
                        <h3 className="text-base sm:text-lg font-extrabold text-ink-primary font-display">{groupName}</h3>
                        <div className="h-px bg-line flex-1"></div>
                        <span className="text-xs font-semibold text-ink-secondary bg-surface px-3 py-1 rounded-full border border-line">
                          {groupCards.length} cartas
                        </span>
                      </div>
                    )}

                    {/* Responsive Grid: 3 columns on mobile, auto-fill on desktop */}
                    <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-1.5 sm:gap-3.5 md:gap-4 select-none">
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
                          onToggleFeaturedSale={handleToggleFeaturedSale}
                          isWishlisted={Boolean(wishlist[card.id] && (typeof wishlist[card.id] === 'number' ? wishlist[card.id] > 0 : true))}
                          wishlistQty={typeof wishlist[card.id] === 'number' ? wishlist[card.id] : (wishlist[card.id] ? 1 : 0)}
                          onToggleWishlist={handleToggleWishlist}
                          onSetWishlistCount={handleSetWishlistCount}
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
        <div className="w-full min-w-0 flex-1 flex flex-col h-screen overflow-hidden relative pb-16 md:pb-0">
          
          {/* Topbar Header for Decks (Only Row 1 Brand & Tab Switcher) */}
          <header className="border-b border-line px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 bg-surface/95 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-subtle border border-line flex items-center justify-center overflow-hidden p-0.5 shrink-0">
                  <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-base sm:text-xl font-display font-extrabold text-ink-primary tracking-tight">
                  RiftBard
                </span>
              </div>

              {/* Desktop Tab Switcher */}
              <div className="hidden md:flex items-center gap-1 bg-subtle border border-line p-1 rounded-[10px]">
                <button 
                  type="button"
                  onClick={() => setMainTab('cards')} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface/60"
                >
                  <Layers size={14} /> <span>Cartas</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setMainTab('decks')} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-[#B45309] text-white"
                >
                  <BookOpen size={14} /> <span>Mazos</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {userRole === 'guest' && (
                <div 
                  title="Modo Invitado"
                  className="bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Compass size={13} className="text-[#B45309] dark:text-amber-400" />
                  <span className="hidden sm:inline">Invitado</span>
                </div>
              )}

              <div 
                className="bg-subtle border border-line rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs" 
                title={`Colección: ${uniqueCardsOwned} / ${allCards.length} (${completionPercentage}%)`}
              >
                <span className="text-[#B45309] font-bold tabular-nums">{completionPercentage}%</span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center rounded-lg border border-line bg-surface hover:bg-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <button
                type="button"
                onClick={handleLockVault}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-line bg-surface hover:bg-red-50 dark:hover:bg-red-950/40 text-ink-secondary hover:text-[#B91C1C] dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors cursor-pointer"
                title={userRole === 'guest' ? "Salir de Modo Invitado" : "Bloquear Bóveda"}
              >
                <Lock size={13} />
                <span>{userRole === 'guest' ? 'Salir' : 'Bloquear'}</span>
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

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navegación principal"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-3 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => { setMainTab('cards'); setShowMobileMenu(false); }}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] text-xs font-semibold transition-colors ${
            mainTab === 'cards' && !showMobileMenu
              ? 'text-[#B45309] bg-[#FFFBEB] dark:bg-amber-950/50'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Layers size={18} />
          <span>Cartas</span>
        </button>
        <button
          type="button"
          onClick={() => { setMainTab('decks'); setShowCardFilters(false); setShowMobileMenu(false); }}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] text-xs font-semibold transition-colors ${
            mainTab === 'decks' && !showMobileMenu
              ? 'text-[#B45309] bg-[#FFFBEB] dark:bg-amber-950/50'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <BookOpen size={18} />
          <span>Mazos</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMobileMenu(true)}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-[10px] text-xs font-semibold transition-colors ${
            showMobileMenu
              ? 'text-[#B45309] bg-[#FFFBEB] dark:bg-amber-950/50'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Menu size={18} />
          <span>Menú</span>
        </button>
      </nav>

      {/* Mobile Action Sheet Menu */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="w-full bg-surface border-t border-line rounded-t-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pb-2">
              <div className="w-10 h-1 rounded-full bg-[#D0CEC6]" />
            </div>
            <div className="flex items-center justify-between px-1 pb-2 border-b border-line">
              <span className="text-sm font-bold text-ink-primary">Opciones de RiftBard</span>
              <span className="text-xs font-semibold text-[#B45309]">{completionPercentage}% completado</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full min-h-[48px] px-4 rounded-xl bg-app hover:bg-subtle border border-line text-ink-primary text-sm font-semibold flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Sun size={18} className="text-[#B45309]" /> : <Moon size={18} className="text-[#B45309]" />}
                <span>Apariencia</span>
              </span>
              <span className="text-xs font-medium text-ink-secondary">
                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            </button>

            {userRole !== 'guest' && (
              <>
                <button
                  type="button"
                  onClick={() => { setShowMobileMenu(false); syncDatabase(); }}
                  disabled={syncing}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-app hover:bg-subtle border border-line text-ink-primary text-sm font-semibold flex items-center gap-3"
                >
                  <Database size={18} className={syncing ? 'animate-spin text-[#B45309]' : 'text-[#B45309]'} />
                  <span>{syncing ? 'Sincronizando catálogo...' : 'Sincronizar catálogo (RiftHunt)'}</span>
                </button>
                <a
                  href="/venta"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-app hover:bg-subtle border border-line text-ink-primary text-sm font-semibold flex items-center gap-3"
                >
                  <ExternalLink size={18} className="text-[#15803D]" />
                  <span>Abrir escaparate público (/venta)</span>
                </a>
              </>
            )}

            <button
              type="button"
              onClick={() => { setShowMobileMenu(false); handleLockVault(); }}
              className="w-full min-h-[48px] px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-[#B91C1C] dark:text-red-300 text-sm font-semibold flex items-center gap-3"
            >
              <Lock size={18} />
              <span>{userRole === 'guest' ? 'Salir de Modo Invitado' : 'Bloquear Bóveda'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal 
        card={selectedCardForModal} 
        onClose={() => setSelectedCardForModal(null)}
        isWishlisted={Boolean(selectedCardForModal && wishlist[selectedCardForModal.id] && (typeof wishlist[selectedCardForModal.id] === 'number' ? wishlist[selectedCardForModal.id] > 0 : true))}
        wishlistQty={selectedCardForModal ? (typeof wishlist[selectedCardForModal.id] === 'number' ? wishlist[selectedCardForModal.id] : (wishlist[selectedCardForModal.id] ? 1 : 0)) : 0}
        onToggleWishlist={handleToggleWishlist}
        onSetWishlistCount={handleSetWishlistCount}
      />
    </div>
  );
}

export default App;
