const posts = []

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

let nextId = posts.length + 1

function getAll() {
  return posts.map(({ content, ...rest }) => rest)
}

function getBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null
}

function create(data) {
  const slug = generateSlug(data.title)
  if (posts.find((p) => p.slug === slug)) {
    return null
  }
  const post = {
    slug,
    title: data.title,
    description: data.description || "",
    date: new Date().toISOString().split("T")[0],
    readTime: data.readTime || "5 min",
    category: data.category || "General",
    tags: data.tags || [],
    author: data.author || "Anonymous",
    content: data.content || "",
  }
  posts.unshift(post)
  return post
}

function update(slug, data) {
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) return null
  posts[idx] = { ...posts[idx], ...data, slug }
  return posts[idx]
}

function remove(slug) {
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) return false
  posts.splice(idx, 1)
  return true
}

export { getAll, getBySlug, create, update, remove }
