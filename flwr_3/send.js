// Firebase imports
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';

async function uploadImageAndGetURL(imageData) {
  // Upload the image to Firebase Storage
  const storageRef = ref(storage, `captured-images/${new Date().toISOString()}.jpg`);
  await uploadString(storageRef, imageData, 'data_url');
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

document.getElementById('submitEmail').addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const imageData = await captureCanvasAndBackground();
    const email = document.getElementById('emailInput').value;

    if (!email) {
      alert('Please enter an email address.');
      return;
    }

    // Upload image to Firebase Storage and get the URL
    const imageURL = await uploadImageAndGetURL(imageData);

    // Add the image URL and email to Firestore
    await addDoc(collection(firestore, 'captured-flowers'), {
      email: email,
      imageURL: imageURL,
      timestamp: new Date()
    });

    alert('Your flower capture has been submitted. Please check your email shortly.');

    // Here you would trigger your backend to send the email
    // Replace 'YOUR_CLOUD_FUNCTION_ENDPOINT' with your actual function endpoint
    await fetch('YOUR_CLOUD_FUNCTION_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, imageURL }),
    });

    // Close the modal
    modal.style.display = "none";

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit your capture. Please try again.');
  }
});
