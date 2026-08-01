const axios = require('axios');
axios.get('http://localhost:3000/api/csrf-token', {
  headers: { Authorization: 'Bearer sometoken' }
}).then(console.log).catch(e => console.error(e.response ? e.response.status : e.message));
