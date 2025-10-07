// script.js - Fixed Navigation Version

// Global variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let userName = localStorage.getItem('userName') || 'User';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing app...');
    console.log('Current page:', getCurrentPage());
    console.log('User name:', userName);
    
    // Check if we're on the sign-in page or other pages
    const currentPage = getCurrentPage();
    
    if (currentPage === 'index.html' || currentPage === '') {
        console.log('On sign-in page');
        setupSignInPage();
    } else {
        console.log('On app page:', currentPage);
        // Check if user is signed in
        if (!userName || userName === 'User') {
            console.log('User not signed in, redirecting to index');
            // Not signed in, redirect to sign-in page
            window.location.href = 'index.html';
            return;
        }
        // User is signed in, initialize the page
        console.log('User signed in, initializing page');
        initializePage();
        setupEventListeners();
        loadInitialData();
    }
}

// Setup sign-in page
function setupSignInPage() {
    console.log('Setting up sign-in page');
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
        console.log('Sign-in form event listener added');
    }
    
    // Focus on the name input
    const nameInput = document.getElementById('signin-name');
    if (nameInput) {
        nameInput.focus();
    }
}

// Handle sign in
function handleSignIn(e) {
    e.preventDefault();
    console.log('Sign-in form submitted');
    
    const nameInput = document.getElementById('signin-name');
    const name = nameInput.value.trim();
    
    if (name) {
        userName = name;
        localStorage.setItem('userName', userName);
        console.log('User name saved:', userName);
        
        // Show success notification
        showNotification(`Welcome ${name}! Redirecting to dashboard...`, 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification('Please enter your name to continue', 'error');
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    console.log('Path:', path, 'Page:', page);
    
    if (page === '' || page === 'index.html' || path.endsWith('/')) {
        return 'index.html';
    }
    return page;
}

// Initialize page-specific functionality
function initializePage() {
    const currentPage = getCurrentPage();
    console.log('Initializing page:', currentPage);
    
    switch(currentPage) {
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'income.html':
            initializeIncomePage();
            break;
        case 'expense.html':
            initializeExpensePage();
            break;
        case 'accounts.html':
            initializeAccountsPage();
            break;
        case 'budget.html':
            initializeBudgetPage();
            break;
        case 'reports.html':
            initializeReportsPage();
            break;
        case 'blogs.html':
            initializeBlogPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
        case 'settings.html':
            initializeSettingsPage();
            break;
        default:
            console.log('Unknown page:', currentPage);
    }
    
    updateUserWelcome();
}

// Update user welcome message
function updateUserWelcome() {
    const welcomeText = document.getElementById('welcome-user-text');
    const userInitial = document.getElementById('user-initial');
    
    if (welcomeText) {
        welcomeText.textContent = `Welcome, ${userName}!`;
    }
    
    if (userInitial && userName) {
        userInitial.textContent = userName.charAt(0).toUpperCase();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }

    // Sidebar overlay
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }

    // FAB Add Transaction
    const fabButton = document.getElementById('fab-add-transaction');
    if (fabButton) {
        fabButton.addEventListener('click', showAddTransactionModal);
    }

    // Page-specific event listeners
    setupPageSpecificEventListeners();
}

// Setup page-specific event listeners
function setupPageSpecificEventListeners() {
    const currentPage = getCurrentPage();
    console.log('Setting up page-specific listeners for:', currentPage);
    
    switch(currentPage) {
        case 'dashboard.html':
            // Dashboard doesn't need additional event listeners
            break;
        case 'accounts.html':
            const addAccountBtn = document.getElementById('add-account-btn');
            if (addAccountBtn) {
                addAccountBtn.addEventListener('click', showAddAccountModal);
            }
            break;
        case 'budget.html':
            const addBudgetBtn = document.getElementById('add-budget-btn');
            if (addBudgetBtn) {
                addBudgetBtn.addEventListener('click', showAddBudgetModal);
            }
            break;
        case 'reports.html':
            const filterReportsBtn = document.getElementById('filter-reports-btn');
            const resetReportsBtn = document.getElementById('reset-reports-btn');
            
            if (filterReportsBtn) {
                filterReportsBtn.addEventListener('click', filterReports);
            }
            if (resetReportsBtn) {
                resetReportsBtn.addEventListener('click', resetReports);
            }
            break;
        case 'contact.html':
            const contactForm = document.querySelector('#contact form');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactForm);
            }
            break;
        case 'settings.html':
            const resetDataBtn = document.getElementById('reset-data-btn');
            if (resetDataBtn) {
                resetDataBtn.addEventListener('click', resetAllData);
            }
            break;
    }
}

// Load initial data
function loadInitialData() {
    console.log('Loading initial data');
    // Load transactions, accounts, budgets from localStorage
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    
    console.log('Transactions:', transactions.length);
    console.log('Accounts:', accounts.length);
    console.log('Budgets:', budgets.length);
    
    // If no accounts exist, create default account
    if (accounts.length === 0) {
        accounts.push({
            id: generateId(),
            name: 'Cash',
            type: 'cash',
            balance: 0,
            color: '#3B82F6'
        });
        saveAccounts();
        console.log('Default cash account created');
    }
}

// ===== DASHBOARD PAGE =====
function initializeDashboard() {
    console.log('Initializing dashboard');
    updateDashboardStats();
    updateEnhancedDashboardMetrics();
    renderRecentTransactions();
    renderDashboardCharts();
}

function updateDashboardStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;
    
    const totalIncomeElem = document.getElementById('total-income-stat');
    const totalExpensesElem = document.getElementById('total-expenses-stat');
    const netBalanceElem = document.getElementById('net-balance-stat');
    
    if (totalIncomeElem) totalIncomeElem.textContent = `₨${totalIncome.toFixed(2)}`;
    if (totalExpensesElem) totalExpensesElem.textContent = `₨${totalExpenses.toFixed(2)}`;
    if (netBalanceElem) netBalanceElem.textContent = `₨${netBalance.toFixed(2)}`;
}

// Enhanced dashboard metrics
function updateEnhancedDashboardMetrics() {
    // Total accounts count
    const totalAccountsElem = document.getElementById('total-accounts-count');
    if (totalAccountsElem) {
        totalAccountsElem.textContent = accounts.length;
    }
    
    // Active budgets count
    const activeBudgetsElem = document.getElementById('active-budgets-count');
    if (activeBudgetsElem) {
        activeBudgetsElem.textContent = budgets.length;
    }
    
    // This month income and expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthIncome = transactions
        .filter(t => t.type === 'income' && 
                    new Date(t.date).getMonth() === currentMonth &&
                    new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = transactions
        .filter(t => t.type === 'expense' && 
                    new Date(t.date).getMonth() === currentMonth &&
                    new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthIncomeElem = document.getElementById('month-income');
    const monthExpensesElem = document.getElementById('month-expenses');
    
    if (monthIncomeElem) monthIncomeElem.textContent = `₨${monthIncome.toFixed(2)}`;
    if (monthExpensesElem) monthExpensesElem.textContent = `₨${monthExpenses.toFixed(2)}`;
}

function renderRecentTransactions() {
    const container = document.getElementById('recent-transactions-list');
    if (!container) return;
    
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No transactions yet. Add your first transaction to get started!</p>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
        
        transactionEl.innerHTML = `
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mr-3">
                    <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'}"></i>
                </div>
                <div>
                    <p class="font-medium">${transaction.description}</p>
                    <p class="text-sm text-gray-500">${formatDate(transaction.date)} • ${transaction.category}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold">
                    ${transaction.type === 'income' ? '+' : '-'}₨${transaction.amount.toFixed(2)}
                </p>
                <p class="text-sm text-gray-500">${getAccountName(transaction.accountId)}</p>
            </div>
        `;
        
        container.appendChild(transactionEl);
    });
}

function renderDashboardCharts() {
    const expenseChartCanvas = document.getElementById('dashboard-expense-chart');
    if (!expenseChartCanvas) return;
    
    const expenseData = calculateExpenseByCategory();
    
    // Destroy existing chart if it exists
    if (expenseChartCanvas.chart) {
        expenseChartCanvas.chart.destroy();
    }
    
    const ctx = expenseChartCanvas.getContext('2d');
    expenseChartCanvas.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: [
                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function calculateExpenseByCategory() {
    const expenseData = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
            if (expenseData[transaction.category]) {
                expenseData[transaction.category] += transaction.amount;
            } else {
                expenseData[transaction.category] = transaction.amount;
            }
        });
    
    return expenseData;
}

function getAccountName(accountId) {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
}

// ===== EVENT HANDLERS =====
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
}

function showAddTransactionModal() {
    const currentPage = getCurrentPage();
    
    if (currentPage === 'income.html') {
        showAddIncomeModal();
    } else if (currentPage === 'expense.html') {
        showAddExpenseModal();
    } else {
        // Default to expense modal for other pages
        showAddExpenseModal();
    }
}

function showAddIncomeModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg w-full max-w-md">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">Add Income</h3>
                    <form id="add-income-form">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" id="income-description" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Salary, Bonus, etc." required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" id="income-amount" step="0.01" min="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="income-category" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="Salary">Salary</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Investment">Investment</option>
                                <option value="Gift">Gift</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="income-date" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account</label>
                            <select id="income-account" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Add Income</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // Set today's date as default
    document.getElementById('income-date').valueAsDate = new Date();
    
    // Add form submit handler
    document.getElementById('add-income-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addIncomeTransaction();
    });
}

function showAddExpenseModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg w-full max-w-md">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">Add Expense</h3>
                    <form id="add-expense-form">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" id="expense-description" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Groceries, Rent, etc." required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" id="expense-amount" step="0.01" min="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="expense-category" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="Food & Dining">Food & Dining</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Bills & Utilities">Bills & Utilities</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="expense-date" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account</label>
                            <select id="expense-account" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Add Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // Set today's date as default
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Add form submit handler
    document.getElementById('add-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addExpenseTransaction();
    });
}

function showModal(html) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = html;
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.textContent = message;
    notification.className = `notification ${colors[type] || colors.info} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Make functions globally available for HTML onclick handlers
window.closeModal = closeModal;
window.showAddTransactionModal = showAddTransactionModal;

// Stub functions for other pages (you can expand these)
function initializeIncomePage() {
    console.log('Income page initialized');
    updateUserWelcome();
}

function initializeExpensePage() {
    console.log('Expense page initialized');
    updateUserWelcome();
}

function initializeAccountsPage() {
    console.log('Accounts page initialized');
    updateUserWelcome();
}

function initializeBudgetPage() {
    console.log('Budget page initialized');
    updateUserWelcome();
}

function initializeReportsPage() {
    console.log('Reports page initialized');
    updateUserWelcome();
}

function initializeBlogPage() {
    console.log('Blog page initialized');
    updateUserWelcome();
}

function initializeContactPage() {
    console.log('Contact page initialized');
    updateUserWelcome();
}

function initializeSettingsPage() {
    console.log('Settings page initialized');
    updateUserWelcome();
}

function filterReports() {
    showNotification('Reports filtered', 'success');
}

function resetReports() {
    showNotification('Reports reset', 'info');
}

function handleContactForm(e) {
    e.preventDefault();
    showNotification('Message sent successfully!', 'success');
    e.target.reset();
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data?')) {
        localStorage.clear();
        showNotification('All data reset', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function addIncomeTransaction() {
    showNotification('Income added successfully', 'success');
    closeModal();
}

function addExpenseTransaction() {
    showNotification('Expense added successfully', 'success');
    closeModal();
}

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}
