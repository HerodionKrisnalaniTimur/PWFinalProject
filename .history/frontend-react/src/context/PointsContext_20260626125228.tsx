import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Menentukan bentuk data aktivitas
export interface Activity {
  id: string;
  type: string; // Misalnya: "Swap" atau "Pool"
  description: string;
  pointsAdded: number;
  date: string;
}

// 2. Menentukan apa saja isi Brankas kita
interface PointsContextType {
  userPoints: number;
  recentActivity: Activity[];
  addActivity: (type: string, description: string, points: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

// 3. Membuat Provider (Penyedia Data)
export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Saldo poin awal
  const [userPoints, setUserPoints] = useState<number>(1250);
  
  // Riwayat awal (dummy) agar layarnya tidak kosong
  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: "init-1",
      type: "Swap",
      description: "Swapped 0.1 ETH to USDC",
      pointsAdded: 50,
      date: new Date().toISOString(),
    }
  ]);

  // Fungsi sakti untuk menambah poin & mencatat riwayat dari halaman manapun
  const addActivity = (type: string, description: string, points: number) => {
    setUserPoints((prev) => prev + points);
    
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      description,
      pointsAdded: points,
      date: new Date().toISOString(),
    };

    // Tambahkan aktivitas baru ke tumpukan paling atas
    setRecentActivity((prev) => [newActivity, ...prev]);
  };

  return (
    <PointsContext.Provider value={{ userPoints, recentActivity, addActivity }}>
      {children}
    </PointsContext.Provider>
  );
};

// 4. Hook custom agar halaman lain gampang memanggil Brankas ini
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints harus digunakan di dalam PointsProvider");
  }
  return context;
};