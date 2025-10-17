// Global Data Manager - For all pages
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Data Manager Initialized');
        this.initializeStorage();
        return this;
    }

    initializeStorage() {
        const keys = ['expenses', 'income', 'smartgrocer-accounts', 'smartgrocer-budgets'];
        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, '[]');
                console.log(`✅ Initialized empty array for: ${key}`);
            }
        });
    }

    // Enhanced Save function
    saveTransaction(type, transactionData) {
        try {
            const key = type === 'expense' ? 'expenses' : 'income';
            
            // Get existing transactions
            const existingTransactions = this.safeParseJSON(localStorage.getItem(key)) || [];
            
            // Add unique ID and timestamp
            const transaction = {
                ...transactionData,
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                type: type
            };
            
            // Add to beginning of array (newest first)
            existingTransactions.unshift(transaction);
            
            // Save back to localStorage
            localStorage.setItem(key, JSON.stringify(existingTransactions));
            
            console.log(`✅ Saved ${type}:`, transaction);
            console.log(`📊 Total ${type}s now:`, existingTransactions.length);
            
            // Trigger dashboard update
            this.triggerDataUpdate();
            
            // Show success message
            this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'success');
            
            return true;
        } catch (error) {
            console.error('❌ Error saving transaction:', error);
            this.showNotification('Error saving transaction. Please try again.', 'error');
            return false;
        }
    }

    // Load transactions
    loadTransactions(type) {
        try {
            const key = type === 'expense' ? 'expenses' : 'income';
            const transactions = this.safeParseJSON(localStorage.getItem(key)) || [];
            console.log(`📥 Loaded ${type}s:`, transactions.length);
            
            // Sort by date (newest first)
            return transactions.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
        } catch (error) {
            console.error('Error loading transactions:', error);
            return [];
        }
    }

    // Delete transaction
    deleteTransaction(type, transactionId) {
        try {
            const key = type === 'expense' ? 'expenses' : 'income';
            const transactions = this.safeParseJSON(localStorage.getItem(key)) || [];
            
            const filteredTransactions = transactions.filter(t => t.id !== transactionId);
            localStorage.setItem(key, JSON.stringify(filteredTransactions));
            
            console.log(`🗑️ Deleted ${type} with ID:`, transactionId);
            console.log(`📊 Remaining ${type}s:`, filteredTransactions.length);
            
            this.triggerDataUpdate();
            this.showNotification('Transaction deleted successfully!', 'success');
            
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showNotification('Error deleting transaction.', 'error');
            return false;
        }
    }

    // Trigger data update across all pages
    triggerDataUpdate() {
        console.log('🔄 Triggering data update event');
        const event = new CustomEvent('smartgrocer-data-update');
        window.dispatchEvent(event);
    }

    // Safe JSON parsing
    safeParseJSON(jsonString) {
        try {
            return jsonString ? JSON.parse(jsonString) : [];
        } catch (error) {
            console.error('❌ JSON parsing error:', error);
            return [];
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.log('❌ Notification element not found');
            return;
        }
        
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
}

// Create global instance
window.smartGrocerData = new DataManager();

// Initialize when script loads
console.log('✅ script.js loaded successfully');
