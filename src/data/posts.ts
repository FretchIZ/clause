import type { BlogPost, Category } from "../types"

export const categories: Category[] = [
  { name: "React", count: 4 },
  { name: "TypeScript", count: 3 },
  { name: "System Design", count: 3 },
  { name: "DevOps", count: 2 },
  { name: "Performance", count: 2 },
  { name: "CSS", count: 1 },
]

export const posts: BlogPost[] = [
  {
    slug: "react-server-components-deep-dive",
    title: "React Server Components: A Practical Deep Dive",
    description:
      "Understand how RSCs work under the hood, when to use them, and how they change the way we think about data fetching in React apps.",
    date: "2026-07-20",
    readTime: "12 min",
    category: "React",
    tags: ["React", "Server Components", "RSC", "Data Fetching"],
    author: "Alex Chen",
    featured: true,
    content: `React Server Components (RSC) represent the biggest shift in React's architecture since hooks. Let's break down what they actually do and how to use them effectively.

## What Are Server Components?

Server Components are React components that run **only on the server**. They never ship JavaScript to the client. This means you can:

- Directly access databases and file systems
- Keep large dependencies server-side
- Reduce bundle size significantly
- Stream HTML as it renders

\`\`\`tsx
// This component runs ONLY on the server
async function BlogList() {
  const posts = await db.query(\`
    SELECT title, slug, excerpt FROM posts ORDER BY created_at DESC
  \`)

  return (
    <ul>
      {posts.map(post => (
        <li key={post.slug}>
          <a href={\`/blog/\${post.slug}\`}>{post.title}</a>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

## Client Components vs Server Components

The key distinction is simple: if a component needs interactivity (hooks, event handlers, browser APIs), it's a Client Component. Everything else can be a Server Component.

\`\`\`tsx
// page.tsx — Server Component by default
import { Suspense } from "react"
import PostContent from "./PostContent"
import Loading from "./Loading"

export default function BlogPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <PostContent slug={params.slug} />
    </Suspense>
  )
}
\`\`\`

## The Streaming Advantage

One of the most underrated features of RSCs is streaming. You can send HTML to the client as it renders, improving perceived performance dramatically.

\`\`\`tsx
export default function Dashboard() {
  return (
    <Page>
      <Header /> {/* Fast — renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowDataFetcher /> {/* Streams in when ready */}
      </Suspense>
    </Page>
  )
}
\`\`\`

## When NOT to Use Server Components

- When you need useState, useEffect, or event handlers
- When the component is highly interactive
- When you need browser-only APIs

## The Bottom Line

Server Components aren't a replacement for Client Components — they're a complementary tool. The best apps use both strategically.`,
  },
  {
    slug: "typescript-conditional-types-explained",
    title: "TypeScript Conditional Types: From Confusion to Mastery",
    description:
      "Conditional types are one of TS's most powerful features. Learn how they work with practical examples you'll actually use.",
    date: "2026-07-18",
    readTime: "10 min",
    category: "TypeScript",
    tags: ["TypeScript", "Types", "Advanced"],
    author: "Alex Chen",
    featured: true,
    content: `Conditional types let you create types that depend on a condition. They're like ternary operators for the type system.

## The Basics

\`\`\`tsx
type IsString<T> = T extends string ? true : false

type A = IsString<"hello"> // true
type B = IsString<42>       // false
\`\`\`

The syntax is \`T extends U ? X : Y\`. If \`T\` is assignable to \`U\`, the result is \`X\`; otherwise \`Y\`.

## Practical: Extracting Return Types

\`\`\`tsx
type ApiResponse<T> = T extends { data: infer D } ? D : never

type UserResponse = ApiResponse<{ data: { id: number; name: string } }>
// { id: number; name: string }
\`\`\`

The \`infer\` keyword lets you capture a type from within a condition. It's incredibly useful for unwrapping generic types.

## Practical: Deep Partial

\`\`\`tsx
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

interface Config {
  db: { host: string; port: number }
  cache: { ttl: number }
}

type PartialConfig = DeepPartial<Config>
// All fields become optional, recursively
\`\`\`

## Practical: Function Arguments

\`\`\`tsx
type FirstArg<T> = T extends (arg: infer A, ...rest: any[]) => any ? A : never

type F = (name: string, age: number) => void
type Arg = FirstArg<F> // string
\`\`\`

## Distributive Conditional Types

When a conditional type is used with a union, it distributes over each member:

\`\`\`tsx
type GetStrings<T> = T extends string ? T : never

type Result = GetStrings<string | number | boolean>
// string | never | never → string
\`\`\`

## Common Patterns

\`\`\`tsx
// Exclude null/undefined
type NonNullable<T> = T extends null | undefined ? never : T

// Extract specific types from a union
type ExtractStrings<T> = T extends string ? T : never

// Pick properties of a certain type
type PropertiesOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]
\`\`\`

Conditional types unlock a whole new level of type safety. Start simple, and the advanced patterns will follow.`,
  },
  {
    slug: "designing-rate-limiting-for-apis",
    title: "Designing a Rate Limiter for High-Volume APIs",
    description:
      "A practical guide to implementing rate limiting at scale — covering token bucket, sliding window, and distributed approaches.",
    date: "2026-07-15",
    readTime: "15 min",
    category: "System Design",
    tags: ["System Design", "API", "Rate Limiting", "Scalability"],
    author: "Alex Chen",
    featured: true,
    content: `Rate limiting is one of those problems that seems simple until you try to do it at scale. Let's build one from scratch.

## Why Rate Limit?

- Protect backend services from overload
- Prevent abuse and DDoS attacks
- Ensure fair resource distribution
- Control costs in tiered pricing models

## Algorithm: Token Bucket

The simplest practical algorithm. A bucket holds tokens that refill at a fixed rate.

\`\`\`go
type TokenBucket struct {
    capacity  int64
    refillRate float64
    tokens    float64
    lastRefill time.Time
}

func (b *TokenBucket) Allow() bool {
    now := time.Now()
    elapsed := now.Sub(b.lastRefill).Seconds()
    b.tokens = math.Min(
        float64(b.capacity),
        b.tokens + elapsed * b.refillRate,
    )
    b.lastRefill = now
    if b.tokens >= 1 {
        b.tokens--
        return true
    }
    return false
}
\`\`\`

## Algorithm: Sliding Window Log

More memory-intensive but gives precise control.

\`\`\`go
type SlidingWindow struct {
    window time.Duration
    maxReq int
    logs   map[string][]time.Time
    mu     sync.RWMutex
}

func (sw *Sw) Allow(key string) bool {
    sw.mu.Lock()
    defer sw.mu.Unlock()
    now := time.Now()
    cutoff := now.Add(-sw.window)
    entries := sw.logs[key]
    var valid []time.Time
    for _, t := range entries {
        if t.After(cutoff) {
            valid = append(valid, t)
        }
    }
    if len(valid) >= sw.maxReq {
        sw.logs[key] = valid
        return false
    }
    sw.logs[key] = append(valid, now)
    return true
}
\`\`\`

## Distributed Rate Limiting with Redis

For multi-server deployments, you need a shared store.

\`\`\`go
func RedisSlidingWindow(client *redis.Client, userID string, limit int, window time.Duration) bool {
    key := fmt.Sprintf("ratelimit:%s", userID)
    now := time.Now().UnixMilli()
    cutoff := now - window.Milliseconds()

    pipe := client.Pipeline()
    pipe.ZRemRangeByScore(key, "0", strconv.FormatInt(cutoff, 10))
    count := pipe.ZCard(key)
    pipe.ZAdd(key, redis.Z{Score: float64(now), Member: now})
    pipe.Expire(key, window)
    _, _ = pipe.Exec()

    return count.Val() < int64(limit)
}
\`\`\`

## HTTP Headers

Always return rate limit info in response headers so clients can adapt:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1625000000
Retry-After: 42
\`\`\`

## Choosing the Right Strategy

- **Token Bucket**: Simple, handles bursts well, good for most APIs
- **Sliding Window**: More accurate, better for strict quotas
- **Fixed Window**: Simple but suffers from boundary spikes
- **Concurrency Limiting**: Limit active requests, not rate

The right choice depends on your traffic patterns and business requirements.`,
  },
  {
    slug: "docker-multi-stage-builds-guide",
    title: "Docker Multi-Stage Builds: From 2GB to 150MB",
    description:
      "Shrink your Docker images dramatically with multi-stage builds. Real examples for Node.js, Go, and Python projects.",
    date: "2026-07-12",
    readTime: "8 min",
    category: "DevOps",
    tags: ["Docker", "DevOps", "CI/CD", "Containers"],
    author: "Alex Chen",
    content: `If your Docker images are over a gigabyte, you're paying for megabytes of dependencies you don't need in production. Multi-stage builds fix this.

## The Problem

A typical Node.js Dockerfile:

\`\`\`dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

This image includes: the full Node SDK, dev dependencies, source files, and build artifacts. A real project can easily hit 1.5–2 GB.

## The Solution: Multi-Stage

\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

Result: **~150 MB** instead of 1.8 GB.

## Python Example

\`\`\`dockerfile
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app.py .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
\`\`\`

## Go Example

Go is already efficient, but multi-stage removes the compiler:

\`\`\`dockerfile
FROM golang:1.22 AS builder
WORKDIR /build
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM scratch
COPY --from=builder /build/server /server
EXPOSE 8080
CMD ["/server"]
\`\`\`

A Go HTTP server compiles to ~15 MB. Using \`scratch\` as the base keeps it that way.

## Best Practices

1. Use distroless or alpine for the final stage
2. Copy only what's needed at runtime
3. Leverage Docker layer caching (install deps before copying source)
4. Use \`.dockerignore\` aggressively

Multi-stage builds are the single biggest optimization you can make for container images.`,
  },
  {
    slug: "react-memoization-patterns",
    title: "React Memoization: When and How to Use useMemo, useCallback, and React.memo",
    description:
      "Stop over-engineering memoization. Learn exactly when each tool matters and when it's just unnecessary complexity.",
    date: "2026-07-10",
    readTime: "9 min",
    category: "React",
    tags: ["React", "Performance", "Memoization", "Hooks"],
    author: "Alex Chen",
    content: `There's a lot of bad advice about memoization in React. Let's clear it up.

## The Golden Rule

**Don't optimize what isn't slow.**

Memoization adds complexity. Every \`useMemo\` and \`useCallback\` call is a maintenance burden and a potential bug source (stale closures, forgotten deps). Only reach for them when you have evidence of a performance problem.

## useMemo — Memoize Values

Use it when the computation is genuinely expensive:

\`\`\`tsx
// GOOD: Expensive computation
const filteredItems = useMemo(
  () => items.filter(item => expensiveFilter(item, query)),
  [items, query]
)

// BAD: Cheap computation
const total = useMemo(() => a + b, [a, b]) // Just use: const total = a + b
\`\`\`

## useCallback — Memoize Functions

Use it when passing a function to a memoized child component:

\`\`\`tsx
const handleClick = useCallback(() => {
  setCount(c => c + 1)
}, []) // setCount's stable, empty deps is fine

return <ExpensiveButton onClick={handleClick} />
\`\`\`

Without \`useCallback\`, a new function is created every render, defeating \`React.memo\`.

## React.memo — Memoize Components

Wraps a component to skip re-rendering when props haven't changed (shallow comparison):

\`\`\`tsx
const ExpensiveButton = React.memo(({ onClick, label }) => {
  return <button onClick={onClick}>{label}</button>
})
\`\`\`

Only useful when:
- The component re-renders often with the same props
- The render is expensive (large lists, complex UI)
- You've already verified it's a bottleneck

## The Cost of Memoization

Each memoized value/component requires:
- A dependency array to maintain
- Memory to cache the previous value
- A shallow comparison on every render

In many cases, the comparison itself costs more than just re-rendering.

## Real-World Patterns

\`\`\`tsx
function SearchResults({ query, items }: Props) {
  // 1. Memoize the filtered list
  const results = useMemo(
    () => items.filter(i => i.name.includes(query)),
    [items, query]
  )

  // 2. Memoize the click handler
  const handleSelect = useCallback((id: string) => {
    navigate(\`/item/\${id}\`)
  }, [navigate])

  // 3. Memoize the list component
  return <VirtualList items={results} onSelect={handleSelect} />
}

const VirtualList = React.memo(({ items, onSelect }: {
  items: Item[]
  onSelect: (id: string) => void
}) => {
  return items.map(item => (
    <div key={item.id} onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  ))
})
\`\`\`

Measure first, memoize second. Your future self will thank you.`,
  },
  {
    slug: "css-grid-mastery",
    title: "CSS Grid: The Layout Tool You Should Be Using Everywhere",
    description:
      "Stop fighting with Flexbox for 2D layouts. Master CSS Grid with real-world component patterns.",
    date: "2026-07-08",
    readTime: "7 min",
    category: "CSS",
    tags: ["CSS", "Grid", "Layout", "Frontend"],
    author: "Alex Chen",
    content: `CSS Grid is the most powerful layout system the web has ever had. If you're still using float-based grids or complex Flexbox hacks, it's time to upgrade.

## The Basics

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

Three equal columns with a 1rem gap. That's it. No math, no clearfixes, no negative margins.

## Auto-Fit vs Auto-Fill

\`\`\`css
/* Auto-fill: creates as many tracks as possible */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

/* Auto-fit: same but collapses empty tracks */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
\`\`\`

The difference: auto-fill keeps empty column tracks; auto-fit collapses them to zero. Use auto-fit for responsive cards without media queries.

## Named Grid Areas

For page layouts, named areas are a game-changer:

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar content content"
    "footer  footer  footer";
  grid-template-columns: 250px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }
\`\`\`

## Responsive Without Media Queries

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
\`\`\`

This automatically adjusts from 1 column (mobile) to as many as fit, with a minimum card width of 300px. No \`@media\` needed.

## Spanning Items

\`\`\`css
.featured {
  grid-column: 1 / -1; /* Full width */
}

.wide {
  grid-column: span 2; /* Two columns */
}
\`\`\`

## Grid + Flexbox

Use Grid for the overall page layout and Flexbox for component-level alignment. They complement each other perfectly.

Grid gives you control over both rows and columns simultaneously. Once you internalize it, you'll wonder how you ever lived without it.`,
  },
  {
    slug: "building-scalable-websockets",
    title: "Building Scalable WebSocket Servers: Architecture Patterns",
    description:
      "From a single server to handling millions of concurrent connections. WebSocket architecture patterns that scale.",
    date: "2026-07-05",
    readTime: "14 min",
    category: "System Design",
    tags: ["WebSocket", "System Design", "Real-time", "Scalability"],
    author: "Alex Chen",
    featured: true,
    content: `WebSockets are everywhere — chat apps, live dashboards, collaborative editing, gaming. But scaling them from 1,000 to 1,000,000 connections requires careful architecture.

## The Single Server Problem

A single server can handle ~10K concurrent WebSocket connections with proper tuning. Beyond that, you need horizontal scaling. The challenge: a connected client is pinned to a specific server.

## Architecture: Redis Pub/Sub

The simplest distributed approach:

\`\`\`go
type Hub struct {
    clients map[*Client]bool
    redis   *redis.Client
}

func (h *Hub) Publish(msg []byte) {
    h.redis.Publish("chat:messages", string(msg))
}

func (h *Hub) Listen() {
    pubsub := h.redis.Subscribe("chat:messages")
    for msg := range pubsub.Channel() {
        for client := range h.clients {
            select {
            case client.send <- []byte(msg.Payload):
            default:
                close(client.send)
                delete(h.clients, client)
            }
        }
    }
}
\`\`\`

Every server subscribes to the same Redis channel. When any server publishes a message, all servers receive it and forward to their local clients.

## Architecture: Message Queue

For higher throughput, use a dedicated message broker:

\`\`\`
Client → Server A → Kafka/RabbitMQ → Server B → Client
\`\`\`

This decouples publishers from subscribers and adds durability.

## Connection Management

\`\`\`go
type ConnectionManager struct {
    connections sync.Map // serverID → map[connID]*Client
    redis       *redis.Client
}

func (cm *ConnectionManager) Register(serverID string, client *Client) {
    store, _ := cm.connections.LoadOrStore(serverID, &sync.Map{})
    store.(*sync.Map).Store(client.id, client)
    // Track in Redis so other servers know where to route
    cm.redis.SAdd(fmt.Sprintf("server:%s:clients", serverID), client.id)
}
\`\`\`

## Graceful Shutdown

When a server goes down, its connections die. Use heartbeats and reconnection logic on the client side, plus a Redis-backed registry to redirect clients to active servers.

## Key Metrics

- Max connections per server: ~10K (tuned Linux), ~250K (io_uring/kqueue)
- Network throughput is usually the bottleneck before CPU
- Always use binary framing for WebSocket messages
- Consider WebTransport for ultra-low-latency use cases

Scaling WebSockets isn't magic — it's just distributed systems applied to persistent connections.`,
  },
  {
    slug: "error-handling-patterns-typescript",
    title: "Error Handling Patterns in TypeScript You Should Know",
    description:
      "Stop losing errors in try/catch blocks. Build a robust error handling layer with typed results, custom errors, and elegant recovery.",
    date: "2026-07-02",
    readTime: "8 min",
    category: "TypeScript",
    tags: ["TypeScript", "Error Handling", "Patterns"],
    author: "Alex Chen",
    content: `TypeScript's type system gives us tools to make error handling explicit and composable. Here's how to use them.

## The Problem

\`\`\`tsx
try {
  const data = await fetchAPI()
  process(data)
} catch (err) {
  // err is 'unknown' — what now?
}
\`\`\`

Plain try/catch is loose. You lose type information and often miss handling specific error cases.

## Pattern 1: Custom Error Classes

\`\`\`tsx
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(\`\${resource} with id \${id} not found\`, "NOT_FOUND", 404)
  }
}

class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super("Validation failed", "VALIDATION_ERROR", 400, errors)
  }
}
\`\`\`

## Pattern 2: Result Type

Inspired by Rust's Result type:

\`\`\`tsx
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

async function safeFetch<T>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { ok: false, error: new AppError(\`HTTP \${res.status}\`, "HTTP_ERROR", res.status) }
    }
    return { ok: true, value: await res.json() }
  } catch (err) {
    return { ok: false, error: new AppError("Network error", "NETWORK_ERROR") }
  }
}

// Usage — types force you to handle both paths
const result = await safeFetch<User>("/api/user/1")
if (result.ok) {
  console.log(result.value.name) // typed as User
} else {
  console.error(result.error.message) // typed as AppError
}
\`\`\`

## Pattern 3: Try / Catch Wrapper

A utility that catches sync errors too:

\`\`\`tsx
function tryCatch<T, E = Error>(fn: () => T): Result<T, E>
function tryCatch<T, E = Error>(fn: () => Promise<T>): Promise<Result<T, E>>
function tryCatch<T, E = Error>(
  fn: (() => T) | (() => Promise<T>)
): Result<T, E> | Promise<Result<T, E>> {
  try {
    const result = fn()
    return result instanceof Promise
      ? result.then(value => ({ ok: true, value } as Result<T, E>))
          .catch(error => ({ ok: false, error } as Result<T, E>))
      : ({ ok: true, value: result } as Result<T, E>)
  } catch (error) {
    return { ok: false, error } as Result<T, E>
  }
}
\`\`\`

## Pattern 4: Error Boundary Component

\`\`\`tsx
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
\`\`\`

Pick the patterns that match your app's complexity. For simple apps, custom errors are enough. For anything serious, adopt the Result type — your future self will thank you.`,
  },
  {
    slug: "react-compiler-first-look",
    title: "React Compiler: First Look at the Future of React Performance",
    description:
      "The React Compiler (formerly React Forget) auto-memoizes your components. Here's what it means for your codebase.",
    date: "2026-06-28",
    readTime: "6 min",
    category: "React",
    tags: ["React", "Compiler", "Performance"],
    author: "Alex Chen",
    content: `The React Compiler automatically handles memoization so you don't have to think about \`useMemo\`, \`useCallback\`, or \`React.memo\`.

## How It Works

The compiler analyzes your code at build time and inserts memoization calls automatically:

\`\`\`tsx
// You write this:
function Profile({ user, posts }) {
  const filtered = posts.filter(p => p.authorId === user.id)
  return (
    <div>
      <h1>{user.name}</h1>
      <PostList items={filtered} />
    </div>
  )
}

// Compiler produces something like this:
function Profile({ user, posts }) {
  const filtered = useMemo(
    () => posts.filter(p => p.authorId === user.id),
    [posts, user.id]
  )
  return (
    <div>
      <h1>{user.name}</h1>
      <PostList items={filtered} />
    </div>
  )
}
\`\`\`

## What Changes for You

1. **Delete boilerplate**: Remove most \`useMemo\` and \`useCallback\` calls
2. **Automatic optimization**: Performance wins without manual effort
3. **No deps arrays**: The compiler infers dependencies automatically

## Current Status

The React Compiler is being adopted in production at Meta and available as a Babel plugin. It works with React 19+ and requires zero code changes to adopt incrementally.

## Should You Use It Yet?

If you're on React 19, try it on a non-critical page. The compiler is strict about "pure" component rules — no side effects in render. This is good for your codebase either way.

The future of React is: write simple code, get optimized output.`,
  },
  {
    slug: "postgres-query-optimization",
    title: "PostgreSQL Query Optimization: From Slow to Sub-Millisecond",
    description:
      "Real query optimization techniques that transformed a 12-second query into 3ms. Covering indexes, CTEs, EXPLAIN ANALYZE, and more.",
    date: "2026-06-25",
    readTime: "11 min",
    category: "System Design",
    tags: ["PostgreSQL", "Database", "Optimization", "SQL"],
    author: "Alex Chen",
    content: `A slow query in staging becomes a production incident in minutes. Here's a systematic approach to fixing them.

## Step 1: Find the Slow Query

\`\`\`sql
SELECT query, calls, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
\`\`\`

## Step 2: EXPLAIN ANALYZE

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...
\`\`\`

Look for:
- Sequential scans on large tables
- High "rows removed by filter" counts
- Large buffer hits (misses mean disk I/O)

## Common Fix: Indexing

\`\`\`sql
-- Before: Seq Scan on orders (cost=0.00..4532.00 rows=1 width=100)
-- After:
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- For range queries:
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- For multi-column filters:
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Partial index for common queries:
CREATE INDEX idx_orders_active ON orders (user_id) WHERE status = 'active';
\`\`\`

## Common Fix: CTE Optimization

CTEs are optimization fences — PostgreSQL materializes them by default:

\`\`\`sql
-- Slow: CTE is materialized fully
WITH recent_orders AS (
  SELECT * FROM orders WHERE created_at > NOW() - '30d'::interval
)
SELECT * FROM recent_orders WHERE user_id = 42;

-- Fast: Subquery can be optimized
SELECT * FROM orders
WHERE created_at > NOW() - '30d'::interval
AND user_id = 42;

-- Or inline the CTE (PG12+)
WITH recent_orders AS NOT MATERIALIZED (
  SELECT * FROM orders WHERE created_at > NOW() - '30d'::interval
)
SELECT * FROM recent_orders WHERE user_id = 42;
\`\`\`

## Common Fix: Covering Indexes

\`\`\`sql
-- If you only need status and total, include them:
CREATE INDEX idx_orders_covering ON orders (user_id, status) INCLUDE (total);
\`\`\`

This is an index-only scan — no heap lookups needed.

## The Debugging Workflow

1. Capture the slow query
2. Run EXPLAIN ANALYZE
3. Identify the bottleneck (seq scan, sort, join)
4. Fix with an index or query rewrite
5. Verify with EXPLAIN ANALYZE again
6. Deploy and monitor

Most slow queries are fixed by adding the right index. A well-tuned query should run in single-digit milliseconds.`,
  },
  {
    slug: "github-actions-ci-cd-pipeline",
    title: "Building a CI/CD Pipeline with GitHub Actions",
    description:
      "From zero to a production-grade pipeline: lint, test, build, deploy. Real workflows you can copy.",
    date: "2026-06-22",
    readTime: "10 min",
    category: "DevOps",
    tags: ["GitHub Actions", "CI/CD", "DevOps"],
    author: "Alex Chen",
    content: `A solid CI/CD pipeline saves hours of manual work and catches bugs before they reach production.

## The Foundation

\`\`\`yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3
\`\`\`

## Matrix Testing

Test across multiple versions and platforms:

\`\`\`yaml
test:
  strategy:
    matrix:
      node-version: [18, 20, 22]
      os: [ubuntu-latest, windows-latest]
  runs-on: \${{ matrix.os }}
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm ci
    - run: npm test
\`\`\`

## Deployment

\`\`\`yaml
deploy:
  needs: [quality]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run build

    - uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ghcr.io/myapp:\${{ github.sha }}

    - uses: actions-hub/kubectl@master
      env:
        KUBE_CONFIG: \${{ secrets.KUBE_CONFIG }}
      run: |
        kubectl set image deployment/myapp \
          myapp=ghcr.io/myapp:\${{ github.sha }}
\`\`\`

## Caching

Speed up your pipeline significantly:

\`\`\`yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: npm-\${{ hashFiles('package-lock.json') }}
    restore-keys: npm-
\`\`\`

## Secrets

Never hardcode credentials. Use GitHub Secrets:

\`\`\`yaml
- run: |
    echo "\${{ secrets.DOCKER_PASSWORD }}" | docker login -u "\${{ secrets.DOCKER_USERNAME }}" --password-stdin
\`\`\`

## Best Practices

1. Fail fast: lint and typecheck before tests
2. Pin action versions to commits, not tags
3. Use job outputs to pass data between jobs
4. Always cache dependencies
5. Run security scans (Dependabot, CodeQL)

A good pipeline makes deployment boring. That's the goal.`,
  },
  {
    slug: "advanced-typescript-utility-types",
    title: "Building Your Own TypeScript Utility Types",
    description:
      "Go beyond Pick, Omit, and Partial. Learn to build production-ready utility types that make your codebase safer.",
    date: "2026-06-18",
    readTime: "9 min",
    category: "TypeScript",
    tags: ["TypeScript", "Utility Types", "Advanced"],
    author: "Alex Chen",
    content: `TypeScript's built-in utility types are great, but the real power comes from building your own.

## DeepReadonly

\`\`\`tsx
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

interface Config {
  db: { host: string; port: number }
  cache: { ttl: number }
}

type FrozenConfig = DeepReadonly<Config>
// All nested properties become readonly
\`\`\`

## NonFunctionKeys

\`\`\`tsx
type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

interface User {
  id: number
  name: string
  save(): void
  delete(): void
}

type Keys = NonFunctionKeys<User> // "id" | "name"
\`\`\`

## PickByValue

\`\`\`tsx
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

interface User {
  id: number
  name: string
  age: number
  email: string
}

type NumericProps = PickByValue<User, number> // { id: number; age: number }
\`\`\`

## RequiredByKeys

\`\`\`tsx
type RequiredByKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P]
}

interface User {
  id?: number
  name?: string
  email?: string
}

type WithRequiredId = RequiredByKeys<User, "id">
// id is required, name and email remain optional
\`\`\`

## Branded Types

Prevent mixing up IDs:

\`\`\`tsx
type Brand<T, B> = T & { __brand: B }

type UserId = Brand<number, "UserId">
type PostId = Brand<number, "PostId">

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const uid = 1 as UserId
const pid = 1 as PostId

getUser(uid) // OK
getUser(pid) // Error! PostId is not UserId
\`\`\`

## UnionToIntersection

\`\`\`tsx
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

type A = { a: string } | { b: number }
type B = UnionToIntersection<A> // { a: string } & { b: number }
\`\`\`

## A Practical Toolkit

\`\`\`tsx
type Maybe<T> = T | null | undefined
type Nullable<T> = { [K in keyof T]: T[K] | null }
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never
type Constructor<T> = new (...args: any[]) => T
type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
\`\`\`

Once you understand mapped types, conditional types, and template literal types, you can model almost any constraint in the type system.`,
  },
]
