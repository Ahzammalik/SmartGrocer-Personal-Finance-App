// Income specific functionality  
document.addEventListener('DOMContentLoaded', function() {
    loadIncomeTransactions();
    setupIncomeForm();
});

function loadIncomeTransactions() {
    const income = loadTransactions('income');
    displayIncome(income);
}

function setupIncomeForm() {
    const form = document.getElementById('income-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const incomeData = {
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                description: formData.get('description'),
                date: formData.get('date') || new Date().toISOString().split('T')[0],
                currency: selectedCurrency || 'USD'
            };
            
            if (saveTransaction('income', incomeData)) {
                form.reset();
                loadIncomeTransactions();
                showNotification('Income added successfully!', 'success');
            }
        });
    }
}

function displayIncome(income) {
    const container = document.getElementById('income-container');
    if (!container) return;
    
    if (income.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-money-bill-wave text-3xl mb-3 opacity-40"></i>
                <p>No income recorded yet</p>
            </div>
        `;
        return;
    }
    
    const currencyInfo = currencies[selectedCurrency];
    
    container.innerHTML = income.map(incomeItem => `
        <div class="income-item flex justify-between items-center p-4 border border-gray-200 rounded-lg mb-3 bg-white">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-800">${incomeItem.description || 'No description'}</h3>
                        <p class="text-sm text-gray-500">${incomeItem.category} • ${new Date(incomeItem.date).toLocaleDateString()}</p>
                    </div>
                    <span class="text-green-500 font-bold">+${currencyInfo.symbol}${Math.abs(incomeItem.amount).toFixed(2)}</span>
                </div>
            </div>
            <button onclick="deleteIncome('${incomeItem.id}')" class="ml-4 text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteIncome(incomeId) {
    if (confirm('Are you sure you want to delete this income?')) {
        deleteTransaction('income', incomeId);
        loadIncomeTransactions();
    }
}
