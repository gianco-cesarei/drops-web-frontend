# Drops — Developer Roadmap Plan (Frontend Reference)

Questo documento definisce la struttura strategica e le specifiche per l'implementazione della nuova **Pagina Developer** (`DeveloperRoadmap.tsx`) all'interno dell'applicazione Drops.

L'obiettivo è creare una pagina di pianificazione interattiva per lo sviluppo del progetto, dotata di un menu laterale (sidebar) a schede per navigare tra le diverse macro sezioni, visualizzazioni ad accordion/collassabili per i dettagli tecnici e una **Console Interattiva per Drop Agent** al vertice dell'architettura.

---

## Struttura dell'Interfaccia Utente (UI) della Pagina Developer

1. **Sidebar Laterale Sinistra:**
   * Consente di cambiare il focus tra le 9 macro sezioni elencate di seguito, con **Drop Agent Ingestion** evidenziata al 1° posto con badge prioritario `⚡`.
   * Include il pulsante diretto `⚡ Console Drop Agent` per aprire la dashboard dedicata all'ingestion engine.
   * La scheda selezionata risalta visivamente con scroll-spy bidirezionale.

2. **Console Dedicata Drop Agent (View Modale/Tab):**
   * Vista specializzata accessibile dall'header e dalla Sezione 1 con:
     * **Architettura Pipeline (4 Moduli)**: Audio Intelligence, Harmonic Engine & DJ Exporters, Discogs/Beatport 1400x1400px Cover, Cloud R2 & Autonomous Digging.
     * **Ruota Armonica Camelot Wheel**: Regole di mixing armonico (Energy Lock, Boost +1, Chill -1, Mood Swap) e tabella di riferimento scale/tonalità.
     * **Generatore Comandi CLI**: Terminal interattivo con preset operativi e copia con 1 click dei comandi `drop_agent.py`.
     * **Catalog Explorer**: Albero deterministico dei file in `data/audio/` e gerarchia bucket Cloudflare R2.

3. **Area Contenuto Principale:**
   * **Titolo della Sezione:** Nome della macro area corrente.
   * **Introduzione/Focus:** Breve spiegazione dell'ambito tecnologico e dell'obiettivo strategico della sezione.
   * **Elenco dei Task:** Ciascun task con titolo chiaro incentrato sul beneficio concreto per l'utente.
   * **Sub-Task Collassabili:** Sotto ogni task, un elenco di sotto-attività che dettagliano le decisioni da prendere, le raccomandazioni e le azioni pratiche da svolgere, contrassegnate dai tag di competenza:
     * `[front]` (Astro/React/CSS)
     * `[back]` (FastAPI/Python/Docker/Supabase/R2)
     * `[desktop]` (Tauri v2/Rust/OS)

4. **Archivio Attività Completate:**
   * Sezione speciale (Sezione 9) per tenere traccia delle milestone già consolidate senza ingombrare la visualizzazione attiva.

---

## Dettaglio delle Macro Sezioni, Task e Sub-Task

### Sezione 1: Drop Agent — Autonomous Ingestion & Music Intelligence Engine
* **Introduzione:** Il motore autonomo di acquisizione, analisi armonica, arricchimento metadati e popolamento cloud della libreria Drops.

1. **Task 1.1: Audio Intelligence & Riconoscimento Cieco (Blind Recognition) [COMPLETATO]**
   * *Miglioramento Utente:* Riconosci in automatico qualsiasi traccia all'interno di DJ set o podcast lunghi anche quando il video YouTube non ha la tracklist nella descrizione.
   * *a) Campionamento in RAM a 15s con FFmpeg e worker asincrono Shazamio* `[back]`
     * **Stato:** Motore asincrono in memoria per segmentazione rapida e fingerprinting a finestre mobili (60s hop).
   * *b) Transition & Beat Drop Detector basato su Spectral Flux e RMS* `[back]`
     * **Stato:** Analisi spettrale per identificare i punti esatti di mixaggio e stacco traccia nel continuous mix.
   * *c) Fallback fuzzy e gestione Unknown Tracks con marcatura oraria* `[back]`
     * **Stato:** Gestione automatica di brani ID non identificati con timestamp orario e catalogazione nel `TRACKLIST.md`.

2. **Task 1.2: Harmonic Mixing Engine & Esportazione Formati DJ [COMPLETATO]**
   * *Miglioramento Utente:* Prepara la musica per il club: calcolo istantaneo della chiave Camelot (8A, 11B, 2A), BPM esatto ed esportazione con 1 click per chiavette USB Rekordbox e Traktor.
   * *a) Mappatura cromatica Krumhansl su Ruota di Camelot e tag ID3 TKEY/TBPM* `[back]`
     * **Stato:** Algoritmo `harmonic_analyzer.py` con chroma features, stima tonale e scrittura frame ID3v2.4 `TKEY` e `TBPM`.
   * *b) Generatore file .cue Red Book a 75 fps e playlist estesa .m3u8* `[back]`
     * **Stato:** Modulo `exporters.py` per generazione CUE sheet standard con performer/titolo e indici a 75 fps.
   * *c) Esportatore rekordbox.xml (DJ_PLAYLISTS con Memory/Hot Cues) e traktor.nml* `[back]`
     * **Stato:** Esportazione per Pioneer CDJ (XML) e Native Instruments Traktor Pro (NML) con marker pronti.
   * *d) Slicing lossless zero-crossing con micro-fades per evitare click audio* `[back]`
     * **Stato:** Taglio automatico con FFmpeg sui punti di passaggio a zero per preservare continuità e dinamica.

3. **Task 1.3: Discogs & Beatport Enrichment & Cover Art HQ (1400x1400px) [COMPLETATO]**
   * *Miglioramento Utente:* Ogni traccia viene arricchita con l'etichetta discografica originale, il numero di catalogo del vinile, l'anno di stampa e la copertina in altissima risoluzione.
   * *a) Client Discogs & Beatport con rate-limiting (60 req/min) e cache su disco* `[back]`
     * **Stato:** Coda controllata con rate limit sicuro, cache locale delle query e bypass dei blocchi API.
   * *b) Downloader copertine 1400x1400px JPEG sRGB Lanczos e vinile fallback* `[back]`
     * **Stato:** Scraping e ricampionamento Lanczos per artwork nitide a 1400x1400px pronte per display CDJ Retina.
   * *c) Iniezione completa tag ID3v2.4 (APIC, TPUB, TKEY, TBPM, TSRC, COMM)* `[back]`
     * **Stato:** Tagging avanzato via mutagen con embedding cover JPEG e metadati di release estesi.

4. **Task 1.4: Cloud Multi-Part Ingestion & Autonomous Crate Digging [COMPLETATO CORE / IN EVOLUZIONE]**
   * *Miglioramento Utente:* Caricamento immediato dei file nello storage audio Cloudflare R2 e inserimento automatico nel database Supabase, con modalità di digging autonomo per genere e BPM.
   * *a) Multi-part uploader asincrono S3 su Cloudflare R2 con cache headers* `[back]`
     * **Stato:** Modulo `cloud.py` con upload concorrente multi-part e presigned streaming URL.
   * *b) Client Supabase PostgREST per upsert atomici su dj_sets e tracks* `[back]`
     * **Stato:** Sincronizzazione relazionale per `DJSetModel`, `TrackModel` e `SetTrackModel`.
   * *c) Integrazione Web Trigger (lanciare l'agente dall'interfaccia utente)* `[front]` `[back]`
     * **Stato:** Trigger da Developer Cave con generatori di comandi e worker dedicati.
   * *d) Modalità Autonomous Digging ("Portami 10 perle Minimal in 8A a 124 BPM")* `[back]`
     * **Stato:** Ingestion mirata per parametri armonici e stilistici.

---

### Sezione 2: Downloader Singolo & Tracce Esclusive (YT/SC)
* **Introduzione:** Gestione dell'acquisizione di singole tracce audio da sorgenti esterne, con ottimizzazioni per la scena underground e materiali esclusivi.

1. **Task 2.1: Download Diretto da YouTube per tracce esclusive [COMPLETATO]**
   * *Miglioramento Utente:* Scarica all'istante l'audio da video YouTube che ospitano tracce, remix o bootleg rari non pubblicati altrove, senza ricorrere a convertitori web esterni instabili o pieni di pubblicità.
   * *a) Integrazione libreria di estrazione audio (yt-dlp)* `[back]`
     * **Stato:** Endpoint `/api/v1/download/create` con integrazione `yt-dlp`, fallback per link Radio Mix `list=RD...` e gestione asincrona.
   * *b) Interfaccia di input e feedback di progresso* `[front]`
     * **Stato:** Modulo di download con textarea multi-link, polling automatico dello stato, pulsante retry e coda dinamica.

2. **Task 2.2: Download Singolo Multi-Sorgente con selezione della qualità [COMPLETATO]**
   * *Miglioramento Utente:* Salva sul tuo dispositivo o nel cloud qualsiasi singola traccia da YouTube o SoundCloud scegliendo la qualità desiderata (MP3 320 kbps vs HQ Master Pesante) e organizzandola in cartelle.
   * *a) Opzioni di conversione e formati (MP3 vs FLAC/HQ)* `[back]` `[front]`
     * **Stato:** Selettore visivo di qualità a due opzioni (`🎵 MP3 (320 kbps)` vs `🔥 HQ Master (Pesante)`), memorizzazione preferenza ed estrazione audio HD.

---

### Sezione 3: Gestione Playlist & Download Multiplo
* **Introduzione:** Interfaccia e logica di rete per gestire set completi e intere playlist di etichette senza sovraccaricare le API esterne.

1. **Task 3.1: Anteprima, filtri e selezione brani da Playlist/Set prima del download [COMPLETATO]**
   * *Miglioramento Utente:* Vedi la lista completa delle tracce di una playlist (YT, Spotify o SoundCloud) nella modale bianca ad alta densità con ricerca e durata prima di inviarla alla coda.
   * *a) Limite massimo elementi risolti in simultanea* `[back]`
     * **Stato:** Endpoint `/api/v1/playlist/resolve` e Spotify resolver con paginazione e limite sicuro.
   * *b) Selezione tramite checkbox e filtro duplicati* `[front]`
     * **Stato:** Nuova modale bianca rettangolare `PlaylistDialog` con scroll ad alta densità (8-12 tracce visibili), numerazione, durata e filtro di ricerca rapido interno.

---

### Sezione 4: Cloud Storage & Libreria Utente
* **Introduzione:** Spostamento del baricentro della libreria utente dal disco locale a una soluzione in cloud sicura, con streaming privato e organizzazione automatica.

1. **Task 4.1: Salvataggio e organizzazione della propria musica in Cloud [COMPLETATO]**
   * *Miglioramento Utente:* Carica intere cartelle di file audio dal computer in Drops, analizza automaticamente metadati ID3, BPM e arricchimento Discogs, ed indicizza le cartelle caricate con nome e data di caricamento.
   * *a) Configurazione dello Storage Personale (Cloudflare R2 + Supabase)* `[back]` `[front]`
     * **Stato:** Implementata libreria in stile Apple Music (`FolderIngestionHub.tsx`) con Drag & Drop di intere cartelle, navigazione laterale Tutti i Brani / Cartelle / Sessioni, rinomina inline istantanea ed esportazione M3U Rekordbox.
   * *b) Ricerca testuale e filtri nel catalogo cloud* `[front]`
     * **Stato:** Ricerca rapida integrata su cartelle e tracce, filtri di genere e visualizzazione metadati Camelot Key / BPM.

2. **Task 4.2: Riproduttore Musicale Cloud e Streaming Privato [COMPLETATO]**
   * *Miglioramento Utente:* Ascolta in streaming la musica salvata nel tuo archivio cloud privato direttamente dal browser, ovunque ti trovi e su qualsiasi dispositivo.
   * *a) Generazione di link sicuri per lo streaming (Presigned URLs)* `[back]`
     * **Stato:** Generazione presigned URL R2 ed endpoint `/api/v1/download/{id}/file`.
   * *b) Riproduttore audio persistente e coda d'ascolto* `[front]`
     * **Stato:** Mini-player audio globale fisso a fondo pagina con routing `window.__drops_play_track` e hover play su colonna `#`.

3. **Task 4.3: Architettura UI Utente Semplificata (Home, Download, Archivio) [COMPLETATO]**
   * *Miglioramento Utente:* Nuova navigazione pulita e focalizzata per l'utente finale: Home pubblica con discovery visivo ed hero, login diretto, e percorsi dedicati a Download e Archivio senza sovrastrutture complesse.
   * *a) Home con Discovery visivo e accesso rapido /app/login* `[front]`
     * **Stato:** Layout pubblico semplificato (`PublicLayout.astro`, `PublicHeader.tsx`, `DiscoveryEnvironment`) con card visive, streaming integrato e routing login/area privata reattivo.
   * *b) Pagina Downloader con accordion, drag & drop e gestione qualità* `[front]` `[back]`
     * **Stato:** Vista `/app/download` con accordion ripiegabili, polling resiliente a riavvio server, switch qualità 320k/HQ e modale archivio rapida.
   * *c) Pagina Archivio con organizzazione cartelle, preview rapido ed export Rekordbox* `[front]` `[back]`
     * **Stato:** Vista `/app/archive` con visualizzazione cartelle, sidebar categorie, rinomina e spostamento destinazione inline, export M3U e sincronizzazione locale.

---

### Sezione 5: Integrazione Streaming & Sync Preferiti
* **Introduzione:** Connessione alle piattaforme esterne per importare le selezioni e i metadati accumulati dall'utente.

1. **Task 5.1: Sincronizzazione automatica e download dei preferiti di Spotify [COMPLETATO]**
   * *Miglioramento Utente:* Collega il tuo account Spotify e importa in Drops i tuoi brani "Mi Piace" per verificare quali sono scaricabili o già in tuo possesso ed estrarne i metadati.
   * *a) Integrazione Spotify Web API e matching metadati* `[front]` `[back]`
     * **Stato:** Connessione OAuth Spotify, estrazione brani piaciuti, integrazione Discogs e calcolo BPM in libreria.

2. **Task 5.2: Importazione automatica da SoundCloud e YouTube [COMPLETATO]**
   * *Miglioramento Utente:* Tieni traccia dei brani e dei set a cui metti "Like" su SoundCloud e YouTube e importali in blocco per aggiungerli alla tua libreria e al DJ Lab.
   * *a) Risoluzione multi-sorgente e Crate Sync* `[front]` `[back]`
     * **Stato:** Implementato `MultiSourceSync.tsx` integrato in `PlatformSyncHub` con risoluzione link SoundCloud/YouTube, preset di set underground (Houghton, Timedance) e importazione nel Crate per DJ Lab.

---

### Sezione 6: Corso DJ & Producing Online (Learning Hub)
* **Introduzione:** Portale didattico privato volto a formare l'utente nell'arte del DJing e della produzione con strumenti interattivi.

1. **Task 6.1: Portale di Formazione per DJ e Produttori (Lezioni e Dispense) [COMPLETATO]**
   * *Miglioramento Utente:* Impara le tecniche di mixaggio e produzione musicale in un'area riservata organizzata in moduli didattici, video-lezioni, schede tecniche e test di autovalutazione.
   * *a) Struttura dell'area didattica e hosting dei video delle lezioni* `[front]` `[back]`
     * **Stato:** Implementata piattaforma Academy con 4 moduli (12 lezioni), player video, layout desktop senza scroll pagina, pannelli a scroll interno e capitoli accordion esclusivi: aprire un capitolo chiude quello precedente.

2. **Task 6.2: Directory & Mappa delle Scuole di Musica e Cabine DJ Partner [COMPLETATO]**
   * *Miglioramento Utente:* Trova accademie musicali fisiche, sale prove, studi di registrazione e cabine DJ a noleggio vicino a te visualizzandoli su una mappa e directory geografica interattiva.
   * *a) Integrazione directory spazi e punti d'interesse* `[front]`
     * **Stato:** Implementata la directory partner con filtri per città (Roma, Milano, Berlino, Londra), tipologia di studio, schede attrezzatura e tariffe orarie convenzionate.

3. **Task 6.3: DJ Lab con Beatmatching & Pitch Control Continuo [COMPLETATO]**
   * *Miglioramento Utente:* Esercitati sul beatmatching direttamente dal browser con un player dual-deck dotato di Pitch Slider continuo (±8%, step 0.05%), calcolo BPM live, Sync, EQ a 3 bande, Crossfader e routing audio separato per Master (Casse) e Cue (AirPods/Cuffie via Web Audio `setSinkId`).
   * *a) Motore audio e controlli di trasporto* `[front]`
     * **Stato:** Implementato il componente `DJLab.tsx` con Web Audio API, cue mix virtuale e supporto multi-output.

4. **Task 6.4: Gamification Producer, Livelli XP (01–04) & Badge Verified ✓ [COMPLETATO UI / BACKEND IN PAUSA]**
   * *Miglioramento Utente:* Scala i 4 livelli producer da Bedroom a Breakthrough, accumula XP e ottieni la spunta di verifica collegando i tuoi account social ufficiali.
   * *a) Gestione profilo e verifica social reattiva* `[front]`
     * **Stato:** Implementato `ProducerSettings.tsx` con anteprima badge, generi mostrati come chip fissi, modalità Modifica esplicita, massimo 4 generi e regole XP anti-spam. Rotella Settings disponibile accanto al nome account e al profilo pubblico Academy.
     * **Dipendenza aperta:** Backend profilo/social congelato e in pausa per selezione congiunta delle piattaforme definitive. Modalità demo locale esplicita.

---

### Sezione 7: Grafo Discovery & Motore Suggest
* **Introduzione:** Il motore di curatela e raccomandazione orientato alla musica elettronica underground (scena Minimal, Deep House, Techno).

1. **Task 7.1: Motore "Drops Suggest" & Grafo di Etichette, Party e Artisti [COMPLETATO]**
   * *Miglioramento Utente:* Esplora le connessioni tra le etichette discografiche di nicchia, i party underground e i DJ per scoprire nuove tracce affini al tuo gusto attraverso consigli intelligenti.
   * *a) Visualizzazione del grafo relazionale e drawer Suggest* `[front]`
     * **Stato:** Implementato il grafo interattivo SVG in `BrainGraph.tsx` con nodi clusterizzati, drawer laterale dei consigli con affinità stilistica e pulsante di anteprima nel Mini-Player globale.

2. **Task 7.2: Guide Editoriali pratiche per il settore musicale [COMPLETATO]**
   * *Miglioramento Utente:* Leggi guide super-sintetiche e aggiornate su come pubblicare la tua musica, stampare in vinile nel 2026, e gestire i codici ISRC/UPC per proteggere i tuoi diritti.
   * *a) Gestione dei contenuti editoriali (CMS leggero vs file statici)* `[front]` `[back]`
     * **Stato:** 8 guide editoriali complete con metadati, blocchi HTML e layout Astro SEO (`/item/...`).

3. **Task 7.3: Sistema di ricerca e applicazione foto degli articoli [DA FARE]**
   * *Miglioramento Utente:* Progettare un sistema che ricerca e applica la foto di copertina ideale agli articoli tramite selezione visiva convalidata.
   * *a) Algoritmo di ricerca immagini tramite API esterne (Unsplash/Google)* `[back]`
   * *b) Interfaccia editor per approvare, ritagliare e applicare la foto in un click* `[front]`

---

### Sezione 8: Analisi Audio & Preparazione DJ
* **Introduzione:** Utility locali e cloud per arricchire i metadati e strutturare i file audio per la riproduzione su hardware professionale.

1. **Task 8.1: Analizzatore di BPM automatico nel Cloud [COMPLETATO]**
   * *Miglioramento Utente:* Scopri all'istante il BPM esatto delle tracce caricate e inviate all'Academy grazie all'analisi automatica onset/tempo asincrona sul server.
   * *a) Algoritmo e posizionamento del calcolo del BPM* `[back]` `[front]`
     * **Stato:** Implementato modulo di calcolo BPM asincrono con endpoint `/api/v1/academy/submissions/{id}/analyze-bpm` e trigger automatico su frontend dopo upload su R2.

2. **Task 8.2: Editor Tag ID3 ed Esportazione per DJ Hardware (Rekordbox) [COMPLETATO]**
   * *Miglioramento Utente:* Correggi i tag ID3 dei tuoi brani (artista, titolo, copertina, BPM, Camelot Key) ed esporta le tracce ordinate in cartelle su una chiavetta USB pronta all'uso per i lettori CDJ professionali.
   * *a) Gestione metadati e organizzazione cartelle USB* `[front]` `[desktop]`
     * **Stato:** Implementato `RekordboxExporter.tsx` con form ID3 v2.4, formattazione pattern nomi file, cartelle per genere/artista e generazione pacchetto USB drive.

---

### Sezione 9: Archivio Attività Completate (Archivio Storico)
* **Introduzione:** Registro storico delle milestone consolidate, architetture rilasciate e miglioramenti strutturali di Drops.

1. **Task 9.1: Rilascio Drop Agent v2.4 & Pipeline DJ Ingestion (2026)**
   * *Miglioramento Utente:* Ingestion autonoma e completa di set DJ underground e tracce singole a 320kbps con analisi armonica Camelot, accompagnata da una nuova esperienza utente pulita (Home, Download, Archivio).
   * *a) Ingestion Engine Autonomo (Drop Agent)* `[back]` `[desktop]`
     * Motore CLI `drop_agent.py` con blind recognition (worker Shazamio a 15s in RAM), transition detector su Spectral Flux & RMS, download automatico full mix + tracce singole a 320k MP3/FLAC.
     * Analisi armonica `harmonic_analyzer.py`: stima tonalità musicale (Krumhansl-Kershner), mappatura Camelot Wheel (es. `8A`, `11B`), BPM e tabella `TRACKLIST.md` con regole di harmonic mixing.
     * Arricchimento Discogs & Beatport con cover art HQ 1400x1400px e iniezione ID3v2.4 completa (`APIC`, `TPUB`, `TKEY`, `TBPM`, `TSRC`).
     * Multi-DJ Exporters: Red Book CUE, Extended M3U8, Pioneer Rekordbox XML e Traktor Pro NML.
     * Upload multi-part Cloudflare R2 e sincronizzazione Supabase PostgREST (`dj_sets`, `tracks`).

2. **Task 9.2: Milestone Storiche Drops Hub, Producer Academy & DJ Lab**
   * *Miglioramento Utente:* Tieni traccia dell'affidabilità generale dell'app verificando le milestone superate e i moduli consolidati nel tempo.
   * *a) Rilascio Drops Hub, Producer Academy & DJ Lab (Agosto 2026)* `[front]` `[back]`
     * Libreria Cloud in stile Apple Music (`FolderIngestionHub.tsx`): caricamento drag & drop di intere cartelle dal desktop, viste Tutti i Brani / Cartelle / Sessioni, rinomina inline ed esportazione M3U.
     * Portale Didattico Academy LMS con 4 Moduli e 12 Lezioni.
     * DJ Lab Dual-Deck con Pitch Slider continuo (±8%, step 0.05%), Hot Cues e routing audio separato (Master Casse + AirPods Cue via `setSinkId`).
     * Ricerca Globale Spotlight (`Cmd+K` / `Ctrl+K`) con indicizzazione istantanea.
     * Rekordbox Exporter ID3v2.4 per USB drive.
     * Grafo Discovery Brain con Drawer Suggest Underground.
     * Mini-Player Audio Globale persistente.
     * Directory Partner Studi di Registrazione e Cabine DJ (Roma, Milano, Berlino, Londra).
     * Schede Artista Pubbliche con statistiche e badge `✓ Verified`.
     * Producer Settings con connessione social interattiva e selezione generi.
   * *b) Funzionalità di base consolidate* `[front]` `[back]`
     * Split dei 3 monorepo e pulizia del codice morto.
     * Risoluzione schermo nero sul mini-player.
     * Gestione rate limit di Discogs (coda pacizzata con sleep di 300ms e thread pool).
     * Estrazione IP reale del client Cloudflare per superare il blocco di rate limit.
     * Spotify OAuth iniziale con reindirizzamenti dinamici.
