const fs = require('fs');
let code = fs.readFileSync('src/utils/firebaseAdmin.ts', 'utf8');

code = code.replace(/import \* as admin from 'firebase-admin';/, "import * as admin from 'firebase-admin';"); // already did this but just checking

// But wait, typescript was complaining about admin.credential
// "Property 'credential' does not exist on type 'typeof import(\"firebase-admin/lib/index\")'."

code = `import * as admin from 'firebase-admin';

let initialized = false;

export const getFirebaseAdmin = () => {
  if (!initialized) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        admin.initializeApp();
      }
      initialized = true;
    } catch (error) {
      console.warn('Firebase Admin initialization failed or already initialized:', error);
      initialized = true;
    }
  }
  return admin;
};`

fs.writeFileSync('src/utils/firebaseAdmin.ts', code);
