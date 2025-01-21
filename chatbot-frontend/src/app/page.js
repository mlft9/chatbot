'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const goToChatbot = () => {
    router.push('/chatbot'); // Redirige vers la page du chatbot
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.header}>Bienvenue sur le Chatbot pour Spectateurs</h1>
      <p style={styles.description}>
        Découvrez notre assistant intelligent conçu pour enrichir votre expérience dans les stades. Cliquez ci-dessous pour interagir avec le chatbot et poser vos questions !
      </p>
      <button style={styles.button} onClick={goToChatbot}>
        Accéder au Chatbot
      </button>
    </main>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#121212',
    color: '#E0E0E0',
  },
  header: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#BB86FC',
  },
  description: {
    fontSize: '18px',
    marginBottom: '40px',
    maxWidth: '600px',
    lineHeight: '1.6',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#121212',
    backgroundColor: '#BB86FC',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
