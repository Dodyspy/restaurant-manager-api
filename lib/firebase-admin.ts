import * as admin from 'firebase-admin';

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      console.log('🔧 Firebase Admin initialization attempt');
      console.log('Project ID:', projectId ? 'Found' : 'Missing');
      console.log('Private Key:', privateKey ? 'Found' : 'Missing');
      console.log('Client Email:', clientEmail ? 'Found' : 'Missing');

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error('Missing required Firebase Admin environment variables. Please configure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL on Vercel.');
      }

      // Clean up the private key - handle both escaped and unescaped newlines
      const cleanPrivateKey = privateKey.includes('\\n') 
        ? privateKey.replace(/\\n/g, '\n')
        : privateKey;

      const serviceAccount = {
        type: "service_account",
        projectId: projectId,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: cleanPrivateKey,
        clientEmail: clientEmail,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: "https://accounts.google.com/o/oauth2/auth",
        tokenUri: "https://oauth2.googleapis.com/token",
        authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
        clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL
      } as admin.ServiceAccount;
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
      throw error;
    }
  }
}

export function getAdminAuth() {
  initializeAdmin();
  return admin.auth();
}

export function getAdminDb() {
  initializeAdmin();
  return admin.firestore();
}
