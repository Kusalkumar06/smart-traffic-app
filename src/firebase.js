import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRhCRUX3Yn5ZTWaE72vcAtYRiZW-HSnOU",
  authDomain: "trafficapp-62650.firebaseapp.com",
  databaseURL: "https://trafficapp-62650-default-rtdb.firebaseio.com", // ✅ THIS MUST EXIST
  projectId: "trafficapp-62650",
  storageBucket: "trafficapp-62650.appspot.com",
  messagingSenderId: "1052333060390",
  appId: "1:1052333060390:web:fc0a5c2ad2e884363051e7",
  measurementId: "G-FMXZQYB50K"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };

