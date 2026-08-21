import React, { useState, useEffect } from 'react'

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

const DEFAULT_SECTIONS: Section[] = [
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
        benefit:
          'Archivia e tieni al sicuro la tua musica scaricata in uno spazio cloud privato legato al tuo account per liberare spazio locale.',
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
              "Pesare le raccomandazioni combinando vicinanza geografica ai party, affinità dello stile delle etichette and momentum temporale (Raccomandato).",
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

const LOCAL_STORAGE_KEY = 'drops.developer.roadmap.v2'

export default function DeveloperRoadmap() {
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState(0)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({})
  
  // Stati di Editing & Form
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskData, setEditingTaskData] = useState<Task | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskData, setNewTaskData] = useState<Task>({ id: '', title: '', benefit: '', subtasks: [] })
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionData, setNewSectionData] = useState({ name: '', short: '', intro: '' })

  // Caricamento dei dati salvati o di default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        setSections(JSON.parse(stored))
      } else {
        setSections(DEFAULT_SECTIONS)
      }
    } catch {
      setSections(DEFAULT_SECTIONS)
    }
  }, [])

  // Salvataggio dei dati in localStorage
  const saveSections = (newSections: Section[]) => {
    setSections(newSections)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSections))
    } catch (e) {
      console.error('Impossibile salvare in localStorage', e)
    }
  }

  const resetToDefault = () => {
    if (window.confirm('Vuoi ripristinare la roadmap di default? Perderai tutte le tue personalizzazioni.')) {
      saveSections(DEFAULT_SECTIONS)
      setActive(0)
      setEditingTaskId(null)
      setIsAddingTask(false)
    }
  }

  if (sections.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento Roadmap…</div>

  const section = sections[active]

  const toggleSubtask = (key: string) => {
    setOpenSubs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // --- FUNZIONI DI GESTIONE TASK ---

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    const taskNum = section.tasks.length + 1
    const generatedId = `${section.n}.${taskNum}`
    const finalTask: Task = {
      ...newTaskData,
      id: generatedId,
    }

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        return { ...s, tasks: [...s.tasks, finalTask] }
      }
      return s
    })

    saveSections(updatedSections)
    setIsAddingTask(false)
    setNewTaskData({ id: '', title: '', benefit: '', subtasks: [] })
  }

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTaskData || !editingTaskData.title.trim()) return

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
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

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il task ${taskId}?`)) return

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        // Riassegna gli ID progressivi dopo l'eliminazione per mantenere l'ordine coerente
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

  const handleMoveTaskPriority = (index: number, direction: 'up' | 'down') => {
    const updatedTasks = [...section.tasks]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= updatedTasks.length) return

    // Scambia i task
    const temp = updatedTasks[index]
    updatedTasks[index] = updatedTasks[targetIdx]
    updatedTasks[targetIdx] = temp

    // Riassegna gli ID progressivi
    const reindexedTasks = updatedTasks.map((t, idx) => ({
      ...t,
      id: `${section.n}.${idx + 1}`,
    }))

    const updatedSections = sections.map((s, idx) => {
      if (idx === active) {
        return { ...s, tasks: reindexedTasks }
      }
      return s
    })

    saveSections(updatedSections)
  }

  const handleMoveTaskToSection = (taskId: string, targetSectionN: number) => {
    const taskToMove = section.tasks.find((t) => t.id === taskId)
    if (!taskToMove) return

    const updatedSections = sections.map((s) => {
      // Rimuovi dal modulo di origine e ricalcola gli ID
      if (s.n === section.n) {
        const filtered = s.tasks.filter((t) => t.id !== taskId)
        const reindexed = filtered.map((t, index) => ({
          ...t,
          id: `${s.n}.${index + 1}`,
        }))
        return { ...s, tasks: reindexed }
      }
      // Aggiungi al modulo di destinazione e ricalcola gli ID
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

  // --- FUNZIONI DI GESTIONE SEZIONE ---

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

    // Inserisci prima dell'archivio (se presente)
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
    setActive(archiveIndex !== -1 ? archiveIndex : updated.length - 1)
  }

  // --- HELPER DI EDITING SUBTASK NEI FORM ---

  const addSubtaskToForm = (isNew: boolean) => {
    const emptySub: SubTask = { title: '', tags: ['front'], choices: '', action: '' }
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

      {/* HEADER DELLA PAGINA CON RESET */}
      <header className="dev-page-header">
        <div>
          <span className="dev-kicker">Pianificazione Strategica</span>
          <h1 className="dev-headline">Developer Cave</h1>
        </div>
        <button type="button" className="secondary reset-btn" onClick={resetToDefault}>
          Ripristina default
        </button>
      </header>

      <div className="dev-grid">
        {/* COLONNA SINISTRA: SIDEBAR */}
        <aside className="dev-sidebar">
          <span className="dev-sidebar-label">Sezioni Progetto</span>
          <nav className="dev-sidebar-nav">
            {sections.map((s, idx) => (
              <button
                key={s.n}
                type="button"
                className={`dev-sidebar-btn ${idx === active ? 'is-active' : ''} ${s.archive ? 'is-archive' : ''}`}
                onClick={() => {
                  setActive(idx)
                  setEditingTaskId(null)
                  setIsAddingTask(false)
                }}
              >
                <span className="dev-tab-n">{s.archive ? '✓' : s.n}</span>
                <span className="dev-tab-name">{s.short}</span>
                <span className="dev-tab-count">{s.tasks.length}</span>
              </button>
            ))}
          </nav>

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
                placeholder="Nome completo (es. Cloud Storage & Libreria)"
                required
                value={newSectionData.name}
                onChange={e => setNewSectionData(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Titolo breve menu (es. Cloud & libreria)"
                required
                value={newSectionData.short}
                onChange={e => setNewSectionData(prev => ({ ...prev, short: e.target.value }))}
              />
              <textarea
                placeholder="Breve introduzione/obiettivo della sezione"
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

        {/* COLONNA DESTRA: CONTENUTO */}
        <section className="dev-content">
          <header className={`dev-section-heading ${section.archive ? 'is-archive' : ''}`}>
            <span className="section-number-kicker">{section.archive ? 'Archivio Storico' : `Sezione ${section.n}`}</span>
            <h2>{section.name}</h2>
            <p className="section-intro">{section.intro}</p>
          </header>

          {/* LISTA DEI TASK */}
          <div className="tasks-container">
            {section.tasks.map((task, index) => {
              const isEditing = editingTaskId === task.id

              if (isEditing && editingTaskData) {
                return (
                  <form onSubmit={handleUpdateTask} className="task-form-card" key={task.id}>
                    <h3>Modifica Task {task.id}</h3>
                    
                    <label>
                      Titolo Task
                      <input
                        type="text"
                        required
                        value={editingTaskData.title}
                        onChange={e => setEditingTaskData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                      />
                    </label>

                    <label>
                      Beneficio / Miglioramento per l'Utente
                      <textarea
                        rows={2}
                        value={editingTaskData.benefit || ''}
                        onChange={e => setEditingTaskData(prev => prev ? ({ ...prev, benefit: e.target.value }) : null)}
                      />
                    </label>

                    <div className="subtasks-editor">
                      <div className="subtasks-editor-header">
                        <h4>Sub-task Operative</h4>
                        <button type="button" className="secondary btn-xs" onClick={() => addSubtaskToForm(false)}>
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
                              onChange={e => updateSubtaskInForm(false, sIdx, 'title', e.target.value)}
                            />
                            
                            <select
                              value={sub.tags[0] || 'front'}
                              onChange={e => updateSubtaskInForm(false, sIdx, 'tags', [e.target.value as Tag])}
                            >
                              <option value="front">Front-end</option>
                              <option value="back">Back-end</option>
                              <option value="desktop">Desktop</option>
                            </select>

                            <button type="button" className="delete-sub-btn" onClick={() => removeSubtaskFromForm(false, sIdx)}>
                              &times;
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Scelte e raccomandazioni (opzionale)"
                            value={sub.choices || ''}
                            onChange={e => updateSubtaskInForm(false, sIdx, 'choices', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Azione da compiere (opzionale)"
                            value={sub.action || ''}
                            onChange={e => updateSubtaskInForm(false, sIdx, 'action', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="primary btn-sm">Salva Modifiche</button>
                      <button type="button" className="secondary btn-sm" onClick={() => { setEditingTaskId(null); setEditingTaskData(null); }}>
                        Annulla
                      </button>
                    </div>
                  </form>
                )
              }

              return (
                <article className="task-card" key={task.id}>
                  {/* BARRA AZIONI DEL TASK */}
                  <div className="task-actions-toolbar">
                    <div className="task-badge-id">{task.id}</div>
                    
                    <div className="task-order-buttons">
                      <button
                        type="button"
                        className="order-btn"
                        disabled={index === 0}
                        onClick={() => handleMoveTaskPriority(index, 'up')}
                        title="Sposta Su"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="order-btn"
                        disabled={index === section.tasks.length - 1}
                        onClick={() => handleMoveTaskPriority(index, 'down')}
                        title="Sposta Giù"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="task-move-section">
                      <select
                        aria-label="Sposta in sezione"
                        value={section.n}
                        onChange={e => handleMoveTaskToSection(task.id, parseInt(e.target.value))}
                        className="section-move-dropdown"
                      >
                        <option value={section.n}>Sposta in Sezione…</option>
                        {sections.map(s => s.n !== section.n && (
                          <option key={s.n} value={s.n}>{s.short}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="edit-task-btn"
                      onClick={() => {
                        setEditingTaskId(task.id)
                        setEditingTaskData({ ...task })
                      }}
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      className="delete-task-btn"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Elimina
                    </button>
                  </div>

                  {/* CORPO DEL TASK */}
                  <h3 className="task-card-title">{task.title}</h3>
                  {task.benefit && <p className="task-card-benefit">{task.benefit}</p>}

                  {/* SUBTASKS ACCORDIONS */}
                  <div className="subtasks-list">
                    {task.subtasks.map((sub, sIdx) => {
                      const key = `${section.n}-${task.id}-${sIdx}`
                      const isOpen = !!openSubs[key]
                      return (
                        <div className={`subtask-acc ${isOpen ? 'is-open' : ''}`} key={key}>
                          <button
                            type="button"
                            className="subtask-acc-head"
                            onClick={() => toggleSubtask(key)}
                            aria-expanded={isOpen}
                          >
                            <span className="subtask-chevron">
                              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 5l5 5-5 5" />
                              </svg>
                            </span>
                            <span className="subtask-acc-title">{sub.title}</span>
                            <span className="subtask-acc-tags">
                              {sub.tags.map((t) => (
                                <span key={t} className={`subtask-tag-badge tag-${t}`}>
                                  {t}
                                </span>
                              ))}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="subtask-acc-body">
                              {sub.choices && (
                                <div className="subtask-body-section border-choice">
                                  <span className="subtask-section-label label-choice">Scelte &amp; Raccomandazioni</span>
                                  <p className="subtask-section-text">{sub.choices}</p>
                                </div>
                              )}
                              {sub.action && (
                                <div className="subtask-body-section border-action">
                                  <span className="subtask-section-label label-action">Azione</span>
                                  <p className="subtask-section-text">{sub.action}</p>
                                </div>
                              )}
                              {sub.actionList && sub.actionList.length > 0 && (
                                <ul className="subtask-milestone-list">
                                  {sub.actionList.map((item, mIdx) => (
                                    <li key={mIdx}>
                                      <span className="check-icon">✓</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>

          {/* AGGIUNGI NUOVO TASK */}
          {!isAddingTask ? (
            <button
              type="button"
              className="primary add-task-trigger"
              onClick={() => setIsAddingTask(true)}
            >
              + Aggiungi Task a questa Sezione
            </button>
          ) : (
            <form onSubmit={handleAddTask} className="task-form-card add-task-card">
              <h3>Aggiungi Nuovo Task</h3>

              <label>
                Titolo Task
                <input
                  type="text"
                  placeholder="Es. Download diretto da YouTube per tracce esclusive"
                  required
                  value={newTaskData.title}
                  onChange={e => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                />
              </label>

              <label>
                Beneficio / Miglioramento per l'Utente
                <textarea
                  placeholder="Descrivi come questo task migliora concretamente l'esperienza dell'utente..."
                  rows={2}
                  value={newTaskData.benefit || ''}
                  onChange={e => setNewTaskData(prev => ({ ...prev, benefit: e.target.value }))}
                />
              </label>

              <div className="subtasks-editor">
                <div className="subtasks-editor-header">
                  <h4>Sub-task Operative</h4>
                  <button type="button" className="secondary btn-xs" onClick={() => addSubtaskToForm(true)}>
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
                        onChange={e => updateSubtaskInForm(true, sIdx, 'title', e.target.value)}
                      />
                      
                      <select
                        value={sub.tags[0] || 'front'}
                        onChange={e => updateSubtaskInForm(true, sIdx, 'tags', [e.target.value as Tag])}
                      >
                        <option value="front">Front-end</option>
                        <option value="back">Back-end</option>
                        <option value="desktop">Desktop</option>
                      </select>

                      <button type="button" className="delete-sub-btn" onClick={() => removeSubtaskFromForm(true, sIdx)}>
                        &times;
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Scelte e raccomandazioni (opzionale)"
                      value={sub.choices || ''}
                      onChange={e => updateSubtaskInForm(true, sIdx, 'choices', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Azione da compiere (opzionale)"
                      value={sub.action || ''}
                      onChange={e => updateSubtaskInForm(true, sIdx, 'action', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="primary btn-sm">Crea Task</button>
                <button type="button" className="secondary btn-sm" onClick={() => setIsAddingTask(false)}>
                  Annulla
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

const CUSTOM_STYLES = `
.dev-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem clamp(14px, 3vw, 24px) 4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text, #151815);
}

.dev-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--color-border, #dce1dc);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.dev-kicker {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent-strong, #15803d);
  margin-bottom: 0.4rem;
}

.dev-headline {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.03em;
  color: var(--color-text, #151815);
}

.reset-btn {
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 8px;
}

/* LAYOUT GRID */
.dev-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: clamp(1.5rem, 3.5vw, 3rem);
  align-items: start;
}

/* SIDEBAR RAIL */
.dev-sidebar {
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dev-sidebar-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted, #626862);
  margin-bottom: 0.2rem;
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
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted, #626862);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dev-sidebar-btn:hover {
  background: var(--color-surface-subtle, #f2f4f1);
  color: var(--color-text, #151815);
}

.dev-sidebar-btn.is-active {
  background: var(--color-accent-soft, #dcfce7);
  border-color: rgba(34, 197, 94, 0.22);
  color: var(--color-accent-strong, #15803d);
  font-weight: 800;
}

.dev-sidebar-btn .dev-tab-n {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--color-surface-subtle, #f2f4f1);
  color: var(--color-text-muted, #626862);
  font-size: 0.75rem;
  font-weight: 700;
}

.dev-sidebar-btn.is-active .dev-tab-n {
  background: var(--color-accent, #22c55e);
  color: #05230f;
}

.dev-sidebar-btn .dev-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-sidebar-btn .dev-tab-count {
  font-size: 0.75rem;
  opacity: 0.75;
}

.dev-sidebar-btn.is-archive {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border, #dce1dc);
  border-radius: 0 0 10px 10px;
}

.add-section-trigger {
  width: 100%;
  font-size: 0.8rem;
  padding: 8px;
  margin-top: 8px;
  border-style: dashed;
}

.add-section-form {
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #dce1dc);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-section-form h4 {
  margin: 0 0 4px;
  font-size: 0.85rem;
  font-weight: 800;
}

.add-section-form input, .add-section-form textarea {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border-strong, #c8cec8);
  border-radius: 6px;
  font-size: 0.8rem;
}

.add-section-form input {
  height: 34px;
}

/* CONTENT CONTAINER */
.dev-content {
  min-width: 0;
}

.dev-section-heading {
  margin-bottom: 2rem;
}

.section-number-kicker {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-accent-strong, #15803d);
  letter-spacing: 0.08em;
}

.dev-section-heading.is-archive .section-number-kicker {
  color: var(--color-text-muted, #626862);
}

.dev-section-heading h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0.3rem 0 0.8rem;
  letter-spacing: -0.02em;
}

.section-intro {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-muted, #626862);
  max-width: 70ch;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* TASK CARD */
.task-card {
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #dce1dc);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: var(--shadow-card, 0 10px 30px rgba(25, 35, 27, .04));
  position: relative;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.task-card:hover {
  border-color: var(--color-border-strong, #c8cec8);
  box-shadow: var(--shadow-hover, 0 16px 36px rgba(25, 35, 27, .08));
}

.task-actions-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.task-badge-id {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-accent-strong, #15803d);
  background: var(--color-accent-soft, #dcfce7);
  border: 1px solid rgba(34, 197, 94, 0.28);
  border-radius: 6px;
  padding: 2.5px 7px;
}

.task-order-buttons {
  display: flex;
  gap: 2px;
}

.order-btn {
  background: var(--color-surface-subtle, #f2f4f1);
  border: 1px solid var(--color-border, #dce1dc);
  color: var(--color-text-muted, #626862);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
}

.order-btn:hover:not(:disabled) {
  background: var(--color-border-strong, #c8cec8);
  color: var(--color-text, #151815);
}

.order-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.task-move-section {
  margin-left: auto;
}

.section-move-dropdown {
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #dce1dc);
  background: var(--color-surface, #ffffff);
  font-size: 0.75rem;
  color: var(--color-text-muted, #626862);
  cursor: pointer;
}

.edit-task-btn, .delete-task-btn {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #dce1dc);
  cursor: pointer;
  background: var(--color-surface, #ffffff);
  transition: all 0.15s ease;
}

.edit-task-btn {
  color: var(--color-text-muted, #626862);
}

.edit-task-btn:hover {
  border-color: var(--color-accent-strong, #15803d);
  color: var(--color-accent-strong, #15803d);
  background: var(--color-accent-soft, #dcfce7);
}

.delete-task-btn {
  color: var(--color-danger, #b42318);
}

.delete-task-btn:hover {
  border-color: var(--color-danger, #b42318);
  background: var(--color-danger-soft, #fef3f2);
}

.task-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--color-text, #151815);
}

.task-card-benefit {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-text-muted, #626862);
  margin: 0 0 16px 0;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* SUBTASK ACCORDION */
.subtask-acc {
  border: 1px solid var(--color-border, #dce1dc);
  border-radius: 10px;
  background: var(--color-surface-subtle, #f2f4f1);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.subtask-acc.is-open {
  border-color: var(--color-accent-strong, #15803d);
  background: var(--color-surface, #ffffff);
}

.subtask-acc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text, #151815);
  transition: background 0.15s ease;
}

.subtask-acc-head:hover {
  background: rgba(0,0,0, 0.02);
}

.subtask-chevron {
  flex: none;
  display: flex;
  color: var(--color-text-muted, #626862);
  transition: transform 0.2s ease;
}

.subtask-chevron svg {
  width: 16px;
  height: 16px;
}

.subtask-acc.is-open .subtask-chevron {
  transform: rotate(90deg);
  color: var(--color-accent-strong, #15803d);
}

.subtask-acc-title {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}

.subtask-acc-tags {
  flex: none;
  display: flex;
  gap: 6px;
}

.subtask-tag-badge {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2.5px 8px;
  border-radius: 20px;
  border: 1px solid;
}

.subtask-tag-badge.tag-front {
  color: #0369a1;
  background: #f0f9ff;
  border-color: #bae6fd;
}

.subtask-tag-badge.tag-back {
  color: #6d28d9;
  background: #f5f3ff;
  border-color: #ddd6fe;
}

.subtask-tag-badge.tag-desktop {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}

.subtask-acc-body {
  padding: 4px 18px 18px 44px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 1px solid var(--color-border, #dce1dc);
}

.subtask-body-section {
  border-left: 3px solid var(--color-border-strong, #c8cec8);
  padding-left: 14px;
}

.subtask-body-section.border-choice {
  border-left-color: #0284c7;
}

.subtask-body-section.border-action {
  border-left-color: var(--color-accent-strong, #15803d);
}

.subtask-section-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted, #626862);
  margin-bottom: 0.25rem;
}

.subtask-section-label.label-action {
  color: var(--color-accent-strong, #15803d);
}

.subtask-section-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #2b302b;
}

.subtask-milestone-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtask-milestone-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #2b302b;
}

.check-icon {
  flex: none;
  font-weight: 800;
  color: var(--color-accent-strong, #15803d);
}

/* ADD TASK TRIGGER & CARDS */
.add-task-trigger {
  width: 100%;
  height: 52px;
  border-style: dashed;
  border-width: 1.5px;
  font-weight: 800;
  font-size: 0.95rem;
}

.task-form-card {
  background: var(--color-surface, #ffffff);
  border: 1.5px solid var(--color-border-strong, #c8cec8);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-form-card h3 {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.task-form-card label {
  font-size: 0.72rem;
  font-weight: 800;
}

.task-form-card input, .task-form-card textarea, .task-form-card select {
  width: 100%;
  margin-top: 6px;
  border: 1px solid var(--color-border-strong, #c8cec8);
  border-radius: 8px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--color-text, #151815);
  background: var(--color-surface, #ffffff);
}

.task-form-card textarea {
  resize: vertical;
}

.subtasks-editor {
  border-top: 1px solid var(--color-border, #dce1dc);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subtasks-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtasks-editor-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.subtask-editor-row {
  border: 1px solid var(--color-border, #dce1dc);
  background: var(--color-surface-subtle, #f2f4f1);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtask-editor-top {
  display: grid;
  grid-template-columns: 1fr 120px 30px;
  gap: 8px;
  align-items: center;
}

.subtask-editor-top input {
  margin-top: 0;
  height: 36px;
}

.subtask-editor-top select {
  margin-top: 0;
  height: 36px;
}

.delete-sub-btn {
  background: var(--color-danger-soft, #fef3f2);
  border: 1px solid var(--color-danger, #b42318);
  color: var(--color-danger, #b42318);
  width: 30px;
  height: 36px;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-sm {
  min-height: 40px !important;
  height: 40px !important;
  font-size: 0.85rem !important;
  padding: 0 16px !important;
}

.btn-xs {
  height: 28px !important;
  font-size: 0.75rem !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
}

/* RESPONSIVE LAYOUT */
@media (max-width: 900px) {
  .dev-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .dev-sidebar {
    position: static;
  }
  .dev-sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .dev-sidebar-btn {
    white-space: nowrap;
    grid-template-columns: auto auto;
    width: auto;
  }
  .dev-sidebar-btn .dev-tab-count {
    display: none;
  }
  .dev-sidebar-btn.is-archive {
    margin-top: 0;
    padding-top: 10px;
    border-top: 0;
  }
  .subtask-acc-body {
    padding-left: 18px;
  }
}
`;
