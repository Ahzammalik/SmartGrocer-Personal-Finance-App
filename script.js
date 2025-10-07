// script.js - Core functionality

// Global data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

// Initialize dashboard
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
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-receipt text-4xl mb-2 opacity-50"></i>
                <p>No transactions yet</p>
            </div>
        `;
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
                    position: 'bottom'
                }
            }
        }
    });
}

// Utility functions
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Modal functions
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
                        <div class="flex gap-3">
                            <button type="button" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Add Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
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

function addExpenseTransaction() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    
    const transaction = {
        id: Date.now().toString(),
        type: 'expense',
        description,
        amount,
        category,
        date: new Date().toISOString().split('T')[0],
        accountId: 'default',
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    closeModal();
    showNotification('Expense added successfully', 'success');
    
    // Refresh dashboard
    initializeDashboard();
}

// Notification function
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
