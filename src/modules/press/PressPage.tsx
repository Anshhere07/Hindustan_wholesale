'use client';

import React from 'react';
import {
  Newspaper,
  Calendar,
  MapPin,
  CheckCircle2,
  Quote,
  ArrowLeft,
  Building2,
  TrendingUp,
  ShieldCheck,
  Truck,
  FileCheck,
  Headset,
} from 'lucide-react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/modules/landing/LandingPage';
import styles from './PressPage.module.css';

export const PressPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.mainContent}>
        {/* Back Navigation */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: '#092254',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Header Title Section */}
        <div className={styles.pressHeader}>
          <div className={styles.pressCategoryBadge}>
            <Newspaper size={14} /> Official Press Release
          </div>
          <h1 className={styles.pressTitle}>
            Hindustan Wholesale Launches to Simplify Wholesale Buying for Retailers Across India
          </h1>
          <div className={styles.pressMetaRow}>
            <div className={styles.pressMetaItem}>
              <MapPin size={15} style={{ color: '#092254' }} /> Dist - Hardoi , Lucknow, Uttar Pradesh
            </div>
            <span>•</span>
            <div className={styles.pressMetaItem}>
              <Calendar size={15} style={{ color: '#092254' }} /> July 2026
            </div>
          </div>
        </div>

        {/* Press Article Content Card */}
        <div className={styles.articleCard}>
          <p className={styles.leadParagraph}>
            <strong>Hindustan Wholesale</strong>, a technology-driven B2B wholesale marketplace, today announced the launch of its platform with a mission to simplify wholesale procurement for retailers across India. The company aims to connect retailers with verified manufacturers, brands, wholesalers, distributors, and traders through a transparent, digital marketplace.
          </p>

          {/* Motto Box */}
          <div className={styles.mottoBox}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 12, display: 'flex' }}>
              <Building2 size={28} color="white" />
            </div>
            <div>
              <div className={styles.mottoText}>
                “Factory Se Seedhe Aapki Dukaan Tak”
              </div>
              <div className={styles.mottoSubtitle}>
                Hindustan Wholesale is focused on making wholesale purchasing more efficient, reliable, and accessible for retailers nationwide.
              </div>
            </div>
          </div>

          <p className={styles.bodyText}>
            Retailers across India often face challenges such as limited supplier choices, inconsistent pricing, and time-consuming procurement. The platform is launching with a primary focus on the <strong>automobile spare parts</strong> category and plans to expand into additional wholesale categories in future phases.
          </p>

          {/* Section: Solving Real Problems */}
          <h2 className={styles.sectionTitle}>Solving Real Problems for Retailers</h2>
          <p className={styles.bodyText}>
            Across India, many retailers spend significant time sourcing products from multiple suppliers, negotiating prices, and arranging transportation. Hindustan Wholesale is designed to streamline that process by offering a single platform where businesses can discover products from verified suppliers, compare options, and place wholesale orders with greater confidence.
          </p>

          {/* Key Principles Grid */}
          <div className={styles.principlesGrid}>
            <div className={styles.principleCard}>
              <ShieldCheck size={20} className={styles.principleIcon} />
              <span>Verified Suppliers</span>
            </div>
            <div className={styles.principleCard}>
              <TrendingUp size={20} className={styles.principleIcon} />
              <span>Transparent Pricing</span>
            </div>
            <div className={styles.principleCard}>
              <FileCheck size={20} className={styles.principleIcon} />
              <span>GST-Compliant Invoicing</span>
            </div>
            <div className={styles.principleCard}>
              <Truck size={20} className={styles.principleIcon} />
              <span>Pan-India Delivery</span>
            </div>
            <div className={styles.principleCard}>
              <CheckCircle2 size={20} className={styles.principleIcon} />
              <span>Secure Digital Procurement</span>
            </div>
            <div className={styles.principleCard}>
              <Headset size={20} className={styles.principleIcon} />
              <span>Dedicated Customer Support</span>
            </div>
          </div>

          {/* Section: Platform Built for Growth */}
          <h2 className={styles.sectionTitle}>A Platform Built for Business Growth</h2>
          <p className={styles.bodyText}>
            Hindustan Wholesale is designed as a managed B2B marketplace where the company oversees important aspects of the buying experience, including supplier verification, order management, customer support, and coordination of logistics. This approach is intended to help retailers purchase inventory with greater confidence and convenience.
          </p>

          {/* Founder Quote */}
          <div className={styles.founderQuoteBox}>
            <Quote size={28} style={{ color: '#890000', opacity: 0.3, marginBottom: 8 }} />
            <p className={styles.quoteText}>
              “We’re not just building a B2B wholesale platform. We’re building the future of retail commerce for millions of businesses across India. Every retailer deserves access to genuine products, transparent pricing, and reliable business opportunities—whether they’re in a metro city or a small town. Hindustan Wholesale is our commitment to making wholesale buying simpler, smarter, and more trustworthy.”
            </p>
            <div className={styles.quoteAuthor}>Shaban Mansoori</div>
            <div className={styles.quoteRole}>Founder, Hindustan Wholesale</div>
          </div>

          {/* Section: Looking Ahead */}
          <h2 className={styles.sectionTitle}>Looking Ahead</h2>
          <p className={styles.bodyText}>
            The company plans to continue investing in technology and expand its platform over time with additional product categories and business services. Future plans include logistics enhancements, financial solutions, and digital tools that support the growth of retailers and suppliers across India.
          </p>

          {/* About Box */}
          <div className={styles.aboutBox}>
            <h3 className={styles.aboutTitle}>About Hindustan Wholesale</h3>
            <p className={styles.aboutText}>
              Hindustan Wholesale is a managed B2B wholesale marketplace built for retailers, manufacturers, wholesalers, distributors, and traders across India. The platform is designed to simplify wholesale procurement through verified suppliers, transparent pricing, GST-compliant invoicing, and reliable delivery.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PressPage;
