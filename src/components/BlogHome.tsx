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
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#333] border-t-orange-500" />
      </div>
    )
  }

  const featured = posts.filter(() => false)
  const recent = posts

  return (
    <>
      {/* Hero */}
      <section className="mb-12">
        <div className="mb-2 inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
          Technical Blog
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Insights on engineering
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[#888]">
          Deep dives into React, TypeScript, system design, DevOps, and
          performance — written by engineers for engineers.
        </p>
      </section>

      {posts.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[#555]">No posts yet.</p>
          <a href="/admin" className="mt-2 inline-block text-sm text-orange-400 hover:underline">
            Create the first post →
          </a>
        </div>
      )}

      {/* Featured posts */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-sm uppercase tracking-widest text-[#555]">Featured</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((post) => (
              <PostCard key={post.slug} post={post} featured />
            ))}
          </div>
        </section>
      )}

      <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_220px]">
        {/* Recent posts */}
        <section>
          {recent.length > 0 && (
            <h2 className="mb-6 text-sm uppercase tracking-widest text-[#555]">All Posts</h2>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            {recent.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h3 className="mb-4 text-sm uppercase tracking-widest text-[#555]">Categories</h3>
            <div className="space-y-1">
              {categories.length === 0 && (
                <p className="px-3 py-2 text-sm text-[#555]">None yet</p>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#888] transition-colors hover:bg-[#111] hover:text-white"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-[#555]">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm uppercase tracking-widest text-[#555]">Latest</h3>
            <div className="space-y-3">
              {posts.length === 0 && (
                <p className="px-3 py-2 text-sm text-[#555]">No posts yet</p>
              )}
              {posts.slice(0, 5).map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg px-3 py-2 transition-colors hover:bg-[#111]"
                >
                  <p className="text-sm text-white leading-snug">{post.title}</p>
                  <p className="mt-0.5 text-xs text-[#555]">{post.date}</p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
