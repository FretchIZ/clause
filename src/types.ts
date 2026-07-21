export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
  tags: string[]
  author: string
  content: string
  featured?: boolean
}

export interface Category {
  name: string
  count: number
}
