const axios = require('axios');
const api = axios.create({ baseURL: '/api' });
console.log(api.getUri({ url: '/csrf-token' }));
console.log(api.getUri({ url: 'csrf-token' }));
