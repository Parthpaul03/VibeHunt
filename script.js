document.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    // Check if elements exist before adding event listeners
    if (bar && nav) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
    } else {
        console.error("Menu toggle element(s) not found.");
    }

    if (close && nav) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    } else {
        console.error("Close button or navigation element not found.");
    }
});
