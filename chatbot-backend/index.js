require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de connexion à MariaDB
const pool = mariadb.createPool({
    host: process.env.DB_HOST, // Exemple : 'localhost'
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
});

// Route pour répondre aux questions
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ response: 'Veuillez fournir une question.' });
    }

    // Vérifie si c'est le message de bienvenue
    if (message === 'Bonjour ! Comment puis-je vous aider aujourd’hui ?') {
        return res.json({ response: 'Bonjour ! Je suis là pour répondre à vos questions.' });
    }

    try {
        const conn = await pool.getConnection();

        // Recherche de la question dans la base de données
        const rows = await conn.query(
            'SELECT answer FROM questions WHERE question = ? LIMIT 1',
            [message]
        );

        conn.release();

        if (rows.length > 0) {
            res.json({ response: rows[0].answer });
        } else {
            res.json({ response: "Je n'ai pas la réponse à cette question." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ response: 'Erreur interne du serveur.' });
    }
});


// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur https://api-chatbot.maxlft.tech:${PORT}`);
});
