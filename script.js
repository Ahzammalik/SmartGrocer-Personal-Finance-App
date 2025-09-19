// ===================================================================================
// APP INITIALIZATION & STATE MANAGEMENT
// ===================================================================================
const APP_DATA_KEY = 'smartGrocerData';
let appState = {};
let activeCharts = {};

document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem(APP_DATA_KEY);
    if (userData) {
        appState = JSON.parse(userData);
        initializeApp();
    } else {
        document.getElementById('signin-overlay').style.display = 'flex';
    }

    document.getElementById('signin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = document.getElementById('signin-name').value.trim();
        if (userName) {
            initializeNewUser(userName);
            initializeApp();
        }
    });

    setupEventListeners();
});

function initializeNewUser(userName) {
    appState = {
        user: { name: userName },
        transactions: { income: [], expenses: [] },
        accounts: [],
        budgets: []
    };
    saveState();
}

function initializeApp() {
    document.getElementById('signin-overlay').style.display = 'none';
    document.getElementById('main-app-container').style.visibility = 'visible';
    const userName = appState.user.name;
    document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
    document.getElementById('settings-username').textContent = userName;

    renderAll();
}

function saveState() {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(appState));
}

function renderAll() {
    renderTransactions('income');
    renderTransactions('expense');
    updateDashboardSummary();
}

// ===================================================================================
// EVENT LISTENERS
// ===================================================================================
function setupEventListeners() {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    // Universal Navigation Handler
    const handleNavigation = (targetId) => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(targetId);
        if(targetPage) {
            targetPage.classList.add('active');
            let title = targetId.charAt(0).toUpperCase() + targetId.slice(1);
            if(targetId === 'transactions') title = 'All Transactions';
            document.getElementById('page-title').textContent = title;
        }

        // Handle active state for bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.target === targetId);
        });

        if (targetId === 'reports') generateReports(); else destroyCharts();
        
        // Close sidebar after navigation
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    };

    // Bottom Navigation
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.addEventListener('click', () => handleNavigation(item.dataset.target));
    });

    // Sidebar Navigation
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // For sidebar items that have a corresponding bottom nav item, switch to it
            const mainTargets = ['dashboard', 'reports', 'settings'];
            const transactionTargets = ['income', 'expenses'];
            if (mainTargets.includes(targetId)) {
                 handleNavigation(targetId);
            } else if (transactionTargets.includes(targetId)) {
                handleNavigation('transactions');
            } else {
                 handleNavigation(targetId); // For pages only in sidebar
            }
        });
    });

    // FAB and Modals
    document.getElementById('fab-add-transaction').addEventListener('click', showAddTransactionChoiceModal);
    
    // Settings
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
            localStorage.removeItem(APP_DATA_KEY);
            window.location.reload();
        }
    });
}


// ===================================================================================
// UI RENDERING
// ===================================================================================
function updateDashboardSummary() {
    const totalIncome = appState.transactions.income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = appState.transactions.expenses.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const formatCurrency = (val) => `₨${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    document.getElementById('total-income-stat').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses-stat').textContent = formatCurrency(totalExpenses);
    document.getElementById('net-balance-stat').textContent = formatCurrency(netBalance);
}

function renderTransactions(type) {
    const container = document.getElementById(`${type}-table-body`);
    container.innerHTML = '';
    const transactions = appState.transactions[type === 'income' ? 'income' : 'expenses'];
    
    if (transactions.length === 0) {
        container.innerHTML = `<tr><td class="text-center text-gray-500 py-4">No ${type} recorded.</td></tr>`;
        return;
    }

    transactions.slice().reverse().forEach(t => { // Show newest first
        const sign = type === 'income' ? '+' : '-';
        const colorClass = type === 'income' ? 'text-green-500' : 'text-red-500';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2 align-middle">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-green-100' : 'bg-red-100'} ${colorClass}">
                        <i class="fas ${type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    </div>
                    <div class="ml-3">
                        <p class="font-semibold text-gray-800">${t.description}</p>
                        <p class="text-sm text-gray-500">${t.date}</p>
                    </div>
                </div>
            </td>
            <td class="p-2 align-middle text-right font-semibold ${colorClass}">
                ${sign}₨${t.amount.toFixed(2)}
            </td>
            <td class="p-2 align-middle text-right">
                <button onclick="deleteTransaction('${type}', ${t.id})" class="text-gray-400 hover:text-red-500 w-8 h-8"><i class="fas fa-trash"></i></button>
            </td>
        `;
        container.appendChild(row);
    });
}


// ===================================================================================
// MODAL MANAGEMENT
// ===================================================================================
function showAddTransactionChoiceModal() {
     const modalHTML = `
        <div class="modal show" id="choice-modal">
            <div class="modal-content">
                <h3 class="text-xl font-bold mb-6 text-center">What would you like to add?</h3>
                <div class="grid grid-cols-2 gap-4">
                     <button id="modal-add-income" class="bg-green-500 text-white font-bold py-4 px-4 rounded-lg text-lg"><i class="fas fa-plus mr-2"></i>Income</button>
                     <button id="modal-add-expense" class="bg-red-500 text-white font-bold py-4 px-4 rounded-lg text-lg"><i class="fas fa-minus mr-2"></i>Expense</button>
                </div>
            </div>
        </div>`;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('choice-modal').addEventListener('click', (e) => { if(e.target.id === 'choice-modal') closeModal(); });
    document.getElementById('modal-add-income').addEventListener('click', () => showTransactionModal('income'));
    document.getElementById('modal-add-expense').addEventListener('click', () => showTransactionModal('expense'));
}

function showTransactionModal(type) {
    const color = type === 'income' ? 'green' : 'red';
    const modalHTML = `
        <div class="modal show" id="transaction-modal">
            <div class="modal-content">
                <h3 class="text-xl font-bold mb-4 text-${color}-500">New ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <form id="transaction-form">
                    <div class="space-y-4">
                        <input type="number" name="amount" step="0.01" min="0" required placeholder="Amount (₨)" class="w-full border-b-2 p-3 text-2xl font-bold focus:outline-none focus:border-${color}-500">
                        <input type="text" name="description" required placeholder="Description" class="w-full border p-3 rounded-lg">
                        <input type="text" name="category" required placeholder="Category (e.g., Salary, Groceries)" class="w-full border p-3 rounded-lg">
                        <input type="date" name="date" required class="w-full border p-3 rounded-lg text-gray-500">
                    </div>
                    <div class="mt-6 grid grid-cols-2 gap-4">
                        <button type="button" onclick="closeModal()" class="bg-gray-200 py-3 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" class="bg-${color}-500 text-white py-3 rounded-lg font-bold">Add</button>
                    </div>
                </form>
            </div>
        </div>`;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('transaction-modal').addEventListener('click', (e) => { if(e.target.id === 'transaction-modal') closeModal(); });
    document.getElementById('transaction-form').addEventListener('submit', (e) => handleTransactionSubmit(e, type));
    // Set default date
    document.querySelector('#transaction-form input[name="date"]').valueAsDate = new Date();
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.getElementById('modal-container').innerHTML = '';
        }, 300); // Wait for animation to finish
    }
}


// ===================================================================================
// DATA HANDLING
// ===================================================================================
function handleTransactionSubmit(e, type) {
    e.preventDefault();
    const form = e.target;
    const newTransaction = {
        id: Date.now(),
        date: form.date.value,
        description: form.description.value,
        category: form.category.value,
        amount: parseFloat(form.amount.value)
    };
    appState.transactions[type === 'income' ? 'income' : 'expenses'].push(newTransaction);
    saveState();
    renderTransactions(type);
    updateDashboardSummary();
    closeModal();
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
}

function deleteTransaction(type, id) {
    const key = type === 'income' ? 'income' : 'expenses';
    appState.transactions[key] = appState.transactions[key].filter(t => t.id !== id);
    saveState();
    renderTransactions(type);
    updateDashboardSummary();
    showNotification('Transaction deleted.');
}


// ===================================================================================
// REPORTS & CHARTS
// ===================================================================================
function destroyCharts() {
    Object.values(activeCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    activeCharts = {};
}

function generateReports() {
    destroyCharts();
    
    // Check if pages are visible and canvases exist
    const incomeExpenseCanvas = document.getElementById('reports-income-expense-chart');
    const expenseCategoriesCanvas = document.getElementById('expense-categories-chart');

    if (!incomeExpenseCanvas || !expenseCategoriesCanvas) return;
    
    const monthlyData = [...appState.transactions.income, ...appState.transactions.expenses]
        .reduce((acc, t) => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
            const type = appState.transactions.income.some(inc => inc.id === t.id) ? 'income' : 'expenses';
            acc[month][type] += t.amount;
            return acc;
        }, {});
    
    const sortedMonths = Object.keys(monthlyData).sort((a,b) => new Date(a) - new Date(b));

    const expenseByCategory = appState.transactions.expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
    
    activeCharts.incomeExpense = new Chart(incomeExpenseCanvas, {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [
                { label: 'Income', data: sortedMonths.map(m => monthlyData[m].income), backgroundColor: '#10B981' },
                { label: 'Expenses', data: sortedMonths.map(m => monthlyData[m].expenses), backgroundColor: '#EF4444' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    activeCharts.expenseCat = new Chart(expenseCategoriesCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseByCategory),
            datasets: [{ 
                data: Object.values(expenseByCategory),
                backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
}
