import { BrowserRouter, Routes, Route } from "react-router-dom"
import BlogLayout from "./components/BlogLayout"
import BlogHome from "./components/BlogHome"
import BlogPost from "./components/BlogPost"

export default function App() {
  return (
    <BrowserRouter>
      <BlogLayout>
        <Routes>
          <Route path="/" element={<BlogHome />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </BlogLayout>
    </BrowserRouter>
  )
}
