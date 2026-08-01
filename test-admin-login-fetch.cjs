(async () => {
  try {
    const csrfRes = await fetch('http://localhost:3000/api/csrf-token');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    const cookies = csrfRes.headers.get('set-cookie');
    let cookieString = '';
    if (cookies) {
      const parts = cookies.split(/,\s*(?=[A-Za-z0-9_-]+\=)/);
      cookieString = parts.map(p => p.split(';')[0]).join('; ');
    }

    const res = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Cookie': cookieString
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
      console.error('Login error text:', errText);
      console.error('Status:', res.status);
    }
  } catch (err) {
    console.error('Login error exception:', err.message);
  }
})();
