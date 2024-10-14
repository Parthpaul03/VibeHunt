document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const startButton = document.getElementById('start-recording');
    const stopButton = document.getElementById('stop-recording');
    const retakeButton = document.getElementById('retake');
    const uploadButton = document.getElementById('upload');

    // Check if the video element and buttons exist
    if (video && startButton && stopButton && retakeButton && uploadButton) {
        let mediaRecorder;
        let recordedChunks = [];

        async function startVideoRecording() {
            try {
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
                    console.log('Video URL:', url);
                };

                mediaRecorder.start();
                startButton.disabled = true;
                stopButton.disabled = false;
                retakeButton.disabled = false;
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        }

        function stopVideoRecording() {
            if (mediaRecorder) {
                mediaRecorder.stop();
                video.srcObject.getTracks().forEach(track => track.stop());
                startButton.disabled = false;
                stopButton.disabled = true;
            }
        }

        // Add event listeners to buttons
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
    } else {
        console.error("One or more required elements are missing from the DOM.");
    }
});
