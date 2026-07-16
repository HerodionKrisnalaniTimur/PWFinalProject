import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Sesuaikan path jika perlu
import Footer from './Footer'; // Sesuaikan path jika perlu

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string | null;
}

const NewsPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Memanggil API Laravel
    fetch('http://127.0.0.1:8000/api/articles')
      .then((response) => response.json())
      .then((data) => {
        setArticles(data.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data artikel:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-32 pb-20">
        <div className="text-center mb-12" id='news'>
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Artikel & Berita
          </h1>
          <p className="mt-4 text-xl text-zinc-500">
            Dapatkan informasi dan pembaruan terbaru dari ekosistem kami.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-zinc-500 animate-pulse text-lg">Memuat artikel...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-zinc-500 text-lg">Belum ada artikel yang diterbitkan.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Bagian Gambar */}
                <div className="h-48 bg-zinc-200 relative">
                  {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                      <span>Tidak ada gambar</span>
                    </div>
                  )}
                </div>

                {/* Bagian Konten */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-zinc-600 line-clamp-3 mb-5 flex-grow">
                    {article.content}
                  </p>
                  <Link to={`/news/${article.id}`} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-left">
                    Baca Selengkapnya &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;