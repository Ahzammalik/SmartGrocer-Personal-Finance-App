// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Remove sign-in requirement - load app directly
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    }

    // Update welcome message
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        userGreeting.textContent = 'Welcome to SmartGrocer!';
    }

    // Initialize accounts array
    let accounts = loadAccounts();

    // Initialize UI
    initializeApp();
});

function initializeApp() {
    // Load accounts from localStorage
    let accounts = loadAccounts();
    
    // Update total balance
    updateTotalBalance(accounts);
    
    // Render accounts
    renderAccounts(accounts);
    
    // Initialize event listeners
    setupEventListeners(accounts);
}

function setupEventListeners(accounts) {
    // Add Account Functionality
    const addAccountBtn = document.getElementById('add-account-btn');
    const addAccountModal = document.getElementById('add-account-modal');
    const addAccountForm = document.getElementById('add-account-form');
    const cancelAddAccount = document.getElementById('cancel-add-account');

    if (addAccountBtn && addAccountModal) {
        addAccountBtn.addEventListener('click', function() {
            addAccountModal.classList.remove('hidden');
        });
    }

    if (cancelAddAccount && addAccountModal) {
        cancelAddAccount.addEventListener('click', function() {
            addAccountModal.classList.add('hidden');
            resetAddAccountForm();
        });
    }

    if (addAccountForm) {
        addAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddAccount(accounts);
        });
    }

    // Transfer Functionality
    const transferBtn = document.getElementById('transfer-btn');
    const transferModal = document.getElementById('transfer-modal');
    const transferForm = document.getElementById('transfer-form');
    const cancelTransfer = document.getElementById('cancel-transfer');

    if (transferBtn && transferModal) {
        transferBtn.addEventListener('click', function() {
            updateTransferAccountOptions(accounts);
            transferModal.classList.remove('hidden');
        });
    }

    if (cancelTransfer && transferModal) {
        cancelTransfer.addEventListener('click', function() {
            transferModal.classList.add('hidden');
            resetTransferForm();
        });
    }

    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTransfer(accounts);
        });
    }

    // Search Functionality
    const searchInput = document.getElementById('search-accounts');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderAccounts(accounts);
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const addAccountModal = document.getElementById('add-account-modal');
        const transferModal = document.getElementById('transfer-modal');
        
        if (addAccountModal && e.target === addAccountModal) {
            addAccountModal.classList.add('hidden');
            resetAddAccountForm();
        }
        if (transferModal && e.target === transferModal) {
            transferModal.classList.add('hidden');
            resetTransferForm();
        }
    });
}

function handleAddAccount(accounts) {
    const accountNameInput = document.getElementById('account-name');
    const accountTypeInput = document.getElementById('account-type');
    const accountCurrencyInput = document.getElementById('account-currency');
    const initialBalanceInput = document.getElementById('initial-balance');

    if (!accountNameInput || !accountTypeInput || !accountCurrencyInput || !initialBalanceInput) {
        alert('Form elements not found. Please check your HTML structure.');
        return;
    }

    const accountName = accountNameInput.value.trim();
    const accountType = accountTypeInput.value;
    const accountCurrency = accountCurrencyInput.value;
    const initialBalance = parseFloat(initialBalanceInput.value) || 0;

    // Validation
    if (!accountName) {
        alert('Please enter an account name');
        return;
    }

    if (initialBalance < 0) {
        alert('Initial balance cannot be negative');
        return;
    }

    // Check for duplicate account names
    const duplicate = accounts.find(acc => 
        acc.name.toLowerCase() === accountName.toLowerCase()
    );
    
    if (duplicate) {
        alert('An account with this name already exists');
        return;
    }

    // Create new account
    const newAccount = {
        id: generateId(),
        name: accountName,
        type: accountType,
        currency: accountCurrency,
        balance: initialBalance,
        createdAt: new Date().toISOString()
    };

    // Add to accounts array
    accounts.push(newAccount);
    
    // Save to localStorage
    saveAccounts(accounts);
    
    // Update UI
    renderAccounts(accounts);
    updateTotalBalance(accounts);
    
    // Hide modal and reset form
    const addAccountModal = document.getElementById('add-account-modal');
    if (addAccountModal) {
        addAccountModal.classList.add('hidden');
    }
    resetAddAccountForm();
    
    // Show success message
    alert('Account created successfully!');
}

function handleTransfer(accounts) {
    const fromAccountSelect = document.getElementById('from-account');
    const toAccountSelect = document.getElementById('to-account');
    const transferAmountInput = document.getElementById('transfer-amount');

    if (!fromAccountSelect || !toAccountSelect || !transferAmountInput) {
        alert('Transfer form elements not found.');
        return;
    }

    const fromAccountId = fromAccountSelect.value;
    const toAccountId = toAccountSelect.value;
    const amount = parseFloat(transferAmountInput.value);

    // Validation
    if (!fromAccountId || !toAccountId) {
        alert('Please select both accounts');
        return;
    }

    if (fromAccountId === toAccountId) {
        alert('Cannot transfer to the same account');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);

    if (!fromAccount || !toAccount) {
        alert('Invalid account selection');
        return;
    }

    if (fromAccount.balance < amount) {
        alert('Insufficient balance in source account');
        return;
    }

    // Perform transfer
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Save and update UI
    saveAccounts(accounts);
    renderAccounts(accounts);
    updateTotalBalance(accounts);
    
    const transferModal = document.getElementById('transfer-modal');
    if (transferModal) {
        transferModal.classList.add('hidden');
    }
    resetTransferForm();

    alert('Transfer completed successfully!');
}

function deleteAccount(accountId) {
    let accounts = loadAccounts();
    
    if (confirm('Are you sure you want to delete this account?')) {
        accounts = accounts.filter(acc => acc.id !== accountId);
        saveAccounts(accounts);
        renderAccounts(accounts);
        updateTotalBalance(accounts);
        alert('Account deleted successfully!');
    }
}

function renderAccounts(accounts) {
    const accountsList = document.getElementById('accounts-list');
    const searchInput = document.getElementById('search-accounts');
    
    if (!accountsList) {
        console.error('Accounts list element not found');
        return;
    }

    let filteredAccounts = accounts;
    
    // Apply search filter if search input exists
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredAccounts = accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredAccounts.length === 0) {
        accountsList.innerHTML = '<div class="no-accounts">No accounts found. Add your first account!</div>';
        return;
    }

    accountsList.innerHTML = filteredAccounts.map(account => `
        <div class="account-card">
            <div class="account-header">
                <h3>${account.name}</h3>
                <span class="account-type">${account.type}</span>
            </div>
            <div class="account-balance">
                ${formatCurrency(account.balance, account.currency)}
            </div>
            <div class="account-actions">
                <button onclick="deleteAccount('${account.id}')" class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateTransferAccountOptions(accounts) {
    const fromAccountSelect = document.getElementById('from-account');
    const toAccountSelect = document.getElementById('to-account');

    if (fromAccountSelect && toAccountSelect) {
        fromAccountSelect.innerHTML = '<option value="">Select Account</option>';
        toAccountSelect.innerHTML = '<option value="">Select Account</option>';

        accounts.forEach(account => {
            const option = `<option value="${account.id}">${account.name} (${formatCurrency(account.balance, account.currency)})</option>`;
            fromAccountSelect.innerHTML += option;
            toAccountSelect.innerHTML += option;
        });
    }
}

function updateTotalBalance(accounts) {
    const totalBalanceElement = document.getElementById('total-balance');
    if (totalBalanceElement) {
        const total = accounts.reduce((sum, account) => sum + account.balance, 0);
        totalBalanceElement.textContent = formatCurrency(total, 'PKR');
    }
}

function resetAddAccountForm() {
    const addAccountForm = document.getElementById('add-account-form');
    if (addAccountForm) {
        addAccountForm.reset();
        const initialBalanceInput = document.getElementById('initial-balance');
        if (initialBalanceInput) {
            initialBalanceInput.value = '0';
        }
    }
}

function resetTransferForm() {
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.reset();
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount, currency) {
    if (currency === 'PKR') {
        return 'Rs ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        return '$ ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

function loadAccounts() {
    try {
        const stored = localStorage.getItem('smartgrocer-accounts');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading accounts:', error);
        return [];
    }
}

function saveAccounts(accounts) {
    try {
        localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
    } catch (error) {
        console.error('Error saving accounts:', error);
    }
}

// Make functions available globally
window.deleteAccount = deleteAccount;
window.initializeApp = initializeApp;
