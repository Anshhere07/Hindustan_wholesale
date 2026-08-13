import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// HWLogo — Hindustan Wholesale brand mark, identical to homepage logo
// Used in: Seller Sidebar, Buyer Sidebar, Admin Sidebar
// ─────────────────────────────────────────────────────────────────────────────

interface HWLogoProps {
  /** Whether text labels are shown (false when sidebar is collapsed) */
  showText?: boolean;
  /** Variant for the tagline area */
  subtitle?: string;
  /** Extra size scale: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { icon: { width: 38, height: 26 }, fontSize: 17, textSize: 13, subSize: 7.5 },
  md: { icon: { width: 46, height: 30 }, fontSize: 20, textSize: 15, subSize: 8 },
  lg: { icon: { width: 52, height: 34 }, fontSize: 24, textSize: 17, subSize: 9 },
};

const HWLogo: React.FC<HWLogoProps> = ({
  showText = true,
  subtitle = 'Sahi Kharidari, Zyada Munafa',
  size = 'md',
}) => {
  const s = SIZES[size];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: '#ffffff',
      borderRadius: 10,
      padding: showText ? '8px 14px 8px 10px' : '8px 10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      textDecoration: 'none',
      transition: 'box-shadow 0.2s ease',
    }}>
      {/* HW Icon — split blue/red, matching homepage */}
      <div style={{
        width: s.icon.width,
        height: s.icon.height,
        background: 'linear-gradient(110deg, #0B2C6A 45%, #8B1028 45%)',
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          color: 'white',
          fontWeight: 900,
          fontSize: s.fontSize,
          fontStyle: 'italic',
          fontFamily: 'sans-serif',
          letterSpacing: -2,
          transform: 'skewX(-5deg)',
          display: 'block',
          lineHeight: 1,
        }}>
          HW
        </span>
      </div>

      {/* Text block — hidden when sidebar is collapsed */}
      {showText && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 10,
          borderLeft: '2px solid #8B1028',
        }}>
          <div style={{
            fontSize: s.textSize,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.3px',
          }}>
            <span style={{ color: '#A21A32' }}>HINDUSTAN</span>
            <br />
            <span style={{ color: '#5a0a1a' }}>WHOLESALE</span>
          </div>
          {subtitle && (
            <span style={{
              fontSize: s.subSize,
              fontWeight: 700,
              color: '#0B2C6A',
              letterSpacing: '0.04em',
              marginTop: 3,
            }}>
              — {subtitle} —
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HWLogo;
