/const handleSignupSubmit = async (e: React.FormEvent) => {/,/const formattedPhone = phoneNumber.trim();/c\
  const handleSignupSubmit = async (e: React.FormEvent) => {\
    e.preventDefault();\
    setLoading(true);\
    setError(null);\
    setMessage('Performing Identity Verification (KYC)...');\
    await new Promise(r => setTimeout(r, 1200));\
    setMessage('Initializing AI fraud detection...');\
    await new Promise(r => setTimeout(r, 1200));\
    setMessage(null);\
\
    const formattedPhone = phoneNumber.trim();
