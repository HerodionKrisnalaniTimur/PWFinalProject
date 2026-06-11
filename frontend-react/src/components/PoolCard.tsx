import { motion } from "framer-motion";

// Definisikan tipe properti (props) yang dibutuhkan oleh PoolCard
interface PoolCardProps {
  ztxAmount: number;
  usdtAmount: number;
}

const PoolCard = ({ ztxAmount, usdtAmount }: PoolCardProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">
        Active Positions
      </h4>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all"
      >
        {/* Bagian Kiri: Logo Token & Nama Pool */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white text-xs shadow-sm">
              Z
            </div>
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-white text-xs shadow-sm">
              $
            </div>
          </div>
          <div>
            <h5 className="font-bold text-lg text-gray-800">ZTX / USDT</h5>
            <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-1">
              Fixed Rate Pool
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Angka Saldo Setoran User */}
        <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-400 mb-0.5">Your ZTX Deposit</p>
            <p className="font-bold text-gray-800">{ztxAmount.toLocaleString()} ZTX</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-400 mb-0.5">Your USDT Deposit</p>
            <p className="font-bold text-gray-800">{usdtAmount.toLocaleString()} USDT</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PoolCard;