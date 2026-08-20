import React from 'react'

export default function DeveloperRoadmap() {
  return (
    <main className="developer-roadmap-page" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#1a1a1a', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px', borderBottom: '2px solid #1a1a1a', paddingBottom: '8px', textTransform: 'uppercase' }}>
        🔨 Developer Cave
      </h1>
      
      <p style={{ fontStyle: 'italic', marginBottom: '32px', color: '#666' }}>
        "Simple roadmap. Caveman speech. Hard rules."
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '4px', marginBottom: '16px', fontWeight: 'bold' }}>
          Done (Completed)
        </h2>
        <ul style={{ listStyleType: 'square', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Split Monorepo:</strong> Now 3 clean repos. No more big mess.</li>
          <li><strong>Clean git:</strong> Dead branches gone. Only clean <code>main</code> branch.</li>
          <li><strong>Clean space:</strong> Old product folder deleted. Disk happy.</li>
          <li><strong>Tauri v2 pure:</strong> Python backend dead on desktop. App loads local static HTML. Fast.</li>
          <li><strong>Black screen fix:</strong> CSS missing relative position. Play badge cover whole screen. Now fixed. Cover size locked to 56x56.</li>
          <li><strong>Rate Limit fix:</strong> Real client IP extracted from Cloudflare headers. No more shared block.</li>
          <li><strong>Spotify oauth:</strong> Dynamic redirects based on headers. Works on web worker and local.</li>
          <li><strong>Paced queue:</strong> Max 2 parallel requests to Discogs with 300ms sleep. Backend thread pool safe. No more Discogs 429.</li>
          <li><strong>Agent rules:</strong> <code>AGENTS.md</code> created in all 3 repos. AI agents read rules, behave same.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', background: '#ffebeb', color: '#c21d1d', padding: '6px 12px', borderRadius: '4px', marginBottom: '16px', fontWeight: 'bold' }}>
          Todo (Next Steps)
        </h2>
        <ul style={{ listStyleType: 'square', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>
            <strong>Database Persistence:</strong> SQLite in <code>/tmp</code> dies on deploy.
            <br />
            <span style={{ color: '#666' }}>→ Action: Connect Supabase (Postgres) or Cloudflare D1. Save sessions and tracks forever.</span>
          </li>
          <li>
            <strong>Tauri Rust commands:</strong> Desktop static UI cannot save local files.
            <br />
            <span style={{ color: '#666' }}>→ Action: Write Rust handlers in Tauri <code>main.rs</code> for folder pick and direct download file write.</span>
          </li>
          <li>
            <strong>Cloud Storage (R2/S3):</strong> Save music files in cloud.
            <br />
            <span style={{ color: '#666' }}>→ Action: Configure R2 bucket. Save downloaded MP3s.</span>
          </li>
          <li>
            <strong>BPM in Cloud:</strong> Get BPM without local sidecars.
            <br />
            <span style={{ color: '#666' }}>→ Action: Slice song snippet in client/backend, calculate BPM remotely, save results.</span>
          </li>
          <li>
            <strong>Pre-player:</strong> Web audio player.
            <br />
            <span style={{ color: '#666' }}>→ Action: Implement native player in frontend to stream from cloud bucket (also for YouTube without video).</span>
          </li>
          <li>
            <strong>Tags & Versions:</strong> Track codebase releases.
            <br />
            <span style={{ color: '#666' }}>→ Action: Git tag repos. Add version number in footer of the site.</span>
          </li>
        </ul>
      </section>
    </main>
  )
}
