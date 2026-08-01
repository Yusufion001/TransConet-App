const axios = require('axios');
async function run() {
  try {
    // 1. Get CSRF Token
    const csrfRes = await axios.get('http://localhost:3000/api/csrf-token');
    const csrfToken = csrfRes.data.csrfToken;
    const cookies = csrfRes.headers['set-cookie'] || [];
    
    // 2. Login as Admin
    const loginRes = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: 'admin@transconet.ng',
      password: 'SecureAdmin123!',
      captchaToken: 'simulate-captcha-12345'
    }, {
      headers: {
        'Cookie': cookies.join('; '),
        'X-CSRF-Token': csrfToken
      }
    });
    const adminCookies = loginRes.headers['set-cookie'] || [];
    const allCookies = [...cookies, ...adminCookies];
    
    // 3. Try to access /api/support/ticket
    const supportRes = await axios.post('http://localhost:3000/api/support/ticket', {
      category: 'General Inquiry'
    }, {
      headers: {
        'Cookie': allCookies.join('; '),
        'X-CSRF-Token': csrfToken
      }
    });
    
    console.log("Status:", supportRes.status);
    console.log("Data:", supportRes.data);
  } catch (err) {
    console.error("Error Status:", err.response?.status);
    console.error("Error Data:", err.response?.data);
  }
}
run();
