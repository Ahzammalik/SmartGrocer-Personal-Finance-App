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
    document.getElementById('welcome-user-text').textContent = `Welcome, ${userName}!`;
    document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
    
    populateStaticContent();
    renderAll();
}

function saveState() {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(appState));
}

function renderAll() {
    renderTransactions('income');
    renderTransactions('expense');
    renderAccounts();
    renderBudgets();
    updateDashboardSummary();
}

// ===================================================================================
// EVENT LISTENERS
// ===================================================================================
function setupEventListeners() {
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

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.getElementById('page-title').textContent = this.textContent.trim();
            if (targetId === 'reports') generateReports(); else destroyCharts();

            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    });

    document.getElementById('fab-add-transaction').addEventListener('click', showAddTransactionChoiceModal);
    document.getElementById('add-account-btn').addEventListener('click', showAccountModal);
    document.getElementById('add-budget-btn').addEventListener('click', showBudgetModal);
    
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
            localStorage.removeItem(APP_DATA_KEY);
            window.location.reload();
        }
    });
}

// ===================================================================================
// UI RENDERING & DOM MANIPULATION
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
        container.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-4">No ${type} recorded yet.</td></tr>`;
        return;
    }
    transactions.forEach(t => {
        const sign = type === 'income' ? '+' : '-';
        const colorClass = type === 'income' ? 'text-green-500' : 'text-red-500';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td class="text-right font-medium ${colorClass}">${sign}₨${t.amount.toFixed(2)}</td>
            <td class="text-center"><button onclick="deleteTransaction('${type}', ${t.id})" class="text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button></td>
        `;
        container.appendChild(row);
    });
}

function renderAccounts() {
    const container = document.getElementById('accounts-container');
    container.innerHTML = '';
     if (!appState.accounts || appState.accounts.length === 0) {
         container.innerHTML = `<p class="text-center text-gray-500 col-span-full">No accounts added yet.</p>`;
         return;
    }
    appState.accounts.forEach(acc => {
        const balanceColor = acc.balance >= 0 ? 'text-gray-800' : 'text-red-600';
        const sign = acc.balance < 0 ? '-' : '';
        const card = document.createElement('div');
        card.className = 'card p-6';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-lg font-semibold text-gray-800">${acc.name}</h4>
                    <p class="text-sm text-gray-500">${acc.type}</p>
                </div>
                <button onclick="deleteAccount(${acc.id})" class="text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button>
            </div>
            <p class="text-3xl font-bold mt-4 ${balanceColor}">${sign}₨${Math.abs(acc.balance).toLocaleString()}</p>
        `;
        container.appendChild(card);
    });
}

function renderBudgets() {
    const container = document.getElementById('budgets-container');
    container.innerHTML = '';
    if (!appState.budgets || appState.budgets.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 col-span-full">No budgets created yet.</p>`;
        return;
    }
    appState.budgets.forEach(b => {
        const spent = appState.transactions.expenses
            .filter(e => e.category === b.category)
            .reduce((sum, e) => sum + e.amount, 0);
        const remaining = b.limit - spent;
        const percentage = Math.min((spent / b.limit) * 100, 100);
        
        let progressColor = 'bg-green-500';
        if (percentage > 75) progressColor = 'bg-yellow-500';
        if (percentage >= 100) progressColor = 'bg-red-500';

        const card = document.createElement('div');
        card.className = 'card p-6 relative';
        card.innerHTML = `
            <button onclick="deleteBudget(${b.id})" class="absolute top-4 right-4 text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button>
            <h4 class="text-lg font-semibold text-gray-800">${b.category}</h4>
            <div class="mt-4">
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Spent: ₨${spent.toLocaleString()}</span>
                    <span>Limit: ₨${b.limit.toLocaleString()}</span>
                </div>
                <div class="progress-bar mt-2"><div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div></div>
                <p class="mt-2 text-sm text-gray-600">₨${remaining.toLocaleString()} remaining</p>
            </div>
        `;
        container.appendChild(card);
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
                <form id="transaction-form" class="space-y-4">
                    <input type="number" name="amount" step="0.01" min="0" required placeholder="Amount (₨)" class="w-full border-b-2 p-3 text-2xl font-bold focus:outline-none focus:border-${color}-500">
                    <input type="text" name="description" required placeholder="Description" class="w-full border p-3 rounded-lg">
                    <input type="text" name="category" required placeholder="Category (e.g., Salary, Groceries)" class="w-full border p-3 rounded-lg">
                    <input type="date" name="date" required class="w-full border p-3 rounded-lg text-gray-500">
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
    document.querySelector('#transaction-form input[name="date"]').valueAsDate = new Date();
}

function showAccountModal() {
     const modalHTML = `
        <div class="modal show" id="account-modal"><div class="modal-content">
            <h3 class="text-xl font-bold mb-4">Add New Account</h3>
            <form id="account-form" class="space-y-4">
                <input type="text" name="name" required placeholder="Account Name (e.g., HBL Savings)" class="w-full border p-3 rounded-lg">
                <input type="text" name="type" required placeholder="Account Type (e.g., Savings)" class="w-full border p-3 rounded-lg">
                <input type="number" name="balance" step="0.01" required placeholder="Initial Balance" class="w-full border p-3 rounded-lg">
                <div class="mt-6 grid grid-cols-2 gap-4">
                    <button type="button" onclick="closeModal()" class="bg-gray-200 py-3 rounded-lg">Cancel</button>
                    <button type="submit" class="bg-primary text-white py-3 rounded-lg">Add</button>
                </div>
            </form>
        </div></div>`;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('account-modal').addEventListener('click', (e) => { if(e.target.id === 'account-modal') closeModal(); });
    document.getElementById('account-form').addEventListener('submit', handleAccountSubmit);
}

function showBudgetModal() {
    const modalHTML = `
        <div class="modal show" id="budget-modal"><div class="modal-content">
            <h3 class="text-xl font-bold mb-4">Create New Budget</h3>
            <form id="budget-form" class="space-y-4">
                <input type="text" name="category" required placeholder="Category (e.g., Groceries)" class="w-full border p-3 rounded-lg">
                <input type="number" name="limit" step="0.01" min="0" required placeholder="Budget Limit" class="w-full border p-3 rounded-lg">
                <div class="mt-6 grid grid-cols-2 gap-4">
                    <button type="button" onclick="closeModal()" class="bg-gray-200 py-3 rounded-lg">Cancel</button>
                    <button type="submit" class="bg-primary text-white py-3 rounded-lg">Create</button>
                </div>
            </form>
        </div></div>`;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('budget-modal').addEventListener('click', (e) => { if(e.target.id === 'budget-modal') closeModal(); });
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => document.getElementById('modal-container').innerHTML = '', 300);
    }
}

// ===================================================================================
// DATA HANDLING (CREATE / DELETE)
// ===================================================================================
function handleTransactionSubmit(e, type) {
    e.preventDefault();
    const form = e.target;
    appState.transactions[type === 'income' ? 'income' : 'expenses'].push({
        id: Date.now(),
        date: form.date.value,
        description: form.description.value,
        category: form.category.value,
        amount: parseFloat(form.amount.value)
    });
    saveState();
    renderAll();
    closeModal();
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
}

function handleAccountSubmit(e) {
    e.preventDefault();
    appState.accounts.push({
        id: Date.now(),
        name: e.target.name.value,
        type: e.target.type.value,
        balance: parseFloat(e.target.balance.value)
    });
    saveState();
    renderAccounts();
    closeModal();
    showNotification('Account added!');
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    const category = e.target.category.value;
    if(appState.budgets.some(b => b.category.toLowerCase() === category.toLowerCase())) {
        alert('A budget for this category already exists.');
        return;
    }
    appState.budgets.push({
        id: Date.now(),
        category: category,
        limit: parseFloat(e.target.limit.value)
    });
    saveState();
    renderBudgets();
    closeModal();
    showNotification('Budget created!');
}

function deleteTransaction(type, id) {
    const key = type === 'income' ? 'income' : 'expenses';
    appState.transactions[key] = appState.transactions[key].filter(t => t.id !== id);
    saveState();
    renderAll();
    showNotification('Transaction deleted.');
}

function deleteAccount(id) {
    appState.accounts = appState.accounts.filter(acc => acc.id !== id);
    saveState();
    renderAccounts();
    showNotification('Account deleted.');
}

function deleteBudget(id) {
    appState.budgets = appState.budgets.filter(b => b.id !== id);
    saveState();
    renderBudgets();
    showNotification('Budget deleted.');
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
    
    activeCharts.incomeExpense = new Chart(document.getElementById('reports-income-expense-chart'), {
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

    activeCharts.expenseCat = new Chart(document.getElementById('expense-categories-chart'), {
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

// ===================================================================================
// STATIC CONTENT POPULATION
// ===================================================================================
function populateStaticContent() {
    // Blog Page Content
    const blogContainer = document.querySelector('#blog .grid');
    const blogPosts = [
        { img: 'finance1', title: '10 Simple Tips for Better Budgeting', desc: 'Learn to manage your money effectively with these easy-to-follow budgeting tips.' },
        { img: 'invest2', title: 'A Beginner\'s Guide to Investing', desc: 'Diving into the world of investing can be daunting. Our guide breaks it down for you.' },
        { img: 'debt3', title: 'Strategies to Pay Off Debt Faster', desc: 'Explore proven methods like the snowball and avalanche techniques to become debt-free.' }
    ];
    blogContainer.innerHTML = blogPosts.map(post => `
        <div class="card overflow-hidden">
            <img src="https://placehold.co/600x400/a7f3d0/14532d?text=${post.img}" alt="${post.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${post.title}</h3>
                <p class="text-gray-600 mb-4">${post.desc}</p>
                <a href="#" class="font-semibold text-primary hover:underline">Read More &rarr;</a>
            </div>
        </div>`).join('');

    // Legal Pages Content
    document.querySelector('#privacy .legal-page').innerHTML = `<h3>Privacy Policy</h3><p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p><p>This page informs you of our policies regarding the collection, use, and disclosure of personal data. All data you enter is stored locally in your browser and is not transmitted to any server.</p><h4>Data We Collect</h4><p>We collect your name and any financial data you enter (income, expenses, accounts, budgets) solely for the purpose of the app's functionality on your device.</p>`;
    document.querySelector('#terms .legal-page').innerHTML = `<h3>Terms and Conditions</h3><p>By accessing or using the Service you agree to be bound by these Terms. This is a demo application provided for illustrative purposes and we are not liable for any data loss or inaccuracies.</p>`;
    document.querySelector('#disclaimers .legal-page').innerHTML = `<h3>Disclaimers</h3><p>The information provided by SmartGrocer is for general informational purposes only and does not constitute financial advice. We make no representation or warranty of any kind regarding the accuracy or completeness of any information.</p>`;
}
