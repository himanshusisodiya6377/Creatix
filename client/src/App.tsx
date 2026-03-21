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
import { useEffect } from 'react'


const App = () => {

  const {pathname} = useLocation()

useEffect(()=>{
  window.scrollTo(0,0)
}, [pathname])

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/view/')
            || pathname.startsWith('/preview')

  return (
    <div>
      <Toaster/>
      {!hideNavbar && <Navbar/>}
      
      <Routes>  
        <Route path='/' element={<Home />} />
        <Route path='/pricing' element={<Pricing/>} />
        <Route path='/projects/:projectId' element={<Projects/>} />
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