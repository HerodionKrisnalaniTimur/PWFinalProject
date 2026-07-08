import { useState, useRef, useEffect } from "react";
import { RefreshCw, ArrowDownUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

// ─── Custom Dropdown (gaya AddLiquidityModal) ────────────────────────────────
interface CurrencyDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const CurrencyDropdown = ({ label, value, onChange, disabled }: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = currencyList.find((c) => c.code === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full sm:flex-1" ref={ref}>
      <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 p-3 rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-100/50 transition-all text-left cursor-pointer disabled:opacity-50"
        >
          <span>{selected ? `${selected.code} - ${selected.name}` : value}</span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-1 max-h-60 overflow-y-auto"
            >
              {currencyList.map((c) => {
                const isSelected = value === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{c.code} - {c.name}</span>
                    <span className="text-[10px] font-normal text-gray-400">{c.type}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── CardConvert (struktur asli dipertahankan) ────────────────────────────────
const CardConvert = () => {
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("IDR");
  const [result, setResult] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsConverting(true);
    try {
      const cryptoMapping: Record<string, string> = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "USDT": "tether"
      };

      const fromIsCrypto = !!cryptoMapping[fromCurrency];
      const toIsCrypto = !!cryptoMapping[toCurrency];

      let finalRate = 0;

      if (fromCurrency === toCurrency) {
        finalRate = 1;
      } else if (fromIsCrypto && !toIsCrypto) {
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
      } else if (!fromIsCrypto && toIsCrypto) {
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
      } else if (fromIsCrypto && toIsCrypto) {
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
      } else {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        if (!response.ok) throw new Error("Open-ER-API Error");
        const data = await response.json();
        if (data && data.rates) {
          finalRate = data.rates[toCurrency] || 0;
        }
      }

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
              setResult(null);
            }}
            placeholder="0.00"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 font-semibold text-xl outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Pemilihan Mata Uang — hanya dropdown yang diubah */}
        <div className="flex flex-col sm:flex-row items-center gap-2 my-4 relative">
          <CurrencyDropdown
            label="From"
            value={fromCurrency}
            onChange={(val) => { setFromCurrency(val); setResult(null); }}
            disabled={isConverting}
          />

          <button
            onClick={handleSwitchCurrencies}
            className="bg-white border border-gray-200 p-3 rounded-full shadow-md hover:bg-gray-50 active:scale-95 transition-all text-gray-500 my-1 sm:my-0 z-10 mt-4 sm:mt-0 self-center"
          >
            <ArrowDownUp size={16} />
          </button>

          <CurrencyDropdown
            label="To"
            value={toCurrency}
            onChange={(val) => { setToCurrency(val); setResult(null); }}
            disabled={isConverting}
          />
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