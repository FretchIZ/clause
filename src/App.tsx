import { useState, useRef, useEffect } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant"
type MsgStatus = "sent" | "typing" | "error" | "streaming"

interface Message {
  id: string
  role: Role
  content: string
  status: MsgStatus
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  preview: string
  date: Date
}

// ─── Palette (from spec) ──────────────────────────────────────────────────────
const C = {
  bg: "#121212",
  sidebar: "#1A1A1A",
  sidebarHover: "#333333",
  card: "#1E1E1E",
  cardAlt: "#2D2D2D",
  border: "#2A2A2A",
  text: "#E0E0E0",
  muted: "#A0A0A0",
  orange: "#FF6B35",
  orangeHover: "#E55A2B",
  white: "#FFFFFF",
  inputBg: "#252525",
  errorBg: "#2D1A16",
  errorBorder: "#6B2D1A",
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_CONVOS: Conversation[] = [
  {
    id: "1",
    title: "React performance patterns",
    preview: "How do I memoize expensive...",
    date: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: "2",
    title: "API rate limiting strategy",
    preview: "What's the best approach for...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    title: "Tailwind v4 migration guide",
    preview: "Breaking changes when moving...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 22),
  },
  {
    id: "4",
    title: "Database indexing explained",
    preview: "Can you walk me through B-trees...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "5",
    title: "TypeScript generics deep dive",
    preview: "I'm confused about conditional...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  {
    id: "6",
    title: "Docker multi-stage builds",
    preview: "Reduce image size from 2GB...",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
  },
]

const MODELS = ["Clause Sonnet 4.6", "Clause Opus 4.8", "Clause Haiku 4.5"]

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
    content:
      "How do I memoize expensive computations in React without over-engineering it?",
  },
  {
    id: "m2",
    role: "assistant",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    content:
      "Great question — the key is knowing *when* memoization actually helps.\n\n**Start with `useMemo` only when:**\n- The computation is genuinely expensive (sorting thousands of items, complex math)\n- The result is used in a render-heavy subtree\n- The dependencies are stable across most renders\n\n```tsx\n// Only worth it if filterExpensiveList is slow\nconst filtered = useMemo(\n  () => filterExpensiveList(items, query),\n  [items, query]\n)\n```\n\n**Don't memoize:**\n- Simple array maps on small arrays\n- Primitive derivations (`const total = a + b`)\n- Values that change almost every render\n\n`useCallback` follows the same rule — wrap handlers only when passing them to heavily optimized child components or as `useEffect` dependencies.",
  },
  {
    id: "m3",
    role: "user",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    content: "What about React.memo vs useMemo — I always mix those up.",
  },
  {
    id: "m4",
    role: "assistant",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    content:
      "`React.memo` wraps a **component** to skip re-rendering when props haven't changed. `useMemo` memoizes a **value**.\n\nThink of it this way:\n\n- `React.memo(Component)` — \"don't re-render this component if props are the same\"\n- `useMemo(() => compute(), [deps])` — \"don't recompute this value if deps haven't changed\"\n\nThey pair naturally:\n\n```tsx\nconst List = React.memo(({ items }: { items: string[] }) => (\n  <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>\n))\n\n// Keeps the array reference stable → List skips re-render\nconst filtered = useMemo(\n  () => items.filter(x => x.active),\n  [items]\n)\n\n<List items={filtered} />\n```\n\nWithout `useMemo`, `filtered` is a new array reference each render — even when `items` didn't change — defeating `React.memo`.",
  },
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ClauseIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="28" r="28" fill={C.orange} />
    <path
      d="M19 19 C19 13 27 10 33 14 C39 18 41 27 37 33 C33 38 24 38 20 33"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    />
    <path
      d="M25 25 C25 19 33 16 39 20 C45 24 45 35 39 38 C33 41 25 39 23 34"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />
    <circle cx="28" cy="28" r="2.5" fill="white" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M2.5 7.5h10M9 3.5l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M2 4.5h14M2 9h14M2 13.5h14"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)
const ChevronIcon = ({ open }: { open?: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    style={{
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <path
      d="M2 4l3.5 3.5L9 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const AttachIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M12.5 7L7 12.5a4 4 0 01-5.66-5.66l6-6a2.5 2.5 0 013.54 3.54l-6 6a1 1 0 01-1.42-1.42l5.3-5.3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M8.5 8.5l2 2"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)
const ChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M2 2h11v9H8l-3 3v-3H2V2z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)
const FolderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M1.5 4.5C1.5 3.95 1.95 3.5 2.5 3.5h4l1.5 2H12.5c.55 0 1 .45 1 1v5.5c0 .55-.45 1-1 1h-10c-.55 0-1-.45-1-1V4.5z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)
const CodeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M4.5 4.5L1.5 7.5l3 3M10.5 4.5l3 3-3 3M8.5 3l-2 9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const ArtifactIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1.5"
      y="1.5"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="8.5"
      y="1.5"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="1.5"
      y="8.5"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="8.5"
      y="8.5"
      width="5"
      height="5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
)
const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1.5l1.59 3.22 3.55.52-2.57 2.5.61 3.54L7.5 9.5l-3.18 1.78.61-3.54-2.57-2.5 3.55-.52L7.5 1.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)
const UpgradeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path
      d="M6.5 1.5v8M3.5 4.5l3-3 3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.5 11.5h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)
const WarningIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5z"
      stroke="#FF6B35"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 6v3M7.5 10.5v1"
      stroke="#FF6B35"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

// ─── Typing Dots ──────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.muted,
          display: "inline-block",
          animation: "typingBounce 1.3s ease-in-out infinite",
          animationDelay: `${i * 0.22}s`,
        }}
      />
    ))}
  </div>
)

// ─── Inline Markdown ──────────────────────────────────────────────────────────
function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code
          key={i}
          style={{
            background: "#2A2A2A",
            color: C.orange,
            padding: "1px 6px",
            borderRadius: 4,
            fontFamily: "Fira Code, monospace",
            fontSize: 13,
          }}
        >
          {p.slice(1, -1)}
        </code>
      )
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} style={{ color: C.white, fontWeight: 600 }}>
          {p.slice(2, -2)}
        </strong>
      )
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i}>{p.slice(1, -1)}</em>
    return p
  })
}

function renderContent(text: string) {
  const lines = text.split("\n")
  const els: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i])
        i++
      }
      els.push(
        <div
          key={`code-${i}`}
          style={{
            margin: "12px 0",
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          {lang && (
            <div
              style={{
                background: "#1A1A1A",
                padding: "6px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Fira Code, monospace",
                  fontSize: 11,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {lang}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(code.join("\n"))}
                style={{
                  fontSize: 11,
                  color: C.muted,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Roboto, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.orange)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
              >
                Copy
              </button>
            </div>
          )}
          <pre
            style={{
              background: "#161616",
              padding: "14px 16px",
              overflowX: "auto",
              margin: 0,
              fontFamily: "Fira Code, monospace",
              fontSize: 13,
              color: C.text,
              lineHeight: 1.65,
            }}
          >
            {code.join("\n")}
          </pre>
        </div>,
      )
    } else if (line.startsWith("- ")) {
      els.push(
        <li
          key={i}
          style={{
            marginLeft: 20,
            color: C.text,
            lineHeight: 1.7,
            listStyleType: "disc",
          }}
        >
          {formatInline(line.slice(2))}
        </li>,
      )
    } else if (line === "") {
      els.push(<div key={i} style={{ height: 8 }} />)
    } else {
      els.push(
        <p key={i} style={{ color: C.text, lineHeight: 1.7, margin: 0 }}>
          {formatInline(line)}
        </p>,
      )
    }
    i++
  }
  return els
}

// ─── Message ──────────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  const time = msg.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 24px",
          marginBottom: 20,
        }}
      >
        <div style={{ maxWidth: "75%" }}>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "14px 14px 2px 14px",
              padding: "10px 14px",
              color: C.text,
              fontSize: 14.5,
              lineHeight: 1.65,
            }}
          >
            {msg.content}
          </div>
          <div
            style={{
              textAlign: "right",
              marginTop: 4,
              fontSize: 11,
              color: C.muted,
            }}
          >
            {time}
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#5C6BC0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 10,
            marginTop: 2,
            flexShrink: 0,
          }}
        >
          <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
            S
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", padding: "0 24px", marginBottom: 20 }}>
      <div style={{ marginRight: 10, marginTop: 2, flexShrink: 0 }}>
        <ClauseIcon size={28} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.status === "typing" && <TypingDots />}
        {msg.status === "error" && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: C.errorBg,
              border: `1px solid ${C.errorBorder}`,
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <WarningIcon />
            <span style={{ color: "#FF8C6B", fontSize: 14 }}>
              Something went wrong generating a response.{" "}
              <button
                style={{
                  color: C.orange,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: 14,
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                Try again
              </button>
            </span>
          </div>
        )}
        {(msg.status === "sent" || msg.status === "streaming") && (
          <div style={{ fontSize: 14.5 }}>
            {renderContent(msg.content)}
            {msg.status === "streaming" && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  background: C.orange,
                  marginLeft: 3,
                  verticalAlign: "text-bottom",
                  animation: "cursorBlink 1s step-end infinite",
                }}
              />
            )}
          </div>
        )}
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>{time}</div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Explain React Server Components in simple terms",
  "Write a Python script to batch rename files",
  "What's the difference between TCP and UDP?",
  "Help me design a rate limiter in Go",
]

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <ClauseIcon size={56} />
      <h2
        style={{
          color: C.white,
          fontSize: 22,
          fontWeight: 600,
          marginTop: 20,
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        How can I help you today?
      </h2>
      <p
        style={{
          color: C.muted,
          fontSize: 14,
          marginBottom: 32,
          maxWidth: 340,
        }}
      >
        Ask me anything — code, analysis, writing, math, or just a conversation.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPrompt(s)}
            style={{
              textAlign: "left",
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              color: C.text,
              fontSize: 13,
              cursor: "pointer",
              lineHeight: 1.5,
              fontFamily: "Roboto, sans-serif",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.orange
              e.currentTarget.style.background = "#222"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.background = C.card
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { label: "Chats", icon: <ChatIcon /> },
  { label: "Projects", icon: <FolderIcon /> },
  { label: "Artifacts", icon: <ArtifactIcon /> },
  { label: "Code", icon: <CodeIcon /> },
  { label: "Customize", icon: <StarIcon /> },
]

function Sidebar({
  convos,
  activeId,
  onSelect,
  onNew,
  open,
}: {
  convos: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  open: boolean
}) {
  const [activeNav, setActiveNav] = useState("Chats")
  const now = new Date()
  const today = (d: Date) => d.toDateString() === now.toDateString()
  const yesterday = (d: Date) => {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return d.toDateString() === y.toDateString()
  }

  type GroupKey = "Today" | "Yesterday" | "Earlier"
  const groups: Record<GroupKey, Conversation[]> = {
    Today: convos.filter((c) => today(c.date)),
    Yesterday: convos.filter((c) => yesterday(c.date)),
    Earlier: convos.filter((c) => !today(c.date) && !yesterday(c.date)),
  }

  return (
    <aside
      style={{
        width: open ? 250 : 0,
        minWidth: open ? 250 : 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s ease, min-width 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 250,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 14px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClauseIcon size={26} />
            <span
              style={{
                color: C.white,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Clause
            </span>
          </div>
          <button
            onClick={onNew}
            aria-label="New Chat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: C.sidebarHover,
              border: "none",
              borderRadius: 7,
              padding: "5px 10px",
              color: C.text,
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "Roboto, sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#444")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = C.sidebarHover)
            }
          >
            <PlusIcon /> New
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: "0 8px 8px" }}>
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => setActiveNav(n.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                background: activeNav === n.label ? C.sidebarHover : "none",
                border: "none",
                borderRadius: 7,
                padding: "7px 10px",
                color: activeNav === n.label ? C.white : C.muted,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Roboto, sans-serif",
                textAlign: "left",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => {
                if (activeNav !== n.label)
                  e.currentTarget.style.background = "#252525"
              }}
              onMouseLeave={(e) => {
                if (activeNav !== n.label)
                  e.currentTarget.style.background = "none"
              }}
            >
              <span
                style={{ color: activeNav === n.label ? C.orange : C.muted }}
              >
                {n.icon}
              </span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "0 10px 10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#252525",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "7px 10px",
              color: C.muted,
            }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Search conversations"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 12.5,
                color: C.text,
                flex: 1,
                fontFamily: "Roboto, sans-serif",
              }}
            />
          </div>
        </div>

        {/* Recent conversations */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}
          className="sidebar-scroll"
        >
          {(["Today", "Yesterday", "Earlier"] as GroupKey[]).map((label) =>
            groups[label].length > 0 ? (
              <div key={label} style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 10.5,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                    padding: "0 8px",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </p>
                {groups[label].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: activeId === c.id ? C.sidebarHover : "none",
                      border: "none",
                      borderRadius: 7,
                      padding: "7px 10px",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (activeId !== c.id)
                        e.currentTarget.style.background = "#252525"
                    }}
                    onMouseLeave={(e) => {
                      if (activeId !== c.id)
                        e.currentTarget.style.background = "none"
                    }}
                  >
                    <p
                      style={{
                        color: activeId === c.id ? C.white : C.text,
                        fontSize: 13,
                        fontWeight: activeId === c.id ? 500 : 400,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      {c.title}
                    </p>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 11.5,
                        margin: "2px 0 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      {c.preview}
                    </p>
                  </button>
                ))}
              </div>
            ) : null,
          )}
        </div>

        {/* User profile + upgrade */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: "10px 10px 12px",
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "100%",
              background: C.orange,
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              color: C.white,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Roboto, sans-serif",
              justifyContent: "center",
              marginBottom: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = C.orangeHover)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = C.orange)}
          >
            <UpgradeIcon /> Upgrade plan
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "4px 6px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#5C6BC0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
                S
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: C.text,
                  fontSize: 13,
                  fontWeight: 500,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                sboxd
              </p>
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>
                Free plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Model Selector ───────────────────────────────────────────────────────────
function ModelSelector({
  model,
  onChange,
}: {
  model: string
  onChange: (m: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: C.sidebarHover,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "5px 12px",
          color: C.text,
          fontSize: 12.5,
          cursor: "pointer",
          fontFamily: "Roboto, sans-serif",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.orange)}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderColor = C.border
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.orange,
            flexShrink: 0,
          }}
        />
        {model}
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            background: C.sidebar,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: "hidden",
            minWidth: 200,
            boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          {MODELS.map((m) => (
            <button
              key={m}
              onClick={() => {
                onChange(m)
                setOpen(false)
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                background: m === model ? C.sidebarHover : "none",
                border: "none",
                padding: "9px 14px",
                color: m === model ? C.orange : C.text,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Roboto, sans-serif",
                textAlign: "left",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.sidebarHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  m === model ? C.sidebarHover : "none")
              }
            >
              {m === model && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.orange,
                    flexShrink: 0,
                  }}
                />
              )}
              {m !== model && <span style={{ width: 6 }} />}
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [convos] = useState(SAMPLE_CONVOS)
  const [activeConvo, setActiveConvo] = useState("1")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isNew, setIsNew] = useState(false)
  const [model, setModel] = useState(MODELS[0])
  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const autoResize = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px"
  }

  const API_URL = import.meta.env.DEV ? "http://localhost:8833" : "/api"

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setIsNew(false)
    setInput("")
    if (taRef.current) taRef.current.style.height = "auto"

    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      content,
      status: "sent",
      timestamp: new Date(),
    }
    const typingMsg: Message = {
      id: `a${Date.now()}`,
      role: "assistant",
      content: "",
      status: "typing",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg, typingMsg])

    try {
      const history = messages
        .filter((m) => m.status === "sent")
        .map((m) => ({ role: m.role, content: m.content }))
      history.push({ role: "user", content })

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      setMessages((prev) =>
        prev.map((m) =>
          m.status === "typing"
            ? { ...m, content: data.reply, status: "sent" as const }
            : m,
        ),
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.status === "typing"
            ? { ...m, content: "", status: "error" as const }
            : m,
        ),
      )
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleNew = () => {
    setMessages([])
    setIsNew(true)
    setActiveConvo("")
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Roboto', sans-serif; background: ${C.bg}; }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); opacity: .4 } 30% { transform: translateY(-5px); opacity: 1 } }
        @keyframes cursorBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        button:focus-visible { outline: 2px solid ${C.orange}; outline-offset: 2px; }
        input:focus-visible { outline: 2px solid ${C.orange}; outline-offset: 2px; }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          background: C.bg,
          fontFamily: "Roboto, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Sidebar
          convos={convos}
          activeId={activeConvo}
          onSelect={(id) => {
            setActiveConvo(id)
            setIsNew(false)
          }}
          onNew={handleNew}
          open={sidebarOpen}
        />

        {/* Main */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 18px",
              borderBottom: `1px solid ${C.border}`,
              background: C.bg,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle sidebar"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.muted,
                  display: "flex",
                  padding: 6,
                  borderRadius: 7,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.sidebarHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <MenuIcon />
              </button>
              <span
                style={{
                  color: C.text,
                  fontSize: 14,
                  fontWeight: 500,
                  maxWidth: 280,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isNew
                  ? "New conversation"
                  : (convos.find((c) => c.id === activeConvo)?.title ??
                    "Conversation")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#5C6BC0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
                  S
                </span>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div className="chat-scroll" style={{ flex: 1, overflowY: "auto" }}>
            {messages.length === 0 || isNew ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <EmptyState
                  onPrompt={(p) => {
                    setIsNew(false)
                    send(p)
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  maxWidth: 900,
                  margin: "0 auto",
                  padding: "24px 0 8px",
                }}
              >
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 24px 20px",
              background: C.bg,
            }}
          >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div
                style={{
                  background: C.inputBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  transition: "border-color 0.15s",
                }}
                onFocusCapture={(e) =>
                  (e.currentTarget.style.borderColor = C.orange)
                }
                onBlurCapture={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    autoResize()
                  }}
                  onKeyDown={handleKey}
                  placeholder="How can I help you today?"
                  rows={1}
                  aria-label="Message input"
                  style={{
                    width: "100%",
                    resize: "none",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "14px 16px 8px",
                    fontSize: 14.5,
                    color: C.text,
                    fontFamily: "Roboto, sans-serif",
                    lineHeight: 1.6,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px 10px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        color: C.muted,
                        fontSize: 12.5,
                        cursor: "pointer",
                        fontFamily: "Roboto, sans-serif",
                        padding: "4px 8px",
                        borderRadius: 7,
                        transition: "background 0.12s, color 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.sidebarHover
                        e.currentTarget.style.color = C.text
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none"
                        e.currentTarget.style.color = C.muted
                      }}
                    >
                      <AttachIcon /> Attach
                    </button>
                    <ModelSelector model={model} onChange={setModel} />
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#555",
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      {input.length > 0
                        ? `${input.length} chars`
                        : "Shift+Enter for new line"}
                    </span>
                    <button
                      onClick={() => send()}
                      disabled={!input.trim()}
                      aria-label="Send message"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        border: "none",
                        cursor: input.trim() ? "pointer" : "not-allowed",
                        background: input.trim() ? C.orange : C.sidebarHover,
                        color: input.trim() ? C.white : "#555",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (input.trim())
                          e.currentTarget.style.background = C.orangeHover
                      }}
                      onMouseLeave={(e) => {
                        if (input.trim())
                          e.currentTarget.style.background = C.orange
                      }}
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#444",
                  marginTop: 8,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Clause can make mistakes. Consider verifying important
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
