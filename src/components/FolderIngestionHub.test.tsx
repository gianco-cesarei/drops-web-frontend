import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import FolderIngestionHub from './FolderIngestionHub'

describe('FolderIngestionHub', () => {
  it('renderizza il pannello di archivio e la lista delle cartelle indicizzate con Session 001', () => {
    render(<FolderIngestionHub />)
    expect(screen.getAllByText(/CARTELLE/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Session 001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Houghton Morning Session 2026').length).toBeGreaterThan(0)
  })

  it('mostra le tracce e i metadati quando si clicca su una cartella', async () => {
    render(<FolderIngestionHub />)
    const folderCards = screen.getAllByText('Houghton Morning Session 2026')
    await userEvent.click(folderCards[0])

    expect(screen.getByText('Tremolo Flow')).toBeInTheDocument()
    expect(screen.getByText('Ricardo Villalobos')).toBeInTheDocument()
    expect(screen.getAllByText('126').length).toBeGreaterThan(0)
  })

  it('filtra le cartelle tramite la barra di ricerca', async () => {
    render(<FolderIngestionHub />)
    const searchInput = screen.getByPlaceholderText(/Cerca cartelle/i)
    await userEvent.type(searchInput, 'Vinyl')

    expect(screen.getByText('Underground Vinyl Rips 2026')).toBeInTheDocument()
    expect(screen.queryByText('Houghton Morning Session 2026')).not.toBeInTheDocument()
  })

  it('permette di creare una nuova sessione di download (es. Session 002)', async () => {
    render(<FolderIngestionHub />)
    const newSessionBtn = screen.getByText(/Nuova Cartella/i)
    await userEvent.click(newSessionBtn)

    expect(screen.getAllByText('Session 002').length).toBeGreaterThan(0)
  })
})
