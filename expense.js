// Expense specific functionality
document.addEventListener('DOMContentLoaded', function() {
    loadExpenseTransactions();
    setupExpenseForm();
});

function loadExpenseTransactions() {
    const expenses = loadTransactions('expense');
    displayExpenses(expenses);
}

function setupExpenseForm() {
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const expenseData = {
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                description: formData.get('description'),
                date: formData.get('date') || new Date().toISOString().split('T')[0],
                currency: selectedCurrency || 'USD'
            };
            
            if (saveTransaction('expense', expenseData)) {
                form.reset();
                loadExpenseTransactions();
                showNotification('Expense added successfully!', 'success');
            }
        });
    }
}

function displayExpenses(expenses) {
    const container = document.getElementById('expenses-container');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-receipt text-3xl mb-3 opacity-40"></i>
                <p>No expenses recorded yet</p>
            </div>
        `;
        return;
    }
    
    const currencyInfo = currencies[selectedCurrency];
    
    container.innerHTML = expenses.map(expense => `
        <div class="expense-item flex justify-between items-center p-4 border border-gray-200 rounded-lg mb-3 bg-white">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-800">${expense.description || 'No description'}</h3>
                        <p class="text-sm text-gray-500">${expense.category} • ${new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <span class="text-red-500 font-bold">-${currencyInfo.symbol}${Math.abs(expense.amount).toFixed(2)}</span>
                </div>
            </div>
            <button onclick="deleteExpense('${expense.id}')" class="ml-4 text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        deleteTransaction('expense', expenseId);
        loadExpenseTransactions();
    }
}
