// script.js
document.addEventListener('DOMContentLoaded', function() {
    const mainApp = document.getElementById('main-app');
    const userGreeting = document.getElementById('user-greeting');
    
    // Remove sign-in requirement - load app directly
    mainApp.classList.remove('hidden');
    userGreeting.textContent = 'Welcome to SmartGrocer!';

    // Account Management
    const addAccountBtn = document.getElementById('add-account-btn');
    const addAccountModal = document.getElementById('add-account-modal');
    const addAccountForm = document.getElementById('add-account-form');
    const cancelAddAccount = document.getElementById('cancel-add-account');
    const accountsList = document.getElementById('accounts-list');
    const totalBalanceElement = document.getElementById('total-balance');

    // Transfer Management
    const transferModal = document.getElementById('transfer-modal');
    const transferForm = document.getElementById('transfer-form');
    const cancelTransfer = document.getElementById('cancel-transfer');
    const fromAccountSelect = document.getElementById('from-account');
    const toAccountSelect = document.getElementById('to-account');

    // Search
    const searchInput = document.getElementById('search-accounts');

    // Initialize
    let accounts = loadAccounts();
    renderAccounts();
    updateTotalBalance();

    // Add Account Functionality
    addAccountBtn.addEventListener('click', function() {
        addAccountModal.classList.remove('hidden');
    });

    cancelAddAccount.addEventListener('click', function() {
        addAccountModal.classList.add('hidden');
        resetAddAccountForm();
    });

    addAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddAccount();
    });

    // Transfer Functionality
    document.getElementById('transfer-btn').addEventListener('click', function() {
        updateTransferAccountOptions();
        transferModal.classList.remove('hidden');
    });

    cancelTransfer.addEventListener('click', function() {
        transferModal.classList.add('hidden');
        resetTransferForm();
    });

    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleTransfer();
    });

    // Search Functionality
    searchInput.addEventListener('input', function() {
        renderAccounts();
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === addAccountModal) {
            addAccountModal.classList.add('hidden');
            resetAddAccountForm();
        }
        if (e.target === transferModal) {
            transferModal.classList.add('hidden');
            resetTransferForm();
        }
    });

    function handleAddAccount() {
        const accountName = document.getElementById('account-name').value.trim();
        const accountType = document.getElementById('account-type').value;
        const accountCurrency = document.getElementById('account-currency').value;
        const initialBalance = parseFloat(document.getElementById('initial-balance').value) || 0;

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
        saveAccounts();
        
        // Update UI
        renderAccounts();
        updateTotalBalance();
        
        // Hide modal and reset form
        addAccountModal.classList.add('hidden');
        resetAddAccountForm();
        
        // Show success message
        alert('Account created successfully!');
    }

    function handleTransfer() {
        const fromAccountId = fromAccountSelect.value;
        const toAccountId = toAccountSelect.value;
        const amount = parseFloat(document.getElementById('transfer-amount').value);

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
        saveAccounts();
        renderAccounts();
        updateTotalBalance();
        transferModal.classList.add('hidden');
        resetTransferForm();

        alert('Transfer completed successfully!');
    }

    function deleteAccount(accountId) {
        if (confirm('Are you sure you want to delete this account?')) {
            accounts = accounts.filter(acc => acc.id !== accountId);
            saveAccounts();
            renderAccounts();
            updateTotalBalance();
            alert('Account deleted successfully!');
        }
    }

    function renderAccounts() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredAccounts = accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm)
        );

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

    function updateTransferAccountOptions() {
        fromAccountSelect.innerHTML = '<option value="">Select Account</option>';
        toAccountSelect.innerHTML = '<option value="">Select Account</option>';

        accounts.forEach(account => {
            const option = `<option value="${account.id}">${account.name} (${formatCurrency(account.balance, account.currency)})</option>`;
            fromAccountSelect.innerHTML += option;
            toAccountSelect.innerHTML += option;
        });
    }

    function updateTotalBalance() {
        const total = accounts.reduce((sum, account) => sum + account.balance, 0);
        totalBalanceElement.textContent = formatCurrency(total, 'PKR');
    }

    function resetAddAccountForm() {
        addAccountForm.reset();
        document.getElementById('initial-balance').value = '0';
    }

    function resetTransferForm() {
        transferForm.reset();
        fromAccountSelect.innerHTML = '<option value="">Select Account</option>';
        toAccountSelect.innerHTML = '<option value="">Select Account</option>';
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

    function saveAccounts() {
        try {
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
        } catch (error) {
            console.error('Error saving accounts:', error);
        }
    }

    // Make deleteAccount function available globally
    window.deleteAccount = deleteAccount;
});
