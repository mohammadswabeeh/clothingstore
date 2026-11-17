import axios from 'axios';

const api = axios.create({
    baseURL: 'https://swabeeh.pythonanywhere.com/',
});

export default api;