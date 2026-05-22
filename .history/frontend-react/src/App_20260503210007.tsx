import Navbar from './components/Navbar';
import TrustedBrands from './pages/TrustedBrands';
import Home from './pages/Home'; 
import Feature from './pages/Feature';
import Blog from './pages/Blog';
import Footer from './pages/Footer';

function App() {
  
  return (
    <div className="bg-zinc-100">
      <section className="relative overflow-hidden ">

        {/* Background Grid */}
        <div className="absolute inset-0 flex justify-center items-start">
          <div className="grid-bg"></div>
        </div>

        {/* Content Above Grid */}
        <div className="relative z-10">
          <Navbar />
          <Home />
          <TrustedBrands />
        </div>

      </section>

      {/* SECTION CLEAN */}
      <section className="bg-white relative ">
        <Feature />
      </section>
      sect
      <Blog />
      <Footer />
    </div>
  );
}

export default App;