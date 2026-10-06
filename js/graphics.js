import { qbasicColors } from './programs.js';
export class Graphics {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d', { willReadFrequently: true }); this.clear(); }
  color(n) { return qbasicColors[Math.max(0, Math.min(15, Math.floor(Number(n) || 0)))]; }
  clear(color = 0) { this.ctx.fillStyle = this.color(color); this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
  pset(x,y,color=15) { this.ctx.fillStyle=this.color(color); this.ctx.fillRect(Math.round(x),Math.round(y),1,1); }
  line(x1,y1,x2,y2,color=15,box=false,fill=false) { this.ctx.strokeStyle=this.color(color); this.ctx.fillStyle=this.color(color); if(fill) this.ctx.fillRect(x1,y1,x2-x1,y2-y1); else if(box) this.ctx.strokeRect(x1,y1,x2-x1,y2-y1); else { this.ctx.beginPath(); this.ctx.moveTo(x1,y1); this.ctx.lineTo(x2,y2); this.ctx.stroke(); } }
  circle(x,y,r,color=15) { this.ctx.strokeStyle=this.color(color); this.ctx.beginPath(); this.ctx.arc(x,y,Math.abs(r),0,Math.PI*2); this.ctx.stroke(); }
  paint(x,y,color=15,border=null) { const px=Math.floor(x),py=Math.floor(y), data=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height), target=this.pixel(data,px,py), fill=this.hex(this.color(color)); if(!target || target.join()==fill.join()) return; const stack=[[px,py]], w=data.width,h=data.height; while(stack.length){const [a,b]=stack.pop();if(a<0||b<0||a>=w||b>=h||this.pixel(data,a,b).join()!=target.join())continue;this.setPixel(data,a,b,fill);stack.push([a+1,b],[a-1,b],[a,b+1],[a,b-1]);}this.ctx.putImageData(data,0,0); }
  pixel(d,x,y){let i=(y*d.width+x)*4;return [d.data[i],d.data[i+1],d.data[i+2],d.data[i+3]]} setPixel(d,x,y,c){let i=(y*d.width+x)*4;d.data.set([...c,255],i)} hex(h){const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]}
}
