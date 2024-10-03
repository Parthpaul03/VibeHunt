const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');  // Adds 'active' class when bar is clicked
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');  // Removes 'active' class when close is clicked
    });
}


const video = document.getElementById('video');
const startButton = document.getElementById('start-recording');
const stopButton = document.getElementById('stop-recording');
const retakeButton = document.getElementById('retake');
const uploadButton = document.getElementById('upload');

let mediaRecorder;
let recordedChunks = [];

async function startVideoRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        uploadButton.disabled = false;

        // You can handle the uploaded video URL here
        console.log('Video URL:', url);
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    retakeButton.disabled = false;
}

function stopVideoRecording() {
    mediaRecorder.stop();
    video.srcObject.getTracks().forEach(track => track.stop());
    startButton.disabled = false;
    stopButton.disabled = true;
}

startButton.addEventListener('click', startVideoRecording);
stopButton.addEventListener('click', stopVideoRecording);
retakeButton.addEventListener('click', () => {
    recordedChunks = [];
    startVideoRecording();
});
uploadButton.addEventListener('click', () => {
    alert('Video uploaded!');
    recordedChunks = [];
    uploadButton.disabled = true;
});
