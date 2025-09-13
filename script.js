// Global state variables
let transactionsData = [];
let budgetsData = [];
let nextTransactionId = 1;
let nextBudgetId = 1;
let currentlyEditingId = null;

// --- LOCAL STORAGE FUNCTIONS ---
function saveStateToLocalStorage() {
    localStorage.setItem('smartGrocerTransactions', JSON.stringify(transactionsData));
    localStorage.setItem('smartGrocerBudgets', JSON.stringify(budgetsData));
    localStorage.setItem('smartGrocerNextId', nextTransactionId.toString());
    localStorage.setItem('smartGrocerNextBudgetId', nextBudgetId.toString());
}

function loadStateFromLocalStorage() {
    // Load Transactions
    const savedTransactions = localStorage.getItem('smartGrocerTransactions');
    if (savedTransactions) {
        transactionsData = JSON.parse(savedTransactions);
    } else {
        transactionsData = [ /* Initial sample data */ ];
    }
    nextTransactionId = parseInt(localStorage.getItem('smartGrocerNextId') || (transactionsData.length ? Math.max(...transactionsData.map(tx => tx.id)) + 1 : 1));

    // Load Budgets
    const savedBudgets = localStorage.getItem('smartGrocerBudgets');
    if (savedBudgets) {
        budgetsData = JSON.parse(savedBudgets);
    } else {
        budgetsData = [ { id: 1, category: "Groceries", limit: 500 } ];
    }
    nextBudgetId = parseInt(localStorage.getItem('smartGrocerNextBudgetId') || (budgetsData.length ? Math.max(...budgetsData.map(b => b.id)) + 1 : 1));
}

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage();
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    renderTransactions();
    renderBudgets();
    
    // ... Navigation, Mobile Menu Toggle ...

    // --- Modal Event Listeners ---
    const budgetModal = document.getElementById('budget-modal');
    document.getElementById('create-budget-btn').addEventListener('click', () => budgetModal.classList.remove('hidden'));
    document.getElementById('cancel-budget-btn').addEventListener('click', () => budgetModal.classList.add('hidden'));
    
    // Handle new budget form submission
    document.getElementById('budget-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const category = document.getElementById('budget-category').value;
        const limit = parseFloat(document.getElementById('budget-limit').value);

        // Check if a budget for this category already exists
        if (budgetsData.some(b => b.category === category)) {
            showNotification(`A budget for ${category} already exists.`, 'error');
            return;
        }

        if (limit > 0) {
            budgetsData.push({ id: nextBudgetId++, category, limit });
            saveStateToLocalStorage();
            renderBudgets();
            this.reset();
            budgetModal.classList.add('hidden');
            showNotification('Budget created successfully!', 'success');
        } else {
            showNotification('Budget limit must be greater than zero.', 'error');
        }
    });

    // Handle transaction form submission and table actions
    // ... (These functions now also call renderBudgets() on success) ...
});

// --- BUDGET RENDERING ---
function renderBudgets() {
    const container = document.getElementById('budgets-container');
    container.innerHTML = ''; // Clear existing budgets

    if (budgetsData.length === 0) {
        container.innerHTML = `<p class="text-gray-500 col-span-full">No budgets created yet. Click "Create Budget" to start!</p>`;
        return;
    }

    budgetsData.forEach(budget => {
        // Calculate total spent for the budget's category this month
        const spent = transactionsData
            .filter(tx => tx.category === budget.category && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        const percentage = Math.min((spent / budget.limit) * 100, 100);
        const remaining = budget.limit - spent;
        
        let progressBarColor = 'bg-green-500';
        if (percentage > 75) progressBarColor = 'bg-yellow-500';
        if (percentage >= 100) progressBarColor = 'bg-red-500';

        const budgetCard = `
            <div class="card p-4 shadow-sm">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-gray-800">${budget.category}</h4>
                    <span class="text-sm font-semibold text-gray-600">$${spent.toFixed(2)} / $${budget.limit.toFixed(2)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressBarColor}" style="width: ${percentage}%"></div>
                </div>
                <p class="text-sm text-gray-600 mt-2">$${remaining.toFixed(2)} ${remaining >= 0 ? 'remaining' : 'over budget'}</p>
            </div>
        `;
        container.innerHTML += budgetCard;
    });
}


// --- UPDATED CRUD FUNCTIONS ---
// (The core logic is the same, just with an added call to renderBudgets())

function deleteTransaction(id) {
    // ... (logic to find and splice transaction) ...
    saveStateToLocalStorage();
    renderTransactions();
    renderBudgets(); // <-- UPDATE BUDGETS
    updateStatsOnDelete(transactionToDelete);
    showNotification('Transaction deleted successfully', 'info');
}

function saveTransaction(id) {
    // ... (logic to find and update transaction) ...
    saveStateToLocalStorage();
    showNotification('Transaction updated successfully!', 'success');
    exitEditMode(); // This function calls renderTransactions()
    renderBudgets(); // <-- UPDATE BUDGETS
}

// Ensure the Add Transaction function also updates budgets
document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
    // ... (logic to add transaction and update stats) ...
    saveStateToLocalStorage();
    renderTransactions();
    renderBudgets(); // <-- UPDATE BUDGETS
    // ... (show notification, reset form) ...
});

// All other helper functions (renderTransactions, navigateToPage, etc.) remain the same.
// Remember to copy the full bodies of all unchanged functions from the previous step.
