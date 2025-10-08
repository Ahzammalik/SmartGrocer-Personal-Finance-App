// data-manager.js - Centralized data management for SmartGrocer
class DataManager {
    constructor() {
        this.currency = localStorage.getItem('selectedCurrency') || 'PKR';
        this.currencies = {
            'USD': { symbol: '$', name: 'US Dollar', flag: 'US' },
            'PKR': { symbol: '₨', name: 'Pakistani Rupee', flag: 'PK' },
            'INR': { symbol: '₹', name: 'Indian Rupee', flag: 'IN' }
        };
        this.autoUpdateInterval = null;
        this.init();
    }

    // Initialize data manager
    init() {
        this.ensureDataStructure();
        this.setupAutoUpdate();
        return this;
    }

    // Ensure proper data structure exists
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

    // Setup auto-update across all pages
    setupAutoUpdate() {
        // Clear existing interval
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
        }

        // Set up new interval (update every 10 seconds)
        this.autoUpdateInterval = setInterval(() => {
            this.triggerDataUpdate();
        }, 10000);
    }

    // Trigger data update event
    triggerDataUpdate() {
        const event = new CustomEvent('smartgrocer-data-update', {
            detail: {
                transactions: this.getTransactions(),
                accounts: this.getAccounts(),
                budgets: this.getBudgets(),
                currency: this.currency
            }
        });
        window.dispatchEvent(event);
    }

    // Get all transactions
    getTransactions() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-transactions')) || [];
    }

    // Add new transaction
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now();
        transaction.currency = this.currency;
        transaction.createdAt = new Date().toISOString();
        
        transactions.push(transaction);
        localStorage.setItem('smartgrocer-transactions', JSON.stringify(transactions));
        
        // Update account balance if account is specified
        if (transaction.account) {
            this.updateAccountBalanceFromTransaction(transaction);
        }
        
        // Trigger update
        this.triggerDataUpdate();
        return transaction;
    }

    // Update account balance based on transaction
    updateAccountBalanceFromTransaction(transaction) {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.name === transaction.account);
        
        if (account) {
            if (transaction.type === 'income') {
                account.balance += parseFloat(transaction.amount);
            } else {
                account.balance -= Math.abs(parseFloat(transaction.amount));
            }
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
        }
    }

    // Update transaction
    updateTransaction(id, updates) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updates };
            localStorage.setItem('smartgrocer-transactions', JSON.stringify(transactions));
            this.triggerDataUpdate();
            return transactions[index];
        }
        return null;
    }

    // Delete transaction
    deleteTransaction(id) {
        const transactions = this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        localStorage.setItem('smartgrocer-transactions', JSON.stringify(filtered));
        this.triggerDataUpdate();
    }

    // Get all accounts
    getAccounts() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-accounts')) || [];
    }

    // Update account balance
    updateAccountBalance(accountId, newBalance) {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.id === accountId);
        
        if (account) {
            account.balance = newBalance;
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
            this.triggerDataUpdate();
        }
    }

    // Get all budgets
    getBudgets() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-budgets')) || [];
    }

    // Get categories
    getCategories() {
        return this.safeParseJSON(localStorage.getItem('smartgrocer-categories')) || [];
    }

    // Calculate financial overview
    calculateFinancialOverview() {
        const transactions = this.getTransactions();
        const accounts = this.getAccounts();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Total balance from accounts in selected currency
        const totalBalance = accounts
            .filter(account => account.currency === this.currency)
            .reduce((total, account) => total + (parseFloat(account.balance) || 0), 0);

        // Current month transactions
        const currentMonthTransactions = transactions.filter(transaction => {
            try {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear &&
                       transaction.currency === this.currency;
            } catch (error) {
                return false;
            }
        });

        // Calculate totals
        const totalIncome = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((total, t) => total + (parseFloat(t.amount) || 0), 0);

        const totalExpenses = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((total, t) => total + Math.abs(parseFloat(t.amount) || 0), 0);

        const savingsRate = totalIncome > 0 ? 
            Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

        return {
            totalBalance,
            totalIncome,
            totalExpenses,
            savingsRate,
            currency: this.currency,
            symbol: this.currencies[this.currency].symbol
        };
    }

    // Calculate chart data
    calculateChartData() {
        const transactions = this.getTransactions();
        const months = [];
        const incomeData = [];
        const expenseData = [];
        const currentDate = new Date();

        // Last 6 months data
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            months.push(monthName);

            const monthIncome = transactions
                .filter(t => {
                    try {
                        const transactionDate = new Date(t.date);
                        return t.type === 'income' &&
                               t.currency === this.currency &&
                               transactionDate.getMonth() === date.getMonth() &&
                               transactionDate.getFullYear() === date.getFullYear();
                    } catch (error) {
                        return false;
                    }
                })
                .reduce((total, t) => total + (parseFloat(t.amount) || 0), 0);

            const monthExpenses = transactions
                .filter(t => {
                    try {
                        const transactionDate = new Date(t.date);
                        return t.type === 'expense' &&
                               t.currency === this.currency &&
                               transactionDate.getMonth() === date.getMonth() &&
                               transactionDate.getFullYear() === date.getFullYear();
                    } catch (error) {
                        return false;
                    }
                })
                .reduce((total, t) => total + Math.abs(parseFloat(t.amount) || 0), 0);

            incomeData.push(monthIncome);
            expenseData.push(monthExpenses);
        }

        // Category data
        const categoryMap = {};
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        transactions
            .filter(t => {
                try {
                    const transactionDate = new Date(t.date);
                    return t.type === 'expense' &&
                           t.currency === this.currency &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                } catch (error) {
                    return false;
                }
            })
            .forEach(t => {
                const category = t.category || 'Uncategorized';
                const amount = Math.abs(parseFloat(t.amount) || 0);
                categoryMap[category] = (categoryMap[category] || 0) + amount;
            });

        return {
            incomeExpense: {
                labels: months,
                income: incomeData,
                expenses: expenseData
            },
            categories: {
                labels: Object.keys(categoryMap),
                data: Object.values(categoryMap)
            }
        };
    }

    // Safe JSON parsing
    safeParseJSON(jsonString) {
        try {
            return jsonString ? JSON.parse(jsonString) : [];
        } catch (error) {
            console.error('JSON parsing error:', error);
            return [];
        }
    }

    // Set currency
    setCurrency(currency) {
        this.currency = currency;
        localStorage.setItem('selectedCurrency', currency);
        this.triggerDataUpdate();
    }

    // Get currency symbol
    getCurrencySymbol() {
        return this.currencies[this.currency]?.symbol || '₨';
    }

    // Initialize sample data for new users
    initializeSampleData() {
        if (this.getTransactions().length === 0) {
            const sampleTransactions = [
                {
                    id: Date.now(),
                    type: 'income',
                    amount: 75000,
                    currency: this.currency,
                    category: 'Salary',
                    description: 'Monthly Salary',
                    date: new Date().toISOString().split('T')[0],
                    account: 'Primary Account',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 1,
                    type: 'expense',
                    amount: -4500,
                    currency: this.currency,
                    category: 'Food & Dining',
                    description: 'Grocery Shopping',
                    date: new Date().toISOString().split('T')[0],
                    account: 'Primary Account',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 2,
                    type: 'expense',
                    amount: -2500,
                    currency: this.currency,
                    category: 'Transportation',
                    description: 'Fuel',
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    account: 'Primary Account',
                    createdAt: new Date().toISOString()
                }
            ];

            const sampleAccounts = [
                {
                    id: 1,
                    name: 'Primary Account',
                    type: 'bank',
                    balance: 70000,
                    currency: this.currency
                }
            ];

            localStorage.setItem('smartgrocer-transactions', JSON.stringify(sampleTransactions));
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(sampleAccounts));
            this.triggerDataUpdate();
        }
    }

    // Cleanup
    destroy() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
        }
    }
}

// Create global instance
window.smartGrocerData = new DataManager();
