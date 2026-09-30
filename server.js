const express = require('express');
const path = require('path');
const entries = require('./src/routes/entries');
const ai = require('./src/routes/ai');

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/entries', entries);
app.use('/api', ai);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error. Try again.' }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Daily Journal running at http://localhost:${PORT}`));
