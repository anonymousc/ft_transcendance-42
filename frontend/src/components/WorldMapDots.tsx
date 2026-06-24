import { useEffect, useRef } from "react";

// Simplified continent outlines as [longitude °, latitude °] pairs.
// Equirectangular projection: x = (lon+180)/360, y = (90-lat)/180
const POLYGONS: [number, number][][] = [
  // North America
  [
    [-168, 72], [-140, 70], [-90, 75], [-62, 63],
    [-52, 47], [-66, 44], [-70, 42], [-76, 34],
    [-80, 25], [-87, 16], [-78, 8],
    [-106, 22], [-117, 32], [-125, 48],
    [-140, 60], [-168, 72],
  ],
  // Greenland
  [[-55, 83], [-17, 83], [-18, 76], [-20, 65], [-44, 60], [-52, 68], [-55, 83]],
  // South America
  [
    [-80, 12], [-62, 12], [-50, 5], [-35, -5],
    [-38, -15], [-42, -22], [-50, -28],
    [-65, -55], [-72, -50], [-72, -40],
    [-70, -30], [-75, -10], [-80, 12],
  ],
  // Europe (mainland)
  [
    [-9, 36], [10, 36], [16, 36], [22, 38],
    [28, 42], [32, 46], [30, 58], [26, 64],
    [20, 68], [16, 70], [15, 72],
    [5, 72], [-3, 72], [-8, 65], [-10, 60],
    [-8, 44], [-9, 36],
  ],
  // Iceland
  [[-24, 63], [-13, 63], [-13, 67], [-24, 67], [-24, 63]],
  // Africa
  [
    [-6, 36], [12, 37], [25, 32], [33, 30],
    [42, 12], [50, 12], [43, 4], [40, -5],
    [36, -20], [32, -30], [28, -35], [18, -35],
    [8, -8], [0, -5], [-8, 5],
    [-17, 14], [-17, 22], [-6, 36],
  ],
  // Arabian Peninsula
  [[36, 30], [55, 26], [58, 14], [50, 12], [42, 12], [36, 18], [36, 30]],
  // Asia (mainland — avoids anti-meridian wrap)
  [
    [26, 70], [80, 73], [130, 72], [145, 70],
    [145, 52], [140, 42], [130, 32], [122, 22],
    [108, 16], [100, 5], [80, 8], [72, 20],
    [65, 22], [60, 22], [50, 28], [42, 36],
    [36, 44], [26, 60], [26, 70],
  ],
  // Japanese main islands (Honshu)
  [[130, 31], [132, 33], [136, 36], [141, 40], [140, 42], [138, 38], [130, 31]],
  // Borneo
  [[108, 2], [117, 2], [118, 7], [114, 8], [108, 7], [108, 2]],
  // Sumatra
  [[96, 5], [104, 4], [106, 0], [103, -4], [98, -5], [96, 2], [96, 5]],
  // New Guinea
  [[131, -1], [141, -1], [145, -5], [141, -8], [134, -8], [131, -4], [131, -1]],
  // Australia
  [
    [114, -22], [122, -16], [130, -12], [138, -14],
    [140, -16], [145, -15], [148, -20], [150, -28],
    [150, -38], [140, -38], [130, -32], [118, -32],
    [114, -28], [114, -22],
  ],
  // New Zealand (combined rough outline)
  [[168, -44], [174, -43], [178, -38], [174, -36], [170, -39], [168, -44]],
  // Madagascar
  [[44, -12], [50, -14], [50, -20], [47, -25], [44, -24], [42, -18], [44, -12]],
  // British Isles
  [[-6, 50], [2, 51], [2, 54], [0, 58], [-2, 58], [-6, 58], [-8, 54], [-6, 50]],
  // Antarctica
  [
    [-180, -70], [-150, -76], [-90, -80], [-45, -76],
    [0, -72], [45, -76], [90, -80], [135, -76],
    [180, -70], [180, -90], [-180, -90], [-180, -70],
  ],
];

function pointInPoly(lon: number, lat: number, poly: [number, number][]): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const pi = poly[i]!;
    const pj = poly[j]!;
    if (((pi[1] > lat) !== (pj[1] > lat)) && lon < ((pj[0] - pi[0]) * (lat - pi[1])) / (pj[1] - pi[1]) + pi[0])
      inside = !inside;
  }
  return inside;
}

function isLand(lon: number, lat: number): boolean {
  return POLYGONS.some((p) => pointInPoly(lon, lat, p));
}

export default function WorldMapDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark
        ? "rgba(240, 228, 210, 0.14)"
        : "rgba(28, 18, 8,  0.20)";

      const spacing = 11;
      const radius = 1.1;

      for (let px = spacing * 0.5; px < w; px += spacing) {
        for (let py = spacing * 0.5; py < h; py += spacing) {
          const lon = (px / w) * 360 - 180;
          const lat = 90 - (py / h) * 180;
          if (isLand(lon, lat)) {
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(schedule);
    ro.observe(canvas);

    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-world-map" aria-hidden="true" />;
}
