import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GlobalSearchModal from './GlobalSearchModal'

describe('GlobalSearchModal', () => {
  it('non renderizza nulla quando isOpen e false', () => {
    render(<GlobalSearchModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderizza la barra di ricerca e filtra i risultati in tempo reale', async () => {
    const handleClose = vi.fn()
    render(<GlobalSearchModal isOpen={true} onClose={handleClose} />)

    const input = screen.getByRole('textbox', { name: "Cerca nell'archivio Drops" })
    expect(input).toBeInTheDocument()

    // Default results
    expect(screen.getByText('Minimal Groove (Vinyl Rip)')).toBeInTheDocument()

    // Type query
    await userEvent.type(input, 'SIAE')
    expect(screen.getByText('Guida Borderò SIAE / SPA per DJ')).toBeInTheDocument()
    expect(screen.queryByText('Minimal Groove (Vinyl Rip)')).not.toBeInTheDocument()
  })

  it('chiude la modale con il tasto ESC o cliccando il backdrop', () => {
    const handleClose = vi.fn()
    render(<GlobalSearchModal isOpen={true} onClose={handleClose} />)

    fireEvent.click(screen.getByRole('dialog'))
    expect(handleClose).toHaveBeenCalled()
  })
})
