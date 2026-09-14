import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useUiStore from '../../../store/ui/themeStore.js';
import { useTranslation } from 'react-i18next';

/* ── Typewriter hook ──────────────────────────────────────────── */
const PHRASES = [
  'Hotel & Resort',
  // 'Luxury Redefined',
  // 'An Oasis of Elegance',
  // 'Where Dreams Stay',
  'Hotel And Resort',
];

function useTypewriter(phrases, { typeSpeed = 80, deleteSpeed = 42, pauseMs = 1900 } = {}) {
  const [display, setDisplay] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef(null);

  useEffect(() => {
    const current = phrases[phraseIdx];

    const tick = () => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
          timeout.current = setTimeout(tick, typeSpeed);
        } else {
          timeout.current = setTimeout(() => setDeleting(true), pauseMs);
        }
      } else {
        if (charIdx > 0) {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
          timeout.current = setTimeout(tick, deleteSpeed);
        } else {
          setDeleting(false);
          setPhraseIdx(i => (i + 1) % phrases.length);
          timeout.current = setTimeout(tick, 280);
        }
      }
    };

    timeout.current = setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    return () => clearTimeout(timeout.current);
  }, [charIdx, deleting, phraseIdx, phrases, typeSpeed, deleteSpeed, pauseMs]);

  return display;
}

/* ── Static char-reveal span ──────────────────────────────────── */
const RevealText = ({ text, className, baseDelay = 0, charDelay = 55, tag: Tag = 'span' }) => (
  <Tag className={className} style={{ display: 'inline-block' }}>
    {text.split('').map((ch, i) => (
      <span
        key={i}
        className="hero-char"
        style={{ animationDelay: `${baseDelay + i * charDelay}ms` }}
      >
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))}
  </Tag>
);

/* ── Floating gold particle ───────────────────────────────────── */
const Particle = ({ dur, del, left, top, size }) => (
  <span
    className="hero-particle"
    aria-hidden="true"
    style={{ '--dur': dur, '--del': del, left, top, width: size, height: size }}
  />
);

const rand = (a, b) => a + Math.random() * (b - a);

/* ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const { setCursorHovered } = useUiStore();
  const { t } = useTranslation();
  const hover = {
    onMouseEnter: () => setCursorHovered(true),
    onMouseLeave: () => setCursorHovered(false),
  };

  /* Stable particle positions — never regenerate on re-render */
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        // Refined balloon sizes: small (7-9px), medium (10-12px), focal (13-15px)
        const sizeVal = i % 4 === 0 ? rand(13, 15) : i % 2 === 0 ? rand(10, 12) : rand(7, 9);
        return {
          left: `${rand(3, 96)}%`,
          top: `${rand(8, 90)}%`,
          dur: `${rand(6, 12)}s`,
          del: `${rand(0, 8)}s`,
          size: `${Math.round(sizeVal)}px`,
        };
      }),
    [],
  );

  /* Typewriter — types the gold half after "Tsedeke Grand " */
  const localizedPhrases = useMemo(() => PHRASES.map(p => t(p)), [t]);
  const typed = useTypewriter(localizedPhrases, { typeSpeed: 80, deleteSpeed: 40, pauseMs: 1900 });

  return (
    <section className="hero-custom-section">
      {/* Crisp background image — native img renders sharper than CSS background-image */}
      <img
        src="/images/hero/tsedeke-grand_hero.jpg"
        alt="Tsedeke Grand Hotel"
        className="hero-custom-bg"
        fetchpriority="high"
        decoding="sync"
      />

      {/* ── Gold rising particle sparks ── */}
      <div className="hero-particles-layer" aria-hidden="true">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      <div className="hero-custom-content" style={{ position: 'relative', zIndex: 2 }}>

        {/* Eyebrow: letter-spacing expand */}
        <div className="hero-eyebrow-wrap">
          <span className="hero-eyebrow-dash" />
          <RevealText
            text={t('Welcome to Luxury')}
            className="hero-eyebrow-text"
            baseDelay={300}
            charDelay={40}
          />
          <span className="hero-eyebrow-dash" />
        </div>

        {/* Main title: static "Tsedeke Grand" + typewriter gold word */}
        <div className="hero-title-wrap">
          <h1 className="hero-title-main">

            {/* "Tsedeke Grand" — one-shot 3D char reveal, white */}
            <span className="hero-title-static">
              {t('Tsedeke Grand').split('').map((ch, i) => (
                <span
                  key={i}
                  className="hero-char"
                  style={{ animationDelay: `${500 + i * 85}ms` }}
                >
                  {ch}
                </span>
              ))}
            </span>

            {/* Spacer */}
            <span className="hero-title-spacer" aria-hidden="true" />

            {/* Typewriter gold portion — continuous shimmer */}
            <span className="hero-title-typed hero-gold-shimmer">
              {typed}
            </span>

            {/* Blinking cursor */}
            <span className="hero-cursor" aria-hidden="true">|</span>

          </h1>
        </div>

        {/* Self-drawing gold divider + pulsing gem */}
        <div className="hero-line-wrap">
          <div className="hero-line-draw" />
          <div className="hero-line-gem" />
          <div className="hero-line-draw" />
        </div>

        {/* Subtitle — char reveal + continuous letter-spacing breathe */}
        <div className="hero-sub-wrap">
          <RevealText
            text={t('An Oasis of Warmth & Elegance')}
            className="hero-subtitle"
            baseDelay={1500}
            charDelay={30}
          />
        </div>

        {/* CTA */}
        <div className="hero-cta-container">
          <Link to="/booking" className="btn-primary hero-btn-pop" {...hover}>
            <span>{t('Book Your Stay')}</span>
          </Link>
          <Link to="/rooms" className="btn-outline hero-btn-pop" {...hover}>
            <span>{t('Explore Rooms')}</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
