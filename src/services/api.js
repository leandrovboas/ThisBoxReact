import axios from 'axios';

const api = axios.create({
    baseURL: 'https://this-box-node.herokuapp.com/'
});

export default api;