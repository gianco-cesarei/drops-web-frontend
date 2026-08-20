# AGENTS.md — drops-web-frontend

Regole di casa lette da ogni agente (Claude, Codex, Cursor, Gemini) che apre questo repo.
Repo: **drops-web-frontend** (github.com/gianco-cesarei/drops-web-frontend) — la web app Astro
+ Cloudflare Worker. È qui che vivono Discovery, Mappa, Download UI e area account.

Ecosistema Drops = 3 repo: `drops-web-frontend` (questo), `drops-web-backend` (FastAPI/Render),
`drops-desktop` (Tauri v2). Non mischiarli: una sessione = un repo.

---

## 1. Gate di implementazione (obbligatorio)
Nessuna feature entra su `main` senza questi 5 passi:
1. **Ricognizione** — subagent Explore (read-only): capire file e pattern esistenti, riusare ciò che c'è.
2. **Design** — subagent Plan (o plan mode): approccio approvato prima di scrivere codice.
3. **Implementazione** — su branch `feat/*` o `fix/*`. Mai commit diretti su `main`.
4. **Verifica** — review + test: `npm run build`, `vitest`, `node --test worker/index.test.mjs`.
5. **Rilascio** — merge + tag versione (vedi §3) + voce CHANGELOG.

## 2. Mappa agenti / skill → lavoro
- Ricognizione/scope incerto → **Explore** · Design/architettura → **Plan**
- Implementazione isolata → **general-purpose**; multi-file → agente principale su branch
- Domande Claude Code/SDK/API → **claude-code-guide**
- Deliverable → skill **docx/pdf/pptx/xlsx** · grafici → **dataviz** · marketing → **marketing:\*** · UI/UX → **design:\***

## 3. Versionamento
Linea semver di questo repo: `drops-web` parte da `v0.1.0` → `v1.0.0` al lancio pubblico.
`feat`→minor, `fix`/chore→patch, breaking→major. Ogni release = tag + CHANGELOG.
La versione va mostrata nel **footer** (da `package.json` + short SHA git, iniettata a build-time
in `astro.config.mjs`).

## 4. Stack & ambiente
- Astro (`src/`) → build in `dist/`, servita dal Worker Cloudflare (`worker/index.js`, `wrangler.jsonc`).
- API su backend separato (repo drops-web-backend, `mp3-ytb.onrender.com`).
- Account/dati = **Supabase piano FREE** (auth + metadati SOLO). File musica su **Cloudflare R2**
  (egress $0), serviti via Worker. Mai file audio su Supabase (per restare nel free).
- Segreti mai nel repo: solo env/secret store. `cookies.txt`, `.env`, chiavi → gitignore.

## 5. Brand & editoriale (Radar, Brain, contenuti)
Drops = cultura musica elettronica curata, di nicchia, di qualità.
**Generi accettati:** House (Deep/Classic/Micro) · Minimal House/Techno · Tech House underground ·
Berlin Techno (Dub/Deep) · Detroit Techno.
**MAI:** Tekno/Free Party/Hardtek/Tribe/Frenchcore/Raggatek · Drum&Bass/Jungle/Liquid/Neurofunk ·
EDM commerciale/mainstage.
**Stile:** underground, minimalista, elegante, dark mode alto contrasto · foto autentiche, flyer
reali, artwork di release — NO poster generici da AI.
