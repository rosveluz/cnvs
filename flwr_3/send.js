const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

document.getElementById('printButton').addEventListener('click', async (event) => {
  event.preventDefault(); // Prevent default form submission behavior
  try {
    const imageData = await captureCanvasAndBackground(); // This should return a data URL or a path to the image in storage
    const email = document.getElementById('emailInput').value;

    if (!email) {
      alert('Please enter an email address.');
      return;
    }
  
    // Store the captured image and user's email in Firestore
    const docRef = firestore.collection('captured-flowers').doc();
    await docRef.set({
      email: email,
      imageURL: imageData, // Assuming this is a URL/path to the image
      timestamp: new Date()
    });

    alert('Email request submitted successfully. Please check your inbox shortly.');

    // Close the modal here
    $('#yourModalId').modal('hide');

  } catch (error) {
    console.error('Error submitting email request:', error);
    alert('Failed to submit email request. Please try again.');
  }
});
