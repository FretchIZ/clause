import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"

interface Post {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
  tags: string[]
  author: string
  content: string
}

function renderContent(text: string) {
  const lines = text.split("\n")
  const els: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i])
        i++
      }
      els.push(
        <div key={`code-${i}`} className="my-6 overflow-hidden rounded border border-[#111]">
          {lang && (
            <div className="flex items-center justify-between bg-[#0d0d0d] px-4 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#444]">{lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code.join("\n"))}
                className="text-[10px] text-[#444] transition-colors hover:text-white"
              >
                Copy
              </button>
            </div>
          )}
          <pre className="overflow-x-auto bg-[#080808] p-4 font-mono text-sm leading-relaxed text-[#aaa]">{code.join("\n")}</pre>
        </div>,
      )
    } else if (line.startsWith("## ")) {
      els.push(<h2 key={i} className="mb-4 mt-10 text-lg font-medium text-white">{line.slice(3)}</h2>)
    } else if (line.startsWith("### ")) {
      els.push(<h3 key={i} className="mb-3 mt-8 text-base font-medium text-white">{line.slice(4)}</h3>)
    } else if (line.startsWith("- ")) {
      els.push(<li key={i} className="ml-5 list-disc text-sm text-[#999] leading-relaxed">{formatInline(line.slice(2))}</li>)
    } else if (line === "") {
      els.push(<div key={i} className="h-4" />)
    } else {
      els.push(<p key={i} className="text-sm text-[#999] leading-relaxed">{formatInline(line)}</p>)
    }
    i++
  }
  return els
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="rounded bg-[#141414] px-1.5 py-0.5 font-mono text-sm text-orange-400">{p.slice(1, -1)}</code>
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} className="font-medium text-white">{p.slice(2, -2)}</strong>
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i} className="text-[#999]">{p.slice(1, -1)}</em>
    return p
  })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/posts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((d) => setPost(d.post))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-[#333]" style={{ animation: "pulse-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-up">
        <p className="text-sm text-[#555]">Post not found</p>
        <Link to="/" className="mt-4 text-xs text-[#333] transition-colors hover:text-white">← Home</Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-10 flex items-center gap-2 text-xs text-[#333]">
        <Link to="/" className="transition-colors hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-[#555]">{post.category}</span>
      </div>

      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3 text-xs text-[#555]">
          <span>{post.category}</span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>{post.date}</span>
        </div>

        <h1 className="text-2xl font-medium leading-snug text-white md:text-3xl">{post.title}</h1>

        <p className="mt-3 text-sm text-[#666] leading-relaxed">{post.description}</p>

        <div className="mt-6 flex items-center gap-4 text-xs text-[#444]">
          <span>{post.author}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#333]">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      <div className="leading-relaxed">{renderContent(post.content || "")}</div>

      <div className="mt-16 border-t border-[#111] pt-6">
        <Link to="/" className="text-xs text-[#333] transition-colors hover:text-white">← All posts</Link>
      </div>
    </article>
  )
}
