'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  User,
  Building,
  Send,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/modules/landing/LandingPage';
import { useUIStore } from '@/stores/ui.store';
import styles from './ContactPage.module.css';

export const ContactPage: React.FC = () => {
  const { addNotification } = useUIStore();

  const [activeTab, setActiveTab] = useState<'retailer' | 'seller' | 'general'>('retailer');
  const [formData, setFormData] = useState({
    fullName: '',
    shopName: '',
    mobileNumber: '',
    email: '',
    subject: 'Bulk Wholesale Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.message) {
      addNotification({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please fill in your name, email address, and message.',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      addNotification({
        type: 'success',
        title: 'Inquiry Sent Successfully!',
        message: 'Thank you for reaching out. Our wholesale representative will contact you within 2 business hours.',
      });

      setFormData({
        fullName: '',
        shopName: '',
        mobileNumber: '',
        email: '',
        subject: 'Bulk Wholesale Inquiry',
        message: '',
      });
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.eyebrowBadge}>
            <MessageSquare size={14} /> Get In Touch
          </div>
          <h1 className={styles.pageTitle}>We&apos;re here to help your wholesale business grow.</h1>
          <p className={styles.pageSubtitle}>
            Have a question about bulk pricing, verified seller onboarding, logistics, or GST invoicing? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        {/* 2-Column Section */}
        <div className={styles.gridContainer}>
          {/* Left Column: Contact Cards */}
          <div className={styles.infoColumn}>
            {/* Hero Card */}
            <div className={styles.infoHeroCard}>
              <h2 className={styles.infoHeroTitle}>Direct B2B Helpline</h2>
              <p className={styles.infoHeroDesc}>
                Connect directly with our dedicated wholesale order desks in New Delhi & Gurugram for high-volume quotations and instant B2B assistance.
              </p>
              <div className={styles.infoBadgesRow}>
                <div className={styles.infoHeroBadge}><CheckCircle2 size={14} /> Pan-India Delivery</div>
                <div className={styles.infoHeroBadge}><CheckCircle2 size={14} /> GST Compliant</div>
                <div className={styles.infoHeroBadge}><CheckCircle2 size={14} /> Instant Quotations</div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className={styles.contactCardsGrid}>
              <div className={styles.contactCard}>
                <div className={styles.cardIconWrap}>
                  <Phone size={20} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Order Desk Helpline</div>
                  <div className={styles.cardText}>Mon – Sat, 9:30 AM to 7:00 PM</div>
                  <a href="tel:+918800232363" className={styles.cardLink}>
                    +91 88002 32363 &rarr;
                  </a>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.cardIconWrap}>
                  <Mail size={20} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Official Email</div>
                  <div className={styles.cardText}>Inquiries & Support</div>
                  <a href="mailto:hindustanwholesale54@gmail.com" className={styles.cardLink}>
                    hindustanwholesale54@gmail.com &rarr;
                  </a>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.cardIconWrap}>
                  <MapPin size={20} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Corporate Office</div>
                  <div className={styles.cardText}>
                    5th Floor, WeWork Horizon Center, Golf Course Rd, Sector 43, Gurugram 122009
                  </div>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.cardIconWrap}>
                  <Clock size={20} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Business Hours</div>
                  <div className={styles.cardText}>Monday – Saturday: 9:00 AM – 8:00 PM</div>
                  <div className={styles.cardText} style={{ color: '#059669', fontWeight: 600, marginTop: 2 }}>
                    ● Operational Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <div className={styles.formHeaderPill}>
                ✉️ INQUIRY FORM
              </div>
              <h2 className={styles.formTitle}>Send Us A Message</h2>
              <p className={styles.formSubtitle}>
                Select your business type below and fill in your contact details.
              </p>
            </div>

            {/* Role Toggle Selector */}
            <div className={styles.topicToggleGrid}>
              <button
                type="button"
                className={`${styles.topicToggleBtn} ${activeTab === 'retailer' ? styles.topicToggleBtnActive : ''}`}
                onClick={() => setActiveTab('retailer')}
              >
                <ShoppingBag size={15} /> Retailer / Buyer
              </button>

              <button
                type="button"
                className={`${styles.topicToggleBtn} ${activeTab === 'seller' ? styles.topicToggleBtnActive : ''}`}
                onClick={() => setActiveTab('seller')}
              >
                <Building size={15} /> Seller / Supplier
              </button>

              <button
                type="button"
                className={`${styles.topicToggleBtn} ${activeTab === 'general' ? styles.topicToggleBtnActive : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <HelpCircle size={15} /> Other Inquiry
              </button>
            </div>

            {isSubmitted ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                color: '#166534',
              }}>
                <CheckCircle2 size={48} style={{ color: '#16A34A', marginBottom: 12 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#14532D' }}>
                  Inquiry Received!
                </h3>
                <p style={{ fontSize: 14, color: '#166534', margin: 0, lineHeight: 1.5 }}>
                  Thank you for contacting Hindustan Wholesale. Our team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  style={{
                    marginTop: 20,
                    padding: '8px 20px',
                    borderRadius: 8,
                    background: '#890000',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <User size={13} /> Your Full Name
                  </label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Ravi Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Shop / Business Name */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Building size={13} /> Shop / Business Name
                  </label>
                  <div className={styles.inputWrapper}>
                    <Building size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="shopName"
                      placeholder="e.g. Sharma Motors & Auto Spares"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Mobile Number & Email Address Grid */}
                <div className={styles.formGridRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <Phone size={13} /> Mobile Number
                    </label>
                    <div className={styles.inputWrapper}>
                      <Phone size={18} className={styles.inputIcon} />
                      <input
                        type="tel"
                        name="mobileNumber"
                        placeholder="98xxxxxxxx"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <Mail size={13} /> Email Address
                    </label>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@business.in"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <HelpCircle size={13} /> Subject / Inquiry Type
                  </label>
                  <div className={styles.inputWrapper}>
                    <HelpCircle size={18} className={styles.inputIcon} />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="Bulk Wholesale Inquiry">Bulk Wholesale Inquiry & Pricing</option>
                      <option value="Seller Registration">Seller / Manufacturer Onboarding</option>
                      <option value="Logistics & Delivery">Logistics & Order Tracking</option>
                      <option value="GST & Invoicing">GST Invoice & Payment Query</option>
                      <option value="General Feedback">General Feedback & Support</option>
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: 14, color: '#94A3B8', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Message Field */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <MessageSquare size={13} /> Your Message / Requirements
                  </label>
                  <div className={styles.inputWrapper}>
                    <MessageSquare size={18} className={styles.inputIcon} style={{ top: 14 }} />
                    <textarea
                      name="message"
                      placeholder="Specify product requirements, SKU quantities, or questions..."
                      value={formData.message}
                      onChange={handleChange}
                      className={styles.textarea}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send size={18} /> Send Message & Inquiry
                    </>
                  )}
                </button>

                <p className={styles.formFooterNote}>
                  By sending this message, you agree to our Terms & Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;
