/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchPointActivities, storePointActivity, fetchWalletPoints } from '../services/pointService';

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
  // Saldo poin awal (0, akan disinkronkan dari database begitu wallet terhubung)
  const [userPoints, setUserPoints] = useState<number>(0);

  // Riwayat awal kosong, diisi dari database setelah wallet terhubung
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  /**
   * Mengambil riwayat poin + total saldo poin dari database untuk wallet tertentu.
   * userPoints SEKARANG diambil langsung dari kolom users.points (via /wallet-points),
   * bukan dihitung manual dari daftar aktivitas seperti sebelumnya.
   */
  const fetchUserActivities = async (walletAddress: string) => {
    try {
      const [activitiesRes, pointsRes] = await Promise.all([
        fetchPointActivities({ wallet_address: walletAddress, limit: 10 }),
        fetchWalletPoints(walletAddress)
      ]);

      if (activitiesRes && activitiesRes.success) {
        const dbActivities = activitiesRes.data.map((item: any) => ({
          id: item.id,
          type: item.activity_type,
          description: item.description,
          pointsAdded: item.points,
          date: item.created_at || new Date().toISOString(),
          chain: item.chain || ''
        }));
        setRecentActivity(dbActivities);
      }

      if (pointsRes && pointsRes.success) {
        setUserPoints(pointsRes.points);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data poin dari database:", error);
    }
  };

  // Untuk menambah/mengurangi poin & mencatat riwayat ke database
  const addActivity = async (type: string, description: string, points: number, walletAddress?: string, chain?: string) => {
    try {
      const response = await storePointActivity({
        activity_type: type,
        description: description,
        points: points,
        wallet_address: walletAddress || null,
        chain: chain || 'Sepolia Testnet'
      });

      // Sinkronkan saldo poin dari angka resmi yang dikembalikan backend (sumber kebenaran)
      if (response && typeof response.total_points === 'number') {
        setUserPoints(response.total_points);
      } else {
        // Fallback: update optimis di lokal kalau backend belum mengirim total_points
        setUserPoints((prev) => prev + points);
      }

      const newActivity: Activity = {
        id: response?.data?.id ?? Math.random().toString(36).substring(2, 9),
        type,
        description,
        pointsAdded: points,
        date: response?.data?.created_at || new Date().toISOString(),
        chain: chain || 'Sepolia Testnet'
      };

      setRecentActivity((prev) => [newActivity, ...prev]);
    } catch (error) {
      console.error("Gagal menyimpan aktivitas ke backend:", error);
      // Sengaja TIDAK mengubah userPoints/recentActivity di sini,
      // supaya UI tidak menampilkan saldo yang sebenarnya tidak tersimpan di database.
    }
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