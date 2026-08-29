import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DownloadArchiveModal from './DownloadArchiveModal'

describe('DownloadArchiveModal', () => {
  const mockItems = [
    { id: '1', title: 'Minimal Flow', artist: 'Alex Rossi', bpm: 124, source: 'https://soundcloud.com/alex/flow', sourceUrl: 'https://soundcloud.com/alex/flow' },
    { id: '2', title: 'Deep Tech Tool', artist: 'Marco Donati', bpm: 126, source: 'https://youtube.com/watch?v=123', sourceUrl: 'https://youtube.com/watch?v=123' },
  ]

  it('renderizza la modale dell archivio link con le tracce storiche', () => {
    render(<DownloadArchiveModal isOpen={true} onClose={vi.fn()} items={mockItems} />)
    expect(screen.getByText(/Archivio Storico & Link Utilizzati/i)).toBeInTheDocument()
    expect(screen.getByText('Minimal Flow')).toBeInTheDocument()
    expect(screen.getByText('Deep Tech Tool')).toBeInTheDocument()
  })

  it('filtra le tracce per titolo o link nella barra di ricerca archivio', async () => {
    render(<DownloadArchiveModal isOpen={true} onClose={vi.fn()} items={mockItems} />)
    const input = screen.getByPlaceholderText(/Filtra per titolo, artista, o link/i)
    await userEvent.type(input, 'Alex')

    expect(screen.getByText('Minimal Flow')).toBeInTheDocument()
    expect(screen.queryByText('Deep Tech Tool')).not.toBeInTheDocument()
  })

  it('rilancia il download quando si clicca Riscarica', async () => {
    const handleRequeue = vi.fn()
    const handleClose = vi.fn()
    render(<DownloadArchiveModal isOpen={true} onClose={handleClose} items={mockItems} onRequeue={handleRequeue} />)

    const requeueBtns = screen.getAllByRole('button', { name: /Riscarica/i })
    await userEvent.click(requeueBtns[0])

    expect(handleRequeue).toHaveBeenCalledWith('https://soundcloud.com/alex/flow')
    expect(handleClose).toHaveBeenCalled()
  })
})
