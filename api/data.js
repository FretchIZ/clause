const posts = [
  { slug: "building-modern-web-apps", title: "Building Modern Web Apps with React 19", description: "Exploring the new features in React 19 and how they change the way we build applications.", date: "2026-07-20", readTime: "8 min", category: "React", tags: ["React", "Frontend", "Web"], author: "Webu", content: "React 19 introduces several groundbreaking features that streamline development.\n\n## Key Highlights\n\n- **React Compiler**: Automatic memoization out of the box\n- **Server Components**: First-class support for server-side rendering\n- **Actions**: Simplified form handling\n\n```tsx\nfunction LikeButton({ postId }) {\n  const like = async () => {\n    'use server'\n    await db.like(postId)\n  }\n  return <form action={like}><button>Like</button></form>\n}\n```\n\nThe future of React is bright." },
  { slug: "understanding-typescript-generics", title: "Understanding TypeScript Generics", description: "A practical guide to generics in TypeScript with real-world examples.", date: "2026-07-15", readTime: "6 min", category: "TypeScript", tags: ["TypeScript", "Types"], author: "Webu", content: "Generics are one of TypeScript's most powerful features.\n\n## Why Generics?\n\nThey allow you to create reusable components that work with multiple types.\n\n```tsx\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0]\n}\n\nconst num = first([1, 2, 3]) // number\nconst str = first(['a', 'b']) // string\n```\n\n## Constraints\n\nYou can limit what types are allowed:\n\n```tsx\nfunction length<T extends { length: number }>(item: T): number {\n  return item.length\n}\n\nlength('hello') // OK\nlength([1, 2, 3]) // OK\n// length(42) // Error\n```\n\nGenerics make your code safer and more flexible." },
  { slug: "docker-for-developers", title: "Docker for Developers: A Practical Introduction", description: "Get started with Docker containers for local development and deployment.", date: "2026-07-10", readTime: "7 min", category: "DevOps", tags: ["Docker", "DevOps", "Containers"], author: "Webu", content: "Docker simplifies development by packaging applications with their dependencies.\n\n## Essential Commands\n\n```bash\n# Build an image\ndocker build -t myapp .\n\n# Run a container\ndocker run -p 3000:3000 myapp\n\n# List running containers\ndocker ps\n```\n\n## Docker Compose\n\nDefine multi-service setups in a single file:\n\n```yaml\nservices:\n  app:\n    build: .\n    ports:\n      - \"3000:3000\"\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: myapp\n```\n\nContainers are essential for modern development workflows." },
]

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

let nextId = 4

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
