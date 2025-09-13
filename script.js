// Global state variables
let transactionsData = [], budgetsData = [], accountsData = [];
let nextTransactionId = 1, nextBudgetId = 1, nextAccountId = 1;
let currentlyEditingId = null, editingBudgetId = null, editingAccountId = null;

// --- LOCAL STORAGE FUNCTIONS (now include accounts) ---
function saveStateToLocalStorage() {
    localStorage.setItem('smartGrocerTransactions', JSON.stringify(transactionsData));
    localStorage.setItem('smartGrocerBudgets', JSON.stringify(budgetsData));
    localStorage.setItem('smartGrocerAccounts', JSON.stringify(accountsData));
    // ... save next IDs ...
}

function loadStateFromLocalStorage() {
    // ... load transactions and budgets ...
    const savedAccounts = localStorage.getItem('smartGrocerAccounts');
    if (savedAccounts) {
        accountsData = JSON.parse(savedAccounts);
    } else {
        accountsData = [
            { id: 1, name: "Main Checking", type: "Checking", balance: 1500 },
            { id: 2, name: "Visa Credit Card", type: "Credit Card", balance: -450.50 }
        ];
    }
    nextAccountId = parseInt(localStorage.getItem('smartGrocerNextAccountId') || (accountsData.length ? Math.max(...accountsData.map(a => a.id)) + 1 : 1));
}

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage();
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    updateDashboard();
    renderTransactions();
    renderBudgets();
    renderAccounts();
    populateAccountDropdowns();

    // --- Modal & Form Event Listeners ---
    const accountModal = document.getElementById('account-modal');
    document.getElementById('create-account-btn').addEventListener('click', () => openAccountModal());
    document.getElementById('cancel-account-btn').addEventListener('click', () => accountModal.classList.add('hidden'));
    document.getElementById('account-form').addEventListener('submit', handleAccountFormSubmit);
    // ... other modal listeners ...
    
    // --- Event Delegation for Actions ---
    document.getElementById('accounts-container').addEventListener('click', handleAccountActions);
    // ... other action listeners ...
});

// --- ACCOUNT CRUD & RENDERING ---
function renderAccounts() {
    const container = document.getElementById('accounts-container');
    container.innerHTML = '';

    accountsData.forEach(account => {
        const balance = calculateAccountBalance(account.id);
        const balanceColor = balance >= 0 ? 'text-gray-900' : 'text-red-600';

        const accountCardHTML = `
            <div class="card p-6" data-id="${account.id}">
                <div class="budget-actions">
                    <button class="budget-action-btn edit-account-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button class="budget-action-btn delete-account-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
                <h4 class="font-semibold text-lg text-gray-800">${account.name}</h4>
                <p class="account-card-type">${account.type}</p>
                <p class="account-card-balance ${balanceColor}">$${balance.toFixed(2)}</p>
            </div>
        `;
        container.innerHTML += accountCardHTML;
    });
}

function calculateAccountBalance(accountId) {
    const account = accountsData.find(a => a.id === accountId);
    if (!account) return 0;

    let balance = account.balance; // Start with the initial balance
    transactionsData.forEach(tx => {
        // Note: For simplicity, this assumes account name is unique. In a real app, you'd use accountId.
        if (tx.account === account.name) {
            if (tx.type === 'income') {
                balance += tx.amount;
            } else {
                balance -= tx.amount;
            }
        }
    });
    return balance;
}

function handleAccountActions(e) {
    const target = e.target;
    const accountCard = target.closest('.card');
    if (!accountCard) return;

    const accountId = parseInt(accountCard.getAttribute('data-id'));

    if (target.closest('.edit-account-btn')) {
        openAccountModal(accountId);
    }
    if (target.closest('.delete-account-btn')) {
        deleteAccount(accountId);
    }
}

function openAccountModal(id = null) {
    const modal = document.getElementById('account-modal');
    const title = document.getElementById('account-modal-title');
    const form = document.getElementById('account-form');
    const balanceInput = document.getElementById('account-balance');

    editingAccountId = id;
    form.reset();

    if (id) { // Edit mode
        const account = accountsData.find(a => a.id === id);
        title.textContent = 'Edit Account';
        document.getElementById('account-name').value = account.name;
        document.getElementById('account-type').value = account.type;
        balanceInput.value = account.balance;
        balanceInput.previousElementSibling.textContent = 'Starting Balance ($)'; // Change label for clarity
    } else { // Create mode
        title.textContent = 'Create New Account';
        balanceInput.previousElementSibling.textContent = 'Current Balance ($)';
    }
    modal.classList.remove('hidden');
}

function handleAccountFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('account-name').value;
    const type = document.getElementById('account-type').value;
    const balance = parseFloat(document.getElementById('account-balance').value);

    if (editingAccountId) { // Update existing
        const account = accountsData.find(a => a.id === editingAccountId);
        account.name = name;
        account.type = type;
        account.balance = balance;
    } else { // Create new
        accountsData.push({ id: nextAccountId++, name, type, balance });
    }

    saveStateToLocalStorage();
    renderAccounts();
    populateAccountDropdowns();
    document.getElementById('account-modal').classList.add('hidden');
}

function deleteAccount(id) {
    // Safety Check: Don't delete an account if it's used in transactions
    const account = accountsData.find(a => a.id === id);
    const isUsed = transactionsData.some(tx => tx.account === account.name);

    if (isUsed) {
        alert('This account cannot be deleted because it has transactions linked to it. Please reassign or delete those transactions first.');
        return;
    }

    if (confirm(`Are you sure you want to delete the "${account.name}" account?`)) {
        accountsData = accountsData.filter(a => a.id !== id);
        saveStateToLocalStorage();
        renderAccounts();
        populateAccountDropdowns();
    }
}

function populateAccountDropdowns() {
    const select = document.getElementById('quick-account');
    select.innerHTML = ''; // Clear existing options
    accountsData.forEach(account => {
        if (account.type !== 'Credit Card') { // Example: don't pay expenses with a credit card account directly
            const option = document.createElement('option');
            option.value = account.name;
            option.textContent = account.name;
            select.appendChild(option);
        }
    });
}

// All other functions remain the same

// Global state variables (Unchanged)
// --- LOCAL STORAGE FUNCTIONS (Unchanged) ---

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromLocalStorage();
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);

    updateDashboard();
    renderTransactions();
    renderBudgets();
    renderAccounts();
    populateAccountDropdowns();

    // --- Sidebar Controls ---
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    function openSidebar() {
        sidebar.classList.add('sidebar-open');
        sidebarOverlay.classList.remove('hidden');
    }
    function closeSidebar() {
        sidebar.classList.remove('sidebar-open');
        sidebarOverlay.classList.add('hidden');
    }

    mobileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);

    // --- Navigation ---
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage(this.getAttribute('href').substring(1));
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            closeSidebar(); // Close sidebar after navigation
        });
    });
    
    // ... Other event listeners for modals and forms are unchanged ...
});


// --- NAVIGATION FUNCTION (Simplified) ---
function navigateToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const pageTitle = document.getElementById('page-title');
    const navLink = document.querySelector(`a[href="#${pageId}"]`);
    if (navLink) pageTitle.textContent = navLink.textContent.trim();
    // The logic to close the sidebar is now handled by the nav-link's own click listener.
}


// All other functions (CRUD, Rendering, Dashboard, etc.) remain the same.
