const mariadb = require('mariadb');

// Configuration de la connexion à la base de données
const pool = mariadb.createPool({
    host: '172.18.0.3', // Utilisez 'localhost' si vous accédez au conteneur Docker localement
    port: 3306, // Port par défaut de MariaDB
    user: 'root', // Remplacez par votre nom d'utilisateur MariaDB
    password: 'U^xKrk601hmYSLsE0F#MJz#Y^j', // Remplacez par votre mot de passe MariaDB
    database: 'chatbot', // Remplacez par le nom de votre base de données
    connectionLimit: 5 // Nombre maximum de connexions dans le pool
});

async function checkConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Connexion à la base de données réussie !');
    } catch (err) {
        console.error('Erreur de connexion à la base de données :', err);
    } finally {
        if (conn) conn.end();
    }
}

checkConnection();
