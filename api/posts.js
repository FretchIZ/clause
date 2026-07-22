import { getAll, getBySlug, create, update, remove } from "./data.js"

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json")

  const slug = req.query?.slug

  if (req.method === "GET") {
    if (slug) {
      const post = getBySlug(slug)
      if (!post) return res.status(404).json({ error: "Post not found" })
      return res.status(200).json({ post })
    }
    const posts = getAll()
    return res.status(200).json({ posts })
  }

  if (req.method === "POST") {
    if (slug) return res.status(405).json({ error: "Use PUT to update a post" })
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        const data = JSON.parse(body)
        if (!data.title) return res.status(400).json({ error: "Title is required" })
        const post = create(data)
        if (!post) return res.status(409).json({ error: "A post with this title already exists" })
        return res.status(201).json({ post })
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" })
      }
    })
    return
  }

  if (req.method === "PUT") {
    if (!slug) return res.status(400).json({ error: "Slug query parameter required" })
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        const data = JSON.parse(body)
        const post = update(slug, data)
        if (!post) return res.status(404).json({ error: "Post not found" })
        return res.status(200).json({ post })
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" })
      }
    })
    return
  }

  if (req.method === "DELETE") {
    if (!slug) return res.status(400).json({ error: "Slug query parameter required" })
    const deleted = remove(slug)
    if (!deleted) return res.status(404).json({ error: "Post not found" })
    return res.status(200).json({ message: "Post deleted" })
  }

  res.status(405).json({ error: `Method ${req.method} not allowed` })
}
