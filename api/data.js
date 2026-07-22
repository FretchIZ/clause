const posts = [
  { slug: "react-server-components-deep-dive", title: "React Server Components: A Practical Deep Dive", description: "Understand how RSCs work under the hood, when to use them, and how they change the way we think about data fetching in React apps.", date: "2026-07-20", readTime: "12 min", category: "React", tags: ["React", "Server Components", "RSC", "Data Fetching"], author: "Alex Chen", content: "React Server Components (RSC) represent the biggest shift..." },
  { slug: "typescript-conditional-types-explained", title: "TypeScript Conditional Types: From Confusion to Mastery", description: "Conditional types are one of TS's most powerful features. Learn how they work with practical examples you will actually use.", date: "2026-07-18", readTime: "10 min", category: "TypeScript", tags: ["TypeScript", "Types", "Advanced"], author: "Alex Chen", content: "Conditional types let you create types that depend on a condition..." },
  { slug: "designing-rate-limiting-for-apis", title: "Designing a Rate Limiter for High-Volume APIs", description: "A practical guide to implementing rate limiting at scale covering token bucket, sliding window, and distributed approaches.", date: "2026-07-15", readTime: "15 min", category: "System Design", tags: ["System Design", "API", "Rate Limiting", "Scalability"], author: "Alex Chen", content: "Rate limiting is one of those problems that seems simple until you try it at scale..." },
  { slug: "docker-multi-stage-builds-guide", title: "Docker Multi-Stage Builds: From 2GB to 150MB", description: "Shrink your Docker images dramatically with multi-stage builds. Real examples for Node.js, Go, and Python projects.", date: "2026-07-12", readTime: "8 min", category: "DevOps", tags: ["Docker", "DevOps", "CI/CD", "Containers"], author: "Alex Chen", content: "If your Docker images are over a gigabyte..." },
  { slug: "react-memoization-patterns", title: "React Memoization: When and How to Use useMemo, useCallback, and React.memo", description: "Stop over-engineering memoization. Learn exactly when each tool matters and when it is just unnecessary complexity.", date: "2026-07-10", readTime: "9 min", category: "React", tags: ["React", "Performance", "Memoization", "Hooks"], author: "Alex Chen", content: "There is a lot of bad advice about memoization in React..." },
  { slug: "css-grid-mastery", title: "CSS Grid: The Layout Tool You Should Be Using Everywhere", description: "Stop fighting with Flexbox for 2D layouts. Master CSS Grid with real-world component patterns.", date: "2026-07-08", readTime: "7 min", category: "CSS", tags: ["CSS", "Grid", "Layout", "Frontend"], author: "Alex Chen", content: "CSS Grid is the most powerful layout system..." },
  { slug: "building-scalable-websockets", title: "Building Scalable WebSocket Servers: Architecture Patterns", description: "From a single server to handling millions of concurrent connections. WebSocket architecture patterns that scale.", date: "2026-07-05", readTime: "14 min", category: "System Design", tags: ["WebSocket", "System Design", "Real-time", "Scalability"], author: "Alex Chen", content: "WebSockets are everywhere..." },
  { slug: "error-handling-patterns-typescript", title: "Error Handling Patterns in TypeScript You Should Know", description: "Stop losing errors in try/catch blocks. Build a robust error handling layer with typed results, custom errors, and elegant recovery.", date: "2026-07-02", readTime: "8 min", category: "TypeScript", tags: ["TypeScript", "Error Handling", "Patterns"], author: "Alex Chen", content: "TypeScript's type system gives us tools to make error handling explicit..." },
  { slug: "react-compiler-first-look", title: "React Compiler: First Look at the Future of React Performance", description: "The React Compiler (formerly React Forget) auto-memoizes your components. Here is what it means for your codebase.", date: "2026-06-28", readTime: "6 min", category: "React", tags: ["React", "Compiler", "Performance"], author: "Alex Chen", content: "The React Compiler automatically handles memoization..." },
  { slug: "postgres-query-optimization", title: "PostgreSQL Query Optimization: From Slow to Sub-Millisecond", description: "Real query optimization techniques that transformed a 12-second query into 3ms. Covering indexes, CTEs, EXPLAIN ANALYZE, and more.", date: "2026-06-25", readTime: "11 min", category: "System Design", tags: ["PostgreSQL", "Database", "Optimization", "SQL"], author: "Alex Chen", content: "A slow query in staging becomes a production incident..." },
  { slug: "github-actions-ci-cd-pipeline", title: "Building a CI/CD Pipeline with GitHub Actions", description: "From zero to a production-grade pipeline: lint, test, build, deploy. Real workflows you can copy.", date: "2026-06-22", readTime: "10 min", category: "DevOps", tags: ["GitHub Actions", "CI/CD", "DevOps"], author: "Alex Chen", content: "A solid CI/CD pipeline saves hours of manual work..." },
  { slug: "advanced-typescript-utility-types", title: "Building Your Own TypeScript Utility Types", description: "Go beyond Pick, Omit, and Partial. Learn to build production-ready utility types that make your codebase safer.", date: "2026-06-18", readTime: "9 min", category: "TypeScript", tags: ["TypeScript", "Utility Types", "Advanced"], author: "Alex Chen", content: "TypeScript's built-in utility types are great..." },
]

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
