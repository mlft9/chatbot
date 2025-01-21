import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-chatbot.maxlft.tech', // Change selon tes besoins
    timeout: 5000,
});

export default api;
