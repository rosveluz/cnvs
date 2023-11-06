// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZDQ-U5rxiJ6vMNyQDBKRrurlOiOGmjyI",
  authDomain: "bad-flowers-b2ee7.firebaseapp.com",
  projectId: "bad-flowers-b2ee7",
  storageBucket: "bad-flowers-b2ee7.appspot.com",
  messagingSenderId: "953588748289",
  appId: "1:953588748289:web:d3232aa7c7ba6e4e8a3000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
