import { getAll, create } from "../data.js"

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json")

  if (req.method === "GET") {
    const posts = getAll()
    return res.status(200).json({ posts })
  }

  if (req.method === "POST") {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        const data = JSON.parse(body)
        if (!data.title) {
          return res.status(400).json({ error: "Title is required" })
        }
        const post = create(data)
        if (!post) {
          return res.status(409).json({ error: "A post with this title already exists" })
        }
        return res.status(201).json({ post })
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON body" })
      }
    })
    return
  }

  res.status(405).json({ error: `Method ${req.method} not allowed` })
}
