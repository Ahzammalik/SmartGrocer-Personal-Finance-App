// Global state variables (Unchanged)
// --- LOCAL STORAGE FUNCTIONS (Unchanged) ---

let spendingChartInstance = null; // To hold the chart instance

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage();
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    updateDashboard(); // Initial update of the dashboard
    renderTransactions();
    renderBudgets();
    
    // ... Event listeners for navigation, modals, forms, etc. ...
});

// --- DASHBOARD FUNCTIONS ---

/**
 * Master function to update all dynamic elements on the dashboard.
 */
function updateDashboard() {
    updateDashboardStats();
    updateSpendingChart();
    renderRecentTransactions();
}

/**
 * Calculates and updates the main stat cards for the current month.
 */
function updateDashboardStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyIncome = transactionsData
        .filter(tx => {
            const txDate = new Date(tx.date);
            return tx.type === 'income' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    const monthlyExpenses = transactionsData
        .filter(tx => {
            const txDate = new Date(tx.date);
            return tx.type === 'expense' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    document.getElementById('total-income-stat').textContent = `$${monthlyIncome.toFixed(2)}`;
    document.getElementById('total-expenses-stat').textContent = `$${monthlyExpenses.toFixed(2)}`;
    // Note: Net Worth and Total Debt are not calculated dynamically yet.
}

/**
 * Gathers data for the current month's expenses and updates the doughnut chart.
 */
function updateSpendingChart() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyExpenses = transactionsData.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.type === 'expense' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const spendingByCategory = monthlyExpenses.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {});

    const chartLabels = Object.keys(spendingByCategory);
    const chartData = Object.values(spendingByCategory);
    
    const ctx = document.getElementById('spending-doughnut-chart').getContext('2d');

    if (spendingChartInstance) {
        spendingChartInstance.destroy(); // Destroy old chart before creating a new one
    }

    spendingChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: ['#228B22', '#3CB371', '#90EE90', '#98FB98', '#00FA9A', '#00FF7F', '#2E8B57']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
}

/**
 * Renders the 5 most recent transactions on the dashboard.
 */
function renderRecentTransactions() {
    const container = document.getElementById('recent-transactions-container');
    container.innerHTML = '';

    const recentTransactions = transactionsData.slice(0, 5);

    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No transactions yet.</p>';
        return;
    }

    recentTransactions.forEach(tx => {
        const item = `
            <div class="recent-transaction-item">
                <div class="recent-transaction-details">
                    <span class="recent-transaction-description">${tx.description}</span>
                    <span class="recent-transaction-category">${tx.category}</span>
                </div>
                <span class="recent-transaction-amount ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
                </span>
            </div>
        `;
        container.innerHTML += item;
    });
}


// --- UPDATED CRUD FUNCTIONS ---
// (All CRUD functions now call updateDashboard() to keep the UI in sync)

function deleteTransaction(id) {
    // ... find and splice logic ...
    saveStateToLocalStorage();
    renderTransactions();
    renderBudgets();
    updateDashboard(); // <-- REFRESH DASHBOARD
    showNotification('Transaction deleted successfully', 'info');
}

function saveTransaction(id) {
    // ... find and update logic ...
    saveStateTo-LocalStorage();
    exitEditMode(); 
    renderBudgets();
    updateDashboard(); // <-- REFRESH DASHBOARD
    showNotification('Transaction updated successfully!', 'success');
}

document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
    // ... add new transaction logic ...
    saveStateToLocalStorage();
    renderTransactions();
    renderBudgets();
    updateDashboard(); // <-- REFRESH DASHBOARD
    // ... reset form and show notification ...
});

// All other helper functions remain the same.
