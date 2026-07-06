import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// ============================================
// TYPE DECLARATIONS
// ============================================
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  error: string | null;
  isAdmin: boolean;
  isSwitching: boolean; // ✅ Tambahkan ini
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: () => Promise<void>;
}

interface MetaMaskProviderProps {
  children: ReactNode;
}

// ============================================
// CONSTANTS
// ============================================
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

// ============================================
// CONTEXT
// ============================================
const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within MetaMaskProvider');
  }
  return context;
};

// ============================================
// PROVIDER
// ============================================
export const MetaMaskProvider: React.FC<MetaMaskProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false); // ✅ Tambahkan state switching

  // ============================================
  // Ambil admin wallet dari backend
  // ============================================
  const fetchAdminWallet = async (): Promise<string | null> => {
    try {
      const response = await axios.get(`${API_URL}/admin/config/wallet`);
      if (response.data.success) {
        return response.data.admin_wallet;
      }
      return null;
    } catch (err) {
      console.error('Gagal mengambil admin wallet:', err);
      return null;
    }
  };

  // ============================================
  // Cek apakah address adalah admin
  // ============================================
  const checkAdminStatus = async (address: string): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const admin = await fetchAdminWallet();
      if (!admin) return false;
      
      const isAdminWallet = address.toLowerCase() === admin.toLowerCase();
      setIsAdmin(isAdminWallet);
      
      return isAdminWallet;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  // ============================================
  // Connect ke MetaMask
  // ============================================
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask tidak terinstall!');
      alert('⚠️ Silahkan install MetaMask terlebih dahulu!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      setIsConnected(true);
      setError(null);
      
      await checkAdminStatus(connectedAccount);
      
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
      setIsAdmin(false);
    }
  };

  // ============================================
  // Disconnect wallet
  // ============================================
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
  };

  // ============================================
  // ✅ SWITCH WALLET - TANPA reset state dulu
  // ============================================
  const switchWallet = async () => {
    if (!window.ethereum) {
      alert('⚠️ Silahkan install MetaMask terlebih dahulu!');
      return;
    }

    // ✅ Set switching state agar tampil loading
    setIsSwitching(true);

    try {
      // 🔥 Panggil wallet_requestPermissions untuk membuka popup
      // TANPA reset state terlebih dahulu
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      // Ambil account yang dipilih
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        setIsConnected(true);
        await checkAdminStatus(newAccount);
      }

    } catch (error: any) {
      if (error.code === 4001) {
        console.log('User menutup popup MetaMask');
      } else {
        console.error('Gagal mengganti wallet:', error);
      }
    } finally {
      // ✅ Selesai switching
      setIsSwitching(false);
    }
  };

  // ============================================
  // Listener untuk perubahan account di MetaMask
  // ============================================
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          setIsConnected(true);
          await checkAdminStatus(newAccount);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsAdmin(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <MetaMaskContext.Provider value={{
      account,
      isConnected,
      error,
      isAdmin,
      isSwitching, // ✅ Ekspor isSwitching
      connectWallet,
      disconnectWallet,
      switchWallet,
    }}>
      {children}
    </MetaMaskContext.Provider>
  );
};