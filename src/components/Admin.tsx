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
    <div className="mx-auto max-w-3xl animate-fade-up">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Posts</h1>
          <p className="mt-1 text-xs text-[#555]">{posts.length} total</p>
        </div>
        <Link to="/" className="text-xs text-[#333] transition-colors hover:text-white">
          ← Home
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-12 border border-[#111] bg-[#0d0d0d] p-5">
        <h2 className="mb-5 text-sm font-medium text-white">
          {editSlug ? "Edit" : "New post"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
          <div className="sm:col-span-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content (Markdown)"
              rows={8}
              className="w-full border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm text-white outline-none transition-colors focus:border-orange-500"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            className="rounded bg-orange-500 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
          >
            {editSlug ? "Update" : "Publish"}
          </button>
          {editSlug && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-[#1a1a1a] px-4 py-1.5 text-xs text-[#555] transition-colors hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-center text-xs text-[#333]">Loading...</p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="group flex items-center justify-between border-b border-[#111] py-3 transition-colors hover:border-[#1a1a1a]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{post.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#333]">
                  <span className="text-[#555]">{post.category}</span>
                  <span>{post.date}</span>
                </div>
              </div>
              <div className="ml-4 flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-xs text-[#555] transition-colors hover:text-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-xs text-[#333] transition-colors hover:text-red-400"
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
