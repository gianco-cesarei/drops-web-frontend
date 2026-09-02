import React, { useState, useEffect } from 'react'

type Tag = 'front' | 'back' | 'desktop'

interface SubTask {
  title: string
  tags: Tag[]
}

interface Task {
  id: string
  title: string
  benefit?: string
  status?: 'todo' | 'completed' | 'paused'
  subtasks: SubTask[]
}

interface Section {
  n: number
  name: string
  short: string
  intro: string
  tasks: Task[]
  archive?: boolean
}

const DEFAULT_SECTIONS: Section[] = [
  {
    n: 1,
    name: 'Drop Agent — Autonomous Ingestion & Music Intelligence Engine',
    short: 'Drop Agent Ingestion',
    intro:
      "Il motore autonomo di acquisizione, analisi armonica, arricchimento metadati e popolamento cloud della libreria Drops.",
    tasks: [
      {
        id: '1.1',
        title: 'Audio Intelligence & Riconoscimento Cieco (Blind Recognition)',
        benefit:
          "Riconosci in automatico qualsiasi traccia all'interno di DJ set o podcast lunghi anche quando il video YouTube non ha la tracklist nella descrizione.",
        status: 'completed',
        subtasks: [
          {
            title: 'Campionamento in RAM a 15s con FFmpeg e worker asincrono Shazamio',
            tags: ['back'],
          },
          {
            title: 'Transition & Beat Drop Detector basato su Spectral Flux e RMS',
            tags: ['back'],
          },
          {
            title: 'Fallback fuzzy e gestione Unknown Tracks con marcatura oraria',
            tags: ['back'],
          },
        ],
      },
      {
        id: '1.2',
        title: 'Harmonic Mixing Engine & Esportazione Formati DJ',
        benefit:
          "Prepara la musica per il club: calcolo istantaneo della chiave Camelot (8A, 11B, 2A), BPM esatto ed esportazione con 1 click per chiavette USB Rekordbox e Traktor.",
        status: 'completed',
        subtasks: [
          {
            title: 'Mappatura cromatica Krumhansl su Ruota di Camelot e tag ID3 TKEY/TBPM',
            tags: ['back'],
          },
          {
            title: 'Generatore file .cue Red Book a 75 fps e playlist estesa .m3u8',
            tags: ['back'],
          },
          {
            title: 'Esportatore rekordbox.xml (DJ_PLAYLISTS con Memory/Hot Cues) e traktor.nml',
            tags: ['back'],
          },
          {
            title: 'Slicing lossless zero-crossing con micro-fades per evitare click audio',
            tags: ['back'],
          },
        ],
      },
      {
        id: '1.3',
        title: 'Discogs & Beatport Enrichment & Cover Art HQ (1400x1400px)',
        benefit:
          "Ogni traccia viene arricchita con l'etichetta discografica originale, il numero di catalogo del vinile, l'anno di stampa e la copertina in altissima risoluzione.",
        status: 'completed',
        subtasks: [
          {
            title: 'Client Discogs & Beatport con rate-limiting (60 req/min) e cache su disco',
            tags: ['back'],
          },
          {
            title: 'Downloader copertine 1400x1400px JPEG sRGB Lanczos e vinile fallback',
            tags: ['back'],
          },
          {
            title: 'Iniezione completa tag ID3v2.4 (APIC, TPUB, TKEY, TBPM, TSRC, COMM)',
            tags: ['back'],
          },
        ],
      },
      {
        id: '1.4',
        title: 'Cloud Multi-Part Ingestion & Autonomous Crate Digging',
        benefit:
          "Caricamento immediato dei file nello storage audio Cloudflare R2 e inserimento automatico nel database Supabase, con modalità di digging autonomo per genere e BPM.",
        status: 'completed',
        subtasks: [
          {
            title: 'Multi-part uploader asincrono S3 su Cloudflare R2 con cache headers',
            tags: ['back'],
          },
          {
            title: 'Client Supabase PostgREST per upsert atomici su dj_sets e tracks',
            tags: ['back'],
          },
          {
            title: 'Integrazione Web Trigger (lanciare l\'agente dall\'interfaccia utente)',
            tags: ['front', 'back'],
          },
          {
            title: 'Modalità Autonomous Digging ("Portami 10 perle Minimal in 8A a 124 BPM")',
            tags: ['back'],
          },
        ],
      },
    ],
  },
  {
    n: 2,
    name: 'Downloader Singolo & Tracce Esclusive',
    short: 'Download singolo',
    intro:
      "Gestione dell'acquisizione di singole tracce audio da sorgenti esterne, con ottimizzazioni per la scena underground e materiali esclusivi.",
    tasks: [
      {
        id: '2.1',
        title: 'Download diretto da YouTube per tracce esclusive',
        benefit:
          "Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza ricorrere a convertitori web esterni instabili o pieni di pubblicità.",
        status: 'completed',
        subtasks: [
          {
            title: 'Integrazione libreria di estrazione audio (yt-dlp)',
            tags: ['back'],
          },
          {
            title: 'Interfaccia di input e feedback di progresso',
            tags: ['front'],
          },
        ],
      },
      {
        id: '2.2',
        title: 'Download singolo multi-sorgente con selezione qualità',
        benefit:
          'Salva sul dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata (MP3 320 kbps vs HQ Master Pesante) e organizzandola in cartelle.',
        status: 'completed',
        subtasks: [
          {
            title: 'Opzioni di conversione e formati (MP3 vs FLAC/HQ)',
            tags: ['back', 'front'],
          },
        ],
      },
    ],
  },
  {
    n: 3,
    name: 'Gestione Playlist & Download Multiplo',
    short: 'Playlist & batch',
    intro:
      'Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.',
    tasks: [
      {
        id: '3.1',
        title: 'Anteprima, filtri e selezione brani prima del download',
        benefit:
          'Vedi la lista completa delle tracce di una playlist (YT, Spotify o SoundCloud) nella modale bianca ad alta densità con ricerca e durata prima di inviarla alla coda.',
        status: 'completed',
        subtasks: [
          {
            title: 'Limite massimo elementi risolti in simultanea',
            tags: ['back'],
          },
          {
            title: 'Selezione tramite checkbox e filtro duplicati',
            tags: ['front'],
          },
        ],
      },
    ],
  },
  {
    n: 4,
    name: 'Cloud Storage & Libreria Utente',
    short: 'Cloud & libreria',
    intro:
      'Spostamento del baricentro della libreria utente dal disco locale a una soluzione cloud sicura, con streaming privato e organizzazione automatica.',
    tasks: [
      {
        id: '4.1',
        title: 'Salvataggio e organizzazione della propria musica in cloud',
        benefit:
          'Libreria in stile Apple Music con caricamento Drag & Drop di intere cartelle dal desktop, sidebar di navigazione, rinomina inline istantanea ed esportazione M3U Rekordbox.',
        status: 'completed',
        subtasks: [
          {
            title: 'Configurazione storage personale (Cloudflare R2 + Supabase)',
            tags: ['back', 'front'],
          },
          {
            title: 'Ricerca testuale e filtri nel catalogo cloud',
            tags: ['front'],
          },
        ],
      },
      {
        id: '4.2',
        title: 'Riproduttore musicale cloud e streaming privato',
        benefit:
          'Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, con hover play sui brani e mini-player globale.',
        status: 'completed',
        subtasks: [
          {
            title: 'Generazione di link sicuri per lo streaming (Presigned URLs)',
            tags: ['back'],
          },
          {
            title: "Riproduttore audio persistente e coda d'ascolto",
            tags: ['front'],
          },
        ],
      },
      {
        id: '4.3',
        title: 'Architettura UI Utente Semplificata (Home, Download, Archivio)',
        benefit:
          "Nuova navigazione pulita e focalizzata per l'utente finale: Home pubblica con discovery visivo ed hero, login diretto, e percorsi dedicati a Download e Archivio senza sovrastrutture complesse.",
        status: 'completed',
        subtasks: [
          {
            title: 'Home con Discovery visivo e accesso diretto /app/login',
            tags: ['front'],
          },
          {
            title: 'Pagina Downloader con accordion, drag & drop e gestione qualità',
            tags: ['front', 'back'],
          },
          {
            title: 'Pagina Archivio con organizzazione cartelle, preview rapido ed export Rekordbox',
            tags: ['front', 'back'],
          },
        ],
      },
    ],
  },
  {
    n: 5,
    name: 'Integrazione Streaming & Sync Preferiti',
    short: 'Sync preferiti',
    intro:
      "Connessione alle piattaforme esterne per importare le selezioni e i metadati accumulati dall'utente.",
    tasks: [
      {
        id: '5.1',
        title: 'Sincronizzazione automatica e download dei preferiti Spotify',
        benefit:
          'Collega il tuo account Spotify e importa in Drops i brani "Mi Piace" con metadati arricchiti da Discogs e stima del BPM.',
        status: 'completed',
        subtasks: [
          {
            title: 'Algoritmo di matching tra metadati Spotify e sorgenti audio',
            tags: ['back'],
          },
          {
            title: 'Interfaccia di gestione dei preferiti importati',
            tags: ['front'],
          },
        ],
      },
      {
        id: '5.2',
        title: 'Importazione automatica da SoundCloud e YouTube',
        benefit:
          'Tieni traccia dei brani e set a cui metti "Like" su SoundCloud e YouTube e importali nel Crate per il DJ Lab.',
        status: 'completed',
        subtasks: [
          {
            title: 'Risoluzione multi-sorgente e Crate Sync',
            tags: ['front', 'back'],
          },
        ],
      },
    ],
  },
  {
    n: 6,
    name: 'Corso DJ & Producing Online (Learning Hub)',
    short: 'Learning Hub',
    intro:
      "Portale didattico privato per formare l'utente nell'arte del DJing e della produzione con strumenti interattivi.",
    tasks: [
      {
        id: '6.1',
        title: 'Portale di formazione per DJ e produttori (lezioni e dispense)',
        benefit:
          "Impara mixaggio e produzione in un'area riservata organizzata in 4 moduli didattici, 12 video-lezioni, pannelli a scroll interno e accordion esclusivo.",
        status: 'completed',
        subtasks: [
          {
            title: "Struttura dell'area didattica e hosting video con layout compatto",
            tags: ['front', 'back'],
          },
        ],
      },
      {
        id: '6.2',
        title: 'Mappa interattiva delle scuole di musica e cabine DJ partner',
        benefit:
          'Trova accademie musicali, sale prove, studi di registrazione e cabine DJ a noleggio (Roma, Milano, Berlino, Londra) su una directory geografica interattiva.',
        status: 'completed',
        subtasks: [
          {
            title: "Integrazione della directory partner con filtri città e attrezzatura",
            tags: ['front'],
          },
        ],
      },
      {
        id: '6.3',
        title: 'DJ Lab Dual-Deck con Pitch Control continuo e Beatmatching',
        benefit:
          "Esercitati sul beatmatching direttamente dal browser con un player dual-deck dotato di Pitch Slider continuo (±8%, step 0.05%), EQ a 3 bande e routing Master/Cue.",
        status: 'completed',
        subtasks: [
          {
            title: 'Motore audio Web Audio API con pitch continuo e cue routing via setSinkId',
            tags: ['front'],
          },
        ],
      },
      {
        id: '6.4',
        title: 'Gamification Producer, Livelli XP e Badge Verified ✓',
        benefit:
          'Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP con regole anti-spam e gestisci profilo/generi da Producer Settings.',
        status: 'paused',
        subtasks: [
          {
            title: 'Gestione profilo, generi (max 4) e anteprima badge reattiva',
            tags: ['front'],
          },
          {
            title: 'Backend profilo/social cloud: in attesa di selezione piattaforme definitive',
            tags: ['back'],
          },
        ],
      },
    ],
  },
  {
    n: 7,
    name: 'Grafo Discovery & Motore Suggest',
    short: 'Discovery & Suggest',
    intro:
      'Il motore di curatela e raccomandazione orientato alla musica elettronica underground (Minimal, Deep House, Techno).',
    tasks: [
      {
        id: '7.1',
        title: 'Motore "Drops Suggest" e grafo di etichette, party e artisti',
        benefit:
          'Esplora le connessioni tra etichette di nicchia, party underground e DJ con grafo SVG interattivo e drawer laterale di raccomandazione.',
        status: 'completed',
        subtasks: [
          {
            title: 'Visualizzazione del grafo relazionale BrainGraph e drawer Suggest',
            tags: ['front'],
          },
        ],
      },
      {
        id: '7.2',
        title: 'Guide editoriali pratiche per il settore musicale',
        benefit:
          'Leggi guide super-sintetiche su come pubblicare la tua musica, stampare in vinile nel 2026, codici ISRC/UPC e borderò SIAE.',
        status: 'completed',
        subtasks: [
          {
            title: '8 guide editoriali complete con metadati SEO e rendering Astro',
            tags: ['front'],
          },
        ],
      },
      {
        id: '7.3',
        title: 'Sistema di ricerca e applicazione foto degli articoli',
        benefit:
          "Progettare un sistema che ricerca e applica la foto di copertina ideale agli articoli tramite selezione visiva convalidata.",
        status: 'todo',
        subtasks: [
          {
            title: 'Algoritmo di ricerca immagini tramite API esterne (Unsplash/Google)',
            tags: ['back'],
          },
          {
            title: 'Interfaccia editor per approvare, ritagliare e applicare la foto in un click',
            tags: ['front'],
          },
        ],
      },
    ],
  },
  {
    n: 8,
    name: 'Analisi Audio & Preparazione DJ',
    short: 'Analisi & prep DJ',
    intro:
      'Utility locali e cloud per arricchire i metadati e strutturare i file audio per la riproduzione su hardware professionale.',
    tasks: [
      {
        id: '8.1',
        title: 'Analizzatore di BPM automatico nel cloud',
        benefit:
          "Scopri all'istante il BPM esatto delle tracce caricate grazie al calcolo asincrono onset/tempo sul backend.",
        status: 'completed',
        subtasks: [
          {
            title: 'Endpoint asincrono /api/v1/academy/submissions/{id}/analyze-bpm',
            tags: ['back', 'front'],
          },
        ],
      },
      {
        id: '8.2',
        title: 'Editor tag ID3 ed esportazione per DJ hardware (Rekordbox)',
        benefit:
          'Correggi i tag ID3 dei brani (artista, titolo, copertina, BPM, Camelot Key) ed esporta le tracce ordinate in cartelle per chiavetta USB Rekordbox.',
        status: 'completed',
        subtasks: [
          {
            title: 'RekordboxExporter.tsx con form ID3 v2.4, formattazione cartelle e pacchetto USB',
            tags: ['front', 'desktop'],
          },
        ],
      },
    ],
  },
  {
    n: 9,
    name: 'Archivio Storico & Milestone Consolidate',
    short: 'Archivio Storico',
    archive: true,
    intro:
      'Registro storico di tutte le funzionalità consolidate, milestone rilasciate e architetture completate di Drops.',
    tasks: [
      {
        id: '9.1',
        title: 'Rilascio Drop Agent v2.4 & Pipeline DJ Ingestion (2026)',
        benefit:
          'Completamento del motore autonomo Drop Agent con estrazione tracklist, blind fingerprinting, slicing zero-crossing, analisi Camelot Wheel, export CUE/Rekordbox/Traktor e sync Cloud R2/Supabase.',
        status: 'completed',
        subtasks: [
          {
            title: 'Drop Agent: Blind recognition con worker Shazamio, transition detector e marcatura Unknown Tracks',
            tags: ['back', 'desktop'],
          },
          {
            title: 'Multi-DJ Exporters: Red Book CUE, Extended M3U8, Pioneer Rekordbox XML e Native Instruments Traktor NML',
            tags: ['back', 'desktop'],
          },
          {
            title: 'Discogs & Beatport enrichment con cover art HQ 1400x1400px e iniezione ID3v2.4 completa',
            tags: ['back', 'desktop'],
          },
          {
            title: 'Cloudflare R2 multi-part upload e Supabase PostgREST ingestion per DJSet e Tracks',
            tags: ['back'],
          },
        ],
      },
      {
        id: '9.2',
        title: 'Milestone Storiche Drops Hub, Producer Academy & DJ Lab',
        benefit:
          "Tieni traccia dell'affidabilità generale dell'app verificando le milestone superate e i moduli consolidati nel tempo.",
        status: 'completed',
        subtasks: [
          {
            title: 'Libreria Cloud in stile Apple Music con Drag & Drop cartelle ed export M3U Rekordbox',
            tags: ['front', 'back'],
          },
          {
            title: 'DJ Lab Dual-Deck con Pitch Slider continuo (±8%, step 0.05%) e routing Master/Cue via setSinkId',
            tags: ['front'],
          },
          {
            title: 'Rekordbox Exporter ID3v2.4 con formattazione cartelle USB drive',
            tags: ['front', 'desktop'],
          },
          {
            title: 'Portale Didattico Academy LMS con 4 Moduli (12 lezioni) e Directory Spazi/Cabine DJ Partner',
            tags: ['front', 'back'],
          },
          {
            title: 'Grafo Discovery Brain con Drawer Suggest Underground e anteprima audio live',
            tags: ['front'],
          },
          {
            title: 'Ricerca Globale Spotlight (⌘K) e Mini-Player globale persistente',
            tags: ['front'],
          },
          {
            title: 'Selettore qualità audio download (MP3 320 kbps vs Lossless FLAC/HQ)',
            tags: ['front', 'back'],
          },
          {
            title: 'Nuova UX semplificata: Home pubblica con foto/hero e login, pagine Download e Archivio dedicate',
            tags: ['front'],
          },
        ],
      },
    ],
  },
]

const LOCAL_STORAGE_KEY = 'drops.developer.roadmap.v10'

// --- COMPONENTE VISTA CONSOLE DEDICATA DROP AGENT ---
function DropAgentConsoleView({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'camelot' | 'cli' | 'catalog'>('pipeline')
  const [copiedCmd, setCopiedCmd] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<'full' | 'blind' | 'cloud' | 'dj'>('full')

  const sampleUrl = 'https://www.youtube.com/watch?v=kYJvM91N-xk'
  const presets: Record<string, { title: string; cmd: string; desc: string }> = {
    full: {
      title: 'Full Ingestion & 320k Single Tracks',
      cmd: `python3 drops-agent/drop_agent.py "${sampleUrl}" --genre "Deep House" --folder "Nude Dimensions Vol 1" --export-dj-all`,
      desc: 'Scarica il mix continuo, risolve la tracklist dalla descrizione, scarica i singoli rilasci a 320k, analizza la tonalità Camelot/BPM ed esporta tutti i formati DJ (CUE, M3U8, XML, NML).',
    },
    blind: {
      title: 'Blind Audio Fingerprint (Shazamio + 15s RAM)',
      cmd: `python3 drops-agent/drop_agent.py "${sampleUrl}" --genre "Minimal Techno" --blind-detect --slice --hop-seconds 60`,
      desc: 'Analizza il file audio continuo a campioni di 15s in RAM tramite worker Shazamio & Transition Detector, tagliando i brani su punti di zero-crossing con FFmpeg.',
    },
    cloud: {
      title: 'Cloudflare R2 + Supabase DB Ingestion',
      cmd: `python3 drops-agent/drop_agent.py "${sampleUrl}" --genre "Dub Techno" --upload-cloud --sync-db --discogs-token "$DISCOGS_API_TOKEN"`,
      desc: 'Esegue il pipeline completo e carica master, artwork HQ (1400x1400px) e playlist su Cloudflare R2 sincronizzando le entità relazionali su Supabase Postgres.',
    },
    dj: {
      title: 'DJ Hardware Package (Rekordbox + Traktor)',
      cmd: `python3 drops-agent/drop_agent.py "${sampleUrl}" --genre "Electro" --export-rekordbox --export-traktor --export-cue`,
      desc: 'Genera i file strutturati per CDJ Pioneer (Rekordbox XML), Traktor Pro (NML) e Red Book CUE con beatgrid, key e marker di transizione pronti.',
    },
  }

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(true)
    setTimeout(() => setCopiedCmd(false), 2000)
  }

  return (
    <div className="drop-agent-console">
      {/* TOP HEADER */}
      <div className="agent-header-bar">
        <div className="agent-header-meta">
          <div className="agent-badge-row">
            <span className="agent-live-tag">● ENGINE ATTIVO</span>
            <span className="agent-ver-tag">v2.4 Autonomous Core</span>
            <span className="agent-stack-tag">Python 3.14 · FFmpeg 7.0 · Shazamio · Librosa · Mutagen</span>
          </div>
          <h2 className="agent-main-title">⚡ Drop Agent Console &amp; Ingestion Hub</h2>
          <p className="agent-main-subtitle">
            Piattaforma di controllo, architettura e monitoraggio per l’agente autonomo di curatela e ingestion musicale di Drops.
          </p>
        </div>
        <div className="agent-header-controls">
          <button type="button" className="secondary btn-sm" onClick={onClose}>
            ← Torna alla Roadmap
          </button>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <div className="agent-stats-grid">
        <div className="agent-stat-card">
          <span className="stat-label">Audio Intelligence</span>
          <span className="stat-value">Blind Recognition (RAM 15s)</span>
          <span className="stat-foot">Shazamio + Spectral Flux &amp; RMS</span>
        </div>
        <div className="agent-stat-card">
          <span className="stat-label">Harmonic Mixing</span>
          <span className="stat-value">Camelot Wheel (8A / 11B / 2A)</span>
          <span className="stat-foot">Krumhansl Matrix + Onset BPM</span>
        </div>
        <div className="agent-stat-card">
          <span className="stat-label">Enrichment &amp; Artwork</span>
          <span className="stat-value">HQ 1400x1400px + ID3v2.4</span>
          <span className="stat-foot">Discogs &amp; Beatport Rate-Limited</span>
        </div>
        <div className="agent-stat-card">
          <span className="stat-label">DJ Formats &amp; Cloud</span>
          <span className="stat-value">CUE · M3U8 · XML · NML · R2</span>
          <span className="stat-foot">Rekordbox, Traktor &amp; Supabase DB</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="agent-tabs-nav">
        <button
          type="button"
          className={`agent-tab-btn ${activeTab === 'pipeline' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          🔄 Architettura Pipeline (4 Moduli)
        </button>
        <button
          type="button"
          className={`agent-tab-btn ${activeTab === 'camelot' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('camelot')}
        >
          🎼 Analisi Armonica &amp; Camelot Wheel
        </button>
        <button
          type="button"
          className={`agent-tab-btn ${activeTab === 'cli' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cli')}
        >
          💻 Comandi CLI &amp; Worker Generator
        </button>
        <button
          type="button"
          className={`agent-tab-btn ${activeTab === 'catalog' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          📁 Organizzazione data/audio &amp; R2
        </button>
      </div>

      {/* TAB CONTENT: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="agent-tab-pane">
          <h3 className="pane-title">Architettura dei 4 Moduli di Ingestion &amp; Intelligence</h3>
          <p className="pane-sub">
            Drop Agent orchestra una pipeline end-to-end multi-processore che trasforma stream YouTube e DJ mix in archivi arricchiti pronti per il clubbing e lo streaming cloud:
          </p>

          <div className="pipeline-flow-grid">
            <div className="pipeline-step-card">
              <div className="step-num">01</div>
              <h4>Task 1.1: Audio Intelligence &amp; Blind Recognition</h4>
              <p>
                Riconoscimento automatico delle tracce tramite campionamento in RAM a blocchi di 15s con FFmpeg e worker asincrono Shazamio. Rilevamento cambi traccia e beat drop tramite Spectral Flux ed energia RMS, con marcatura oraria per brani non identificati.
              </p>
              <div className="step-tech">Shazamio · FFmpeg RAM Buffer · Spectral Flux · RMS</div>
            </div>

            <div className="pipeline-step-card">
              <div className="step-num">02</div>
              <h4>Task 1.2: Harmonic Mixing Engine &amp; DJ Formats</h4>
              <p>
                Analisi tonale con mappatura Krumhansl su Ruota di Camelot (es. 8A, 11B) e scrittura tag TKEY/TBPM. Generazione automatica di CUE sheet Red Book a 75 fps, playlist M3U8, file XML Rekordbox (Hot Cues) e Traktor NML con slicing zero-crossing anti-click.
              </p>
              <div className="step-tech">Librosa · Camelot 8A/11B · Red Book CUE · Rekordbox XML</div>
            </div>

            <div className="pipeline-step-card">
              <div className="step-num">03</div>
              <h4>Task 1.3: Discogs &amp; Beatport Enrichment &amp; HQ Art</h4>
              <p>
                Integrazione API Discogs e Beatport con coda a rate-limiting controllato (60 req/min) e cache locale. Download copertine 1400x1400px JPEG sRGB con ricampionamento Lanczos e iniezione ID3v2.4 completa (APIC, TPUB, TKEY, TBPM, TSRC, COMM).
              </p>
              <div className="step-tech">Discogs API · Beatport Scraper · 1400x1400 Lanczos · Mutagen</div>
            </div>

            <div className="pipeline-step-card">
              <div className="step-num">04</div>
              <h4>Task 1.4: Cloud Multi-Part &amp; Autonomous Digging</h4>
              <p>
                Upload multi-part asincrono S3 su Cloudflare R2 con cache headers ottimizzati. Upsert atomico relazionale su Supabase (tabelle <code>dj_sets</code> e <code>tracks</code>). Web Trigger per avvio da UI e motore di ricerca intelligente ("Portami 10 perle Minimal in 8A a 124 BPM").
              </p>
              <div className="step-tech">Cloudflare R2 · Supabase PostgREST · Autonomous Digging</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAMELOT */}
      {activeTab === 'camelot' && (
        <div className="agent-tab-pane">
          <h3 className="pane-title">Motore di Analisi Armonica Camelot Wheel &amp; Regole DJ</h3>
          <p className="pane-sub">
            Drop Agent analizza lo spettrogramma cromatrico delle tracce per mappare le chiavi musicali sulla ruota di Camelot, facilitando mixaggi armonici perfetti ed energetici.
          </p>

          <div className="camelot-rules-grid">
            <div className="camelot-rule-box energy-lock">
              <span className="rule-badge">Stessa Chiave (Energy Lock)</span>
              <h4>Es. 8A ➔ 8A (o 11B ➔ 11B)</h4>
              <p>Transizione armonica perfetta senza alcuna tensione o dissonanza tonale. Ideale per lunghi passaggi sovrapposti in Deep House e Minimal.</p>
            </div>

            <div className="camelot-rule-box energy-boost">
              <span className="rule-badge">Adiacente +1 (Energy Boost)</span>
              <h4>Es. 8A ➔ 9A (La min ➔ Mi min)</h4>
              <p>Aumenta la carica energetica del dancefloor senza creare stonature. Ottimo per spingere il set verso il picco della serata.</p>
            </div>

            <div className="camelot-rule-box energy-chill">
              <span className="rule-badge">Adiacente -1 (Energy Chill)</span>
              <h4>Es. 8A ➔ 7A (La min ➔ Re min)</h4>
              <p>Rilascia la tensione e addolcisce il mood generale. Perfetto per momenti di transizione o passaggi verso selezioni più calde e profonde.</p>
            </div>

            <div className="camelot-rule-box mood-swap">
              <span className="rule-badge">Modo Parallelo (Mood Swap)</span>
              <h4>Es. 8A ➔ 8B (La min ➔ Do Mag)</h4>
              <p>Passaggio tra scala minore introspettiva e relativa scala maggiore solare/aperta, mantenendo identiche le note costitutive.</p>
            </div>
          </div>

          <div className="camelot-table-wrap">
            <table className="camelot-ref-table">
              <thead>
                <tr>
                  <th>Camelot Code</th>
                  <th>Scala Musicale (Key)</th>
                  <th>Tipo</th>
                  <th>Mood / Vibe Suggerita</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>8A</code></td><td>A minor (La min)</td><td>Minore</td><td>Deep, caldo, introspettivo, classico House/Minimal</td></tr>
                <tr><td><code>8B</code></td><td>C major (Do Mag)</td><td>Maggiore</td><td>Solare, aperto, estivo, uplifting</td></tr>
                <tr><td><code>9A</code></td><td>E minor (Mi min)</td><td>Minore</td><td>Energico, ipnotico, tensione ritmica crescente</td></tr>
                <tr><td><code>9B</code></td><td>G major (Sol Mag)</td><td>Maggiore</td><td>Luminoso, festoso, disco revival</td></tr>
                <tr><td><code>11A</code></td><td>F# minor (Fa# min)</td><td>Minore</td><td>Profondo, underground, techno dub atmosferico</td></tr>
                <tr><td><code>11B</code></td><td>A major (La Mag)</td><td>Maggiore</td><td>Trionfale, melodico, euforico</td></tr>
                <tr><td><code>1A</code></td><td>Ab minor (Sol# min)</td><td>Minore</td><td>Oscuro, notturno, groove serrato</td></tr>
                <tr><td><code>2A</code></td><td>Eb minor (Mib min)</td><td>Minore</td><td>Tensione profonda, clubbing notturno</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLI GENERATOR */}
      {activeTab === 'cli' && (
        <div className="agent-tab-pane">
          <h3 className="pane-title">Generatore Interattivo Comandi CLI Drop Agent</h3>
          <p className="pane-sub">
            Scegli uno dei preset operativi o personalizza i parametri per eseguire Drop Agent sul server o nella workstation locale.
          </p>

          <div className="preset-selector-row">
            {Object.entries(presets).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`preset-btn ${selectedPreset === key ? 'is-active' : ''}`}
                onClick={() => setSelectedPreset(key as any)}
              >
                {val.title}
              </button>
            ))}
          </div>

          <div className="cli-terminal-box">
            <div className="terminal-top">
              <div className="terminal-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="terminal-title">zsh — drop-agent worker</span>
              <button
                type="button"
                className="btn-copy-terminal"
                onClick={() => handleCopyCmd(presets[selectedPreset].cmd)}
              >
                {copiedCmd ? '✓ Copiato!' : '📋 Copia Comando'}
              </button>
            </div>
            <pre className="terminal-body">
              <code>{presets[selectedPreset].cmd}</code>
            </pre>
            <div className="terminal-desc">
              💡 <strong>Descrizione Operazione:</strong> {presets[selectedPreset].desc}
            </div>
          </div>

          <h4 className="options-table-title">Parametri &amp; Flag CLI Supportati:</h4>
          <div className="cli-flags-grid">
            <div className="flag-item">
              <code>--genre "Genre"</code>
              <span>Definisce la cartella di catalogazione primaria in <code>data/audio/</code>.</span>
            </div>
            <div className="flag-item">
              <code>--blind-detect</code>
              <span>Forza la scansione di blind recognition a blocchi di 15s in RAM con worker Shazamio.</span>
            </div>
            <div className="flag-item">
              <code>--slice</code>
              <span>Taglia il mix continuo su punti zero-crossing con FFmpeg e micro-fades.</span>
            </div>
            <div className="flag-item">
              <code>--export-dj-all</code>
              <span>Genera all'istante CUE, Extended M3U8, Rekordbox XML e Traktor NML.</span>
            </div>
            <div className="flag-item">
              <code>--upload-cloud</code>
              <span>Carica file audio, cover 1400x1400px e playlist su Cloudflare R2 con multi-part stream.</span>
            </div>
            <div className="flag-item">
              <code>--sync-db</code>
              <span>Sincronizza e indicizza le entità DJSet e Track su database Supabase Postgres.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="agent-tab-pane">
          <h3 className="pane-title">Organizzazione File in data/audio &amp; Cloudflare R2</h3>
          <p className="pane-sub">
            Struttura deterministica delle cartelle create da Drop Agent per garantire perfetta compatibilità con chiavette USB Rekordbox, player desktop e streaming cloud.
          </p>

          <div className="catalog-tree-box">
            <pre className="tree-code">
{`data/audio/
└── 📂 Deep House/
    └── 📂 Nude Dimensions Vol 1 (Naked Music 1999) - Deep House/
        ├── 🎵 00. Nude Dimensions Vol 1 (Continuous Mix).mp3  [320 kbps - ID3v2.4]
        ├── 🎵 01. Miguel Migs - The Night (Original Mix).mp3   [Camelot: 8A | BPM: 124]
        ├── 🎵 02. Lisa Shaw - Always (Naked Mix).mp3           [Camelot: 8B | BPM: 123]
        ├── 🎵 03. Aquanote - Nowhere (Speakeasy Dub).mp3       [Camelot: 9A | BPM: 125]
        ├── 📄 TRACKLIST.md                                     [Catalogo metadati, Camelot & buy links]
        ├── 📜 Nude Dimensions Vol 1.m3u8                       [Playlist estesa con metadati]
        ├── 💿 Nude Dimensions Vol 1.cue                        [Red Book CUE per lettori hardware]
        ├── 🎛️ rekordbox.xml                                    [Libreria per Pioneer CDJ / Rekordbox]
        ├── 🎛️ traktor.nml                                      [Collezione per Native Instruments Traktor]
        └── 🖼️ cover.jpg                                        [Artwork ad alta risoluzione 1400x1400px]`}
            </pre>
          </div>

          <div className="r2-integration-card">
            <h4>☁️ Integrazione Storage Cloudflare R2 &amp; Supabase</h4>
            <p>
              I file generati vengono archiviati su R2 con path gerarchici (<code>sets/&#123;folder&#125;/...</code>, <code>artworks/&#123;folder&#125;/...</code>, <code>&#123;genre&#125;/&#123;folder&#125;/&#123;track&#125;.mp3</code>) e indicizzati con presigned URL per lo streaming nel Mini-Player di Drops.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DeveloperRoadmap() {
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState(0)
  const [showDropAgentView, setShowDropAgentView] = useState(false)
  
  // Accordion per sezioni e singoli task
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set())

  // Stati di Editing & Form
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskData, setEditingTaskData] = useState<Task | null>(null)
  const [addingTaskSectionN, setAddingTaskSectionN] = useState<number | null>(null)
  const [newTaskData, setNewTaskData] = useState<Task>({ id: '', title: '', benefit: '', subtasks: [] })
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionData, setNewSectionData] = useState({ name: '', short: '', intro: '' })

  // Caricamento dei dati salvati o di default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      let initialSections: Section[] = stored ? JSON.parse(stored) : DEFAULT_SECTIONS
      setSections(initialSections)

      // Sezione 1 attiva di default
      const inProgressIndex = initialSections.findIndex((s) =>
        s.tasks.some((t) => t.status !== 'completed')
      )
      const activeSectionN = inProgressIndex !== -1 ? initialSections[inProgressIndex].n : initialSections[0]?.n

      // Chiudi per default tutte le sezioni tranne la prima
      const closedSecNumbers = initialSections
        .filter((s) => s.n !== activeSectionN)
        .map((s) => s.n)
      setCollapsedSections(new Set(closedSecNumbers))

      // Chiudi per default TUTTI i singoli task di ogni sezione
      const allTaskIds = initialSections.flatMap((s) => s.tasks.map((t) => t.id))
      setCollapsedTasks(new Set(allTaskIds))
    } catch {
      setSections(DEFAULT_SECTIONS)
      const allTaskIds = DEFAULT_SECTIONS.flatMap((s) => s.tasks.map((t) => t.id))
      setCollapsedTasks(new Set(allTaskIds))
    }
  }, [])

  // Scroll Spy per aggiornare la sidebar attiva durante lo scorrimento
  useEffect(() => {
    if (sections.length === 0 || showDropAgentView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionN = Number(entry.target.getAttribute('data-section-n'))
            const foundIdx = sections.findIndex((s) => s.n === sectionN)
            if (foundIdx !== -1) {
              setActive(foundIdx)
            }
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    )

    const sectionElements = document.querySelectorAll('.dev-section-anchor')
    sectionElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [sections, showDropAgentView])

  // Salvataggio dei dati in localStorage
  const saveSections = (newSections: Section[]) => {
    setSections(newSections)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSections))
    } catch (e) {
      console.error('Impossibile salvare in localStorage', e)
    }
  }

  const toggleSection = (n: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const toggleTask = (id: string) => {
    setCollapsedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setCollapsedSections(new Set())
    setCollapsedTasks(new Set())
  }

  const collapseAll = () => {
    setCollapsedSections(new Set(sections.map((s) => s.n)))
  }

  const scrollToSection = (n: number, idx: number) => {
    setShowDropAgentView(false)
    setActive(idx)
    setTimeout(() => {
      const el = document.getElementById(`dev-section-${n}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  if (sections.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento Roadmap…</div>

  // --- FUNZIONI DI GESTIONE TASK ---

  const handleAddTask = (e: React.FormEvent, sectionN: number) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    const targetSec = sections.find((s) => s.n === sectionN)
    if (!targetSec) return

    const taskNum = targetSec.tasks.length + 1
    const generatedId = `${sectionN}.${taskNum}`
    const finalTask: Task = {
      ...newTaskData,
      id: generatedId,
    }

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        return { ...s, tasks: [...s.tasks, finalTask] }
      }
      return s
    })

    saveSections(updatedSections)
    setAddingTaskSectionN(null)
    setNewTaskData({ id: '', title: '', benefit: '', subtasks: [] })
  }

  const handleUpdateTask = (e: React.FormEvent, sectionN: number) => {
    e.preventDefault()
    if (!editingTaskData || !editingTaskData.title.trim()) return

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        return {
          ...s,
          tasks: s.tasks.map((t) => (t.id === editingTaskId ? editingTaskData : t)),
        }
      }
      return s
    })

    saveSections(updatedSections)
    setEditingTaskId(null)
    setEditingTaskData(null)
  }

  const handleDeleteTask = (taskId: string, sectionN: number) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il task ${taskId}?`)) return

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        const filteredTasks = s.tasks.filter((t) => t.id !== taskId)
        const reindexedTasks = filteredTasks.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
    if (editingTaskId === taskId) {
      setEditingTaskId(null)
      setEditingTaskData(null)
    }
  }

  const handleMoveTaskPriority = (sectionN: number, index: number, direction: 'up' | 'down') => {
    const sec = sections.find((s) => s.n === sectionN)
    if (!sec) return

    const updatedTasks = [...sec.tasks]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= updatedTasks.length) return

    const temp = updatedTasks[index]
    updatedTasks[index] = updatedTasks[targetIdx]
    updatedTasks[targetIdx] = temp

    const reindexedTasks = updatedTasks.map((t, idx) => ({
      ...t,
      id: `${sec.n}.${idx + 1}`,
    }))

    const updatedSections = sections.map((s) => {
      if (s.n === sectionN) {
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
  }

  const handleMoveTaskToSection = (taskId: string, currentSectionN: number, targetSectionN: number) => {
    const currentSec = sections.find((s) => s.n === currentSectionN)
    if (!currentSec) return
    const taskToMove = currentSec.tasks.find((t) => t.id === taskId)
    if (!taskToMove) return

    const updatedSections = sections.map((s) => {
      if (s.n === currentSectionN) {
        const filtered = s.tasks.filter((t) => t.id !== taskId)
        const reindexed = filtered.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexed }
      }
      if (s.n === targetSectionN) {
        const newTaskList = [...s.tasks, taskToMove]
        const reindexed = newTaskList.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexed }
      }
      return s
    })

    saveSections(updatedSections)
    setEditingTaskId(null)
  }

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionData.name.trim() || !newSectionData.short.trim()) return

    const newN = sections.length > 0 ? Math.max(...sections.map(s => s.n)) + 1 : 1
    const newSection: Section = {
      n: newN,
      name: newSectionData.name,
      short: newSectionData.short,
      intro: newSectionData.intro,
      tasks: [],
    }

    const archiveIndex = sections.findIndex(s => s.archive)
    let updated: Section[] = []
    if (archiveIndex !== -1) {
      updated = [...sections]
      updated.splice(archiveIndex, 0, newSection)
    } else {
      updated = [...sections, newSection]
    }

    saveSections(updated)
    setIsAddingSection(false)
    setNewSectionData({ name: '', short: '', intro: '' })
  }

  const addSubtaskToForm = (isNew: boolean) => {
    const emptySub: SubTask = { title: '', tags: ['front'] }
    if (isNew) {
      setNewTaskData(prev => ({ ...prev, subtasks: [...prev.subtasks, emptySub] }))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? ({ ...prev, subtasks: [...prev.subtasks, emptySub] }) : null)
    }
  }

  const updateSubtaskInForm = (isNew: boolean, subIndex: number, field: keyof SubTask, value: any) => {
    const updateFn = (prev: Task) => {
      const subs = [...prev.subtasks]
      subs[subIndex] = { ...subs[subIndex], [field]: value }
      return { ...prev, subtasks: subs }
    }

    if (isNew) {
      setNewTaskData(prev => updateFn(prev))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? updateFn(prev) : null)
    }
  }

  const removeSubtaskFromForm = (isNew: boolean, subIndex: number) => {
    const updateFn = (prev: Task) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, idx) => idx !== subIndex)
    })

    if (isNew) {
      setNewTaskData(prev => updateFn(prev))
    } else if (editingTaskData) {
      setEditingTaskData(prev => prev ? updateFn(prev) : null)
    }
  }

  return (
    <div className="dev-container">
      <style>{CUSTOM_STYLES}</style>

      {/* HEADER DELLA PAGINA CON CONTROLLI GLOBALI */}
      <header className="dev-page-header">
        <div className="dev-header-left">
          <span className="dev-kicker">Pianificazione Strategica &amp; Core Engine</span>
          <h1 className="dev-headline">Developer Cave</h1>
          <p className="dev-header-sub">
            Flusso continuo di sviluppo: visualizza, espandi e gestisci le macro sezioni e i task tecnici di Drops, con Drop Agent al vertice dell'architettura.
          </p>
        </div>
        <div className="dev-header-actions">
          <button
            type="button"
            className={`btn-agent-highlight ${showDropAgentView ? 'is-active' : ''}`}
            onClick={() => setShowDropAgentView(!showDropAgentView)}
          >
            ⚡ {showDropAgentView ? 'Chiudi Console' : 'Apri Console Drop Agent'}
          </button>
          {!showDropAgentView && (
            <>
              <button type="button" className="secondary btn-sm" onClick={expandAll}>
                Espandi Tutte
              </button>
              <button type="button" className="secondary btn-sm" onClick={collapseAll}>
                Riduci Tutte
              </button>
            </>
          )}
        </div>
      </header>

      {/* VISTA CONSOLE DROP AGENT SE APERTA */}
      {showDropAgentView ? (
        <DropAgentConsoleView onClose={() => setShowDropAgentView(false)} />
      ) : (
        <div className="dev-grid">
          {/* COLONNA SINISTRA: SIDEBAR STICKY CON SPY SCROLL */}
          <aside className="dev-sidebar">
            <span className="dev-sidebar-label">Sezioni Progetto</span>
            <nav className="dev-sidebar-nav">
              {sections.map((s, idx) => {
                const allDone = s.tasks.length > 0 && s.tasks.every(t => t.status === 'completed')
                const isSpecialAgent = s.n === 1
                return (
                  <button
                    key={s.n}
                    type="button"
                    className={`dev-sidebar-btn ${idx === active ? 'is-active' : ''} ${s.archive ? 'is-archive' : ''} ${isSpecialAgent ? 'is-agent-section' : ''}`}
                    onClick={() => scrollToSection(s.n, idx)}
                  >
                    <span className={`dev-tab-n ${allDone ? 'is-done' : ''} ${isSpecialAgent ? 'is-agent-tab-n' : ''}`}>
                      {isSpecialAgent ? '⚡' : s.archive ? '✓' : allDone ? '✓' : s.n}
                    </span>
                    <span className="dev-tab-name">{s.short}</span>
                    <span className="dev-tab-count">{s.tasks.length}</span>
                  </button>
                )
              })}
            </nav>

            <button
              type="button"
              className="agent-sidebar-cta"
              onClick={() => setShowDropAgentView(true)}
            >
              ⚡ Console Drop Agent
            </button>

            {!isAddingSection ? (
              <button
                type="button"
                className="secondary add-section-trigger"
                onClick={() => setIsAddingSection(true)}
              >
                + Aggiungi Sezione
              </button>
            ) : (
              <form onSubmit={handleAddSection} className="add-section-form">
                <h4>Nuova Sezione</h4>
                <input
                  type="text"
                  placeholder="Nome completo (es. Cloud Storage)"
                  required
                  value={newSectionData.name}
                  onChange={e => setNewSectionData(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Titolo breve menu (es. Cloud)"
                  required
                  value={newSectionData.short}
                  onChange={e => setNewSectionData(prev => ({ ...prev, short: e.target.value }))}
                />
                <textarea
                  placeholder="Breve introduzione"
                  rows={2}
                  value={newSectionData.intro}
                  onChange={e => setNewSectionData(prev => ({ ...prev, intro: e.target.value }))}
                />
                <div className="form-actions">
                  <button type="submit" className="primary btn-sm">Salva</button>
                  <button type="button" className="secondary btn-sm" onClick={() => setIsAddingSection(false)}>Annulla</button>
                </div>
              </form>
            )}
          </aside>

          {/* COLONNA DESTRA: CONTENUTO A SCORRIMENTO CONTINUO */}
          <div className="dev-content-feed">
            {sections.map((sec) => {
              const isCollapsed = collapsedSections.has(sec.n)
              const completedCount = sec.tasks.filter((t) => t.status === 'completed').length
              const isAllCompleted = sec.tasks.length > 0 && completedCount === sec.tasks.length
              const isSpecialAgent = sec.n === 1

              return (
                <section
                  key={sec.n}
                  id={`dev-section-${sec.n}`}
                  data-section-n={sec.n}
                  className={`dev-section-card dev-section-anchor ${sec.archive ? 'is-archive' : ''} ${isAllCompleted ? 'is-completed-section' : ''} ${isSpecialAgent ? 'is-agent-section-card' : ''}`}
                >
                  {/* SECTION HEADER WITH ACCORDION TRIGGER */}
                  <header className="dev-section-card-header" onClick={() => toggleSection(sec.n)}>
                    <div className="sec-header-left">
                      <div className="sec-badges-row">
                        <span className={`section-number-kicker ${isSpecialAgent ? 'is-agent-kicker' : ''}`}>
                          {isSpecialAgent ? '⚡ Priorità #1 — Core Engine' : sec.archive ? 'Archivio Storico' : `Sezione ${sec.n}`}
                        </span>
                        {isAllCompleted && (
                          <span className="sec-completed-badge">
                            ✓ {completedCount}/{sec.tasks.length} COMPLETATI
                          </span>
                        )}
                        {!isAllCompleted && sec.tasks.length > 0 && (
                          <span className="sec-progress-badge">
                            {completedCount}/{sec.tasks.length} completati
                          </span>
                        )}
                      </div>
                      <h2>{sec.name}</h2>
                      <p className="section-intro">{sec.intro}</p>
                    </div>
                    <div className="sec-header-actions" onClick={(e) => e.stopPropagation()}>
                      {isSpecialAgent && (
                        <button
                          type="button"
                          className="btn-agent-open-sec"
                          onClick={() => setShowDropAgentView(true)}
                        >
                          ⚡ Apri Console
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-sort-pill btn-toggle-sec"
                        onClick={() => toggleSection(sec.n)}
                        aria-expanded={!isCollapsed}
                      >
                        {isCollapsed ? '▼ Espandi' : '▲ Riduci'}
                      </button>
                    </div>
                  </header>

                  {/* SECTION BODY (COLLAPSIBLE) */}
                  {!isCollapsed && (
                    <div className="dev-section-body">
                      {/* TASKS LIST / GRID */}
                      <div className="tasks-grid">
                        {sec.tasks.map((task, index) => {
                          const isEditing = editingTaskId === task.id
                          const isTaskCollapsed = collapsedTasks.has(task.id)

                          if (isEditing && editingTaskData) {
                            return (
                              <form
                                onSubmit={(e) => handleUpdateTask(e, sec.n)}
                                className="task-form-card"
                                key={task.id}
                              >
                                <h3>Modifica Task {task.id}</h3>

                                <label>
                                  Titolo Task
                                  <input
                                    type="text"
                                    required
                                    value={editingTaskData.title}
                                    onChange={(e) =>
                                      setEditingTaskData((prev) => (prev ? { ...prev, title: e.target.value } : null))
                                    }
                                  />
                                </label>

                                <label>
                                  Descrizione / Beneficio
                                  <textarea
                                    rows={3}
                                    value={editingTaskData.benefit || ''}
                                    onChange={(e) =>
                                      setEditingTaskData((prev) => (prev ? { ...prev, benefit: e.target.value } : null))
                                    }
                                  />
                                </label>

                                <div className="subtasks-editor">
                                  <div className="subtasks-editor-header">
                                    <h4>Sub-task</h4>
                                    <button
                                      type="button"
                                      className="secondary btn-xs"
                                      onClick={() => addSubtaskToForm(false)}
                                    >
                                      + Aggiungi Sub-task
                                    </button>
                                  </div>

                                  {editingTaskData.subtasks.map((sub, sIdx) => (
                                    <div className="subtask-editor-row" key={sIdx}>
                                      <div className="subtask-editor-top">
                                        <input
                                          type="text"
                                          placeholder="Titolo sub-task"
                                          required
                                          value={sub.title}
                                          onChange={(e) =>
                                            updateSubtaskInForm(false, sIdx, 'title', e.target.value)
                                          }
                                        />

                                        <select
                                          value={sub.tags[0] || 'front'}
                                          onChange={(e) =>
                                            updateSubtaskInForm(false, sIdx, 'tags', [e.target.value as Tag])
                                          }
                                        >
                                          <option value="front">Front-end</option>
                                          <option value="back">Back-end</option>
                                          <option value="desktop">Desktop</option>
                                        </select>

                                        <button
                                          type="button"
                                          className="delete-sub-btn"
                                          onClick={() => removeSubtaskFromForm(false, sIdx)}
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="form-actions">
                                  <button type="submit" className="primary btn-sm">
                                    Salva Modifiche
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary btn-sm"
                                    onClick={() => {
                                      setEditingTaskId(null)
                                      setEditingTaskData(null)
                                    }}
                                  >
                                    Annulla
                                  </button>
                                </div>
                              </form>
                            )
                          }

                          if (isTaskCollapsed) {
                            return (
                              <article
                                key={task.id}
                                className={`dev-task-card is-collapsed ${task.status === 'completed' ? 'is-task-completed' : ''}`}
                                onClick={() => toggleTask(task.id)}
                              >
                                <div className="task-collapsed-row">
                                  <div className="task-collapsed-left">
                                    <span className="task-id-badge">Task {task.id}</span>
                                    <span className="task-collapsed-title">{task.title}</span>
                                  </div>
                                  <div className="task-status-and-collapse" onClick={(e) => e.stopPropagation()}>
                                    <span className={`task-status-pill status-${task.status}`}>
                                      {task.status === 'completed' ? '✓ Completato' : task.status === 'paused' ? 'In Pausa' : 'In Corso / Da Fare'}
                                    </span>
                                    <button
                                      type="button"
                                      className="task-toggle-btn"
                                      onClick={() => toggleTask(task.id)}
                                      title="Espandi dettagli"
                                      aria-expanded="false"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              </article>
                            )
                          }

                          return (
                            <article
                              key={task.id}
                              className={`dev-task-card is-expanded ${task.status === 'completed' ? 'is-task-completed' : ''}`}
                            >
                              {/* TASK TOP ROW */}
                              <div className="task-top-row">
                                <div className="task-id-badge">Task {task.id}</div>
                                <div className="task-status-and-collapse">
                                  <span className={`task-status-pill status-${task.status}`}>
                                    {task.status === 'completed' ? '✓ Completato' : task.status === 'paused' ? 'In Pausa' : 'In Corso / Da Fare'}
                                  </span>
                                  <button
                                    type="button"
                                    className="task-toggle-btn"
                                    onClick={() => toggleTask(task.id)}
                                    title="Riduci dettagli"
                                    aria-expanded="true"
                                  >
                                    ▲
                                  </button>
                                </div>
                              </div>

                              <h3 className="task-title" onClick={() => toggleTask(task.id)}>
                                {task.title}
                              </h3>

                              <div className="task-expanded-content">
                                {task.benefit && <p className="task-benefit">{task.benefit}</p>}

                                {task.subtasks.length > 0 && (
                                  <div className="task-subtasks-section">
                                    <span className="subtasks-label">Attività &amp; Dettagli Tecnici</span>
                                    <ul className="subtasks-list">
                                      {task.subtasks.map((sub, sIdx) => (
                                        <li key={sIdx} className="subtask-item">
                                          <div className="subtask-tags">
                                            {sub.tags.map((tag) => (
                                              <span key={tag} className={`tag-badge tag-${tag}`}>
                                                [{tag}]
                                              </span>
                                            ))}
                                          </div>
                                          <span className="subtask-text">{sub.title}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* TASK ACTION BAR */}
                              <div className="task-card-footer">
                                <div className="task-crud-actions">
                                  <button
                                    type="button"
                                    className="secondary btn-xs"
                                    onClick={() => {
                                      setEditingTaskId(task.id)
                                      setEditingTaskData(JSON.parse(JSON.stringify(task)))
                                    }}
                                  >
                                    Modifica
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-danger btn-xs"
                                    onClick={() => handleDeleteTask(task.id, sec.n)}
                                  >
                                    Elimina
                                  </button>
                                </div>

                                <div className="task-reorder-actions">
                                  <button
                                    type="button"
                                    className="secondary btn-xs"
                                    disabled={index === 0}
                                    onClick={() => handleMoveTaskPriority(sec.n, index, 'up')}
                                    title="Aumenta priorità"
                                  >
                                    &uarr;
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary btn-xs"
                                    disabled={index === sec.tasks.length - 1}
                                    onClick={() => handleMoveTaskPriority(sec.n, index, 'down')}
                                    title="Diminuisci priorità"
                                  >
                                    &darr;
                                  </button>
                                </div>

                                <select
                                  className="move-section-select"
                                  value={sec.n}
                                  onChange={(e) =>
                                    handleMoveTaskToSection(task.id, sec.n, Number(e.target.value))
                                  }
                                  title="Sposta in un'altra sezione"
                                >
                                  <option disabled value={sec.n}>
                                    Sposta in...
                                  </option>
                                  {sections.map((s) => (
                                    <option key={s.n} value={s.n}>
                                      {s.short}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </article>
                          )
                        })}
                      </div>

                      {/* AGGIUNGI NUOVO TASK IN QUESTA SEZIONE */}
                      {addingTaskSectionN !== sec.n ? (
                        <button
                          type="button"
                          className="secondary add-task-trigger"
                          onClick={() => setAddingTaskSectionN(sec.n)}
                        >
                          + Aggiungi Task a {sec.short}
                        </button>
                      ) : (
                        <form onSubmit={(e) => handleAddTask(e, sec.n)} className="task-form-card">
                          <h3>Aggiungi Nuovo Task a {sec.name}</h3>

                          <label>
                            Titolo Task
                            <input
                              type="text"
                              placeholder="Es. Sviluppo sistema di tagging"
                              required
                              value={newTaskData.title}
                              onChange={(e) =>
                                setNewTaskData((prev) => ({ ...prev, title: e.target.value }))
                              }
                            />
                          </label>

                          <label>
                            Descrizione / Beneficio
                            <textarea
                              placeholder="Descrivi il beneficio per l'utente..."
                              rows={3}
                              value={newTaskData.benefit || ''}
                              onChange={(e) =>
                                setNewTaskData((prev) => ({ ...prev, benefit: e.target.value }))
                              }
                            />
                          </label>

                          <div className="subtasks-editor">
                            <div className="subtasks-editor-header">
                              <h4>Sub-task</h4>
                              <button
                                type="button"
                                className="secondary btn-xs"
                                onClick={() => addSubtaskToForm(true)}
                              >
                                + Aggiungi Sub-task
                              </button>
                            </div>

                            {newTaskData.subtasks.map((sub, sIdx) => (
                              <div className="subtask-editor-row" key={sIdx}>
                                <div className="subtask-editor-top">
                                  <input
                                    type="text"
                                    placeholder="Titolo sub-task"
                                    required
                                    value={sub.title}
                                    onChange={(e) =>
                                      updateSubtaskInForm(true, sIdx, 'title', e.target.value)
                                    }
                                  />

                                  <select
                                    value={sub.tags[0] || 'front'}
                                    onChange={(e) =>
                                      updateSubtaskInForm(true, sIdx, 'tags', [e.target.value as Tag])
                                    }
                                  >
                                    <option value="front">Front-end</option>
                                    <option value="back">Back-end</option>
                                    <option value="desktop">Desktop</option>
                                  </select>

                                  <button
                                    type="button"
                                    className="delete-sub-btn"
                                    onClick={() => removeSubtaskFromForm(true, sIdx)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="form-actions">
                            <button type="submit" className="primary btn-sm">
                              Crea Task
                            </button>
                            <button
                              type="button"
                              className="secondary btn-sm"
                              onClick={() => setAddingTaskSectionN(null)}
                            >
                              Annulla
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const CUSTOM_STYLES = `
.dev-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem clamp(14px, 3vw, 28px) 6rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text, #ffffff);
}

.dev-page-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.dev-header-left {
  flex: 1;
  min-width: 280px;
}

.dev-kicker {
  display: inline-block;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #22c55e;
  margin-bottom: 0.4rem;
}

.dev-headline {
  font-size: clamp(2rem, 3.2vw, 2.8rem);
  font-weight: 900;
  margin: 0 0 6px;
  letter-spacing: -0.04em;
  color: #ffffff;
}

.dev-header-sub {
  margin: 0;
  font-size: 0.92rem;
  color: #9ca3af;
  max-width: 65ch;
  line-height: 1.5;
}

.dev-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-agent-highlight {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.6);
  font-weight: 800;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
}
.btn-agent-highlight:hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.55);
  transform: translateY(-1px);
}
.btn-agent-highlight.is-active {
  background: #1f2937;
  color: #e5e7eb;
  border-color: #374151;
  box-shadow: none;
}

/* SIDEBAR & AGENT CTA */
.agent-sidebar-cta {
  width: 100%;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #6ee7b7;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.15s ease;
  text-align: center;
}
.agent-sidebar-cta:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: #34d399;
  color: #ffffff;
}

.is-agent-section {
  border-color: rgba(52, 211, 153, 0.3) !important;
}
.is-agent-tab-n {
  background: #064e3b !important;
  color: #6ee7b7 !important;
  border-color: #059669 !important;
}

.is-agent-section-card {
  border-color: rgba(16, 185, 129, 0.45) !important;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.08);
  background: linear-gradient(180deg, #0d1510 0%, #0b0f0c 100%);
}
.is-agent-kicker {
  color: #34d399 !important;
  font-weight: 900 !important;
}
.btn-agent-open-sec {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #a7f3d0;
  font-weight: 750;
  font-size: 0.74rem;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-agent-open-sec:hover {
  background: #10b981;
  color: #05230f;
}

/* DROP AGENT CONSOLE VIEW STYLES */
.drop-agent-console {
  background: #0b110d;
  border: 1px solid #1c3322;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.06);
}

.agent-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  border-bottom: 1px solid #162a1b;
  padding-bottom: 20px;
}
.agent-header-meta {
  flex: 1;
}
.agent-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.agent-live-tag {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #6ee7b7;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}
.agent-ver-tag, .agent-stack-tag {
  background: #132217;
  border: 1px solid #1f3a25;
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 650;
  padding: 2px 8px;
  border-radius: 999px;
}
.agent-main-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 6px;
  color: #ffffff;
  letter-spacing: -0.03em;
}
.agent-main-subtitle {
  margin: 0;
  color: #9ca3af;
  font-size: 0.92rem;
  max-width: 80ch;
}

/* KPI GRID */
.agent-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.agent-stat-card {
  background: #0f1812;
  border: 1px solid #1d3322;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.06em;
}
.stat-value {
  font-size: 1.05rem;
  font-weight: 850;
  color: #6ee7b7;
}
.stat-foot {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* TABS */
.agent-tabs-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #182c1e;
  padding-bottom: 12px;
  overflow-x: auto;
}
.agent-tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 750;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.agent-tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}
.agent-tab-btn.is-active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
}

.agent-tab-pane {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pane-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 850;
  color: #ffffff;
}
.pane-sub {
  margin: 0;
  font-size: 0.88rem;
  color: #9ca3af;
  line-height: 1.5;
}

/* PIPELINE STEP CARDS */
.pipeline-flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}
.pipeline-step-card {
  background: #0e1711;
  border: 1px solid #1c3121;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.pipeline-step-card .step-num {
  font-size: 0.85rem;
  font-weight: 900;
  color: #10b981;
  background: #14281a;
  border: 1px solid #23472d;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}
.pipeline-step-card h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}
.pipeline-step-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.45;
  flex: 1;
}
.pipeline-step-card .step-tech {
  font-size: 0.72rem;
  color: #6ee7b7;
  font-family: monospace;
  background: #08100a;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #172b1c;
}

/* CAMELOT STYLES */
.camelot-rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.camelot-rule-box {
  background: #0e1711;
  border: 1px solid #1c3121;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.camelot-rule-box .rule-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
}
.energy-lock .rule-badge { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
.energy-boost .rule-badge { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
.energy-chill .rule-badge { background: rgba(234, 179, 8, 0.15); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.3); }
.mood-swap .rule-badge { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

.camelot-rule-box h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}
.camelot-rule-box p {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.4;
}

.camelot-table-wrap {
  overflow-x: auto;
  border: 1px solid #1c3121;
  border-radius: 12px;
  background: #090f0b;
}
.camelot-ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
}
.camelot-ref-table th {
  background: #0f1a12;
  padding: 10px 14px;
  color: #9ca3af;
  font-weight: 750;
  border-bottom: 1px solid #1c3121;
}
.camelot-ref-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #142418;
  color: #e2e8f0;
}
.camelot-ref-table tr:last-child td {
  border-bottom: none;
}
.camelot-ref-table code {
  background: #14281a;
  color: #86efac;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
}

/* CLI TERMINAL & GENERATOR */
.preset-selector-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.preset-btn {
  background: #101912;
  border: 1px solid #1f3424;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.preset-btn:hover {
  background: #15251a;
  color: #ffffff;
}
.preset-btn.is-active {
  background: #10b981;
  color: #05230f;
  border-color: #10b981;
}

.cli-terminal-box {
  background: #060907;
  border: 1px solid #192a1d;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.terminal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #0d1610;
  border-bottom: 1px solid #192a1d;
}
.terminal-dots {
  display: flex;
  gap: 6px;
}
.terminal-dots .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #22c55e; }
.terminal-title {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}
.btn-copy-terminal {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #6ee7b7;
  font-size: 0.72rem;
  font-weight: 750;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-copy-terminal:hover {
  background: #10b981;
  color: #05230f;
}
.terminal-body {
  padding: 16px;
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  color: #a7f3d0;
  overflow-x: auto;
  line-height: 1.5;
}
.terminal-desc {
  padding: 10px 14px;
  background: #0a110d;
  border-top: 1px solid #152418;
  font-size: 0.78rem;
  color: #9ca3af;
}

.options-table-title {
  margin: 8px 0 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}
.cli-flags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}
.flag-item {
  background: #0e1711;
  border: 1px solid #1c3121;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.flag-item code {
  color: #34d399;
  font-size: 0.78rem;
  font-weight: 800;
}
.flag-item span {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.35;
}

/* CATALOG & R2 */
.catalog-tree-box {
  background: #060a08;
  border: 1px solid #192a1d;
  border-radius: 14px;
  padding: 16px;
  overflow-x: auto;
}
.tree-code {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.5;
}
.r2-integration-card {
  background: #0d1610;
  border: 1px solid #1c3121;
  border-radius: 12px;
  padding: 14px 16px;
}
.r2-integration-card h4 {
  margin: 0 0 6px;
  font-size: 0.9rem;
  font-weight: 800;
  color: #6ee7b7;
}
.r2-integration-card p {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.45;
}

/* LAYOUT GRID */
.dev-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

/* SIDEBAR RAIL */
.dev-sidebar {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #0b0f0c;
  border: 1px solid #1c2a1e;
  border-radius: 18px;
  padding: 16px;
}

.dev-sidebar-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 4px;
}

.dev-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dev-sidebar-btn {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #9ca3af;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dev-sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.dev-sidebar-btn.is-active {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #141e16;
  border: 1px solid #233827;
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n.is-done {
  background: #22c55e;
  border-color: #22c55e;
  color: #05230f;
}

.dev-sidebar-btn.is-active .dev-tab-n {
  border-color: #22c55e;
  color: #86efac;
}
.dev-sidebar-btn.is-active .dev-tab-n.is-done {
  background: #22c55e;
  color: #05230f;
}

.dev-sidebar-btn .dev-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-sidebar-btn .dev-tab-count {
  font-size: 0.72rem;
  color: #6b7280;
  font-family: monospace;
}

.dev-sidebar-btn.is-archive {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #1c2a1e;
}

.add-section-trigger {
  width: 100%;
  font-size: 0.8rem;
  padding: 8px;
  margin-top: 4px;
  border-style: dashed;
}

.add-section-form {
  background: #111813;
  border: 1px solid #233827;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-section-form h4 {
  margin: 0 0 2px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffffff;
}

.add-section-form input, .add-section-form textarea {
  width: 100%;
  padding: 6px 10px;
  background: #0a0e0b;
  border: 1px solid #1c2a1e;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #ffffff;
}
.add-section-form input:focus, .add-section-form textarea:focus {
  border-color: #22c55e;
  outline: none;
}

/* FEED A SCORRIMENTO CONTINUO */
.dev-content-feed {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.dev-section-card {
  background: #0b0f0c;
  border: 1px solid #1c2a1e;
  border-radius: 18px;
  padding: 22px 24px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  scroll-margin-top: 80px;
}

.dev-section-card.is-completed-section {
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.05);
}

.dev-section-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  user-select: none;
}

.sec-header-left {
  flex: 1;
  min-width: 0;
}

.sec-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.section-number-kicker {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #22c55e;
  letter-spacing: 0.08em;
}

.sec-completed-badge {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.sec-progress-badge {
  font-size: 0.68rem;
  font-weight: 750;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
}

.dev-section-card-header h2 {
  font-size: 1.4rem;
  font-weight: 850;
  color: #ffffff;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.section-intro {
  margin: 0;
  font-size: 0.88rem;
  color: #9ca3af;
  line-height: 1.5;
  max-width: 75ch;
}

.sec-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-toggle-sec {
  flex-shrink: 0;
}

.dev-section-body {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #152217;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* TASKS GRID */
.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dev-task-card {
  background: #101612;
  border: 1px solid #1c2a1e;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s ease;
}

.dev-task-card.is-collapsed {
  padding: 10px 14px;
  gap: 0;
  cursor: pointer;
}

.dev-task-card:hover {
  border-color: rgba(34, 197, 94, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  background: #131d16;
}

.dev-task-card.is-task-completed {
  border-color: rgba(34, 197, 94, 0.25);
  background: #0d140f;
}

.task-collapsed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-collapsed-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.task-collapsed-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-id-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #86efac;
  background: #152719;
  border: 1px solid #233827;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  flex-shrink: 0;
}

.task-status-and-collapse {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.task-status-pill {
  font-size: 0.68rem;
  font-weight: 750;
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}
.task-status-pill.status-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.task-status-pill.status-paused {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
  border: 1px solid rgba(234, 179, 8, 0.3);
}
.task-status-pill.status-todo {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.task-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 0.65rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.12s ease;
}
.task-toggle-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border-color: #22c55e;
}

.task-title {
  font-size: 0.98rem;
  font-weight: 750;
  color: #ffffff;
  margin: 0;
  line-height: 1.35;
  cursor: pointer;
}

.task-expanded-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-benefit {
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.45;
  margin: 0;
}

.task-subtasks-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px dashed #1c2a1e;
  padding-top: 8px;
}

.subtasks-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.06em;
}

.subtasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.subtask-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.78rem;
  color: #e2e8f0;
  line-height: 1.35;
}

.subtask-tags {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 1px;
}

.tag-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  font-family: monospace;
}
.tag-badge.tag-front {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}
.tag-badge.tag-back {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.tag-badge.tag-desktop {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.subtask-text {
  flex: 1;
}

.task-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #162218;
  flex-wrap: wrap;
}

.task-crud-actions, .task-reorder-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.move-section-select {
  padding: 3px 6px;
  font-size: 0.72rem;
  background: #141e16;
  border: 1px solid #233827;
  color: #9ca3af;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.move-section-select:hover {
  color: #ffffff;
  border-color: #22c55e;
}

.add-task-trigger {
  width: 100%;
  padding: 10px;
  border-style: dashed;
  font-size: 0.84rem;
  border-radius: 10px;
}

.task-form-card {
  background: #121a14;
  border: 1px solid #22c55e;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-form-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
}

.task-form-card label {
  font-size: 0.72rem;
  font-weight: 750;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-form-card input, .task-form-card textarea, .task-form-card select {
  background: #090e0a;
  border: 1px solid #1c2a1e;
  border-radius: 8px;
  padding: 6px 10px;
  color: #ffffff;
  font-size: 0.82rem;
}
.task-form-card input:focus, .task-form-card textarea:focus {
  border-color: #22c55e;
  outline: none;
}

.subtasks-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #1c2a1e;
  padding-top: 8px;
}

.subtasks-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.subtasks-editor-header h4 {
  margin: 0;
  font-size: 0.82rem;
  color: #ffffff;
}

.subtask-editor-row {
  background: #0a0e0b;
  border: 1px solid #1c2a1e;
  border-radius: 8px;
  padding: 6px;
}

.subtask-editor-top {
  display: grid;
  grid-template-columns: 1fr 90px 24px;
  gap: 6px;
  align-items: center;
}

.delete-sub-btn {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  width: 24px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
}
.btn-xs {
  padding: 3px 8px;
  font-size: 0.72rem;
  border-radius: 6px;
}

@media (max-width: 900px) {
  .dev-grid {
    grid-template-columns: 1fr;
  }
  .dev-sidebar {
    position: static;
  }
  .dev-sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .dev-sidebar-btn {
    grid-template-columns: auto auto;
    white-space: nowrap;
  }
}
`
