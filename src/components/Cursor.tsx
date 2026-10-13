import { useEffect, useRef } from "react";
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = 0, y = 0, rx = 0, ry = 0, raf = 0;
    const mv = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      dot.current!.style.transform = `translate(${x}px,${y}px)`;
      ring.current!.dataset.h = (e.target as HTMLElement).closest("a,button,input,textarea,select,summary") ? "1" : "0";
    };
    const loop = () => { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.current!.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(loop); };
    addEventListener("pointermove", mv); loop();
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(raf); document.documentElement.classList.remove("has-cursor"); };
  }, []);
  return (<><div ref={ring} className="cur-ring" /><div ref={dot} className="cur-dot" /></>);
}
