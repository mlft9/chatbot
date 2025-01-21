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

app.get('/questions', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM questions');
        conn.release();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des questions.' });
    }
});

app.post('/questions', async (req, res) => {
    const { question, answer } = req.body;
    if (!question || !answer) {
        return res.status(400).json({ error: 'Veuillez fournir une question et une réponse.' });
    }

    try {
        const conn = await pool.getConnection();
        await conn.query('INSERT INTO questions (question, answer) VALUES (?, ?)', [question, answer]);
        conn.release();
        res.status(201).json({ message: 'Question ajoutée avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la question.' });
    }
});

app.put('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    if (!question || !answer) {
        return res.status(400).json({ error: 'Veuillez fournir une question et une réponse.' });
    }

    try {
        const conn = await pool.getConnection();
        await conn.query('UPDATE questions SET question = ?, answer = ? WHERE id = ?', [question, answer, id]);
        conn.release();
        res.json({ message: 'Question mise à jour avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la question.' });
    }
});

app.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const conn = await pool.getConnection();
        await conn.query('DELETE FROM questions WHERE id = ?', [id]);
        conn.release();
        res.json({ message: 'Question supprimée avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression de la question.' });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur https://api-chatbot.maxlft.tech:${PORT}`);
});
