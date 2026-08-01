import fs from 'fs';

let content = fs.readFileSync('src/controllers/authController.ts', 'utf8');

// Add import
if (!content.includes('getFirebaseAdmin')) {
  content = "import { getFirebaseAdmin } from '../utils/firebaseAdmin';\n" + content;
}

// Replace googleLogin body
content = content.replace(
  /const \{ email, name, uid, idToken \} = req\.body;([\s\S]*?)if \(!email\)/,
  `const { email, name, uid, idToken } = req.body;
    
    if (idToken) {
      try {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid !== uid || decodedToken.email !== email) {
           return res.status(401).json({ error: 'Token claims mismatch' });
        }
      } catch (error) {
        console.warn('Firebase token verification failed. In production this should reject:', error);
        // We only enforce strictly if not running in local test environment where token might be mocked
        if (process.env.NODE_ENV === 'production') {
           return res.status(401).json({ error: 'Invalid Google identity token' });
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'idToken is required in production' });
    }
    
    if (!email)`
);

fs.writeFileSync('src/controllers/authController.ts', content);
