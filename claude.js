const prompts = require('../data/prompts');

async function ask(system, user) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5', max_tokens: 400, system, messages: [{ role: 'user', content: user }] })
    });
    const d = await r.json();
    return d.content?.[0]?.text?.trim() || null;
  } catch { return null; }
}

async function writingPrompt(mood) {
  const ai = await ask('You write one-sentence journaling prompts. Reply with only the prompt: specific, open-ended, no preamble, no quotes.',
    `Write a fresh daily journaling prompt${mood ? ` for someone feeling ${mood}` : ''}.`);
  return { prompt: ai || prompts[Math.floor(Math.random() * prompts.length)], source: ai ? 'ai' : 'local' };
}

async function suggestions(text) {
  const n = text.trim().split(/\s+/).filter(Boolean).length;
  if (n < 5) return { suggestions: ['Write a few sentences first, then ask again.'], source: 'local' };
  const ai = await ask('You are a gentle writing coach for a private journal. Give exactly 3 short suggestions, one per line, no numbering, to help the writer go deeper or continue. Never rewrite their text.', text);
  if (ai) return { suggestions: ai.split('\n').map(s => s.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3), source: 'ai' };
  return { suggestions: [
    'Add one concrete detail: a place, a sound, or something someone said.',
    'Say how you felt in that moment, not only what happened.',
    n < 60 ? 'Keep going: what happened right before or after this?' : 'Close with one sentence about what you want to do next.'
  ], source: 'local' };
}
module.exports = { writingPrompt, suggestions };
