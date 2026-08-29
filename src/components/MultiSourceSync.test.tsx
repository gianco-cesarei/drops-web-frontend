import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MultiSourceSync from './MultiSourceSync'

describe('MultiSourceSync', () => {
  it('renderizza il form di importazione e le tracce demo iniziali', () => {
    render(<MultiSourceSync />)
    expect(screen.getByText('SoundCloud & YouTube Crate Sync')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Incolla link SoundCloud/i)).toBeInTheDocument()
    expect(screen.getByText('Subtle Modulations (Live Cut)')).toBeInTheDocument()
  })

  it('permette di caricare un preset demo alternativo (YouTube Vinyl Rips)', async () => {
    render(<MultiSourceSync />)
    const ytPresetBtn = screen.getByRole('button', { name: /Underground Vinyl Rips 2026/i })
    await userEvent.click(ytPresetBtn)

    expect(screen.getByText('Rare Dubplate 001')).toBeInTheDocument()
    expect(screen.getByText(/Caricato set preset:/i)).toBeInTheDocument()
  })

  it('sincronizza le tracce selezionate nel Crate personale', async () => {
    render(<MultiSourceSync />)
    const syncBtn = screen.getByRole('button', { name: /Importa nel Crate DJ Lab/i })
    await userEvent.click(syncBtn)

    expect(screen.getByRole('status')).toHaveTextContent(/sincronizzate nel Crate personale/i)
    expect(screen.getAllByText('✓ Nel Crate').length).toBeGreaterThan(0)
  })
})
