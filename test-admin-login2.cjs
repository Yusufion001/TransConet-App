const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').wrapper;
const tough = require('tough-cookie');

(async () => {
  try {
    const jar = new tough.CookieJar();
    const client = axiosCookieJarSupport(axios.create({ jar, withCredentials: true }));

    const csrfRes = await client.get('http://localhost:3000/api/csrf-token');
    const csrfToken = csrfRes.data.csrfToken;
    console.log('CSRF Token:', csrfToken);

    const res = await client.post('http://localhost:3000/api/admin/auth/login', {
      email: 'admin@transconet.ng',
      password: 'wrongpassword',
      captchaToken: '123456'
    }, {
      headers: {
        'x-csrf-token': csrfToken
      }
    });
    console.log('Login success:', res.data.message);
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
    }
  }
})();
