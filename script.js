// Global state variables
let transactionsData = [];
let budgetsData = [];
let nextTransactionId = 1;
let nextBudgetId = 1;
let currentlyEditingId = null; // For transactions
let editingBudgetId = null; // For budgets

// --- LOCAL STORAGE FUNCTIONS (Unchanged) ---
function saveStateToLocalStorage() { /* ... */ }
function loadStateFromLocalStorage() { /* ... */ }

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage();
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    renderTransactions();
    renderBudgets();
    
    // --- Modal & Form Event Listeners ---
    const budgetModal = document.getElementById('budget-modal');
    const budgetForm = document.getElementById('budget-form');
    const budgetModalTitle = budgetModal.querySelector('h3');

    document.getElementById('create-budget-btn').addEventListener('click', () => {
        editingBudgetId = null; // Ensure we are in "create" mode
        budgetModalTitle.textContent = 'Create a New Budget';
        budgetForm.reset();
        document.getElementById('budget-category').disabled = false;
        budgetModal.classList.remove('hidden');
    });

    document.getElementById('cancel-budget-btn').addEventListener('click', () => {
        budgetModal.classList.add('hidden');
    });
    
    budgetForm.addEventListener('submit', handleBudgetFormSubmit);

    // --- Event Delegation for Actions ---
    document.getElementById('transactions-table-body').addEventListener('click', handleTransactionActions);
    document.getElementById('budgets-container').addEventListener('click', handleBudgetActions);

    // ... Other event listeners and initial setup ...
});

// --- ACTION HANDLERS ---
function handleBudgetFormSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('budget-category').value;
    const limit = parseFloat(document.getElementById('budget-limit').value);

    if (isNaN(limit) || limit <= 0) {
        showNotification('Budget limit must be a number greater than zero.', 'error');
        return;
    }

    if (editingBudgetId !== null) {
        // --- Edit Mode ---
        const budget = budgetsData.find(b => b.id === editingBudgetId);
        if (budget) {
            budget.limit = limit;
            showNotification('Budget updated successfully!', 'success');
        }
    } else {
        // --- Create Mode ---
        if (budgetsData.some(b => b.category === category)) {
            showNotification(`A budget for ${category} already exists.`, 'error');
            return;
        }
        budgetsData.push({ id: nextBudgetId++, category, limit });
        showNotification('Budget created successfully!', 'success');
    }

    saveStateToLocalStorage();
    renderBudgets();
    e.target.reset();
    document.getElementById('budget-modal').classList.add('hidden');
}

function handleBudgetActions(e) {
    const target = e.target;
    const budgetCard = target.closest('.card');
    if (!budgetCard) return;

    const budgetId = parseInt(budgetCard.getAttribute('data-id'));

    if (target.closest('.edit-budget-btn')) {
        const budgetToEdit = budgetsData.find(b => b.id === budgetId);
        if (budgetToEdit) {
            editingBudgetId = budgetId;
            const budgetModal = document.getElementById('budget-modal');
            budgetModal.querySelector('h3').textContent = 'Edit Budget';
            
            const categorySelect = document.getElementById('budget-category');
            categorySelect.value = budgetToEdit.category;
            categorySelect.disabled = true; // Prevent changing the category when editing

            document.getElementById('budget-limit').value = budgetToEdit.limit;
            budgetModal.classList.remove('hidden');
        }
    }

    if (target.closest('.delete-budget-btn')) {
        deleteBudget(budgetId);
    }
}

function handleTransactionActions(e) { /* ... Unchanged from previous step ... */ }

// --- BUDGET CRUD & RENDERING ---
function deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget?')) {
        budgetsData = budgetsData.filter(b => b.id !== id);
        saveStateToLocalStorage();
        renderBudgets();
        showNotification('Budget deleted.', 'info');
    }
}

function renderBudgets() {
    const container = document.getElementById('budgets-container');
    container.innerHTML = ''; 

    if (budgetsData.length === 0) {
        container.innerHTML = `<p class="text-gray-500 col-span-full">No budgets created yet. Click "Create Budget" to start!</p>`;
        return;
    }

    budgetsData.forEach(budget => {
        const spent = transactionsData
            .filter(tx => tx.category === budget.category && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        const percentage = Math.min((spent / budget.limit) * 100, 100);
        const remaining = budget.limit - spent;
        
        let progressBarColor = 'bg-green-500';
        if (percentage > 75) progressBarColor = 'bg-yellow-500';
        if (percentage >= 100) progressBarColor = 'bg-red-500';

        const budgetCardHTML = `
            <div class="card p-4 shadow-sm" data-id="${budget.id}">
                <div class="budget-actions">
                    <button class="budget-action-btn edit-budget-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button class="budget-action-btn delete-budget-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
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
        container.innerHTML += budgetCardHTML;
    });
}

// All other functions for transactions, navigation, etc., remain the same.
// Remember to copy the full bodies of all unchanged functions from the previous step.
