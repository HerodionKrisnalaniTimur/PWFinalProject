import React from 'react'
import LogoLoop from './LogoLoop';
import Valve from "../assets/valve.png";
import GitHub from "../assets/github.png";
import RiotGames from "../assets/riot.png";
import Steam from "../assets/steam.png";

function LoopLogo() {
  const cryptoLogos = [
    { src: Valve, alt: "Valve", href: "https://valvesoftware.com" },
    { src: Steam, alt: "Steam", href: "https://store.steampowered.com/" },
    { src: GitHub, alt: "GitHub", href: "https://github.com/" },
    { src: RiotGames, alt: "Riot Games", href: "https://www.riotgames.com/" },
  ];
  const [logoSize, setLogoSize] = useState(20);
  const [gap, setGap] = useState(24);
  
      const updateSize = () => {
      if (window.innerWidth < 640) {
        setLogoSize(20);
        setGap(24);
      } else if (window.innerWidth < 1024) {
        setLogoSize(25);
        setGap(32);
      } else {
        setLogoSize(30);
        setGap(40);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full overflow-hidden h-20 opacity-80">
        <LogoLoop
            logos={cryptoLogos}
            speed={60}
            direction="left"
            logoHeight={25}
            gap={40}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#09090b"
            ariaLabel="Crypto Partners"
        />
    </div>
  )
}

export default LoopLogo;