// Global state to hold transactions
let transactionsData = [
    { id: 1, date: "2025-09-12", description: "Initial Salary", category: "Income", amount: 2500.00, account: "Checking Account", type: "income" },
    { id: 2, date: "2025-09-13", description: "Grocery Shopping", category: "Groceries", amount: 125.50, account: "Credit Card", type: "expense" }
];
let nextTransactionId = 3;
let currentlyEditingId = null; // Track which transaction is being edited

// Basic application functionality
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 1500);

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
        // ... (this function is unchanged) ...
    });

    // Event listener for table actions (Edit, Delete, Save, Cancel)
    document.getElementById('transactions-table-body').addEventListener('click', function(e) {
        const target = e.target;
        const editButton = target.closest('.edit-btn');
        const deleteButton = target.closest('.delete-btn');
        const saveButton = target.closest('.save-btn');
        const cancelButton = target.closest('.cancel-btn');

        if (editButton) {
            const transactionId = parseInt(editButton.getAttribute('data-id'));
            enterEditMode(transactionId);
        } else if (deleteButton) {
            const transactionId = parseInt(deleteButton.getAttribute('data-id'));
            deleteTransaction(transactionId);
        } else if (saveButton) {
            const transactionId = parseInt(saveButton.getAttribute('data-id'));
            saveTransaction(transactionId);
        } else if (cancelButton) {
            exitEditMode();
        }
    });
    
    navigateToPage('dashboard');
    document.querySelector('a[href="#dashboard"]').classList.add('active');
    initializeSampleData();
});

function enterEditMode(id) {
    // If another row is already being edited, cancel it first.
    if (currentlyEditingId !== null) {
        exitEditMode();
    }
    currentlyEditingId = id;
    renderTransactions(); // Re-render to show the edit form for the specific row
}

function exitEditMode() {
    currentlyEditingId = null;
    renderTransactions(); // Re-render to show all rows as normal
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

    // Update stats before changing the data
    updateStatsOnEdit(transaction.amount, newAmount, transaction.type);

    // Update the transaction data
    transaction.description = newDescription;
    transaction.amount = newAmount;

    showNotification('Transaction updated successfully!', 'success');
    exitEditMode();
}

function updateStatsOnEdit(oldAmount, newAmount, type) {
    const difference = newAmount - oldAmount;

    if (type === 'expense') {
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses + difference).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth - difference).toFixed(2);
    } else if (type === 'income') {
        const currentIncome = parseFloat(document.getElementById('total-income-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('total-income-stat').textContent = '$' + (currentIncome + difference).toFixed(2);

        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth + difference).toFixed(2);
    }
}


function deleteTransaction(id) {
    // ... (this function is unchanged from the previous version) ...
}

function renderTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    tableBody.innerHTML = '';

    transactionsData.forEach(tx => {
        // Check if the current row is the one being edited
        if (tx.id === currentlyEditingId) {
            tableBody.innerHTML += renderEditRow(tx);
        } else {
            tableBody.innerHTML += renderDataRow(tx);
        }
    });
}

// Returns the HTML string for a standard data row
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
                <button class="text-blue-600 hover:text-blue-800 mr-2 edit-btn" data-id="${tx.id}"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${tx.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
}

// Returns the HTML string for a row in edit mode
function renderEditRow(tx) {
    return `
        <tr class="bg-yellow-50" data-id="${tx.id}">
            <td class="p-4">${new Date(tx.date).toLocaleDateString()}</td>
            <td class="p-2"><input type="text" name="description" value="${tx.description}" class="transaction-edit-input"></td>
            <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${tx.category}</span></td>
            <td class="p-2 text-right"><input type="number" step="0.01" name="amount" value="${tx.amount.toFixed(2)}" class="transaction-edit-input text-right"></td>
            <td class="p-4">${tx.account}</td>
            <td class="p-4 text-center">
                <button class="text-green-600 hover:text-green-800 mr-2 save-btn" data-id="${tx.id}"><i class="fas fa-check"></i></button>
                <button class="text-gray-600 hover:text-gray-800 cancel-btn" data-id="${tx.id}"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `;
}

function navigateToPage(pageId) { /* ... Unchanged ... */ }
function showNotification(message, type = 'info') { /* ... Unchanged ... */ }
function initializeSampleData() { /* ... Unchanged ... */ }
// Add back the full function bodies from the previous step for navigateToPage, showNotification, initializeSampleData, and the quick expense form submit logic.
