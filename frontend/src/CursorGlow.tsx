
import { useEffect, useRef } from "react";
import "./CursorGlow.css";

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    const handleMouseMove = (event: MouseEvent) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      glow.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      glow.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      glow.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div className="lifeos-cursor-layer" aria-hidden="true">
      <div
        ref={glowRef}
        className="lifeos-cursor-spot"
      />
    </div>
  );
};

export default CursorGlow;
