// Add this function to calculate and update dashboard totals
function updateDashboardTotals() {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    // Calculate total income from income table
    const incomeRows = document.querySelectorAll('#income-table-body tr');
    incomeRows.forEach(row => {
        const amountCell = row.querySelector('td:nth-child(5)');
        if (amountCell) {
            const amountText = amountCell.textContent;
            const amount = parseFloat(amountText.replace('+₨', '').replace(/,/g, ''));
            if (!isNaN(amount)) {
                totalIncome += amount;
            }
        }
    });
    
    // Calculate total expenses from expense table
    const expenseRows = document.querySelectorAll('#expense-table-body tr');
    expenseRows.forEach(row => {
        const amountCell = row.querySelector('td:nth-child(5)');
        if (amountCell) {
            const amountText = amountCell.textContent;
            const amount = parseFloat(amountText.replace('-₨', '').replace(/,/g, ''));
            if (!isNaN(amount)) {
                totalExpenses += amount;
            }
        }
    });
    
    // Calculate net balance
    const netBalance = totalIncome - totalExpenses;
    
    // Update the dashboard display
    document.getElementById('total-income-stat').innerHTML = `<span class="currency-symbol">₨</span>${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses-stat').innerHTML = `<span class="currency-symbol">₨</span>${totalExpenses.toFixed(2)}`;
    document.getElementById('net-balance-stat').innerHTML = `<span class="currency-symbol">₨</span>${netBalance.toFixed(2)}`;
    
    // Update the cash flow overview section
    document.querySelector('.progress-fill.bg-income').style.width = '78%'; // You might want to calculate this dynamically too
    document.querySelector('.progress-fill.bg-green-300').style.width = '22%';
    document.querySelector('.progress-fill.bg-expense').style.width = '55%';
    document.querySelector('.progress-fill.bg-red-300').style.width = '45%';
}

// Modify the income form submission to call the update function
if (incomeForm) {
    incomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = document.getElementById('income-date').value;
        const description = document.getElementById('income-description').value;
        const category = document.getElementById('income-category').value;
        const amount = document.getElementById('income-amount').value;
        const account = document.getElementById('income-account').value;
        
        // Add new income to the table
        const tableBody = document.getElementById('income-table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${date}</td>
            <td>${description}</td>
            <td><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${category}</span></td>
            <td>${account}</td>
            <td class="text-right text-income font-medium">+₨${parseFloat(amount).toFixed(2)}</td>
            <td class="text-center">
                <button class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" onclick="deleteTransaction(this, 'income')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(newRow);
        
        // Update dashboard totals
        updateDashboardTotals();
        
        // Show success notification
        showNotification('Income added successfully!');
        
        // Close the modal
        incomeModal.style.display = 'none';
        
        // Reset the form
        incomeForm.reset();
    });
}

// Modify the expense form submission to call the update function
if (expenseForm) {
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = document.getElementById('expense-date').value;
        const description = document.getElementById('expense-description').value;
        const category = document.getElementById('expense-category').value;
        const amount = document.getElementById('expense-amount').value;
        const account = document.getElementById('expense-account').value;
        
        // Add new expense to the table
        const tableBody = document.getElementById('expense-table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${date}</td>
            <td>${description}</td>
            <td><span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">${category}</span></td>
            <td>${account}</td>
            <td class="text-right text-expense font-medium">-₨${parseFloat(amount).toFixed(2)}</td>
            <td class="text-center">
                <button class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" onclick="deleteTransaction(this, 'expense')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(newRow);
        
        // Update dashboard totals
        updateDashboardTotals();
        
        // Show success notification
        showNotification('Expense added successfully!');
        
        // Close the modal
        expenseModal.style.display = 'none';
        
        // Reset the form
        expenseForm.reset();
    });
}

// Modify the deleteTransaction function to call the update function
function deleteTransaction(button, type) {
    const row = button.closest('tr');
    if (confirm(`Are you sure you want to delete this ${type} entry?`)) {
        row.remove();
        
        // Update dashboard totals
        updateDashboardTotals();
        
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} entry deleted successfully!`);
    }
}

// Call the update function when the page loads to set initial values
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Update dashboard totals on page load
    setTimeout(() => {
        updateDashboardTotals();
    }, 1600); // Wait for the loading overlay to disappear
});
