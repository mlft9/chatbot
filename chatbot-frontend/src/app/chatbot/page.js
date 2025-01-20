'use client';

import { useState } from 'react';
import api from '../services/api';

export default function Chatbot() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        setChatHistory((prev) => [...prev, { sender: 'user', text: message }]);

        try {
            const res = await api.post('/chat', { message });
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: res.data.response }
            ]);
        } catch (err) {
            console.error(err);
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: 'Error: Could not fetch response' }
            ]);
        } finally {
            setMessage('');
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
            <div style={styles.chatBox}>
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            ...(chat.sender === 'user'
                                ? styles.userMessage
                                : styles.botMessage)
                        }}
                    >
                        {chat.text}
                    </div>
                ))}
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.sendButton}>
                    Send
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
        backgroundColor: '#121212', // Fond sombre
        color: '#E0E0E0', // Texte clair
        margin: 0,
        padding: '0 20px',
    },
    header: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#BB86FC', // Accent violet
    },
    chatBox: {
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#1E1E1E', // Fond légèrement plus clair
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
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#1E88E5', // Bleu pour les messages utilisateurs
        color: '#FFFFFF',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#424242', // Gris pour les messages du bot
        color: '#E0E0E0',
    },
    inputContainer: {
        display: 'flex',
        marginTop: '20px',
        width: '100%',
        maxWidth: '600px',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px 0 0 8px',
        border: '1px solid #333',
        backgroundColor: '#1E1E1E', // Fond sombre de l'input
        color: '#E0E0E0',
        fontSize: '16px',
    },
    sendButton: {
        padding: '10px 20px',
        borderRadius: '0 8px 8px 0',
        border: 'none',
        backgroundColor: '#BB86FC', // Violet accentué
        color: '#121212', // Texte sombre
        cursor: 'pointer',
        fontSize: '16px',
    },
};
