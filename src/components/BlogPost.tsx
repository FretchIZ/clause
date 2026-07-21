import { useParams, Link } from "react-router-dom"
import { posts } from "../data/posts"

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
        <div
          key={`code-${i}`}
          className="my-4 overflow-hidden rounded-lg border border-[#1a1a1a]"
        >
          {lang && (
            <div className="flex items-center justify-between bg-[#0d0d0d] px-4 py-1.5">
              <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
                {lang}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(code.join("\n"))}
                className="text-xs text-[#555] transition-colors hover:text-orange-400"
              >
                Copy
              </button>
            </div>
          )}
          <pre className="overflow-x-auto bg-[#080808] p-4 font-mono text-sm leading-relaxed text-[#ccc]">
            {code.join("\n")}
          </pre>
        </div>,
      )
    } else if (line.startsWith("## ")) {
      els.push(
        <h2
          key={i}
          className="mb-3 mt-8 text-xl font-semibold text-white"
        >
          {line.slice(3)}
        </h2>,
      )
    } else if (line.startsWith("### ")) {
      els.push(
        <h3
          key={i}
          className="mb-2 mt-6 text-lg font-medium text-white"
        >
          {line.slice(4)}
        </h3>,
      )
    } else if (line.startsWith("- ")) {
      els.push(
        <li
          key={i}
          className="ml-5 list-disc text-[#bbb] leading-relaxed"
        >
          {formatInline(line.slice(2))}
        </li>,
      )
    } else if (line === "") {
      els.push(<div key={i} className="h-3" />)
    } else {
      els.push(
        <p key={i} className="text-[#bbb] leading-relaxed">
          {formatInline(line)}
        </p>,
      )
    }
    i++
  }
  return els
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code
          key={i}
          className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-sm text-orange-400"
        >
          {p.slice(1, -1)}
        </code>
      )
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-white">
          {p.slice(2, -2)}
        </strong>
      )
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i} className="text-[#bbb]">{p.slice(1, -1)}</em>
    return p
  })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h1 className="text-2xl font-bold text-white">Post not found</h1>
        <p className="mt-2 text-[#888]">The post you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          ← Back to home
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-[#555]">
        <Link to="/" className="transition-colors hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#888]">{post.category}</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400">
            {post.category}
          </span>
          <span className="text-sm text-[#555]">{post.readTime}</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-lg text-[#888] leading-relaxed">
          {post.description}
        </p>

        <div className="mt-6 flex items-center gap-4 text-sm text-[#555]">
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.date}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#141414] px-2.5 py-1 text-xs text-[#666]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="prose-container leading-relaxed">
        {renderContent(post.content)}
      </div>

      {/* Footer */}
      <div className="mt-16 border-t border-[#1a1a1a] pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-[#555] transition-colors hover:text-white"
        >
          ← Back to all posts
        </Link>
      </div>
    </article>
  )
}
