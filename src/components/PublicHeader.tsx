import { useEffect, useState } from 'react'
import { api } from '../api'
import { publicNavigation } from '../lib/routes'

export default function PublicHeader({ pathname = '/' }: { pathname?: string }) {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const cached = window.localStorage.getItem('drops.user.v1')
      const demo = window.localStorage.getItem('drops.demo-session.v1')
      return Boolean(cached || demo === 'active')
    } catch {
      return false
    }
  })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    api.me()
      .then(() => { if (active) setAuthenticated(true) })
      .catch(() => {
        if (active) {
          try {
            const cached = window.localStorage.getItem('drops.user.v1')
            const demo = window.localStorage.getItem('drops.demo-session.v1')
            if (cached || demo === 'active') {
              setAuthenticated(true)
              return
            }
          } catch {}
          setAuthenticated(false)
        }
      })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  const accountHref = authenticated ? publicNavigation.download : publicNavigation.login
  const accountLabel = authenticated ? 'Area privata' : 'Login'
  const accountLink = <a className="public-auth-link" href={accountHref} aria-busy={checking}>{accountLabel}</a>

  return (
    <header className="public-header clean-public-header">
      <div className="public-header-inner">
        <a className="public-logo" href="/" aria-label="Drops home">
          Drops<span>.</span>
        </a>
        <div className="public-header-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/app/download" className="public-nav-link" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Download</a>
          <a href="/app/archive" className="public-nav-link" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Archivio</a>
        </div>
        <div className="public-header-right">
          {accountLink}
        </div>
      </div>
    </header>
  )
}
