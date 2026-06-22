import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from './Footer'; 

const EditArticle = () => {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  // Mengambil data artikel lama saat halaman pertama kali dibuka
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTitle(data.data.title);
          setContent(data.data.content);
        }
        setIsFetching(false);
      })
      .catch(err => {
        console.error(err);
        setIsFetching(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedArticle = { 
      title: title, 
      slug: generateSlug(title), 
      content: content 
    };

    try {
      // Perhatikan: Methodnya PUT untuk melakukan update data
      const response = await fetch(`http://127.0.0.1:8000/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedArticle)
      });

      if (response.ok) {
        alert('Artikel berhasil diperbarui!');
        navigate(`/news/${id}`); // Kembali ke halaman detail artikel
      } else {
        alert('Gagal memperbarui artikel.');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl pt-32 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 sm:p-12">
          <div className="mb-8 border-b border-zinc-100 pb-6">
            <h1 className="text-3xl font-extrabold text-zinc-900">Edit Artikel</h1>
          </div>

          {isFetching ? (
            <p className="text-zinc-500 animate-pulse">Mengambil data artikel...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Judul Artikel</label>
                <input
                  type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Isi Konten</label>
                <textarea
                  required rows={8} value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-zinc-50 resize-y"
                ></textarea>
              </div>
              <button
                type="submit" disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isLoading ? 'bg-zinc-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditArticle;