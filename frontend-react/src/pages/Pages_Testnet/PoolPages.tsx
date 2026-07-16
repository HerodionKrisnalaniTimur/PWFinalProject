import Sidebar from "../../components/SideBar";
import PageTransition from "../../components/PageTransition";
import AddLiquidityModal from "../../components/AddLiquidityModal";
import PoolCard from "../../components/PoolCard";
import LiquidityHistory from "../../components/LiquidityHistory";

import {
  getAllPools,
  getLiquidityHistory,
  calculateTotalStats,
  getUserPositionsFromHistory,
  LiquidityHistoryItem,
} from "../../services/poolService";

import {
  Wallet,
  Droplets,
  Plus,
  TrendingUp,
  Coins,
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface PoolPosition {
  token: string;
  amount: number;
}

interface PoolStats {
  tvl: number;
  apr: number;
  activePositions: number;
}

const PoolPage = () => {
  const [loading, setLoading] = useState(true);

  const [walletAddress, setWalletAddress] =
    useState<string>("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedShortcut, setSelectedShortcut] =
    useState<string>("");

  const [userPositions, setUserPositions] =
    useState<PoolPosition[]>([]);

  const [globalStats, setGlobalStats] =
    useState<PoolStats>({
      tvl: 0,
      apr: 0,
      activePositions: 0,
    });

  const [history, setHistory] =
    useState<LiquidityHistoryItem[]>([]);

  const refreshIntervalRef =
    useRef<NodeJS.Timeout | null>(null);

  const handleShortcutClick = (
    token: string
  ) => {
    setSelectedShortcut(token);
    setIsModalOpen(true);
  };

  const handleOpenGeneralModal = () => {
    const allPools = getAllPools();
    // Filter USDT dan MJK
    const filteredPools = allPools.filter(
      (p) => p.token !== 'USDT' && p.token !== 'MJK'
    );
    const defaultToken = filteredPools.length > 0 ? filteredPools[0].token : '';
    setSelectedShortcut(defaultToken);
    setIsModalOpen(true);
  };

  const loadLiquidityData = async (address: string) => {
    try {
      const historyData = getLiquidityHistory(address);
      setHistory(historyData);

      const statsData = await calculateTotalStats(address);
      const positionsData = await getUserPositionsFromHistory(address);

      const positionsArray = Object.keys(positionsData).map((key) => ({
        token: positionsData[key].token,
        amount: positionsData[key].amount,
      }));

      setUserPositions(positionsArray);

      setGlobalStats({
        ...statsData,
        activePositions: positionsArray.length // Sinkronkan juga jumlah angkanya
      });

    } catch (error) {
      console.error("Error loading liquidity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupAutoRefresh = (
    address: string
  ) => {
    if (refreshIntervalRef.current) {
      clearInterval(
        refreshIntervalRef.current
      );
    }

    refreshIntervalRef.current =
      setInterval(() => {
        loadLiquidityData(address);
      }, 3000);
  };

  useEffect(() => {
    const handleHistoryUpdate = () => {
      if (walletAddress) {
        loadLiquidityData(walletAddress);
      }
    };

    window.addEventListener(
      "liquidity_history_updated",
      handleHistoryUpdate
    );

    return () => {
      window.removeEventListener(
        "liquidity_history_updated",
        handleHistoryUpdate
      );
    };
  }, [walletAddress]);

  useEffect(() => {
    const checkConnection = async () => {
      if (
        typeof window !== "undefined" &&
        window.ethereum
      ) {
        try {
          const accounts: string[] =
            await window.ethereum.request({
              method: "eth_accounts",
            });

          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setupAutoRefresh(walletAddress);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(
          refreshIntervalRef.current
        );
      }
    };
  }, [walletAddress]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.ethereum
    ) {
      const handleAccountsChanged = (
        accounts: string[]
      ) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          loadLiquidityData(accounts[0]);
          setupAutoRefresh(accounts[0]);
        } else {
          setWalletAddress("");
          setUserPositions([]);
          setHistory([]);

          setGlobalStats({
            tvl: 0,
            apr: 0,
            activePositions: 0,
          });

          if (refreshIntervalRef.current) {
            clearInterval(
              refreshIntervalRef.current
            );
          }
        }
      };

      window.ethereum.on(
        "accountsChanged",
        handleAccountsChanged
      );

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  const handleWalletAction =
    async () => {
      if (
        typeof window !== "undefined" &&
        window.ethereum
      ) {
        try {
          await window.ethereum.request({
            method:
              "wallet_requestPermissions",
            params: [
              {
                eth_accounts: {},
              },
            ],
          });

          const accounts =
            await window.ethereum.request({
              method:
                "eth_requestAccounts",
            });

          setWalletAddress(accounts[0]);

          loadLiquidityData(accounts[0]);

          setupAutoRefresh(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      } else {
        alert(
          "Silakan install MetaMask terlebih dahulu!"
        );
      }
    };

  const formatAddress = (
    address: string
  ) => {
    return `${address.substring(
      0,
      6
    )}...${address.substring(
      address.length - 4
    )}`;
  };

  const pools = getAllPools();

  const activePoolsCount =
    userPositions.length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] flex text-[#1A1A1A] font-sans relative overflow-hidden">

        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(#D1D5DB 1px, transparent 1px)",
              backgroundSize:
                "30px 30px",
            }}
          />

          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
            className="absolute top-10 left-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
            className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"
          />
        </div>

        <Sidebar />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 relative overflow-y-auto custom-scrollbar">

          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 mb-8">

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              className="bg-white/70 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-white shadow-md"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                Z
              </div>
              Zentrix Pool
            </motion.button>

            <motion.button
              onClick={handleWalletAction}
              whileHover={{
                scale: 1.05,
              }}
              className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border shadow-md ${
                walletAddress
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700"
                  : "bg-white/70 border-white"
              }`}
            >
              <Wallet size={16} />
              {walletAddress
                ? formatAddress(
                    walletAddress
                  )
                : "Connect Wallet"}
            </motion.button>
          </header>

          {/* Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[32px] p-5 sm:p-8 border border-white shadow-2xl"
          >

            {/* Title */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between mb-10">

              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Droplets className="text-blue-500" />
                  Liquidity Pools
                </h2>

                <p className="text-gray-500 mt-3 text-sm sm:text-base">
                  Provide liquidity to earn
                  trading fees and passive
                  rewards.
                </p>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={() =>
                  !walletAddress
                    ? handleWalletAction()
                    : handleOpenGeneralModal()
                }
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add Liquidity
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

              <div className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <TrendingUp className="text-green-500 mb-4" />
                <h3 className="text-gray-500 text-sm mb-2">
                  Total APR 
                </h3>
                <p className="text-3xl font-bold">
                  {globalStats.apr.toFixed(
                    1
                  )}
                  %
                </p>
              </div>

              <div className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <Coins className="text-yellow-500 mb-4" />
                <h3 className="text-gray-500 text-sm mb-2">
                  Total Liquidity
                </h3>
                <p className="text-3xl font-bold">
                  $
                  {globalStats.tvl.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 rounded-3xl p-6 shadow-md border border-white">
                <Droplets className="text-cyan-500 mb-4" />
                <h3 className="text-gray-500 text-sm mb-2">
                  Your Pools
                </h3>
                <p className="text-3xl font-bold">
                  {activePoolsCount}
                </p>
              </div>

            </div>

            {/* Token Pool List - USDT dan MJK dihapus */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">

              {pools
                .filter((pool: any) => pool.token !== 'USDT' && pool.token !== 'MJK')
                .map((pool: any) => (
                  <motion.div
                    key={pool.id}
                    whileHover={{
                      y: -2,
                    }}
                    onClick={() =>
                      handleShortcutClick(
                        pool.token
                      )
                    }
                    className="bg-white/60 rounded-2xl p-5 border border-white text-center cursor-pointer hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-sm text-gray-800">
                      {pool.token}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Liquidity Pool
                    </p>
                  </motion.div>
                ))}

            </div>

            {/* Pool Card */}
            {loading ? (
              <div className="h-24 rounded-3xl bg-gray-200 animate-pulse" />
            ) : (
              <PoolCard
                positions={userPositions}
              />
            )}

            {/* History */}
            <LiquidityHistory
              history={history}
              walletAddress={
                walletAddress
              }
            />
          </motion.div>
        </main>
      </div>

      <AddLiquidityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);

          if (walletAddress) {
            loadLiquidityData(
              walletAddress
            );
          }
        }}
        walletAddress={walletAddress}
        onSuccess={() => {
          if (walletAddress) {
            loadLiquidityData(
              walletAddress
            );
          }
        }}
        defaultPool={selectedShortcut}
      />
    </PageTransition>
  );
};

export default PoolPage;