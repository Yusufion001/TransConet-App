const fs = require('fs');
let code = fs.readFileSync('src/components/DedicatedAdminLogin.tsx', 'utf8');

const regex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?\} finally \{\n       setLoading\(false\);\n    \}\n  \};/;

const replacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       setError('Email and password are required.');
       return;
    }
    setError('');
    setLoading(true);
    
    try {
       const res = await api.post('/admin/auth/login', { email, password, captchaToken, mfaToken });
       const data = res.data;
       
       if (data.token) {
         localStorage.setItem('admin_token', data.token);
         localStorage.setItem('admin_user', JSON.stringify(data.admin));
         onLoginSuccess(data.admin);
       } else if (data.requireMfa) {
         setRequireMfa(true);
       }
    } catch (err: any) {
       console.error('Login error:', err);
       const errData = err.response?.data;
       if (errData?.requireMfa) {
         setRequireMfa(true);
         setError('');
       } else {
         setError(errData?.error || err.message || 'Authentication failed.');
       }
    } finally {
       setLoading(false);
    }
  };`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/DedicatedAdminLogin.tsx', code);
