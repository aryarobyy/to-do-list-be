import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import * as dotenv from "dotenv";

dotenv.config();
console.log("saasadsda",process.env.MEASUREMENT_ID)

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain:  process.env.AUTH_DOMAIN,
  databaseURL:  process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDERID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};
const firebaseApp = initializeApp(firebaseConfig);

(async () => {
  if (await isSupported()) {
    getAnalytics(firebaseApp);
    console.log("Analytics initialized.");
  } else {
    console.log("Analytics not supported in this environment.");
  }
})();