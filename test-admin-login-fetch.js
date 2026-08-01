(async () => {
  try {
    const csrfRes = await fetch('http://localhost:3000/api/csrf-token');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    console.log('CSRF Token:', csrfToken);

    const cookies = csrfRes.headers.get('set-cookie');

    const res = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Cookie': cookies
      },
      body: JSON.stringify({
        email: 'admin@transconet.ng',
        password: 'wrongpassword',
        captchaToken: '123456'
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('Login success:', data.message);
    } else {
      const errText = await res.text();
      console.error('Login error:', errText);
      console.error('Status:', res.status);
    }
  } catch (err) {
    console.error('Login error:', err.message);
  }
})();
