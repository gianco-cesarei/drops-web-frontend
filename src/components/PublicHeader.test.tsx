import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicHeader from './PublicHeader'

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('PublicHeader', () => {
  it('mostra Login senza sessione e mantiene errori sessione silenziosi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({}, 401)))
    render(<PublicHeader />)
    await waitFor(() => expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('aria-busy', 'false'))
    expect(screen.getByLabelText('Drops home')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mantiene API offline silenziosa e mostra Login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('offline')))
    render(<PublicHeader />)
    await waitFor(() => expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('aria-busy', 'false'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra Area privata verso download solo dopo sessione valida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({ user: { username: 'dj' } })))
    render(<PublicHeader />)
    expect(screen.queryByRole('link', { name: 'Area privata' })).not.toBeInTheDocument()
    const link = await screen.findByRole('link', { name: 'Area privata' })
    expect(link).toHaveAttribute('href', '/app/download')
  })

  it('mostra i link di navigazione con Archivio per primo e Download per secondo', () => {
    render(<PublicHeader />)
    const links = screen.getAllByRole('link', { name: /Archivio|Download/ })
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['/app/archive', '/app/download'])
  })
})
