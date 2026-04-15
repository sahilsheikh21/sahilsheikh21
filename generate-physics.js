'use strict';
var fs   = require('fs');
var path = require('path');

var W=830, H=220, PW=10, PH=65, PX=22;
var GRAVITY=0.06, DURATION=10, FRAMES=600, SAMPLE=4;
var LF=PX+PW, RF=W-PX-PW;

var items=[
  {text:'sahilsheikh21',color:'#ffffff',bg:'#222222',size:13,bold:true},
  {text:'Magnetic-Bird',   color:'#111111',bg:'#F7DF1E',size:11,bold:false},
  {text:'LLMage',   color:'#ffffff',bg:'#3178C6',size:11,bold:false},
  {text:'Companion',        color:'#111111',bg:'#61DAFB',size:11,bold:false},
  {text:'Takeover',      color:'#ffffff',bg:'#444444',size:11,bold:false},
  {text:'Pathfinder',       color:'#ffffff',bg:'#3776AB',size:11,bold:false},
  {text:'Halo',      color:'#ffffff',bg:'#339933',size:11,bold:false},
  {text:'Docker',       color:'#ffffff',bg:'#2496ED',size:11,bold:false},
  {text:'Project23',     color:'#ffffff',bg:'#4169E1',size:11,bold:false},
  {text:'MongoDB',      color:'#ffffff',bg:'#47A248',size:11,bold:false},
];

var seeds=[
  [200,60,3.5,1.2],[400,30,-2.8,2.0],[300,100,3.0,-1.5],[500,80,-3.2,1.8],
  [250,140,2.5,2.2],[450,50,-2.0,1.5],[350,110,3.8,-2.0],[150,80,-3.0,2.5],
  [600,40,2.2,1.8],[380,160,-2.5,-1.2]
];

function bw(item){
  return Math.ceil(item.text.length*(item.bold?item.size*0.65:item.size*0.6)+20);
}
function bh(item){ return item.size+14; }

function simulate(sx,sy,vx,vy,w,h){
  var pts=[],x=sx,y=sy,dvx=vx,dvy=vy;
  for(var f=0;f<FRAMES;f++){
    dvy+=GRAVITY; x+=dvx; y+=dvy;
    if(y<0)       {y=0;      dvy= Math.abs(dvy)*0.88;}
    if(y+h>H)     {y=H-h;    dvy=-Math.abs(dvy)*0.88; dvx*=0.99;}
    if(x<LF)      {x=LF;     dvx= Math.abs(dvx)*0.92;}
    if(x+w>RF)    {x=RF-w;   dvx=-Math.abs(dvx)*0.92;}
    if(f%SAMPLE===0) pts.push([Math.round(x),Math.round(y)]);
  }
  return pts;
}

// Simulate all balls
var allPos=[];
for(var i=0;i<items.length;i++){
  var s=seeds[i];
  allPos.push(simulate(s[0],s[1],s[2],s[3],bw(items[i]),bh(items[i])));
}
var NKF=allPos[0].length;

// Paddle Y tracking
function paddleY(side,kf){
  var best=Infinity, bestY=H/2-PH/2;
  for(var i=0;i<allPos.length;i++){
    var p=allPos[i][kf]; if(!p) continue;
    var dist=side==='left'?(p[0]-LF):(RF-(p[0]+bw(items[i])));
    if(dist<best){best=dist; bestY=p[1]+bh(items[i])/2-PH/2;}
  }
  return Math.max(0,Math.min(H-PH,Math.round(bestY)));
}

var style='', body='';

// Ball keyframes
for(var i=0;i<items.length;i++){
  var item=items[i], pts=allPos[i];
  var w=bw(item), h=bh(item), r=Math.round(h/2);
  var an='b'+i;
  style+='@keyframes '+an+' {\n';
  for(var k=0;k<pts.length;k++){
    var pct=Math.round(k/(pts.length-1)*100);
    style+='  '+pct+'%{transform:translate('+pts[k][0]+'px,'+pts[k][1]+'px);}\n';
  }
  style+='}\n.bi'+i+'{animation:'+an+' '+DURATION+'s linear infinite;}\n';
  body+='<g class="bi'+i+'">';
  body+='<rect x="0" y="0" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+item.bg+'"/>';
  body+='<text x="'+Math.round(w/2)+'" y="'+Math.round(h/2+item.size*0.38)+'"';
  body+=' text-anchor="middle" font-size="'+item.size+'" font-weight="'+(item.bold?'600':'400')+'"';
  body+=' font-family="JetBrains Mono,monospace" fill="'+item.color+'">';
  body+=item.text+'</text></g>\n';
}

// Left paddle keyframes
style+='@keyframes pl {\n';
for(var k=0;k<NKF;k++){
  var pct=Math.round(k/(NKF-1)*100);
  style+='  '+pct+'%{transform:translateY('+paddleY('left',k)+'px);}\n';
}
style+='}\n.pl{animation:pl '+DURATION+'s linear infinite;}\n';

// Right paddle keyframes
style+='@keyframes pr {\n';
for(var k=0;k<NKF;k++){
  var pct=Math.round(k/(NKF-1)*100);
  style+='  '+pct+'%{transform:translateY('+paddleY('right',k)+'px);}\n';
}
style+='}\n.pr{animation:pr '+DURATION+'s linear infinite;}\n';

// Center line dashes
var dashes='';
for(var y=6;y<H;y+=20){
  dashes+='<rect x="'+Math.round(W/2-2)+'" y="'+y+'" width="4" height="12" rx="2" fill="rgba(255,255,255,0.12)"/>';
}

var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">\n'
  +'<rect width="'+W+'" height="'+H+'" rx="12" fill="#0d1117"/>\n'
  +dashes+'\n'
  +'<text x="'+(W/2-40)+'" y="30" text-anchor="middle" font-size="22" font-weight="600" '
  +'font-family="JetBrains Mono,monospace" fill="rgba(255,255,255,0.1)">0</text>\n'
  +'<text x="'+(W/2+40)+'" y="30" text-anchor="middle" font-size="22" font-weight="600" '
  +'font-family="JetBrains Mono,monospace" fill="rgba(255,255,255,0.1)">0</text>\n'
  +'<style>'+style+'</style>\n'
  +'<g class="pl"><rect x="'+PX+'" y="0" width="'+PW+'" height="'+PH+'" rx="5" fill="rgba(255,255,255,0.9)"/></g>\n'
  +'<g class="pr"><rect x="'+(W-PX-PW)+'" y="0" width="'+PW+'" height="'+PH+'" rx="5" fill="rgba(255,255,255,0.9)"/></g>\n'
  +body
  +'</svg>';

var outDir=path.join(__dirname,'dist');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'physics.svg'),svg,'utf8');
console.log('Done.');
