import FeatureCard from "../components/FeatureCard";
const features = [
  {
    number: "1",
    title: "Skalabilitas Tinggi (High Scalability)",
    desc: "Dibangun untuk ekosistem keuangan masa depan dengan eksekusi transaksi ultra-cepat. Melalui pemrosesan paralel, sistem kami mampu menangani ribuan transaksi per detik (TPS) tanpa mengorbankan keamanan atau desentralisasi.",
    image: "https://api.iconify.design/lucide/zap.svg?color=%230066ff&stroke-width=1",
  },
  {
    number: "2",
    title: "Compliance & Security",
    desc: "Infrastruktur aman yang dirancang khusus untuk institusi dan pengembang global. Kami mengintegrasikan protokol identitas terdesentralisasi dan standar regulasi industri untuk memastikan ekosistem yang transparan dan akuntabel.",
    image: "https://api.iconify.design/lucide/shield-check.svg?color=%230066ff&stroke-width=1",
  },
  {
    number: "3",
    title: "Interoperability",
    desc: "Memungkinkan pertukaran aset dan data secara mulus antar berbagai jaringan blockchain. Dengan teknologi jembatan (bridge) yang aman, hambatan antar ekosistem dihilangkan untuk menciptakan likuiditas yang lebih luas dan efisien.",
    image: "https://api.iconify.design/lucide/network.svg?color=%230066ff&stroke-width=1",
  },
  {
    number: "4",
    title: "Cost Efficiency",
    desc: "Mengoptimalkan struktur biaya gas (gas fees) seminimal mungkin melalui mekanisme konsensus yang ramah energi. Solusi ini memberikan aksesibilitas bagi semua skala bisnis, dari startup hingga korporasi besar dalam mengadopsi teknologi tersebut.",
    image: "https://api.iconify.design/lucide/fuel.svg?color=%230066ff&stroke-width=1",
  },
];

export default function Feature() {
  return (
    <section className="bg-white pt-10 pb-20 px-4 sm:px-6 py-16 sm:py-20 lg:py-24 px-4 sm:px-6" id="feature">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {features.map((item, index) => (
          <FeatureCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}