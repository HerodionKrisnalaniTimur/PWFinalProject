import Sidebar from "../../components/SideBar";
import { Wallet, Droplets, Plus } from "lucide-react";

const PoolPage = () => {
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
        {/* Header yang sama dengan SwapPage */}
        <header className="flex justify-end gap-4 mb-12">
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">P</div> Pharos
          </button>
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <Wallet size={16} /> 0xDE34...35ff
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center pt-4">
          <div className="w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Droplets className="text-blue-500" /> Liquidity Pools
                </h2>
                <p className="text-gray-500 mt-2 text-sm">Provide liquidity to earn trading fees and rewards.</p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                <Plus size={20} /> Add Liquidity
              </button>
            </div>

            <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/50">
              <Droplets size={32} className="mb-3 text-gray-300" />
              <p>You don't have any active liquidity positions.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoolPage;