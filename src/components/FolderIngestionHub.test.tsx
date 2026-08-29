import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FolderIngestionHub from './FolderIngestionHub'

describe('FolderIngestionHub', () => {
  it('renderizza il pannello di caricamento e la lista delle cartelle indicizzate', () => {
    render(<FolderIngestionHub />)
    expect(screen.getByText(/Carica e Organizza Cartelle nel Cloud/i)).toBeInTheDocument()
    expect(screen.getByText('Houghton Morning Session 2026')).toBeInTheDocument()
    expect(screen.getByText('Underground Vinyl Rips 2026')).toBeInTheDocument()
  })

  it('mostra le tracce e i metadati quando si clicca su una cartella', async () => {
    render(<FolderIngestionHub />)
    const folderCard = screen.getByText('Houghton Morning Session 2026')
    await userEvent.click(folderCard)

    expect(screen.getByText('Tremolo Flow')).toBeInTheDocument()
    expect(screen.getByText('Ricardo Villalobos')).toBeInTheDocument()
    expect(screen.getByText('126 BPM')).toBeInTheDocument()
  })

  it('filtra le cartelle tramite la barra di ricerca', async () => {
    render(<FolderIngestionHub />)
    const searchInput = screen.getByPlaceholderText(/Cerca cartella o traccia/i)
    await userEvent.type(searchInput, 'Vinyl')

    expect(screen.getByText('Underground Vinyl Rips 2026')).toBeInTheDocument()
    expect(screen.queryByText('Houghton Morning Session 2026')).not.toBeInTheDocument()
  })
})
