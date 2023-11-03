// send.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    "type": "service_account",
    "project_id": "bad-flowers",
    "private_key_id": "1828218025eb6ab54d23dfd53997a98539d52b4a",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCuxxcgUW2VQiob\nLenh0yKlq1TQ2bd05qKBoAAZkxX2yxVkaMn0vHXgF+NgwaWAWbTHhUvqWFpuCO+L\nOjg1RZOIQQE7AwuXnofs5nIWN4EmogFH61VlWvX7L18UdkwqnN2ak8I+0G2Kg11W\nMoeMNKSd7f7CbenKVc+18g9/7SzlGLkL8q/gmTSAI83UrFFVFQpezGUrYq9HWZEX\nMDU5AwZgh3HhZAzhpINSOrgAzbc+S60CzlQqeZIwRc/lQYcJv7byXH/NXyxjh/Qj\nLuCCwGAdth+TsbWm7uorVUI3GHCTEtng/DCUA+Qz+g33VGfW8GQuHwHolLqdfRuI\njQjoVXZXAgMBAAECggEAD2zSxa9qFHo6bRuoQJ35uNVeLvCIGHEidn5AhAFPNvDF\neo8lA8x+OsDg+HEewi0on1NMV+pkUMHJImiI/Wqekq/qA+NI6qC7LlVITF2psFcr\n9cT3THKysvCDW7L1Fe2yQSo5QoHyqP7fBfR/sggTXzzZ9x7sO0dHha9PXuL3y2A1\no7u/it3gFtNmK/HV5dcvfCwIr2Ak7rJ8ucszATYJsPTDd0Bd9elPtN/4JjXNTowL\nlg77SP30WBOGfYkkgsPF6SA4457JlrprJXedWc8bhLewgkaHss6sGlNdsYVZe9sP\n5pMmrM1zIHV81LdH/F5u+y9ZKG2abxZqNdBhRhWNgQKBgQDsSkZF96p4fzUoBSiI\ngOzSm3ldt2EXG2vemrBOhc5NVahIexf3ZyBBIsRX1kMrpic+24TQeMripdn0bYcc\nRlq+k1UwbgP2C/dd3c5U3pA28U4nf2RtD4Yup4FGIFzL03sd+DGjeDm1x0+lP/aU\nAnDeYGp2HhqE//W2QirmVfoszwKBgQC9W0hrCI9bIbUQxZmn6eKVF3COj5Z4tbD/\nfIDAQ5/hc79z7s1yUuRR2F99/U9CG3I7x+0KPufPfr4RPazfFSykPMPyFE48HgbE\nTnYFByIdrHDxnm+Kvsi8iHRh2P0D8VEbFZ/UR94DUbp2bYkr1aFduIjNTkADe3/n\nCQNILBRP+QKBgQDGRjkbowwP2qZvM4zkplKTE1VPF37IFgF5JJKHAW6wpAz27Rua\nRZXiMltRXYC10tGhxDB5grK0ZvkySuoSBtNEkXrtjZOTVk03HdVyj+OxxuCO8i4B\n+gHdij9G6gcUHhx0dHyqsEq0x0+E2dx+LGIrp/oNrYsRSXsUegdnioPILwKBgQCR\n04XO4BW+4hOWagbumKFlnlqRf6UrKwm3iAODjdDICKLtvn+7xniNS2wnE/iA+bAc\nt9gmJtHRK1Nm5a+HUcBCb4WbneWuSJV/gslDD/5HCfElMpXGLS1cfF3cqQYZjjOe\n/yVKj1o8BinqYGreNjSCf8XjDpsf03Fp1LgRUdkGyQKBgQCfWgrAS4yWKrNjGrjS\n+N7J0I0sNOXfilZyafzKcjCCtqdtiEjxg+mTY3sBH8T0t8400aU6929fmkbvdSNS\nUUBzk0V8O+Vk6Ic55MosUWqQerDgdLeTa3mtC2g4XVQe5+PAFYiVrT6mL4DiCwJb\n2j6DMlgLNTqv9tJnL8Dm/XlAsA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-usilj@bad-flowers.iam.gserviceaccount.com",
    "client_id": "114804119072986845590",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-usilj%40bad-flowers.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);


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
