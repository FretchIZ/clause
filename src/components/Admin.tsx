import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

interface Post {
  slug: string
  title: string
  description: string
  category: string
  date: string
  readTime: string
  tags: string[]
  author: string
}

export default function Admin() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [editSlug, setEditSlug] = useState<string | null>(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    try {
      const res = await fetch("/api/posts")
      const data = await res.json()
      setPosts(data.posts)
    } catch (e) {
      console.error("Failed to fetch posts", e)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      title,
      description,
      category: category || "General",
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    }

    if (editSlug) {
      await fetch(`/api/posts/${editSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }

    resetForm()
    fetchPosts()
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this post?")) return
    await fetch(`/api/posts/${slug}`, { method: "DELETE" })
    fetchPosts()
  }

  function handleEdit(post: Post) {
    setTitle(post.title)
    setDescription(post.description)
    setCategory(post.category)
    setContent(post.content || "")
    setTags((post.tags || []).join(", "))
    setEditSlug(post.slug)
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setCategory("")
    setContent("")
    setTags("")
    setEditSlug(null)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
            Admin
          </div>
          <h1 className="text-3xl font-bold text-white">Manage Posts</h1>
        </div>
        <Link to="/" className="text-sm text-[#555] transition-colors hover:text-white">
          ← Back to blog
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-10 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {editSlug ? "Edit Post" : "New Post"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[#888]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[#888]">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#888]">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="React, TypeScript, etc."
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#888]">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, Hooks, Performance"
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[#888]">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            {editSlug ? "Update" : "Create"} Post
          </button>
          {editSlug && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#1a1a1a] px-4 py-2 text-sm text-[#888] transition-colors hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Posts list */}
      {loading ? (
        <p className="text-center text-[#555]">Loading...</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-5 py-4 transition-colors hover:border-[#333]"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-white">{post.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#555]">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="rounded-lg border border-[#1a1a1a] px-3 py-1.5 text-xs text-[#888] transition-colors hover:border-orange-500 hover:text-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="rounded-lg border border-[#1a1a1a] px-3 py-1.5 text-xs text-[#888] transition-colors hover:border-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
