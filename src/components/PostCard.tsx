import { Link } from "react-router-dom"
import type { BlogPost } from "../types"

export default function PostCard({ post, featured }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] transition-all hover:border-[#333] hover:bg-[#111] ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-6" : ""
      }`}
    >
      <div className={`${featured ? "p-6" : "p-5"}`}>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
            {post.category}
          </span>
          <span className="text-xs text-[#555]">{post.readTime}</span>
        </div>

        <h3
          className={`font-semibold text-white group-hover:text-orange-400 transition-colors ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          {post.title}
        </h3>

        <p className={`mt-2 text-[#888] leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
          {post.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#555]">{post.date}</span>
          {featured && (
            <span className="text-sm font-medium text-orange-400 opacity-0 transition-opacity group-hover:opacity-100">
              Read more →
            </span>
          )}
        </div>

        {!featured && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#666]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {featured && (
        <div className="hidden md:flex items-center justify-center p-6">
          <div className="h-48 w-full rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-[#1a1a1a] flex items-center justify-center">
            <span className="text-5xl opacity-20">{post.title[0]}</span>
          </div>
        </div>
      )}
    </Link>
  )
}
