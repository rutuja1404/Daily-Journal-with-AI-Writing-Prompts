async function call(url, method = 'GET', body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
export const api = {
  list: (date, q) => call('/api/entries?' + new URLSearchParams({ ...(date && { date }), ...(q && { q }) })),
  stats: () => call('/api/entries/stats'),
  create: e => call('/api/entries', 'POST', e),
  update: (id, e) => call('/api/entries/' + id, 'PUT', e),
  remove: id => call('/api/entries/' + id, 'DELETE'),
  prompt: mood => call('/api/prompt', 'POST', { mood }),
  suggest: text => call('/api/suggest', 'POST', { text })
};
