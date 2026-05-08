
// ai.js — simple chat widget wiring
document.addEventListener('DOMContentLoaded', () => {
    // For security, the API key should not live in client JS.
    // The client will call a local proxy which forwards requests to Groq.
    const endpoint = 'http://localhost:3000/api/chat';

    const input = document.getElementById('ai-msg');
    const sendBtn = document.getElementById('ai-send');
    const output = document.getElementById('chat-output');

    if (!input || !sendBtn || !output) return;

    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        output.textContent = 'جاري الاتصال...';
        try {
            console.log('Sending request to proxy:', endpoint);
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'Answer very briefly. Max 2 short sentences, max 40 words. No lists, no long explanation.' },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 80,
                    temperature: 0.5
                })
            });

            console.log('Proxy response status:', res.status);
            const textBody = await res.text();
            let data;
            try { data = JSON.parse(textBody); } catch (e) { data = null; }

            if (!res.ok) {
                console.error('Proxy returned error:', res.status, textBody);
                output.textContent = 'خطاء من الخادم: ' + res.status + ' — ' + textBody;
                return;
            }

            const rawText = (data && data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || textBody;
            const shortText = rawText.length > 260 ? rawText.slice(0, 260).trim() + '...' : rawText;
            output.textContent = shortText;
        } catch (err) {
            console.error('Fetch error:', err);
            output.textContent = 'خطأ في الاتصال: ' + (err.message || err) + '\n(تأكد أن الـproxy يعمل: node server.js)';
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
});