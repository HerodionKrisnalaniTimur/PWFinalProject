import { useState } from "react";
import { RefreshCw, ArrowDownUp } from "lucide-react";
import { motion } from "framer-motion";

interface CurrencyOption {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
}

const currencyList: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", type: "fiat" },
  { code: "IDR", name: "Indonesian Rupiah", type: "fiat" },
  { code: "EUR", name: "Euro", type: "fiat" },
  { code: "BTC", name: "Bitcoin", type: "crypto" },
  { code: "ETH", name: "Ethereum", type: "crypto" },
  { code: "USDT", name: "Tether", type: "fiat" }
];

const CardConvert = () => {
  // Pastikan State di bawah ini terdefinisi dengan benar untuk menyuplai handleConvert
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("IDR");
  const [result, setResult] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  // =========================================================================
  // INTEGRASI HYBRID API: COINGECKO (CRYPTO) & OPEN-ER-API (FIAT)
  // =========================================================================
  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsConverting(true);
    try {
      // 1. Tentukan tipe currency (Cari tahu apakah pilihan user itu fiat atau crypto)
      const cryptoMapping: Record<string, string> = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "USDT": "tether"
      };

      const fromIsCrypto = !!cryptoMapping[fromCurrency];
      const toIsCrypto = !!cryptoMapping[toCurrency];

      let finalRate = 0;

      // KONDISI A: JIKA MATA UANGNYA SAMA (Misal: USD ke USD atau BTC ke BTC)
      if (fromCurrency === toCurrency) {
        finalRate = 1;
      }
      
      // KONDISI B: CRYPTO KE FIAT (Misal: BTC ke IDR atau ETH ke USD)
      else if (fromIsCrypto && !toIsCrypto) {
        const coinId = cryptoMapping[fromCurrency];
        const vsCurrency = toCurrency.toLowerCase();
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`
        );
        if (!response.ok) throw new Error("CoinGecko API Error");
        const data = await response.json();
        
        if (data && data[coinId]) {
          finalRate = data[coinId][vsCurrency] || 0;
        }
      }

      // KONDISI C: FIAT KE CRYPTO (Misal: USD ke BTC atau IDR ke ETH)
      else if (!fromIsCrypto && toIsCrypto) {
        const coinId = cryptoMapping[toCurrency];
        const vsCurrency = fromCurrency.toLowerCase();
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`
        );
        if (!response.ok) throw new Error("CoinGecko API Error");
        const data = await response.json();
        
        if (data && data[coinId] && data[coinId][vsCurrency]) {
          const cryptoPriceInFiat = data[coinId][vsCurrency];
          if (cryptoPriceInFiat > 0) {
            finalRate = 1 / cryptoPriceInFiat;
          }
        }
      }

      // KONDISI D: CRYPTO KE CRYPTO (Misal: BTC ke ETH atau ETH ke USDT)
      else if (fromIsCrypto && toIsCrypto) {
        const fromCoinId = cryptoMapping[fromCurrency];
        const toCoinId = cryptoMapping[toCurrency];
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoinId},${toCoinId}&vs_currencies=usd`
        );
        if (!response.ok) throw new Error("CoinGecko API Error");
        const data = await response.json();
        
        if (data && data[fromCoinId] && data[toCoinId]) {
          const fromPriceInUsd = data[fromCoinId]["usd"];
          const toPriceInUsd = data[toCoinId]["usd"];
          
          if (toPriceInUsd > 0) {
            finalRate = fromPriceInUsd / toPriceInUsd;
          }
        }
      }

      // KONDISI E: FIAT KE FIAT (Misal: USD ke IDR atau EUR ke USD)
      else {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        if (!response.ok) throw new Error("Open-ER-API Error");
        const data = await response.json();
        
        if (data && data.rates) {
          finalRate = data.rates[toCurrency] || 0;
        }
      }

      // SET HASIL AKHIR KE UI
      if (finalRate > 0) {
        setResult(Number(amount) * finalRate);
      } else {
        setResult(null);
        alert("Gagal menghitung kurs konversi untuk pasangan mata uang ini.");
      }

    } catch (error) {
      console.error("Error pada sistem konversi hybrid:", error);
      alert("Terjadi kendala saat mengambil data pasar real-time. Sila coba beberapa saat lagi.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSwitchCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-600" />
            Currency Converter
          </h2>
        </div>

        {/* Input Jumlah */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null); // Reset hasil saat input berubah
            }}
            placeholder="0.00"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 font-semibold text-xl outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Pemilihan Mata Uang */}
        <div className="flex flex-col sm:flex-row items-center gap-2 my-4 relative">
          <div className="w-full sm:flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">From</span>
            <select
              value={fromCurrency}
              onChange={(e) => {
                setFromCurrency(e.target.value);
                setResult(null);
              }}
              className="w-full bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
            >
              {currencyList.map((c) => (
                <option key={`from-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwitchCurrencies}
            className="bg-white border border-gray-200 p-3 rounded-full shadow-md hover:bg-gray-50 active:scale-95 transition-all text-gray-500 my-1 sm:my-0 z-10"
          >
            <ArrowDownUp size={16} />
          </button>

          <div className="w-full sm:flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">To</span>
            <select
              value={toCurrency}
              onChange={(e) => {
                setToCurrency(e.target.value);
                setResult(null);
              }}
              className="w-full bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
            >
              {currencyList.map((c) => (
                <option key={`to-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hasil Tampilan */}
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mt-6 text-center shadow-sm"
          >
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Result</p>
            <p className="text-2xl font-black text-gray-900">
              {Number(amount).toLocaleString()} <span className="text-sm font-bold text-gray-500">{fromCurrency}</span>
            </p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              = {result.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: fromCurrency === "IDR" && toCurrency !== "IDR" ? 8 : 4 
              })} <span className="text-xs font-black">{toCurrency}</span>
            </p>
          </motion.div>
        )}
      </div>

      <button
        onClick={handleConvert}
        disabled={isConverting || !amount}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.99] mt-6"
      >
        {isConverting ? "Converting..." : "Convert Now"}
      </button>
    </motion.div>
  );
};

export default CardConvert;