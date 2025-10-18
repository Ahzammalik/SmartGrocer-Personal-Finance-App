<script>
    // Currency configuration
    const currencies = {
        'USD': { symbol: '$', name: 'US Dollar', flag: 'US' },
        'PKR': { symbol: '₨', name: 'Pakistani Rupee', flag: 'PK' },
        'INR': { symbol: '₹', name: 'Indian Rupee', flag: 'IN' }
    };

    // Global functions
    function deleteAccount(accountId) {
        if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
            const storedAccounts = localStorage.getItem('smartgrocer-accounts');
            let accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
            
            accounts = accounts.filter(acc => acc.id !== accountId);
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
            
            loadAndDisplayAccounts();
            updateTransferDropdowns();
            updateDashboard();
            
            showNotification('Account deleted successfully!', 'success');
        }
    }

    function editAccount(accountId) {
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const account = accounts.find(acc => acc.id === accountId);
        
        if (!account) return;
        
        document.getElementById('account-name').value = account.name;
        document.getElementById('account-type').value = account.type;
        document.getElementById('account-currency').value = account.currency;
        document.getElementById('account-balance').value = account.balance;
        document.getElementById('modal-currency-symbol').textContent = currencies[account.currency].symbol;
        
        document.querySelector('#add-account-modal h3').textContent = 'Edit Account';
        document.querySelector('#add-account-form button[type="submit"]').textContent = 'Update Account';
        
        // Remove any existing event listeners
        const newForm = document.getElementById('add-account-form').cloneNode(true);
        document.getElementById('add-account-form').parentNode.replaceChild(newForm, document.getElementById('add-account-form'));
        
        document.getElementById('add-account-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            account.name = document.getElementById('account-name').value;
            account.type = document.getElementById('account-type').value;
            account.currency = document.getElementById('account-currency').value;
            account.balance = parseFloat(document.getElementById('account-balance').value) || 0;
            
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
            
            loadAndDisplayAccounts();
            updateTransferDropdowns();
            updateDashboard();
            
            closeModal();
            showNotification('Account updated successfully!', 'success');
        });
        
        document.getElementById('add-account-modal').classList.remove('hidden');
        document.getElementById('add-account-modal').classList.add('flex');
    }

    function loadAndDisplayAccounts() {
        const accountsContainer = document.getElementById('accounts-container');
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        
        if (accounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Accounts Yet</h3>
                    <p class="text-gray-500">Add your first account to get started with tracking your finances.</p>
                </div>
            `;
            return;
        }
        
        accountsContainer.innerHTML = accounts.map(account => {
            const currencyInfo = currencies[account.currency];
            const isPositive = account.balance >= 0;
            const balanceClass = isPositive ? 'balance-positive' : 'balance-negative';
            const balanceSign = isPositive ? '' : '-';
            
            const iconClass = {
                'checking': 'fas fa-landmark text-blue-500 bg-blue-100',
                'savings': 'fas fa-piggy-bank text-green-500 bg-green-100',
                'credit': 'fas fa-credit-card text-red-500 bg-red-100',
                'cash': 'fas fa-money-bill-wave text-yellow-500 bg-yellow-100',
                'investment': 'fas fa-chart-line text-purple-500 bg-purple-100',
                'loan': 'fas fa-hand-holding-usd text-orange-500 bg-orange-100',
                'other': 'fas fa-wallet text-gray-500 bg-gray-100'
            }[account.type] || 'fas fa-wallet text-gray-500 bg-gray-100';
            
            return `
                <div class="account-card card p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center">
                            <div class="account-icon ${iconClass.split(' ').slice(2).join(' ')}">
                                <i class="${iconClass.split(' ').slice(0, 2).join(' ')}"></i>
                            </div>
                            <div class="ml-3">
                                <h4 class="font-semibold text-gray-900">${account.name}</h4>
                                <div class="flex items-center mt-1">
                                    <span class="text-sm text-gray-500 capitalize">${account.type}</span>
                                    <span class="currency-badge">${account.currency}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="${balanceClass} font-bold text-lg">
                                ${balanceSign}${currencyInfo.symbol}${Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <span>Account No: ****${account.id.toString().slice(-4)}</span>
                        <div class="flex space-x-2">
                            <button class="text-green-600 hover:text-green-800" onclick="editAccount(${account.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="deleteAccount(${account.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('accounts-count').textContent = accounts.length;
    }
    
    function updateTransferDropdowns() {
        const fromAccountSelect = document.getElementById('from-account');
        const toAccountSelect = document.getElementById('to-account');
        const transferAmount = document.getElementById('transfer-amount');
        const transferBtn = document.getElementById('transfer-btn');
        
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        
        fromAccountSelect.innerHTML = '';
        toAccountSelect.innerHTML = '';
        
        if (accounts.length < 2) {
            fromAccountSelect.innerHTML = '<option value="">Need at least 2 accounts</option>';
            toAccountSelect.innerHTML = '<option value="">Need at least 2 accounts</option>';
            fromAccountSelect.disabled = true;
            toAccountSelect.disabled = true;
            transferAmount.disabled = true;
            transferBtn.disabled = true;
            transferBtn.textContent = 'Add Accounts to Transfer';
            transferBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }
        
        fromAccountSelect.disabled = false;
        toAccountSelect.disabled = false;
        transferAmount.disabled = false;
        transferBtn.disabled = false;
        transferBtn.textContent = 'Transfer Funds';
        transferBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        const defaultOptionFrom = document.createElement('option');
        defaultOptionFrom.value = '';
        defaultOptionFrom.textContent = 'Select Account';
        fromAccountSelect.appendChild(defaultOptionFrom);
        
        const defaultOptionTo = document.createElement('option');
        defaultOptionTo.value = '';
        defaultOptionTo.textContent = 'Select Account';
        toAccountSelect.appendChild(defaultOptionTo);
        
        accounts.forEach(account => {
            const optionFrom = document.createElement('option');
            optionFrom.value = account.id;
            optionFrom.textContent = `${account.name} (${currencies[account.currency].symbol}${account.balance.toFixed(2)})`;
            
            const optionTo = document.createElement('option');
            optionTo.value = account.id;
            optionTo.textContent = `${account.name} (${currencies[account.currency].symbol}${account.balance.toFixed(2)})`;
            
            fromAccountSelect.appendChild(optionFrom);
            toAccountSelect.appendChild(optionTo);
        });
    }
    
    function updateDashboard() {
        updateTotalBalanceDisplay();
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        document.getElementById('accounts-count').textContent = accounts.length;
    }
    
    function updateTotalBalanceDisplay() {
        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        const currencyInfo = currencies[selectedCurrency];
        
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        
        let totalBalance = 0;
        
        accounts.forEach(account => {
            if (account.currency === selectedCurrency) {
                totalBalance += account.balance;
            }
        });
        
        document.getElementById('total-balance-display').textContent = 
            `${currencyInfo.symbol}${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    function closeModal() {
        document.getElementById('add-account-modal').classList.add('hidden');
        document.getElementById('add-account-modal').classList.remove('flex');
        document.getElementById('add-account-form').reset();
        
        document.querySelector('#add-account-modal h3').textContent = 'Add New Account';
        document.querySelector('#add-account-form button[type="submit"]').textContent = 'Add Account';
        
        document.getElementById('modal-currency-symbol').textContent = currencies['USD'].symbol;
        document.getElementById('account-currency').value = 'USD';
        
        // Re-attach the add account form handler
        setupAddAccountForm();
    }
    
    function setupAddAccountForm() {
        // Remove any existing event listeners
        const newForm = document.getElementById('add-account-form').cloneNode(true);
        document.getElementById('add-account-form').parentNode.replaceChild(newForm, document.getElementById('add-account-form'));
        
        // Add new event listener
        document.getElementById('add-account-form').addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted!');
            
            const accountName = document.getElementById('account-name').value;
            const accountType = document.getElementById('account-type').value;
            const accountCurrency = document.getElementById('account-currency').value;
            const accountBalance = parseFloat(document.getElementById('account-balance').value) || 0;
            
            console.log('Creating account:', { accountName, accountType, accountCurrency, accountBalance });
            
            // Get current accounts
            const storedAccounts = localStorage.getItem('smartgrocer-accounts');
            const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
            
            // Create new account
            const newAccount = {
                id: Date.now(),
                name: accountName,
                type: accountType,
                balance: accountBalance,
                currency: accountCurrency
            };
            
            console.log('New account object:', newAccount);
            
            // Add to accounts array
            accounts.push(newAccount);
            
            // Save to localStorage
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
            console.log('Accounts saved to localStorage:', accounts);
            
            // Update UI
            loadAndDisplayAccounts();
            updateTransferDropdowns();
            updateDashboard();
            
            closeModal();
            showNotification('Account added successfully!', 'success');
        });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 
                       type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
        
        notification.innerHTML = `
            <div class="${bgColor} text-white p-4 rounded-lg flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                             type === 'error' ? 'fa-exclamation-circle' : 
                             type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    function filterAccounts(searchTerm) {
        const storedAccounts = localStorage.getItem('smartgrocer-accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const accountsContainer = document.getElementById('accounts-container');
        
        if (!searchTerm) {
            loadAndDisplayAccounts();
            return;
        }
        
        const filteredAccounts = accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm) || 
            account.type.toLowerCase().includes(searchTerm)
        );
        
        if (filteredAccounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Accounts Found</h3>
                    <p class="text-gray-500">Try adjusting your search terms.</p>
                </div>
            `;
            return;
        }
        
        accountsContainer.innerHTML = filteredAccounts.map(account => {
            const currencyInfo = currencies[account.currency];
            const isPositive = account.balance >= 0;
            const balanceClass = isPositive ? 'balance-positive' : 'balance-negative';
            const balanceSign = isPositive ? '' : '-';
            
            const iconClass = {
                'checking': 'fas fa-landmark text-blue-500 bg-blue-100',
                'savings': 'fas fa-piggy-bank text-green-500 bg-green-100',
                'credit': 'fas fa-credit-card text-red-500 bg-red-100',
                'cash': 'fas fa-money-bill-wave text-yellow-500 bg-yellow-100',
                'investment': 'fas fa-chart-line text-purple-500 bg-purple-100',
                'loan': 'fas fa-hand-holding-usd text-orange-500 bg-orange-100',
                'other': 'fas fa-wallet text-gray-500 bg-gray-100'
            }[account.type] || 'fas fa-wallet text-gray-500 bg-gray-100';
            
            return `
                <div class="account-card card p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center">
                            <div class="account-icon ${iconClass.split(' ').slice(2).join(' ')}">
                                <i class="${iconClass.split(' ').slice(0, 2).join(' ')}"></i>
                            </div>
                            <div class="ml-3">
                                <h4 class="font-semibold text-gray-900">${account.name}</h4>
                                <div class="flex items-center mt-1">
                                    <span class="text-sm text-gray-500 capitalize">${account.type}</span>
                                    <span class="currency-badge">${account.currency}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="${balanceClass} font-bold text-lg">
                                ${balanceSign}${currencyInfo.symbol}${Math.abs(account.balance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <span>Account No: ****${account.id.toString().slice(-4)}</span>
                        <div class="flex space-x-2">
                            <button class="text-green-600 hover:text-green-800" onclick="editAccount(${account.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="deleteAccount(${account.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing account page...');
        
        // Mobile menu
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });

        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });

        // Check user auth
        const currentUser = localStorage.getItem('smartgrocer-currentUser');
        if (currentUser) {
            document.getElementById('signin-overlay').classList.add('hidden');
            document.getElementById('main-app-container').classList.remove('hidden');
            document.getElementById('welcome-user-text').textContent = `Welcome, ${currentUser}!`;
            document.getElementById('user-initial').textContent = currentUser.charAt(0).toUpperCase();
        }

        // Sign in form
        document.getElementById('signin-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const userName = document.getElementById('signin-name').value.trim();
            if (userName) {
                localStorage.setItem('smartgrocer-currentUser', userName);
                document.getElementById('signin-overlay').classList.add('hidden');
                document.getElementById('main-app-container').classList.remove('hidden');
                document.getElementById('welcome-user-text').textContent = `Welcome, ${userName}!`;
                document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
                showNotification(`Welcome to SmartGrocer, ${userName}!`, 'success');
            }
        });

        // Currency selection
        const currencyOptions = document.querySelectorAll('.currency-option');
        let selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        
        updateCurrencyDisplay(selectedCurrency);
        
        currencyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const currency = this.getAttribute('data-currency');
                selectedCurrency = currency;
                localStorage.setItem('selectedCurrency', currency);
                
                updateCurrencyDisplay(currency);
                currencyOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                showNotification(`Display currency set to ${currencies[currency].name}`, 'success');
            });
            
            if (option.getAttribute('data-currency') === selectedCurrency) {
                option.classList.add('selected');
            }
        });

        // Account currency change
        document.getElementById('account-currency').addEventListener('change', function() {
            const currency = this.value;
            document.getElementById('modal-currency-symbol').textContent = currencies[currency].symbol;
        });

        // Modal buttons
        document.getElementById('add-account-btn').addEventListener('click', function() {
            console.log('Opening add account modal');
            document.getElementById('add-account-modal').classList.remove('hidden');
            document.getElementById('add-account-modal').classList.add('flex');
        });

        document.getElementById('close-account-modal').addEventListener('click', closeModal);
        document.getElementById('cancel-account').addEventListener('click', closeModal);

        // Transfer form
        document.getElementById('transfer-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fromAccountId = parseInt(document.getElementById('from-account').value);
            const toAccountId = parseInt(document.getElementById('to-account').value);
            const amount = parseFloat(document.getElementById('transfer-amount').value);
            
            if (fromAccountId === toAccountId) {
                showNotification('Cannot transfer to the same account', 'error');
                return;
            }
            
            const storedAccounts = localStorage.getItem('smartgrocer-accounts');
            const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
            const fromAccount = accounts.find(acc => acc.id === fromAccountId);
            const toAccount = accounts.find(acc => acc.id === toAccountId);
            
            if (!fromAccount || !toAccount) {
                showNotification('Account not found', 'error');
                return;
            }
            
            if (fromAccount.balance < amount) {
                showNotification('Insufficient funds for transfer', 'error');
                return;
            }
            
            fromAccount.balance -= amount;
            toAccount.balance += amount;
            
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(accounts));
            
            loadAndDisplayAccounts();
            updateDashboard();
            updateTransferDropdowns();
            
            showNotification('Transfer completed successfully!', 'success');
            this.reset();
        });

        // Search
        document.getElementById('search-accounts').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterAccounts(searchTerm);
        });

        // Initialize form and UI
        setupAddAccountForm();
        loadAndDisplayAccounts();
        updateTransferDropdowns();
        updateDashboard();
        
        console.log('Account page initialized successfully');

        function updateCurrencyDisplay(currency) {
            const currencyInfo = currencies[currency];
            document.getElementById('selected-currency').textContent = currency;
            document.getElementById('currency-symbol').textContent = currencyInfo.symbol;
            updateTotalBalanceDisplay();
            loadAndDisplayAccounts();
        }
    });
</script>
