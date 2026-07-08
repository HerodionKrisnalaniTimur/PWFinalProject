import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";

import {
  Wallet,
  Star,
  Trophy,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  X,
  Trash2
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// IMPORT GAMBAR BARU DARI FOLDER ASSETS
import hydePin from "../../assets/sanshee_coffee-talk_Hyde-collector_s-pin.webp";
import baileysPin from "../../assets/coffee-talk_pin_baileys-collectors-front-TEMP_web.webp";
import luaPin from "../../assets/coffee-talk_pin_lua-collectors_web.webp";
import aquaPin from "../../assets/coffee-talk_pin_aqua-collectors_web.webp";
import neilPin from "../../assets/sanshee_coffee-talk_Neil-collector_s-pin.webp";
import standee from "../../assets/product-image_Coffee-Talk_Hyde-Neil-Standee_WBG.webp";
import mojikenCard from "../../assets/Game Gift Card MojiKeN.png";
declare global {
  interface Window { 
    ethereum?: any;
  }
}

// 1. TAMBAHKAN DAT INI DI SINI
const rewardItems = [
  { id: 1, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Baileys Collector's Pin", price: 1500, img: baileysPin, tag: "New" },
  { id: 2, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Lua Collector's Pin", price: 2500, img: luaPin, tag: "New" },
  { id: 3, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Aqua Collector's Pin", price: 2500, img: aquaPin, tag: "New" },
  { id: 4, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Neil Collector's Pin", price: 2500, img: neilPin, tag: "New" },
  { id: 5, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Hyde Collector's Pin", price: 2500, img: hydePin, tag: "New" },
  { id: 6, studio: "TOGE PRODUCTIONS", itemName: "Coffee Talk - Hyde & Neil Standee", price: 5000, oldPrice: 6500, img: standee, tag: "Save 1.500 PTS" },
  { id: 7, studio: "MOJIKEN STUDIO", itemName: "Mojiken Studio Exclusive E-Voucher", price: 1500, img: mojikenCard, tag: "Digital" },
];

const PointsPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userPoints, setUserPoints] = useState(1250); 
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [quantity, setQuantity] = useState(1); 
  const [cart, setCart] = useState<any[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Simulasi memuat data aktivitas poin
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [walletAddress]);

  // Cek koneksi akun otomatis saat pertama kali dApp dibuka
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ 
            method: "eth_accounts" 
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Gagal mengecek koneksi:", error);
        }
      }
    };
    checkConnection();
  }, []);

  // Listener otomatis mendeteksi pergantian akun MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  // Fungsi interaktif tombol hubungkan / ganti wallet
  const handleWalletAction = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error: any) {
        console.error("Gagal mengonfigurasi wallet:", error);
      }
    } else {
      alert("Silakan install ekstensi MetaMask terlebih dahulu!");
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const openItemDetail = (item: any) => {
    setSelectedItem(item);
    setQuantity(1); 
  };

  const closeItemDetail = () => {
    setSelectedItem(null);
  };

  // FUNGSI KERANJANG BELANJA
const handleAddToCart = () => {
    // 1. Masukkan barang ke keranjang
    const existingItem = cart.find((item: any) => item.id === selectedItem.id);
    
    if (existingItem) {
      setCart(cart.map((item: any) => item.id === selectedItem.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { ...selectedItem, quantity }]);
    }  
    closeItemDetail();
    setIsCartModalOpen(true);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(cart.filter((item: any) => item.id !== id));
  };

  const handleCheckoutCart = () => {
    const totalCost = cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    
    if (userPoints >= totalCost) {
      setUserPoints(userPoints - totalCost);
      setCart([]); 
      setIsCartModalOpen(false); 
      alert(`Pembayaran sukses! Kamu menghabiskan ${totalCost.toLocaleString()} PTS. Sisa poin: ${userPoints - totalCost} PTS`);
    } else {
      alert(`Gagal! Poinmu tidak cukup. Total belanjaan: ${totalCost.toLocaleString()} PTS.`);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        
        {/* Latar Belakang */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-10 left-10 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 right-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl" />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto">
          
          {/* Header Bar */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">Z</div>
              Zentrix Loyalty
            </motion.button>

            <motion.button
              onClick={handleWalletAction}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border shadow-md cursor-pointer transition-all ${
                walletAddress ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100" : "bg-white/70 border-white text-[#1A1A1A] hover:bg-white"
              }`}
            >
              <Wallet size={16} className={walletAddress ? "text-emerald-600" : ""} />
              {walletAddress ? `${formatAddress(walletAddress)}` : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Grid Konten Point */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card Kiri: Total Points */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><Star className="text-yellow-500 fill-yellow-500" />Your Points</h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Tier 1 Trader</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Accumulated rewards balance</p>
                <h1 className="text-5xl font-black text-gray-900 mt-2 tracking-tight">{walletAddress ? userPoints.toLocaleString() : "0"} <span className="text-xl font-bold text-gray-400">PTS</span></h1>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5"><Sparkles size={14} className="text-yellow-500" /> Points are updated every block confirmation.</div>
            </motion.div>

            {/* Card Kanan: Global Rank */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><Trophy className="text-amber-500" />Global Rank</h2>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">Top 5%</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">Your current standing position</p>
                <h1 className="text-5xl font-black text-gray-900 mt-2 tracking-tight">#{walletAddress ? "412" : "--"} <span className="text-xl font-bold text-gray-400">of all traders</span></h1>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-green-600 font-semibold flex items-center gap-1.5"><TrendingUp size={16} /> +240 rank positions gained this week.</div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto mt-6 mb-6 bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-xl">
            
            {selectedItem ? (
              /* --- TAMPILAN 2: DETAIL PRODUK --- */
              <div className="animate-in fade-in duration-300">
                <div className="text-xs text-gray-500 mb-6 flex items-center gap-2 font-medium">
                  <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={closeItemDetail}>Home</span> 
                  <span>&gt;</span>
                  <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={closeItemDetail}>Redeem Rewards</span> 
                  <span>&gt;</span>
                  <span className="text-gray-800 font-bold">{selectedItem.itemName}</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 bg-[#F8F9FA] rounded-2xl overflow-hidden border border-gray-100">
                  <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-white">
                    <img src={selectedItem.img} alt={selectedItem.itemName} className="w-64 h-64 object-contain drop-shadow-md" />
                  </div>

                  <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{selectedItem.itemName}</h2>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">{selectedItem.studio}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <span className="text-sm font-medium text-gray-500 w-16">Price:</span>
                      <span className="text-3xl font-black text-gray-900">{selectedItem.price.toLocaleString()} <span className="text-lg text-gray-400 font-bold">PTS</span></span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <span className="text-sm font-medium text-gray-500 w-16">Qty:</span>
                      <div className="flex border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
                        <button className="w-12 py-2 text-gray-500 hover:bg-gray-100 font-bold transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                        <input type="text" value={quantity} readOnly className="w-14 text-center border-l-2 border-r-2 border-gray-200 text-sm font-bold focus:outline-none bg-white text-gray-800" />
                        <button className="w-12 py-2 text-gray-500 hover:bg-gray-100 font-bold transition-colors" onClick={() => setQuantity(quantity + 1)}>+</button>
                      </div>
                    </div>
                    
                    <button onClick={handleAddToCart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Confirm Redeem
                    </button>
                  </div>
                </div>
              </div>

            ) : (
              /* --- TAMPILAN 1: DAFTAR KARTU SANSHEE --- */
              <div>
                {/* Header Bawaan Zentrix (Sesuai Screenshot) */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Redeem Rewards</h3>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                    Tersedia: {walletAddress ? userPoints.toLocaleString() : "0"} PTS
                  </span>
                </div>
                {/* Grid Produk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rewardItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-[24px] p-4 flex flex-col shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">        
                      {/* Kotak Gambar */}
                      <div 
                        onClick={() => openItemDetail(item)}
                        className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-transparent flex items-center justify-center cursor-pointer">
                        <img src={item.img} alt={item.itemName} className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-500" />
                        {/* Tag Promo */}
                        {item.tag && (
                          <div className="absolute bottom-3 left-3 bg-[#D43D9D] text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wider pointer-events-none">
                            {item.tag}
                          </div>
                        )}
                      </div>       
                      {/* Detail Teks */}
                      <div className="mt-4 mb-5 flex justify-between items-start gap-3 flex-1 px-1">
                        {/* Kiri: Nama & Studio */}
                        <div className="flex flex-col flex-1">
                          <h4 
                            onClick={() => openItemDetail(item)}
                            className="font-bold text-gray-800 text-[14px] leading-tight mb-1 hover:text-[#27BDE2] transition-colors pr-2 cursor-pointer"
                          >
                            {item.itemName}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{item.studio}</span>
                        </div>   
                        {/* Kanan: Harga */}
                        <div className="flex flex-col items-end text-right shrink-0">
                          {item.oldPrice && (
                            <span className="text-gray-400 line-through text-[10px] font-bold mb-0.5">{item.oldPrice.toLocaleString()} PTS</span>
                          )}
                          <div className="flex flex-col items-end leading-none">
                            <span className="text-[#27BDE2] font-black text-lg">{item.price.toLocaleString()}</span>
                            <span className="text-[#27BDE2] text-[9px] font-bold uppercase mt-1">PTS</span>
                          </div>
                        </div>
                      </div>
                      {/* Tombol Add to Cart */}
                      <button onClick={(e) => { e.stopPropagation(); openItemDetail(item); }} className="w-full bg-[#27BDE2] hover:bg-[#1E9EBD] text-white font-bold py-3.5 px-4 rounded-[14px] text-[12px] transition-colors flex items-center justify-center gap-2 uppercase tracking-wider">
                        <ShoppingCart size={16} />
                        Add to cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}  

          </motion.div>

          {/* Card Bawah: Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto mt-6 bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Point Activity</h3>
            {loading ? (
              <div className="space-y-4 animate-pulse">›
                <div className="h-16 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : walletAddress ? (
              <div className="space-y-3">
                <div className="bg-[#F8F9FA]/80 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Liquidity Provision Reward</h5>
                    <p className="text-xs text-gray-400 mt-0.5">10 minutes ago • Jaringan Sepolia</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600">+150 PTS</span>
                </div>
                <div className="bg-[#F8F9FA]/80 p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Token Swap Interaction</h5>
                    <p className="text-xs text-gray-400 mt-0.5">2 hours ago • Jaringan Sepolia</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600">+50 PTS</span>
                </div>
              </div>
            ) : (
              <div className="h-44 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 font-medium bg-[#F8F9FA]/60">
                <Star size={36} className="mb-3 text-gray-300" />
                <p className="text-center text-sm">Target wallet does not have any recorded loyalty activities.</p>
              </div>
            )}
          </motion.div>
          {/* Floating Cart Button */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="fixed bottom-28 right-8 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl z-[70] font-bold text-sm flex items-center gap-3 border border-gray-700"
            >
              <div className="w-8 h-8 bg-[#27BDE2] rounded-full flex items-center justify-center">
                <ShoppingCart size={16} className="text-white" />
              </div>
              {toastMessage}
            </motion.div>
          )}

          {/* Tombol Melayang (SEKARANG SELALU TAMPIL MESKI KOSONG) */}
          <motion.button 
            initial={{ scale: 0 }} 
            animate={isCartBouncing ? { scale: [1, 1.3, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => setIsCartModalOpen(true)}
            className="fixed bottom-8 right-8 bg-[#27BDE2] hover:bg-[#1E9EBD] text-white p-4 rounded-full shadow-2xl flex items-center justify-center z-50 group transition-colors"
          >
            <ShoppingCart size={24} />
            
            {/* Lencana Angka (Hanya muncul jika ada barang) */}
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D43D9D] text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cart.reduce((total: number, item: any) => total + item.quantity, 0)}
              </span>
            )}
          </motion.button>

          

          {/* Popup Cart Modal */}
          {isCartModalOpen && (
             <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <ShoppingCart size={22} className="text-[#27BDE2]"/> Keranjang Belanja
                   </h3>
                   <button onClick={() => setIsCartModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={24} /></button>
                 </div>
                 <div className="p-6 overflow-y-auto flex-1 bg-white">
                   {cart.length === 0 ? (
                     <div className="text-center py-10 text-gray-400 font-medium">Keranjang masih kosong nih!</div>
                   ) : (
                     <div className="space-y-4">
                       {cart.map((item: any) => (
                         <div key={item.id} className="flex gap-4 items-center border border-gray-100 p-3 rounded-2xl bg-gray-50/50 relative group">
                           <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 border border-gray-100 shadow-sm overflow-hidden">
                             <img src={item.img} alt={item.itemName} className="w-full h-full object-contain" />
                           </div>
                           <div className="flex-1">
                             <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1 pr-6">{item.itemName}</h4>
                             <p className="text-xs text-[#27BDE2] font-black">{item.price.toLocaleString()} PTS <span className="text-gray-400 font-medium">x {item.quantity}</span></p>
                           </div>
                           <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-300 hover:text-red-500 absolute top-3 right-3 transition-colors bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 {cart.length > 0 && (
                   <div className="p-6 border-t border-gray-100 bg-gray-50">
                     <div className="flex justify-between items-center mb-4">
                       <span className="text-gray-500 font-medium text-sm">Total Tagihan:</span>
                       <span className="text-2xl font-black text-gray-900">
                         {cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0).toLocaleString()} <span className="text-lg text-gray-400">PTS</span>
                       </span>
                     </div>
                     <button onClick={handleCheckoutCart} className="w-full bg-[#27BDE2] hover:bg-[#1E9EBD] text-white font-bold py-4 rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                       <Star size={18} className="fill-white"/> Konfirmasi Penukaran
                     </button>
                   </div>
                 )}
               </motion.div>
             </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default PointsPage;