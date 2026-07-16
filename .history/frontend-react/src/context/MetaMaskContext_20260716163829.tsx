import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

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
  isSuperAdmin: boolean;
  isSwitching: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: () => Promise<void>;
}

interface MetaMaskProviderProps {
  children: ReactNode;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within MetaMaskProvider');
  }
  return context;
};

export const MetaMaskProvider: React.FC<MetaMaskProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const checkAdminStatus = async (address: string): Promise<boolean> => {
    if (!address) return false;

    try {
      const response = await axios.get(
        `${API_URL}/admin/config/check-admin/${address.toLowerCase()}`
      );

      const isAdminWallet = !!response.data?.is_admin;
      const isSuperAdminWallet = !!response.data?.is_super_admin;
      setIsAdmin(isAdminWallet);
      setIsSuperAdmin(isSuperAdminWallet);
      console.log('🔍 Admin check:', {
        address,
        isAdminWallet,
        isSuperAdminWallet,
        source: response.data?.source,
      });
      return isAdminWallet;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return false;
    }
  };

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

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const switchWallet = async () => {
    if (!window.ethereum) {
      alert('⚠️ Silahkan install MetaMask terlebih dahulu!');
      return;
    }

    setIsSwitching(true);

    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

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
      setIsSwitching(false);
    }
  };
  
  useEffect(() => {
    const checkIfAlreadyConnected = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            const connectedAccount = accounts[0];
            setAccount(connectedAccount);
            setIsConnected(true);
            await checkAdminStatus(connectedAccount);
            console.log('✅ MetaMask sudah terhubung:', connectedAccount);
          } else {
            console.log('ℹ️ MetaMask belum terhubung');
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkIfAlreadyConnected();
  }, []);

  // ============================================
  // Listener untuk perubahan account
  // ============================================
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        console.log('🔄 Account changed:', accounts);
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          setIsConnected(true);
          await checkAdminStatus(newAccount);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsAdmin(false);
          setIsSuperAdmin(false);
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
      isSuperAdmin,
      isSwitching,
      connectWallet,
      disconnectWallet,
      switchWallet,
    }}>
      {children}
    </MetaMaskContext.Provider>
  );
};