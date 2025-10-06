// script.js - Complete Implementation for Multi-Page SmartGrocer App

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

// ===== INCOME PAGE =====
function initializeIncomePage() {
    renderIncomeTable();
    addSearchFilter('income');
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
            row.className = 'border-b hover:bg-gray-50';
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
                    <button class="text-red-500 hover:text-red-700 delete-transaction" data-id="${transaction.id}" title="Delete Transaction">
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
    addSearchFilter('expense');
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
            row.className = 'border-b hover:bg-gray-50';
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
                    <button class="text-red-500 hover:text-red-700 delete-transaction" data-id="${transaction.id}" title="Delete Transaction">
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
    setupAccountTransfers();
}

function renderAccounts() {
    const container = document.getElementById('accounts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (accounts.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500"><p>No accounts yet. Create your first account to get started!</p></div>';
        return;
    }
    
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
                <button class="text-red-500 hover:text-red-700 delete-account" data-id="${account.id}" title="Delete Account">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="text-right">
                <p class="text-2xl font-bold ${accountBalance >= 0 ? 'text-gray-800' : 'text-red-600'}">₨${accountBalance.toFixed(2)}</p>
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

function setupAccountTransfers() {
    const container = document.getElementById('accounts-container');
    if (!container) return;
    
    // Add transfer section to the accounts container
    const transferSection = document.createElement('div');
    transferSection.className = 'card p-6 col-span-1 md:col-span-2 transfer-section';
    transferSection.innerHTML = `
        <h4 class="text-lg font-semibold mb-4">Transfer Between Accounts</h4>
        <form id="transfer-form" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                <select id="from-account" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                    ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                <select id="to-account" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                    ${accounts.map(account => `<option value="${account.id}">${account.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" id="transfer-amount" step="0.01" min="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00" required>
            </div>
            <div>
                <button type="submit" class="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Transfer
                </button>
            </div>
        </form>
    `;
    
    container.appendChild(transferSection);
    
    // Add form submit handler
    document.getElementById('transfer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processAccountTransfer();
    });
}

function processAccountTransfer() {
    const fromAccountId = document.getElementById('from-account').value;
    const toAccountId = document.getElementById('to-account').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    
    if (fromAccountId === toAccountId) {
        showNotification('Cannot transfer to the same account', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Amount must be greater than zero', 'error');
        return;
    }
    
    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const fromAccountBalance = calculateAccountBalance(fromAccountId);
    
    if (fromAccountBalance < amount) {
        showNotification('Insufficient balance in source account', 'error');
        return;
    }
    
    // Create transfer transactions
    const transferOut = {
        id: generateId(),
        type: 'expense',
        description: `Transfer to ${accounts.find(a => a.id === toAccountId).name}`,
        amount,
        category: 'Transfer',
        date: new Date().toISOString().split('T')[0],
        accountId: fromAccountId,
        isTransfer: true,
        transferTo: toAccountId,
        createdAt: new Date().toISOString()
    };
    
    const transferIn = {
        id: generateId(),
        type: 'income',
        description: `Transfer from ${fromAccount.name}`,
        amount,
        category: 'Transfer',
        date: new Date().toISOString().split('T')[0],
        accountId: toAccountId,
        isTransfer: true,
        transferFrom: fromAccountId,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transferOut, transferIn);
    saveTransactions();
    
    document.getElementById('transfer-form').reset();
    showNotification('Transfer completed successfully', 'success');
    
    // Refresh accounts display
    renderAccounts();
}

// ===== BUDGET PAGE =====
function initializeBudgetPage() {
    renderBudgets();
}

function renderBudgets() {
    const container = document.getElementById('budgets-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (budgets.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500"><p>No budgets yet. Create your first budget to track spending!</p></div>';
        return;
    }
    
    budgets.forEach(budget => {
        const spentAmount = calculateSpentInCategory(budget.category);
        const progressPercentage = Math.min((spentAmount / budget.amount) * 100, 100);
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const currentDay = new Date().getDate();
        const expectedProgress = (currentDay / daysInMonth) * 100;
        
        const budgetEl = document.createElement('div');
        budgetEl.className = `card p-6 ${getBudgetStatusClass(progressPercentage, expectedProgress)}`;
        budgetEl.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-bold text-lg">${budget.category}</h4>
                    <p class="text-gray-500">Monthly Budget</p>
                </div>
                <button class="text-red-500 hover:text-red-700 delete-budget" data-id="${budget.id}" title="Delete Budget">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-1">
                    <span>₨${spentAmount.toFixed(2)} spent</span>
                    <span>₨${budget.amount.toFixed(2)} budget</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div class="h-3 rounded-full progress-bar ${getProgressColor(progressPercentage, expectedProgress)}" 
                         style="width: ${progressPercentage}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                    <span>${progressPercentage.toFixed(1)}% used</span>
                    <span>${expectedProgress.toFixed(1)}% expected</span>
                </div>
            </div>
            <div class="text-right">
                <p class="text-lg font-semibold ${budget.amount - spentAmount < 0 ? 'text-red-600' : 'text-green-600'}">
                    ${budget.amount - spentAmount < 0 ? '-₨' : '₨'}${Math.abs(budget.amount - spentAmount).toFixed(2)} ${budget.amount - spentAmount < 0 ? 'Over' : 'Left'}
                </p>
                ${getBudgetStatusMessage(progressPercentage, expectedProgress)}
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

function getBudgetStatusClass(progress, expected) {
    if (progress > 100) return 'budget-status-danger';
    if (progress > expected + 15) return 'budget-status-warning';
    return 'budget-status-good';
}

function getProgressColor(progress, expected) {
    if (progress > 100) return 'bg-red-500';
    if (progress > expected + 15) return 'bg-yellow-500';
    if (progress > expected) return 'bg-orange-500';
    return 'bg-green-500';
}

function getBudgetStatusMessage(progress, expected) {
    if (progress > expected + 10) {
        return '<p class="text-sm text-yellow-600 mt-1">Spending faster than expected</p>';
    } else if (progress < expected - 10) {
        return '<p class="text-sm text-green-600 mt-1">Spending on track</p>';
    } else {
        return '<p class="text-sm text-blue-600 mt-1">Spending as expected</p>';
    }
}

// ===== REPORTS PAGE =====
function initializeReportsPage() {
    // Set default date range to current month
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startDateElem = document.getElementById('start-date');
    const endDateElem = document.getElementById('end-date');
    
    if (startDateElem) startDateElem.value = firstDay.toISOString().split('T')[0];
    if (endDateElem) endDateElem.value = lastDay.toISOString().split('T')[0];
    
    renderReportsCharts();
}

function renderReportsCharts(startDate, endDate) {
    // Income vs Expenses Chart
    const incomeExpenseChartCanvas = document.getElementById('reports-income-expense-chart');
    if (incomeExpenseChartCanvas) {
        const incomeExpenseData = calculateIncomeVsExpensesByDate(startDate, endDate);
        
        // Destroy existing chart if it exists
        if (incomeExpenseChartCanvas.chart) {
            incomeExpenseChartCanvas.chart.destroy();
        }
        
        const ctx = incomeExpenseChartCanvas.getContext('2d');
        incomeExpenseChartCanvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(incomeExpenseData.income),
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(incomeExpenseData.income),
                        backgroundColor: '#10B981',
                        borderColor: '#059669',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: Object.values(incomeExpenseData.expenses),
                        backgroundColor: '#EF4444',
                        borderColor: '#DC2626',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₨' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Expense Categories Chart
    const expenseCategoriesChartCanvas = document.getElementById('expense-categories-chart');
    if (expenseCategoriesChartCanvas) {
        const expenseData = calculateExpenseByCategoryByDate(startDate, endDate);
        
        // Destroy existing chart if it exists
        if (expenseCategoriesChartCanvas.chart) {
            expenseCategoriesChartCanvas.chart.destroy();
        }
        
        const ctx = expenseCategoriesChartCanvas.getContext('2d');
        expenseCategoriesChartCanvas.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(expenseData),
                datasets: [{
                    data: Object.values(expenseData),
                    backgroundColor: [
                        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
                        '#F97316', '#6366F1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ₨${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function filterReports() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showNotification('Start date cannot be after end date', 'error');
        return;
    }
    
    renderReportsCharts(startDate, endDate);
    showNotification('Reports filtered successfully', 'success');
}

function resetReports() {
    const startDateElem = document.getElementById('start-date');
    const endDateElem = document.getElementById('end-date');
    
    if (startDateElem) startDateElem.value = '';
    if (endDateElem) endDateElem.value = '';
    
    renderReportsCharts();
    showNotification('Reports reset to default view', 'info');
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
            excerpt: 'Learn how to cut your grocery bill without sacrificing quality or nutrition with these practical tips.',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-15',
            readTime: '5 min read'
        },
        {
            title: 'Understanding Your Spending Habits',
            excerpt: 'A comprehensive guide to analyzing where your money goes and how to make better financial decisions.',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-10',
            readTime: '7 min read'
        },
        {
            title: 'Budgeting for Beginners',
            excerpt: 'Start your financial journey with these simple budgeting techniques that actually work.',
            image: 'https://images.unsplash.com/photo-1554224154-26032ffc8dbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-05',
            readTime: '6 min read'
        },
        {
            title: 'How to Track Expenses Effectively',
            excerpt: 'Master the art of expense tracking with these proven methods and tools.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            date: '2024-01-01',
            readTime: '4 min read'
        }
    ];
    
    container.innerHTML = '';
    
    blogPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'card overflow-hidden hover:shadow-lg transition-shadow duration-300';
        postEl.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${post.title}</h3>
                <p class="text-gray-600 mb-4">${post.excerpt}</p>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        <span>${formatDate(post.date)}</span>
                        <span class="mx-2">•</span>
                        <span>${post.readTime}</span>
                    </div>
                    <button class="text-primary font-semibold hover:text-green-700 transition-colors">Read More</button>
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
    // Add export/import functionality
    const settingsCard = document.querySelector('#settings .card');
    if (settingsCard) {
        settingsCard.innerHTML += `
            <div class="mt-8 pt-6 border-t">
                <h4 class="text-lg font-semibold mb-4">Data Management</h4>
                <div class="space-y-4">
                    <div>
                        <p class="mb-2">Export your financial data as a backup file.</p>
                        <button id="export-data-btn" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors data-management-btn">
                            <i class="fas fa-download mr-2"></i>Export Data
                        </button>
                    </div>
                    <div>
                        <p class="mb-2">Import previously exported data.</p>
                        <input type="file" id="import-data-input" accept=".json" class="hidden">
                        <button onclick="document.getElementById('import-data-input').click()" class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors data-management-btn">
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
    } else if (currentPage ===
