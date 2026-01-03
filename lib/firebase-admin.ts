import * as admin from 'firebase-admin';

// Lazy initialization to prevent build-time errors
let adminDbInstance: admin.firestore.Firestore | null = null;

export function getAdminDb(): admin.firestore.Firestore {
  if (adminDbInstance) {
    return adminDbInstance;
  }

  // Initialize Firebase Admin if not already done
  if (!admin.apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || "casanova-dissy-reservations";
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      // Check if credentials are properly configured
      if (!privateKey || !clientEmail) {
        // Fallback to service account file for local development
        const serviceAccountPath = '/Users/sxy/AppTest/Casanovadissy/casanova-dissy-reservations-firebase-adminsdk-fbsvc-7a6504fa37.json';
        
        console.log('Using service account file for Firebase Admin initialization');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          databaseURL: `https://${projectId}.firebaseio.com`,
        });
      } else {
        // Use environment variables for production deployment
        const serviceAccount = {
          type: "service_account",
          projectId: projectId,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail: clientEmail,
          clientId: process.env.FIREBASE_CLIENT_ID,
          authUri: "https://accounts.google.com/o/oauth2/auth",
          tokenUri: "https://oauth2.googleapis.com/token",
          authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
          clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL
        } as admin.ServiceAccount;
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
        });
      }
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization failed:', error);
      throw new Error('Firebase Admin not available');
    }
  }

  adminDbInstance = admin.firestore();
  return adminDbInstance;
}

// Export a getter function instead of direct instance
export const adminDb = {
  collection: (path: string) => getAdminDb().collection(path),
  doc: (path: string) => getAdminDb().doc(path),
  batch: () => getAdminDb().batch(),
  runTransaction: (updateFunction: any) => getAdminDb().runTransaction(updateFunction),
};
