const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY) console.warn('Warning: GROQ_API_KEY is not set in environment. Requests will likely fail.');

app.post('/api/chat', async (req, res) => {
    console.log('[proxy] /api/chat request received');
    console.log('[proxy] payload preview:', JSON.stringify(req.body).slice(0, 500));
    try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + GROQ_KEY
            },
            body: JSON.stringify(req.body)
        });

        const data = await resp.json();
        console.log('[proxy] upstream status', resp.status);
        res.status(resp.status).json(data);
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: err.message || err });
    }
});

// simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', proxy: true, groqKeyPresent: !!GROQ_KEY });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Chat proxy listening on http://localhost:${port}`));
