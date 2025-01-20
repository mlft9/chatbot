'use client';

import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Analyse JSON
      setAnswer(data.answer); // Utilise la réponse
    } catch (error) {
      console.error('Error:', error);
      setAnswer('Une erreur est survenue lors de la communication avec l’API.');
    }
  };


  return (
    <main style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Chatbot pour Spectateurs</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question"
          className="w-80 p-2 border rounded mb-4 text-black"
        />
        <br />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Envoyer
        </button>
      </form>
      {answer && (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
          Réponse : {answer}
        </p>
      )}
    </main>
  );
}
