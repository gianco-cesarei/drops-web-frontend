import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import DropsLanding from "./DropsLanding"

describe("DropsLanding", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it("renders hero headline, CUE headphone indicator, and CTA buttons when anonymous", () => {
    render(<DropsLanding />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Manage your/i)
    expect(screen.getByLabelText(/Indicatore CUE Cuffia DJ/i)).toBeInTheDocument()
    expect(screen.getByText("CUE")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /^Iscriviti$/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: /^Accedi$/i }).length).toBeGreaterThan(0)
  })

  it("opens registration modal when clicking Iscriviti", async () => {
    const user = userEvent.setup()
    render(<DropsLanding />)

    const registerBtns = screen.getAllByRole("button", { name: /^Iscriviti$/i })
    await user.click(registerBtns[0])

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole("heading", { level: 3, name: /Crea il tuo Account/i })).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/^Email/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/^Username/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/^Password/i)).toBeInTheDocument()
  })

  it("validates registration form and registers user into localStorage with success feedback", async () => {
    const user = userEvent.setup()
    render(<DropsLanding />)

    const registerBtns = screen.getAllByRole("button", { name: /^Iscriviti$/i })
    await user.click(registerBtns[0])
    const dialog = screen.getByRole("dialog")

    // Fill form
    await user.type(within(dialog).getByLabelText(/^Email/i), "dj_neon@test.com")
    await user.type(within(dialog).getByLabelText(/^Username/i), "dj_neon")
    await user.type(within(dialog).getByLabelText(/^Password/i), "superpass")

    // Click submit
    const submitBtn = dialog.querySelector('button[type="submit"]') as HTMLButtonElement
    await user.click(submitBtn)

    await waitFor(() => {
      expect(within(dialog).getByText(/Benvenuto a bordo, dj_neon!/i)).toBeInTheDocument()
    })

    const stored = window.localStorage.getItem("drops.user.v1")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.username).toBe("dj_neon")
    expect(parsed.email).toBe("dj_neon@test.com")
  })

  it("allows switching between register and login tabs inside modal", async () => {
    const user = userEvent.setup()
    render(<DropsLanding />)

    const registerBtns = screen.getAllByRole("button", { name: /^Iscriviti$/i })
    await user.click(registerBtns[0])
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByRole("heading", { level: 3, name: /Crea il tuo Account/i })).toBeInTheDocument()

    // Switch to login tab
    const tabs = within(dialog).getAllByRole("button", { name: /^Accedi$/i })
    await user.click(tabs[0])
    expect(within(dialog).getByRole("heading", { level: 3, name: /Accedi a Drops/i })).toBeInTheDocument()

    // Switch back to register tab
    const regTabs = within(dialog).getAllByRole("button", { name: /^Iscriviti$/i })
    await user.click(regTabs[0])
    expect(within(dialog).getByRole("heading", { level: 3, name: /Crea il tuo Account/i })).toBeInTheDocument()
  })

  it("renders Downloader and Archive buttons when user is already logged in", () => {
    window.localStorage.setItem("drops.user.v1", JSON.stringify({ username: "solaris", name: "DJ Solaris" }))
    render(<DropsLanding />)

    const downloadLinks = screen.getAllByRole("link", { name: /Apri Downloader/i })
    expect(downloadLinks.length).toBeGreaterThan(0)
    expect(downloadLinks[0]).toHaveAttribute("href", "/app/download")

    const archiveLinks = screen.getAllByRole("link", { name: /Archivio/i })
    expect(archiveLinks.length).toBeGreaterThan(0)
    expect(archiveLinks[0]).toHaveAttribute("href", "/app/archive")
  })
})
