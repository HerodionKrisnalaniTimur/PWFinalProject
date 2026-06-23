import { motion } from "framer-motion";
import { Layers } from "lucide-react";

interface PoolPosition {
  token: string;
  amount: number;
}

interface PoolCardProps {
  positions: PoolPosition[];
}

const getTokenColor = (symbol: string): string => {
  const colors: Record<string, string> = {
    USDT: "bg-green-500",
    ZTX: "bg-blue-600",
    AGT: "bg-purple-600",
    TOG: "bg-amber-600",
    DGH: "bg-red-500",
    MJK: "bg-cyan-500",
  };

  return colors[symbol] || "bg-gray-500";
};

const PoolCard = ({ positions }: PoolCardProps) => {
  if (positions.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
          Active Positions
        </h4>

        <div className="p-8 text-center bg-gray-50/40 border border-dashed border-gray-200 rounded-3xl backdrop-blur-sm">
          <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Layers size={20} />
          </div>

          <h5 className="text-sm font-bold text-gray-700 mb-1">
            No Active Positions
          </h5>

          <p className="text-xs text-gray-400 max-w-[260px] mx-auto leading-relaxed">
            Anda belum memiliki posisi likuiditas aktif. Tambahkan aset ke pool
            untuk mulai mendapatkan imbalan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
        Active Positions
      </h4>

      {positions.map((pos, idx) => (
        <motion.div
          key={`${pos.token}_${idx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Logo + Nama Pool */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 ${getTokenColor(
                  pos.token
                )} text-white rounded-full flex items-center justify-center font-bold shadow-sm`}
              >
                {pos.token.charAt(0)}
              </div>

              <div>
                <h5 className="font-bold text-lg text-gray-800">
                  {pos.token} Pool
                </h5>

                <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 mt-1 border border-blue-100/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  Active Pool
                </p>
              </div>
            </div>

            {/* Jumlah Liquidity */}
            <div className="w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-50">
              <div className="text-left lg:text-right">
                <p className="text-xs text-gray-400 mb-0.5">
                  Your Liquidity
                </p>

                <p className="font-bold text-gray-800">
                  {pos.amount.toFixed(2)} {pos.token}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PoolCard;