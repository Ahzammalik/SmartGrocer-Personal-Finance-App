// Enhanced updateDashboard function with better error handling
function updateDashboard() {
    try {
        // Load all data from localStorage with better error handling
        const accounts = safeParseJSON(localStorage.getItem('smartgrocer-accounts') || '[]');
        const transactions = safeParseJSON(localStorage.getItem('smartgrocer-transactions') || '[]');
        const budgets = safeParseJSON(localStorage.getItem('smartgrocer-budgets') || '[]');
        
        console.log('Dashboard Data Loaded:', {
            accounts,
            transactions,
            budgets
        });
        
        // Calculate financial data from actual data
        const financialData = calculateFinancialData(accounts, transactions, budgets);
        
        // Update dashboard with real data
        updateFinancialOverview(financialData);
        updateBudgetProgress(budgets, transactions);
        updateRecentTransactions(transactions);
        updateSpendingChart(transactions);
        
        // Show success notification if data was loaded
        if (accounts.length > 0 || transactions.length > 0 || budgets.length > 0) {
            showNotification('Dashboard data synchronized successfully', 'success');
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Error loading dashboard data. Using sample data.', 'error');
        // Fallback to sample data
        loadSampleData();
    }
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

// Enhanced calculateFinancialData with better data validation
function calculateFinancialData(accounts, transactions, budgets) {
    const currencyInfo = currencies[selectedCurrency];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Validate and calculate total balance from accounts
    const validAccounts = Array.isArray(accounts) ? accounts : [];
    const totalBalance = validAccounts
        .filter(account => account && account.currency === selectedCurrency)
        .reduce((total, account) => {
            const balance = parseFloat(account.balance) || 0;
            return total + balance;
        }, 0);

    // Validate and filter transactions
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Calculate income and expenses for current month
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

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    // Calculate last month data for comparison
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

// Enhanced updateBudgetProgress with better validation
function updateBudgetProgress(budgets, transactions) {
    const container = document.getElementById('budget-progress-container');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Validate budgets array
    const validBudgets = Array.isArray(budgets) ? budgets : [];
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Filter budgets by selected currency
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
        // Calculate spent amount for this budget category in current month
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
            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-700">${budget.name || 'Unnamed Budget'}</span>
                    <span class="text-sm text-gray-500">${currencyInfo.symbol}${spent.toFixed(0)} / ${currencyInfo.symbol}${budgetAmount}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Enhanced updateRecentTransactions with better validation
function updateRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions-container');
    
    // Validate transactions array
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Get last 7 days transactions in selected currency, sorted by date
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentTransactions = validTransactions
        .filter(transaction => {
            if (!transaction || !transaction.date) return false;
            
            try {
                const transactionDate = new Date(transaction.date);
                return transactionDate >= oneWeekAgo && 
                       transaction.currency === selectedCurrency;
            } catch (error) {
                console.error('Date parsing error:', error);
                return false;
            }
        })
        .sort((a, b) => {
            try {
                return new Date(b.date) - new Date(a.date);
            } catch (error) {
                return 0;
            }
        })
        .slice(0, 5); // Show only 5 most recent

    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exchange-alt text-3xl mb-3 opacity-40"></i>
                <p>No recent transactions</p>
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
            <div class="transaction-item flex justify-between items-center p-3 rounded-lg border border-gray-100">
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

// Navigation helper functions
function navigateToBudget() {
    window.location.href = 'budget.html';
}

function navigateToExpense() {
    window.location.href = 'expense.html';
}

// Sample data for fallback
function loadSampleData() {
    const sampleTransactions = [
        {
            id: 1,
            type: 'income',
            amount: 5000,
            currency: selectedCurrency,
            category: 'Salary',
            description: 'Monthly Salary',
            date: new Date().toISOString()
        },
        {
            id: 2,
            type: 'expense',
            amount: 150,
            currency: selectedCurrency,
            category: 'Food & Dining',
            description: 'Grocery Shopping',
            date: new Date().toISOString()
        }
    ];
    
    const sampleBudgets = [
        {
            id: 1,
            name: 'Monthly Food',
            category: 'Food & Dining',
            amount: 500,
            currency: selectedCurrency
        }
    ];
    
    const sampleAccounts = [
        {
            id: 1,
            name: 'Main Account',
            balance: 4850,
            currency: selectedCurrency
        }
    ];
    
    // Update dashboard with sample data
    const financialData = calculateFinancialData(sampleAccounts, sampleTransactions, sampleBudgets);
    updateFinancialOverview(financialData);
    updateBudgetProgress(sampleBudgets, sampleTransactions);
    updateRecentTransactions(sampleTransactions);
    updateSpendingChart(sampleTransactions);
}

// Enhanced auto-update with data validation
function autoUpdateDashboard() {
    const updateIndicator = document.getElementById('auto-update-indicator');
    updateIndicator.classList.add('animate-pulse');
    
    setTimeout(() => {
        updateDashboard();
        updateIndicator.classList.remove('animate-pulse');
    }, 1000);
}

// Add data refresh button to header (optional enhancement)
function addRefreshButton() {
    const header = document.querySelector('header .flex-1');
    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshButton.className = 'ml-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors';
    refreshButton.title = 'Refresh Dashboard Data';
    refreshButton.onclick = updateDashboard;
    
    header.appendChild(refreshButton);
}

// Initialize enhanced dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    // Add refresh button after dashboard is initialized
    setTimeout(addRefreshButton, 1000);
});
