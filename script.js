// Add this function to handle sign-in and redirect
function handleSignIn(e) {
    e.preventDefault();
    const nameInput = document.getElementById('signin-name');
    const name = nameInput.value.trim();
    
    if (name) {
        userName = name;
        localStorage.setItem('userName', userName);
        
        // Show success notification
        showNotification(`Welcome ${name}! Redirecting to dashboard...`, 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showNotification('Please enter your name to continue', 'error');
    }
}

// Update the initializeApp function to handle redirects
function initializeApp() {
    // Check if we're on the sign-in page or dashboard
    const currentPage = getCurrentPage();
    
    if (currentPage === 'index.html' || currentPage === '') {
        // On sign-in page, check if user is already signed in
        const savedUserName = localStorage.getItem('userName');
        if (savedUserName && savedUserName !== 'User') {
            // User is already signed in, redirect to dashboard
            window.location.href = 'dashboard.html';
            return;
        }
        // User needs to sign in, set up sign-in form
        setupSignInPage();
    } else {
        // On other pages, check if user is signed in
        if (!userName || userName === 'User') {
            // Not signed in, redirect to sign-in page
            window.location.href = 'index.html';
            return;
        }
        // User is signed in, initialize the page
        hideSignInOverlay();
        initializePage();
        setupEventListeners();
        loadInitialData();
    }
}

// Add function to set up sign-in page
function setupSignInPage() {
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }
    
    // Focus on the name input
    const nameInput = document.getElementById('signin-name');
    if (nameInput) {
        nameInput.focus();
    }
}

// Update the getCurrentPage function to handle root path
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === '' || page === 'index.html') {
        return 'index.html';
    }
    return page;
}
