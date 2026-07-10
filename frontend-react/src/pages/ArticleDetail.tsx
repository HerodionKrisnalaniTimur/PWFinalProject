import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'; 
import Navbar from '../components/Navbar'; 
import Footer from './Footer'; 
import { useMetaMask } from '../context/MetaMaskContext';

interface Article {
  id: number;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
}

const ArticleDetail = () => {
  // Menangkap ID dari URL (contoh: /news/1)
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, account } = useMetaMask();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Memanggil API berdasarkan ID artikel
    fetch(`http://127.0.0.1:8000/api/articles/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setArticle(data.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil detail artikel:", error);
        setIsLoading(false);
      });
  }, [id]);

  // Fungsi untuk menghapus artikel (hanya bisa dipanggil oleh admin)
  const handleDelete = async () => {
    if (!isAdmin) {
      alert('⛔ Anda tidak memiliki akses admin untuk menghapus artikel.');
      return;
    }

    if (window.confirm("Yakin ingin menghapus artikel ini? Tindakan ini tidak bisa dibatalkan.")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/articles/${id}`, {
          method: 'DELETE',
          headers: {
            'X-Wallet-Address': account || '',
          },
        });

        if (response.ok) {
          alert("Artikel berhasil dihapus.");
          navigate('/news'); // Lempar kembali ke daftar berita
        } else if (response.status === 403) {
          alert('⛔ Anda tidak memiliki akses admin!');
        } else {
          alert('Gagal menghapus artikel.');
        }
      } catch (error) {
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-32 pb-20">
        
        {/* Baris Navigasi & Tombol Aksi */}
        <div className="flex justify-between items-center mb-8">
          {/* Tombol Kembali */}
          <Link to="/news" className="inline-flex items-center text-zinc-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={18} className="mr-2" /> Kembali ke Berita
          </Link>

          {/* Tombol Edit & Hapus (Hanya muncul kalau datanya sudah ada DAN user adalah admin) */}
          {article && isAdmin && (
            <div className="flex gap-3">
              <Link to={`/admin/edit/${article.id}`} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold shadow-sm">
                <Edit size={16} className="mr-2" /> Edit
              </Link>
              <button onClick={handleDelete} className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold shadow-sm">
                <Trash2 size={16} className="mr-2" /> Hapus
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center text-zinc-500 animate-pulse text-lg py-20">Memuat isi artikel...</div>
        ) : !article ? (
          <div className="text-center text-zinc-500 text-lg py-20">Artikel tidak ditemukan.</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
            {/* Area Gambar Utama */}
            <div className="h-64 sm:h-[400px] bg-zinc-200 relative">
              {article.image ? (
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <span>Tidak ada gambar sampul</span>
                </div>
              )}
            </div>

            {/* Area Konten */}
            <div className="p-8 sm:p-12 md:px-16">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
                {article.title}
              </h1>
              
              {/* Tanggal */}
              <p className="text-zinc-500 text-sm mb-8 border-b border-zinc-100 pb-8">
                Diterbitkan pada: {new Date(article.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>

              {/* Isi Artikel */}
              <div className="text-zinc-700 leading-relaxed text-lg whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;