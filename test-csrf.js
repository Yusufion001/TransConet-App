const axios = require('axios');
const http = require('http');

async function test() {
  const api = axios.create({ baseURL: 'http://localhost:3000/api' });
  let token = '';
  let cookie = '';
  try {
    const res = await api.get('/csrf-token');
    token = res.data.csrfToken;
    cookie = res.headers['set-cookie'][0];
    console.log('Token:', token);
    const postRes = await api.post('/auth/register-pin', { phoneNumber: '1234567890', pin: '123456', email: 'test@test.com' }, {
      headers: {
        'CSRF-Token': token,
        'Cookie': cookie
      }
    });
    console.log('Status:', postRes.status);
    console.log('Data:', postRes.data);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', err.response?.data);
  }
}
test();
