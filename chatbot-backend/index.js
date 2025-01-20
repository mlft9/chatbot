require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const Fuse = require('fuse.js');

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

        // Récupérer toutes les questions et réponses de la base
        const rows = await conn.query('SELECT question, answer FROM questions');

        conn.release();

        // Configuration de Fuse.js pour la recherche approximative
        const fuse = new Fuse(rows, {
            keys: ['question'], // Recherche uniquement sur la colonne "question"
            threshold: 0.6, // Niveau de tolérance (plus bas = plus strict)
        });

        // Recherche la meilleure correspondance
        const result = fuse.search(message);

        if (result.length > 0) {
            // Retourne la réponse correspondant à la meilleure correspondance
            return res.json({ response: result[0].item.answer });
        } else {
            // Recherche partielle pour suggérer des questions similaires
            const suggestions = fuse.search(message, { limit: 3 }).map((r) => r.item.question);
            return res.json({
                response: "Je n'ai pas la réponse à cette question.",
                suggestions: suggestions.length
                    ? `Voulez-vous dire : ${suggestions.join(', ')} ?`
                    : null,
            });
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
