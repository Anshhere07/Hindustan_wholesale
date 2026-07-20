'use client';

import React, { useState, useMemo } from 'react';
import { Grid3X3, List, SlidersHorizontal, Search, X, Star, ChevronDown } from 'lucide-react';
import styles from './CatalogPage.module.css';
import ProductCard from '@/components/shared/ProductCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/api/mock-data';
import type { ProductFilter } from '@/types/product.types';

// ─────────────────────────────────────────────────────────────────────────────
// Catalog Page — search, filter, sort, grid/list toggle
// ─────────────────────────────────────────────────────────────────────────────

const BRANDS = ['Bosch', 'Brembo', 'Philips', 'MRF', 'Denso', 'Mann Filter', 'ZF Sachs', 'Mahindra OE'];

const SORT_OPTIONS = [
  { label: 'Relevance',    value: 'relevance' },
  { label: 'Price: Low',   value: 'price_asc' },
  { label: 'Price: High',  value: 'price_desc' },
  { label: 'Top Rated',    value: 'rating' },
  { label: 'Newest',       value: 'newest' },
  { label: 'MOQ: Low',     value: 'moq_asc' },
];

const CatalogPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    categories: true, brands: true, price: true, moq: false,
  });

  const toggleFilter = (key: string) =>
    setExpandedFilters((p) => ({ ...p, [key]: !p[key] }));

  const updateFilter = (key: keyof ProductFilter, value: ProductFilter[keyof ProductFilter]) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const clearFilters = () => { setFilters({}); setSearch(''); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let products = [...MOCK_PRODUCTS];
    if (search) products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (filters.categoryId) products = products.filter((p) => p.categoryName.toLowerCase().includes(filters.categoryId!.toLowerCase()));
    if (filters.brand?.length) products = products.filter((p) => p.brand && filters.brand!.includes(p.brand));
    if (filters.minPrice) products = products.filter((p) => p.basePrice >= filters.minPrice!);
    if (filters.maxPrice) products = products.filter((p) => p.basePrice <= filters.maxPrice!);
    if (filters.rating) products = products.filter((p) => p.rating >= filters.rating!);
    if (sort === 'price_asc') products.sort((a, b) => a.basePrice - b.basePrice);
    if (sort === 'price_desc') products.sort((a, b) => b.basePrice - a.basePrice);
    if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
    if (sort === 'moq_asc') products.sort((a, b) => a.moq - b.moq);
    return products;
  }, [search, filters, sort]);

  return (
    <div className={styles.page}>
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1 className={styles.pageTitle}>Product Catalog</h1>
          <Badge variant="default">{filteredProducts.length} products</Badge>
        </div>

        <div className={styles.toolbarRight}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
            <input
              className={styles.searchInput}
              placeholder="Search parts, brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className={styles.sortWrap}>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.sortChevron} aria-hidden="true" />
          </div>

          {/* View Toggle */}
          <div className={styles.viewToggle} role="group" aria-label="View mode">
            <button
              className={cn(styles.viewBtn, view === 'grid' && styles['viewBtn--active'])}
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={cn(styles.viewBtn, view === 'list' && styles['viewBtn--active'])}
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
            >
              <List size={16} />
            </button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant={sidebarOpen ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<SlidersHorizontal size={15} />}
            onClick={() => setSidebarOpen((p) => !p)}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {/* ── Active Filters ─────────────────────────────────────────────── */}
      {activeFilterCount > 0 && (
        <div className={styles.activeFilters} role="region" aria-label="Active filters">
          {search && (
            <button className={styles.filterChip} onClick={() => setSearch('')}>
              Search: &quot;{search}&quot; <X size={11} />
            </button>
          )}
          {filters.brand?.map((b) => (
            <button key={b} className={styles.filterChip} onClick={() => updateFilter('brand', filters.brand!.filter((x) => x !== b))}>
              {b} <X size={11} />
            </button>
          ))}
          <button className={styles.clearAll} onClick={clearFilters}>Clear all</button>
        </div>
      )}

      {/* ── Layout ────────────────────────────────────────────────────── */}
      <div className={cn(styles.layout, !sidebarOpen && styles['layout--nosidebar'])}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className={styles.sidebar} aria-label="Filter options">
            {/* Categories */}
            <FilterGroup
              label="Categories"
              expanded={expandedFilters.categories}
              onToggle={() => toggleFilter('categories')}
            >
              {MOCK_CATEGORIES.map((cat) => (
                <label key={cat.id} className={styles.filterLabel}>
                  <input
                    type="radio"
                    name="category"
                    className={styles.filterInput}
                    checked={filters.categoryId === cat.slug}
                    onChange={() => updateFilter('categoryId', cat.slug)}
                  />
                  <span className={styles.filterText}>{cat.name}</span>
                  <span className={styles.filterCount}>{cat.productCount.toLocaleString('en-IN')}</span>
                </label>
              ))}
            </FilterGroup>

            {/* Brands */}
            <FilterGroup label="Brand" expanded={expandedFilters.brands} onToggle={() => toggleFilter('brands')}>
              {BRANDS.map((brand) => (
                <label key={brand} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    className={styles.filterInput}
                    checked={filters.brand?.includes(brand) ?? false}
                    onChange={(e) => {
                      const current = filters.brand ?? [];
                      updateFilter('brand', e.target.checked ? [...current, brand] : current.filter((b) => b !== brand));
                    }}
                  />
                  <span className={styles.filterText}>{brand}</span>
                </label>
              ))}
            </FilterGroup>

            {/* Rating */}
            <FilterGroup label="Min Rating" expanded={expandedFilters.price} onToggle={() => toggleFilter('price')}>
              {[4.5, 4.0, 3.5, 3.0].map((r) => (
                <label key={r} className={styles.filterLabel}>
                  <input
                    type="radio"
                    name="rating"
                    className={styles.filterInput}
                    checked={filters.rating === r}
                    onChange={() => updateFilter('rating', r)}
                  />
                  <span className={styles.filterText}>
                    <Star size={12} style={{ color: '#f59e0b', display: 'inline' }} /> {r}+
                  </span>
                </label>
              ))}
            </FilterGroup>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" fullWidth onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </aside>
        )}

        {/* Product Grid/List */}
        <main className={styles.products} aria-label="Product listings">
          {filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptySub}>Try adjusting your filters or search term.</p>
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={view === 'grid' ? styles.grid : styles.list}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ── Filter Group sub-component ────────────────────────────────────────────────
interface FilterGroupProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ label, expanded, onToggle, children }) => (
  <div className={styles.filterGroup}>
    <button
      className={styles.filterGroupHeader}
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span>{label}</span>
      <ChevronDown size={14} className={cn(styles.filterChevron, expanded && styles['filterChevron--open'])} />
    </button>
    {expanded && <div className={styles.filterGroupBody}>{children}</div>}
  </div>
);

export default CatalogPage;
