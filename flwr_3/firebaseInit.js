import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCv65a7G1nNDc3FH0EnzxO__F2Ov9_3HY4",
    authDomain: "bad-flowers.firebaseapp.com",
    projectId: "bad-flowers",
    storageBucket: "bad-flowers.appspot.com",
    messagingSenderId: "614083574855",
    appId: "1:614083574855:web:4e2619770962f168468562"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, firestore, storage };