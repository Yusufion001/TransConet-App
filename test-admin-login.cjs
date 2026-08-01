const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: 'admin@transconet.ng',
      password: 'wrongpassword',
      captchaToken: '123456'
    });
    console.log('Login success:', res.data.message);
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err.message);
  }
})();
