const express = require('express');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const app = express();
const PORT = 3000;

// Set up OAuth2 client
const oauth2Client = new OAuth2(
  '614083574855-tor714q8jvik21etkd2t5c4gmkd5qmb4.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/oauth2callback'
);

// Endpoint to initiate auth flow
app.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  res.redirect(url);
});

// Endpoint for callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const {tokens} = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Now you can use the Gmail API
  const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  const rawEmail = Buffer.from(
    `To: recipient@example.com\r\n` +
    `Subject: Test email\r\n\r\n` +
    `This is a test email from the Gmail API.`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawEmail
    }
  }, (err, result) => {
    if (err) return res.send('Error sending email:', err);
    res.send('Email sent: ' + JSON.stringify(result.data));
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
