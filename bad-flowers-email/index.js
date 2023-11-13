/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

// Set the SendGrid API key from Firebase configuration
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendEmail = functions.firestore
    .document('userImages/{documentId}')
    .onCreate(async (snap, context) => {
        const newValue = snap.data();

        const msg = {
            to: newValue.email, // recipient
            from: 'your-email@example.com', // verified sender
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Firebase',
            html: '<strong>and easy to do anywhere, even with Firebase</strong>',
        };

        try {
            await sgMail.send(msg);
            console.log('Email sent');
        } catch (error) {
            console.error('Error sending email', error);
            if (error.response) {
                console.error(error.response.body);
            }
        }
    });
