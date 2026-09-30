export const $ = id => document.getElementById(id);
export const MOODS = ['calm', 'happy', 'grateful', 'tired', 'anxious', 'sad'];
export const todayStr = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
export const countWords = t => (t.trim() ? t.trim().split(/\s+/).length : 0);

let timer;
export function toast(text, err = false) {
  const t = $('toast'); t.textContent = text; t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(timer); timer = setTimeout(() => (t.className = 'toast'), 2600);
}
export function renderStats(s) { $('sStreak').textContent = s.streak; $('sEntries').textContent = s.entries; $('sWords').textContent = s.words.toLocaleString(); }

export function renderList(entries, activeId, onOpen) {
  const box = $('list'); box.textContent = '';
  if (!entries.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No entries found. Write one and it will appear here.'; box.appendChild(p); return; }
  let last = '';
  entries.forEach(e => {
    if (e.entry_date !== last) { last = e.entry_date; const d = document.createElement('div'); d.className = 'day'; d.textContent = fmt(last); box.appendChild(d); }
    const b = document.createElement('button'); b.className = 'item' + (e.id === activeId ? ' on' : '');
    const t = document.createElement('b'); t.textContent = e.title || 'Untitled';
    if (e.mood) { const m = document.createElement('span'); m.className = 'tag'; m.textContent = e.mood; t.appendChild(m); }
    const s = document.createElement('small'); s.textContent = e.body.replace(/\s+/g, ' ').slice(0, 80);
    b.append(t, s); b.onclick = () => onOpen(e); box.appendChild(b);
  });
}
export function renderMoods(current, onPick) {
  const box = $('moods'); box.textContent = '';
  MOODS.forEach(m => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = m;
    c.setAttribute('aria-pressed', String(m === current)); c.onclick = () => onPick(m === current ? null : m); box.appendChild(c);
  });
}
export function showHints(list) {
  const ul = $('hints'); ul.textContent = '';
  list.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
  ul.hidden = false;
}
