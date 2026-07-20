'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Package, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import styles from './SellerListings.module.css';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { MOCK_PRODUCTS } from '@/lib/api/mock-data';
import { formatCurrency } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// Seller Listings — product management table with CRUD actions
// ─────────────────────────────────────────────────────────────────────────────

const SellerListings: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = MOCK_PRODUCTS.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Listings</h1>
          <p className={styles.subtitle}>{MOCK_PRODUCTS.length} products listed</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm">Import CSV</Button>
          <Link href={ROUTES.SELLER.LISTING_NEW}>
            <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listings"
          />
        </div>
        <div className={styles.filterRow}>
          {['All', 'Active', 'Inactive', 'Pending'].map((f) => (
            <button key={f} className={`${styles.filterPill} ${f === 'All' ? styles['filterPill--active'] : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                <input type="checkbox" aria-label="Select all" />
              </th>
              <th scope="col">Product</th>
              <th scope="col">SKU</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">MOQ</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className={styles.tableRow}>
                <td><input type="checkbox" aria-label={`Select ${product.name}`} /></td>
                <td>
                  <div className={styles.productCell}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.primaryImage.url} alt="" className={styles.productThumb} />
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.name}</p>
                      {product.brand && <p className={styles.productBrand}>{product.brand}</p>}
                    </div>
                  </div>
                </td>
                <td><span className={styles.sku}>{product.sku}</span></td>
                <td><span className={styles.category}>{product.categoryName}</span></td>
                <td><span className={styles.price}>{formatCurrency(product.basePrice, product.currency)}</span></td>
                <td><span className={styles.moq}>{product.moq} {product.unit}</span></td>
                <td>
                  <span className={`${styles.stock} ${product.stock < 20 ? styles['stock--low'] : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <Badge variant={product.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} aria-label="Preview product">
                      <Eye size={14} />
                    </button>
                    <Link href={ROUTES.SELLER.LISTING_EDIT(product.id)}>
                      <button className={styles.actionBtn} aria-label="Edit product">
                        <Edit2 size={14} />
                      </button>
                    </Link>
                    <button className={`${styles.actionBtn} ${styles['actionBtn--danger']}`} aria-label="Delete product">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <Package size={14} aria-hidden="true" />
          <span>{filtered.length} products shown</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Total stock value:</span>
          <strong>{formatCurrency(filtered.reduce((s, p) => s + p.basePrice * p.stock, 0), 'INR', { compact: true })}</strong>
        </div>
      </div>
    </div>
  );
};

export default SellerListings;
