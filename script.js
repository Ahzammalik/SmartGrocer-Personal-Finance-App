// Global state variables. These will be populated from Local Storage.
let transactionsData = [];
let nextTransactionId = 1;
let currentlyEditingId = null;

// --- LOCAL STORAGE FUNCTIONS ---

/**
 * Saves the current transactions and the next transaction ID to local storage.
 */
function saveStateToLocalStorage() {
    localStorage.setItem('smartGrocerTransactions', JSON.stringify(transactionsData));
    localStorage.setItem('smartGrocerNextId', nextTransactionId.toString());
}

/**
 * Loads transactions and the next ID from local storage on startup.
 * If no data is found, it loads default sample data.
 */
function loadStateFromLocalStorage() {
    const savedTransactions = localStorage.getItem('smartGrocerTransactions');
    const savedNextId = localStorage.getItem('smartGrocerNextId');

    if (savedTransactions) {
        transactionsData = JSON.parse(savedTransactions);
    } else {
        // First-time user: load sample data
        transactionsData = [
            { id: 1, date: "2025-09-12", description: "Initial Salary", category: "Income", amount: 2500.00, account: "Checking Account", type: "income" },
            { id: 2, date: "2025-09-13", description: "Grocery Shopping", category: "Groceries", amount: 125.50, account: "Credit Card", type: "expense" }
        ];
    }

    if (savedNextId) {
        nextTransactionId = parseInt(savedNextId);
    } else {
        // If there's no saved ID, calculate it from existing data
        nextTransactionId = transactionsData.length > 0 ? Math.max(...transactionsData.map(tx => tx.id)) + 1 : 1;
    }
}


// --- MAIN APPLICATION LOGIC ---

document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage(); // Load saved data on startup

    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    renderTransactions();
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage(this.getAttribute('href').substring(1));
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        document.querySelector('aside').classList.toggle('hidden');
    });
    
    // Quick expense form submission
    document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const description = document.getElementById('quick-description').value;
        
        // --- Add new transaction logic ---
        const newTransaction = {
            id: nextTransactionId++,
            date: new Date().toISOString().split('T')[0],
            description: description,
            category: document.getElementById('quick-category').value,
            amount: amount,
            account: document.getElementById('quick-account').value,
            type: "expense"
        };
        transactionsData.unshift(newTransaction);
        saveStateToLocalStorage(); // <-- SAVE
        renderTransactions();
        
        // Update dashboard stats
        updateStatsOnAdd(amount, 'expense');

        this.reset();
        showNotification(`Added expense: $${amount} for ${description}`, 'success');
    });

    // Event listener for table actions (Edit, Delete, Save, Cancel)
    document.getElementById('transactions-table-body').addEventListener('click', function(e) {
        const target = e.target;
        const transactionId = parseInt(target.closest('[data-id]')?.getAttribute('data-id'));
        
        if (target.closest('.edit-btn'))   enterEditMode(transactionId);
        if (target.closest('.delete-btn')) deleteTransaction(transactionId);
        if (target.closest('.save-btn'))   saveTransaction(transactionId);
        if (target.closest('.cancel-btn')) exitEditMode();
    });
    
    navigateToPage('dashboard');
    document.querySelector('a[href="#dashboard"]').classList.add('active');
    initializeSampleData();
});

// --- CRUD & RENDER FUNCTIONS ---

function deleteTransaction(id) {
    const transactionIndex = transactionsData.findIndex(tx => tx.id === id);
    if (transactionIndex === -1) return;

    const transactionToDelete = transactionsData[transactionIndex];
    transactionsData.splice(transactionIndex, 1);
    
    saveStateToLocalStorage(); // <-- SAVE
    renderTransactions();
    
    updateStatsOnDelete(transactionToDelete);
    showNotification('Transaction deleted successfully', 'info');
}

function saveTransaction(id) {
    const transaction = transactionsData.find(tx => tx.id === id);
    if (!transaction) return;

    const row = document.querySelector(`tr[data-id="${id}"]`);
    const newDescription = row.querySelector('input[name="description"]').value;
    const newAmount = parseFloat(row.querySelector('input[name="amount"]').value);
    
    if (!newDescription || isNaN(newAmount)) {
        showNotification('Invalid input. Please check the values.', 'error');
        return;
    }

    updateStatsOnEdit(transaction.amount, newAmount, transaction.type);

    transaction.description = newDescription;
    transaction.amount = newAmount;

    saveStateToLocalStorage(); // <-- SAVE
    showNotification('Transaction updated successfully!', 'success');
    exitEditMode();
}

function renderTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    tableBody.innerHTML = transactionsData.map(tx => {
        return (tx.id === currentlyEditingId) ? renderEditRow(tx) : renderDataRow(tx);
    }).join('');
}

function renderDataRow(tx) {
    const amountColor = tx.type === 'income' ? 'text-green-600' : 'text-red-600';
    const amountPrefix = tx.type === 'income' ? '+' : '-';
    return `
        <tr class="border-b hover:bg-gray-50" data-id="${tx.id}">
            <td class="p-4">${new Date(tx.date).toLocaleDateString()}</td>
            <td class="p-4">${tx.description}</td>
            <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${tx.category}</span></td>
            <td class="p-4 text-right ${amountColor}">${amountPrefix}$${tx.amount.toFixed(2)}</td>
            <td class="p-4">${tx.account}</td>
            <td class="p-4 text-center">
                <button class="text-blue-600 hover:text-blue-800 mr-2 edit-btn"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-800 delete-btn"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
}

function renderEditRow(tx) {
    return `
        <tr class="bg-yellow-50" data-id="${tx.id}">
            <td class="p-4">${new Date(tx.date).toLocaleDateString()}</td>
            <td class="p-2"><input type="text" name="description" value="${tx.description}" class="transaction-edit-input"></td>
            <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${tx.category}</span></td>
            <td class="p-2 text-right"><input type="number" step="0.01" name="amount" value="${tx.amount.toFixed(2)}" class="transaction-edit-input text-right"></td>
            <td class="p-4">${tx.account}</td>
            <td class="p-4 text-center">
                <button class="text-green-600 hover:text-green-800 mr-2 save-btn"><i class="fas fa-check"></i></button>
                <button class="text-gray-600 hover:text-gray-800 cancel-btn"><i class="fas fa-times"></i></button>
            </td>
        </tr>`;
}

// --- HELPER FUNCTIONS ---

function enterEditMode(id) {
    if (currentlyEditingId !== null) exitEditMode();
    currentlyEditingId = id;
    renderTransactions();
}

function exitEditMode() {
    currentlyEditingId = null;
    renderTransactions();
}

function updateStatsOnAdd(amount, type) {
    if (type === 'expense') {
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses + amount).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth - amount).toFixed(2);
    }
}

function updateStatsOnDelete(transaction) {
    if (transaction.type === 'expense') {
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses - transaction.amount).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth + transaction.amount).toFixed(2);
    }
}

function updateStatsOnEdit(oldAmount, newAmount, type) {
    const difference = newAmount - oldAmount;
    if (type === 'expense') {
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses + difference).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth - difference).toFixed(2);
    }
}

function navigateToPage(pageId) { /* ... Unchanged ... */ }
function showNotification(message, type = 'info') { /* ... Unchanged ... */ }
function initializeSampleData() { /* ... Unchanged ... */ }
