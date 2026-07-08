import React, { useEffect, useState } from 'react';
import { useMetaMask } from '../context/MetaMaskContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { 
    isConnected, 
    isAdmin, 
    connectWallet, 
    account,
    switchWallet,
    isSwitching // ✅ Ambil dari context
  } = useMetaMask();
  
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [account]);

  // ============================================
  // Tampilan: Loading (Verifikasi atau Switching)
  // ============================================
  if (isVerifying || isSwitching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">
          {isSwitching ? 'Mengganti wallet...' : 'Verifikasi akses...'}
        </p>
      </div>
    );
  }

  // ============================================
  // Tampilan: Belum connect MetaMask
  // ============================================
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 mb-6">
            Silahkan connect MetaMask untuk mengakses halaman admin
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 w-full"
          >
            🔗 Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Tampilan: Bukan admin (TANPA wallet address)
  // ============================================
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-700 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          
          {/* ✅ Tombol Ganti Wallet */}
          <button
            onClick={switchWallet}
            disabled={isSwitching}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwitching ? 'Memproses...' : '🔄 Ganti Wallet'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Jika admin, tampilkan children
  // ============================================
  return <>{children}</>;
};

export default ProtectedRoute;