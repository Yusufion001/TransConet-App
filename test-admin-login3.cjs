const axios = require('axios');
async function test() {
  const api = axios.create({ baseURL: 'http://localhost:3000/api' });
  try {
    const res = await api.get('/csrf-token');
    const token = res.data.csrfToken;
    const cookie = res.headers['set-cookie'][0];
    const postRes = await api.post('/admin/auth/login', { email: 'admin@transconet.com', password: 'password123', captchaToken: 'abcdef' }, {
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
