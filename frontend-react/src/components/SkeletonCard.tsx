import { motion } from "framer-motion";

const SkeletonCard = () => {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-24 bg-gray-200 rounded-xl"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Input Skeleton */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
            <div className="flex justify-between items-center">
              <div className="h-8 w-28 bg-gray-200 rounded-xl"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
              }}
              className="w-10 h-10 rounded-full border-4 border-blue-300 border-t-blue-600"
            />
          </div>

          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
            <div className="flex justify-between items-center">
              <div className="h-8 w-28 bg-gray-200 rounded-xl"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>

          <div className="h-12 bg-gray-200 rounded-2xl mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;