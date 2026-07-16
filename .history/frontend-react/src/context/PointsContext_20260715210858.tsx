/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchPointActivities, storePointActivity } from '../services/pointService';

// 1. Menentukan bentuk data aktivitas
export interface Activity {
  id: string | number;
  type: string; // Misalnya: "Swap" atau "Pool"
  description: string;
  pointsAdded: number;
  date: string;
  chain?: string;
}

// 2. Menentukan apa saja isi Brankas kita
interface PointsContextType {
  userPoints: number;
  recentActivity: Activity[];
  addActivity: (type: string, description: string, points: number, walletAddress?: string, chain?: string) => Promise<void>;
  fetchUserActivities: (walletAddress: string) => Promise<void>;
  setUserPoints: React.Dispatch<React.SetStateAction<number>>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

// 3. Membuat Provider (Penyedia Data)
export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Saldo poin awal
  const [userPoints, setUserPoints] = useState<number>(800000);
  
  // Riwayat awal (dummy) agar layarnya tidak kosong
  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: "init-1",
      type: "Swap",
      description: "Swapped 0.1 ETH to USDC",
      pointsAdded: 50,
      date: new Date().toISOString(),
      chain: "Sepolia Testnet"
    }
  ]);

  /**
   * Mengambil riwayat poin dari database untuk wallet tertentu
   */
  const fetchUserActivities = async (walletAddress: string) => {
    try {
      const response = await fetchPointActivities({ wallet_address: walletAddress, limit: 10 });
      if (response && response.success) {
        // Transform dari format database ke format UI context
        const dbActivities = response.data.map((item: any) => ({
          id: item.id,
          type: item.activity_type,
          description: item.description,
          pointsAdded: item.points,
          date: item.created_at || new Date().toISOString(),
          chain: item.chain || ''
        }));
        
        setRecentActivity(dbActivities);

        // Hitung total poin dari riwayat (opsional, atau bisa tambahkan API khusus total poin)
        const total = dbActivities.reduce((acc: number, curr: any) => acc + curr.pointsAdded, 500000);
        setUserPoints(total);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data poin dari database:", error);
    }
  };

  // Untuk menambah poin & mencatat riwayat ke database & state lokal
  const addActivity = async (type: string, description: string, points: number, walletAddress?: string, chain?: string) => {
    setUserPoints((prev) => prev + points);
    
    // Simpan ke database melalui API
    try {
      await storePointActivity({
        activity_type: type,
        description: description,
        points: points,
        wallet_address: walletAddress || null,
        chain: chain || 'Sepolia Testnet'
      });
    } catch (error) {
      console.error("Gagal menyimpan aktivitas ke backend, hanya menyimpan di local state:", error);
    }

    // Perbarui state lokal agar UI langsung update tanpa reload
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      description,
      pointsAdded: points,
      date: new Date().toISOString(),
      chain: chain || 'Sepolia Testnet'
    };

    setRecentActivity((prev) => [newActivity, ...prev]);
  };

  return (
    <PointsContext.Provider value={{ userPoints, setUserPoints, recentActivity, addActivity, fetchUserActivities }}>
      {children}
    </PointsContext.Provider>
  );
};

// Hook custom agar halaman lain gampang memanggil Brankas ini
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints harus digunakan di dalam PointsProvider");
  }
  return context;
};