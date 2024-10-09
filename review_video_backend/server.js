const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const port = 5500; // Your port number

// Your credentials from the Google Cloud Platform console
const CLIENT_ID = '446478312774-16glgu0kptvd8n5tbqqsphjl73fdvfqt.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://127.0.0.1:5500/oauth2callback'; // Matching your review.html port
const API_KEY = 'AIzaSyC1okbUi2qmbT3-i142IjYGnrOIZWkfgCU';

// Create a new OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the URL that will be used for authorization
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
});

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to start the authorization flow
app.get('/auth', (req, res) => {
  res.redirect(authUrl);
});

// Callback route after user grants permission
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Error authenticating.');
  }
});

// Upload route to handle video file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const videoData = req.file; // Access the uploaded file
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Set up the file metadata
    const fileMetadata = {
      name: videoData.originalname || 'video_review.webm', // Use the original name or default
      mimeType: 'video/webm',
    };

    // Set up the media (video data)
    const media = {
      mimeType: 'video/webm',
      body: videoData.buffer, // Use the buffer directly
    };

    // Upload the video to Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id', // Get the file ID in the response
    });

    // Send a success response to the frontend
    console.log('Video uploaded successfully:', response.data);
    res.status(200).json({ id: response.data.id }); // Return the file ID
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
