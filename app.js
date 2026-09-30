import { api } from './api.js';
import { $, todayStr, fmt, countWords, toast, renderStats, renderList, renderMoods, showHints } from './ui.js';

const state = { id: null, prompt: null, mood: null, entries: [] };

function setMood(m) { state.mood = m; renderMoods(m, setMood); }
function setPrompt(p) { state.prompt = p; $('note').hidden = !p; $('note').textContent = p || ''; }
function updateCount() { const n = countWords($('body').value); $('count').textContent = n + (n === 1 ? ' word' : ' words'); }

async function refresh() {
  try {
    state.entries = await api.list($('filter').value, $('search').value.trim());
    renderList(state.entries, state.id, openEntry);
    renderStats(await api.stats());
  } catch (e) { toast(e.message, true); }
}
function openEntry(e) {
  state.id = e ? e.id : null;
  $('date').value = e ? e.entry_date : todayStr();
  $('title').value = e ? e.title : ''; $('body').value = e ? e.body : '';
  setMood(e ? e.mood : null); setPrompt(e ? e.prompt : null);
  $('del').hidden = !e; $('hints').hidden = true; updateCount();
  renderList(state.entries, state.id, openEntry);
}
async function busy(btn, fn) { btn.disabled = true; try { await fn(); } catch (e) { toast(e.message, true); } btn.disabled = false; }

$('save').onclick = () => busy($('save'), async () => {
  const data = { entry_date: $('date').value, title: $('title').value, body: $('body').value, mood: state.mood, prompt: state.prompt };
  const saved = state.id ? await api.update(state.id, data) : await api.create(data);
  state.id = saved.id; $('del').hidden = false; toast('Entry saved'); await refresh();
});
$('del').onclick = () => busy($('del'), async () => {
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  await api.remove(state.id); openEntry(null); toast('Entry deleted'); await refresh();
});
$('newPrompt').onclick = () => busy($('newPrompt'), async () => setPrompt((await api.prompt(state.mood)).prompt));
$('suggest').onclick = () => busy($('suggest'), async () => showHints((await api.suggest($('body').value)).suggestions));
$('fresh').onclick = () => openEntry(null);
$('filter').onchange = refresh;
$('clear').onclick = () => { $('filter').value = ''; $('search').value = ''; refresh(); };
let t; $('search').oninput = () => { clearTimeout(t); t = setTimeout(refresh, 250); };
$('body').oninput = updateCount;

$('today').textContent = fmt(todayStr());
openEntry(null); refresh();
