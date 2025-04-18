import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    databaseURL: process.env.DATABASE_URL,
  });
}

const adminFirestore = admin.firestore();

export { admin, adminFirestore };
