import Sidebar from "../../components/Sidebar";
import SwapCard from "../../components/SwapCard";
import { Wallet } from "lucide-react";
const SwapPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 z-0" style={{ 
        backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', 
        backgroundSize: '30px 30px',
        opacity: '0.5'
      }}></div>

      <Sidebar />

      <main className="flex-1 flex flex-col p-8 z-10 relative">
        <header className="flex justify-end gap-4 mb-12">
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">P</div> Pharos
          </button>
          <button className="bg-[#EFEFEF] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-white shadow-sm hover:bg-white transition-all">
             <Wallet size={16} /> 0xDE34...35ff
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center pt-12">
          <SwapCard />
        </div>

        <div className="w-full max-w-6xl mx-auto mt-12 bg-[#EFEFEF]/50 rounded-3xl p-8 border border-white/50">
          <h3 className="text-xl font-bold text-gray-600 mb-4">Order History</h3>
          <div className="h-40 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-medium">
            No transactions found
          </div>
        </div>
      </main>
    </div>
  );
};

export default SwapPage;