'use strict';

var fs = require('fs');
var path = require('path');

var W = 830;
var H = 220;
var GRAVITY = 0.25;
var DURATION = 12;
var FRAMES = 720;
var SAMPLE = 6;

var items = [
  { text: 'sahilsheikh21', color: '#ffffff', bg: '#111111', size: 15, bold: true  },
  { text: 'JavaScript',    color: '#111111', bg: '#F7DF1E', size: 12, bold: false },
  { text: 'TypeScript',    color: '#ffffff', bg: '#3178C6', size: 12, bold: false },
  { text: 'React',         color: '#111111', bg: '#61DAFB', size: 12, bold: false },
  { text: 'Next.js',       color: '#ffffff', bg: '#333333', size: 12, bold: false },
  { text: 'Python',        color: '#ffffff', bg: '#3776AB', size: 12, bold: false },
  { text: 'Node.js',       color: '#ffffff', bg: '#339933', size: 12, bold: false },
  { text: 'Docker',        color: '#ffffff', bg: '#2496ED', size: 12, bold: false },
  { text: 'Postgres',      color: '#ffffff', bg: '#4169E1', size: 12, bold: false },
  { text: 'MongoDB',       color: '#ffffff', bg: '#47A248', size: 12, bold: false },
];

var seeds = [
  [60,  10,  2.1,  1.0],
  [200, 80,  -1.8, 2.2],
  [400, 20,  1.5,  1.8],
  [580, 60,  -2.0, 1.2],
  [100, 140, 2.5,  -1.5],
  [320, 100, -1.2, 2.0],
  [500, 30,  1.8,  2.5],
  [680, 110, -2.2, 1.6],
  [250, 50,  1.0,  2.8],
  [440, 130, -1.5, 1.9],
];

function getW(item) {
  var cw = item.bold ? item.size * 0.65 : item.size * 0.6;
  return Math.ceil(item.text.length * cw + 28);
}

function getH(item) {
  return item.size + 18;
}

function simulate(sx, sy, vx, vy, w, h) {
  var positions = [];
  var x = sx, y = sy, dvx = vx, dvy = vy;
  for (var f = 0; f < FRAMES; f++) {
    dvy += GRAVITY;
    x += dvx;
    y += dvy;
    if (x < 0)     { x = 0;     dvx =  Math.abs(dvx) * 0.85; }
    if (x + w > W) { x = W - w; dvx = -Math.abs(dvx) * 0.85; }
    if (y < 0)     { y = 0;     dvy =  Math.abs(dvy) * 0.75; }
    if (y + h > H) { y = H - h; dvy = -Math.abs(dvy) * 0.85; dvx *= 0.98; }
    if (f % SAMPLE === 0) {
      positions.push([Math.round(x), Math.round(y)]);
    }
  }
  return positions;
}

var style = '';
var body  = '';

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var seed = seeds[i];
  var iw = getW(item);
  var ih = getH(item);
  var ir = Math.round(ih / 2);
  var itx = Math.round(iw / 2);
  var ity = Math.round(ih / 2 + item.size * 0.38);
  var fw  = item.bold ? '600' : '400';
  var pos = simulate(seed[0], seed[1], seed[2], seed[3], iw, ih);
  var tot = pos.length;
  var an  = 'a' + i;

  style += '@keyframes ' + an + ' {\n';
  for (var k = 0; k < tot; k++) {
    var pct = Math.round((k / (tot - 1)) * 100);
    style += '  ' + pct + '% { transform:translate(' + pos[k][0] + 'px,' + pos[k][1] + 'px); }\n';
  }
  style += '}\n';
  style += '.i' + i + '{animation:' + an + ' ' + DURATION + 's linear infinite;}\n';

  body += '<g class="i' + i + '">';
  body += '<rect x="0" y="0" width="' + iw + '" height="' + ih + '" rx="' + ir + '" fill="' + item.bg + '"/>';
  body += '<text x="' + itx + '" y="' + ity + '" text-anchor="middle"';
  body += ' font-size="' + item.size + '" font-weight="' + fw + '"';
  body += ' font-family="JetBrains Mono,monospace" fill="' + item.color + '">';
  body += item.text;
  body += '</text></g>\n';
}

var lines = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">',
  '<rect width="' + W + '" height="' + H + '" rx="12" fill="#0d1117"/>',
  '<style>' + style + '</style>',
  body,
  '</svg>'
];

var outDir = path.join(__dirname, 'dist');
var outFile = path.join(outDir, 'physics.svg');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log('Done: ' + outFile);
