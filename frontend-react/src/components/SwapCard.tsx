import { useState } from 'react';
import { Settings, ArrowDown } from 'lucide-react';

const AVAILABLE_TOKENS = ["ZTX", "USDT", "USDC"];

const SwapCard = () => {
  const [amount, setAmount] = useState("");
  const [tokenIn, setTokenIn] = useState("WPROS");
  const [tokenOut, setTokenOut] = useState("USDC");

  // Fungsi untuk memutarbalikkan koin saat ikon tengah diklik
  const handleSwitch = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  return (
    <div className="w-full max-w-[500px] bg-[#EFEFEF]/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Swap</h2>
        <Settings size={20} className="text-gray-400" />
      </div>

      {/* Input Token 1 */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mb-2">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-700 rounded-full text-white text-[10px] flex items-center justify-center shrink-0">Z</div>
            
            {/* Dropdown Koin 1 */}
            <select 
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="appearance-none bg-transparent outline-none font-bold cursor-pointer pr-4 z-10"
            >
              {AVAILABLE_TOKENS.map(token => (
                <option key={`in-${token}`} value={token}>{token}</option>
              ))}
            </select>
            <span className="text-[8px] text-gray-400 absolute right-3 pointer-events-none">▼</span>
            
          </div>
          <span className="text-gray-400 font-medium">Balance: 0</span>
        </div>
        <input 
          type="number" 
          placeholder="0.00" 
          className="bg-transparent text-4xl w-full outline-none font-medium placeholder:text-gray-300"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-gray-400 text-sm mt-1">-</p>
      </div>

      {/* Switch Icon */}
      <div className="flex justify-center -my-6 relative z-20">
        <div 
          onClick={handleSwitch}
          className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ArrowDown size={18} className="text-gray-400" />
        </div>
      </div>

      {/* Input Token 2 */}
      <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-inner mt-2 mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-bold">
          <div className="relative flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
            <div className="w-5 h-5 bg-blue-400 rounded-full text-white text-[10px] flex items-center justify-center font-serif shrink-0">$</div>
            
            {/* Dropdown Koin 2 */}
            <select 
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="appearance-none bg-transparent outline-none font-bold cursor-pointer pr-4 z-10"
            >
              {AVAILABLE_TOKENS.map(token => (
                <option key={`out-${token}`} value={token}>{token}</option>
              ))}
            </select>
            <span className="text-[8px] text-gray-400 absolute right-3 pointer-events-none">▼</span>
            
          </div>
          <span className="text-gray-400 font-medium">Balance: 0</span>
        </div>
        <div className="text-4xl font-medium text-gray-800">
          {amount ? (parseFloat(amount) * 1000).toLocaleString() : "-"}
        </div>
        <p className="text-gray-400 text-sm mt-1">-</p>
      </div>

      <div className="flex items-start gap-2 bg-orange-50/50 p-4 rounded-2xl mb-6 border border-orange-100">
        <div className="w-5 h-5 bg-orange-400 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0">!</div>
        <p className="text-[11px] text-orange-700 font-semibold leading-relaxed">
          The current network is inconsistent with the wallet - please switch in wallet
        </p>
      </div>

      <button className="w-full bg-[#3366FF] hover:bg-blue-700 text-white py-5 rounded-[24px] font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
        Switch Now
      </button>
    </div>
  );
};

export default SwapCard;