import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { api } from "../api"
import DropsLanding from "./DropsLanding"

describe("DropsLanding Elite Minimalist", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it("renders elite hero headline, CLI terminal, and 3 modalities", () => {
    render(<DropsLanding />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Suono curato. Velocità nativa/i)
    expect(screen.getByText(/AUTONOMOUS MUSIC CURATION & SELECTOR ENGINE/i)).toBeInTheDocument()
    expect(screen.getByText(/git clone https:\/\/github.com\/gianco-cesarei\/Drops.git && python3 drops-agent\/drop_agent.py/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Copia Comando/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: /Drop Agent/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: /Cloud Workspace/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: /Desktop App/i })).toBeInTheDocument()
  })

  it("opens login modal when clicking Accedi or Entra nel Cloud Vault", async () => {
    const user = userEvent.setup()
    render(<DropsLanding />)

    const loginBtns = screen.getAllByRole("button", { name: /Accedi|Entra nel Cloud Vault/i })
    await user.click(loginBtns[0])

    expect(screen.getByRole("heading", { level: 3, name: /Accesso Vault/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument()
  })

  it("authenticates user and redirects to /app/download", async () => {
    vi.spyOn(api, "login").mockResolvedValueOnce({ username: "selector_one", name: "Selector One", role: "user" })
    const user = userEvent.setup()
    render(<DropsLanding />)

    const loginBtns = screen.getAllByRole("button", { name: /Accedi|Entra nel Cloud Vault/i })
    await user.click(loginBtns[0])

    await user.type(screen.getByLabelText(/^Username/i), "selector_one")
    await user.type(screen.getByLabelText(/^Password/i), "secret123")

    const submitBtn = screen.getByRole("button", { name: /Entra in Drops/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Accesso effettuato/i)).toBeInTheDocument()
    })

    const stored = window.localStorage.getItem("drops.user.v1")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.username).toBe("selector_one")
  })

  it("renders Downloader and Archive buttons when user is already logged in", () => {
    window.localStorage.setItem("drops.user.v1", JSON.stringify({ username: "solaris", name: "DJ Solaris" }))
    render(<DropsLanding />)

    const downloadLinks = screen.getAllByRole("link", { name: /Apri Downloader|Apri Console/i })
    expect(downloadLinks.length).toBeGreaterThan(0)
    expect(downloadLinks[0]).toHaveAttribute("href", "/app/download")

    const archiveLinks = screen.getAllByRole("link", { name: /Archivio/i })
    expect(archiveLinks.length).toBeGreaterThan(0)
    expect(archiveLinks[0]).toHaveAttribute("href", "/app/archive")
  })
})
