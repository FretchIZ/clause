import { useState, useEffect } from "react"
import PostCard from "./PostCard"
import { categories } from "../data/posts"

interface Post {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
  tags: string[]
  author: string
}

export default function BlogHome() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-[#333]"
              style={{ animation: "pulse-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="mb-16 animate-fade-up">
        <h1 className="text-3xl font-light tracking-tight text-white md:text-4xl">
          Webu.com
        </h1>
        <p className="mt-3 max-w-lg text-sm text-[#555] leading-relaxed">
          Notes on engineering, systems, and the craft of building software.
        </p>
      </section>

      {posts.length === 0 ? (
        <div className="animate-fade-up py-16 text-center">
          <p className="text-sm text-[#333]">No posts yet.</p>
          <a href="/admin" className="mt-2 inline-block text-xs text-[#555] transition-colors hover:text-white">
            Write the first one →
          </a>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_180px]">
          <section>
            <div className="grid gap-6">
              {posts.map((post, i) => (
                <div key={post.slug} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-8">
            <div>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#333]">Categories</h3>
              {categories.length === 0 && <p className="text-xs text-[#333]">—</p>}
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-1.5 text-xs text-[#555]">
                  <span>{cat.name}</span>
                  <span className="text-[#333]">{cat.count}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#333]">Latest</h3>
              {posts.length === 0 && <p className="text-xs text-[#333]">—</p>}
              <div className="space-y-2">
                {posts.slice(0, 5).map((post) => (
                  <a
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block py-1"
                  >
                    <p className="text-xs text-[#555] transition-colors group-hover:text-white leading-snug">
                      {post.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
