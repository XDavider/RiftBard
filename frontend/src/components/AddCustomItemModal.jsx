import React, { useState } from 'react';
import { X, Plus, Sparkles, Package, Loader2 } from 'lucide-react';

export default function AddCustomItemModal({ isOpen, onClose, API_URL, existingExpansions = [], onItemCreated }) {
  const [itemKind, setItemKind] = useState('card'); // 'card' | 'product'
  const [name, setName] = useState('');
  const [expansionSelect, setExpansionSelect] = useState('Promotional Cards');
  const [customExpansion, setCustomExpansion] = useState('');
  const [cardType, setCardType] = useState('Unit');
  const [productType, setProductType] = useState('Producto');
  const [rarity, setRarity] = useState('Promo');
  const [element, setElement] = useState('');
  const [energyCost, setEnergyCost] = useState('');
  const [abilityText, setAbilityText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [normalCount, setNormalCount] = useState(1);
  const [foilCount, setFoilCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setExpansionSelect('Promotional Cards');
    setCustomExpansion('');
    setEnergyCost('');
    setAbilityText('');
    setImageUrl('');
    setNormalCount(1);
    setFoilCount(0);
    setError('');
  };

  const resolvedExpansion =
    expansionSelect === '__custom__'
      ? customExpansion.trim()
      : expansionSelect.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token =
        localStorage.getItem('riftbard_vault_token') ||
        sessionStorage.getItem('riftbard_vault_token') ||
        '';

      const payload =
        itemKind === 'product'
          ? {
              name: name.trim(),
              set_name: resolvedExpansion || 'Productos',
              card_type: productType || 'Producto',
              rarity: 'Promo',
              element: 'Colorless',
              energy_cost: null,
              ability_text: abilityText.trim(),
              image_url: imageUrl.trim(),
              normal_count: Number(normalCount) || 0,
              foil_count: 0
            }
          : {
              name: name.trim(),
              set_name: resolvedExpansion || 'Promotional Cards',
              card_type: cardType,
              rarity,
              element,
              energy_cost: energyCost === '' ? null : Number(energyCost),
              ability_text: abilityText.trim(),
              image_url: imageUrl.trim(),
              normal_count: Number(normalCount) || 0,
              foil_count: Number(foilCount) || 0
            };

      const res = await fetch(`${API_URL}/cards/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo guardar.');
      }

      if (onItemCreated) {
        onItemCreated(data.card, data.collection);
      }
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-surface border border-line rounded-t-2xl sm:rounded-2xl max-h-[90dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-line-strong" />
        </div>

        <header className="px-5 py-3.5 border-b border-line bg-app flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink-primary font-display flex items-center gap-2">
            <Plus size={18} className="text-[#B45309]" />
            <span>Añadir a Bóveda</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink-primary"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* Kind Switcher: Carta vs Producto */}
          <div className="grid grid-cols-2 gap-1.5 bg-subtle p-1 rounded-[10px] border border-line">
            <button
              type="button"
              onClick={() => setItemKind('card')}
              className={`min-h-[40px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                itemKind === 'card' ? 'bg-[#B45309] text-white' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Sparkles size={14} /> Carta
            </button>
            <button
              type="button"
              onClick={() => setItemKind('product')}
              className={`min-h-[40px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                itemKind === 'product' ? 'bg-[#B45309] text-white' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Package size={14} /> Producto
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-secondary block">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={itemKind === 'product' ? 'Ej: Caja Booster Origins, Playmat...' : 'Ej: Ahri Promo Especial...'}
              className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
              required
            />
          </div>

          {/* Image URL + Live Preview */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-secondary block">URL de imagen (opcional)</label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-11 h-14 rounded-lg object-cover border border-line shrink-0 bg-subtle"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          {itemKind === 'card' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary block">Tipo</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                    className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                  >
                    {['Unit', 'Spell', 'Battlefield', 'Gear', 'Legend', 'Rune', 'Token'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary block">Rareza</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value)}
                    className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                  >
                    {['Common', 'Uncommon', 'Rare', 'Epic', 'Promo', 'Showcase', 'Legend'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary block">Dominio</label>
                  <select
                    value={element}
                    onChange={(e) => setElement(e.target.value)}
                    className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                  >
                    <option value="">Sin dominio / Neutral</option>
                    {['Mind', 'Order', 'Body', 'Chaos', 'Fury', 'Calm'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary block">Coste de energía</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={energyCost}
                    onChange={(e) => setEnergyCost(e.target.value)}
                    placeholder="Ej: 3"
                    className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary block">Categoría</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                >
                  {['Producto', 'Caja', 'Sobre', 'Playmat', 'Fundas', 'Deckbox', 'Accesorio'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary block">Colección / Set</label>
                <input
                  type="text"
                  value={expansionName}
                  onChange={(e) => setExpansionName(e.target.value)}
                  placeholder="Productos"
                  className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                />
              </div>
            </div>
          )}

          {/* Expansión (Desplegable con opción personalizada) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-secondary block">Expansión / Colección</label>
            <select
              value={expansionSelect}
              onChange={(e) => setExpansionSelect(e.target.value)}
              className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
            >
              {Array.from(new Set(['Promotional Cards', 'Productos', ...existingExpansions])).map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
              <option value="__custom__">+ Escribir nueva expansión...</option>
            </select>
            {expansionSelect === '__custom__' && (
              <input
                type="text"
                value={customExpansion}
                onChange={(e) => setCustomExpansion(e.target.value)}
                placeholder="Nombre de la nueva expansión..."
                className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
              />
            )}
          </div>

          {/* Description / Effect */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-secondary block">
              {itemKind === 'product' ? 'Descripción' : 'Texto / Efecto'}
            </label>
            <textarea
              rows={2}
              value={abilityText}
              onChange={(e) => setAbilityText(e.target.value)}
              placeholder={itemKind === 'product' ? 'Estado, idioma, detalles...' : 'Efecto de la carta...'}
              className="w-full bg-app border border-line rounded-[10px] p-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309] resize-none"
            />
          </div>

          {/* Initial Quantity */}
          <div className={`grid ${itemKind === 'card' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-secondary block">
                {itemKind === 'product' ? 'Unidades en posesión' : 'Copias Normales'}
              </label>
              <input
                type="number"
                min="0"
                value={normalCount}
                onChange={(e) => setNormalCount(e.target.value)}
                className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
              />
            </div>
            {itemKind === 'card' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary block">Copias Foil</label>
                <input
                  type="number"
                  min="0"
                  value={foilCount}
                  onChange={(e) => setFoilCount(e.target.value)}
                  className="w-full min-h-[44px] bg-app border border-line rounded-[10px] px-3 text-sm text-ink-primary focus:outline-none focus:border-[#B45309]"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-[#B91C1C] dark:text-red-300">
              {error}
            </div>
          )}

          <div className="pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:pb-0 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-[10px] bg-subtle border border-line text-ink-primary text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[44px] rounded-[10px] bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>{saving ? 'Guardando...' : 'Guardar en Bóveda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
