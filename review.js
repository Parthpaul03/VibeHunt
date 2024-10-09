// const API_URL = 'http://127.0.0.1:5500/upload'; / Corrected to point to the upload endpoint
const API_URL= 'https://transfer.sh/SbWJcFKFFx'
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

// async function uploadToDrive(blob) {
//     const formData = new FormData();
//     formData.append('videoData', blob, 'video_review.webm'); // 'videoData' is the field name

//     try {
//         const response = await fetch(API_URL, { // Use the correct API URL here
//             method: 'POST',
//             body: formData,
//         });

//         if (response.ok) {
//             const result = await response.json();
//             console.log('File uploaded successfully, File ID: ' + result.id);
//             alert('Thank you for your valuable feedback!');
//             resetControls();
//         } else {
//             console.error('Error uploading file:', response.status, response.statusText);
//             alert('Error uploading file: ' + response.statusText);
//             resetControls();
//         }
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         alert('Error uploading file. Please try again.');
//         resetControls();
//     }
// }
async function uploadToDrive(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'video_review.webm'); // 'file' is the field name for Transfer.sh

    try {
        // const response = await fetch(API_URL, {
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://transfer.sh', {
            method: 'PUT', // Use PUT for Transfer.sh
            body: blob,
        });

        if (response.ok) {
            const result = await response.text(); // Expect a URL as text response
            console.log('File uploaded successfully, URL: ' + result);
            alert('Thank you for your valuable feedback! Here is your link: ' + result);
            resetControls();
        } else {
            console.error('Error uploading file:', response.status, response.statusText);
            alert('Error uploading file: ' + response.statusText);
            resetControls();
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
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
