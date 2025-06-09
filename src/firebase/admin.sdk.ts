import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';
import { ServiceAccount } from 'firebase-admin'; 

dotenv.config();

let serviceAccount: ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.log('Memuat service account dari environment variable...');
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  console.log('Memuat service account dari file lokal: serviceAccountKey.json...');
  const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
  try {
    serviceAccount = require(serviceAccountPath);
  } catch (error) {
    console.error('Error: Tidak dapat menemukan file serviceAccountKey.json. Pastikan file tersebut ada di folder yang sama untuk pengembangan lokal.');
    process.exit(1);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
  });
}

const adminFirestore = admin.firestore();

export { admin, adminFirestore };