// auth.js
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence
  } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
  import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
  import { db } from './firebase-config.js'; // Make sure this path is correct
  
  // Initialize the Firebase Auth instance
  export const auth = getAuth();
  
  // Set the persistence to LOCAL
  setPersistence(auth, browserLocalPersistence);
  
  // This listener will be called whenever the user's sign-in state changes.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log('User is signed in', user);
      // Redirect to another page or update the UI
    } else {
      // No user is signed in
      console.log('No user is signed in');
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.modal .close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
          loginContainer.style.display = 'none';
        }
      });
    }
  });
  
  // Function to sign in a user
  export function signIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`User signed in: ${user.uid}`);
        // Add the Firestore document for the user
        const userRef = doc(db, `userImages/${user.uid}`);
        setDoc(userRef, {
          // your document data
        })
        .then(() => {
          console.log('Document successfully written!');
        })
        .catch((error) => {
          console.error('Error writing document: ', error);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error signing in: ${errorCode}`, errorMessage);
        // Display the error message to the user
      });
  }
  
  // Listen for login form submission
  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submit
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signIn(email, password); // Call the signIn function with the email and password
  });
  