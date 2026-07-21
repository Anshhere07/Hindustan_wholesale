'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './CategoriesPage.module.css';
import { PublicHeader, PublicFooter, CATEGORIES } from '../landing/LandingPage';

const HINDI_MAP: Record<string, string> = {
  'fmcg': 'किराना',
  'kitchenware': 'रसोई',
  'apparel': 'कपड़ा',
  'electronics': 'इलेक्ट्रॉनिक्स',
  'personal-care': 'देखभाल',
  'stationery': 'स्टेशनरी',
  'home-decor': 'घर सजावट',
  'toys': 'खिलौने',
  'hardware': 'हार्डवेयर',
  'packaging': 'पैकेजिंग',
  'beauty': 'सौंदर्य',
  'agri': 'कृषि',
};

const CategoriesPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        <div className={styles.header}>
          <span className={styles.badge}>Marketplace</span>
          <h1 className={styles.title}>All wholesale categories</h1>
          <p className={styles.subtitle}>
            60,000+ SKUs across 12 verticals. Every listing is verified, GST-tagged and MOQ-priced.
          </p>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map(category => (
            <Link href={`/categories/${category.id}`} key={category.id} className={styles.card} style={{ textDecoration: 'none' }}>
              <div 
                className={styles.iconWrap}
                style={{ background: category.color }}
              >
                {category.icon}
              </div>
              
              <div className={styles.categoryName}>{category.name}</div>
              <div className={styles.hindiName}>{HINDI_MAP[category.id] || category.name}</div>
              
              <div className={styles.subcategories}>{category.subtext}</div>
              
              <div className={styles.cardBottom}>
                <span className={styles.skuCount}>{category.count}</span>
                <span className={styles.shopLink}>
                  Shop <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default CategoriesPage;
