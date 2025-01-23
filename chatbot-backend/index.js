require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const Fuse = require('fuse.js');
const jwt = require('jsonwebtoken');

const app = express();
const router = express.Router(); // Définition correcte du router
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de connexion à MariaDB
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
});

async function askChatGPT(question) {
    const apiKey = process.env.OPENAI_API_KEY; // Assurez-vous que la clé API est définie dans .env
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: question }
        ],
        max_tokens: 100,
        temperature: 0.7,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Erreur avec l'API OpenAI:", error);
        return "Désolé, je n'ai pas pu obtenir une réponse pour le moment.";
    }
}

// Route pour répondre aux questions
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ response: 'Veuillez fournir une question.' });
    }

    try {
        const conn = await pool.getConnection();
        const rows = await conn.query('SELECT question, answer FROM questions');
        conn.release();

        const fuse = new Fuse(rows, {
            keys: ['question'],
            threshold: 0.4,
        });

        const result = fuse.search(message);

        if (result.length > 0) {
            return res.json({ response: result[0].item.answer });
        } else {
            // Si aucune réponse trouvée, interroge l'API OpenAI
            const aiResponse = await askChatGPT(message);
            return res.json({ response: aiResponse });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ response: 'Erreur interne du serveur.' });
    }
});

// Route pour récupérer toutes les questions
router.get('/questions', async (req, res) => {
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

// Ajouter une nouvelle question
router.post('/questions', async (req, res) => {
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

// Mettre à jour une question
router.put('/questions/:id', async (req, res) => {
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

// Supprimer une question
router.delete('/questions/:id', async (req, res) => {
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

// Route pour récupérer les suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const suggestions = await conn.query('SELECT question FROM questions WHERE is_suggestion = TRUE');
        conn.release();
        res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des suggestions.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    return res.status(401).json({ error: 'Identifiants incorrects.' });
});

router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    console.log("Token reçu pour vérification :", token);

    if (!token) {
        console.log("Aucun token fourni");
        return res.status(400).json({ error: 'Token requis.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token valide, utilisateur :", decoded.username);
        res.json({ valid: true, username: decoded.username });
    } catch (err) {
        console.log("Erreur lors de la vérification du token :", err.message);
        res.status(401).json({ error: 'Token invalide.' });
    }
});

// Attache le router à l'application principale
app.use(router);

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
