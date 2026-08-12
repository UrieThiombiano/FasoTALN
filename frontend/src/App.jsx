import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollManager from './components/layout/ScrollManager'
import ChatWidget from './components/chat/ChatWidget'
import Home from './pages/Home'
import Nouvelles from './pages/Nouvelles'
import Langues from './pages/Langues'
import Defis from './pages/Defis'
import Glossaire from './pages/Glossaire'
import Ressources from './pages/Ressources'
import Approches from './pages/Approches'
import Contribution from './pages/Contribution'
import DemoG2P from './pages/DemoG2P'
import Pipeline from './pages/Pipeline'
import Resultats from './pages/Resultats'
import Perspectives from './pages/Perspectives'
import Ecosysteme from './pages/Ecosysteme'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <ScrollManager />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/nouvelles"     element={<Nouvelles />} />
            <Route path="/langues"       element={<Langues />} />
            <Route path="/defis"         element={<Defis />} />
            <Route path="/glossaire"     element={<Glossaire />} />
            <Route path="/ressources"    element={<Ressources />} />
            <Route path="/approches"     element={<Approches />} />
            <Route path="/contribution"  element={<Contribution />} />
            <Route path="/demo-g2p"      element={<DemoG2P />} />
            <Route path="/pipeline"      element={<Pipeline />} />
            <Route path="/resultats"     element={<Resultats />} />
            <Route path="/perspectives"  element={<Perspectives />} />
            <Route path="/ecosysteme"    element={<Ecosysteme />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </BrowserRouter>
  )
}
