import Navbar from './components/Navbar';
import TrustedBrands from './pages/TrustedBrands';
import Home from './pages/Home'; 
import Feature from './pages/Feature';
import Blog from './pages/Blog';
import Footer from './pages/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SwapPage from './pages/Pages_Testnet/SwapPages';
import PoolPage from './pages/Pages_Testnet/PoolPages';
import PointsPage from './pages/Pages_Testnet/PointPages';
import { AnimatePresence } from 'framer-motion';

// Kita buat komponen LandingPage agar App.tsx tidak terlalu penuh
const LandingPage = () => (
  <main>
    <div className="bg-zinc-100">
      <section className="relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 flex justify-center items-start">
          <div className="grid-bg"></div>
        </div>

      {/* Content Above Grid */}
      <div className="relative z-10">
        <Navbar />
        <Home />
        <TrustedBrands />
      </div>
    </section>

    {/* SECTION CLEAN */}
    <section className="bg-white relative">
      <Feature />
    </section>
    <section className='bg-white pt-28'>
      <Blog />
    </section>
    <Footer />
  </div>
  </main>
);

function App() {
  return (
    <Router><AnimatePresence mode="wait">
      <Routes>
            
        {/* Path "/" akan menampilkan seluruh komponen Landing Page */}
        <Route path="/" element={<LandingPage />} /> 
        
        {/* Path "/swap" akan menampilkan halaman FaroSwap */}
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/pool" element={<PoolPage />} />
        <Route path="/points" element={<PointsPage />} />
        
      </Routes></AnimatePresence>
    </Router>
  );
}

export default App;