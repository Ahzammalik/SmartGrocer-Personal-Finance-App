// script.js - Updated for Multi-Page Structure

// Global variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let userName = localStorage.getItem('userName') || 'User';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Check if user is signed in
    if (!userName || userName === 'User') {
        showSignInOverlay();
    } else {
        hideSignInOverlay();
        initializePage();
    }

    // Event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
}

// Show sign in overlay
function showSignInOverlay() {
    const signinOverlay = document.getElementById('signin-overlay');
    if (signinOverlay) {
        signinOverlay.classList.remove('hidden');
        document.getElementById('main-app-container').classList.add('hidden');
    }
}

// Hide sign in overlay
function hideSignInOverlay() {
    const signinOverlay = document.getElementById('signin-overlay');
    if (signinOverlay) {
        signinOverlay.classList.add('hidden');
        document.getElementById('main-app-container').classList.remove('hidden');
        updateUserWelcome();
    }
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

// Initialize page-specific functionality
function initializePage() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index.html':
        case '':
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
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

// Setup event listeners
function setupEventListeners() {
    // Sign in form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }

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
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Dashboard doesn't need additional event listeners
            break;
        case 'income.html':
            // Income page event listeners
            const addIncomeBtn = document.getElementById('add-income-btn');
            if (addIncomeBtn) {
                addIncomeBtn.addEventListener('click', showAddIncomeModal);
            }
            break;
        case 'expense.html':
            // Expense page event listeners
            const addExpenseBtn = document.getElementById('add-expense-btn');
            if (addExpenseBtn) {
                addExpenseBtn.addEventListener('click', showAddExpenseModal);
            }
            break;
        case 'accounts.html':
            // Accounts page event listeners
            const addAccountBtn = document.getElementById('add-account-btn');
            if (addAccountBtn) {
                addAccountBtn.addEventListener('click', showAddAccountModal);
            }
            break;
        case 'budget.html':
            // Budget page event listeners
            const addBudgetBtn = document.getElementById('add-budget-btn');
            if (addBudgetBtn) {
                addBudgetBtn.addEventListener('click', showAddBudgetModal);
            }
            break;
        case 'reports.html':
            // Reports page event listeners
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
            // Contact page event listeners
            const contactForm = document.querySelector('#contact form');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactForm);
            }
            break;
        case 'settings.html':
            // Settings page event listeners
            const resetDataBtn = document.getElementById('reset-data-btn');
            if (resetDataBtn) {
                resetDataBtn.addEventListener('click', resetAllData);
            }
            break;
    }
}

// Load initial data
function loadInitialData() {
    // Load transactions, accounts, budgets from localStorage
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    
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
    }
}

// ===== DASHBOARD PAGE =====
function initializeDashboard() {
    updateDashboardStats();
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

function renderRecentTransactions() {
    const container = document.getElementById('recent-transactions-list');
    if (!container) return;
    
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No transactions yet</p>';
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
                    <p class="text-sm text-gray-500">${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold">
                    ${transaction.type === 'income' ? '+' : '-'}₨${transaction.amount.toFixed(2)}
                </p>
                <p class="text-sm text-gray-500">${transaction.category}</p>
            </div>
        `;
        
        container.appendChild(transactionEl);
    });
}

function renderDashboardCharts() {
    const expenseChartCanvas = document.getElementById('dashboard-expense-chart');
    if (!expenseChartCanvas) return;
    
    const expenseData = calculateExpenseByCategory();
    
    const ctx = expenseChartCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: [
                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ===== INCOME PAGE =====
function initializeIncomePage() {
    renderIncomeTable();
}

function renderIncomeTable() {
    const tableBody = document.getElementById('income-table-body');
    if (!tableBody) return;
    
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    tableBody.innerHTML = '';
    
    if (incomeTransactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No income transactions yet</td></tr>';
        return;
    }
    
    incomeTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            row.innerHTML = `
                <td class="py-3">${formatDate(transaction.date)}</td>
                <td class="py-3">
                    <div>
                        <p class="font-medium">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${transaction.category}</p>
                    </div>
                </td>
                <td class="py-3 text-right text-green-600 font-semibold">+₨${transaction.amount.toFixed(2)}</td>
                <td class="py-3 text-center">
                    <button class="text-red-500 hover:text-red-700 delete-transaction" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-transaction').forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            deleteTransaction(transactionId);
        });
    });
}

// ===== EXPENSE PAGE =====
function initializeExpensePage() {
    renderExpenseTable();
}

function renderExpenseTable() {
    const tableBody = document.getElementById('expense-table-body');
    if (!tableBody) return;
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    tableBody.innerHTML = '';
    
    if (expenseTransactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No expense transactions yet</td></tr>';
        return;
    }
    
    expenseTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            row.innerHTML = `
                <td class="py-3">${formatDate(transaction.date)}</td>
                <td class="py-3">
                    <div>
                        <p class="font-medium">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${transaction.category}</p>
                    </div>
                </td>
                <td class="py-3 text-right text-red-600 font-semibold">-₨${transaction.amount.toFixed(2)}</td>
                <td class="py-3 text-center">
                    <button class="text-red-500 hover:text-red-700 delete-transaction" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-transaction').forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            deleteTransaction(transactionId);
        });
    });
}

// ===== ACCOUNTS PAGE =====
function initializeAccountsPage() {
    renderAccounts();
}

function renderAccounts() {
    const container = document.getElementById('accounts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    accounts.forEach(account => {
        const accountBalance = calculateAccountBalance(account.id);
        
        const accountEl = document.createElement('div');
        accountEl.className = 'card p-6';
        accountEl.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white mr-3" style="background-color: ${account.color}">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg">${account.name}</h4>
                        <p class="text-gray-500 capitalize">${account.type}</p>
                    </div>
                </div>
                <button class="text-red-500 delete-account" data-id="${account.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="text-right">
                <p class="text-2xl font-bold text-gray-800">₨${accountBalance.toFixed(2)}</p>
                <p class="text-sm text-gray-500">Current Balance</p>
            </div>
        `;
        
        container.appendChild(accountEl);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-account').forEach(button => {
        button.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            deleteAccount(accountId);
        });
    });
}

// ===== BUDGET PAGE =====
function initializeBudgetPage() {
    renderBudgets();
}

function renderBudgets() {
    const container = document.getElementById('budgets-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    budgets.forEach(budget => {
        const spentAmount = calculateSpentInCategory(budget.category);
        const progressPercentage = Math.min((spentAmount / budget.amount) * 100, 100);
        
        const budgetEl = document.createElement('div');
        budgetEl.className = 'card p-6';
        budgetEl.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-bold text-lg">${budget.category}</h4>
                    <p class="text-gray-500">Monthly Budget</p>
                </div>
                <button class="text-red-500 delete-budget" data-id="${budget.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-1">
                    <span>₨${spentAmount.toFixed(2)} spent</span>
                    <span>₨${budget.amount.toFixed(2)} budget</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full ${progressPercentage > 90 ? 'bg-red-500' : progressPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}" 
                         style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="text-right">
                <p class="text-lg font-semibold ${budget.amount - spentAmount < 0 ? 'text-red-600' : 'text-green-600'}">
                    ${budget.amount - spentAmount < 0 ? '-₨' : '₨'}${Math.abs(budget.amount - spentAmount).toFixed(2)} ${budget.amount - spentAmount < 0 ? 'Over' : 'Left'}
                </p>
            </div>
        `;
        
        container.appendChild(budgetEl);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-budget').forEach(button => {
        button.addEventListener('click', function() {
            const budgetId = this.getAttribute('data-id');
            deleteBudget(budgetId);
        });
    });
}

// ===== REPORTS PAGE =====
function initializeReportsPage() {
    renderReportsCharts();
}

function renderReportsCharts() {
    // Income vs Expenses Chart
    const incomeExpenseChartCanvas = document.getElementById('reports-income-expense-chart');
    if (incomeExpenseChartCanvas) {
        const incomeExpenseData = calculateIncomeVsExpenses();
        const ctx = incomeExpenseChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(incomeExpenseData.income),
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(incomeExpenseData.income),
                        backgroundColor: '#10B981'
                    },
                    {
                        label: 'Expenses',
                        data: Object.values(incomeExpenseData.expenses),
                        backgroundColor: '#EF4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Expense Categories Chart
    const expenseCategoriesChartCanvas = document.getElementById('expense-categories-chart');
    if (expenseCategoriesChartCanvas) {
        const expenseData = calculateExpenseByCategory();
        const ctx = expenseCategoriesChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(expenseData),
                datasets: [{
                    data: Object.values(expenseData),
                    backgroundColor: [
                        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
}

// ===== BLOG PAGE =====
function initializeBlogPage() {
    renderBlogPosts();
}

function renderBlogPosts() {
    const container = document.querySelector('#blog .grid');
    if (!container) return;
    
    const blogPosts = [
        {
            title: '5 Simple Ways to Save Money on Groceries',
            excerpt: 'Learn how to cut your grocery bill without sacrificing quality or nutrition.',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-15'
        },
        {
            title: 'Understanding Your Spending Habits',
            excerpt: 'A guide to analyzing where your money goes and how to make better financial decisions.',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-10'
        },
        {
            title: 'Budgeting for Beginners',
            excerpt: 'Start your financial journey with these simple budgeting techniques.',
            image: 'https://images.unsplash.com/photo-1554224154-26032ffc8dbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-05'
        },
        {
            title: 'How to Track Expenses Effectively',
            excerpt: 'Master the art of expense tracking with these proven methods.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-01'
        }
    ];
    
    container.innerHTML = '';
    
    blogPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'card overflow-hidden';
        postEl.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${post.title}</h3>
                <p class="text-gray-600 mb-4">${post.excerpt}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${formatDate(post.date)}</span>
                    <button class="text-primary font-semibold">Read More</button>
                </div>
            </div>
        `;
        container.appendChild(postEl);
    });
}

// ===== CONTACT PAGE =====
function initializeContactPage() {
    // Contact page is mostly static, no special initialization needed
}

// ===== SETTINGS PAGE =====
function initializeSettingsPage() {
    // Settings page initialization if needed
}

// ===== EVENT HANDLERS =====
function handleSignIn(e) {
    e.preventDefault();
    const nameInput = document.getElementById('signin-name');
    const name = nameInput.value.trim();
    
    if (name) {
        userName = name;
        localStorage.setItem('userName', userName);
        hideSignInOverlay();
        initializePage();
        showNotification('Welcome to SmartGrocer!', 'success');
    }
}

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
                            <input type="text" id="income-description" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" id="income-amount" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
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
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg">Add Income</button>
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
                            <input type="text" id="expense-description" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" id="expense-amount" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
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
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg">Add Expense</button>
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

function showAddAccountModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg w-full max-w-md">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">Add Account</h3>
                    <form id="add-account-form">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                            <input type="text" id="account-name" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                            <select id="account-type" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Account</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="digital">Digital Wallet</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                            <input type="number" id="account-balance" step="0.01" value="0" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="color" id="account-color" value="#3B82F6" class="w-full h-10 rounded-lg">
                        </div>
                        <div class="flex gap-3">
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg">Add Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // Add form submit handler
    document.getElementById('add-account-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addAccount();
    });
}

function showAddBudgetModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg w-full max-w-md">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">Create Budget</h3>
                    <form id="add-budget-form">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="budget-category" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
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
                            <label class="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                            <input type="number" id="budget-amount" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Period</label>
                            <select id="budget-period" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg">Create Budget</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // Add form submit handler
    document.getElementById('add-budget-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addBudget();
    });
}

function handleContactForm(e) {
    e.preventDefault();
    showNotification('Message sent successfully! We will get back to you soon.', 'success');
    e.target.reset();
}

function filterReports() {
    // Implementation for filtering reports
    showNotification('Reports filtered successfully', 'success');
}

function resetReports() {
    // Implementation for resetting reports
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    
    showNotification('Reports reset', 'info');
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.clear();
        transactions = [];
        accounts = [];
        budgets = [];
        userName = 'User';
        
        showNotification('All data has been reset', 'success');
        
        // Reload the page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// ===== DATA MANAGEMENT FUNCTIONS =====
function addIncomeTransaction() {
    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const category = document.getElementById('income-category').value;
    const date = document.getElementById('income-date').value;
    const accountId = document.getElementById('income-account').value;
    
    const transaction = {
        id: generateId(),
        type: 'income',
        description,
        amount,
        category,
        date,
        accountId,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    // Update account balance
    updateAccountBalance(accountId, amount);
    
    closeModal();
    showNotification('Income added successfully', 'success');
    
    // Refresh the page if we're on income page
    if (getCurrentPage() === 'income.html') {
        renderIncomeTable();
    } else {
        // Otherwise redirect to income page
        window.location.href = 'income.html';
    }
}

function addExpenseTransaction() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const accountId = document.getElementById('expense-account').value;
    
    const transaction = {
        id: generateId(),
        type: 'expense',
        description,
        amount,
        category,
        date,
        accountId,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    // Update account balance
    updateAccountBalance(accountId, -amount);
    
    closeModal();
    showNotification('Expense added successfully', 'success');
    
    // Refresh the page if we're on expense page
    if (getCurrentPage() === 'expense.html') {
        renderExpenseTable();
    } else {
        // Otherwise redirect to expense page
        window.location.href = 'expense.html';
    }
}

function addAccount() {
    const name = document.getElementById('account-name').value;
    const type = document.getElementById('account-type').value;
    const balance = parseFloat(document.getElementById('account-balance').value);
    const color = document.getElementById('account-color').value;
    
    const account = {
        id: generateId(),
        name,
        type,
        balance,
        color
    };
    
    accounts.push(account);
    saveAccounts();
    
    closeModal();
    showNotification('Account added successfully', 'success');
    
    // Refresh accounts page
    if (getCurrentPage() === 'accounts.html') {
        renderAccounts();
    }
}

function addBudget() {
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;
    
    const budget = {
        id: generateId(),
        category,
        amount,
        period,
        createdAt: new Date().toISOString()
    };
    
    budgets.push(budget);
    saveBudgets();
    
    closeModal();
    showNotification('Budget created successfully', 'success');
    
    // Refresh budgets page
    if (getCurrentPage() === 'budget.html') {
        renderBudgets();
    }
}

function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        const transaction = transactions.find(t => t.id === transactionId);
        
        // Update account balance (reverse the transaction)
        if (transaction) {
            const amountChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
            updateAccountBalance(transaction.accountId, amountChange);
        }
        
        transactions = transactions.filter(t => t.id !== transactionId);
        saveTransactions();
        
        showNotification('Transaction deleted', 'success');
        
        // Refresh the current page
        const currentPage = getCurrentPage();
        if (currentPage === 'income.html') {
            renderIncomeTable();
        } else if (currentPage === 'expense.html') {
            renderExpenseTable();
        } else if (currentPage === 'index.html' || currentPage === '') {
            updateDashboardStats();
            renderRecentTransactions();
        }
    }
}

function deleteAccount(accountId) {
    if (confirm('Are you sure you want to delete this account? All transactions associated with this account will also be deleted.')) {
        // Remove transactions associated with this account
        transactions = transactions.filter(t => t.accountId !== accountId);
        saveTransactions();
        
        // Remove the account
        accounts = accounts.filter(a => a.id !== accountId);
        saveAccounts();
        
        showNotification('Account deleted', 'success');
        
        // Refresh accounts page
        if (getCurrentPage() === 'accounts.html') {
            renderAccounts();
        }
    }
}

function deleteBudget(budgetId) {
    if (confirm('Are you sure you want to delete this budget?')) {
        budgets = budgets.filter(b => b.id !== budgetId);
        saveBudgets();
        
        showNotification('Budget deleted', 'success');
        
        // Refresh budgets page
        if (getCurrentPage() === 'budget.html') {
            renderBudgets();
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function calculateAccountBalance(accountId) {
    return transactions
        .filter(t => t.accountId === accountId)
        .reduce((balance, transaction) => {
            return transaction.type === 'income' 
                ? balance + transaction.amount 
                : balance - transaction.amount;
        }, 0);
}

function updateAccountBalance(accountId, amount) {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
        account.balance += amount;
        saveAccounts();
    }
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

function calculateIncomeVsExpenses() {
    const incomeData = {};
    const expenseData = {};
    
    // Group by month
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (transaction.type === 'income') {
            incomeData[monthKey] = (incomeData[monthKey] || 0) + transaction.amount;
        } else {
            expenseData[monthKey] = (expenseData[monthKey] || 0) + transaction.amount;
        }
    });
    
    return { income: incomeData, expenses: expenseData };
}

function calculateSpentInCategory(category) {
    return transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

function saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
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

// Update the initializeDashboard function
function initializeDashboard() {
    updateDashboardStats();
    updateEnhancedDashboardMetrics();
    renderRecentTransactions();
    renderDashboardCharts();
}

// Export data functionality
function exportData() {
    const data = {
        transactions,
        accounts,
        budgets,
        userName,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smartgrocer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Import data functionality
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all your current data. Are you sure?')) {
                if (data.transactions) transactions = data.transactions;
                if (data.accounts) accounts = data.accounts;
                if (data.budgets) budgets = data.budgets;
                if (data.userName) userName = data.userName;
                
                saveTransactions();
                saveAccounts();
                saveBudgets();
                localStorage.setItem('userName', userName);
                
                showNotification('Data imported successfully!', 'success');
                
                // Reload the current page to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            showNotification('Error importing data. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
}

// Add export/import to settings page
function initializeSettingsPage() {
    // Add export/import functionality
    const settingsCard = document.querySelector('#settings .card');
    if (settingsCard) {
        settingsCard.innerHTML += `
            <div class="mt-8 pt-6 border-t">
                <h4 class="text-lg font-semibold mb-4">Data Management</h4>
                <div class="space-y-4">
                    <div>
                        <p class="mb-2">Export your financial data as a backup file.</p>
                        <button id="export-data-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-download mr-2"></i>Export Data
                        </button>
                    </div>
                    <div>
                        <p class="mb-2">Import previously exported data.</p>
                        <input type="file" id="import-data-input" accept=".json" class="hidden">
                        <button onclick="document.getElementById('import-data-input').click()" class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                            <i class="fas fa-upload mr-2"></i>Import Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('export-data-btn').addEventListener('click', exportData);
        document.getElementById('import-data-input').addEventListener('change', importData);
    }
}
