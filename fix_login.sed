/const handleLoginSubmit = async (e: React.FormEvent) => {/,/const formattedPhone = phoneNumber.trim();/c\
  const handleLoginSubmit = async (e: React.FormEvent) => {\
    e.preventDefault();\
    setLoading(true);\
    setError(null);\
    setMessage('Initiating device fingerprinting & AI fraud checks...');\
    await new Promise(r => setTimeout(r, 1200));\
    setMessage('Securing auth channel (TLS/AES-256)...');\
    await new Promise(r => setTimeout(r, 1000));\
    setMessage(null);\
    \
    const formattedPhone = phoneNumber.trim();
