const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const {Storage} = require("@google-cloud/storage");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Initialize the Firebase admin SDK to access Firestore and other resources.
admin.initializeApp();

// Creates a Google Cloud Storage client to download the image file.
const storage = new Storage();

// Email transporter configuration using Gmail.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

exports.sendEmailWithAttachment = functions.region('asia-southeast1').firestore
    .document("userImages/{docId}")
    .onCreate(async (snap, context) => {
        const documentData = snap.data();
        const email = documentData.email; // make sure 'email' field exists in the document
        const image = documentData.image; // use 'image' instead of 'images' or 'imageURL'

        // Check if 'image' is a path in the bucket or a base64 string
        let filePath;
        let attachments;

        if (image && image.startsWith("data:image/")) {
            // Determine the image format (png, jpg, etc.)
            const matches = image.match(/^data:(image\/\w+);base64,/);
            const extension = matches[1].split('/')[1];
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

            // Use the correct file extension based on the image format
            const filename = `image.${extension}`;
            attachments = [{
                filename: filename,
                content: Buffer.from(base64Data, "base64"),
                encoding: "base64",
                contentType: matches[1], // This sets the correct content type
            }];
        } else {
            console.error("Invalid or missing image field");
            return;
        }

        const mailOptions = {
            from: "cnvs team <connect@cnvs.zip>",
            to: email,
            subject: "Your Image",
            text: "Please find the attached image.",
            attachments: attachments,
        };

        try {
            // Send the email with the attached image.
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully to:", email);
        } catch (error) {
            console.error("Error sending email:", error);
        } finally {
            // No need to clean up the temp file since we're not creating one
        }
    });


