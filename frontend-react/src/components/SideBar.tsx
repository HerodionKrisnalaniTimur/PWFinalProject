import { LayoutGrid, Droplets, Star, X, Send, Disc, BookOpen } from 'lucide-react';

const Sidebar = () => (
  <aside className="w-72 bg-[#EFEFEF]/80 backdrop-blur-md border-r border-white/50 p-8 flex flex-col z-10 m-4 rounded-3xl shadow-sm">
    <div className="flex items-center gap-3 mb-12">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg shadow-blue-200">F</div>
      <h1 className="text-2xl font-bold tracking-tight">FaroSwap</h1>
    </div>

    <nav className="flex flex-col gap-4 flex-1">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-white flex flex-col gap-1 cursor-pointer">
        <div className="flex items-center gap-3 font-bold text-lg text-blue-600">
          <LayoutGrid size={20} /> Swap
        </div>
        <p className="text-xs text-gray-500 ml-8">Guiding your trades through DeFi waters</p>
      </div>
      
      <div className="p-4 flex flex-col gap-1 text-gray-400 hover:text-gray-600 transition cursor-pointer">
        <div className="flex items-center gap-3 font-bold text-lg">
          <Droplets size={20} /> Pool
        </div>
        <p className="text-xs ml-8">Anchor assets safely in DeFi harbor</p>
      </div>

      <div className="p-4 flex flex-col gap-1 text-gray-400 hover:text-gray-600 transition cursor-pointer">
        <div className="flex items-center gap-3 font-bold text-lg">
          <Star size={20} /> Points
        </div>
        <p className="text-xs ml-8">Track your loyalty points & rewards</p>
      </div>
    </nav>

    <div className="mt-auto pt-8 border-t border-gray-200">
      <div className="flex gap-6 text-gray-400 mb-6">
        <X size={18} /> <Send size={18} /> <Disc size={18} /> <BookOpen size={18} />
      </div>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Powered by DODO DEXpert</p>
    </div>
  </aside>
);

export default Sidebar;