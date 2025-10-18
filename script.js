// Utility functions
function safeParseJSON(jsonString) {
    try {
        return jsonString ? JSON.parse(jsonString) : [];
    } catch (error) {
        return [];
    }
}

// Save transaction function
function saveTransaction(type, transactionData) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        const existingTransactions = JSON.parse(localStorage.getItem(key)) || [];
        
        const transaction = {
            ...transactionData,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type: type
        };
        
        existingTransactions.unshift(transaction);
        localStorage.setItem(key, JSON.stringify(existingTransactions));
        
        console.log(`✅ Saved ${type}:`, transaction);
        
        // Trigger dashboard update
        triggerDataUpdate();
        
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'success');
        
        return true;
    } catch (error) {
        console.error('❌ Error saving transaction:', error);
        showNotification('Error saving transaction. Please try again.', 'error');
        return false;
    }
}

// Load transactions
function loadTransactions(type) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        const transactions = JSON.parse(localStorage.getItem(key)) || [];
        return transactions.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
    } catch (error) {
        return [];
    }
}

// Delete transaction
function deleteTransaction(type, transactionId) {
    try {
        const key = type === 'expense' ? 'expenses' : 'income';
        const transactions = JSON.parse(localStorage.getItem(key)) || [];
        const filteredTransactions = transactions.filter(t => t.id !== transactionId);
        localStorage.setItem(key, JSON.stringify(filteredTransactions));
        
        triggerDataUpdate();
        showNotification('Transaction deleted successfully!', 'success');
        
        return true;
    } catch (error) {
        showNotification('Error deleting transaction.', 'error');
        return false;
    }
}

// Trigger data update
function triggerDataUpdate() {
    console.log('🔄 Triggering data update event');
    const event = new CustomEvent('smartgrocer-data-update');
    window.dispatchEvent(event);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    
    notification.innerHTML = `
        <div class="${bgColor} text-white p-4 rounded-lg flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Initialize storage
function initializeStorage() {
    const keys = ['expenses', 'income', 'smartgrocer-budgets'];
    keys.forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, '[]');
        }
    });
}

// Initialize when script loads
initializeStorage();
console.log('✅ script.js loaded');
