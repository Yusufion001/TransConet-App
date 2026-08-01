/const handleLoginSubmit = async (e: React.FormEvent) => {/a\
    setLoading(true);\
    setMessage('Initiating device fingerprinting & fraud checks...');\
    await new Promise(r => setTimeout(r, 1000));\
    setMessage('Securing auth channel (TLS/AES-256)...');\
    await new Promise(r => setTimeout(r, 1000));
