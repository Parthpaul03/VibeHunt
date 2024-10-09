const express = require('express');
const cors = require('cors'); // Add this
const bodyParser = require('body-parser');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5500;

// Add CORS middleware
app.use(cors());

// Load the service account key JSON file
const SERVICE_ACCOUNT_FILE = 'C:\\Users\\parth\\Downloads\\careful-airfoil-437811-a5-cc38aab56d4d.json'; // Correct path

// Create a new JWT client
const client = new google.auth.JWT(
    JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE)),
    null,
    null,
    ['https://www.googleapis.com/auth/drive.file'] // Scopes
);

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Upload route to handle video file uploads
app.post('/upload', upload.single('videoData'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.'); // Error if no file is uploaded
    }

    try {
        await client.authorize();

        const drive = google.drive({ version: 'v3', auth: client });

        // Set up the file metadata
        const fileMetadata = {
            name: req.file.originalname || 'video_review.webm', // Use the original name or default
            parents: ['1aFtYe25gXUucJgBJw_GrNRUDEAdoMhpB'], // Your Google Drive folder ID
        };

        // Set up the media (video data)
        const media = {
            mimeType: req.file.mimetype || 'video/webm', // Use the correct mime type
            body: req.file.buffer, // Use the buffer directly
        };

        // Upload the video to Google Drive
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id', // Get the file ID in the response
        });

        // Send a success response to the frontend
        console.log('Video uploaded successfully:', response.data);
        res.status(200).json({ id: response.data.id });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).send('Error uploading video: ' + error.message); // Include the error message in the response
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
