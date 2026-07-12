import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import { useMetaMask } from '../context/MetaMaskContext';

interface UserRow {
  id: number;
  name: string;
  email: string;
  wallet_address: string | null;
  is_admin: boolean;
  created_at: string;
}

const ManageUsers = () => {
  const { account, isAdmin, isSuperAdmin } = useMetaMask();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: {
        'X-Wallet-Address': account || '',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil daftar user:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (account) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleToggleAdmin = async (user: UserRow) => {
    if (!isSuperAdmin) {
      alert('⛔ Hanya admin utama yang bisa mengubah role admin.');
      return;
    }

    const nextValue = !user.is_admin;
    const confirmMsg = nextValue
      ? `Jadikan "${user.name}" sebagai admin?`
      : `Cabut akses admin dari "${user.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(user.id);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': account || '',
        },
        body: JSON.stringify({ is_admin: nextValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_admin: nextValue } : u))
        );
      } else if (response.status === 403) {
        alert(`⛔ ${data.message || 'Anda tidak memiliki akses admin!'}`);
      } else {
        alert('Gagal mengubah role: ' + (data.message || 'Terjadi kesalahan.'));
      }
    } catch (error) {
      alert('Gagal terhubung ke server.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (user.is_admin && !isSuperAdmin) {
      alert('⛔ Hanya admin utama yang bisa menghapus admin lain.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus user "${user.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'X-Wallet-Address': account || '',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else if (response.status === 403) {
        alert(`⛔ ${data.message || 'Anda tidak memiliki akses admin!'}`);
      } else {
        alert('Gagal menghapus user: ' + (data.message || 'Terjadi kesalahan.'));
      }
    } catch (error) {
      alert('Gagal terhubung ke server.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-32 pb-20">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-zinc-500 hover:text-blue-600 transition-colors font-medium mb-4"
          >
            <ArrowLeft size={18} className="mr-2" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-zinc-900">Kelola User</h1>
          <p className="mt-2 text-zinc-500">
            Lihat, jadikan admin, atau hapus user yang terdaftar di Zentrix.
          </p>
        </div>

        {!isAdmin ? (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-10 text-center text-zinc-500">
            ⛔ Anda tidak memiliki akses admin untuk melihat halaman ini.
          </div>
        ) : isLoading ? (
          <div className="text-center text-zinc-500 animate-pulse text-lg py-20">
            Memuat daftar user...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-10 text-center text-zinc-500">
            Belum ada user yang terdaftar.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Wallet</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Terdaftar</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-zinc-100">
                      <td className="px-6 py-4 font-semibold text-zinc-900">{user.name}</td>
                      <td className="px-6 py-4 text-zinc-600">{user.email}</td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {user.wallet_address
                          ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-semibold">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleToggleAdmin(user)}
                              disabled={actionLoadingId === user.id}
                              className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                user.is_admin
                                  ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                              title={user.is_admin ? 'Cabut akses admin' : 'Jadikan admin'}
                            >
                              {user.is_admin ? (
                                <ShieldOff size={14} className="mr-1.5" />
                              ) : (
                                <ShieldCheck size={14} className="mr-1.5" />
                              )}
                              {user.is_admin ? 'Cabut Admin' : 'Jadikan Admin'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={actionLoadingId === user.id || (user.is_admin && !isSuperAdmin)}
                            className="flex items-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50"
                            title={
                              user.is_admin && !isSuperAdmin
                                ? 'Hanya admin utama yang bisa menghapus admin lain'
                                : 'Hapus user'
                            }
                          >
                            <Trash2 size={14} className="mr-1.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ManageUsers;