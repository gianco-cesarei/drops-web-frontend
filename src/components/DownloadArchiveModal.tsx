import React, { useState } from 'react'
import { isAvailableTrack } from '../lib/audioManager'

export interface ArchiveEntry {
  id: string
  title: string
  artist?: string
  source?: string
  sourceUrl?: string
  bpm?: number
  ts?: number
  audioUrl?: string
  status?: string
  isAvailable?: boolean
}

export default function DownloadArchiveModal({
  isOpen,
  onClose,
  items,
  onRequeue,
}: {
  isOpen: boolean
  onClose: () => void
  items: ArchiveEntry[]
  onRequeue?: (url: string) => void
}) {
  const [filterQuery, setFilterQuery] = useState('')
  const [copySuccess, setCopySuccess] = useState('')

  if (!isOpen) return null

  const availableItems = items.filter(isAvailableTrack)

  const filtered = availableItems.filter((it) => {
    const q = filterQuery.toLowerCase().trim()
    if (!q) return true
    return (
      it.title.toLowerCase().includes(q) ||
      (it.artist && it.artist.toLowerCase().includes(q)) ||
      (it.source && it.source.toLowerCase().includes(q)) ||
      (it.sourceUrl && it.sourceUrl.toLowerCase().includes(q))
    )
  })

  const allLinks = availableItems
    .map((it) => it.sourceUrl || it.source)
    .filter((url): url is string => Boolean(url && (url.startsWith('http://') || url.startsWith('https://'))))

  const handleCopyAllLinks = () => {
    if (!allLinks.length) return
    const text = allLinks.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(`✓ ${allLinks.length} link copiati negli appunti!`)
      setTimeout(() => setCopySuccess(''), 3000)
    })
  }

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(availableItems, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `drops-download-history-${new Date().toISOString().slice(0, 10)}.json`)
    dlAnchor.click()
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Titolo', 'Artista', 'BPM', 'Link Sorgente', 'Data']
    const rows = availableItems.map((it) => [
      it.id,
      `"${(it.title || '').replace(/"/g, '""')}"`,
      `"${(it.artist || '').replace(/"/g, '""')}"`,
      it.bpm ?? '',
      `"${(it.sourceUrl || it.source || '').replace(/"/g, '""')}"`,
      it.ts ? new Date(it.ts).toLocaleDateString('it-IT') : '',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', encodeURI(csvContent))
    dlAnchor.setAttribute('download', `drops-download-history-${new Date().toISOString().slice(0, 10)}.csv`)
    dlAnchor.click()
  }

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Archivio Storico Download">
      <div className="download-archive-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="archive-modal-header">
          <div>
            <h2>📋 Archivio Storico & Link Utilizzati</h2>
            <p className="archive-modal-sub">
              Tutti i link, i brani e i metadati processati dentro Drops. Puoi copiarli, scaricarli in blocco o rilanciare il download.
            </p>
          </div>
          <button type="button" className="close-suggest-btn" onClick={onClose}>✕</button>
        </div>

        <div className="archive-modal-toolbar">
          <div className="input-with-icon" style={{ flex: 1 }}>
            <span className="url-icon">🔍</span>
            <input
              type="text"
              className="sync-input-field"
              placeholder="Filtra per titolo, artista, o link..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div className="archive-actions-group">
            <button type="button" className="preset-chip-btn" onClick={handleCopyAllLinks}>
              📋 Copia tutti i Link ({allLinks.length})
            </button>
            <button type="button" className="preset-chip-btn" onClick={handleExportCSV}>
              📊 Esporta CSV
            </button>
            <button type="button" className="preset-chip-btn" onClick={handleExportJSON}>
              📦 Esporta JSON
            </button>
          </div>
        </div>

        {copySuccess && (
          <div className="sync-notice-banner" role="status" style={{ margin: '0 16px' }}>
            {copySuccess}
          </div>
        )}

        <div className="archive-table-wrapper">
          <table className="sync-tracks-table">
            <thead>
              <tr>
                <th>Titolo & Artista</th>
                <th>BPM</th>
                <th>Link Sorgente</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                    Nessun link o traccia trovata nell&apos;archivio.
                  </td>
                </tr>
              ) : (
                filtered.map((it) => {
                  const url = it.sourceUrl || it.source
                  const isHttp = url && (url.startsWith('http://') || url.startsWith('https://'))
                  return (
                    <tr key={it.id}>
                      <td>
                        <div className="track-title-cell">
                          <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }} title={it.title}>{it.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }} title={it.artist || 'Artista sconosciuto'}>{it.artist || 'Artista sconosciuto'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          {it.bpm ? (
                            <span className="tag-badge tag-badge-bpm">{Math.round(it.bpm)} BPM</span>
                          ) : (
                            <span className="tag-badge tag-badge-bpm muted">BPM -</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isHttp ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="archive-source-link"
                            title={url}
                          >
                            {url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}... ↗
                          </a>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{url || 'N/A'}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isHttp && onRequeue && (
                            <button
                              type="button"
                              className="btn-save-local-cta"
                              style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                              onClick={() => {
                                onRequeue(url)
                                onClose()
                              }}
                              title="Rilancia il download di questa traccia in locale"
                            >
                              <svg className="btn-dl-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              <span>Riscarica</span>
                            </button>
                          )}
                          {isHttp && (
                            <button
                              type="button"
                              className="btn-play-mini-row"
                              onClick={() => {
                                navigator.clipboard.writeText(url)
                                setCopySuccess(`✓ Link di "${it.title}" copiato!`)
                                setTimeout(() => setCopySuccess(''), 2500)
                              }}
                              title="Copia link singolo"
                            >
                              🔗 Copia
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="archive-modal-footer">
          <span>{filtered.length} tracce archiviate</span>
          <button type="button" className="secondary" onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  )
}
