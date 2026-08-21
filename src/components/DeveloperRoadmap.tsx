import React, { useState } from 'react'

type Tag = 'front' | 'back' | 'desktop'

interface SubTask {
  title: string
  tags: Tag[]
  choices?: string
  action?: string
  actionList?: string[]
}

interface Task {
  id: string
  title: string
  benefit?: string
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

const SECTIONS: Section[] = [
  {
    n: 1,
    name: 'Downloader Singolo & Tracce Esclusive',
    short: 'Download singolo',
    intro:
      "Gestione dell'acquisizione di singole tracce audio da sorgenti esterne, con ottimizzazioni per la scena underground e materiali esclusivi.",
    tasks: [
      {
        id: '1.1',
        title: 'Download diretto da YouTube per tracce esclusive',
        benefit:
          "Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza ricorrere a convertitori web esterni instabili o pieni di pubblicità.",
        subtasks: [
          {
            title: 'Integrazione libreria di estrazione audio (yt-dlp)',
            tags: ['back'],
            choices:
              "Usare la libreria yt-dlp installata direttamente sul backend FastAPI per estrarre l'audio in MP3 a 320kbps (Raccomandato per compatibilità ottimale con hardware DJ).",
            action:
              "Sviluppare l'endpoint /api/download/youtube-direct con gestione asincrona delle code sul server.",
          },
          {
            title: 'Interfaccia di input e feedback di progresso',
            tags: ['front'],
            choices:
              'Indicatore di caricamento globale con notifica di esito (Raccomandato per semplicità iniziale) oppure monitoraggio progressivo in tempo reale con Server-Sent Events (SSE).',
            action:
              'Creare il modulo di input URL nella dashboard e gestire gli stati della richiesta.',
          },
        ],
      },
      {
        id: '1.2',
        title: 'Download singolo multi-sorgente con selezione qualità',
        benefit:
          'Salva sul dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata e organizzandola in cartelle.',
        subtasks: [
          {
            title: 'Opzioni di conversione e formati (MP3 vs FLAC/HQ)',
            tags: ['back'],
            choices:
              'Default a MP3 320kbps per ottimizzare lo storage (Raccomandato), o download lossless FLAC/WAV per SoundCloud HQ.',
            action:
              "Configurare i parametri post-processor FFmpeg sul backend in base alla sorgente e alla scelta dell'utente.",
          },
        ],
      },
    ],
  },
  {
    n: 2,
    name: 'Gestione Playlist & Download Multiplo',
    short: 'Playlist & batch',
    intro:
      'Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.',
    tasks: [
      {
        id: '2.1',
        title: 'Anteprima, filtri e selezione brani prima del download',
        benefit:
          'Vedi la lista completa delle tracce di una playlist (YT) o di un set (SC) prima di scaricarla, selezionando solo i brani che ti interessano ed escludendo in automatico quelli già in libreria.',
        subtasks: [
          {
            title: 'Limite massimo elementi risolti in simultanea',
            tags: ['back'],
            choices:
              'Limite massimo di 100 tracce a playlist (Raccomandato) per evitare blocchi IP temporanei ed esaurimento memoria sul server.',
            action:
              "Configurare il controllo del limite ed eventualmente la paginazione nell'endpoint /playlist/resolve.",
          },
          {
            title: 'Selezione tramite checkbox e filtro duplicati',
            tags: ['front'],
            choices:
              "Riconoscere automaticamente i file già presenti in locale o in cloud e deselezionarli per default (Raccomandato), lasciando all'utente la facoltà di forzare la sovrascrittura.",
            action:
              'Creare la tabella dei brani trovati con checkbox dinamici e badge "Già presente".',
          },
        ],
      },
    ],
  },
  {
    n: 3,
    name: 'Cloud Storage & Libreria Utente',
    short: 'Cloud & libreria',
    intro:
      'Spostamento del baricentro della libreria utente dal disco locale a una soluzione cloud sicura, con streaming privato e organizzazione automatica.',
    tasks: [
      {
        id: '3.1',
        title: 'Salvataggio e organizzazione della propria musica in cloud',
        subtasks: [
          {
            title: 'Configurazione dello storage personale (Cloudflare R2)',
            tags: ['back'],
            choices:
              'Utilizzare Cloudflare R2 (Raccomandato per i costi di traffico in uscita a $0) creando una cartella per ciascun utente sincronizzata con le credenziali Supabase.',
            action:
              'Sviluppare la logica di upload asincrono su R2 al termine del download e salvare il percorso su database Supabase.',
          },
          {
            title: 'Ricerca testuale e filtri nel catalogo cloud',
            tags: ['front'],
            choices:
              'Ricerca rapida client-side sui metadati (Raccomandato per reattività) o delega delle query interamente a Supabase.',
            action:
              'Disegnare la tabella di visualizzazione della libreria cloud con filtri di genere e barra di ricerca.',
          },
        ],
      },
      {
        id: '3.2',
        title: 'Riproduttore musicale cloud e streaming privato',
        benefit:
          'Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, ovunque e su qualsiasi dispositivo.',
        subtasks: [
          {
            title: 'Generazione di link sicuri per lo streaming (Presigned URLs)',
            tags: ['back'],
            choices:
              'Generare URL firmati a scadenza (es. validità 1 ora, Raccomandato) per proteggere i file audio da accessi esterni non autorizzati.',
            action:
              "Sviluppare l'endpoint /api/stream/{track_id} che rilascia il link temporaneo.",
          },
          {
            title: "Riproduttore audio persistente e coda d'ascolto",
            tags: ['front'],
            choices:
              "Player audio fisso a fondo pagina (Raccomandato) che resta attivo navigando nell'app, con supporto a una coda di riproduzione dinamica.",
            action: 'Integrare lo stato del player nel contesto globale di React/Astro.',
          },
        ],
      },
    ],
  },
  {
    n: 4,
    name: 'Integrazione Streaming & Sync Preferiti',
    short: 'Sync preferiti',
    intro:
      "Connessione alle piattaforme esterne per importare le selezioni e i metadati accumulati dall'utente.",
    tasks: [
      {
        id: '4.1',
        title: 'Sincronizzazione automatica e download dei preferiti Spotify',
        benefit:
          'Collega il tuo account Spotify e importa in Drops i brani "Mi Piace" per verificare quali sono scaricabili o già in tuo possesso ed estrarne i metadati.',
        subtasks: [
          {
            title: 'Algoritmo di matching tra metadati Spotify e sorgenti audio',
            tags: ['back'],
            choices:
              'Ricerca su YouTube per combinazioni di Titolo + Artista + "Audio" per la corrispondenza migliore (Raccomandato), escludendo i video non musicali.',
            action: "Creare il motore di matching automatico e l'endpoint di associazione tracce.",
          },
          {
            title: 'Interfaccia di gestione dei preferiti importati',
            tags: ['front'],
            choices:
              'Mostrare i brani importati con stato evidenziato ("Scaricabile", "Già scaricato", "Incertezza sulla fonte") e pulsante di download singolo e multiplo (Raccomandato).',
            action: 'Sviluppare la dashboard Spotify-to-Cloud con griglia interattiva dei brani.',
          },
        ],
      },
      {
        id: '4.2',
        title: 'Importazione automatica dei "Likes" da SoundCloud e YouTube',
        benefit:
          'Tieni traccia dei brani a cui metti "Like" su SoundCloud e YouTube e importali in blocco per aggiungerli alla coda di download.',
        subtasks: [
          {
            title: 'Connessione e recupero dei preferiti senza API proprietarie',
            tags: ['back'],
            choices:
              "Per SoundCloud, chiedere all'utente l'URL del profilo pubblico e scansionare i like pubblici (Raccomandato per facilità d'uso), oppure far incollare un file JSON esportato.",
            action:
              'Configurare l’estrattore di metadati per i Mi Piace di SoundCloud e YouTube (via OAuth limitato).',
          },
        ],
      },
    ],
  },
  {
    n: 5,
    name: 'Corso DJ & Producing Online (Learning Hub)',
    short: 'Learning Hub',
    intro:
      "Portale didattico privato per formare l'utente nell'arte del DJing e della produzione con strumenti interattivi.",
    tasks: [
      {
        id: '5.1',
        title: 'Portale di formazione per DJ e produttori (lezioni e dispense)',
        benefit:
          "Impara mixaggio e produzione in un'area riservata organizzata in moduli didattici, video-lezioni, schede tecniche e test di autovalutazione.",
        subtasks: [
          {
            title: "Struttura dell'area didattica e hosting dei video",
            tags: ['front', 'back'],
            choices:
              'Lettore video per lezioni ospitate su Vimeo/YouTube non in elenco (Raccomandato per ridurre costi di hosting e banda) invece di caricare video grezzi su R2.',
            action:
              "Progettare la griglia delle lezioni per moduli e salvare i progressi dell'utente nel database.",
          },
        ],
      },
      {
        id: '5.2',
        title: 'Mappa interattiva delle scuole di musica e cabine DJ',
        benefit:
          'Trova accademie musicali, sale prove, studi di registrazione e cabine DJ a noleggio vicino a te su una mappa geografica interattiva.',
        subtasks: [
          {
            title: "Integrazione della mappa geografica dei punti d'interesse",
            tags: ['front'],
            choices:
              'Usare Leaflet con OpenStreetMap (Raccomandato perché open-source e gratuito al 100%) invece di Mapbox/Google Maps che richiedono chiavi API e piani a pagamento.',
            action:
              'Creare il componente Mappa con marker interattivi che mostrano prezzi, attrezzatura e contatti.',
          },
        ],
      },
      {
        id: '5.3',
        title: 'Crate didattici di tracce e player di beatmatching',
        benefit:
          "Esercitati sul beatmatching direttamente dal browser con un player speciale dotato di regolatore di velocità (Pitch Control) su pacchetti di tracce selezionate per difficoltà.",
        subtasks: [
          {
            title: 'Regolatore di velocità audio (Pitch Control) via Web Audio API',
            tags: ['front'],
            choices:
              'Pitch Slider (da -8% a +8%) con opzione "Key Lock" per mantenere o variare l’intonazione originale (Raccomandato per simulare i giradischi reali).',
            action: 'Sviluppare la logica Web Audio API per regolare il tempo di riproduzione.',
          },
          {
            title: 'Selezione e catalogazione dei pacchetti didattici (Crate)',
            tags: ['back'],
            choices:
              'Suddividere le tracce per difficoltà di beatmatching (Crate Facile: intro con cassa pulita; Crate Difficile: intro sincopate o corte).',
            action: 'Popolare il database con i brani seed consigliati per l’apprendimento.',
          },
        ],
      },
    ],
  },
  {
    n: 6,
    name: 'Grafo Discovery & Motore Suggest',
    short: 'Discovery & Suggest',
    intro:
      'Il motore di curatela e raccomandazione orientato alla musica elettronica underground (Minimal, Deep House, Techno).',
    tasks: [
      {
        id: '6.1',
        title: 'Motore "Drops Suggest" e grafo di etichette, party e artisti',
        benefit:
          'Esplora le connessioni tra etichette di nicchia, party underground e DJ per scoprire nuove tracce affini al tuo gusto tramite consigli intelligenti.',
        subtasks: [
          {
            title: 'Visualizzazione del grafo relazionale e navigazione',
            tags: ['front'],
            choices:
              'Libreria interattiva leggera come ForceGraph2D o vis.js (Raccomandato perché gestisce bene dragging e zoom dei nodi in React).',
            action: 'Sviluppare la vista del grafo relazionale nel tab "Brain".',
          },
          {
            title: 'Algoritmo di raccomandazione',
            tags: ['back'],
            choices:
              "Pesare le raccomandazioni combinando vicinanza geografica ai party, affinità dello stile delle etichette e momentum temporale (Raccomandato).",
            action: 'Sviluppare le query SQL su Supabase/Postgres per estrarre le raccomandazioni affini.',
          },
        ],
      },
      {
        id: '6.2',
        title: 'Guide editoriali pratiche per il settore musicale',
        benefit:
          'Leggi guide super-sintetiche e aggiornate su come pubblicare la tua musica, stampare in vinile nel 2026 e gestire i codici ISRC/UPC per proteggere i tuoi diritti.',
        subtasks: [
          {
            title: 'Gestione dei contenuti editoriali (CMS leggero vs file statici)',
            tags: ['front', 'back'],
            choices:
              'Salvare gli articoli come Markdown statici in Astro (Content Collections) per caricamenti istantanei ed evitare query complesse a database (Raccomandato per la velocità SEO).',
            action: 'Configurare il layout Astro per il rendering dei blocchi di testo delle guide.',
          },
        ],
      },
    ],
  },
  {
    n: 7,
    name: 'Analisi Audio & Preparazione DJ',
    short: 'Analisi & prep DJ',
    intro:
      'Utility locali e cloud per arricchire i metadati e strutturare i file audio per la riproduzione su hardware professionale.',
    tasks: [
      {
        id: '7.1',
        title: 'Analizzatore di BPM automatico nel cloud',
        benefit:
          "Scopri all'istante il BPM esatto delle tracce scaricate grazie a un'analisi automatica lato server, senza installare motori di analisi pesanti sul computer.",
        subtasks: [
          {
            title: 'Algoritmo e posizionamento del calcolo del BPM',
            tags: ['back'],
            choices:
              'Analisi del BPM sul backend FastAPI in modo asincrono con librerie Python (NumPy + FFmpeg) per la massima precisione (Raccomandato), salvando il risultato su database.',
            action: 'Configurare la coda di analisi in background e i relativi endpoint.',
          },
        ],
      },
      {
        id: '7.2',
        title: 'Editor tag ID3 ed esportazione per DJ hardware (Rekordbox)',
        benefit:
          'Correggi i tag ID3 dei brani (artista, titolo, copertina, BPM) ed esporta le tracce ordinate in cartelle su una chiavetta USB pronta per i lettori CDJ professionali.',
        subtasks: [
          {
            title: 'Scrittura fisica dei metadati sui file esportati',
            tags: ['desktop', 'front'],
            choices:
              'Comandi nativi Rust di Tauri per scrivere i tag ID3 direttamente sui file scaricati prima di copiarli sull’USB (Raccomandato per compatibilità Rekordbox).',
            action:
              "Implementare la chiamata Rust per l'aggiornamento dei metadati e il gestore dei percorsi delle cartelle.",
          },
        ],
      },
    ],
  },
  {
    n: 8,
    name: 'Archivio Attività Completate',
    short: 'Completati',
    archive: true,
    intro: 'Registro delle funzionalità storiche e strutturali già testate e in produzione.',
    tasks: [
      {
        id: '8.1',
        title: 'Raccolta storica degli obiettivi completati',
        benefit:
          "Tieni traccia dell'affidabilità generale dell'app verificando le milestone superate e i bug fix applicati nel tempo.",
        subtasks: [
          {
            title: 'Milestone storiche già completate',
            tags: ['front'],
            actionList: [
              'Split dei 3 monorepo e pulizia del codice morto.',
              'Risoluzione dello schermo nero sul mini-player (dimensioni artwork bloccate a 56×56).',
              'Gestione rate limit di Discogs (coda pacizzata con sleep di 300ms e thread pool sicura).',
              'Estrazione IP reale del client Cloudflare per superare il blocco di rate limit globale.',
              'Spotify OAuth iniziale con reindirizzamenti dinamici.',
            ],
          },
        ],
      },
    ],
  },
]

const TAG_LABEL: Record<Tag, string> = { front: 'front', back: 'back', desktop: 'desktop' }

function TagBadge({ tag }: { tag: Tag }) {
  return <span className={`dc-tag dc-tag--${tag}`}>{TAG_LABEL[tag]}</span>
}

function SubTaskAccordion({
  sub,
  open,
  onToggle,
  archive,
}: {
  sub: SubTask
  open: boolean
  onToggle: () => void
  archive?: boolean
}) {
  return (
    <div className={`dc-acc${open ? ' is-open' : ''}`}>
      <button className="dc-acc-head" onClick={onToggle} aria-expanded={open}>
        <span className="dc-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 5l5 5-5 5" />
          </svg>
        </span>
        <span className="dc-acc-title">{sub.title}</span>
        <span className="dc-acc-tags">
          {sub.tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </span>
      </button>
      {open && (
        <div className="dc-acc-body">
          {sub.choices && (
            <div className="dc-line dc-line--choice">
              <span className="dc-line-label">Scelte &amp; raccomandazioni</span>
              <p>{sub.choices}</p>
            </div>
          )}
          {sub.action && (
            <div className="dc-line dc-line--action">
              <span className="dc-line-label">Azione</span>
              <p>{sub.action}</p>
            </div>
          )}
          {sub.actionList && (
            <ul className={`dc-milestones${archive ? ' is-archive' : ''}`}>
              {sub.actionList.map((item, i) => (
                <li key={i}>
                  <span className="dc-check" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function DeveloperRoadmap() {
  const [active, setActive] = useState(0)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({})

  const section = SECTIONS[active]

  const toggle = (key: string) =>
    setOpenSubs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="dev-cave">
      <style>{DEV_CAVE_CSS}</style>

      <aside className="dc-sidebar" aria-label="Sezioni del progetto">
        <div className="dc-brand">
          <span className="dc-brand-mark">🔨</span>
          <span className="dc-brand-name">Developer Cave</span>
        </div>
        <nav className="dc-nav">
          {SECTIONS.map((s, i) => (
            <button
              key={s.n}
              className={`dc-tab${i === active ? ' is-active' : ''}${s.archive ? ' is-archive' : ''}`}
              onClick={() => setActive(i)}
              aria-current={i === active ? 'true' : undefined}
            >
              <span className="dc-tab-n">{s.archive ? '✓' : s.n}</span>
              <span className="dc-tab-name">{s.short}</span>
              <span className="dc-tab-count">{s.tasks.length}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="dc-content">
        <header className={`dc-section-head${section.archive ? ' is-archive' : ''}`}>
          <span className="dc-section-n">{section.archive ? 'STORICO' : `Sezione ${section.n}`}</span>
          <h1>{section.name}</h1>
          <p className="dc-section-intro">{section.intro}</p>
        </header>

        <div className="dc-tasks">
          {section.tasks.map((task) => (
            <article className="dc-task" key={task.id}>
              <div className="dc-task-head">
                <span className="dc-task-id">{task.id}</span>
                <h2>{task.title}</h2>
              </div>
              {task.benefit && <p className="dc-task-benefit">{task.benefit}</p>}
              <div className="dc-subs">
                {task.subtasks.map((sub, si) => {
                  const key = `${section.n}-${task.id}-${si}`
                  return (
                    <SubTaskAccordion
                      key={key}
                      sub={sub}
                      open={!!openSubs[key]}
                      onToggle={() => toggle(key)}
                      archive={section.archive}
                    />
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

const DEV_CAVE_CSS = `
.dev-cave {
  --dc-bg: #101411;
  --dc-panel: #161c16;
  --dc-panel-2: #1b221b;
  --dc-border: #293029;
  --dc-border-soft: #202720;
  --dc-ink: #edf3ee;
  --dc-ink-dim: #8f9a90;
  --dc-ink-faint: #6b756c;
  --dc-accent: #22c55e;
  --dc-accent-dim: rgba(34, 197, 94, 0.14);
  --dc-front: #38bdf8;
  --dc-back: #a78bfa;
  --dc-desktop: #f5a742;
  --dc-radius: 14px;
  --dc-font: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;

  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 0;
  min-height: min(76vh, 780px);
  background: var(--dc-bg);
  color: var(--dc-ink);
  border: 1px solid var(--dc-border);
  border-radius: var(--dc-radius);
  overflow: hidden;
  font-family: var(--dc-font);
  font-size: 13.5px;
  line-height: 1.55;
}

/* ---------- SIDEBAR ---------- */
.dc-sidebar {
  border-right: 1px solid var(--dc-border);
  background: linear-gradient(180deg, #12170f 0%, var(--dc-bg) 100%);
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dc-brand { display: flex; align-items: center; gap: 9px; padding: 4px 8px 12px; border-bottom: 1px solid var(--dc-border-soft); }
.dc-brand-mark { font-size: 16px; }
.dc-brand-name { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; color: var(--dc-ink); }
.dc-nav { display: flex; flex-direction: column; gap: 3px; }
.dc-tab {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--dc-ink-dim);
  font-family: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}
.dc-tab:hover { background: var(--dc-panel); color: var(--dc-ink); }
.dc-tab.is-active {
  background: var(--dc-accent-dim);
  border-color: rgba(34, 197, 94, 0.4);
  color: var(--dc-ink);
}
.dc-tab-n {
  display: grid; place-items: center;
  width: 22px; height: 22px;
  border-radius: 6px;
  background: var(--dc-panel-2);
  color: var(--dc-ink-dim);
  font-size: 11px; font-weight: 700;
}
.dc-tab.is-active .dc-tab-n { background: var(--dc-accent); color: #06210f; }
.dc-tab.is-archive.is-active .dc-tab-n { background: var(--dc-accent); color: #06210f; }
.dc-tab-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: .3px; }
.dc-tab-count { color: var(--dc-ink-faint); font-size: 10.5px; }
.dc-tab.is-active .dc-tab-count { color: var(--dc-accent); }
.dc-tab.is-archive { margin-top: 6px; border-top: 1px dashed var(--dc-border-soft); border-radius: 0 0 10px 10px; padding-top: 12px; }

/* ---------- CONTENT ---------- */
.dc-content { padding: 26px clamp(18px, 3vw, 34px) 40px; min-width: 0; }
.dc-section-head { padding-bottom: 18px; margin-bottom: 20px; border-bottom: 1px solid var(--dc-border); }
.dc-section-n {
  display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--dc-accent); font-weight: 700; margin-bottom: 8px;
}
.dc-section-head.is-archive .dc-section-n { color: var(--dc-ink-dim); }
.dc-section-head h1 { margin: 0 0 8px; font-size: clamp(18px, 2.4vw, 23px); letter-spacing: .3px; color: var(--dc-ink); }
.dc-section-intro { margin: 0; color: var(--dc-ink-dim); font-size: 12.5px; max-width: 62ch; line-height: 1.6; }

.dc-tasks { display: flex; flex-direction: column; gap: 14px; }
.dc-task { background: var(--dc-panel); border: 1px solid var(--dc-border); border-radius: var(--dc-radius); padding: 16px 16px 14px; }
.dc-task-head { display: flex; align-items: baseline; gap: 10px; }
.dc-task-id {
  flex: 0 0 auto; font-size: 10.5px; font-weight: 700; color: var(--dc-accent);
  background: var(--dc-accent-dim); border: 1px solid rgba(34,197,94,.28);
  border-radius: 6px; padding: 2px 7px;
}
.dc-task-head h2 { margin: 0; font-size: 14.5px; line-height: 1.4; letter-spacing: .2px; color: var(--dc-ink); }
.dc-task-benefit { margin: 8px 0 12px; color: var(--dc-ink-dim); font-size: 12px; line-height: 1.6; }

.dc-subs { display: flex; flex-direction: column; gap: 6px; }
.dc-acc { border: 1px solid var(--dc-border); border-radius: 10px; background: var(--dc-bg); overflow: hidden; }
.dc-acc.is-open { border-color: rgba(34,197,94,.35); }
.dc-acc-head {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 12px; background: transparent; border: 0; cursor: pointer;
  color: var(--dc-ink); font-family: inherit; font-size: 12.5px; text-align: left;
}
.dc-acc-head:hover { background: var(--dc-panel-2); }
.dc-chevron { flex: 0 0 auto; display: flex; color: var(--dc-ink-faint); transition: transform .16s ease; }
.dc-chevron svg { width: 15px; height: 15px; }
.dc-acc.is-open .dc-chevron { transform: rotate(90deg); color: var(--dc-accent); }
.dc-acc-title { flex: 1; min-width: 0; line-height: 1.4; }
.dc-acc-tags { flex: 0 0 auto; display: flex; gap: 5px; }
.dc-tag {
  font-size: 9.5px; letter-spacing: .5px; text-transform: lowercase; font-weight: 700;
  padding: 2px 7px; border-radius: 20px; border: 1px solid;
}
.dc-tag--front { color: var(--dc-front); background: rgba(56,189,248,.1); border-color: rgba(56,189,248,.32); }
.dc-tag--back { color: var(--dc-back); background: rgba(167,139,250,.1); border-color: rgba(167,139,250,.32); }
.dc-tag--desktop { color: var(--dc-desktop); background: rgba(245,167,66,.1); border-color: rgba(245,167,66,.32); }

.dc-acc-body { padding: 4px 12px 14px 37px; display: flex; flex-direction: column; gap: 12px; }
.dc-line { border-left: 2px solid var(--dc-border); padding-left: 12px; }
.dc-line--choice { border-left-color: var(--dc-front); }
.dc-line--action { border-left-color: var(--dc-accent); }
.dc-line-label {
  display: block; font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase;
  font-weight: 700; color: var(--dc-ink-faint); margin-bottom: 4px;
}
.dc-line--action .dc-line-label { color: var(--dc-accent); }
.dc-line p { margin: 0; font-size: 12px; line-height: 1.6; color: var(--dc-ink); }

.dc-milestones { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.dc-milestones li { display: flex; gap: 10px; align-items: flex-start; font-size: 12px; color: var(--dc-ink-dim); line-height: 1.5; }
.dc-check { flex: 0 0 auto; display: flex; margin-top: 1px; color: var(--dc-accent); }
.dc-check svg { width: 14px; height: 14px; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 820px) {
  .dev-cave { grid-template-columns: 1fr; min-height: 0; }
  .dc-sidebar { border-right: 0; border-bottom: 1px solid var(--dc-border); }
  .dc-nav { flex-direction: row; flex-wrap: nowrap; overflow-x: auto; gap: 6px; padding-bottom: 4px; }
  .dc-tab { grid-template-columns: auto auto; white-space: nowrap; }
  .dc-tab-name { max-width: 130px; }
  .dc-tab-count { display: none; }
  .dc-tab.is-archive { margin-top: 0; border-top: 0; padding-top: 9px; }
  .dc-acc-body { padding-left: 12px; }
}
`
