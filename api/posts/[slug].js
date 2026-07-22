import { getBySlug, update, remove } from "../data.js"

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json")

  const slug = req.query.slug

  if (req.method === "GET") {
    const post = getBySlug(slug)
    if (!post) return res.status(404).json({ error: "Post not found" })
    return res.status(200).json({ post })
  }

  if (req.method === "PUT") {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        const data = JSON.parse(body)
        const post = update(slug, data)
        if (!post) return res.status(404).json({ error: "Post not found" })
        return res.status(200).json({ post })
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON body" })
      }
    })
    return
  }

  if (req.method === "DELETE") {
    const deleted = remove(slug)
    if (!deleted) return res.status(404).json({ error: "Post not found" })
    return res.status(200).json({ message: "Post deleted" })
  }

  res.status(405).json({ error: `Method ${req.method} not allowed` })
}
