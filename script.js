// Basic application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading process
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
        // Uncomment the line below to show auth container by default
        // document.getElementById('auth-container').classList.remove('hidden');
        
        // For demo purposes, let's simulate a successful login
        simulateLogin('demo@smartgrocer.com');
    }, 1500);
    
    // Toggle between login and registration forms
    document.getElementById('toggle-auth-mode').addEventListener('click', function(e) {
        e.preventDefault();
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleLink = document.getElementById('toggle-auth-mode');
        
        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            toggleLink.textContent = 'Need an account? Sign up';
        } else {
            login极速加速器.classList.add('hidden');
            registerForm.classList.remove('hidden');
            toggleLink.textContent = 'Already have an account? Sign in';
        }
    });
    
    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple validation
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        // Simulate successful login
        simulateLogin(email);
    });
    
    // Handle registration form submission
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill out all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Simulate successful registration
        simulateLogin(email);
    });
    
    // Google sign in
    document.getElementById('google-signin-btn').addEventListener('click', function() {
        simulateLogin('google-user@example.com');
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        document.getElementById('main-app-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        showNotification('You have been logged out', 'info');
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToPage(targetId);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        const sidebar = document.querySelector('aside');
        sidebar.classList.toggle('hidden');
    });
    
    // Quick expense form submission
    document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = document.getElementById('quick-amount').value;
        const description = document.getElementById('quick-description').value;
        const category = document.getElementById('quick-category').value;
        const account = document.getElementById('quick-account').value;
        
        if (!amount || !description || !category || !account) {
            showNotification('Please fill out all fields', 'error');
            return;
        }
        
        // Reset form
        this.reset();
        
        showNotification(`Added expense: $${amount} for ${description}`, 'success');
        
        // Update the expenses stat
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', '').replace(',', ''));
        const newExpenses = currentExpenses + parseFloat(amount);
        document.getElementById('total-expenses-stat').textContent = '$' + newExpenses.toFixed(2);
        
        // Update net worth
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        const newNetWorth = currentNetWorth - parseFloat(amount);
        document.getElementById('net-worth-stat').textContent = '$' + newNetWorth.toFixed(2);
    });
    
    // Tax estimation
    document.getElementById('estimate-tax-btn').addEventListener('click', function() {
        const income = document.getElementById('annual-income').value;
        const filingStatus = document.getElementById('filing-status').value;
        
        if (!income) {
            showNotification('Please enter your annual income', 'error');
            return;
        }
        
        const taxResult = document.getElementById('tax-result-container');
        const taxLoader = document.getElementById('tax-result-loader');
        const taxText = document.getElementById极速加速器'tax-result-text');
        
        taxResult.classList.remove('hidden');
        taxLoader.classList.remove('hidden');
        taxText.textContent = '';
        
        // Simulate calculation
        setTimeout(() => {
            taxLoader.classList.add('hidden');
            
            // Simple tax estimation logic (for demonstration only)
            const incomeNum = parseFloat(income);
            let taxAmount = 0;
            
            if (incomeNum <= 11000) {
                taxAmount = incomeNum * 0.10;
            } else if (incomeNum <= 44725) {
                taxAmount = 1100 + (incomeNum - 11000) * 0.12;
            } else if (incomeNum <= 95375) {
                taxAmount = 5147 + (incomeNum - 44725) * 0.22;
            } else if (incomeNum <= 182100) {
                taxAmount = 16290 + (incomeNum - 95375) * 0.24;
            } else if (incomeNum <= 231250) {
                taxAmount = 37104 + (incomeNum - 182100) * 0.32;
            } else if (incomeNum <= 578125) {
                taxAmount = 52832 + (incomeNum - 231250) * 0.35;
            } else {
                taxAmount = 174238.25 + (incomeNum - 578极速加速器) * 0.37;
            }
            
            // Adjust for filing status (simplified)
            if (filingStatus === 'Married filing jointly') {
                taxAmount *= 0.85;
            } else if (filingStatus === 'Head of household') {
                taxAmount *= 0.9;
            }
            
            taxText.textContent = `Based on your ${filingStatus.toLowerCase()} status and $${income} annual income, your estimated federal tax is approximately $${taxAmount.toFixed(2)}. This is a rough estimate and may not reflect your actual tax liability.`;
        }, 2000);
    });
    
    // AI report generation
    document.getElementById('generate-ai-report-btn').addEventListener('click', function() {
        const reportContainer = document.getElementById('ai-report-container');
        const reportLoader = document.getElementById('ai-report-loader');
        const reportContent = document.getElementById('ai-report-content');
        
        reportLoader.classList.remove('hidden');
        reportContent.innerHTML = '';
        
        // Simulate AI analysis
        setTimeout(() => {
            reportLoader.classList.add('hidden');
            
            // Sample AI report
            reportContent.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">Your Financial Health Report</h3>
                <p class="text-gray-700 mt-4">Based on your financial data, here's an analysis of your financial health:</p>
                
                <div class="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 class="font-semibold text-green-800">Strengths</h4>
                    <ul class="list-disc pl-5 mt-2 text-green-700">
                        <li>You're saving approximately 15% of your income, which is above the recommended 10%</li>
                        <li>Your emergency fund covers 3 months of expenses, meeting the basic recommendation</极速加速器>
                        <li>You have minimal high-interest debt</li>
                    </ul>
                </div>
                
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 class="font-semibold text-yellow-800">Areas for Improvement</h4>
                    <ul class="list-disc pl-5 mt-2 text-yellow-700">
                        <li>Your dining expenses are 25% higher than the average for your income level</li>
                        <li>You could benefit from increasing your retirement contributions</li>
                        <li>Consider diversifying your investment portfolio</li>
                    </ul>
                </div>
                
                <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-semibold text-blue-800">Recommendations</h4>
                    <ul class极速加速器list-disc pl-5 mt-2 text-blue-700">
                        <li>Set up automatic transfers to your savings account to increase your emergency fund to 6 months of expenses</li>
                        <li>Create a specific budget category for dining out and set a monthly limit</li>
                        <li>Consider opening a retirement account if you don't have one, or increase contributions to your existing one</li>
                        <li>Review your investment portfolio to ensure proper diversification</li>
                    </ul>
                </div>
                
                <p class="text-sm text-gray-500 mt-6">Disclaimer: This analysis is generated based on the data you've provided and should not be considered professional financial advice. Consult with a qualified financial advisor for personalized recommendations.</p>
            `;
        }, 3000);
    });
    
    // Initialize with dashboard page
    navigateToPage('dashboard');
    
    // Set dashboard as active nav link
    document.querySelector('a[href="#dashboard"]').classList.add('active');
    
    // Sample data for charts
    initializeSampleData();
});

function simulateLogin(email) {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app-container').classList.remove('hidden');
    document.getElementById('welcome-user-text').textContent = `Welcome, ${email.split('@')[0]}!`;
    showNotification('Login successful!', 'success');
}

function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    const navLink = document.querySelector(`a[href="#${pageId}"]`);
    
    if (navLink) {
        pageTitle.textContent = navLink.textContent;
    }
    
    // Close mobile menu if open
    if (window.innerWidth < 1024) {
        document.querySelector('aside').classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    const banner = document.getElementById('notification-banner');
    const notificationText = document.getElementById('notification-text');
    
    // Set message and style based on type
    notificationText.textContent = message;
    
    switch(type) {
        case 'success':
            banner.style.backgroundColor = '#228B22'; // Green
            break;
        case 'error':
            banner.style.backgroundColor = '#DC2626'; // Red
            break;
        case 'warning':
            banner.style.backgroundColor = '#D97706'; // Amber
            break;
        default:
            banner.style.backgroundColor = '#3B82F6'; // Blue
    }
    
    // Show the banner
    banner.style.transform = 'translateY(0)';
    
    // Hide after 5 seconds
    setTimeout(() => {
        banner.style.transform = 'translateY(-100%)';
    }, 5000);
}

function initializeSampleData() {
    // Sample spending chart
    const spendingCtx = document.getElementById('spending-doughnut-chart').getContext('2d');
    new Chart(spendingCtx, {
        type: 'doughnut',
        data: {
            labels: ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'],
            datasets: [{
                data: [500, 300, 150, 200, 100, 250, 80, 120],
                backgroundColor: [
                    '#228B22', '#3CB371', '#90EE90', '#98FB98', '#00FA9A', 
                    '#00FF7F', '#3CB371', '#2E8B57'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15
                    }
                }
            }
        }
    });
}
