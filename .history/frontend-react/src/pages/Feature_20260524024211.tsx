import FeatureCard from "../components/FeatureCard";
import Steam from "../assets/steam.png";
import { image } from "framer-motion/client";
const features = [
  {
    number: "1",
    title: "MODULAR. PARALLEL.",
    desc: "Built for scalable next-gen finance with ultra-fast execution. lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, eaque. lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, eaque.",
    image : Steam,
  },
  {
    number: "2",
    title: "COMPLIANT BY DESIGN.",
    desc: "Secure infrastructure ready for institutions and builders.",
    image : Steam,
  },
  {
    number: "3",
    title: "MODULAR. PARALLEL.",
    desc: "Built for scalable next-gen finance with ultra-fast execution.",
    image : Steam,
  },
  {
    number: "4",
    title: "COMPLIANT BY DESIGN.",
    desc: "Secure infrastructure ready for institutions and builders.",
    image : Steam,
  },
];

export default function Feature() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6" id:="feature">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {features.map((item, index) => (
          <FeatureCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}