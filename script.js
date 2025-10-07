// script.js
document.addEventListener('DOMContentLoaded', function() {
    const signinOverlay = document.getElementById('signin-overlay');
    const mainApp = document.getElementById('main-app');
    const signinForm = document.getElementById('signin-form');
    const signinName = document.getElementById('signin-name');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if user is already signed in
    const userName = localStorage.getItem('smartgrocer-user');
    if (userName) {
        showMainApp(userName);
    }

    // Handle sign in
    signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = signinName.value.trim();
        
        if (name) {
            localStorage.setItem('smartgrocer-user', name);
            showMainApp(name);
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('smartgrocer-user');
        showSigninOverlay();
    });

    function showMainApp(name) {
        signinOverlay.style.display = 'none';
        mainApp.classList.remove('hidden');
        userGreeting.textContent = `Hello, ${name}!`;
    }

    function showSigninOverlay() {
        mainApp.classList.add('hidden');
        signinOverlay.style.display = 'flex';
        signinName.value = '';
    }
});
