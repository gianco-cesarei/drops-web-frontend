import React, { useEffect, useMemo, useRef, useState } from 'react'

export interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'Tracce' | 'Artisti' | 'Etichette' | 'Academy' | 'Guide' | 'Strumenti'
  url?: string
  trackMeta?: {
    artist: string
    bpm: number
    genre: string
    audioUrl: string
  }
}

const SEARCH_INDEX: SearchItem[] = [
  // Tracce
  {
    id: 'trk-1',
    title: 'Minimal Groove (Vinyl Rip)',
    subtitle: 'Alex Rossi • Microhouse • 124 BPM',
    category: 'Tracce',
    trackMeta: {
      artist: 'Alex Rossi',
      bpm: 124,
      genre: 'Microhouse',
      audioUrl: 'https://cdn.freesound.org/previews/560/560580_11861866-lq.mp3',
    },
  },
  {
    id: 'trk-2',
    title: 'Hypnotic Deep Flow (Club Mix)',
    subtitle: 'MANIA Collective • Minimal Techno • 126 BPM',
    category: 'Tracce',
    trackMeta: {
      artist: 'MANIA Collective',
      bpm: 126,
      genre: 'Minimal Techno',
      audioUrl: 'https://cdn.freesound.org/previews/560/560580_11861866-lq.mp3',
    },
  },
  {
    id: 'trk-3',
    title: 'Submarine Bassline (Pre-master)',
    subtitle: 'Marco Donati • Deep Tech • 125 BPM',
    category: 'Tracce',
    trackMeta: {
      artist: 'Marco Donati',
      bpm: 125,
      genre: 'Deep Tech',
      audioUrl: 'https://cdn.freesound.org/previews/560/560580_11861866-lq.mp3',
    },
  },

  // Artisti
  {
    id: 'art-1',
    title: 'Alex Rossi',
    subtitle: 'Producer & Live Act • Roma / Berlino • ✓ Verified',
    category: 'Artisti',
    url: '/item/alex-rossi',
  },
  {
    id: 'art-2',
    title: 'Marco Donati',
    subtitle: 'Minimal Techno Specialist • MANIA Resident',
    category: 'Artisti',
    url: '/item/marco-donati',
  },
  {
    id: 'art-3',
    title: 'Elena Valeri',
    subtitle: 'Live Modular Performer • Ambient & Hypnotic',
    category: 'Artisti',
    url: '/item/elena-valeri',
  },
  {
    id: 'art-4',
    title: 'XEXA',
    subtitle: 'Afrofuturism & Sound Exploration • Lisbona',
    category: 'Artisti',
    url: '/item/xexa-kissom',
  },

  // Etichette & Hub
  {
    id: 'lbl-1',
    title: 'Timedance (TD10)',
    subtitle: 'Batu • Bristol Sound & Bass Music Experimental',
    category: 'Etichette',
    url: '/item/timedance-td10',
  },
  {
    id: 'lbl-2',
    title: 'Perlon Records',
    subtitle: 'Zip & Markus Nikolai • Soulful Minimal • Berlino',
    category: 'Etichette',
    url: '/app/brain',
  },
  {
    id: 'lbl-3',
    title: 'Defected Records',
    subtitle: 'House Music Heritage & Global Clubbing',
    category: 'Etichette',
    url: '/item/defected-records-house-music-heritage',
  },
  {
    id: 'lbl-4',
    title: 'Innervisions',
    subtitle: 'Dixon & Âme • Melodic House & Techno • Berlino',
    category: 'Etichette',
    url: '/item/innervisions-berlino-dixon-ame',
  },

  // Academy
  {
    id: 'aca-1',
    title: 'DJ Lab & Beatmatching Studio',
    subtitle: 'Pitch Slider ±8%, Cue Routing, Loops & Hot Cues',
    category: 'Academy',
    url: '/app/academy',
  },
  {
    id: 'aca-2',
    title: 'Modulo 1: Identity & Kick-Bass Separation',
    subtitle: 'Lezione 1.1 • Sound design low-end a 40-120Hz',
    category: 'Academy',
    url: '/app/academy',
  },
  {
    id: 'aca-3',
    title: 'Rekordbox USB Prep & ID3 Editor',
    subtitle: 'Pulisci metadati, Camelot Keys e prepara chiavetta CDJ-3000',
    category: 'Academy',
    url: '/app/academy',
  },
  {
    id: 'aca-4',
    title: 'Studi di Registrazione & Sale DJ Partner',
    subtitle: 'Directory convenzionata: Roma, Milano, Berlino, Londra',
    category: 'Academy',
    url: '/app/academy',
  },

  // Guide
  {
    id: 'gde-1',
    title: 'Guida Borderò SIAE / SPA per DJ',
    subtitle: 'Normativa 2026, compilazione digitale e diritti d\'autore',
    category: 'Guide',
    url: '/item/guida-bordero-siae-spa-dj-diritto-autore',
  },
  {
    id: 'gde-2',
    title: 'Rekordbox USB & CDJ-3000 Workflow',
    subtitle: 'Hot cue, memory cue e formattazione FAT32/exFAT',
    category: 'Guide',
    url: '/item/guida-rekordbox-usb-cdj-3000-workflow-professionale',
  },
  {
    id: 'gde-3',
    title: 'Stampa su Vinile 2026: Costi & Tempi',
    subtitle: 'Galvanica, cutting lacche, test pressing e tirature',
    category: 'Guide',
    url: '/item/vinile-2026-stampa-tempi-costi',
  },

  // Strumenti
  {
    id: 'tls-1',
    title: 'Grafo Discovery Brain',
    subtitle: 'Mappa relazionale etichette, party e artisti underground',
    category: 'Strumenti',
    url: '/app/brain',
  },
  {
    id: 'tls-2',
    title: 'Developer Roadmap Hub',
    subtitle: 'Stato di avanzamento e architettura delle 8 macro sezioni',
    category: 'Strumenti',
    url: '/app/developer',
  },
  {
    id: 'tls-3',
    title: 'Impostazioni Profilo & Social Connect',
    subtitle: 'Badge Verified, XP Livelli e selezione generi musicali',
    category: 'Strumenti',
    url: '/app/settings',
  },
]

export default function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Filter items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SEARCH_INDEX.slice(0, 10)
    return SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [query])

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) handleSelect(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const handleSelect = (item: SearchItem) => {
    if (item.category === 'Tracce' && item.trackMeta) {
      if (typeof window !== 'undefined' && window.__drops_play_track) {
        window.__drops_play_track({
          title: item.title,
          artist: item.trackMeta.artist,
          bpm: item.trackMeta.bpm,
          genre: item.trackMeta.genre,
          audioUrl: item.trackMeta.audioUrl,
        })
      }
      onClose()
    } else if (item.url) {
      window.location.assign(item.url)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Ricerca Globale Drops">
      <div className="search-modal-card" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* TOP SEARCH BAR */}
        <div className="search-modal-input-row">
          <span className="search-glass-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Cerca tracce, artisti, etichette, lezioni o guide..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            aria-label="Cerca nell'archivio Drops"
          />
          <kbd className="esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        {/* RESULTS LIST */}
        <div className="search-modal-results-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="search-no-results">
              <span>Nessun risultato trovato per &quot;{query}&quot;</span>
              <p>Prova a cercare per BPM, artista (es. Alex Rossi), etichetta (Perlon) o guida (SIAE).</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`search-result-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="result-category-badge-col">
                    <span className={`search-cat-pill cat-${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="result-text-col">
                    <strong className="result-title">{item.title}</strong>
                    <span className="result-sub">{item.subtitle}</span>
                  </div>

                  <div className="result-action-col">
                    {item.category === 'Tracce' ? (
                      <span className="action-tag play">▶ Play</span>
                    ) : (
                      <span className="action-tag link">Apri ↗</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* FOOTER SHORTCUTS */}
        <div className="search-modal-footer">
          <div className="shortcuts-hint-row">
            <span><kbd>↑</kbd><kbd>↓</kbd> Naviga</span>
            <span><kbd>↵</kbd> Seleziona</span>
            <span><kbd>ESC</kbd> Chiudi</span>
          </div>
          <span className="search-counter-hint">{filtered.length} risultati</span>
        </div>
      </div>
    </div>
  )
}
