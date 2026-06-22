import { useEffect, useState } from "react";
import { Coins, Star, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

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
  sparklineData: number[];
}

const CardListConvert = () => {
  const [cryptoList, setCryptoList] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  // ==========================================
  // INTEGRASI API: LIVE CRYPTO MARKET (COINGECKO)
  // ==========================================
  const fetchCryptoTableData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=8&page=1&sparkline=true&price_change_percentage=1h,24h,7d"
      );
      if (!response.ok) throw new Error("Rate limit / server error");
      
      const data = await response.json();
      const formattedData: CryptoAsset[] = data.map((coin: any, index: number) => ({
        rank: index + 1,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        logo: coin.image,
        priceIdr: coin.current_price,
        change1h: coin.price_change_percentage_1h_in_currency ? parseFloat(coin.price_change_percentage_1h_in_currency.toFixed(2)) : 0,
        change24h: coin.price_change_percentage_24h ? parseFloat(coin.price_change_percentage_24h.toFixed(2)) : 0,
        change7d: coin.price_change_percentage_7d_in_currency ? parseFloat(coin.price_change_percentage_7d_in_currency.toFixed(2)) : 0,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        sparklineData: coin.sparkline_in_7d?.price 
          ? coin.sparkline_in_7d.price.filter((_: any, i: number) => i % 16 === 0).map((p: number) => {
              const min = Math.min(...coin.sparkline_in_7d.price);
              const max = Math.max(...coin.sparkline_in_7d.price);
              return max === min ? 25 : ((p - min) / (max - min)) * 40 + 5;
            })
          : [25, 25, 25, 25, 25, 25, 25, 25]
      }));

      setCryptoList(formattedData);
    } catch (error) {
      console.error("Gagal menarik data CoinGecko:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoTableData();
    const interval = setInterval(fetchCryptoTableData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400 font-bold animate-bounce">Loading Live Market Rates...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-6">
        <Coins size={22} className="text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Live Cryptocurrency Markets</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-wider">
              <th className="py-3 px-2 text-center w-8">#</th>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4 text-right">Price (IDR)</th>
              <th className="py-3 px-4 text-right">1H</th>
              <th className="py-3 px-4 text-right">24H</th>
              <th className="py-3 px-4 text-right">7D</th>
              <th className="py-3 px-4 text-right">24H Volume</th>
              <th className="py-3 px-4 text-right">Market Cap</th>
              <th className="py-3 pr-4 text-center w-28">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {cryptoList.map((coin) => {
              const isDown = coin.change24h < 0;
              const isFav = favorites.has(coin.symbol);
              return (
                <tr key={coin.symbol} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group">
                  <td className="py-4 px-2 text-center text-xs text-gray-400 font-bold">
                    <button
                      onClick={() => toggleFavorite(coin.symbol)}
                      className="inline-flex items-center justify-center cursor-pointer transition-transform active:scale-110 mr-1"
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star
                        size={13}
                        className={`transition-colors duration-200 ${
                          isFav
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                    {coin.rank}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.logo} alt={coin.name} className="w-7 h-7 rounded-full object-contain" />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{coin.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-xs text-gray-900">
                    IDR {coin.priceIdr.toLocaleString('id-ID')}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold text-xs ${coin.change1h < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {coin.change1h < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(coin.change1h)}%
                    </div>
                  </td>
                  <td className={`py-4 px-4 text-right font-bold text-xs ${coin.change24h < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {coin.change24h < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(coin.change24h)}%
                    </div>
                  </td>
                  <td className={`py-4 px-4 text-right font-bold text-xs ${coin.change7d < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {coin.change7d < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(coin.change7d)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-gray-600 font-semibold">
                    IDR {coin.volume24h.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-gray-500 font-medium">
                    IDR {coin.marketCap.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <div className="w-24 h-8 mx-auto flex items-end justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <polyline
                          fill="none"
                          stroke={isDown ? "#EF4444" : "#10B981"}
                          strokeWidth="2.5"
                          points={coin.sparklineData.map((val, idx) => {
                            const x = idx * (100 / (coin.sparklineData.length - 1));
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
  );
};

export default CardListConvert;