let mediaRecorder;
let audioChunks = [];

const audioPlayback = document.getElementById("audioPlayback");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");

startBtn.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.start();
    
    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;

        // Enable buttons
        stopBtn.disabled = true;
        retakeBtn.disabled = false;
        uploadBtn.disabled = false;
    });

    // Disable buttons
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
    mediaRecorder.stop();
});

retakeBtn.addEventListener("click", () => {
    audioChunks = [];
    audioPlayback.src = "";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    retakeBtn.disabled = true;
    uploadBtn.disabled = true;
});

uploadBtn.addEventListener("click", () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    // Simulating an upload (you would need to handle this on the server-side)
    fetch('YOUR_UPLOAD_URL', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload successful:', data);
        alert('Recording uploaded successfully!');
    })
    .catch(error => {
        console.error('Error uploading the recording:', error);
        alert('Upload failed!');
    });
});
