// Shared Data Manager for all pages
class SmartGrocerDataManager {
    constructor() {
        this.currency = localStorage.getItem('selectedCurrency') || 'USD';
        this.currencies = {
            'USD': { symbol: '$', name: 'US Dollar', flag: 'US' },
            'PKR': { symbol: '₨', name: 'Pakistani Rupee', flag: 'PK' },
            'INR': { symbol: '₹', name: 'Indian Rupee', flag: 'IN' }
        };
        this.init();
    }

    init() {
        this.ensureDataStructure();
        console.log('🔧 SmartGrocer Data Manager Initialized');
        return this;
    }

    ensureDataStructure() {
        if (!localStorage.getItem('smartgrocer-transactions')) {
            localStorage.setItem('smartgrocer-transactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('smartgrocer-accounts')) {
            localStorage.setItem('smartgrocer-accounts', JSON.stringify([]));
        }
        if (!localStorage.getItem('smartgrocer-budgets')) {
            localStorage.setItem('smartgrocer-budgets', JSON.stringify([]));
        }
        if (!localStorage.getItem('smartgrocer-categories')) {
            localStorage.setItem('smartgrocer-categories', JSON.stringify([
                'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
                'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Salary'
            ]));
        }
    }

    // Transaction Management
    getTransactions() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-transactions')) || [];
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        
        transaction.id = transaction.id || Date.now().toString();
        transaction.currency = transaction.currency || this.currency;
        transaction.createdAt = transaction.createdAt || new Date().toISOString();
        
        if (transaction.type === 'expense' && transaction.amount > 0) {
            transaction.amount = -Math.abs(transaction.amount);
        } else if (transaction.type === 'income' && transaction.amount < 0) {
            transaction.amount = Math.abs(transaction.amount);
        }
        
        transactions.push(transaction);
        localStorage.setItem('smartgrocer-transactions', JSON.stringify(transactions));
        
        this.updateAccountBalanceFromTransaction(transaction);
        this.triggerDataUpdate();
        
        return transaction;
    }

    updateAccountBalanceFromTransaction(transaction) {
        const accounts = this.getAccounts();
        let account = accounts.find(a => a.name === transaction.account);
        
        if (!account) {
            account = {
                id: Date.now().toString(),
                name: transaction.account,
                type: 'bank',
                balance: 0,
                currency: this.currency
            };
            accounts.push(account);
        }
        
        if (transaction.type === 'income') {
            account.balance += parseFloat(transaction.amount);
        } else {
            account.balance -= Math.abs(parseFloat(transaction.amount));
        }
        
        localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
    }

    deleteTransaction(id) {
        const transactions = this.getTransactions();
        const transactionToDelete = transactions.find(t => t.id === id);
        
        if (!transactionToDelete) return false;

        this.reverseAccountBalanceFromTransaction(transactionToDelete);
        
        const filtered = transactions.filter(t => t.id !== id);
        localStorage.setItem('smartgrocer-transactions', JSON.stringify(filtered));
        
        this.triggerDataUpdate();
        return true;
    }

    reverseAccountBalanceFromTransaction(transaction) {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.name === transaction.account);
        
        if (account) {
            if (transaction.type === 'income') {
                account.balance -= parseFloat(transaction.amount);
            } else {
                account.balance += Math.abs(parseFloat(transaction.amount));
            }
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
        }
    }

    // Account Management
    getAccounts() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-accounts')) || [];
    }

    // Budget Management
    getBudgets() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-budgets')) || [];
    }

    addBudget(budget) {
        const budgets = this.getBudgets();
        budget.id = budget.id || Date.now().toString();
        budget.createdAt = budget.createdAt || new Date().toISOString();
        budget.spent = budget.spent || 0;
        
        budgets.push(budget);
        localStorage.setItem('smartgrocer-budgets', JSON.stringify(budgets));
        this.triggerDataUpdate();
        
        return budget;
    }

    updateBudget(id, updates) {
        const budgets = this.getBudgets();
        const index = budgets.findIndex(b => b.id === id);
        
        if (index !== -1) {
            budgets[index] = { ...budgets[index], ...updates };
            localStorage.setItem('smartgrocer-budgets', JSON.stringify(budgets));
            this.triggerDataUpdate();
            return budgets[index];
        }
        return null;
    }

    deleteBudget(id) {
        const budgets = this.getBudgets();
        const filtered = budgets.filter(b => b.id !== id);
        localStorage.setItem('smartgrocer-budgets', JSON.stringify(filtered));
        this.triggerDataUpdate();
        return true;
    }

    // Budget-Expense Synchronization
    syncBudgetsWithExpenses() {
        const transactions = this.getTransactions();
        const budgets = this.getBudgets();
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Reset all budget spent amounts
        budgets.forEach(budget => {
            budget.spent = 0;
        });
        
        // Update budget spent amounts based on expenses
        expenses.forEach(expense => {
            const budget = budgets.find(b => 
                b.category === expense.category && 
                b.currency === expense.currency
            );
            
            if (budget) {
                budget.spent = (budget.spent || 0) + Math.abs(expense.amount);
            }
        });
        
        localStorage.setItem('smartgrocer-budgets', JSON.stringify(budgets));
        this.triggerDataUpdate();
        
        return budgets;
    }

    // Event System
    triggerDataUpdate() {
        const event = new CustomEvent('smartgrocer-data-update', {
            detail: {
                transactions: this.getTransactions(),
                accounts: this.getAccounts(),
                budgets: this.getBudgets(),
                currency: this.currency,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
        
        // Also trigger storage event for cross-tab communication
        window.dispatchEvent(new Event('storage'));
    }

    // Utility Methods
    getExpenseStats() {
        const transactions = this.getTransactions();
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const today = new Date().toDateString();
        const todayExpenses = expenses.filter(e => new Date(e.date).toDateString() === today);
        const weekExpenses = expenses.filter(e => this.isThisWeek(new Date(e.date)));
        const monthExpenses = expenses.filter(e => this.isThisMonth(new Date(e.date)));
        
        return {
            today: {
                amount: todayExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0),
                count: todayExpenses.length
            },
            week: {
                amount: weekExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0),
                count: weekExpenses.length
            },
            month: {
                amount: monthExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0),
                count: monthExpenses.length
            },
            total: {
                amount: expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0),
                count: expenses.length
            }
        };
    }

    isThisWeek(date) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() + 6));
        return date >= startOfWeek && date <= endOfWeek;
    }

    isThisMonth(date) {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    safeParseJSON(jsonString) {
        try {
            return jsonString ? JSON.parse(jsonString) : [];
        } catch (error) {
            console.error('❌ JSON parsing error:', error);
            return [];
        }
    }

    setCurrency(currency) {
        this.currency = currency;
        localStorage.setItem('selectedCurrency', currency);
        this.triggerDataUpdate();
    }

    getCurrencySymbol() {
        return this.currencies[this.currency]?.symbol || '$';
    }
}

// Initialize global data manager
if (!window.smartGrocerData) {
    window.smartGrocerData = new SmartGrocerDataManager();
}

// Common UI Functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const bgColor = type === 'success' ? 'bg-green-500' :
                   type === 'error' ? 'bg-red-500' :
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    notification.innerHTML = `
        <div class="${bgColor} text-white p-4 rounded-lg flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Common initialization for all pages
function initializeCommonFeatures() {
    // Check user authentication
    const currentUser = localStorage.getItem('smartgrocer-currentUser');
    if (currentUser) {
        const welcomeText = document.getElementById('welcome-user-text');
        const userInitial = document.getElementById('user-initial');
        
        if (welcomeText) welcomeText.textContent = `Welcome, ${currentUser}!`;
        if (userInitial) userInitial.textContent = currentUser.charAt(0).toUpperCase();
    }

    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Currency selection
    const currencyOptions = document.querySelectorAll('.currency-option');
    const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    
    currencyOptions.forEach(option => {
        option.addEventListener('click', function() {
            const currency = this.getAttribute('data-currency');
            window.smartGrocerData.setCurrency(currency);
            
            currencyOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            showNotification(`Display currency set to ${window.smartGrocerData.currencies[currency].name}`, 'success');
        });
        
        if (option.getAttribute('data-currency') === selectedCurrency) {
            option.classList.add('selected');
        }
    });

    console.log('✅ Common features initialized');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCommonFeatures();
});
