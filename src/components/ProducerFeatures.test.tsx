import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import AcademyHub from './AcademyHub'
import ProducerSettings from './ProducerSettings'

describe('producer features', () => {
  beforeEach(() => window.localStorage.clear())

  it('non finge disponibilita video e download Academy', () => {
    render(<AcademyHub user={{ username: 'alex', name: 'Alex Rossi' }} />)
    expect(screen.getByRole('button', { name: 'Video non ancora disponibile' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Non disponibile' })[0]).toBeDisabled()
  })

  it('mostra un solo capitolo Academy alla volta', async () => {
    render(<AcademyHub user={{ username: 'alex', name: 'Alex Rossi' }} />)
    const first = screen.getByRole('button', { name: /M1.*IDENTITY/i })
    const second = screen.getByRole('button', { name: /M2.*DRUMS/i })
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(second).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('button', { name: /Lezione 1.1/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lezione 2.1/i })).toBeInTheDocument()
  })

  it('espone gear compatto verso impostazioni', () => {
    render(<AcademyHub user={{ username: 'alex' }} />)
    expect(screen.getByRole('link', { name: 'Apri impostazioni profilo' })).toHaveAttribute('href', '/app/settings')
  })

  it('valida file review e non dichiara upload completato', async () => {
    render(<AcademyHub user={{ username: 'alex', name: 'Alex Rossi' }} />)
    await userEvent.click(screen.getByRole('tab', { name: /Track Review/i }))
    const input = screen.getByLabelText(/Seleziona file dal computer/i)
    fireEvent.change(input, { target: { files: [new File(['text'], 'note.txt', { type: 'text/plain' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Formato non supportato')
    expect(screen.queryByText(/inviata con successo/i)).not.toBeInTheDocument()
  })

  it('rimuove badge quando ultimo social demo viene scollegato', async () => {
    render(<ProducerSettings user={{ username: 'alex' }} />)
    expect(screen.getByText('✓ Verified')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Disconnetti' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Disconnetti' }))
    expect(screen.getByText('Non Verificato')).toBeInTheDocument()
  })

  it('mostra generi fissi finche utente non sceglie Modifica', async () => {
    render(<ProducerSettings user={{ username: 'alex' }} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Modifica' }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(8)
    await userEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
