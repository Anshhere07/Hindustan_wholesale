'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Phone, MessageCircle, Send, CheckCircle2, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';

export default function RFQPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [partName, setPartName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !targetQuantity.trim()) {
      addNotification({ type: 'warning', title: 'Missing fields', message: 'Please provide part name and required quantity.' });
      return;
    }
    setSubmitted(true);
    addNotification({
      type: 'success',
      title: 'RFQ Request Sent!',
      message: 'Your bulk quotation inquiry was sent to our direct wholesale sourcing managers.',
      duration: 7000,
    });
  };

  const handleWhatsAppQuote = () => {
    const text = `Hi Hindustan Wholesale, I would like to request a bulk quotation:%0A- Part: ${partName || 'Auto Spare Parts'}%0A- Vehicle/Model: ${vehicleModel || 'Universal'}%0A- Quantity: ${targetQuantity || 'Bulk'}%0A- Business: ${user?.firstName || 'Retailer'}`;
    window.open(`https://wa.me/918800232363?text=${text}`, '_blank');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
        <div style={{ background: '#fdf2f4', padding: 10, borderRadius: 12, color: '#8B0000' }}>
          <FileText size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Request Bulk Quotation (RFQ)
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
            Procure high-volume auto spares or non-catalog parts directly from verified OEM factories.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Form Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '28px 24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 12px' }}>
              <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                Quote Request Received!
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 24px' }}>
                Our procurement specialist will contact you within 2 business hours with factory pricing and lead time.
              </p>
              <Button variant="primary" size="md" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Spare Part / Component Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brake Pads, Clutch Plate, Shock Absorber"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Vehicle Segment / Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hero Splendor, Tata Ace"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Required Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50, 100, 500 units"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Target Budget / Unit Price (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹250 per piece"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Additional Notes / Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Brand preference, material quality, urgent delivery requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" leftIcon={<Send size={16} />}>
                Submit Request for Quotation
              </Button>
            </form>
          )}
        </div>

        {/* Quick Sourcing Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #8B0000 0%, #4a030b 100%)',
            borderRadius: 16,
            padding: '24px 20px',
            color: '#ffffff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Shield size={18} color="#d4af37" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Procurement Help
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Need urgent bulk parts?
            </h3>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Talk directly with our wholesale sourcing team. We locate genuine parts across 1,000+ OEM distributors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="tel:+918800232363"
                style={{
                  background: '#ffffff',
                  color: '#8B0000',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Phone size={16} /> Call +91 88002 32363
              </a>

              <button
                type="button"
                onClick={handleWhatsAppQuote}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
