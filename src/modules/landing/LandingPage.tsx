'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, TrendingUp, Shield, Zap,
  Package, Truck, Award, ChevronRight, ChevronDown, Building2, Menu, Image as ImageIcon,
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

export const CATEGORIES = [
  { id: 'automobile', name: 'Automobile', count: '5,000 SKUs', icon: '🚗', subtext: '2-wheeler · 3-wheeler · Agriculture', color: '#E91E63' },
  { id: 'clothing', name: 'Clothing', count: '18,930 SKUs', icon: '👗', subtext: 'Sarees · Kurtis · Fabric rolls', color: '#2196F3' },
];

export const DEALS = [
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

export const BRANDS = [
  { name: 'Hero MotoCorp', location: 'New Delhi', logo: '/brands/hero.png' },
  { name: 'Honda', location: 'Gurugram', logo: '/brands/honda.png' },
  { name: 'TVS', location: 'Chennai', logo: '/brands/tvs.png' },
  { name: 'Bajaj', location: 'Pune', logo: '/brands/bajaj.svg' },
  { name: 'Royal Enfield', location: 'Chennai', logo: '/brands/royal_enfield.png' },
  { name: 'Ola Electric', location: 'Bengaluru', logo: '/brands/ola_electric.png' },
  { name: 'Castrol', location: 'Mumbai', logo: '/brands/castrol.svg' },
  { name: 'NBC', location: 'Jaipur', logo: '/brands/nbc.svg' },
  { name: 'Yamaha', location: 'Chennai', logo: '/brands/yamaha.png' },
  { name: 'TATA', location: 'Mumbai', logo: '/brands/tata.svg' },
  { name: 'ASK', location: 'Gurugram', logo: '/brands/ask.png' },
  { name: 'Endurance', location: 'Aurangabad', logo: '/brands/endurance.svg' },
  { name: 'Lumax', location: 'Gurugram', logo: '/brands/lumax.png' },
  { name: 'Varroc', location: 'Aurangabad', logo: '/brands/varroc.png' },
  { name: 'Spark Minda', location: 'Gurugram', logo: '/brands/spark_minda.png' },
  { name: 'Pricol', location: 'Coimbatore', logo: '/brands/pricol.png' },
  { name: 'Emtex', location: 'Gurugram', logo: '/brands/emtex.svg' },
  { name: 'BOSCH', location: 'Bengaluru', logo: '/brands/bosch.svg' },
  { name: 'Eicher', location: 'Pune', logo: '/brands/eicher.svg' },
  { name: 'BG Falcon ( Uttar Pradesh )', location: 'Aligarh', logo: '/brands/bg_falcon.svg' },
  { name: 'Minda', location: 'Manesar', logo: '/brands/minda.png' },
];

// ── Public Header ─────────────────────────────────────────────────────────────
export const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = React.useState(false);

  return (
    <div className={styles.headerWrapper}>
      {/* Top Bar */}
      <div className={styles.headerTopBar}>
        <div className={styles.headerTopBarInner}>
          <div className={styles.topBarLeft}>
            🇮🇳 Serving retailers across 720+ Indian cities
          </div>
          <div className={styles.topBarRight}>
            <a href="tel:+918800232363" className={styles.orderByCallBtnHeader}>
              <Phone size={13} /> Order by Call
            </a>
            <Link href={ROUTES.AUTH.LOGIN} className={styles.topBarLink}>Become a retailer</Link>
          </div>
        </div>
      </div>

      {/* Middle Bar */}
      <div className={styles.headerMiddleBar}>
        <div className={styles.headerMiddleBarInner}>
          <Link href="/" className={styles.headerLogo}>
            <div className={styles.headerLogoIcon}>
              <span>HW</span>
            </div>
            <div className={styles.headerLogoTextWrap}>
              <div className={styles.headerLogoText}>
                <span style={{ color: '#A21A32' }}>HINDUSTAN</span><br />
                <span style={{ color: '#8B1028' }}>WHOLESALE</span>
              </div>
              <span className={styles.headerLogoSubtext}>&mdash; Sahi Kharidari, Zyada Munafa &mdash;</span>
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
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={styles.mobileMenuBtn}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.headerBottomBar}>
        <div className={styles.headerBottomBarInner}>
          <a href="/categories" className={styles.allCategories} style={{ textDecoration: 'none' }}>
            <Menu size={16} />
            <span>All categories</span>
            <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
          </a>
          <div className={styles.bottomNavLinks}>
            <div className={styles.navDropdownItem}>
              <div
                className={styles.bottomNavLink}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDesktopMenuOpen(!isDesktopMenuOpen);
                }}
              >
                Automobile <ChevronDown size={14} />
              </div>
              {isDesktopMenuOpen && (
                <div className={styles.navDropdownMenuOpen}>

                  <Link href="/categories/automobile/2-wheeler" className={styles.navDropdownLink} onClick={() => setIsDesktopMenuOpen(false)}>2-wheeler</Link>
                  <Link href="/categories/automobile/3-wheeler" className={styles.navDropdownLink} onClick={() => setIsDesktopMenuOpen(false)}>3-wheeler</Link>
                  <Link href="/categories/automobile/4-wheeler" className={styles.navDropdownLink} onClick={() => setIsDesktopMenuOpen(false)}>4-wheeler</Link>
                  <Link href="/categories/automobile/agriculture" className={styles.navDropdownLink} onClick={() => setIsDesktopMenuOpen(false)}>Agriculture wheeler</Link>
                </div>
              )}
            </div>
            <Link href="/categories/clothing" className={styles.bottomNavLink}>Clothing</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuDropdown} onClick={() => setIsMobileMenuOpen(false)}>
          <div className={styles.mobileMenuSection}>Automobile</div>

          <Link href="/categories/automobile/2-wheeler" className={styles.mobileMenuSubLink}>2-wheeler</Link>
          <Link href="/categories/automobile/3-wheeler" className={styles.mobileMenuSubLink}>3-wheeler</Link>
          <Link href="/categories/automobile/4-wheeler" className={styles.mobileMenuSubLink}>4-wheeler</Link>
          <Link href="/categories/automobile/agriculture" className={styles.mobileMenuSubLink}>Agriculture wheeler</Link>
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
          <Link href="/categories/clothing" className={styles.mobileMenuLink}>Clothing</Link>
        </div>
      )}
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
              <p className={styles.sectionSubtitle}>From engine oils to essential auto parts — 5,000+ SKUs across all vehicle types, priced at MOQ.</p>
            </div>
            <Link href="/categories" className={styles.categoryAllBtn}>
              All categories &rarr;
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.id}`} className={styles.categoryCard}>
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



      {/* ── Brands ────────────────────────────────────────────────────────── */}
      <section id="brands" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.categorySectionHeader}>
            <div className={styles.categoryHeaderLeft}>
              <span className={styles.sectionEyebrowPill}>VERIFIED SUPPLIERS</span>
              <h2 className={styles.sectionTitle}>India&apos;s most-loved wholesale brands</h2>
              <p className={styles.sectionSubtitle}>Every brand is GST-registered, PAN-verified and physically inspected before onboarding.</p>
            </div>
            <Link href="/brands" className={styles.categoryAllBtn}>
              All brands &rarr;
            </Link>
          </div>
          <div className={styles.brandsGrid}>
            {BRANDS.map((brand) => (
              <Link key={brand.name} href={`/brands/${brand.name.toLowerCase().replace(/ /g, '-')}`} className={styles.brandCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.brandIconWrap} style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                  <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className={styles.brandCardInfo}>
                  <div className={styles.brandName}>{brand.name}</div>
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
              <Link key={deal.id + '-trending'} href={`/products/${deal.id}`} className={styles.dealCard} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className={styles.section} style={{ background: '#F8FAFC' }}>
        <div className={styles.sectionInner}>
          <div className={styles.featuresContainer}>
            <span className={styles.featuresEyebrow}>WHY HINDUSTAN WHOLESALE</span>
            <h2 className={styles.featuresMainTitle}>Enterprise-grade wholesale,<br />made ridiculously simple.</h2>
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
              <Link href={ROUTES.AUTH.LOGIN} className={styles.sellerBannerBtn} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Apply to become a Retailer &rarr;</Link>
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

      <PublicFooter />
    </div>
  );
};

export const PublicFooter: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrandHeader} style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
              <div className={styles.headerLogoIcon}>
                <span>HW</span>
              </div>
              <div className={styles.headerLogoTextWrap}>
                <div className={styles.headerLogoText}>
                  <span style={{ color: '#A21A32' }}>HINDUSTAN</span><br />
                  <span style={{ color: '#8B1028' }}>WHOLESALE</span>
                </div>
                <div className={styles.headerLogoSubtext}>&mdash; Sahi Kharidari, Zyada Munafa &mdash;</div>
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
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/categories" className={styles.footerLink}>All categories</Link>
            <Link href="/brands" className={styles.footerLink}>Brands</Link>
            <Link href="/auth/register" className={styles.footerLink}>Become a seller</Link>
          </div>

          <div className={styles.footerLinkCol}>
            <h4 className={styles.footerLinkTitle}>Company</h4>
            <Link href="/about" className={styles.footerLink}>About us</Link>
            <Link href="#" className={styles.footerLink}>Contact</Link>
            <Link href="#" className={styles.footerLink}>Careers</Link>
            <Link href="#" className={styles.footerLink}>Press</Link>
          </div>

          <div className={styles.footerLinkCol}>
            <h4 className={styles.footerLinkTitle}>Support</h4>
            <a href="tel:+918800232363" className={styles.orderByCallBtnFooter}>
              <Phone size={14} /> Order by Call
            </a>
            <div className={styles.footerContactRow}>
              <Mail size={14} className={styles.footerContactIcon} />
              <span>hindustanwholesale54@gmail.com</span>
            </div>
            <div className={styles.footerContactRow}>
              <MapPin size={14} className={styles.footerContactIcon} />
              <span>5th We work Horizon center, Golf Course Rd, Sector 43, Gurugram 122009</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <a href="https://www.instagram.com/hindustan__wholesale?igsh=dHF0cnhiMzM0ZXJ4&utm_source=qr" target="_blank" rel="noopener noreferrer" className={styles.instagramLink}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerCopy}>
            © 2026 Hindustan Wholesale Pvt. Ltd. · CIN: U46909UP2026PTC249825 · GSTIN: 09AAICH7948B1ZC
          </div>
          <div className={styles.footerLegalLinks}>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
