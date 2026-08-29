import { useEffect, useState } from 'react'
import { api } from '../api'
import { publicNavigation } from '../lib/routes'

export default function PublicHeader({ pathname = '/' }: { pathname?: string }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    api.me()
      .then(() => { if (active) setAuthenticated(true) })
      .catch(() => { if (active) setAuthenticated(false) })
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
        <div className="public-header-right">
          {accountLink}
        </div>
      </div>
    </header>
  )
}
