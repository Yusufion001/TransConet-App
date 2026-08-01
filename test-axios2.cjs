const axios = require('axios');
const api = axios.create({ baseURL: 'https://railway.app/api' });
console.log(api.getUri({ url: '/csrf-token' }));
console.log(api.getUri({ url: 'csrf-token' }));
