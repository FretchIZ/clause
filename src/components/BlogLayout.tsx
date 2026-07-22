import { Link, useLocation } from "react-router-dom"

const NAV = [
  { label: "Home", path: "/" },
  { label: "Admin", path: "/admin" },
]

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

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
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[#555]">
          <p>© 2026 TechBlog. Built with React, TypeScript & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  )
}
