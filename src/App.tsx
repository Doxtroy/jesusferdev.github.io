import { useEffect, useState } from "react";
import RetroMac128KPortfolio from "./RetroMac128KPortfolio";
import MobileHome from "./MobileHome";

const getShouldRenderMobile = () => {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrow = window.matchMedia?.('(max-width: 768px)').matches ?? false;
  const touch = "ontouchstart" in window;
  return coarse || touch || narrow;
};

function useShouldRenderMobile(){
  const [shouldMobile,setShouldMobile] = useState<boolean>(getShouldRenderMobile);

  useEffect(()=>{
    if (typeof window === "undefined") return;
    const update = () => setShouldMobile(getShouldRenderMobile());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    const coarseQuery = window.matchMedia?.('(pointer: coarse)');
    const coarseHandler = () => update();
    if (coarseQuery && 'addEventListener' in coarseQuery) coarseQuery.addEventListener('change', coarseHandler);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (coarseQuery && 'removeEventListener' in coarseQuery) coarseQuery.removeEventListener('change', coarseHandler);
    };
  },[]);

  return shouldMobile;
}

export default function App() {
  const shouldMobile = useShouldRenderMobile();
  return shouldMobile ? <MobileHome /> : <RetroMac128KPortfolio />;
}
