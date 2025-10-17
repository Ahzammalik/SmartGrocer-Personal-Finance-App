// Utility function for safe JSON parsing
function safeParseJSON(jsonString) {
    try {
        return jsonString ? JSON.parse(jsonString) : [];
    } catch (error) {
        console.error('❌ JSON parsing error:', error);
        return [];
    }
}

// Enhanced updateDashboard function with PROPER BALANCE CALCULATION
function updateDashboard() {
    try {
        // Load all data from localStorage - CONSISTENT KEYS
        const accounts = safeParseJSON(localStorage.getItem('smartgrocer-accounts') || '[]');
        const expenses = safeParseJSON(localStorage.getItem('expenses') || '[]');
        const income = safeParseJSON(localStorage.getItem('income') || '[]');
        const budgets = safeParseJSON(localStorage.getItem('smartgrocer-budgets') || '[]');
        
        // Combine expenses and income into transactions for dashboard
        const transactions = [...expenses, ...income];
        
        console.log('Real User Data Loaded:', {
            accounts: accounts.length,
            expenses: expenses.length,
            income: income.length,
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

// CORRECTED: Calculate financial data with proper balance calculation
function calculateFinancialData(accounts, transactions, budgets) {
    const currency = localStorage.getItem('selectedCurrency') || 'PKR';
    const currencySymbol = getCurrencySymbol(currency);
    
    console.log('🧮 Calculating financial data from:', {
        transactions: transactions.length,
        accounts: accounts.length
    });

    // Calculate TOTAL INCOME from all income transactions
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + (parseFloat(t.amount) || 0), 0);

    // Calculate TOTAL EXPENSES from all expense transactions
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + Math.abs(parseFloat(t.amount) || 0), 0);

    // TOTAL BALANCE = TOTAL INCOME - TOTAL EXPENSES (Remaining Cash)
    const totalBalance = totalIncome - totalExpenses;

    // Calculate monthly data for current month only
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(transaction => {
        try {
            const transactionDate = new Date(transaction.date || transaction.timestamp);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        } catch (error) {
            return false;
        }
    });

    const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + (parseFloat(t.amount) || 0), 0);

    const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + Math.abs(parseFloat(t.amount) || 0), 0);

    const savingsRate = monthlyIncome > 0 ? 
        Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

    const result = {
        totalBalance, // This is now calculated as total income minus total expenses
        totalIncome: monthlyIncome, // Show current month income
        totalExpenses: monthlyExpenses, // Show current month expenses
        savingsRate,
        currency: currency,
        symbol: currencySymbol
    };

    console.log('📊 Financial data calculated:', result);
    return result;
}

// Update financial overview on dashboard
function updateFinancialOverview(data) {
    console.log('💰 Updating financial overview:', data);
    
    // Format numbers with proper currency symbol
    document.getElementById('total-balance').textContent = `${data.symbol}${data.totalBalance.toLocaleString()}`;
    document.getElementById('total-income').textContent = `${data.symbol}${data.totalIncome.toLocaleString()}`;
    document.getElementById('total-expenses').textContent = `${data.symbol}${data.totalExpenses.toLocaleString()}`;
    document.getElementById('savings-rate').textContent = `${Math.max(data.savingsRate, 0)}%`;
}

// Update budget progress
function updateBudgetProgress(budgets, transactions) {
    const container = document.getElementById('budget-progress-container');
    if (!container) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currencySymbol = getCurrencySymbol();

    const filteredBudgets = budgets; // All budgets since we're not filtering by currency
    
    if (filteredBudgets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-pie text-3xl mb-3 opacity-40"></i>
                <p>No budgets set yet</p>
                <p class="text-sm mt-2">Create budgets to track your spending limits</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBudgets.map(budget => {
        const spent = transactions
            .filter(transaction => {
                try {
                    const transactionDate = new Date(transaction.date || transaction.timestamp);
                    return transaction.type === 'expense' && 
                           transaction.category === budget.category &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                } catch (error) {
                    return false;
                }
            })
            .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
        
        const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
        const progressColor = percentage > 90 ? 'bg-red-500' : 
                           percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';
        
        return `
            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-700">${budget.name}</span>
                    <span class="text-sm text-gray-500">${currencySymbol}${spent.toFixed(0)} / ${currencySymbol}${budget.amount}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Update recent transactions
function updateRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions-container');
    if (!container) {
        console.log('❌ Recent transactions container not found');
        return;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentTransactions = transactions
        .filter(transaction => {
            try {
                const transactionDate = new Date(transaction.date || transaction.timestamp);
                return transactionDate >= oneWeekAgo;
            } catch (error) {
                return false;
            }
        })
        .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))
        .slice(0, 5);

    const currencySymbol = getCurrencySymbol();

    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exchange-alt text-3xl mb-3 opacity-40"></i>
                <p>No recent transactions</p>
                <p class="text-sm mt-2">Add some income or expenses to see them here!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentTransactions.map(transaction => {
        const isExpense = transaction.type === 'expense';
        const amountClass = isExpense ? 'text-red-500' : 'text-green-500';
        const amountSign = isExpense ? '-' : '+';
        const absoluteAmount = Math.abs(transaction.amount);
        
        const iconClass = getTransactionIcon(transaction.category);
        const timeAgo = getTimeAgo(new Date(transaction.date || transaction.timestamp));
        
        return `
            <div class="transaction-item flex justify-between items-center p-3 rounded-lg border border-gray-100">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 ${iconClass.bg} rounded-full flex items-center justify-center">
                        <i class="${iconClass.icon} ${iconClass.color}"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${transaction.description || transaction.category}</p>
                        <p class="text-gray-500 text-xs">${transaction.category} • ${timeAgo}</p>
                    </div>
                </div>
                <span class="${amountClass} font-bold">${amountSign}${currencySymbol}${absoluteAmount.toLocaleString()}</span>
            </div>
        `;
    }).join('');
}

// Update spending chart
function updateSpendingChart(transactions) {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) {
        console.log('❌ Spending chart canvas not found');
        return;
    }

    // Destroy existing chart
    if (window.spendingChart) {
        window.spendingChart.destroy();
    }

    const currencySymbol = getCurrencySymbol();
    const chartData = calculateChartData(transactions);

    window.spendingChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Spending',
                data: chartData.expenses,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Spending: ${currencySymbol}${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return `${currencySymbol}${value.toLocaleString()}`;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Calculate chart data
function calculateChartData(transactions) {
    const months = [];
    const expenseData = [];
    const currentDate = new Date();

    console.log('📈 Calculating chart data from transactions:', transactions.length);

    // Last 6 months data
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        months.push(monthName);

        const monthExpenses = transactions
            .filter(t => {
                try {
                    const transactionDate = new Date(t.date || t.timestamp);
                    return t.type === 'expense' &&
                           transactionDate.getMonth() === date.getMonth() &&
                           transactionDate.getFullYear() === date.getFullYear();
                } catch (error) {
                    return false;
                }
            })
            .reduce((total, t) => total + Math.abs(parseFloat(t.amount) || 0), 0);

        expenseData.push(monthExpenses);
    }

    return {
        labels: months,
        expenses: expenseData
    };
}

// Utility functions
function getCurrencySymbol(currency = null) {
    const curr = currency || localStorage.getItem('selectedCurrency') || 'PKR';
    const symbols = {
        'USD': '$',
        'PKR': '₨',
        'INR': '₹'
    };
    return symbols[curr] || '₨';
}

function getTransactionIcon(category) {
    const icons = {
        'Food & Dining': { icon: 'fas fa-utensils', color: 'text-green-600', bg: 'bg-green-100' },
        'Transportation': { icon: 'fas fa-car', color: 'text-blue-600', bg: 'bg-blue-100' },
        'Shopping': { icon: 'fas fa-shopping-bag', color: 'text-purple-600', bg: 'bg-purple-100' },
        'Entertainment': { icon: 'fas fa-film', color: 'text-yellow-600', bg: 'bg-yellow-100' },
        'Bills & Utilities': { icon: 'fas fa-file-invoice-dollar', color: 'text-red-600', bg: 'bg-red-100' },
        'Healthcare': { icon: 'fas fa-heartbeat', color: 'text-pink-600', bg: 'bg-pink-100' },
        'Education': { icon: 'fas fa-graduation-cap', color: 'text-indigo-600', bg: 'bg-indigo-100' },
        'Travel': { icon: 'fas fa-plane', color: 'text-teal-600', bg: 'bg-teal-100' },
        'Personal Care': { icon: 'fas fa-spa', color: 'text-orange-600', bg: 'bg-orange-100' },
        'Salary': { icon: 'fas fa-money-bill-wave', color: 'text-green-600', bg: 'bg-green-100' }
    };
    
    return icons[category] || { icon: 'fas fa-wallet', color: 'text-gray-600', bg: 'bg-gray-100' };
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
}

function showEmptyDashboard() {
    // Reset all values to zero/empty
    document.getElementById('total-balance').textContent = '₨0';
    document.getElementById('total-income').textContent = '₨0';
    document.getElementById('total-expenses').textContent = '₨0';
    document.getElementById('savings-rate').textContent = '0%';
    
    // Show empty states
    const statusElement = document.getElementById('data-status');
    const messageElement = document.getElementById('status-message');
    statusElement.classList.remove('hidden');
    messageElement.textContent = 'No transactions found. Add some income or expenses to get started!';
}

// Enhanced Save function - ULTIMATE FIX
function saveTransaction(type, transactionData) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        
        // Get existing transactions
        const existingTransactions = JSON.parse(localStorage.getItem(key)) || [];
        
        // Add unique ID and timestamp
        const transaction = {
            ...transactionData,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type: type // Ensure type is set
        };
        
        // Add to beginning of array (newest first)
        existingTransactions.unshift(transaction);
        
        // Save back to localStorage
        localStorage.setItem(key, JSON.stringify(existingTransactions));
        
        console.log(`✅ Saved ${type}:`, transaction);
        console.log(`📊 Total ${type}s now:`, existingTransactions.length);
        
        // Verify it was saved
        const verifyData = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`🔍 Verification - ${key} in storage:`, verifyData.length);
        
        // Trigger dashboard update
        triggerDataUpdate();
        
        // Show success message
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'success');
        
        return true;
    } catch (error) {
        console.error('❌ Error saving transaction:', error);
        showNotification('Error saving transaction. Please try again.', 'error');
        return false;
    }
}

// Enhanced Load function  
function loadTransactions(type) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        const transactions = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`📥 Loaded ${type}s:`, transactions.length);
        
        // Sort by date (newest first)
        return transactions.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
    } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
    }
}

// NEW: Delete transaction function
function deleteTransaction(type, transactionId) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        const transactions = JSON.parse(localStorage.getItem(key)) || [];
        
        const filteredTransactions = transactions.filter(t => t.id !== transactionId);
        localStorage.setItem(key, JSON.stringify(filteredTransactions));
        
        console.log(`🗑️ Deleted ${type} with ID:`, transactionId);
        console.log(`📊 Remaining ${type}s:`, filteredTransactions.length);
        
        triggerDataUpdate();
        showNotification('Transaction deleted successfully!', 'success');
        
        return true;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showNotification('Error deleting transaction.', 'error');
        return false;
    }
}

// NEW: Initialize data if not exists
function initializeStorage() {
    const keys = ['expenses', 'income', 'smartgrocer-accounts', 'smartgrocer-budgets'];
    
    keys.forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, '[]');
            console.log(`✅ Initialized empty array for: ${key}`);
        }
    });
}

// Enhanced data migration
function migrateAndBackupData() {
    // Backup current data
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const income = JSON.parse(localStorage.getItem('income') || '[]');
    
    // Create backup
    localStorage.setItem('backup-expenses', JSON.stringify(expenses));
    localStorage.setItem('backup-income', JSON.stringify(income));
    
    console.log('📦 Data backed up:', { 
        expenses: expenses.length, 
        income: income.length 
    });
    
    // Migrate from old keys if they exist
    const oldKeys = ['smartgrocer-transactions', 'transactions'];
    oldKeys.forEach(oldKey => {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
            try {
                const transactions = JSON.parse(oldData);
                const oldExpenses = transactions.filter(t => t.type === 'expense');
                const oldIncome = transactions.filter(t => t.type === 'income');
                
                // Merge with existing data
                const allExpenses = [...expenses, ...oldExpenses];
                const allIncome = [...income, ...oldIncome];
                
                localStorage.setItem('expenses', JSON.stringify(allExpenses));
                localStorage.setItem('income', JSON.stringify(allIncome));
                localStorage.removeItem(oldKey);
                
                console.log(`🔄 Migrated from ${oldKey}:`, { 
                    expenses: oldExpenses.length, 
                    income: oldIncome.length 
                });
            } catch (error) {
                console.error(`Error migrating ${oldKey}:`, error);
            }
        }
    });
}

// Trigger data update across all pages
function triggerDataUpdate() {
    const event = new CustomEvent('smartgrocer-data-update');
    window.dispatchEvent(event);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const bgColor = type === 'success' ? 'bg-green-500' :
                   type === 'error' ? 'bg-red-500' :
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    notification.innerHTML = `
        <div class="${bgColor} text-white p-4 rounded-lg flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                             type === 'error' ? 'fa-exclamation-circle' : 
                             type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Initialize when script loads
initializeStorage();
migrateAndBackupData();
console.log('✅ script.js loaded successfully');
