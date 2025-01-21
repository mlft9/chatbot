'use client';

import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function Chatbot() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatBoxRef = useRef(null);
    const hasSentWelcomeMessage = useRef(false); // Utilisé pour éviter les doublons

    // Fonction pour scroller automatiquement vers le bas
    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    // Envoie un message automatique 1 seconde après le chargement de la page ou le reset
    const sendWelcomeMessage = () => {
        if (hasSentWelcomeMessage.current) return; // Évite d'ajouter plusieurs messages de bienvenue
        hasSentWelcomeMessage.current = true; // Marque comme envoyé
        setTimeout(() => {
            setChatHistory((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: '👋 Bonjour ! Je suis là pour répondre à vos questions. N’hésitez pas à demander !',
                    isWelcome: true,
                },
            ]);
            scrollToBottom(); // Scrolle après avoir ajouté le message
        }, 1000);
    };

    // Fonction pour vider le chat
    const clearChat = () => {
        setChatHistory([]);
        hasSentWelcomeMessage.current = false; // Réinitialise l'état pour le message de bienvenue
        sendWelcomeMessage();
    };

    // Envoie un message au démarrage
    useEffect(() => {
        sendWelcomeMessage();
    }, []);

    // Scrolle automatiquement vers le bas à chaque mise à jour de l'historique
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        setChatHistory((prev) => [...prev, { sender: 'user', text: message }]);
        setIsLoading(true);

        try {
            const res = await api.post('/chat', { message });
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: res.data.response || "Je n'ai pas compris votre question." },
            ]);
        } catch (err) {
            console.error(err);
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: "Une erreur est survenue. Veuillez réessayer plus tard." },
            ]);
        } finally {
            setMessage('');
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Chatbot</h1>
            <div style={styles.chatBox} ref={chatBoxRef}>
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            ...(chat.isWelcome
                                ? styles.welcomeMessage
                                : chat.sender === 'user'
                                ? styles.userMessage
                                : styles.botMessage),
                        }}
                    >
                        {chat.text}
                    </div>
                ))}
                {isLoading && <div style={styles.loader}>Le bot réfléchit...</div>}
            </div>
            <div style={styles.inputContainer}>
                <button onClick={clearChat} style={styles.clearButton} aria-label="Vider le chat">
                    🗑️
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.sendButton} aria-label="Envoyer le message">
                    Envoyer
                </button>
            </div>
        </div>
    );
}


const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#E0E0E0',
        margin: 0,
        padding: '0 20px',
    },
    header: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#BB86FC',
    },
    chatBox: {
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#1E1E1E',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    message: {
        padding: '10px',
        borderRadius: '8px',
        maxWidth: '70%',
        wordWrap: 'break-word',
        fontSize: '16px',
        animation: 'fadeIn 0.3s ease-in-out',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#1E88E5',
        color: '#FFFFFF',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#424242',
        color: '#E0E0E0',
    },
    welcomeMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#BB86FC',
        color: '#121212',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid #BB86FC',
        maxWidth: '80%',
        wordWrap: 'break-word',
        fontSize: '18px',
        fontStyle: 'italic',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    },
    loader: {
        alignSelf: 'flex-start',
        color: '#BB86FC',
        fontStyle: 'italic',
        fontSize: '14px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '20px',
        width: '100%',
        maxWidth: '600px',
    },
    clearButton: {
        padding: '10px',
        border: 'none',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        cursor: 'pointer',
        borderRadius: '8px 0 0 8px',
        fontSize: '18px',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '0',
        border: '1px solid #333',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        fontSize: '16px',
    },
    sendButton: {
        padding: '10px 20px',
        borderRadius: '0 8px 8px 0',
        border: 'none',
        backgroundColor: '#BB86FC',
        color: '#121212',
        cursor: 'pointer',
        fontSize: '16px',
    },
    '@keyframes fadeIn': {
        from: {
            opacity: 0,
            transform: 'translateY(10px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
};
