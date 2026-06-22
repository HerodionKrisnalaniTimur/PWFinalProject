import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface PoolPosition {
  token1: string;
  token2: string;
  amount1: number;
  amount2: number;
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
  if (positions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
        Active Positions
      </h4>

      {positions.map((pos, idx) => (
        <motion.div
          key={`${pos.token1}_${pos.token2}_${idx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Bagian Kiri: Logo & Nama Pool */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className={`w-10 h-10 ${getTokenColor(pos.token1)} text-white rounded-full flex items-center justify-center font-bold border-2 border-white text-xs shadow-sm`}>
                  {pos.token1.charAt(0)}
                </div>
                <div className={`w-10 h-10 ${getTokenColor(pos.token2)} text-white rounded-full flex items-center justify-center font-bold border-2 border-white text-xs shadow-sm`}>
                  {pos.token2.charAt(0)}
                </div>
              </div>
              <div>
                <h5 className="font-bold text-lg text-gray-800">
                  {pos.token1} / {pos.token2}
                </h5>
                <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                  Active Pool
                </p>
              </div>
            </div>

            {/* Bagian Tengah: Amount */}
            <div className="flex gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-50">
              <div className="text-left lg:text-right">
                <p className="text-xs text-gray-400 mb-0.5">Your {pos.token1}</p>
                <p className="font-bold text-gray-800">{pos.amount1.toFixed(2)} {pos.token1}</p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-xs text-gray-400 mb-0.5">Your {pos.token2}</p>
                <p className="font-bold text-gray-800">{pos.amount2.toFixed(2)} {pos.token2}</p>
              </div>
            </div>

            {/* Tombol Remove */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PoolCard;