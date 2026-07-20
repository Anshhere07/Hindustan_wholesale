'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, TrendingUp, Shield, Zap,
  Package, Truck, Award, ChevronRight, Building2, Menu, Image as ImageIcon,
  Search, User, ShoppingCart, Wallet, Headset, Star, MapPin, IndianRupee, Store,
  Phone, Mail, FileText
} from 'lucide-react';
import styles from './LandingPage.module.css';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page — public marketing page
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: IndianRupee,
    title: 'Real wholesale prices',
    description: 'Direct-from-factory pricing with tiered MOQ discounts — no middlemen mark-ups.',
  },
  {
    icon: Shield,
    title: 'Every seller verified',
    description: 'GST + PAN + KYC + physical inspection. Fraud detection built in.',
  },
  {
    icon: Truck,
    title: 'Pan-India fulfilment',
    description: 'Managed 3PL across 720+ cities. Live tracking on SMS + WhatsApp.',
  },
  {
    icon: Package,
    title: 'Bulk & MOQ ordering',
    description: 'Cart validates MOQ, HSN, GST and freight automatically before checkout.',
  },
  {
    icon: Wallet,
    title: 'Credit-ready checkout',
    description: 'UPI, cards, netbanking, COD — and NBFC-powered BNPL for growing retailers.',
  },
  {
    icon: Headset,
    title: 'Order agents on-call',
    description: 'Prefer to order on the phone? Our agents place, track and follow up for you.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Store,
    title: 'Register your shop',
    desc: 'Free retailer account with mobile OTP. Add GSTIN if you have one.'
  },
  {
    step: '02',
    icon: Package,
    title: 'Order at wholesale price',
    desc: 'Browse verified catalogue. Add to cart at MOQ. Pay via UPI, card or COD.'
  },
  {
    step: '03',
    icon: Truck,
    title: 'We deliver + invoice',
    desc: 'Managed logistics with live tracking. GST-compliant e-invoice for your books.'
  }
];

const INFO_STRIP = [
  { title: 'Verified sellers only', desc: 'GST + PAN + KYC checked', icon: Shield },
  { title: 'Pan-India logistics', desc: '720+ cities, 2-5 day delivery', icon: Truck },
  { title: 'Credit-ready payments', desc: 'UPI · Cards · COD · NBFC BNPL', icon: Wallet },
  { title: 'Order agent support', desc: 'Call · WhatsApp · in-app chat', icon: Headset },
];

const CATEGORIES = [
  { id: 'fmcg', name: 'FMCG & Grocery', count: '12,480 SKUs', icon: '🛒', subtext: 'Atta · Dal · Oil · Snacks', color: '#FF9800' },
  { id: 'kitchenware', name: 'Kitchenware', count: '6,210 SKUs', icon: '🍳', subtext: 'Steel · Non-stick · Storage', color: '#673AB7' },
  { id: 'apparel', name: 'Apparel & Textiles', count: '18,930 SKUs', icon: '👗', subtext: 'Sarees · Kurtis · Fabric rolls', color: '#E91E63' },
  { id: 'electronics', name: 'Electronics', count: '4,820 SKUs', icon: '🔌', subtext: 'Chargers · Bulbs · Accessories', color: '#2196F3' },
  { id: 'personal-care', name: 'Personal Care', count: '5,310 SKUs', icon: '🧴', subtext: 'Soap · Shampoo · Oral', color: '#4CAF50' },
  { id: 'stationery', name: 'Stationery & Office', count: '2,140 SKUs', icon: '✏️', subtext: 'Notebooks · Pens · Files', color: '#FFC107' },
  { id: 'home-decor', name: 'Home & Decor', count: '3,980 SKUs', icon: '🛋️', subtext: 'Bedsheets · Curtains · Rugs', color: '#F44336' },
  { id: 'toys', name: 'Toys & Gifting', count: '1,670 SKUs', icon: '🎁', subtext: 'Rakhi · Diwali · Festive', color: '#9C27B0' },
];

const DEALS = [
  {
    id: 1,
    brandInitials: 'SM',
    bgColor: '#E65100',
    badgeLeft: 'BESTSELLER',
    badgeRight: '23% off',
    brandName: 'Shakti Mills',
    productName: 'Shakti Chakki Fresh Atta 10 kg',
    price: '₹398',
    originalPrice: '₹520',
    unit: '/ bag',
    moq: 'MOQ 20 bag',
    hsn: 'HSN 1101 · GST 0%',
    rating: '4.7',
    reviews: '1289',
    location: 'Indore',
  },
  {
    id: 2,
    brandInitials: 'RT',
    bgColor: '#C2185B',
    badgeLeft: 'BESTSELLER',
    badgeRight: '40% off',
    brandName: 'Raja Textiles',
    productName: 'Raja Cotton Saree - Lot of 24 (Assorted)',
    price: '₹8,640',
    originalPrice: '₹14,400',
    unit: '/ lot',
    moq: 'MOQ 1 lot',
    hsn: 'HSN 5208 · GST 5%',
    rating: '4.6',
    reviews: '231',
    location: 'Surat',
  },
  {
    id: 3,
    brandInitials: 'VE',
    bgColor: '#1565C0',
    badgeLeft: 'DEAL',
    badgeRight: '50% off',
    brandName: 'Voltek Electricals',
    productName: 'Voltek 9W LED Bulb - Carton of 100',
    price: '₹7,500',
    originalPrice: '₹15,000',
    unit: '/ carton',
    moq: 'MOQ 1 carton',
    hsn: 'HSN 8539 · GST 12%',
    rating: '4.5',
    reviews: '356',
    location: 'Delhi',
  },
  {
    id: 4,
    brandInitials: 'SK',
    bgColor: '#37474F',
    badgeLeft: 'NEW',
    badgeRight: '39% off',
    brandName: 'Steelo Kitchen',
    productName: 'Steelo Tri-Ply SS Kadai 24cm - Carton of 12',
    price: '₹13,200',
    originalPrice: '₹21,600',
    unit: '/ carton',
    moq: 'MOQ 2 carton',
    hsn: 'HSN 7323 · GST 12%',
    rating: '4.7',
    reviews: '168',
    location: 'Rajkot',
  },
  {
    id: 5,
    brandInitials: 'HV',
    bgColor: '#00695C',
    badgeLeft: '',
    badgeRight: '44% off',
    brandName: 'Herbal Veda',
    productName: 'Herbal Veda Neem Soap 100g - Carton of 144',
    price: '₹5,760',
    originalPrice: '₹10,368',
    unit: '/ carton',
    moq: 'MOQ 2 carton',
    hsn: 'HSN 3401 · GST 18%',
    rating: '4.6',
    reviews: '208',
    location: 'Haridwar',
  },
  {
    id: 6,
    brandInitials: 'UG',
    bgColor: '#651FFF',
    badgeLeft: 'NEW',
    badgeRight: '50% off',
    brandName: 'Utsav Gifting',
    productName: 'Utsav Festive Diya & Rangoli Combo - Lot of 50',
    price: '₹6,250',
    originalPrice: '₹12,500',
    unit: '/ lot',
    moq: 'MOQ 4 lot',
    hsn: 'HSN 9505 · GST 18%',
    rating: '4.8',
    reviews: '74',
    location: 'Moradabad',
  },
  {
    id: 7,
    brandInitials: 'RC',
    bgColor: '#D500F9',
    badgeLeft: 'BESTSELLER',
    badgeRight: '47% off',
    brandName: 'Roopvati Cosmetics',
    productName: 'Roopvati Long-Stay Kajal - Tray of 144',
    price: '₹11,520',
    originalPrice: '₹21,600',
    unit: '/ tray',
    moq: 'MOQ 3 tray',
    hsn: 'HSN 3304 · GST 18%',
    rating: '4.7',
    reviews: '199',
    location: 'Kanpur',
  },
  {
    id: 8,
    brandInitials: 'GD',
    bgColor: '#D32F2F',
    badgeLeft: 'TRENDING',
    badgeRight: '43% off',
    brandName: 'Gharana Decor',
    productName: 'Gharana Cotton Double Bedsheet - Pack of 12',
    price: '₹8,280',
    originalPrice: '₹14,400',
    unit: '/ pack',
    moq: 'MOQ 2 pack',
    hsn: 'HSN 6304 · GST 5%',
    rating: '4.5',
    reviews: '143',
    location: 'Panipat',
  }
];

const BRANDS = [
  { name: 'Shakti Mills', location: 'Indore', initials: 'SM', color: '#f57c00' },
  { name: 'Raja Textiles', location: 'Surat', initials: 'RT', color: '#d81b60' },
  { name: 'Annapurna Foods', location: 'Jaipur', initials: 'AF', color: '#f9a825' },
  { name: 'Steelo Kitchen', location: 'Rajkot', initials: 'SK', color: '#37474f' },
  { name: 'Voltek Electricals', location: 'Delhi', initials: 'VE', color: '#2962ff' },
  { name: 'Herbal Veda', location: 'Haridwar', initials: 'HV', color: '#00897b' },
  { name: 'Wrytek Stationery', location: 'Ludhiana', initials: 'WT', color: '#ffb300' },
  { name: 'Gharana Decor', location: 'Panipat', initials: 'GD', color: '#e53935' },
  { name: 'Utsav Gifting', location: 'Moradabad', initials: 'UG', color: '#7c4dff' },
  { name: 'Loha Hardware', location: 'Aligarh', initials: 'LH', color: '#546e7a' },
  { name: 'PackMax', location: 'Mumbai', initials: 'PM', color: '#ef6c00' },
  { name: 'Roopvati Cosmetics', location: 'Kanpur', initials: 'RC', color: '#d500f9' },
];

// ── Public Header ─────────────────────────────────────────────────────────────
const PublicHeader: React.FC = () => {
  return (
    <div className={styles.headerWrapper}>
      {/* Top Bar */}
      <div className={styles.headerTopBar}>
        <div className={styles.headerTopBarInner}>
          <div className={styles.topBarLeft}>
            🇮🇳 Serving retailers across 720+ Indian cities
          </div>
          <div className={styles.topBarRight}>
            <a href="tel:1800123456" className={styles.topBarLink}>📞 1800-123-456</a>
            <Link href={ROUTES.AUTH.REGISTER} className={styles.topBarLink}>Become a seller</Link>
          </div>
        </div>
      </div>

      {/* Middle Bar */}
      <div className={styles.headerMiddleBar}>
        <div className={styles.headerMiddleBarInner}>
          <Link href="/" className={styles.headerLogo}>
            <div className={styles.headerLogoIcon}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>HW</span>
            </div>
            <div className={styles.headerLogoTextWrap}>
              <span className={styles.headerLogoText}>Hindustan Wholesale</span>
              <span className={styles.headerLogoSubtext}>FACTORY SE SEEDHE DUKAAN TAK</span>
            </div>
          </Link>

          <div className={styles.headerSearch}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products, brands, HSN codes..." 
              className={styles.searchInput}
            />
            <button className={styles.searchBtn}>Search</button>
          </div>

          <div className={styles.headerActions}>
            <Link href={ROUTES.AUTH.LOGIN} className={styles.actionBtn}>
              <User size={20} />
              <span>Sign in</span>
            </Link>
            <Link href={ROUTES.AUTH.REGISTER} className={styles.registerBtn}>
              Register
            </Link>
            <div className={styles.cartBtn}>
              <ShoppingCart size={22} />
              <span className={styles.cartBadge}>0</span>
            </div>
            <button className={styles.mobileMenuBtn}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.headerBottomBar}>
        <div className={styles.headerBottomBarInner}>
          <div className={styles.allCategories}>
            <Menu size={16} />
            <span>All categories</span>
            <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
          </div>
          <div className={styles.bottomNavLinks}>
            {CATEGORIES.map(c => (
              <Link key={c.id} href="#" className={styles.bottomNavLink}>{c.name}</Link>
            ))}
            <Link href="#" className={`${styles.bottomNavLink} ${styles.viewAllLink}`}>
              View all &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PublicHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <CheckCircle size={12} color="white" />
              INDIA&apos;S MANAGED B2B MARKETPLACE
            </div>

            <h1 className={styles.heroTitle}>
              Factory se seedhe <br />
              <span className={styles.heroTitleOrange}>aapki dukaan tak.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Bulk pricing from verified manufacturers, GST-compliant invoicing and pan-India delivery — built for India&apos;s retailers, kirana stores and traders.
            </p>

            <div className={styles.heroCta}>
              <Link href={ROUTES.AUTH.REGISTER} className={styles.heroBtnPrimary}>
                Start buying — free registration
                <ArrowRight size={18} />
              </Link>
              <Link href={ROUTES.AUTH.REGISTER} className={styles.heroBtnSecondary}>
                Sell on Hindustan Wholesale
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>15k+</span>
                <span className={styles.heroStatLabel}>Verified sellers</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>720+</span>
                <span className={styles.heroStatLabel}>Cities served</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>₹380 Cr+</span>
                <span className={styles.heroStatLabel}>GMV enabled</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <img 
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Wholesale marketplace" 
              className={styles.heroImage} 
            />
            <div className={styles.heroOverlayBadge}>
              <div className={styles.heroOverlayIcon}>
                <Shield size={24} />
              </div>
              <div className={styles.heroOverlayText}>
                <span className={styles.heroOverlayTitle}>100% GST-compliant orders</span>
                <span className={styles.heroOverlayDesc}>Every invoice ready for your books & ITC.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Info Strip ──────────────────────────────────────────────────────── */}
      <section className={styles.infoStrip}>
        <div className={styles.infoStripInner}>
          {INFO_STRIP.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={styles.infoStripItem}>
                <div className={styles.infoStripIcon}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className={styles.infoStripTitle}>{item.title}</div>
                  <div className={styles.infoStripDesc}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section id="categories" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.categorySectionHeader}>
            <div className={styles.categoryHeaderLeft}>
              <span className={styles.sectionEyebrowPill}>SHOP BY CATEGORY</span>
              <h2 className={styles.sectionTitle}>Wholesale ranges built<br />for every Indian dukaan</h2>
              <p className={styles.sectionSubtitle}>From kirana staples to festive gifting — 60,000+ SKUs across 12 verticals, priced at MOQ.</p>
            </div>
            <Link href="#" className={styles.categoryAllBtn}>
              All categories &rarr;
            </Link>
          </div>
          
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href="#" className={styles.categoryCard}>
                <div className={styles.categoryIconWrap} style={{ background: cat.color }}>
                  {cat.icon}
                </div>
                <div className={styles.categoryContent}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categorySubtext}>{cat.subtext}</span>
                </div>
                <div className={styles.categoryFooter}>
                  <span className={styles.categoryCount}>{cat.count}</span>
                  <span className={styles.categoryShopBtn}>Shop &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deals ───────────────────────────────────────────────────────────── */}
      <section id="deals" className={styles.section} style={{ background: '#FFFFFF' }}>
        <div className={styles.sectionInner}>
          <div className={styles.categorySectionHeader}>
            <div className={styles.categoryHeaderLeft}>
              <span className={styles.sectionEyebrowPill}>FEATURED</span>
              <h2 className={styles.sectionTitle}>Handpicked wholesale deals for you</h2>
              <p className={styles.sectionSubtitle}>Curated by our category managers based on retailer demand and margin.</p>
            </div>
            <Link href="#" className={styles.categoryAllBtn}>
              Explore more &rarr;
            </Link>
          </div>
          <div className={styles.dealsGrid}>
            {DEALS.map((deal) => (
              <div key={deal.id} className={styles.dealCard}>
                <div className={styles.dealImageWrap} style={{ background: deal.bgColor }}>
                  {deal.badgeLeft && <div className={styles.dealBadgeLeft}>{deal.badgeLeft}</div>}
                  {deal.badgeRight && <div className={styles.dealBadgeRight}>{deal.badgeRight}</div>}
                  <div className={styles.dealBrandInitials}>{deal.brandInitials}</div>
                </div>
                <div className={styles.dealContent}>
                  <div className={styles.dealBrandRow}>
                    <span className={styles.dealBrandName}>{deal.brandName}</span>
                    <CheckCircle size={14} className={styles.dealBrandVerified} />
                  </div>
                  <div className={styles.dealProductName}>{deal.productName}</div>
                  <div className={styles.dealPriceRow}>
                    <span className={styles.dealPrice}>{deal.price}</span>
                    <span className={styles.dealOriginalPrice}>{deal.originalPrice}</span>
                    <span className={styles.dealUnit}>{deal.unit}</span>
                  </div>
                  <div className={styles.dealTagsRow}>
                    <span className={styles.dealTagMoq}>{deal.moq}</span>
                    <span className={styles.dealTagHsn}>{deal.hsn}</span>
                  </div>
                  <div className={styles.dealFooter}>
                    <div className={styles.dealRatingRow}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span className={styles.dealRatingText}>{deal.rating} · {deal.reviews}</span>
                    </div>
                    <div className={styles.dealLocationRow}>
                      <MapPin size={12} />
                      <span className={styles.dealLocationText}>{deal.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands ────────────────────────────────────────────────────────── */}
      <section id="brands" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.categorySectionHeader}>
            <div className={styles.categoryHeaderLeft}>
              <span className={styles.sectionEyebrowPill}>VERIFIED SUPPLIERS</span>
              <h2 className={styles.sectionTitle}>India&apos;s most-loved wholesale brands</h2>
              <p className={styles.sectionSubtitle}>Every brand is GST-registered, PAN-verified and physically inspected before onboarding.</p>
            </div>
            <Link href="#" className={styles.categoryAllBtn}>
              All brands &rarr;
            </Link>
          </div>
          <div className={styles.brandsGrid}>
            {BRANDS.map((brand) => (
              <Link key={brand.name} href="#" className={styles.brandCard}>
                <div className={styles.brandIconWrap} style={{ background: brand.color }}>
                  {brand.initials}
                </div>
                <div className={styles.brandCardInfo}>
                  <div className={styles.brandName}>{brand.name}</div>
                  <div className={styles.brandLocation}>{brand.location}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ──────────────────────────────────────────────────────── */}
      <section id="trending" className={styles.section} style={{ background: '#FFFFFF' }}>
        <div className={styles.sectionInner}>
          <div className={styles.categorySectionHeader}>
            <div className={styles.categoryHeaderLeft}>
              <span className={styles.sectionEyebrowPill}>TRENDING</span>
              <h2 className={styles.sectionTitle}>Trending this week</h2>
              <p className={styles.sectionSubtitle}>Fast-moving SKUs that retailers are buying in bulk right now.</p>
            </div>
            <Link href="#" className={styles.categoryAllBtn}>
              View all trending &rarr;
            </Link>
          </div>
          <div className={styles.dealsGrid}>
            {DEALS.slice(0, 4).map((deal) => (
              <div key={deal.id + '-trending'} className={styles.dealCard}>
                <div className={styles.dealImageWrap} style={{ background: deal.bgColor }}>
                  {deal.badgeLeft && <div className={styles.dealBadgeLeft}>{deal.badgeLeft}</div>}
                  {deal.badgeRight && <div className={styles.dealBadgeRight}>{deal.badgeRight}</div>}
                  <div className={styles.dealBrandInitials}>{deal.brandInitials}</div>
                </div>
                <div className={styles.dealContent}>
                  <div className={styles.dealBrandRow}>
                    <span className={styles.dealBrandName}>{deal.brandName}</span>
                    <CheckCircle size={14} className={styles.dealBrandVerified} />
                  </div>
                  <div className={styles.dealProductName}>{deal.productName}</div>
                  <div className={styles.dealPriceRow}>
                    <span className={styles.dealPrice}>{deal.price}</span>
                    <span className={styles.dealOriginalPrice}>{deal.originalPrice}</span>
                    <span className={styles.dealUnit}>{deal.unit}</span>
                  </div>
                  <div className={styles.dealTagsRow}>
                    <span className={styles.dealTagMoq}>{deal.moq}</span>
                    <span className={styles.dealTagHsn}>{deal.hsn}</span>
                  </div>
                  <div className={styles.dealFooter}>
                    <div className={styles.dealRatingRow}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span className={styles.dealRatingText}>{deal.rating} · {deal.reviews}</span>
                    </div>
                    <div className={styles.dealLocationRow}>
                      <MapPin size={12} />
                      <span className={styles.dealLocationText}>{deal.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.featuresContainer}>
            <span className={styles.featuresEyebrow}>WHY HINDUSTAN WHOLESALE</span>
            <h2 className={styles.featuresMainTitle}>Enterprise-grade wholesale,<br/>made ridiculously simple.</h2>
            <p className={styles.featuresSubtitle}>Six things that make us the retailer&apos;s default choice for bulk sourcing.</p>
            <div className={styles.featuresGrid}>
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                      <Icon size={18} />
                    </div>
                    <div className={styles.featureTextWrap}>
                      <h3 className={styles.featureTitle}>{feat.title}</h3>
                      <p className={styles.featureDesc}>{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.hiwHeader}>
            <span className={styles.hiwEyebrow}>HOW IT WORKS</span>
            <h2 className={styles.hiwTitle}>From signup to delivered stock in 3 steps</h2>
          </div>
          <div className={styles.hiwGrid}>
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className={styles.hiwCard}>
                  <div className={styles.hiwCardTop}>
                    <div className={styles.hiwIconWrap}><Icon size={20} /></div>
                    <div className={styles.hiwStepNum}>{step.step}</div>
                  </div>
                  <h3 className={styles.hiwCardTitle}>{step.title}</h3>
                  <p className={styles.hiwCardDesc}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Seller CTA Banner ─────────────────────────────────────────────── */}
      <section className={styles.section} style={{ background: '#F8FAFC', paddingBottom: '120px' }}>
        <div className={styles.sectionInner}>
          <div className={styles.sellerBanner}>
            <div className={styles.sellerBannerLeft}>
              <span className={styles.sellerBannerEyebrow}>
                <Zap size={14} /> FOR MANUFACTURERS, BRANDS & DISTRIBUTORS
              </span>
              <h2 className={styles.sellerBannerTitle}>
                Sell to lakhs of Indian retailers,<br />without the operational headache.
              </h2>
              <p className={styles.sellerBannerSubtitle}>
                We handle discovery, checkout, payments, invoicing, logistics and support.
                You focus on quality and manufacturing.
              </p>
              <Button size="lg" className={styles.sellerBannerBtn}>Apply to become a seller &rarr;</Button>
            </div>
            <div className={styles.sellerBannerRight}>
              <div className={styles.sellerStatCard}>
                <div className={styles.sellerStatValue}>0%</div>
                <div className={styles.sellerStatLabel}>LISTING FEES</div>
              </div>
              <div className={styles.sellerStatCard}>
                <div className={styles.sellerStatValue}>T+2</div>
                <div className={styles.sellerStatLabel}>SETTLEMENT</div>
              </div>
              <div className={styles.sellerStatCard}>
                <div className={styles.sellerStatValue}>24hr</div>
                <div className={styles.sellerStatLabel}>KYC APPROVAL</div>
              </div>
              <div className={styles.sellerStatCard}>
                <div className={styles.sellerStatValue}>15k+</div>
                <div className={styles.sellerStatLabel}>LIVE BUYERS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrandCol}>
              <div className={styles.footerBrandHeader}>
                <div className={styles.footerLogoIcon}>
                  HW
                </div>
                <div className={styles.footerBrandTextWrap}>
                  <div className={styles.footerBrandName}>Hindustan Wholesale</div>
                  <div className={styles.footerBrandSlogan}>FACTORY SE SEEDHE DUKAAN TAK</div>
                </div>
              </div>
              <p className={styles.footerBrandDesc}>
                India&apos;s trusted managed B2B wholesale marketplace connecting verified sellers with retailers across Bharat.
              </p>
              <div className={styles.footerTrustBadges}>
                <span className={`${styles.trustBadge} ${styles.trustBadgeGreen}`}><Shield size={12} /> Verified sellers</span>
                <span className={`${styles.trustBadge} ${styles.trustBadgeBlue}`}><FileText size={12} /> GST-compliant invoices</span>
                <span className={`${styles.trustBadge} ${styles.trustBadgeOrange}`}><Truck size={12} /> Pan-India logistics</span>
              </div>
            </div>

            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerLinkTitle}>Marketplace</h4>
              <Link href="#" className={styles.footerLink}>Home</Link>
              <Link href="#" className={styles.footerLink}>All categories</Link>
              <Link href="#" className={styles.footerLink}>Brands</Link>
              <Link href="#" className={styles.footerLink}>Become a seller</Link>
            </div>

            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerLinkTitle}>Company</h4>
              <Link href="#" className={styles.footerLink}>About us</Link>
              <Link href="#" className={styles.footerLink}>Contact</Link>
              <Link href="#" className={styles.footerLink}>Careers</Link>
              <Link href="#" className={styles.footerLink}>Press</Link>
            </div>

            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerLinkTitle}>Support</h4>
              <div className={styles.footerContactRow}>
                <Phone size={14} className={styles.footerContactIcon} />
                <span>1800-123-456 (toll-free)</span>
              </div>
              <div className={styles.footerContactRow}>
                <Mail size={14} className={styles.footerContactIcon} />
                <span>care@hindustanwholesale.in</span>
              </div>
              <div className={styles.footerContactRow}>
                <MapPin size={14} className={styles.footerContactIcon} />
                <span>Bengaluru · Delhi · Mumbai</span>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerCopy}>
              © 2026 Hindustan Wholesale Pvt. Ltd. · CIN: U74999KA2025PTC000000 · GSTIN: 29ABCDE1234F1Z5
            </div>
            <div className={styles.footerLegalLinks}>
              <Link href="#">Terms</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Refunds</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
