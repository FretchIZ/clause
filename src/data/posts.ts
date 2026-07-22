import type { BlogPost, Category } from "../types"

export const categories: Category[] = [
  { name: "React", count: 1 },
  { name: "TypeScript", count: 1 },
  { name: "DevOps", count: 1 },
]

export const posts: BlogPost[] = [
  {
    slug: "building-modern-web-apps", title: "Building Modern Web Apps with React 19", description: "Exploring the new features in React 19 and how they change the way we build applications.", date: "2026-07-20", readTime: "8 min", category: "React", tags: ["React", "Frontend", "Web"], author: "Webu", content: "React 19 introduces several groundbreaking features...",
  },
  {
    slug: "understanding-typescript-generics", title: "Understanding TypeScript Generics", description: "A practical guide to generics in TypeScript with real-world examples.", date: "2026-07-15", readTime: "6 min", category: "TypeScript", tags: ["TypeScript", "Types"], author: "Webu", content: "Generics are one of TypeScript's most powerful features...",
  },
  {
    slug: "docker-for-developers", title: "Docker for Developers: A Practical Introduction", description: "Get started with Docker containers for local development and deployment.", date: "2026-07-10", readTime: "7 min", category: "DevOps", tags: ["Docker", "DevOps", "Containers"], author: "Webu", content: "Docker simplifies development by packaging applications...",
  },
]
