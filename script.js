// Enhanced updateDashboard function with REAL data only
function updateDashboard() {
    try {
        // Load all data from localStorage
        const accounts = safeParseJSON(localStorage.getItem('smartgrocer-accounts') || '[]');
        const transactions = safeParseJSON(localStorage.getItem('smartgrocer-transactions') || '[]');
        const budgets = safeParseJSON(localStorage.getItem('smartgrocer-budgets') || '[]');
        
        console.log('Real User Data Loaded:', {
            accounts: accounts.length,
            transactions: transactions.length,
            budgets: budgets.length
        });
        
        // Calculate financial data from ACTUAL user data
        const financialData = calculateFinancialData(accounts, transactions, budgets);
        
        // Update dashboard with REAL data
        updateFinancialOverview(financialData);
        updateBudgetProgress(budgets, transactions);
        updateRecentTransactions(transactions);
        updateSpendingChart(transactions);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Error loading dashboard data. Please add your transactions.', 'error');
        // NO SAMPLE DATA - show empty state
        showEmptyDashboard();
    }
}

// Show empty dashboard when no data
function showEmptyDashboard() {
    const financialData = {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
        lastMonthData: {
            totalIncome: 0,
            totalExpenses: 0,
            savingsRate: 0
        }
    };
    
    updateFinancialOverview(financialData);
    
    // Show empty states for all sections
    document.getElementById('budget-progress-container').innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-chart-pie text-3xl mb-3 opacity-40"></i>
            <p>No budgets set yet</p>
            <button onclick="navigateToBudget()" class="mt-4 btn-primary text-white font-bold py-2 px-4 rounded-lg text-sm">
                Create Your First Budget
            </button>
        </div>
    `;
    
    document.getElementById('recent-transactions-container').innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-exchange-alt text-3xl mb-3 opacity-40"></i>
            <p>No transactions yet</p>
            <button onclick="navigateToExpense()" class="mt-4 btn-primary text-white font-bold py-2 px-4 rounded-lg text-sm">
                Add Your First Transaction
            </button>
        </div>
    `;
}

// Safe JSON parsing function
function safeParseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parsing error:', error);
        return [];
    }
}

// Calculate financial data from REAL user data only
function calculateFinancialData(accounts, transactions, budgets) {
    const currencyInfo = currencies[selectedCurrency];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate total balance from REAL accounts only
    const validAccounts = Array.isArray(accounts) ? accounts : [];
    const totalBalance = validAccounts
        .filter(account => account && account.currency === selectedCurrency)
        .reduce((total, account) => {
            const balance = parseFloat(account.balance) || 0;
            return total + balance;
        }, 0);

    // Calculate from REAL transactions only
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Current month transactions
    const currentMonthTransactions = validTransactions.filter(transaction => {
        if (!transaction || !transaction.date) return false;
        
        try {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        } catch (error) {
            console.error('Date parsing error:', error);
            return false;
        }
    });

    const totalIncome = currentMonthTransactions
        .filter(t => t && t.type === 'income' && t.currency === selectedCurrency)
        .reduce((total, t) => {
            const amount = parseFloat(t.amount) || 0;
            return total + amount;
        }, 0);

    const totalExpenses = currentMonthTransactions
        .filter(t => t && t.type === 'expense' && t.currency === selectedCurrency)
        .reduce((total, t) => {
            const amount = Math.abs(parseFloat(t.amount) || 0);
            return total + amount;
        }, 0);

    // Calculate REAL savings rate
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    // Last month data for comparison (from REAL transactions)
    const lastMonthTransactions = validTransactions.filter(transaction => {
        if (!transaction || !transaction.date) return false;
        
        try {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === lastMonth && 
                   transactionDate.getFullYear() === lastMonthYear;
        } catch (error) {
            console.error('Date parsing error:', error);
            return false;
        }
    });

    const lastMonthIncome = lastMonthTransactions
        .filter(t => t && t.type === 'income' && t.currency === selectedCurrency)
        .reduce((total, t) => {
            const amount = parseFloat(t.amount) || 0;
            return total + amount;
        }, 0);

    const lastMonthExpenses = lastMonthTransactions
        .filter(t => t && t.type === 'expense' && t.currency === selectedCurrency)
        .reduce((total, t) => {
            const amount = Math.abs(parseFloat(t.amount) || 0);
            return total + amount;
        }, 0);

    const lastMonthSavingsRate = lastMonthIncome > 0 ? 
        Math.round(((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100) : 0;

    return {
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate,
        lastMonthData: {
            totalIncome: lastMonthIncome,
            totalExpenses: lastMonthExpenses,
            savingsRate: lastMonthSavingsRate
        }
    };
}

// Update financial overview with REAL data
function updateFinancialOverview(data) {
    const currencyInfo = currencies[selectedCurrency];
    
    // Update balance
    const balanceElement = document.querySelector('[data-balance]');
    if (balanceElement) {
        balanceElement.textContent = `${currencyInfo.symbol}${data.totalBalance.toLocaleString()}`;
    }
    
    // Update income
    const incomeElement = document.querySelector('[data-income]');
    if (incomeElement) {
        incomeElement.textContent = `${currencyInfo.symbol}${data.totalIncome.toLocaleString()}`;
    }
    
    // Update expenses
    const expensesElement = document.querySelector('[data-expenses]');
    if (expensesElement) {
        expensesElement.textContent = `${currencyInfo.symbol}${data.totalExpenses.toLocaleString()}`;
    }
    
    // Update savings rate
    const savingsElement = document.querySelector('[data-savings]');
    if (savingsElement) {
        savingsElement.textContent = `${data.savingsRate}%`;
    }
}

// Update budget progress with REAL data
function updateBudgetProgress(budgets, transactions) {
    const container = document.getElementById('budget-progress-container');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const validBudgets = Array.isArray(budgets) ? budgets : [];
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    const filteredBudgets = validBudgets.filter(budget => 
        budget && budget.currency === selectedCurrency
    );
    
    if (filteredBudgets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-pie text-3xl mb-3 opacity-40"></i>
                <p>No budgets set yet</p>
                <button onclick="navigateToBudget()" class="mt-4 btn-primary text-white font-bold py-2 px-4 rounded-lg text-sm">
                    Create Your First Budget
                </button>
            </div>
        `;
        return;
    }
    
    const currencyInfo = currencies[selectedCurrency];
    
    container.innerHTML = filteredBudgets.map(budget => {
        const spent = validTransactions
            .filter(transaction => {
                if (!transaction || !transaction.date) return false;
                
                try {
                    const transactionDate = new Date(transaction.date);
                    return transaction.type === 'expense' && 
                           transaction.category === budget.category &&
                           transaction.currency === selectedCurrency &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                } catch (error) {
                    console.error('Date parsing error:', error);
                    return false;
                }
            })
            .reduce((total, transaction) => {
                const amount = Math.abs(parseFloat(transaction.amount) || 0);
                return total + amount;
            }, 0);
        
        const budgetAmount = parseFloat(budget.amount) || 0;
        const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
        const progressColor = percentage > 90 ? 'bg-red-500' : 
                           percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';
        
        return `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-700">${budget.name || 'Unnamed Budget'}</span>
                    <span class="text-sm text-gray-500">${currencyInfo.symbol}${spent.toFixed(0)} / ${currencyInfo.symbol}${budgetAmount}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full ${progressColor}" style="width: ${percentage}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${percentage.toFixed(1)}% used</span>
                    <span>${currencyInfo.symbol}${(budgetAmount - spent).toFixed(0)} remaining</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update recent transactions with REAL data
function updateRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions-container');
    
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Get ALL transactions (not limited to 7 days) for better user experience
    const recentTransactions = validTransactions
        .filter(transaction => transaction && transaction.currency === selectedCurrency)
        .sort((a, b) => {
            try {
                return new Date(b.date) - new Date(a.date);
            } catch (error) {
                return 0;
            }
        })
        .slice(0, 10); // Show 10 most recent

    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exchange-alt text-3xl mb-3 opacity-40"></i>
                <p>No transactions yet</p>
                <button onclick="navigateToExpense()" class="mt-4 btn-primary text-white font-bold py-2 px-4 rounded-lg text-sm">
                    Add Your First Transaction
                </button>
            </div>
        `;
        return;
    }
    
    const currencyInfo = currencies[selectedCurrency];
    
    container.innerHTML = recentTransactions.map(transaction => {
        const isExpense = transaction.type === 'expense';
        const amountClass = isExpense ? 'text-red-500' : 'text-green-500';
        const amountSign = isExpense ? '-' : '+';
        const absoluteAmount = Math.abs(parseFloat(transaction.amount) || 0);
        
        const iconClass = getTransactionIcon(transaction.category);
        const timeAgo = getTimeAgo(new Date(transaction.date));
        
        return `
            <div class="transaction-item flex justify-between items-center p-3 rounded-lg border border-gray-100 mb-2 bg-white shadow-sm">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 ${iconClass.bg} rounded-full flex items-center justify-center">
                        <i class="${iconClass.icon} ${iconClass.color}"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${transaction.description || transaction.category || 'Transaction'}</p>
                        <p class="text-gray-500 text-xs">${transaction.category || 'Uncategorized'} • ${timeAgo}</p>
                    </div>
                </div>
                <span class="${amountClass} font-bold">${amountSign}${currencyInfo.symbol}${absoluteAmount.toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

// Update spending chart with REAL data
function updateSpendingChart(transactions) {
    const container = document.getElementById('spending-chart-container');
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    const currentMonthTransactions = validTransactions.filter(transaction => {
        if (!transaction || !transaction.date) return false;
        
        const transactionDate = new Date(transaction.date);
        const currentDate = new Date();
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear() &&
               transaction.type === 'expense' &&
               transaction.currency === selectedCurrency;
    });
    
    if (currentMonthTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-bar text-3xl mb-3 opacity-40"></i>
                <p>No spending data this month</p>
            </div>
        `;
        return;
    }
    
    // Group by category and calculate totals
    const categoryTotals = {};
    currentMonthTransactions.forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        const amount = Math.abs(parseFloat(transaction.amount) || 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
    
    // Create chart HTML
    const currencyInfo = currencies[selectedCurrency];
    const chartHTML = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .map(([category, amount]) => {
            const percentage = (amount / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100;
            const iconClass = getTransactionIcon(category);
            
            return `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 ${iconClass.bg} rounded-full flex items-center justify-center">
                            <i class="${iconClass.icon} ${iconClass.color} text-xs"></i>
                        </div>
                        <span class="font-medium text-gray-700">${category}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="w-32 bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full bg-blue-500" style="width: ${percentage}%"></div>
                        </div>
                        <span class="font-bold text-gray-900 w-20 text-right">${currencyInfo.symbol}${amount.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    
    container.innerHTML = chartHTML;
}

// Navigation functions
function navigateToBudget() {
    window.location.href = 'budget.html';
}

function navigateToExpense() {
    window.location.href = 'expense.html';
}

function navigateToIncome() {
    window.location.href = 'income.html';
}

// Auto-refresh dashboard when data changes
function setupDataListeners() {
    // Refresh dashboard when storage changes (from other tabs/windows)
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('smartgrocer-')) {
            updateDashboard();
        }
    });
    
    // Custom event for data changes within same tab
    window.addEventListener('dataChanged', function() {
        updateDashboard();
    });
}

// Trigger data change event (call this when adding/editing transactions)
function triggerDataUpdate() {
    const event = new CustomEvent('dataChanged');
    window.dispatchEvent(event);
    updateDashboard(); // Immediate update
}

// Initialize dashboard with auto-update
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard(); // Initial load
    setupDataListeners(); // Setup auto-update listeners
    
    // Auto-refresh every 30 seconds for real-time feel
    setInterval(updateDashboard, 30000);
});

// Utility function to get time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

// Transaction icon mapping
function getTransactionIcon(category) {
    const icons = {
        'Food & Dining': { icon: 'fas fa-utensils', bg: 'bg-orange-100', color: 'text-orange-600' },
        'Shopping': { icon: 'fas fa-shopping-bag', bg: 'bg-blue-100', color: 'text-blue-600' },
        'Transport': { icon: 'fas fa-bus', bg: 'bg-green-100', color: 'text-green-600' },
        'Entertainment': { icon: 'fas fa-film', bg: 'bg-purple-100', color: 'text-purple-600' },
        'Bills': { icon: 'fas fa-file-invoice', bg: 'bg-red-100', color: 'text-red-600' },
        'Healthcare': { icon: 'fas fa-heartbeat', bg: 'bg-pink-100', color: 'text-pink-600' },
        'Salary': { icon: 'fas fa-money-check', bg: 'bg-green-100', color: 'text-green-600' },
        'Investment': { icon: 'fas fa-chart-line', bg: 'bg-teal-100', color: 'text-teal-600' }
    };
    
    return icons[category] || { icon: 'fas fa-wallet', bg: 'bg-gray-100', color: 'text-gray-600' };
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification implementation
    console.log(`${type.toUpperCase()}: ${message}`);
}
