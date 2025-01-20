require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is working!');
});

app.post('/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    // Répondre avec un exemple de réponse
    res.json({ response: `You said: ${message}` });
});

app.listen(PORT, () => {
    console.log(`Server running on https://api-chatbot.maxlft.tech:${PORT}`);
});
