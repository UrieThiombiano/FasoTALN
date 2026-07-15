import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Decouvrir from './pages/Decouvrir'
import Communiquer from './pages/Communiquer'
import FasoGuide from './pages/FasoGuide'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/decouvrir"   element={<Decouvrir />} />
            <Route path="/communiquer" element={<Communiquer />} />
            <Route path="/fasoquide"   element={<FasoGuide />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
