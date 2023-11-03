/* index.js */
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

exports.sendEmailWithAttachment = functions.firestore
    .document("captured-flowers/{docId}")
    .onCreate(async (snap, context) => {
      const {email, imageURL} = snap.data();

      // Check if imageURL is a path in the bucket or a base64 string
      let filePath;
      let attachments;

      if (imageURL.startsWith("gs://") || imageURL.startsWith("https://")) {
        // If it's a path, download the image to a temporary directory.
        filePath = path.join(os.tmpdir(), "image.jpg");
        const storageBucket = storage.bucket("bad-flowers.appspot.com");
        const fileName = imageURL.split("/").pop();
        const file = storageBucket.file(fileName);

        await file.download({destination: filePath});
        attachments = [{filename: "image.jpg", path: filePath}];
      } else if (imageURL.startsWith("data:image/")) {
        // If it's a base64 string, decode it and attach directly.
        const base64Data = imageURL.replace(/^data:image\/\w+;base64,/, "");
        attachments = [{
          filename: "image.jpg",
          content: Buffer.from(base64Data, "base64"),
          encoding: "base64",
        }];
      } else {
        throw new Error("Invalid image URL format");
      }

      const mailOptions = {
        from: "cnvs team <connect@cnvs.zip>",
        to: email,
        subject: "Bad Flowers",
        text: "Please find the attached image.",
        attachments: attachments,
      };

      try {
        // Send the email with the attached image.
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } catch (error) {
        console.error("Error sending email:", error);
      } finally {
        // Cleanup the temp file if it was created.
        if (filePath) {
          fs.unlinkSync(filePath);
        }
      }
    });
