const KEY = 'qbasic-learning-lab.programs.v1';
export function loadSaved() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
export function saveProgram(name, code) { const all = loadSaved().filter(p => p.name !== name); all.unshift({ name, code, updated: Date.now() }); localStorage.setItem(KEY, JSON.stringify(all.slice(0,30))); return all; }
export function removeProgram(name) { localStorage.setItem(KEY, JSON.stringify(loadSaved().filter(p => p.name !== name))); }
