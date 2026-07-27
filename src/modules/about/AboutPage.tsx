'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Target, 
  Compass, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  Handshake, 
  CheckCircle2, 
  ArrowRight,
  Award,
  Users,
  Package,
  Truck,
  Headphones,
  Zap
} from 'lucide-react';
import styles from './AboutPage.module.css';
import { PublicHeader, PublicFooter } from '../landing/LandingPage';
import { ROUTES } from '@/lib/constants/routes';

const AboutPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        {/* 1. Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackgroundDecoration} />
          <div className={styles.heroContent}>
            <span className={styles.eyebrowPill}>
              <Award size={14} /> ABOUT HINDUSTAN WHOLESALE
            </span>
            <h1 className={styles.heroTitle}>
              Building the Future of Wholesale Commerce in India
            </h1>
            <p className={styles.heroSubtitle}>
              Hindustan Wholesale is a technology-driven B2B wholesale commerce platform built to simplify the way retailers source inventory across India. We empower small and medium retailers by providing direct access to verified wholesalers, transparent pricing, a wide range of quality products, and reliable doorstep delivery—all through one digital platform.
            </p>

            <div className={styles.heroMissionHighlight}>
              ⚡ <strong>Our Core Purpose:</strong> To make wholesale buying faster, smarter, and more accessible for every retailer, regardless of where they are located.
            </div>

            <div className={styles.heroCtaGroup}>
              <a href="tel:+918800232363" className={styles.heroCallBtn}>
                <Phone size={18} /> Order by Call: +91 8800232363
              </a>
              <Link href={ROUTES.AUTH.REGISTER} className={styles.heroSecondaryBtn}>
                Join as Retailer <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Overview / Problem & Operating System Statement */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>DIGITAL TRANSFORMATIONS FOR BHARAT</span>
            <h2 className={styles.sectionTitle}>Solving Real-World Retail Challenges</h2>
            <p className={styles.sectionSubtitle}>
              Today, millions of retailers in Tier-3, Tier-4, and rural India continue to face challenges such as limited product choices, price uncertainty, dependence on local middlemen, and inefficient procurement processes. Hindustan Wholesale is solving these challenges by creating a trusted digital ecosystem where businesses can purchase inventory with confidence and grow without geographical limitations.
            </p>
            <div style={{ marginTop: '24px', fontStyle: 'italic', fontWeight: 700, color: '#0f172a', fontSize: '18px' }}>
              &ldquo;We are more than just a B2B marketplace. We are building the operating system for India&rsquo;s retail commerce.&rdquo;
            </div>
          </div>

          {/* 3. Vision & Mission Cards */}
          <div className={styles.visionMissionGrid}>
            <div className={styles.vmCard}>
              <div className={styles.vmCardHeader}>
                <div className={`${styles.vmIconBadge} ${styles.vmIconOrange}`}>
                  <Compass size={28} />
                </div>
                <h3 className={styles.vmTitle}>Our Vision</h3>
              </div>
              <p className={styles.vmText}>
                To become India&rsquo;s no 1 B2B wholesale e-commerce platform, connecting businesses across every town, village, and city through technology, transparency, and reliable supply chains.
              </p>
            </div>

            <div className={styles.vmCard}>
              <div className={styles.vmCardHeader}>
                <div className={`${styles.vmIconBadge} ${styles.vmIconBlue}`}>
                  <Target size={28} />
                </div>
                <h3 className={styles.vmTitle}>Our Mission</h3>
              </div>
              <p className={styles.vmText}>
                To empower millions of retailers by providing a seamless digital wholesale experience with verified suppliers, competitive pricing, reliable logistics, and exceptional customer support—helping every business grow faster and more profitably.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Values Section */}
        <section className={styles.valuesSection}>
          <div className={styles.valuesInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>WHAT WE BELIEVE</span>
              <h2 className={styles.sectionTitle}>The Principles That Guide Us</h2>
              <p className={styles.sectionSubtitle}>
                Our values shape how we build our technology, verify our sellers, and serve millions of shopkeepers.
              </p>
            </div>

            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <ShieldCheck size={24} />
                </div>
                <h3 className={styles.valueTitle}>Trust First</h3>
                <p className={styles.valueDesc}>
                  Every seller on our platform goes through a verification process to build confidence between buyers and suppliers.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Cpu size={24} />
                </div>
                <h3 className={styles.valueTitle}>Technology for Every Business</h3>
                <p className={styles.valueDesc}>
                  Digital commerce should not be limited to metropolitan cities. Every retailer deserves access to modern technology and efficient procurement.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <TrendingUp size={24} />
                </div>
                <h3 className={styles.valueTitle}>Customer Success</h3>
                <p className={styles.valueDesc}>
                  Our success is measured by the growth of our retailers and wholesalers. When they grow, we grow.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Handshake size={24} />
                </div>
                <h3 className={styles.valueTitle}>Long-Term Relationships</h3>
                <p className={styles.valueDesc}>
                  We believe partnerships create stronger businesses than transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Our Journey Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>OUR STORY</span>
            <h2 className={styles.sectionTitle}>The Journey of Hindustan Wholesale</h2>
            <p className={styles.sectionSubtitle}>
              Every successful company begins with a problem that someone chooses not to ignore. Hindustan Wholesale was born from years of firsthand experience in India&rsquo;s wholesale ecosystem.
            </p>
          </div>

          <div className={styles.journeyContainer}>
            <p className={styles.journeyText}>
              Our founder spent <strong>three years as a retailer</strong> and <strong>three years as a wholesaler</strong>, working closely with businesses on both sides of the supply chain. This unique experience revealed the everyday challenges faced by retailers—limited product availability, inconsistent pricing, delayed deliveries, dependence on local distributors, and the lack of a reliable digital procurement platform.
            </p>

            <p className={styles.journeyText}>
              At the same time, wholesalers struggled to reach new customers efficiently and expand beyond their local markets. Seeing these challenges from both perspectives inspired a single vision:
            </p>

            <div className={styles.journeyHighlightGrid}>
              <div className={styles.journeyBadgeCard}>
                <div className={styles.journeyBadgeIcon}>
                  <Users size={20} />
                </div>
                <div>
                  <h4 className={styles.journeyBadgeTitle}>For Retailers</h4>
                  <p className={styles.journeyBadgeDesc}>Easily source quality inventory with transparent pricing & doorstep delivery.</p>
                </div>
              </div>

              <div className={styles.journeyBadgeCard}>
                <div className={styles.journeyBadgeIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className={styles.journeyBadgeTitle}>For Wholesalers</h4>
                  <p className={styles.journeyBadgeDesc}>Expand customer reach digitally across 720+ Indian cities without local barriers.</p>
                </div>
              </div>
            </div>

            <div className={styles.journeyVisionCallout}>
              <span className={styles.journeyVisionTitle}>EVOLUTION OF OUR MISSION</span>
              <p className={styles.journeyVisionQuote}>
                &ldquo;That vision became Hindustan Wholesale. What started as an idea has evolved into a mission to digitize India&rsquo;s wholesale ecosystem and make business procurement as simple as online shopping.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* 6. Meet Our Founder Section */}
        <section className={styles.founderSection}>
          <div className={styles.section} style={{ padding: '60px 24px' }}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>LEADERSHIP</span>
              <h2 className={styles.sectionTitle}>Meet Our Founder</h2>
            </div>

            <div className={styles.founderCard}>
              <div className={styles.founderAvatarWrap}>
                <div className={styles.founderAvatar}>
                  SM
                </div>
                <h3 className={styles.founderName}>Shaban Mansoori</h3>
                <span className={styles.founderRole}>Founder &amp; CEO</span>
              </div>

              <div className={styles.founderBio}>
                <p>
                  <strong>Shaban Mansoori</strong> is an entrepreneur with over <strong>six years of experience</strong> in the wholesale industry, having worked on both sides of the business—as a retailer and as a wholesaler.
                </p>
                <p>
                  Rather than building a company from assumptions, he built Hindustan Wholesale Private Limited from real-world experience. He understands the daily challenges of shopkeepers, the operational realities of wholesalers, and the untapped opportunities in India&rsquo;s underserved retail markets.
                </p>
                <div className={styles.founderQuoteBox}>
                  &ldquo;Driven by the belief that technology should empower every business—not just those in major cities—Shaban founded Hindustan Wholesale to build India&rsquo;s most trusted digital wholesale commerce platform and help millions of retailers grow their businesses through technology.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Why Hindustan Wholesale? Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>WHY CHOOSE US</span>
            <h2 className={styles.sectionTitle}>Why Hindustan Wholesale?</h2>
            <p className={styles.sectionSubtitle}>
              Built from the ground up for Bharat&rsquo;s retail businesses.
            </p>
          </div>

          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><ShieldCheck size={20} /></div>
              <span className={styles.whyText}>Verified Wholesale Suppliers</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><Zap size={20} /></div>
              <span className={styles.whyText}>Transparent &amp; Competitive Pricing</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><Package size={20} /></div>
              <span className={styles.whyText}>Wide Product Selection</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><CheckCircle2 size={20} /></div>
              <span className={styles.whyText}>Secure Digital Ordering</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><Truck size={20} /></div>
              <span className={styles.whyText}>Doorstep Business Delivery</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><Cpu size={20} /></div>
              <span className={styles.whyText}>Technology Built for Indian Retailers</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><Headphones size={20} /></div>
              <span className={styles.whyText}>Dedicated Customer Support</span>
            </div>

            <div className={styles.whyCard}>
              <div className={styles.whyCheckIcon}><TrendingUp size={20} /></div>
              <span className={styles.whyText}>Scalable Supply Chain Solutions</span>
            </div>
          </div>
        </section>

        {/* 8. Our Promise & Call-To-Action Banner */}
        <section className={styles.section} style={{ paddingTop: 0 }}>
          <div className={styles.promiseBanner}>
            <span className={styles.promiseEyebrow}>OUR COMMITMENT</span>
            <h2 className={styles.promiseTitle}>Our Promise to Every Indian Business</h2>
            <p className={styles.promiseText}>
              At Hindustan Wholesale, we are committed to making wholesale commerce transparent, efficient, and accessible for every business. Whether you are a small retailer looking to grow your store or a wholesaler seeking to expand your reach, we are building the platform that connects opportunity with growth.
              <br /><br />
              <strong>We&rsquo;re not just building a B2B wholesale platform. We&rsquo;re building the future of retail commerce for millions of businesses across India.</strong>
            </p>

            <div className={styles.promiseCtaGroup}>
              <a href="tel:+918800232363" className={styles.heroCallBtn}>
                <Phone size={18} /> Order by Call: +91 8800232363
              </a>
              <Link href={ROUTES.AUTH.REGISTER} className={styles.heroSecondaryBtn}>
                Get Started Today
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;
