import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-chatbot.maxlft.tech',
});

export default api;
