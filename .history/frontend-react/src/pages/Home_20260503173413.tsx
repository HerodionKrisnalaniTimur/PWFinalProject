import { ArrowUpRight, MessageCircle } from "lucide-react";
import HomeGif from "../assets/Home.gif";
import TextType from "../components/TextType";

export default function Home() {
  return (
    <section className="relative z-10 w-full min-h-screen flex items-center">

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* LEFT */}
          <div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm mb-6 sm:mb-8">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              RealFi, Accessible to All.
            </div>

            {/* Heading */}
            <h1 className="font-light leading-tight tracking-tight text-zinc-900 max-w-2xl text-[clamp(1.5rem,4vw,3.5rem)]">
              Inclusive Financial Layer 2 for Real Value and Institutional-Grade Assets
            </h1>

            {/* Button */}
            <div className="mt-6 sm:mt-8 md:mt-10">
              <button className="flex items-center gap-2 sm:gap-3 bg-white shadow-md hover:shadow-lg px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-sm sm:text-base transition">
                
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
            <div className="mt-10 sm:mt-14 lg:mt-16 max-w-lg border-l-2 border-zinc-700 pl-4 sm:pl-6 text-sm sm:text-base text-zinc-700 leading-relaxed">
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
          <div className="flex justify-center items-center mt-10 lg:mt-0 order-2 lg:order-2">
            <img
              src={HomeGif}
              alt="Hero Animation"
              className="w-full max-w-[300px] sm:max-w-[3500px] md:max-w-[450px] lg:max-w-[500px] rounded-2xl shadow-2xl"
            />
          </div>

        </div>

      </div>

    </section>
  );
}