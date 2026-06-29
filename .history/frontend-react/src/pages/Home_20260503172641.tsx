import { ArrowUpRight, MessageCircle } from "lucide-react";
import HomeGif from "../assets/Home.gif";
import TextType from "../components/TextType";

export default function Home() {
  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 min-h-screen">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* LEFT */}
        <div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm mb-6 sm:mb-8">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            RealFi, Accessible to All.
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-zinc-900 max-w-2xl">
            Inclusive Financial Layer 2 for Real Value and Institutional-Grade Assets
          </h1>

          {/* Button */}
          <div className="mt-6 sm:mt-8">
            <button className="flex items-center gap-3 bg-white shadow-md hover:shadow-lg px-4 py-2 sm:px-5 sm:py-3 rounded-xl transition text-sm sm:text-base">
              
              <MessageCircle size={18} />

              <span className="font-medium">
                Join Community
              </span>

              <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg">
                <ArrowUpRight size={16} />
              </div>

            </button>
          </div>

          {/* Description */}
          <div className="mt-10 sm:mt-14 max-w-lg border-l-2 border-zinc-700 pl-4 sm:pl-6 text-sm sm:text-base text-zinc-700 leading-relaxed">
            <TextType 
              text={["Powered by modular architecture, deep-parallel execution, and built-in compliance, enabling real-time open finance onchain."]}
              typingSpeed={75}
              pauseDuration={5000}
              showCursor
              cursorCharacter="_"
              deletingSpeed={50}
              variableSpeedEnabled={false}
              variableSpeedMin={10}
              variableSpeedMax={300}
              cursorBlinkDuration={0.5}
            />
          </div>

        </div>

        {/* RIGHT */}
        <div className="hidden lg:flex justify-center items-center">
          <img
            src={HomeGif}
            alt="Hero Animation"
            className="w-full max-w-[500px] rounded-2xl shadow-2xl"
          />
        </div>

      </div>

    </section>
  );
}