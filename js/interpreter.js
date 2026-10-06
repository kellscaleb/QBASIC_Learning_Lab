// A deliberately small, safe QBASIC subset for learning. It does not evaluate JavaScript.
export class QBasicInterpreter {
  constructor({ output, input, graphics }) { this.output = output; this.input = input; this.graphics = graphics; }
  async run(source) {
    this.vars = Object.create(null); this.lines = this.prepare(source); this.labels = this.indexLabels(); this.forStack=[]; this.callStack=[]; this.pc=0; this.running=true;
    let steps=0;
    try { while(this.running && this.pc < this.lines.length) { if(++steps>100000) throw this.error('Program stopped: too many steps (possible infinite loop).'); const line=this.lines[this.pc]; await this.execute(line); } return { ok:true }; }
    catch (err) { this.output(`\n? ${err.message || err}`); return { ok:false, error:err }; }
  }
  stop(){this.running=false;}
  prepare(source){return source.replace(/\r/g,'').split('\n').map((raw,i)=>({raw:raw.trim(),num:i+1})).filter(l=>l.raw && !/^REM\b/i.test(l.raw) && !/^'/.test(l.raw));}
  indexLabels(){const x={};this.lines.forEach((l,i)=>{const m=l.raw.match(/^([A-Za-z][\w$]*):\s*(.*)$/);if(m){x[m[1].toUpperCase()]=i;l.raw=m[2].trim();}});return x;}
  error(message){const line=this.lines[this.pc];return new Error(`Line ${line ? line.num : '?'}: ${message}`)}
  value(name){const key=name.toUpperCase();return Object.hasOwn(this.vars,key)?this.vars[key]:(key.endsWith('$')?'':0)}
  set(name,value){this.vars[name.toUpperCase()]=name.endsWith('$')?String(value):Number(value)||0;}
  async execute(line){
    const s=line.raw; if(!s){this.pc++;return;} let m;
    if(/^END$/i.test(s)||/^SYSTEM$/i.test(s)){this.running=false;return;}
    if(/^CLS$/i.test(s)){this.output('__CLS__');this.graphics?.clear();this.pc++;return;}
    if(/^SCREEN\s+\d+$/i.test(s)){this.pc++;return;}
    if((m=s.match(/^PRINT(?:\s+(.*))?$/i))){this.print(m[1]||'');this.pc++;return;}
    if((m=s.match(/^INPUT\s+(.+?);\s*([A-Za-z][\w$]*)$/i))){const prompt=this.expression(m[1]);const answer=await this.input(String(prompt));if(answer===null){this.running=false;return;}this.set(m[2],m[2].endsWith('$')?answer:Number(answer));this.pc++;return;}
    if((m=s.match(/^(?:LET\s+)?([A-Za-z][\w$]*)\s*=\s*(.+)$/i))){this.set(m[1],this.expression(m[2]));this.pc++;return;}
    if((m=s.match(/^IF\s+(.+?)\s+THEN\s*(.*)$/i))){await this.ifStatement(m[1],m[2]);return;}
    if(/^ELSE$/i.test(s)){this.pc=this.seekElseEnd(this.pc);return;}
    if(/^END\s+IF$/i.test(s)){this.pc++;return;}
    if((m=s.match(/^FOR\s+([A-Za-z][\w$]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i))){const start=this.expression(m[2]), end=this.expression(m[3]), step=m[4]?this.expression(m[4]):1;if(!step)throw this.error('STEP cannot be zero.');this.set(m[1],start);this.forStack.push({name:m[1].toUpperCase(),end,step,startPc:this.pc});this.pc++;return;}
    if((m=s.match(/^NEXT(?:\s+([A-Za-z][\w$]*))?$/i))){const loop=this.forStack[this.forStack.length-1];if(!loop)throw this.error('NEXT without FOR.');if(m[1]&&m[1].toUpperCase()!=loop.name)throw this.error(`NEXT ${m[1]} does not match FOR ${loop.name}.`);const n=this.value(loop.name)+loop.step;this.set(loop.name,n);if((loop.step>0&&n<=loop.end)||(loop.step<0&&n>=loop.end))this.pc=loop.startPc+1;else{this.forStack.pop();this.pc++;}return;}
    if((m=s.match(/^GOTO\s+([A-Za-z][\w$]*)$/i))){this.jump(m[1]);return;}
    if((m=s.match(/^GOSUB\s+([A-Za-z][\w$]*)$/i))){this.callStack.push(this.pc+1);this.jump(m[1]);return;}
    if(/^RETURN$/i.test(s)){if(!this.callStack.length)throw this.error('RETURN without GOSUB.');this.pc=this.callStack.pop();return;}
    if((m=s.match(/^PSET\s*\((.+),(.+)\)\s*(?:,\s*(.+))?$/i))){this.graphics?.pset(this.expression(m[1]),this.expression(m[2]),m[3]?this.expression(m[3]):15);this.pc++;return;}
    if((m=s.match(/^LINE\s*\((.+),(.+)\)\s*-\s*\((.+),(.+)\)\s*(?:,\s*([^,]+))?\s*(?:,\s*(B|BF))?$/i))){this.graphics?.line(this.expression(m[1]),this.expression(m[2]),this.expression(m[3]),this.expression(m[4]),m[5]?this.expression(m[5]):15,/^B/i.test(m[6]||''),/^BF$/i.test(m[6]||''));this.pc++;return;}
    if((m=s.match(/^CIRCLE\s*\((.+),(.+)\)\s*,\s*(.+?)\s*(?:,\s*(.+))?$/i))){this.graphics?.circle(this.expression(m[1]),this.expression(m[2]),this.expression(m[3]),m[4]?this.expression(m[4]):15);this.pc++;return;}
    if((m=s.match(/^PAINT\s*\((.+),(.+)\)\s*(?:,\s*([^,]+))?(?:,\s*(.+))?$/i))){this.graphics?.paint(this.expression(m[1]),this.expression(m[2]),m[3]?this.expression(m[3]):15);this.pc++;return;}
    throw this.error(`Unsupported command: ${s.split(/\s/)[0]}`);
  }
  async ifStatement(condition,rest){const yes=Boolean(this.expression(condition));if(rest){if(yes){const parts=rest.split(/\s+ELSE\s+/i);await this.executeInline(parts[0]);}else{const parts=rest.split(/\s+ELSE\s+/i);if(parts[1])await this.executeInline(parts[1]);}return;}if(yes){this.pc++;return;}this.pc=this.findElseOrEnd(this.pc);}
  async executeInline(text){const line=this.lines[this.pc], saved=line.raw;line.raw=text.trim();await this.execute(line);line.raw=saved;}
  findElseOrEnd(at){let deep=0;for(let i=at+1;i<this.lines.length;i++){let s=this.lines[i].raw;if(/^IF\b/i.test(s)&&/THEN\s*$/i.test(s))deep++;if(/^END\s+IF$/i.test(s)){if(!deep)return i+1;deep--;}if(!deep&&/^ELSE$/i.test(s))return i+1;}throw this.error('IF has no END IF.');}
  seekElseEnd(at){let deep=0;for(let i=at+1;i<this.lines.length;i++){let s=this.lines[i].raw;if(/^IF\b/i.test(s)&&/THEN\s*$/i.test(s))deep++;if(/^END\s+IF$/i.test(s)){if(!deep)return i+1;deep--;}}throw this.error('ELSE has no END IF.');}
  jump(label){const dest=this.labels[label.toUpperCase()];if(dest===undefined)throw this.error(`Unknown label: ${label}.`);this.pc=this.lines[dest].raw ? dest : dest+1;}
  print(expr){if(!expr){this.output('');return;}const segments=expr.split(/([;,])/);let result='';for(let i=0;i<segments.length;i+=2){result+=this.format(this.expression(segments[i]));const sep=segments[i+1];if(sep===';'){}else if(sep===',')result+='\t';}this.output(result);}
  format(v){return typeof v==='number' && Number.isInteger(v)?String(v):String(v);}
  expression(raw){
    let s=raw.trim();if(!s)return ''; const strings=[];s=s.replace(/"(?:[^"\\]|\\.)*"/g,m=>{strings.push(m.slice(1,-1).replace(/\\"/g,'"'));return `__STR${strings.length-1}__`;});
    s=s.replace(/<>/g,'!=').replace(/\bAND\b/gi,'&&').replace(/\bOR\b/gi,'||').replace(/\bNOT\b/gi,'!').replace(/(?<![<>=!])=(?!=)/g,'==');
    s=s.replace(/\bINT\s*\(([^()]*)\)/gi,'Math.floor($1)').replace(/\bABS\s*\(([^()]*)\)/gi,'Math.abs($1)').replace(/\bRND\b/gi,'Math.random()');
    s=s.replace(/[A-Za-z][\w$]*/g,word=>{if(/^Math$|^floor$|^abs$|^random$|^true$|^false$/i.test(word)||/^__STR\d+__$/.test(word))return word;return `__v(${JSON.stringify(word)})`;});
    s=s.replace(/__STR(\d+)__/g,(_,i)=>JSON.stringify(strings[Number(i)]));
    if(!/^[\w\s$+\-*/%().,<>!=&|"']+$/.test(s))throw this.error('Invalid expression.');
    try{return Function('__v',`"use strict"; return (${s});`)(n=>this.value(n));}catch{throw this.error(`Cannot evaluate: ${raw}`);}
  }
}
