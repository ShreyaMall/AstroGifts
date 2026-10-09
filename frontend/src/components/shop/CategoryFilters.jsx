import React, { useState, useEffect, useRef } from 'react';
import DualRangeSlider from './DualRangeSlider';
import './CategoryFilters.css';

/* ── helpers ─────────────────────────────────────────────────────── */
const MULTICOLOR_GRADIENT =
  'conic-gradient(#e74c3c 0deg 51deg, #f39c12 51deg 102deg, #f1c40f 102deg 153deg, #2ecc71 153deg 204deg, #3498db 204deg 255deg, #9b59b6 255deg 306deg, #e91e63 306deg 360deg)';

function colorSwatch(hex, name) {
  if (!hex) return MULTICOLOR_GRADIENT; // Multicolor / unknown
  const key = name?.toLowerCase() ?? '';
  // White gets a neutral background
  if (key === 'white' || hex === '#FFFFFF') return '#FFFFFF';
  return hex;
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── collapsible section ──────────────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true, hidden = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (hidden) return null;
  return (
    <div className="cf-section">
      <button className="cf-section__header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="cf-section__title">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="cf-section__body">{children}</div>}
    </div>
  );
}

/* ── checklist with search + "N more" ───────────────────────────── */
function CheckList({
  items,         // [{name, count, slug?, hex?}]
  selected,      // string[]
  onToggle,      // (name) => void
  withSearch = false,
  withSwatch = false,
  radioMode = false,   // for discount (radio, not checkbox)
  limit = 7,
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const filtered = query
    ? items.filter(i => (i.name ?? '').toLowerCase().includes(query.toLowerCase()))
    : items;

  const visible = expanded || query ? filtered : filtered.slice(0, limit);
  const extra = filtered.length - limit;

  return (
    <div className="cf-checklist-wrap">
      {withSearch && (
        <div className="cf-search-row">
          {showSearch ? (
            <div className="cf-search-box">
              <SearchIcon />
              <input
                ref={searchRef}
                className="cf-search-input"
                type="text"
                placeholder="Search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="cf-search-clear" onClick={() => { setQuery(''); setShowSearch(false); }}>✕</button>
              )}
            </div>
          ) : (
            <button className="cf-search-toggle" onClick={() => setShowSearch(true)} aria-label="Search">
              <SearchIcon />
            </button>
          )}
        </div>
      )}
      <ul className="cf-checklist">
        {visible.map(item => {
          const val = item.slug ?? item.name;
          const isChecked = selected.includes(val);
          return (
            <li key={val}>
              <label className="cf-check-label">
                <input
                  type={radioMode ? 'radio' : 'checkbox'}
                  name={radioMode ? 'cf-radio-group' : undefined}
                  className={radioMode ? 'cf-radio' : 'cf-check'}
                  checked={isChecked}
                  onChange={() => onToggle(val)}
                />
                {withSwatch && (
                  <span
                    className="cf-swatch"
                    style={{
                      background: colorSwatch(item.hex, item.name),
                      border: (item.name?.toLowerCase() === 'white') ? '1.5px solid #ccc' : '1px solid rgba(0,0,0,0.10)',
                    }}
                  />
                )}
                <span className="cf-check-text">
                  {item.name}
                  {item.count != null && (
                    <span className="cf-check-count">({item.count})</span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && <li className="cf-no-results">No results</li>}
      </ul>
      {!query && extra > 0 && (
        <button className="cf-more-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? '− Show less' : `+ ${extra} more`}
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function CategoryFilters({
  activeSlug,
  facets,
  searchParams,
  updateFilters,
  clearFilters,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  totalResults,
}) {
  // ── parse URL state ───────────────────────────────────────────
  const currentCategories = searchParams.get('subcategory')
    ? searchParams.get('subcategory').split(',').filter(Boolean)
    : [];
  const currentBrands   = searchParams.get('brand')    ? searchParams.get('brand').split(',').filter(Boolean)    : [];
  const currentColors   = searchParams.get('color')    ? searchParams.get('color').split(',').filter(Boolean)    : [];
  const currentOccasions= searchParams.get('occasion') ? searchParams.get('occasion').split(',').filter(Boolean) : [];
  const currentDiscount = searchParams.get('discount') || '';
  const minPriceParam   = searchParams.get('minPrice')  ? Number(searchParams.get('minPrice'))  : null;
  const maxPriceParam   = searchParams.get('maxPrice')  ? Number(searchParams.get('maxPrice'))  : null;

  const isFilterActive = currentCategories.length > 0 || currentBrands.length > 0
    || currentColors.length > 0 || currentDiscount || minPriceParam || maxPriceParam
    || currentOccasions.length > 0;

  // ── facet data ────────────────────────────────────────────────
  const categories = facets.categories || [];    // [{name, slug, count}]
  const brands     = facets.brands     || [];    // [{name, count}]
  const colors     = facets.colors     || [];    // [{name, hex, count}]
  const discounts  = facets.discounts  || [];    // [{name, value, count}]
  const occasions  = facets.occasions  || [];    // [{name, count}]
  const priceMin   = facets.price_stats?.[0]?.min ?? 0;
  const priceMax   = facets.price_stats?.[0]?.max ?? 10000;

  // ── handlers ──────────────────────────────────────────────────
  const toggleMulti = (param, val) => {
    const cur = searchParams.get(param) ? searchParams.get(param).split(',').filter(Boolean) : [];
    const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
    updateFilters({ [param]: next.join(',') || null, page: 1 });
  };

  const handlePrice = (lo, hi) => {
    updateFilters({ minPrice: lo <= priceMin ? null : lo, maxPrice: hi >= priceMax ? null : hi, page: 1 });
  };

  const handleDiscount = (val) => {
    updateFilters({ discount: currentDiscount === String(val) ? null : val, page: 1 });
  };

  // ── sidebar content ───────────────────────────────────────────
  const sidebarContent = (
    <>
      <div className="cf-header">
        <span className="cf-header__title">FILTERS</span>
        {isFilterActive && (
          <button className="cf-header__clear" onClick={clearFilters}>CLEAR ALL</button>
        )}
      </div>

      {/* CATEGORIES */}
      <FilterSection title="CATEGORIES" hidden={categories.length === 0}>
        <CheckList
          items={categories}
          selected={currentCategories}
          onToggle={v => toggleMulti('subcategory', v)}
          limit={7}
        />
      </FilterSection>

      {/* BRAND */}
      <FilterSection title="BRAND" hidden={brands.length === 0}>
        <CheckList
          items={brands}
          selected={currentBrands}
          onToggle={v => toggleMulti('brand', v)}
          withSearch
          limit={7}
        />
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="PRICE" hidden={priceMax === 0}>
        <DualRangeSlider
          min={priceMin}
          max={priceMax}
          valueMin={minPriceParam ?? priceMin}
          valueMax={maxPriceParam ?? priceMax}
          onChange={handlePrice}
        />
        {/* spacer for labels below slider */}
        <div style={{ height: '28px' }} />
      </FilterSection>

      {/* COLOR */}
      <FilterSection title="COLOR" hidden={colors.length === 0}>
        <CheckList
          items={colors}
          selected={currentColors}
          onToggle={v => toggleMulti('color', v)}
          withSearch
          withSwatch
          limit={7}
        />
      </FilterSection>

      {/* DISCOUNT RANGE */}
      <FilterSection title="DISCOUNT RANGE" hidden={discounts.length === 0}>
        <CheckList
          items={discounts.map(d => ({ name: d.name, count: d.count, slug: String(d.value) }))}
          selected={currentDiscount ? [currentDiscount] : []}
          onToggle={handleDiscount}
          radioMode
          limit={10}
        />
      </FilterSection>

      {/* OCCASIONS */}
      <FilterSection title="GIFTING OCCASION" hidden={occasions.length === 0}>
        <CheckList
          items={occasions}
          selected={currentOccasions}
          onToggle={v => toggleMulti('occasion', v)}
          limit={7}
        />
      </FilterSection>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <aside className="cf-sidebar cf-desktop-only">
        {sidebarContent}
      </aside>

      {/* ── MOBILE BOTTOM SHEET ──────────────────────────────── */}
      {isMobileFilterOpen && (
        <>
          <div
            className="cf-backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="cf-bottom-sheet" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="cf-sheet-handle" />
            <div className="cf-sheet-body">
              {sidebarContent}
            </div>
            <div className="cf-sheet-footer">
              <button className="cf-footer-clear" onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }}>
                Clear
              </button>
              <button className="cf-footer-apply" onClick={() => setIsMobileFilterOpen(false)}>
                Show {totalResults} results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
