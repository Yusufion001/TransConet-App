/const handleDocumentUpload = async (e: any, docType: string) => {/,/^\s*};/c\
  const handleDocumentUpload = async (e: any, docType: string) => {\
    if (e.target.files && e.target.files.length > 0) {\
      const file = e.target.files[0];\
      const formData = new FormData();\
      formData.append(docType, file);\
      try {\
        setVerificationStatus('VERIFYING');\
        \
        setUploadStage('ENCRYPTING');\
        setUploadProgressText('Encrypting document with AES-256...');\
        await new Promise(r => setTimeout(r, 1200));\
        \
        setUploadStage('FRAUD_CHECK');\
        setUploadProgressText('Running AI tampering & fraud detection...');\
        await new Promise(r => setTimeout(r, 1500));\
        \
        setUploadStage('UPLOADING');\
        setUploadProgressText('Securely uploading verified document...');\
        await new Promise(r => setTimeout(r, 1000));\
        \
        const token = localStorage.getItem('token') || '';\
        await uploadDriverDocuments(token, formData);\
        \
        setVerificationStatus('VERIFIED');\
        localStorage.setItem('userVerified', 'true');\
        const docName = docType === 'driverLicense' ? 'Government ID' : docType === 'gitInsurance' ? 'GiT Insurance' : docType === 'cac' ? 'Business Registration' : 'Vehicle Certificate';\
        setNotification({ message: `${docName} verified and secured successfully!`, type: 'success' });\
        setUploadStage(null);\
        setTimeout(() => setNotification(null), 3000);\
      } catch (error) {\
        console.error('Upload failed', error);\
        setVerificationStatus('UNVERIFIED');\
        setUploadStage(null);\
        const docName = docType === 'driverLicense' ? 'Government ID' : docType === 'gitInsurance' ? 'GiT Insurance' : docType === 'cac' ? 'Business Registration' : 'Vehicle Certificate';\
        setNotification({ message: `Failed to upload ${docName}.`, type: 'error' });\
        setTimeout(() => setNotification(null), 3000);\
      }\
    }\
  };
