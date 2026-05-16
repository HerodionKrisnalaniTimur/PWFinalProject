import Sidebar from "../../components/SideBar";
import { Wallet, Star, Trophy } from "lucide-react";

const PointsPage = () => {
  return (
    <div className="h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 z-0" style={{ 
        backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', 
        backgroundSize: '30px 30px',
        opacity: '0.5'
      }}></div>

    <Sidebar />

      <main className="flex-1 flex flex-col p-8 z-10 relative overflow-y-auto custom-scrollbar">
        <header className="flex justify-end gap-4 mb-12">
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">P</div> Pharos
          </button>
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <Wallet size={16} /> 0xDE34...35ff
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center pt-4">
          <div className="w-full max-w-3xl flex gap-6">
            
            {/* Points Balance Card */}
            <div className="flex-1 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 shadow-lg text-white">
              <div className="flex items-center gap-2 text-blue-100 font-medium mb-4">
                <Star size={20} fill="currentColor" /> Total Points
              </div>
              <h2 className="text-5xl font-extrabold tracking-tight mb-2">12,450</h2>
              <p className="text-sm text-blue-100/80">Keep swapping to earn more rewards!</p>
            </div>

            {/* Current Rank Card */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-sm flex flex-col justify-center items-center">
               <Trophy size={40} className="text-yellow-500 mb-4" />
               <h3 className="text-xl font-bold text-gray-700">Gold Tier</h3>
               <p className="text-sm text-gray-400 mt-1">Top 5% of all traders</p>
            </div>

          </div>

          {/* Activity/History Section */}
          <div className="w-full max-w-3xl mt-8 bg-[#EFEFEF]/50 rounded-3xl p-8 border border-white/50">
            <h3 className="text-xl font-bold text-gray-600 mb-4">Recent Point Activity</h3>
            <div className="h-32 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-medium">
              No recent activity
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PointsPage;