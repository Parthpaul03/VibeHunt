const CLIENT_ID = '381081011800-fb5fj5hequu3imo997u5qg6q0apjp242.apps.googleusercontent.com'; // Replace with your Google Client ID
const API_KEY = 'AIzaSyBRVPo5v1Og45z7A9qEOSziIyfGZ-94hwg'; // Replace with your Google API Key
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const video = document.getElementById('video');
const preview = document.getElementById('preview');
const message = document.getElementById('message');
const startRecordingButton = document.getElementById('start-recording');
const stopRecordingButton = document.getElementById('stop-recording');
const uploadButton = document.getElementById('upload');
const retakeButton = document.getElementById('retake');

let mediaRecorder;
let recordedChunks = [];
let stream;

// Make the handleClientLoad function global
window.handleClientLoad = function () {
    gapi.load('client:auth2', initClient);
};

async function initClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });

        const authInstance = gapi.auth2.getAuthInstance();
        updateSigninStatus(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(updateSigninStatus);
    } catch (error) {
        console.error('Error initializing Google API client:', error);
        alert('Failed to initialize API client. Please check your credentials.');
    }
}

function updateSigninStatus(isSignedIn) {
    uploadButton.disabled = !isSignedIn;
    if (!isSignedIn) {
        gapi.auth2.getAuthInstance().signIn();
    }
}

function startCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(mediaStream => {
            stream = mediaStream;
            video.srcObject = stream;
            video.style.display = 'block';
            message.style.display = 'none';
        })
        .catch(error => {
            console.error('Error accessing camera and microphone: ', error);
            alert('Could not access camera and microphone. Please check permissions.');
        });
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.style.display = 'none';
    }
}

startRecordingButton.onclick = () => {
    recordedChunks = [];
    startCamera().then(() => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            preview.src = url;
            preview.style.display = 'block';
            uploadButton.disabled = false;
            stopCamera();
        };

        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
        retakeButton.disabled = true;
        message.style.display = 'none';
    });
};

stopRecordingButton.onclick = () => {
    mediaRecorder.stop();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = true;
    retakeButton.disabled = false;
};

retakeButton.onclick = () => {
    recordedChunks = [];
    preview.style.display = 'none';
    uploadButton.disabled = true;
    retakeButton.disabled = true;
    startRecordingButton.disabled = false;
    startCamera();
};

uploadButton.onclick = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    uploadButton.disabled = true;
    uploadButton.innerText = 'Uploading...';

    uploadToDrive(blob);
};

async function uploadToDrive(blob) {
    const fileMetadata = {
        'name': 'video_review.webm',
        'mimeType': 'video/webm'
    };

    try {
        const response = await gapi.client.drive.files.list({
            'q': "name = 'video_review.webm'",
            'fields': "files(id, name)"
        });

        const files = response.result.files;

        if (files.length > 0) {
            console.log('File already exists. Ignoring upload.');
            alert('File already exists. Please rename your file.');
            resetControls();
            return;
        }

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
        form.append('file', blob);

        const request = gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            'method': 'POST',
            'headers': {
                'Content-Type': 'multipart/related'
            },
            'body': form
        });

        const file = await request.execute();
        if (file.id) {
            console.log('File uploaded successfully, File ID: ' + file.id);
            alert('Thank you for your valuable feedback!');
            resetControls();
        } else {
            console.error('Error uploading file: ', file);
            alert('Error uploading file. Please try again.');
            resetControls();
        }
    } catch (error) {
        console.error('Error checking for existing file or uploading: ', error);
        alert('Error checking for existing file or uploading. Please try again.');
        resetControls();
    }
}

function resetControls() {
    recordedChunks = [];
    preview.style.display = 'none';
    uploadButton.disabled = true;
    retakeButton.disabled = true;
    startRecordingButton.disabled = false;
    message.style.display = 'block';
    uploadButton.innerText = 'Upload';
}
