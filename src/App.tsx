import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'
import OSEntry from './pages/OSEntry'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Experience from './pages/Experience'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import { LikeProvider } from './context/LikeContext'

export default function App() {
  return (
    <LikeProvider>
    <Routes>
      <Route path="/" element={<ComingSoon />} />
      <Route path="/entry" element={<OSEntry />} />
      <Route path="/home" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/experience" element={<Experience />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
    </LikeProvider>
  )
}
