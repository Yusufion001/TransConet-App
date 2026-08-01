const axios = require('axios');

async function test() {
  try {
    const res1 = await axios.get('http://localhost:3000/api/csrf-token');
    const csrfToken = res1.data.csrfToken;
    const cookies = res1.headers['set-cookie'];
    
    const res2 = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: 'admin@transconet.ng',
      password: 'SecureAdmin123!',
      captchaToken: 'simulate-captcha-12345'
    }, {
      headers: {
        'Cookie': cookies ? cookies.join('; ') : '',
        'X-CSRF-Token': csrfToken
      }
    });
    console.log(res2.status);
    console.log(res2.data.message);
  } catch (e) {
    if (e.response) {
      console.error(e.response.status);
      console.error(e.response.data);
    }
  }
}
test();
