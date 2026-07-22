import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

interface Post {
  slug: string
  title: string
  description: string
  category: string
  readTime: string
  tags: string[]
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Post[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setSelectedIdx(0)
      fetch("/api/posts")
        .then((r) => r.json())
        .then((d) => setAllPosts(d.posts || []))
        .catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const matches = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    )
    setResults(matches)
    setSelectedIdx(0)
  }, [query, allPosts])

  function select(slug: string) {
    onClose()
    navigate(`/blog/${slug}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === "Enter" && results[selectedIdx]) { select(results[selectedIdx].slug) }
    else if (e.key === "Escape") { onClose() }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded border border-[#1a1a1a] bg-[#0d0d0d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#111] px-4">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#444]">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search posts..."
            className="flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-[#444]"
          />
          <kbd className="rounded border border-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#444]">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto p-1.5">
            <p className="px-2 py-1 text-[10px] text-[#444]">{results.length} results</p>
            {results.map((post, i) => (
              <button
                key={post.slug}
                onClick={() => select(post.slug)}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`flex w-full items-start gap-3 rounded px-3 py-2 text-left transition-colors ${i === selectedIdx ? "bg-[#141414]" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{post.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#555]">{post.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-[#555]">{post.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="p-8 text-center text-xs text-[#444]">No posts found</div>
        )}
      </div>
    </div>
  )
}
