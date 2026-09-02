import React, { useEffect, useState } from 'react'
import { api } from '../api'
import type { User } from '../api'

export default function DropsLanding() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = window.localStorage.getItem('drops.user.v1')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && (parsed.username || parsed.name)) return parsed
      }
    } catch {}
    return null
  })

  useEffect(() => {
    let active = true
    api.me()
      .then((u) => {
        if (active && u && u.username && u.username !== 'alex_rossi') {
          setUser(u)
        }
      })
      .catch(() => {})

    return () => { active = false }
  }, [])

  return (
    <div className="landing-container">
      {/* HERO BANNER WITH CLEAN ORIGINAL IMAGE & PAYOFF */}
      <section className="discovery-hero-campaign landing-clean-hero" aria-label="Campagna Drops">
        <div className="discovery-hero-media-wrap">
          <picture className="discovery-hero-picture">
            <source media="(max-width: 768px)" srcSet="/assets/cue-campaign-mobile.jpg" />
            <img
              src="/assets/cue-campaign-desktop.jpg"
              alt="Manage your music world in cloud"
              className="discovery-hero-img"
              loading="eager"
            />
          </picture>

          {/* Payoff pulito senza box */}
          <div className="discovery-hero-headline-clean">
            <h1 className="discovery-hero-claim-clean">
              Manage your<br />
              music world<br />
              in cloud.
            </h1>
          </div>

          {/* Logo Drops */}
          <div className="discovery-hero-brand-clean" aria-label="Logo Drops">
            Drops<span className="hero-logo-dot">.</span>
          </div>

          {/* Pulsanti di Azione */}
          <div className="landing-clean-hero-cta">
            {user ? (
              <div className="landing-hero-btn-row">
                <a href="/app/download" className="landing-btn landing-btn-primary">
                  🎛️ Apri Downloader
                </a>
                <a href="/app/archive" className="landing-btn landing-btn-secondary">
                  📁 Archivio
                </a>
              </div>
            ) : (
              <div className="landing-hero-btn-row">
                <a href="/app/login" className="landing-btn landing-btn-primary">
                  Accedi
                </a>
                <a href="/app/login" className="landing-btn landing-btn-secondary">
                  Iscriviti
                </a>
              </div>
            )}
          </div>

          {/* Sfumatura inferiore */}
          <div className="discovery-hero-fade" />
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="landing-value-strip">
        <div className="landing-strip-item">
          <span className="landing-strip-icon">⚡</span>
          <span>320 KBPS & FLAC LOSSLESS</span>
        </div>
        <div className="landing-strip-divider">&bull;</div>
        <div className="landing-strip-item">
          <span className="landing-strip-icon">🎹</span>
          <span>CAMELOT WHEEL HARMONIC ENGINE</span>
        </div>
        <div className="landing-strip-divider">&bull;</div>
        <div className="landing-strip-item">
          <span className="landing-strip-icon">💾</span>
          <span>PIONEER REKORDBOX USB READY</span>
        </div>
      </section>

      {/* ESSENTIAL FEATURES */}
      <section className="landing-features-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">FUNZIONALITÀ</span>
          <h2>Piattaforma cloud per DJ e Producer</h2>
        </div>

        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎛️</div>
            <h3>Ingestione & Downloader</h3>
            <p>
              Scarica singoli brani o interi set da YouTube, SoundCloud, Spotify, Bandcamp o file locali a 320 kbps MP3 o WAV / FLAC Lossless.
            </p>
            <a href="/app/download" className="landing-feature-link">Vai al Downloader &rarr;</a>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎹</div>
            <h3>Analisi Armonica Camelot</h3>
            <p>
              Rilevamento immediato della chiave Camelot Wheel (8A, 11B, 10B...) e BPM per transizioni perfette senza dissonanze.
            </p>
            <a href="/app/archive" className="landing-feature-link">Vedi Analisi Chiavi &rarr;</a>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">💾</div>
            <h3>Archivio Cloud & Rekordbox</h3>
            <p>
              Organizzazione automatica in cartelle con tag ID3 e generazione di playlist M3U pronte per CDJ Pioneer.
            </p>
            <a href="/app/archive" className="landing-feature-link">Esplora la Libreria &rarr;</a>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <h2>Manage your music world in cloud.</h2>
          <p>Organizza la tua libreria musicale, estrai tracce ad alta fedeltà e prepara le tue chiavette USB per il club.</p>
          <div className="landing-cta-buttons">
            <a href="/app/login" className="landing-btn landing-btn-primary">
              Accedi
            </a>
            <a href="/app/login" className="landing-btn landing-btn-secondary">
              Iscriviti
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-logo">Drops<span>.</span></span>
            <p>Manage your music world in cloud</p>
          </div>
          <div className="landing-footer-links">
            <a href="/app/download">Download</a>
            <a href="/app/archive">Archivio</a>
            <a href="/app/login">Accedi</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
