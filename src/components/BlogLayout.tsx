import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import SearchDialog from "./SearchDialog"

const NAV = [
  { label: "Home", path: "/" },
  { label: "Admin", path: "/admin" },
]

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ccc]">
      <header className="sticky top-0 z-50 border-b border-[#111] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-base font-medium tracking-tight text-white transition-colors group-hover:text-cyan-400">
              Webu.com
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-md border border-[#1a1a1a] px-2.5 py-1.5 text-xs text-[#555] transition-all hover:border-[#333] hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Search
              <kbd className="hidden rounded border border-[#1a1a1a] px-1 py-0.5 text-[10px] sm:inline">/</kbd>
            </button>

            <nav className="flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.path}
                  to={n.path}
                  className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    location.pathname === n.path
                      ? "bg-[#141414] text-white"
                      : "text-[#555] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="mx-auto max-w-5xl px-4 py-12">{children}</main>

      <footer className="border-t border-[#111] py-10">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-[#333]">
          <p>© 2026 Webu.com</p>
        </div>
      </footer>
    </div>
  )
}
