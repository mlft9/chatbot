'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export default function Admin() {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' });
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true); // L'état de chargement est à true au début
    const [error, setError] = useState('');
    const router = useRouter();

    // Vérifie si l'utilisateur est authentifié
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login'); // Redirige vers la page de connexion
            return;
        }

        const verifyToken = async () => {
            try {
                await api.post('/verify-token', { token });
                setLoading(false); // Si tout va bien, on change l'état de chargement
            } catch {
                localStorage.removeItem('token');
                router.push('/login'); // Redirige si le token est invalide
            }
        };

        verifyToken();
    }, [router]);

    // Récupérer les questions
    useEffect(() => {
        if (loading) return; // Si la page est en cours de chargement, ne pas exécuter fetchQuestions
        fetchQuestions();
    }, [loading]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token'); // Ajout du token pour sécuriser la requête
            const res = await api.get('/questions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQuestions(res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des questions:', err);
            setError("Erreur lors du chargement des questions. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
            alert('La question et la réponse ne peuvent pas être vides.');
            return;
        }
        setError('');
        try {
            const token = localStorage.getItem('token');
            await api.post('/questions', newQuestion, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchQuestions();
            setNewQuestion({ question: '', answer: '' });
        } catch (err) {
            console.error('Erreur lors de l\'ajout de la question:', err);
            setError("Impossible d'ajouter la question. Veuillez réessayer.");
        }
    };

    const handleUpdateQuestion = async (id) => {
        if (!editing.question.trim() || !editing.answer.trim()) {
            alert('La question et la réponse ne peuvent pas être vides.');
            return;
        }
        setError('');
        try {
            const token = localStorage.getItem('token');
            await api.put(`/questions/${id}`, editing, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchQuestions();
            setEditing(null);
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            setError("Impossible de mettre à jour la question. Veuillez réessayer.");
        }
    };

    const handleDeleteQuestion = async (id) => {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?');
        if (!confirmDelete) return;
        setError('');
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchQuestions();
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError("Impossible de supprimer la question. Veuillez réessayer.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Supprime le token
        router.push('/login'); // Redirige vers la page de connexion
    };

    return loading ? (
        <div style={styles.loader}>Vérification de l'authentification...</div>
    ) : (
        <div style={styles.container}>
            <button onClick={handleLogout} style={styles.logoutButton}>
                Déconnexion
            </button>
            <h1 style={styles.header}>Administration des Questions</h1>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.form}>
                <h2 style={styles.subHeader}>Ajouter une Nouvelle Question</h2>
                <input
                    type="text"
                    placeholder="Question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Réponse"
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                    style={styles.input}
                />
                <button onClick={handleAddQuestion} style={styles.addButton}>
                    Ajouter
                </button>
            </div>

            <div style={styles.list}>
                <h2 style={styles.subHeader}>Liste des Questions</h2>
                {questions.length === 0 && !loading && <p>Aucune question disponible.</p>}
                <ul style={styles.listContainer}>
                    {questions.map((q) => (
                        <li key={q.id} style={styles.listItem}>
                            {editing?.id === q.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editing.question}
                                        onChange={(e) =>
                                            setEditing({ ...editing, question: e.target.value })
                                        }
                                        style={styles.inputInline}
                                    />
                                    <input
                                        type="text"
                                        value={editing.answer}
                                        onChange={(e) =>
                                            setEditing({ ...editing, answer: e.target.value })
                                        }
                                        style={styles.inputInline}
                                    />
                                    <button
                                        onClick={() => handleUpdateQuestion(q.id)}
                                        style={styles.saveButton}
                                    >
                                        Enregistrer
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        style={styles.cancelButton}
                                    >
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span style={styles.text}>
                                        <strong>Q :</strong> {q.question} | <strong>R :</strong>{' '}
                                        {q.answer}
                                    </span>
                                    <button
                                        onClick={() => setEditing(q)}
                                        style={styles.editButton}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        style={styles.deleteButton}
                                    >
                                        Supprimer
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#121212',
        minHeight: '100vh',
        color: '#E0E0E0',
    },
    header: {
        textAlign: 'center',
        fontSize: '28px',
        marginBottom: '20px',
        color: '#BB86FC',
    },
    loader: {
        color: '#BB86FC',
        textAlign: 'center',
        marginBottom: '15px',
    },
    error: {
        color: '#f44336',
        textAlign: 'center',
        marginBottom: '15px',
    },
    form: {
        backgroundColor: '#1E1E1E',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        marginBottom: '20px',
    },
    subHeader: {
        fontSize: '20px',
        marginBottom: '15px',
        color: '#BB86FC',
    },
    input: {
        display: 'block',
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #333',
        borderRadius: '4px',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        fontSize: '16px',
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#BB86FC',
        color: '#121212',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    list: {
        backgroundColor: '#1E1E1E',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    listContainer: {
        listStyle: 'none',
        padding: '0',
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #333',
    },
    text: {
        flex: 1,
        marginRight: '10px',
    },
    inputInline: {
        marginRight: '10px',
        padding: '8px',
        border: '1px solid #333',
        borderRadius: '4px',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        fontSize: '14px',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '5px',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    editButton: {
        backgroundColor: '#2196F3',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '5px',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    logoutButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};
