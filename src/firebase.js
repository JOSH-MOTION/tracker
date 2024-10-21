import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQJ8ooFJXTcDmw227n4YhZ8GDZKsojs9g",
  authDomain: "tracker-15d12.firebaseapp.com",
  projectId: "tracker-15d12",
  storageBucket: "tracker-15d12.appspot.com",
  messagingSenderId: "106355489053",
  appId: "1:106355489053:web:b4388bac0f16f3442889f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
