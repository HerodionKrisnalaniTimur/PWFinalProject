import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import { Wallet, RefreshCw, ArrowDownUp, Coins, Star, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Struktur data untuk kalkulator konversi
interface CurrencyOption {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
}

// Struktur data untuk tabel daftar harga crypto (seperti di gambar)
interface CryptoAsset {
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  priceIdr: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  sparklineData: number[]; // Data koordinat untuk grafik mini
}

const currencyList: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", type: "fiat" },
  { code: "IDR", name: "Indonesian Rupiah", type: "fiat" },
  { code: "EUR", name: "Euro", type: "fiat" },
  { code: "BTC", name: "Bitcoin", type: "crypto" },
  { code: "ETH", name: "Ethereum", type: "crypto" },
  { code: "USDT", name: "Tether", type: "crypto" },
];

const ConversPage = () => {
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("BTC");
  const [toCurrency, setToCurrency] = useState<string>("IDR");
  const [result, setResult] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

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

  // Fungsi untuk memanggil popup MetaMask
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("User menolak koneksi wallet", error);
      }
    } else {
      alert("Silakan install ekstensi MetaMask terlebih dahulu!");
    }
  };
  
  // State untuk menampung data list crypto
  const [cryptoList, setCryptoList] = useState<CryptoAsset[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([handleConvert(), fetchCryptoTableData()]);
      setLoading(false);
    };
    initializeData();
  }, []);

  // =========================================================================
  // 1. FUNGSI UTK KALKULATOR KONVERSI MATA UANG
  // =========================================================================
  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsConverting(true);
    try {
      // -----------------------------------------------------------------------
      // // === INTEGRASI API KALKULATOR KONVERSI ===
      // // Jalur penempatan API asli Anda untuk fitur kalkulator konversi.
      // // Contoh implementasi menggunakan CoinGecko / ExchangeRate API:
      //
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      // const data = await response.json();
      // const rate = data.rates[toCurrency];
      // setResult(Number(amount) * rate);
      // -----------------------------------------------------------------------

      // DATA MOCK (SIMULASI): Hapus blok di bawah jika Anda sudah memasang baris fetch API di atas
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockRates: Record<string, number> = {
        "BTC_IDR": 1334362886, "BTC_USD": 62000, "BTC_USDT": 62050,
        "ETH_IDR": 36499537,   "ETH_USD": 3300,  "ETH_USDT": 3305,
        "USDT_IDR": 17678,     "USD_IDR": 16000, "IDR_BTC": 0.00000000075,
      };
      const pairKey = `${fromCurrency}_${toCurrency}`;
      const reversePairKey = `${toCurrency}_${fromCurrency}`;
      let finalRate = 1;
      if (fromCurrency === toCurrency) finalRate = 1;
      else if (mockRates[pairKey]) finalRate = mockRates[pairKey];
      else if (mockRates[reversePairKey]) finalRate = 1 / mockRates[reversePairKey];
      else finalRate = 14.5;

      setResult(Number(amount) * finalRate);
    } catch (error) {
      console.error("Gagal melakukan konversi dari API:", error);
    } finally {
      setIsConverting(false);
    }
  };

  // =========================================================================
  // 2. FUNGSI UTK AMBIL DATA DAFTAR HARGA CRYPTO (TAMPILAN SEPERTI DI GAMBAR)
  // =========================================================================
  const fetchCryptoTableData = async () => {
    try {
      // -----------------------------------------------------------------------
      // // === INTEGRASI API DAFTAR CRYPTO (SEPERTI DI GAMBAR) ===
      // // Jalur penempatan API asli Anda untuk mengambil data list crypto top market cap.
      // // Contoh Endpoint CoinGecko: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=10&page=1&sparkline=true`
      //
      // const response = await fetch("URL_API_COINGECKO_ATAU_LAINNYA");
      // const data = await response.json();
      // // Lakukan mapping data dari API ke dalam state setCryptoList sesuai struktur CryptoAsset
      // -----------------------------------------------------------------------

      // DATA MOCK (SIMULASI): Sesuai persis dengan visual aset, harga, dan persentase pada gambar yang Anda unggah
      const mockCryptoData: CryptoAsset[] = [
        { rank: 1, name: "Bitcoin", symbol: "BTC", logo: "₿", priceIdr: 1334362886, change1h: -0.1, change24h: -2.7, change7d: -4.1, volume24h: 540999915824848, marketCap: 26733321211798676, sparklineData: [40, 35, 45, 30, 25, 38, 20, 15] },
        { rank: 2, name: "Ethereum", symbol: "ETH", logo: "Ξ", priceIdr: 36499537, change1h: -0.1, change24h: -3.1, change7d: -6.9, volume24h: 233752158494616, marketCap: 4405049034421476, sparklineData: [50, 48, 52, 42, 39, 41, 30, 25] },
        { rank: 3, name: "Tether", symbol: "USDT", logo: "₮", priceIdr: 17678, change1h: 0.0, change24h: -0.1, change7d: 0.5, volume24h: 953271617497458, marketCap: 3353712093129092, sparklineData: [30, 30, 31, 30, 30, 31, 30, 30] },
        { rank: 4, name: "BNB", symbol: "BNB", logo: "🔶", priceIdr: 11477949, change1h: -0.2, change24h: -1.3, change7d: -2.0, volume24h: 13488228641587, marketCap: 1546989174459624, sparklineData: [45, 42, 44, 40, 35, 37, 32, 28] },
        { rank: 5, name: "XRP", symbol: "XRP", logo: "✕", priceIdr: 23527, change1h: -0.4, change24h: -3.1, change7d: -6.8, volume24h: 31591787567078, marketCap: 1455223291858828, sparklineData: [40, 38, 35, 36, 30, 28, 25, 22] },
        { rank: 6, name: "USDC", symbol: "USDC", logo: "Ⓢ", priceIdr: 17695, change1h: 0.0, change24h: -0.1, change7d: 0.5, volume24h: 240903891565765, marketCap: 1354054279268381, sparklineData: [30, 30, 30, 30, 30, 30, 30, 30] },
        { rank: 7, name: "Solana", symbol: "SOL", logo: "◎", priceIdr: 1492421, change1h: 0.0, change24h: -3.1, change7d: -4.3, volume24h: 47963680437270, marketCap: 862543965129359, sparklineData: [30, 35, 42, 38, 36, 32, 28, 25] },
        { rank: 8, name: "TRON", symbol: "TRX", logo: "♦", priceIdr: 6397, change1h: -0.2, change24h: -0.8, change7d: 3.5, volume24h: 9582114023156, marketCap: 606420814571339, sparklineData: [20, 22, 25, 24, 26, 28, 32, 35] },
      ];
      
      setCryptoList(mockCryptoData);
    } catch (error) {
      console.error("Gagal memuat tabel data cryptocurrency dari API:", error);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  useEffect(() => {
    if (!loading) handleConvert();
  }, [fromCurrency, toCurrency]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <motion.div animate={{ x: [0, 30, 0], y: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity }} className="absolute top-10 right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-10 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl" />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">Z</div>
              Zentrix Convers
            </motion.button>
            <motion.button
              onClick={connectWallet}
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md cursor-pointer hover:bg-white transition-colors"
            >
              <Wallet size={16} />
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Area Utama Content */}
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 items-center pb-12">
            
            {/* CARD KALKULATOR KONVERSI */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Coins size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Currency Converter</h2>
                  <p className="text-xs text-gray-500">Kalkulator konversi real-time mata uang & crypto</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Jumlah</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Masukkan nominal..."
                    className="w-full bg-white border border-gray-100 p-4 rounded-2xl font-bold text-lg focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-9 items-center gap-2">
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Dari</label>
                    <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="w-full bg-white border border-gray-100 p-3.5 rounded-2xl font-semibold text-gray-700 focus:outline-none shadow-sm">
                      {currencyList.map((c) => <option key={`from-${c.code}`} value={c.code}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-center pt-4">
                    <button onClick={handleSwapCurrencies} className="p-2.5 bg-white hover:bg-blue-50 text-blue-600 border border-gray-100 rounded-xl shadow-md transition-all" title="Tukar Mata Uang">
                      <ArrowDownUp size={16} className="rotate-90 md:rotate-0" />
                    </button>
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Ke</label>
                    <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-full bg-white border border-gray-100 p-3.5 rounded-2xl font-semibold text-gray-700 focus:outline-none shadow-sm">
                      {currencyList.map((c) => <option key={`to-${c.code}`} value={c.code}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                </div>

                {result !== null && (
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-5 rounded-2xl text-white shadow-lg mt-2">
                    <p className="text-[11px] text-blue-100 font-medium">Hasil Konversi</p>
                    <div className="flex items-baseline justify-between mt-1 flex-wrap gap-1">
                      <h3 className="text-xl font-bold">{Number(amount).toLocaleString()} <span className="text-xs font-normal text-blue-100">{fromCurrency}</span></h3>
                      <span className="text-lg font-bold text-cyan-100">=</span>
                      <h3 className="text-2xl font-black text-yellow-300">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs font-normal bg-white text-blue-600 px-2 py-0.5 rounded-md ml-1">{toCurrency}</span></h3>
                    </div>
                  </div>
                )}

                <button onClick={handleConvert} disabled={isConverting} className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50">
                  <RefreshCw size={16} className={isConverting ? "animate-spin" : ""} />
                  {isConverting ? "Mengonversi..." : "Konversi Sekarang"}
                </button>
              </div>
            </motion.div>

            {/* TABEL LIVE MARKET CRYPTO (BAGIAN AKSI/BUY SUDAH DIHAPUS) */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 border border-white shadow-xl overflow-hidden">
              <div className="mb-6 flex justify-between items-center px-2">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-gray-800">Live Crypto Market Prices</h3>
                  <p className="text-xs text-gray-500">Harga pasar digital dan volume aset kripto teratas</p>
                </div>
                <button onClick={fetchCryptoTableData} className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-100 bg-white transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Pembungkus Tabel untuk Responsivitas Layar */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 pl-4 w-12 text-center">#</th>
                      <th className="py-4 px-4">Nama Koin</th>
                      <th className="py-4 px-4 text-right">Harga (IDR)</th>
                      <th className="py-4 px-4 text-center">1j %</th>
                      <th className="py-4 px-4 text-center">24j %</th>
                      <th className="py-4 px-4 text-center">7h %</th>
                      <th className="py-4 px-4 text-right">Volume 24j</th>
                      <th className="py-4 px-4 text-right">Kapitalisasi Pasar</th>
                      <th className="py-4 pr-4 w-32 text-center">7 Hari Terakhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                    {cryptoList.map((coin) => {
                      const isDown = coin.change24h < 0;
                      return (
                        <tr key={coin.rank} className="hover:bg-white/60 transition-colors group">
                          {/* Rank / Bintang */}
                          <td className="py-4 pl-4 text-center text-gray-400 font-medium text-xs">
                            <div className="flex items-center gap-1.5 justify-center">
                              <Star size={13} className="cursor-pointer hover:text-yellow-400 transition-colors" />
                              {coin.rank}
                            </div>
                          </td>
                          
                          {/* Aset / Nama & Simbol */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-800 shadow-sm">
                                {coin.logo}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{coin.name}</span>
                                <span className="text-[11px] text-gray-400 uppercase font-medium">{coin.symbol}</span>
                              </div>
                            </div>
                          </td>

                          {/* Harga Saat Ini */}
                          <td className="py-4 px-4 text-right font-black text-gray-900">
                            IDR {coin.priceIdr.toLocaleString('id-ID')}
                          </td>

                          {/* Persentase Perubahan 1 Jam */}
                          <td className={`py-4 px-4 text-center text-xs ${coin.change1h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            <div className="flex items-center justify-center gap-0.5 font-bold">
                              {coin.change1h < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                              {Math.abs(coin.change1h)}%
                            </div>
                          </td>

                          {/* Persentase Perubahan 24 Jam */}
                          <td className={`py-4 px-4 text-center text-xs ${coin.change24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            <div className="flex items-center justify-center gap-0.5 font-bold">
                              {coin.change24h < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                              {Math.abs(coin.change24h)}%
                            </div>
                          </td>

                          {/* Persentase Perubahan 7 Hari */}
                          <td className={`py-4 px-4 text-center text-xs ${coin.change7d < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            <div className="flex items-center justify-center gap-0.5 font-bold">
                              {coin.change7d < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                              {Math.abs(coin.change7d)}%
                            </div>
                          </td>

                          {/* Volume 24 Jam */}
                          <td className="py-4 px-4 text-right text-xs text-gray-500 font-medium">
                            IDR {coin.volume24h.toLocaleString('id-ID')}
                          </td>

                          {/* Market Cap */}
                          <td className="py-4 px-4 text-right text-xs text-gray-500 font-medium">
                            IDR {coin.marketCap.toLocaleString('id-ID')}
                          </td>

                          {/* Mini Sparkline Chart (Perbaikan Bug Terbaca Sempurna) */}
                          <td className="py-4 pr-4 text-center">
                            <div className="w-24 h-8 mx-auto flex items-end justify-center">
                              <svg className="w-full h-full" viewBox="0 0 100 50">
                                <polyline
                                  fill="none"
                                  stroke={isDown ? "#EF4444" : "#10B981"}
                                  strokeWidth="2.5"
                                  points={coin.sparklineData.map((val, index) => {
                                    const x = index * (100 / (coin.sparklineData.length - 1));
                                    const y = 50 - val; 
                                    return `${x},${y}`;
                                  }).join(' ')}
                                />
                              </svg>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ConversPage;