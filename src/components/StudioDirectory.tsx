import React, { useState } from 'react'

export interface StudioPartner {
  id: string
  name: string
  city: string
  country: string
  neighborhood: string
  type: 'DJ Booth & Rehearsal' | 'Recording & Production' | 'Mastering & Vinyl Studio'
  hourlyRate: string
  gear: string[]
  description: string
  verifiedPartner: boolean
  contactUrl: string
  imageUrl: string
}

const STUDIOS_DATA: StudioPartner[] = [
  {
    id: 'studio-roma-1',
    name: 'MANIA Sound Lab',
    city: 'Roma',
    country: 'Italia',
    neighborhood: 'San Lorenzo / Pigneto',
    type: 'DJ Booth & Rehearsal',
    hourlyRate: '18€ / ora',
    gear: ['2x Pioneer CDJ-3000', '1x Allen & Heath Xone:96', 'ADAM Audio A7V Monitors', 'Technics SL-1210 MK7'],
    description: 'Cabina insonorizzata ad alto isolamento acustico, curata dal collettivo MANIA per prove DJ e registrazione podcast/set.',
    verifiedPartner: true,
    contactUrl: 'https://instagram.com/mania.soundlab',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'studio-milano-1',
    name: 'Lambrate Analog Hub',
    city: 'Milano',
    country: 'Italia',
    neighborhood: 'Lambrate',
    type: 'Recording & Production',
    hourlyRate: '25€ / ora',
    gear: ['Ableton Push 3', 'Moog Sub 37', 'Roland TR-8S', 'Genelec 8040B', 'Universal Audio Apollo x8'],
    description: 'Studio di produzione ibrido con synth analogici, drum machine classiche e ascolto Genelec calibrato Sonarworks.',
    verifiedPartner: true,
    contactUrl: 'https://instagram.com/lambrate.analog',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'studio-berlino-1',
    name: 'Kreuzberg Beat Room',
    city: 'Berlino',
    country: 'Germania',
    neighborhood: 'Kreuzberg',
    type: 'DJ Booth & Rehearsal',
    hourlyRate: '15€ / ora',
    gear: ['4x Pioneer CDJ-2000NXS2', 'Pioneer DJM-900NXS2', 'Funktion-One Mini Monitors', '2x Technics 1200'],
    description: 'Setup da clubber autentico a Berlino, perfetto per testare i set prima delle serate nei club della capitale.',
    verifiedPartner: true,
    contactUrl: 'https://instagram.com/berlin.beatroom',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'studio-londra-1',
    name: 'Hackney Modular & Tape',
    city: 'Londra',
    country: 'Regno Unito',
    neighborhood: 'Hackney Wick',
    type: 'Mastering & Vinyl Studio',
    hourlyRate: '35€ / ora',
    gear: ['Eurorack Modular Wall', 'Studer Revox Tape Machine', 'ATC SCM25A Pro Monitors', 'Shadow Hills Mastering Comp'],
    description: 'Studio specializzato in saturazione a nastro, mastering analogico per vinile e sintesi modulare avanzata.',
    verifiedPartner: true,
    contactUrl: 'https://instagram.com/hackney.modular',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  },
]

export default function StudioDirectory() {
  const [selectedCity, setSelectedCity] = useState<string>('Tutte')
  const [selectedType, setSelectedType] = useState<string>('Tutti')

  const cities = ['Tutte', 'Roma', 'Milano', 'Berlino', 'Londra']
  const types = ['Tutti', 'DJ Booth & Rehearsal', 'Recording & Production', 'Mastering & Vinyl Studio']

  const filteredStudios = STUDIOS_DATA.filter((s) => {
    const matchCity = selectedCity === 'Tutte' || s.city === selectedCity
    const matchType = selectedType === 'Tutti' || s.type === selectedType
    return matchCity && matchType
  })

  return (
    <div className="studios-directory-container">
      {/* HEADER BANNER */}
      <div className="studios-header-banner">
        <div>
          <div className="academy-badge-group">
            <span className="badge-new-pill">NEW DIRECTORY</span>
            <span className="academy-tag">DROPS PARTNER SPACES</span>
          </div>
          <h2>Studi di Registrazione & Cabine DJ Partner</h2>
          <p className="studios-sub">
            Trova sale prova attrezzate, studi di produzione e cabine DJ a noleggio orario con sconti convenzionati per gli studenti dell&apos;Academy.
          </p>
        </div>

        <div className="studios-stats-box">
          <div className="stat-bubble">
            <strong>4</strong>
            <span>Città Attive</span>
          </div>
          <div className="stat-bubble">
            <strong>100%</strong>
            <span>Attrezzatura Pro</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="studios-filters-bar">
        <div className="filter-group">
          <span className="filter-label">Città:</span>
          <div className="filter-chips">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                className={`filter-chip-btn ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Tipologia:</span>
          <div className="filter-chips">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-chip-btn ${selectedType === t ? 'active' : ''}`}
                onClick={() => setSelectedType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STUDIOS GRID */}
      <div className="studios-cards-grid">
        {filteredStudios.map((studio) => (
          <div key={studio.id} className="studio-card">
            <div className="studio-card-media">
              <img src={studio.imageUrl} alt={studio.name} className="studio-card-img" />
              <div className="studio-rate-badge">{studio.hourlyRate}</div>
              {studio.verifiedPartner && (
                <div className="studio-verified-badge" title="Partner Ufficiale Verificato Drops">
                  ✓ Partner Drops
                </div>
              )}
            </div>

            <div className="studio-card-body">
              <div className="studio-location-row">
                <span className="studio-city-tag">📍 {studio.city} ({studio.neighborhood})</span>
                <span className="studio-type-pill">{studio.type}</span>
              </div>

              <h3 className="studio-title">{studio.name}</h3>
              <p className="studio-desc">{studio.description}</p>

              <div className="studio-gear-box">
                <span className="gear-title">Setup & Attrezzatura:</span>
                <div className="gear-tags-list">
                  {studio.gear.map((item, idx) => (
                    <span key={idx} className="gear-tag-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="studio-footer-actions">
                <a
                  href={studio.contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="studio-book-btn"
                >
                  Prenota Slot / Info ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
