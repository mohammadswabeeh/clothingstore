import axios from 'axios';

const api = axios.create({
    baseURL: 'https://swabeeh.pythonanywhere.com/api/',
});

export default api;