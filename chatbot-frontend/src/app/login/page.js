'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await api.post('/login', { username, password });
            const { token } = res.data;

            // Sauvegarde le token dans le stockage local
            localStorage.setItem('token', token);

            // Redirige vers la page admin
            router.push('/admin');
        } catch (err) {
            setError('Identifiants incorrects.');
        }
    };

    const handleGoToChatbot = () => {
        router.push('/chatbot');
    };

    return (
        <div style={styles.container}>
            <button onClick={handleGoToChatbot} style={styles.chatbotButton}>
    ← Retour au Chatbot
</button>
            <h1 style={styles.header}>Connexion</h1>
            {error && <p style={styles.error}>{error}</p>}
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
            />
            <button onClick={handleLogin} style={styles.button}>
                Se connecter
            </button>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#E0E0E0',
    },
    header: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#BB86FC',
    },
    input: {
        marginBottom: '10px',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #333',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        fontSize: '16px',
        width: '300px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#BB86FC',
        color: '#121212',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: '#f44336',
        marginBottom: '10px',
    },
    chatbotButton: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '10px 15px',
        backgroundColor: '#2196F3',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s ease',
    },
    chatbotButtonHover: {
        backgroundColor: '#1976D2',
    },
};
