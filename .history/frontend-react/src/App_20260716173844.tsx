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
import ConversPage from "./pages/Pages_Testnet/ConversPage";
import NewsPage from './pages/NewsPage';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import FaucetPage from './pages/Faucet/FaucetPage';
import ScrollToTopButton from './components/ScrollToTopButton';

// ============================================
// ✅ IMPORT HALAMAN ADMIN DASHBOARD
// ============================================
import { MetaMaskProvider } from './context/MetaMaskContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard'; // ✅ TAMBAHKAN INI
import ManageUsers from './pages/ManageUsers';

// Landing Page Component
const LandingPage = () => (
  <main>
    <div className="bg-zinc-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-start">
          <div className="grid-bg"></div>
        </div>

      <div className="relative z-10">
        <Navbar />
        <Home />
        <TrustedBrands />
      </div>
    </section>

    <section className="bg-white relative">
      <Feature />
    </section>
    <section className='bg-white pt-18'>
      <Blog />
    </section>
    <Footer />
  </div>
  </main>
);

function App() {
  return (
    <MetaMaskProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} /> 
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/pool" element={<PoolPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/convers" element={<ConversPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<ArticleDetail />} />
            <Route path="/faucet" element={<FaucetPage walletAddress={''} />} />
            
            
            {/* ============================================
                ✅ ADMIN ROUTES (Semua di-protect)
                ============================================ */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/create" 
              element={
                <ProtectedRoute>
                  <CreateArticle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditArticle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>

        {/* Tombol scroll ke atas, muncul di semua halaman setelah user scroll */}
        <ScrollToTopButton />
      </Router>
    </MetaMaskProvider>
  );
}

export default App;