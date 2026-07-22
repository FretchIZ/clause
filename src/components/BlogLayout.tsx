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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white">
              T
            </div>
            <span className="text-lg font-semibold text-white">TechBlog</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#1a1a1a] px-3 py-1.5 text-xs text-[#555] transition-colors hover:border-[#333] hover:text-white"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    location.pathname === n.path
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#888] hover:bg-[#141414] hover:text-white"
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

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[#555]">
          <p>© 2026 TechBlog. Built with React, TypeScript & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  )
}
