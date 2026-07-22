import { BrowserRouter, Routes, Route } from "react-router-dom"
import BlogLayout from "./components/BlogLayout"
import BlogHome from "./components/BlogHome"
import BlogPost from "./components/BlogPost"
import Admin from "./components/Admin"

export default function App() {
  return (
    <BrowserRouter>
      <BlogLayout>
        <Routes>
          <Route path="/" element={<BlogHome />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BlogLayout>
    </BrowserRouter>
  )
}
