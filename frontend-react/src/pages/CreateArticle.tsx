import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from './Footer'; 

const CreateArticle = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null); // State khusus untuk menampung file foto
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  // Fungsi saat pengguna memilih foto dari laptop
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // MENGGUNAKAN FORMDATA (Wajib untuk upload file)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', generateSlug(title));
    formData.append('content', content);
    
    // Jika ada gambar yang dipilih, masukkan ke dalam formData
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/articles', {
        method: 'POST',
        // Catatan Penting: Saat memakai FormData, kita TIDAK BOLEH menuliskan 'Content-Type': 'application/json'
        body: formData
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        alert('Mantap! Artikel beserta gambar berhasil diterbitkan.');
        navigate('/news'); 
      } else {
        alert('Gagal menyimpan: ' + (data.message || 'Cek kembali isianmu.'));
      }
    } catch (error) {
      console.error('Error:', error);
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
            <h1 className="text-3xl font-extrabold text-zinc-900">Tulis Artikel Baru</h1>
            <p className="mt-2 text-zinc-500">Bagikan informasi terbaru ke komunitas Zentrix.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Judul Artikel</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul..." className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none bg-zinc-50" />
            </div>

            {/* AREA UPLOAD GAMBAR */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Gambar Sampul (Opsional)</label>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                onChange={handleImageChange} 
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none bg-zinc-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
              />
              <p className="mt-2 text-xs text-zinc-400">Format: JPG, PNG, atau WEBP. Maksimal 2MB.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Isi Konten</label>
              <textarea required rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis isi artikelmu di sini..." className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none bg-zinc-50 resize-y"></textarea>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isLoading ? 'bg-zinc-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isLoading ? 'Mengunggah Data & Gambar...' : 'Terbitkan Artikel'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateArticle;