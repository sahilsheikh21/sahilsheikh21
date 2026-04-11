const fs = require("fs");

const W = 830, H = 220;
const GRAVITY = 0.25;
const FPS = 60;
const DURATION = 12; // seconds
const FRAMES = FPS * DURATION;

const items = [
  { text: "sahilsheikh21", color: "#ffffff", bg: "#111111", size: 15, bold: true },
  { text: "JavaScript",    color: "#111111", bg: "#F7DF1E", size: 12, bold: false },
  { text: "TypeScript",    color: "#ffffff", bg: "#3178C6", size: 12, bold: false },
  { text: "React",         color: "#111111", bg: "#61DAFB", size: 12, bold: false },
  { text: "Next.js",       color: "#ffffff", bg: "#000000", size: 12, bold: false },
  { text: "Python",        color: "#ffffff", bg: "#3776AB", size: 12, bold: false },
  { text: "Node.js",       color: "#ffffff", bg: "#339933", size: 12, bold: false },
  { text: "Docker",        color: "#ffffff", bg: "#2496ED", size: 12, bold: false },
  { text: "PostgreSQL",    color: "#ffffff", bg: "#4169E1", size: 12, bold: false },
  { text: "MongoDB",       color: "#ffffff", bg: "#47A248", size: 12, bold: false },
];

// Estimate pill dimensions
function getDims(item) {
  const charW = item.bold ? item.size * 0.65 : item.size * 0.6;
  const w = Math.round(item.text.length * charW + 24);
  const h = item.size + 16;
  return { w, h };
}

// Simulate physics for each item
function simulate(item, startX, startY, vx, vy) {
  const { w, h } = getDims(item);
  const positions = [];
  let x = startX, y = startY;
  let dvx = vx, dvy = vy;

  for (let f = 0; f < FRAMES; f++) {
    dvy += GRAVITY;
    x += dvx;
    y += dvy;

    // Bounce off walls
    if (x < 0) { x = 0; dvx = Math.abs(dvx) * 0.85; }
    if (x + w > W) { x = W - w; dvx = -Math.abs(dvx) * 0.85; }
    if (y < 0) { y = 0; dvy = Math.abs(dvy) * 0.75; }
    if (y + h > H) { y = H - h; dvy = -Math.abs(dvy) * 0.85; dvx *= 0.98; }

    // Sample every 6 frames for keyframes
    if (f % 6 === 0) positions.push({ x: Math.round(x), y: Math.round(y) });
  }
  return positions;
}

// Seed starting conditions (spread items around)
const seeds = [
  [60,  10,  2.1, 1.0],
  [200, 80,  -1.8, 2.2],
  [400, 20,  1.5, 1.8],
  [600, 60,  -2.0, 1.2],
  [100, 140, 2.5, -1.5],
  [320, 100, -1.2, 2.0],
  [520, 30,  1.8, 2.5],
  [700, 110, -2.2, 1.6],
  [260, 50,  1.0, 2.8],
  [460, 130, -1.5, 1.9],
];

// Build SVG
let css = `<style>
* { font-family: 'JetBrains Mono', 'Courier New', monospace; }
`;

let elements = "";

items.forEach((item, i) => {
  const [sx, sy, vx, vy] = seeds[i];
  const positions = simulate(item, sx, sy, vx, vy);
  const { w, h } = getDims(item);
  const r = Math.round(h / 2);
  const totalFrames = positions.length;
  const animName = `anim${i}`;

  // Build keyframes
  let kf = `@keyframes ${animName} {\n`;
  positions.forEach((pos, fi) => {
    const pct = Math.round((fi / (totalFrames - 1)) * 100);
    kf += `  ${pct}% { transform: translate(${pos.x}px, ${pos.y}px); }\n`;
  });
  kf += "}\n";
  css += kf;

  css += `.item${i} {
  animation: ${animName} ${DURATION}s linear infinite;
  transform: translate(${positions[0].x}px, ${positions[0].y}px);
}\n`;

  elements += `
  <g class="item${i}">
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="${item.bg}" />
    <text x="${w / 2}" y="${Math.round(h / 2 + item.size * 0.35)}"
      text-anchor="middle"
      font-size="${item.size}"
      font-weight="${item.bold ? "600" : "400"}"
      fill="${item.color}">${item.text}</text>
  </g>`;
});

css += "</style>";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&amp;display=swap');</style>
  </defs>
  <rect width="${W}" height="${H}" rx="12" fill="#0d1117"/>
  ${css}
  ${elements}
</svg>`;

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/physics.svg", svg);
console.log("Generated dist/physics.svg");
