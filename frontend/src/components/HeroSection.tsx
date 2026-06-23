import "./HeroSection.css";
import { useEffect, useRef, useState } from "react";
import WorldMapDots from "./WorldMapDots";
import { Link } from "react-router-dom";
import imssouane from "../assets/imsouane.webp";

import marrakesh from "../assets/marrakesh.webp";
import oldmedine from "../assets/oldmedina.webp";


const CARDS = [
  { img: imssouane, kicker: "Atlantic Coast", title: "2 days in Imssouane", sub: "8 places · scenic route" },
  { img: oldmedine,      kicker: "Golden Hour Route", title: "Medina photo walk",    sub: "12 stops · 2.4 km loop" },
  { img: marrakesh,      kicker: "Weekend Escape",    title: "Rooftops & ridge hike", sub: "6 places · 2 days" },
];

const DRAG_THRESHOLD = 100;

function CardStack() {
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const [posDx, setPosDx] = useState(0);
  const [posDy, setPosDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [snapNone, setSnapNone] = useState<number | null>(null);

  const startX = useRef(0);
  const startY = useRef(0);
  const isDraggingRef = useRef(false);
  const dxRef = useRef(0);
  const dyRef = useRef(0);

  const handleDown = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (order[0] !== i) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDraggingRef.current = true;
    dxRef.current = 0;
    dyRef.current = 0;
    setIsDragging(true);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (!isDraggingRef.current || order[0] !== i) return;
    dxRef.current = e.clientX - startX.current;
    dyRef.current = e.clientY - startY.current;
    setPosDx(dxRef.current);
    setPosDy(dyRef.current);
  };

  // The browser takes over for vertical page scroll (touch-action: pan-y) and
  // fires pointercancel — reset so the card snaps back instead of sticking.
  const handleCancel = (_e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (!isDraggingRef.current || order[0] !== i) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setPosDx(0);
    setPosDy(0);
  };

  const handleUp = (_e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (!isDraggingRef.current || order[0] !== i) return;
    isDraggingRef.current = false;
    const dx = dxRef.current;
    const dy = dyRef.current;

    if (Math.abs(dx) > DRAG_THRESHOLD) {
      const dir = Math.sign(dx);
      setIsDragging(false);
      setPosDx(dir * 720);
      setPosDy(dy + 40);
      setTimeout(() => {
        setOrder((prev) => {
          const next = [...prev.slice(1), prev[0]];
          const back = next[next.length - 1];
          setSnapNone(back);
          setTimeout(() => setSnapNone(null), 60);
          return next;
        });
        setPosDx(0);
        setPosDy(0);
      }, 280);
    } else {
      setIsDragging(false);
      setPosDx(0);
      setPosDy(0);
    }
  };

  return (
    <div className="card-stack-wrap">
      <div className="card-stack">
        {CARDS.map((card, i) => {
          const depth = order.indexOf(i);
          const isFront = depth === 0;
          const noTrans = (isDragging && isFront) || snapNone === i;
          const transform = isFront
            ? `translate(${posDx}px, ${posDy}px) rotate(${posDx / 24}deg)`
            : `translateY(${depth * 18}px) scale(${(1 - depth * 0.06).toFixed(3)})`;

          return (
            <div
              key={i}
              className="stack-card"
              style={{
                transform,
                transition: noTrans
                  ? "none"
                  : "transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s ease",
                zIndex: CARDS.length - depth,
                cursor: isFront ? (isDragging ? "grabbing" : "grab") : "default",
                boxShadow: `0 ${24 + (isFront ? 14 : 0)}px 52px -22px rgba(0,0,0,${isFront ? 0.45 : 0.32})`,
              }}
              onPointerDown={(e) => handleDown(e, i)}
              onPointerMove={(e) => handleMove(e, i)}
              onPointerUp={(e) => handleUp(e, i)}
              onPointerCancel={(e) => handleCancel(e, i)}
            >
              <img src={card.img} alt="" draggable={false} className="stack-card-img" />
              <div className="stack-card-overlay" />
              <div className="stack-card-info">
                <div className="stack-card-kicker">{card.kicker}</div>
                <div className="stack-card-title">{card.title}</div>
                <div className="stack-card-sub">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card-dots">
        {CARDS.map((_, i) => (
          <span key={i} className={`card-dot${order[0] === i ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const getScrollParent = (node: HTMLElement): HTMLElement | Window => {
      let cur: HTMLElement | null = node.parentElement;
      while (cur) {
        const { overflowY } = window.getComputedStyle(cur);
        if ((overflowY === "auto" || overflowY === "scroll") && cur.scrollHeight > cur.clientHeight)
          return cur;
        cur = cur.parentElement;
      }
      return window;
    };
    const scrollParent = getScrollParent(el);
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Dark-mode bottom fade offset
      const progress = Math.max(0, Math.min(1, (vh - rect.bottom) / vh));
      el.style.setProperty("--hero-fade-shift", `${Math.round(progress * 48)}px`);

    };
    const onScroll = () => { if (raf) return; raf = window.requestAnimationFrame(update); };
    update();
    const target = scrollParent === window ? window : scrollParent as HTMLElement;
    target.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-section">
      <WorldMapDots />
      <div className="hero-overlay" />
      <div className="hero-bottom-fade" aria-hidden="true" />

      <div className="hero-shell">
        <div className="hero-top">
          <div className="hero-content hero-copy">
            <h1 className="hero-title">
              Make your next trip feel{" "}
              <span className="hero-accent">effortless.</span>
            </h1>
            <p className="hero-subtitle">
              Discover Moroccan cities, build AI-powered itineraries, and travel together, everything in one place.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="hero-btn-primary">Discover now</Link>
              <Link to="/register" className="hero-btn-secondary">See the planner</Link>
            </div>
          </div>

          <div className="hero-image">
            <CardStack />
          </div>
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
