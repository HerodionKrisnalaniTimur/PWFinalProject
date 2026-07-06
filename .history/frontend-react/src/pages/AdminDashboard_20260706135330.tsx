import React from 'react';
import { Link } from 'react-router-dom';
import { useMetaMask } from '../context/MetaMaskContext';
import Navbar from '../components/Navbar';
import Footer from './Footer';

const AdminDashboard = () => {
  const { account } = useMetaMask();

  const menuItems = [
    {
      icon: '📝',
      title: 'Buat Artikel Baru',
      description: 'Tulis dan publikasikan artikel baru',
      path: '/admin/create',
      color: 'bg-blue-500'
    },
    {
      icon: '📋',
      title: 'Kelola Artikel',
      description: 'Lihat, edit, atau hapus artikel',
      path: '/admin/articles',
      color: 'bg-green-500'
    },
    {
      icon: '👥',
      title: 'Kelola User',
      description: 'Manajemen pengguna dan wallet',
      path: '/admin/users',
      color: 'bg-purple-500'
    },
    {
      icon: '⚙️',
      title: 'Pengaturan',
      description: 'Konfigurasi sistem',
      path: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-32 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-zinc-900">Dashboard Admin</h1>
          <p className="mt-2 text-zinc-500">
            Selamat datang di panel admin Zentrix
          </p>
          <div className="mt-2 text-sm text-zinc-400 bg-zinc-50 px-3 py-1 rounded inline-block">
            Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Belum terhubung'}
          </div>
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500">
                  {item.description}
                </p>
                <div className="mt-4 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Akses →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Tambahan */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">ℹ️ Informasi Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-zinc-50 rounded-xl p-4">
              <p className="text-zinc-500">Total Artikel</p>
              <p className="text-2xl font-bold text-zinc-900">-</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4">
              <p className="text-zinc-500">Status</p>
              <p className="text-2xl font-bold text-green-600">🟢 Aktif</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4">
              <p className="text-zinc-500">Role</p>
              <p className="text-2xl font-bold text-blue-600">Administrator</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;