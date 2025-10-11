// Enhanced updateDashboard function with REAL data only
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
