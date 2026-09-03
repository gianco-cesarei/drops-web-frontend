import { render, screen, waitFor } from '@testing-library/react'
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

  it('permette di creare una nuova cartella con nome', async () => {
    render(<FolderIngestionHub />)
    await userEvent.click(screen.getByText(/Nuova Cartella/i))
    const input = screen.getByPlaceholderText(/Nome nuova cartella/i)
    await userEvent.type(input, 'Cartella Test 42{Enter}')

    expect(screen.getAllByText('Cartella Test 42').length).toBeGreaterThan(0)
  })

  it('non ha pulsante play duplicato nella colonna delle azioni (.arch-row-act)', async () => {
    const { container } = render(<FolderIngestionHub />)
    const folderCards = screen.getAllByText('Houghton Morning Session 2026')
    await userEvent.click(folderCards[0])

    const actionCols = container.querySelectorAll('.arch-row-act')
    expect(actionCols.length).toBeGreaterThan(0)
    actionCols.forEach((col) => {
      // Non ci deve essere un pulsante con '▶' o '❚❚' dentro la colonna azioni
      const buttons = col.querySelectorAll('button')
      buttons.forEach((btn) => {
        expect(btn.textContent).not.toContain('▶')
        expect(btn.textContent).not.toContain('❚❚')
      })
    })
  })

  it('fai il toggle play/pause quando si clicca sul pulsante play/indice della traccia', async () => {
    const { container } = render(<FolderIngestionHub />)
    const folderCards = screen.getAllByText('Houghton Morning Session 2026')
    await userEvent.click(folderCards[0])

    const idxBtns = container.querySelectorAll('.arch-idx-btn')
    expect(idxBtns.length).toBeGreaterThan(0)

    // Clicca il primo per avviare la riproduzione
    await userEvent.click(idxBtns[0])
    await waitFor(() => {
      const firstRow = container.querySelector('.arch-track-row')
      expect(firstRow?.classList.contains('is-playing')).toBe(true)
    })

    // Clicca nuovamente lo stesso pulsante per mettere in PAUSA/STOP
    await userEvent.click(idxBtns[0])
    await waitFor(() => {
      const firstRow = container.querySelector('.arch-track-row')
      expect(firstRow?.classList.contains('is-playing')).toBe(false)
    })
  })
})
