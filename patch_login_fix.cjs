const fs = require('fs');
let code = fs.readFileSync('src/components/LoginGateway.tsx', 'utf8');

code = code.replace(
  "const { loginWithPin, registerWithPin, resetPasswordRequest, resetPasswordConfirm, loading, error: authError, setError: setAuthError } = useAuth();\n  const [loadingLocal, setLoadingLocal] = useState(false);",
  "const { loginWithPin, registerWithPin, resetPasswordRequest, resetPasswordConfirm, error: authError, setError: setAuthError } = useAuth();\n  const [loading, setLoading] = useState(false);"
);

fs.writeFileSync('src/components/LoginGateway.tsx', code);
console.log('Fixed LoginGateway.tsx');
