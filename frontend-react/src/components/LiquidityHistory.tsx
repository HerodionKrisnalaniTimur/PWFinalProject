import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface HistoryItem {
  id: string;
  token: string;
  amount: number;
  type: "add" | "remove";
  timestamp: number;
  txHash?: string;
}

interface LiquidityHistoryProps {
  history: HistoryItem[];
  walletAddress: string;
}

const LiquidityHistory = ({
  history,
  walletAddress,
}: LiquidityHistoryProps) => {
  if (!walletAddress || history.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    return type === "add" ? (
      <TrendingUp
        className="text-green-500"
        size={16}
      />
    ) : (
      <TrendingDown
        className="text-red-500"
        size={16}
      />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === "add"
      ? "Add Liquidity"
      : "Remove Liquidity";
  };

  const getTypeColor = (type: string) => {
    return type === "add"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="mt-10">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2 mb-4">
        <Calendar
          size={14}
          className="inline mr-2"
        />
        Liquidity History
      </h4>

      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {history
            .filter(
              (item) =>
                item &&
                item.token &&
                item.amount !== undefined
            )
            .map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: idx * 0.05,
            }}
            className="bg-white/60 border border-gray-100 rounded-2xl p-4 hover:bg-white/80 transition-all"
          >
            <div className="flex items-center justify-between gap-4">

              {/* Left */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  {getTypeIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">
                    {item.token}
                  </p>

                 <p className="text-xs text-gray-500">
                  {Number(item.amount || 0).toFixed(2)}{" "}
                  {item.token || "-"}
                 </p>
                </div>
              </div>

              {/* Badge */}
              <div
                className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${getTypeColor(
                  item.type
                )}`}
              >
                {getTypeLabel(item.type)}
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-semibold text-gray-600">
                  {formatDate(item.timestamp)}
                </p>

                {item.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:text-blue-600 truncate block"
                  >
                    {item.txHash.slice(0, 10)}...
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiquidityHistory;