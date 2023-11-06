// send.js
import { db, auth } from './firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export async function saveImageAndEmail(imageDataUrl, email) {
  if (!auth.currentUser) {
    throw new Error('User is not authenticated');
  }

  try {
    const docRef = await addDoc(collection(db, `userImages`), {
      email: email,
      image: imageDataUrl,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    return true; // Indicate success
  } catch (e) {
    console.error("Error adding document: ", e);
    return false; // Indicate failure
  }
}
