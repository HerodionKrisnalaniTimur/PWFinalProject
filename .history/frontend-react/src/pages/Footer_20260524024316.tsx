import { motion } from "framer-motion";
import { Disc as Discord, ArrowRight } from "lucide-react";
import { useState } from "react";

const columns = [
  { title: "Build", links: ["Docs", "Testnet", "Grants"] },
  { title: "Explore", links: ["Ecosystem", "Onboarding Guide"] },
  { title: "Learn", links: ["Technology", "Blog", "News", "FAQ"] },
  { title: "Company", links: ["Careers", "User Agreement", "Privacy Policy"] },
  { title: "Community", links: ["Discord", "Twitter", "LinkedIn"] },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return alert("Masukkan email dulu");
    alert(`Subscribed: ${email}`);
    setEmail("");
  };

  return (
    <footer className="relative bg-[#0e0f14] text-white px-4 sm:px-6 py-16 sm:py-20 overflow-hidden" id>

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-purple-500/10 blur-3xl rounded-full" />
      </div>

      {/* GRID TEXTURE */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
        <div className="w-full h-full bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-0 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-10"
      >

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* Logo */}
          <h2 className="text-2xl font-bold tracking-wide">
            ZENTRIX COMPANY
          </h2>

          {/* Social */}
          <div className="flex gap-3">
            {[Discord].map((Icon, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-white/10 hover:bg-blue-500 transition cursor-pointer"
              >
                <Icon size={18} />
              </div>
            ))}
          </div>

          {/* Subscribe */}
          <div className="flex items-center bg-white/5 backdrop-blur rounded-xl overflow-hidden border border-white/10">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent px-4 py-3 outline-none w-full text-sm placeholder:text-zinc-400"
            />
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-3 flex items-center gap-2 text-sm transition"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </div>

          {/* Copyright */}
          <p className="text-sm text-zinc-500">
            © 2026 Zentrix. All Rights Reserved.
          </p>
        </div>

        {/* RIGHT COLUMNS */}
        {columns.map((col, i) => (
          <div key={i} className="space-y-3">

            <h4 className="text-zinc-500 text-xs uppercase tracking-widest">
              {col.title}
            </h4>

            <ul className="space-y-2">
              {col.links.map((link, idx) => (
                <li
                  key={idx}
                  className="text-sm text-zinc-300 hover:text-blue-400 transition cursor-pointer"
                >
                  {link}
                </li>
              ))}
            </ul>

          </div>
        ))}

      </motion.div>

    </footer>
  );
}