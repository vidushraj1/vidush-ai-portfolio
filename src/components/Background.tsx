import { useEffect, useRef } from "react";

export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, ps: { x: number; y: number; vx: number; vy: number }[] = [];
    const m = { x: -999, y: -999 };
    
    const size = () => {
      w = c.width = innerWidth; h = c.height = innerHeight;
      // Added a Math.max(35, ...) so mobile screens always have at least 35 particles
      ps = Array.from({ length: Math.min(95, Math.max(35, Math.floor((w * h) / 15000))) }, () => ({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 
      }));
    };
    
    const draw = () => {
      g.clearRect(0, 0, w, h);
      // Added a fallback color in case mobile browsers fail to read the CSS variable quickly
      const k = getComputedStyle(document.documentElement).getPropertyValue("--ac").trim() || "#2563eb";
      g.fillStyle = k; g.strokeStyle = k;
      
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dm = Math.hypot(p.x - m.x, p.y - m.y);
        
        if (dm < 190) { 
          g.globalAlpha = (1 - dm / 190) * .6; 
          g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(m.x, m.y); g.stroke(); 
          p.x += (m.x - p.x) * .004; p.y += (m.y - p.y) * .004; 
        }
        
        g.globalAlpha = .55; g.beginPath(); g.arc(p.x, p.y, 1.7, 0, 7); g.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(p.x - ps[j].x, p.y - ps[j].y);
          if (d < 130) { 
            g.globalAlpha = (1 - d / 130) * .22; 
            g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(ps[j].x, ps[j].y); g.stroke(); 
          }
        }
      }
      
      // Request animation frame is now always called, overriding low-power mode blocks
      raf = requestAnimationFrame(draw);
    };
    
    const mv = (e: PointerEvent) => { m.x = e.clientX; m.y = e.clientY; };
    size(); draw();
    
    addEventListener("resize", size); 
    addEventListener("pointermove", mv);
    
    return () => { 
      cancelAnimationFrame(raf); 
      removeEventListener("resize", size); 
      removeEventListener("pointermove", mv); 
    };
  }, []);
  
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}