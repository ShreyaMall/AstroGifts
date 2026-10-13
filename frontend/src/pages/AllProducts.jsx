import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../services/api';
import { MAX_PER_PAGE, DEFAULT_PER_PAGE } from '../utils/constants';
import './AllProducts.css';

export default function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── 1. Parse State from URL Query Parameters ──
  const selectedCategories = useMemo(() => {
    const raw = searchParams.get('category');
    return raw ? raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
  }, [searchParams]);

  const minPriceParam = searchParams.get('min') || '';
  const maxPriceParam = searchParams.get('max') || '';
  const inStockOnly = searchParams.get('stock') === '1';
  const searchQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const rawPerPage = parseInt(searchParams.get('per_page') || String(DEFAULT_PER_PAGE), 10);
  const perPage = Math.min(isNaN(rawPerPage) || rawPerPage < 1 ? DEFAULT_PER_PAGE : rawPerPage, MAX_PER_PAGE);

  // ── Server Data States ──
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: DEFAULT_PER_PAGE });
  const [filtersData, setFiltersData] = useState({ price_min: 0, price_max: 0, categories: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Dynamic Slider Bounds derived directly from API
  const sliderMinBound = filtersData.price_min ?? 0;
  const sliderMaxBound = (filtersData.price_max && filtersData.price_max > sliderMinBound) ? filtersData.price_max : (sliderMinBound + 100);

  // ── Local slider values for live dragging display ──
  const [localPrice, setLocalPrice] = useState([
    minPriceParam ? Number(minPriceParam) : sliderMinBound,
    maxPriceParam ? Number(maxPriceParam) : sliderMaxBound,
  ]);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync local slider values whenever URL or API bounds change
  useEffect(() => {
    const minVal = minPriceParam !== '' ? Number(minPriceParam) : sliderMinBound;
    const maxVal = maxPriceParam !== '' ? Number(maxPriceParam) : sliderMaxBound;
    setLocalPrice([
      isNaN(minVal) ? sliderMinBound : Math.max(sliderMinBound, minVal),
      isNaN(maxVal) ? sliderMaxBound : Math.min(sliderMaxBound, maxVal),
    ]);
  }, [minPriceParam, maxPriceParam, sliderMinBound, sliderMaxBound]);

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  // ── Mobile Bottom Sheet State ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetTriggerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // AbortController ref for in-flight requests
  const abortControllerRef = useRef(null);
  const priceDebounceTimer = useRef(null);
  const searchDebounceTimer = useRef(null);

  // ── SEO & Page Title ──
  useEffect(() => {
    document.title = 'All Products | AstroGifts';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Browse all gifts, toys, astrology products and flowers at AstroGifts.';
  }, []);

  // ── Update URL Search Params Helper ──
  const updateUrlParams = useCallback((updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      // If updating filters (not page directly), reset page to 1
      if (!('page' in updates)) {
        next.set('page', '1');
      }
      return next;
    });
  }, [setSearchParams]);

  // ── 2. Data Fetching via GET /api/products ──
  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setErrorMessage(null);

    const queryObj = {
      page: currentPage,
      per_page: perPage,
      sort: currentSort,
    };

    if (selectedCategories.length > 0) {
      queryObj.category = selectedCategories.join(',');
    }
    if (minPriceParam) queryObj.min = minPriceParam;
    if (maxPriceParam) queryObj.max = maxPriceParam;
    if (inStockOnly) queryObj.stock = '1';
    if (searchQuery.trim()) queryObj.q = searchQuery.trim();

    try {
      const res = await productsApi.getAll(queryObj, {
        signal: abortControllerRef.current.signal,
      });

      if (res && res.status === 'success') {
        setProducts(Array.isArray(res.data) ? res.data : []);
        if (res.meta) setMeta(res.meta);
        if (res.filters) setFiltersData(res.filters);
      } else if (Array.isArray(res)) {
        setProducts(res);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Failed to fetch catalog products:', err);
      setErrorMessage(err.message || 'Unable to load products. Please check your connection and retry.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, currentSort, selectedCategories, minPriceParam, maxPriceParam, inStockOnly, searchQuery]);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProducts, retryTrigger]);

  // ── Dual-Handle Slider Drag & Commit Logic ──
  const commitPriceRange = useCallback((nextMin, nextMax) => {
    clearTimeout(priceDebounceTimer.current);

    // If selected range equals full store range, do not send min/max to URL or API
    const isFullStoreRange = (nextMin <= sliderMinBound && nextMax >= sliderMaxBound);

    updateUrlParams({
      min: isFullStoreRange ? null : (nextMin > sliderMinBound ? nextMin : null),
      max: isFullStoreRange ? null : (nextMax < sliderMaxBound ? nextMax : null),
    });
  }, [sliderMinBound, sliderMaxBound, updateUrlParams]);

  // Live dragging handler with 400ms fallback debounce
  const handleSliderLiveChange = (index, value) => {
    const numericVal = Number(value);
    setLocalPrice((prev) => {
      let [currentMin, currentMax] = prev;
      if (index === 0) {
        currentMin = Math.min(numericVal, currentMax);
      } else {
        currentMax = Math.max(numericVal, currentMin);
      }
      const updated = [currentMin, currentMax];

      // 400ms debounce fallback while dragging continuously
      clearTimeout(priceDebounceTimer.current);
      priceDebounceTimer.current = setTimeout(() => {
        commitPriceRange(updated[0], updated[1]);
      }, 400);

      return updated;
    });
  };

  // Immediate commit on mouseup / touchend / blur (onChangeCommitted)
  const handleSliderCommit = () => {
    clearTimeout(priceDebounceTimer.current);
    commitPriceRange(localPrice[0], localPrice[1]);
  };

  // ── Debounced Search Query Sync ──
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      updateUrlParams({ q: val.trim() || null });
    }, 400);
  };

  // ── Category Checkbox Handler ──
  const toggleCategory = (slug) => {
    const lower = slug.toLowerCase();
    let nextList;
    if (selectedCategories.includes(lower)) {
      nextList = selectedCategories.filter(s => s !== lower);
    } else {
      nextList = [...selectedCategories, lower];
    }
    updateUrlParams({ category: nextList.length > 0 ? nextList.join(',') : null });
  };

  const clearAllFilters = () => {
    setLocalPrice([sliderMinBound, sliderMaxBound]);
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // ── Active Filter Chips ──
  const activeChips = useMemo(() => {
    const chips = [];
    selectedCategories.forEach(slug => {
      const found = filtersData.categories?.find(c => c.slug.toLowerCase() === slug);
      chips.push({
        key: `cat-${slug}`,
        label: found ? found.name : slug,
        onRemove: () => toggleCategory(slug),
      });
    });

    if (minPriceParam || maxPriceParam) {
      const minText = minPriceParam ? `₹${minPriceParam}` : `₹${sliderMinBound}`;
      const maxText = maxPriceParam ? `₹${maxPriceParam}` : `₹${sliderMaxBound}`;
      chips.push({
        key: 'price',
        label: `${minText} – ${maxText}`,
        onRemove: () => {
          setLocalPrice([sliderMinBound, sliderMaxBound]);
          updateUrlParams({ min: null, max: null });
        },
      });
    }

    if (inStockOnly) {
      chips.push({
        key: 'stock',
        label: 'In Stock Only',
        onRemove: () => updateUrlParams({ stock: null }),
      });
    }

    if (searchQuery) {
      chips.push({
        key: 'q',
        label: `"${searchQuery}"`,
        onRemove: () => {
          setSearchInput('');
          updateUrlParams({ q: null });
        },
      });
    }

    return chips;
  }, [selectedCategories, filtersData, minPriceParam, maxPriceParam, inStockOnly, searchQuery, toggleCategory, updateUrlParams]);

  // ── Body Scroll Lock & Esc / Backdrop handling for mobile sheet ──
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSheetOpen(false);
          sheetTriggerRef.current?.focus();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [sheetOpen]);

  // ── Render Filter Controls Component (shared between desktop sidebar and mobile sheet) ──
  const renderFilterControls = (isMobileSheet = false) => (
    <>
      {/* Search Filter */}
      <div className="ap-filter-group">
        <h3 className="ap-filter-group__title">Search Products</h3>
        <div className="ap-filter-search">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search products by name or SKU"
          />
          <span className="ap-filter-search__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="ap-filter-group">
        <div className="ap-filter-group__title">
          <span>Categories</span>
          {selectedCategories.length > 0 && (
            <button
              type="button"
              className="ap-filter-group__clear"
              onClick={() => updateUrlParams({ category: null })}
            >
              Clear
            </button>
          )}
        </div>
        <ul className="ap-categories-list">
          {filtersData.categories && filtersData.categories.length > 0 ? (
            filtersData.categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.slug.toLowerCase());
              return (
                <li key={cat.slug}>
                  <label className="ap-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.slug)}
                    />
                    <span className="ap-checkbox-label">
                      <span>{cat.name}</span>
                      <span className="ap-checkbox-count">{cat.count}</span>
                    </span>
                  </label>
                </li>
              );
            })
          ) : (
            <li style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading categories...</li>
          )}
        </ul>
      </div>

      {/* Dual-Handle Price Range Filter */}
      <div className="ap-filter-group">
        <div className="ap-filter-group__title">
          <span>Price Range</span>
          {(minPriceParam || maxPriceParam) && (
            <button
              type="button"
              className="ap-filter-group__clear"
              onClick={() => {
                setLocalPrice([sliderMinBound, sliderMaxBound]);
                updateUrlParams({ min: null, max: null });
              }}
            >
              Reset
            </button>
          )}
        </div>

        <div className="ap-slider-wrap">
          {/* Dual range slider track */}
          <div className="ap-slider-track-container">
            <div className="ap-slider-track-base" />
            <div
              className="ap-slider-track-highlight"
              style={{
                left: `${sliderMaxBound > sliderMinBound ? Math.max(0, ((localPrice[0] - sliderMinBound) / (sliderMaxBound - sliderMinBound)) * 100) : 0}%`,
                right: `${sliderMaxBound > sliderMinBound ? Math.max(0, 100 - ((localPrice[1] - sliderMinBound) / (sliderMaxBound - sliderMinBound)) * 100) : 0}%`,
              }}
            />

            {/* Min Handle Range Input */}
            <input
              type="range"
              min={sliderMinBound}
              max={sliderMaxBound}
              value={localPrice[0]}
              step={1}
              onChange={(e) => handleSliderLiveChange(0, e.target.value)}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              onKeyUp={handleSliderCommit}
              className="ap-slider-input ap-slider-input--min"
              aria-label="Minimum price"
            />

            {/* Max Handle Range Input */}
            <input
              type="range"
              min={sliderMinBound}
              max={sliderMaxBound}
              value={localPrice[1]}
              step={1}
              onChange={(e) => handleSliderLiveChange(1, e.target.value)}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              onKeyUp={handleSliderCommit}
              className="ap-slider-input ap-slider-input--max"
              aria-label="Maximum price"
            />
          </div>

          {/* Currently selected range text below slider */}
          <div className="ap-slider-display">
            <span>Price:</span>
            <span className="ap-slider-display__text">
              ₹{localPrice[0]} – ₹{localPrice[1]}
            </span>
          </div>

          {sliderMaxBound > 0 && (
            <div className="ap-price-bounds">
              Store range: ₹{sliderMinBound} – ₹{sliderMaxBound}
            </div>
          )}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="ap-filter-group">
        <div
          className="ap-switch-row"
          onClick={() => updateUrlParams({ stock: inStockOnly ? null : '1' })}
          role="switch"
          aria-checked={inStockOnly}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              updateUrlParams({ stock: inStockOnly ? null : '1' });
            }
          }}
        >
          <span className="ap-switch-label">In Stock Only</span>
          <div className={`ap-switch-toggle${inStockOnly ? ' ap-switch-toggle--active' : ''}`}>
            <div className="ap-switch-handle" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="ap-page">
      <Header />

      <main className="ap-container">
        {/* Top Breadcrumb & Title */}
        <section className="ap-header">
          <nav className="ap-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="ap-breadcrumb__sep">/</span>
            <span className="ap-breadcrumb__current">All Products</span>
          </nav>
          <div className="ap-title-row">
            <h1 className="ap-title">
              All Products
              <span className="ap-total-count" aria-live="polite">
                ({meta.total} {meta.total === 1 ? 'product' : 'products'})
              </span>
            </h1>
          </div>
        </section>

        {/* ── Main Catalog Layout (Sticky Desktop Sidebar + Products Grid) ── */}
        <div className="ap-layout">
          {/* Desktop Left Sticky Sidebar */}
          <aside className="ap-sidebar" aria-label="Catalog filters">
            {renderFilterControls(false)}
          </aside>

          {/* Catalog Content Area */}
          <section className="ap-main">
            {/* Toolbar */}
            <div className="ap-toolbar">
              <div className="ap-toolbar__left">
                {/* Mobile Filter Sheet Trigger Button */}
                <button
                  ref={sheetTriggerRef}
                  type="button"
                  className="ap-mobile-filter-btn"
                  onClick={() => setSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={sheetOpen}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span>Filters</span>
                  {activeChips.length > 0 && (
                    <span className="ap-mobile-filter-badge">{activeChips.length}</span>
                  )}
                </button>
              </div>

              {/* Sort By Select */}
              <div className="ap-toolbar__sort">
                <label htmlFor="ap-sort">Sort by:</label>
                <select
                  id="ap-sort"
                  className="ap-sort-select"
                  value={currentSort}
                  onChange={(e) => updateUrlParams({ sort: e.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="ap-chips-row">
                {activeChips.map((chip) => (
                  <span key={chip.key} className="ap-chip">
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      aria-label={`Remove filter ${chip.label}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="ap-clear-all-btn"
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="ap-grid" id="all-products-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="ap-skeleton-card">
                    <div className="ap-skeleton-img" />
                    <div className="ap-skeleton-line ap-skeleton-line--title" />
                    <div className="ap-skeleton-line ap-skeleton-line--cat" />
                    <div className="ap-skeleton-line ap-skeleton-line--price" />
                  </div>
                ))
              ) : errorMessage ? (
                <div className="ap-status-box">
                  <div className="ap-status-box__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h2 className="ap-status-box__title">Error Loading Products</h2>
                  <p className="ap-status-box__desc">{errorMessage}</p>
                  <button
                    type="button"
                    className="ap-status-box__btn"
                    onClick={() => setRetryTrigger(k => k + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    viewMode="grid-3"
                  />
                ))
              ) : (
                <div className="ap-status-box">
                  <div className="ap-status-box__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h2 className="ap-status-box__title">No products found</h2>
                  <p className="ap-status-box__desc">
                    We couldn't find any products matching your current filters.
                  </p>
                  <button
                    type="button"
                    className="ap-status-box__btn"
                    onClick={clearAllFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && meta.last_page > 1 && (
              <nav className="ap-pagination" aria-label="Catalog pagination">
                <button
                  type="button"
                  className="ap-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    updateUrlParams({ page: currentPage - 1 });
                    document.getElementById('all-products-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => {
                  // Only display relevant pagination buttons if large page count
                  if (
                    p === 1 ||
                    p === meta.last_page ||
                    (p >= currentPage - 2 && p <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`ap-page-btn${currentPage === p ? ' ap-page-btn--active' : ''}`}
                        onClick={() => {
                          updateUrlParams({ page: p });
                          document.getElementById('all-products-grid')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        aria-current={currentPage === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === currentPage - 3 || p === currentPage + 3) {
                    return <span key={p} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>;
                  }
                  return null;
                })}

                <button
                  type="button"
                  className="ap-page-btn"
                  disabled={currentPage >= meta.last_page}
                  onClick={() => {
                    updateUrlParams({ page: currentPage + 1 });
                    document.getElementById('all-products-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>

      {/* ── Mobile Filters Bottom Sheet (< 1024px) ── */}
      {sheetOpen && (
        <>
          <div
            className="ap-bottom-sheet-backdrop"
            onClick={() => {
              setSheetOpen(false);
              sheetTriggerRef.current?.focus();
            }}
            aria-hidden="true"
          />
          <div
            className="ap-bottom-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
          >
            <div className="ap-bottom-sheet__header">
              <h2 id="sheet-title" className="ap-bottom-sheet__title">Filter Products</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="ap-bottom-sheet__close"
                onClick={() => {
                  setSheetOpen(false);
                  sheetTriggerRef.current?.focus();
                }}
                aria-label="Close filters sheet"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ap-bottom-sheet__body">
              {renderFilterControls(true)}
            </div>
            <div className="ap-bottom-sheet__footer">
              <button
                type="button"
                className="ap-sheet-clear-btn"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
              <button
                type="button"
                className="ap-sheet-apply-btn"
                onClick={() => {
                  setSheetOpen(false);
                  sheetTriggerRef.current?.focus();
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
