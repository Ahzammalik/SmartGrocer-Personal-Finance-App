// Transaction Manager - Centralized transaction handling
class TransactionManager {
    constructor() {
        this.init();
    }
    
    init() {
        initializeStorage();
        migrateAndBackupData();
        this.setupGlobalListeners();
    }
    
    setupGlobalListeners() {
        // Listen for storage changes across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'expenses' || e.key === 'income') {
                console.log('🔄 Storage changed, updating...');
                triggerDataUpdate();
            }
        });
        
        // Listen for beforeunload to ensure data is saved
        window.addEventListener('beforeunload', () => {
            this.forceSave();
        });
    }
    
    forceSave() {
        // Force save any pending data
        const pendingTransactions = window.pendingTransactions || [];
        pendingTransactions.forEach(transaction => {
            this.saveTransaction(transaction.type, transaction.data);
        });
        window.pendingTransactions = [];
    }
    
    // Unified save method
    saveTransaction(type, transactionData) {
        return saveTransaction(type, transactionData);
    }
    
    // Unified load method
    loadTransactions(type) {
        return loadTransactions(type);
    }
    
    // Get all transactions
    getAllTransactions() {
        const expenses = this.loadTransactions('expense');
        const income = this.loadTransactions('income');
        return [...expenses, ...income].sort((a, b) => 
            new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
        );
    }
    
    // Export data for debugging
    exportData() {
        return {
            expenses: this.loadTransactions('expense'),
            income: this.loadTransactions('income'),
            accounts: JSON.parse(localStorage.getItem('smartgrocer-accounts') || '[]'),
            budgets: JSON.parse(localStorage.getItem('smartgrocer-budgets') || '[]')
        };
    }
}

// Initialize transaction manager
const transactionManager = new TransactionManager();
