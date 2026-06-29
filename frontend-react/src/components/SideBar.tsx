import { useState, useEffect } from 'react';
import { LayoutGrid, Droplets, Star, X, Send, Disc, BookOpen, Menu, ChevronLeft, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem('sidebarOpen') === 'true');

  const toggleOpen = (val: boolean) => {
    setIsOpen(val);
    localStorage.setItem('sidebarOpen', String(val));
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      {/* Tombol Hamburger */}
      {!isOpen && (
        <button
          onClick={() => toggleOpen(true)}
          className="fixed top-8 left-8 z-50 bg-white p-3 rounded-xl shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 transition-all hover:scale-105"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay gelap - hanya di HP saat sidebar terbuka */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => toggleOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          h-screen bg-[#EFEFEF]/80 backdrop-blur-md
          border-r border-white/50 flex flex-col
          transition-all duration-300 shadow-sm

          fixed left-0 top-0 z-40

          ${isOpen
            ? 'w-[280px] p-6 sm:p-8 opacity-100 rounded-r-3xl translate-x-0'
            : 'w-0 p-0 opacity-0 overflow-hidden border-none -translate-x-full'
          }
        `}
      >
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg shadow-blue-200">Z</div>
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">Zentrix</h1>
          </div>
          <button
            onClick={() => toggleOpen(false)}
            className="text-gray-400 hover:text-gray-700 bg-white/60 p-1.5 rounded-lg shadow-sm hover:bg-white transition-all"
            title="Hide Sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Link to="/swap" replace className={`p-4 rounded-2xl flex flex-col gap-1 transition-all ${currentPath === '/swap' ? 'bg-white shadow-sm border border-white' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
            <div className={`flex items-center gap-3 font-bold text-lg ${currentPath === '/swap' ? 'text-blue-600' : ''}`}>
              <LayoutGrid size={20} /> Swap
            </div>
            <p className={`text-xs ml-8 whitespace-nowrap ${currentPath === '/swap' ? 'text-gray-500' : ''}`}>Guiding your trades</p>
          </Link>

          <Link to="/pool" replace className={`p-4 rounded-2xl flex flex-col gap-1 transition-all ${currentPath === '/pool' ? 'bg-white shadow-sm border border-white' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
            <div className={`flex items-center gap-3 font-bold text-lg ${currentPath === '/pool' ? 'text-blue-600' : ''}`}>
              <Droplets size={20} /> Pool
            </div>
            <p className={`text-xs ml-8 whitespace-nowrap ${currentPath === '/pool' ? 'text-gray-500' : ''}`}>Anchor assets safely</p>
          </Link>

          <Link to="/points" replace className={`p-4 rounded-2xl flex flex-col gap-1 transition-all ${currentPath === '/points' ? 'bg-white shadow-sm border border-white' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
            <div className={`flex items-center gap-3 font-bold text-lg ${currentPath === '/points' ? 'text-blue-600' : ''}`}>
              <Star size={20} /> Points
            </div>
            <p className={`text-xs ml-8 whitespace-nowrap ${currentPath === '/points' ? 'text-gray-500' : ''}`}>Track loyalty points</p>
          </Link>

          <Link to="/convers" replace className={`p-4 rounded-2xl flex flex-col gap-1 transition-all ${currentPath === '/convers' ? 'bg-white shadow-sm border border-white' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
            <div className={`flex items-center gap-3 font-bold text-lg ${currentPath === '/convers' ? 'text-blue-600' : ''}`}>
              <RefreshCw size={20} /> Convers
            </div>
            <p className={`text-xs ml-8 whitespace-nowrap ${currentPath === '/convers' ? 'text-gray-500' : ''}`}>Digital & Crypto Conversion</p>
          </Link>
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-200">
          <div className="flex gap-6 text-gray-400 mb-6">
            <X size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <Send size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <Disc size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <BookOpen size={18} className="hover:text-blue-500 cursor-pointer transition-colors" />
          </div>
          <p className="text-[10px] text-gray-400 tracking-widest font-bold whitespace-nowrap">Powered by ZENTRIX DEXpert</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;