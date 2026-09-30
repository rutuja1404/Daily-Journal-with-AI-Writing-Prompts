const router = require('express').Router();
const db = require('../db');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MOODS = ['calm', 'happy', 'grateful', 'tired', 'anxious', 'sad'];

function validate(b = {}) {
  if (!DATE_RE.test(String(b.entry_date || ''))) return { error: 'Enter a valid date.' };
  const title = String(b.title || '').trim().slice(0, 150);
  const body = String(b.body || '').slice(0, 50000);
  if (!title && !body.trim()) return { error: 'Add a title or some text before saving.' };
  const mood = MOODS.includes(b.mood) ? b.mood : null;
  const prompt = b.prompt ? String(b.prompt).slice(0, 500) : null;
  return { entry_date: b.entry_date, title, body, mood, prompt };
}
const find = id => db.prepare('SELECT * FROM entries WHERE id = ?').get(id);

router.get('/', (req, res) => {
  const { date, q } = req.query;
  let sql = 'SELECT * FROM entries WHERE 1=1'; const args = [];
  if (date && DATE_RE.test(date)) { sql += ' AND entry_date = ?'; args.push(date); }
  if (q) { sql += ' AND (title LIKE ? OR body LIKE ?)'; args.push(`%${q}%`, `%${q}%`); }
  res.json(db.prepare(sql + ' ORDER BY entry_date DESC, id DESC').all(...args));
});

router.get('/stats', (req, res) => {
  const rows = db.prepare('SELECT entry_date, body FROM entries').all();
  const days = new Set(rows.map(r => r.entry_date));
  const words = rows.reduce((n, r) => n + (r.body.trim() ? r.body.trim().split(/\s+/).length : 0), 0);
  const key = x => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  let streak = 0; const d = new Date();
  if (!days.has(key(d))) d.setDate(d.getDate() - 1); // today not written yet: streak stays alive
  while (days.has(key(d))) { streak++; d.setDate(d.getDate() - 1); }
  res.json({ entries: rows.length, words, streak });
});

router.get('/:id', (req, res) => {
  const row = find(req.params.id);
  row ? res.json(row) : res.status(404).json({ error: 'Entry not found.' });
});
router.post('/', (req, res) => {
  const v = validate(req.body); if (v.error) return res.status(400).json(v);
  const r = db.prepare('INSERT INTO entries (entry_date,title,body,mood,prompt) VALUES (?,?,?,?,?)')
    .run(v.entry_date, v.title, v.body, v.mood, v.prompt);
  res.status(201).json(find(r.lastInsertRowid));
});
router.put('/:id', (req, res) => {
  const v = validate(req.body); if (v.error) return res.status(400).json(v);
  const r = db.prepare('UPDATE entries SET entry_date=?,title=?,body=?,mood=?,prompt=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(v.entry_date, v.title, v.body, v.mood, v.prompt, req.params.id);
  r.changes ? res.json(find(req.params.id)) : res.status(404).json({ error: 'Entry not found.' });
});
router.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);
  r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'Entry not found.' });
});
module.exports = router;
