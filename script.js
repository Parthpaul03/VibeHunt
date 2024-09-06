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
