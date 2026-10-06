import { lessons, examples, graphicsExamples, qbasicColors } from './programs.js';
import { loadSaved, saveProgram, removeProgram } from './storage.js';
import { Graphics } from './graphics.js';
import { QBasicInterpreter } from './interpreter.js';

const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];
const editor=$('#code-editor'), output=$('#output'), status=$('#status'), canvas=$('#graphics-canvas');
let currentLesson=0, interpreter, running=false;
const graphics=new Graphics(canvas);
function setStatus(message, good=true){status.textContent=message;status.style.color=good?'var(--green)':'var(--red)';}
function escapeHtml(v){return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// Tabs
$$('.tab').forEach(button=>button.addEventListener('click',()=>{const v=button.dataset.view;$$('.tab,.view').forEach(el=>el.classList.remove('active'));button.classList.add('active');$(`#${v}-view`).classList.add('active');if(v==='graphics') canvas.focus();}));

// Tutor
function renderLessons(){const list=$('#lesson-list');list.innerHTML=lessons.map((l,i)=>`<button class="lesson-button ${i===currentLesson?'active':''}" data-lesson="${i}">${i+1}. ${escapeHtml(l.title)}</button>`).join('');$$('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{currentLesson=Number(b.dataset.lesson);loadLesson();}));}
function loadLesson(){const l=lessons[currentLesson];$('#lesson-number').textContent=`LESSON ${currentLesson+1} OF ${lessons.length}`;$('#lesson-title').textContent=l.title;$('#lesson-description').textContent=l.description;$('#tutor-input').value='';renderLessons();renderTutor();}
function renderTutor(){const expected=lessons[currentLesson].code, typed=$('#tutor-input').value;let html='';for(let i=0;i<expected.length;i++){const ch=expected[i];if(i<typed.length) html+=`<span class="${typed[i]===ch?'done':'mistake'}">${escapeHtml(ch)}</span>`;else if(i===typed.length)html+=`<span class="next">${escapeHtml(ch)}</span>`;else html+=escapeHtml(ch);}$('#reference-code').innerHTML=html;let correct=0;while(correct<typed.length&&typed[correct]===expected[correct])correct++;const percent=Math.round((correct/expected.length)*100);$('#tutor-progress').style.width=`${percent}%`;$('#tutor-score').textContent=`${percent}%`;const hint=$('#tutor-hint');if(typed===expected){hint.textContent='Excellent — lesson complete! Your program is ready to run in Code.';hint.style.color='var(--green)';}else if(typed.length>correct){hint.textContent=`Check character ${correct+1}; the red character is different.`;hint.style.color='var(--red)';}else{hint.textContent='Tip: type exactly what you see, including spaces and punctuation.';hint.style.color='';}}
$('#tutor-input').addEventListener('input',renderTutor);$('#restart-lesson').addEventListener('click',loadLesson);

// Editor and programs
function updateLines(){const n=editor.value.split('\n').length;$('#line-numbers').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');}
function setProgram(name,code){$('#program-name').value=name;editor.value=code;updateLines();setStatus(`Loaded ${name}`);}
function renderProgramList(){ const root=$('#program-list');root.innerHTML=examples.map((p,i)=>`<button class="program-button" data-example="${i}">${escapeHtml(p.name)}</button>`).join('');root.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{const p=examples[Number(b.dataset.example)];setProgram(p.name,p.code);})); }
function renderSaved(){const saved=loadSaved(), root=$('#saved-list');root.innerHTML=saved.length?saved.map((p,i)=>`<div class="saved-row"><button class="program-button" data-saved="${i}">${escapeHtml(p.name)}</button><button class="secondary delete-save" data-delete="${i}" aria-label="Delete ${escapeHtml(p.name)}">×</button></div>`).join(''):'<p class="hint">Nothing saved yet.</p>';$$('[data-saved]').forEach(b=>b.addEventListener('click',()=>{const p=loadSaved()[Number(b.dataset.saved)];setProgram(p.name,p.code);}));$$('[data-delete]').forEach(b=>b.addEventListener('click',()=>{const p=loadSaved()[Number(b.dataset.delete)];if(confirm(`Delete “${p.name}”?`)){removeProgram(p.name);renderSaved();}}));}
editor.addEventListener('input',updateLines);editor.addEventListener('scroll',()=>$('#line-numbers').scrollTop=editor.scrollTop);editor.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;editor.setRangeText('  ',a,b,'end');updateLines();}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}});
$('#new-code').addEventListener('click',()=>setProgram('Untitled program','CLS\nPRINT "Hello, world!"\nEND'));
$('#save-code').addEventListener('click',()=>{const name=$('#program-name').value.trim()||'Untitled program';saveProgram(name,editor.value);renderSaved();setStatus('Saved on this device.');});
$('#download-code').addEventListener('click',()=>{const name=($('#program-name').value.trim()||'program').replace(/[^a-z0-9_-]+/gi,'-');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([editor.value],{type:'text/plain'}));link.download=`${name}.bas`;link.click();URL.revokeObjectURL(link.href);setStatus('Download started.');});
$('#open-code').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;setProgram(file.name.replace(/\.(bas|txt)$/i,''),await file.text());e.target.value='';});
$('#clear-output').addEventListener('click',()=>{output.textContent='';});
function write(text){if(text==='__CLS__'){output.textContent='';return;}output.textContent+=`${text}\n`;output.scrollTop=output.scrollHeight;}
async function ask(prompt){return window.prompt(prompt);}
async function run(){if(running)return;running=true;$('#run-code').disabled=true;output.textContent='';setStatus('Running…');interpreter=new QBasicInterpreter({output:write,input:ask,graphics});const result=await interpreter.run(editor.value);running=false;$('#run-code').disabled=false;setStatus(result.ok?'Finished.':'Stopped with an error.',result.ok);}
$('#run-code').addEventListener('click',run);$('#stop-code').addEventListener('click',()=>{interpreter?.stop();setStatus('Stopping…');});

// Graphics
$('#palette').innerHTML=qbasicColors.map((c,i)=>`<div class="swatch" title="QBASIC color ${i}" style="background:${c}"></div>`).join('');
$$('.graphic-example').forEach(b=>b.addEventListener('click',async()=>{setProgram(`${b.textContent.trim()} graphics`,graphicsExamples[b.dataset.example]);$$('.tab,.view').forEach(el=>el.classList.remove('active'));$('.tab[data-view="code"]').classList.add('active');$('#code-view').classList.add('active');await run();}));
$('#clear-canvas').addEventListener('click',()=>{graphics.clear();setStatus('Canvas cleared.');});

renderProgramList();renderSaved();loadLesson();setProgram(examples[0].name,examples[0].code);
