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