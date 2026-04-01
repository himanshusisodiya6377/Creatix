import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Projects from './pages/Projects'
import MyProjects from './pages/MyProjects'
import Preview from './pages/Preview'
import {  View } from 'lucide-react'
import Navbar from './components/Navbar'
import {Toaster} from "sonner"
import AuthPage from "./pages/auth/AuthPage"
import Setting from './pages/Setting'
import Generate from './pages/Generate'
import MyGenerations from './pages/MyGenerations'
import YtPreview from './pages/YtPreview'
import About from './pages/About'
import Contact from './pages/Support'
import { useEffect } from 'react'


const App = () => {

  const {pathname} = useLocation()

useEffect(()=>{
  window.scrollTo(0,0)
}, [pathname])

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/view/')
            || pathname.startsWith('/preview')

  return (
    <div className="relative min-h-screen">
      {/* ── Glassmorphism background orbs ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[oklch(0.07_0.025_162)]">
        <div className="orb-1 absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="orb-2 absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-teal-400/15 blur-[100px]" />
        <div className="orb-3 absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      <Toaster/>
      {!hideNavbar && <Navbar/>}
      
      <Routes>  
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/pricing' element={<Pricing/>} />
        <Route path='/project/:projectId' element={<Projects/>} />
        <Route path='/projects' element={<MyProjects/>} />
        <Route path='/preview/:projectId' element={<Preview/>} />
        <Route path='/preview/:projectId/:VersionId' element={<Preview/>} />
        <Route path='/preview' element={<YtPreview/>} />
         <Route path='/view/:projectId' element={<View/>} />
         <Route path="/auth/:pathname" element={<AuthPage />} />
         <Route path="/account/settings" element={<Setting />} />
         <Route path="/my-thumbnail" element={<MyGenerations />} />
         <Route path="/thumbnail" element={<Generate />} />
         <Route path="/thumbnail/:id" element={<Generate />} />
      </Routes>
    </div>
  )
}

export default App