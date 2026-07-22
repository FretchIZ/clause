import { Link } from "react-router-dom"
import type { BlogPost } from "../types"

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block border-b border-[#111] py-5 transition-all last:border-0"
    >
      <div className="flex items-center gap-3 text-[11px] text-[#333]">
        <span className="text-[#555]">{post.category}</span>
        <span>·</span>
        <span>{post.readTime}</span>
        <span>·</span>
        <span>{post.date}</span>
      </div>

      <h3 className="mt-1.5 text-base font-medium text-white transition-colors group-hover:text-orange-400">
        {post.title}
      </h3>

      <p className="mt-1 text-sm text-[#555] leading-relaxed line-clamp-2">
        {post.description}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] text-[#333]">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
