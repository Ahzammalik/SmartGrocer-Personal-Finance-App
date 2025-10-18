<script>
    // Currency configuration
    const currencies = {
        'USD': { symbol: '$', name: 'US Dollar', flag: 'US' },
        'PKR': { symbol: '₨', name: 'Pakistani Rupee', flag: 'PK' },
        'INR': { symbol: '₹', name: 'Indian Rupee', flag: 'IN' }
    };

    // Global accounts management
    const AccountManager = {
        accounts: [],

        init() {
            this.loadAccountsFromStorage();
        },

        loadAccountsFromStorage() {
            const storedAccounts = localStorage.getItem('smartgrocer-accounts');
            if (storedAccounts) {
                this.accounts = JSON.parse(storedAccounts);
            }
        },

        saveAccountsToStorage() {
            localStorage.setItem('smartgrocer-accounts', JSON.stringify(this.accounts));
        },

        deleteAccount(accountId) {
            if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                console.log('Deleting account:', accountId);
                console.log('Before deletion:', this.accounts);
                
                // Filter out the account to delete
                this.accounts = this.accounts.filter(acc => acc.id !== accountId);
                
                console.log('After deletion:', this.accounts);
                
                // Save to localStorage
                this.saveAccountsToStorage();
                
                // Update UI
                this.renderAccounts();
                this.updateTransferDropdowns();
                this.updateDashboard();
                
                this.showNotification('Account deleted successfully!', 'success');
            }
        },

        editAccount(accountId) {
            // Find the account
            const account = this.accounts.find(acc => acc.id === accountId);
            if (!account) return;
            
            // Populate the modal with account data
            document.getElementById('account-name').value = account.name;
            document.getElementById('account-type').value = account.type;
            document.getElementById('account-currency').value = account.currency;
            document.getElementById('account-balance').value = account.balance;
            document.getElementById('modal-currency-symbol').textContent = currencies[account.currency].symbol;
            
            // Change the modal title and button
            document.querySelector('#add-account-modal h3').textContent = 'Edit Account';
            document.querySelector('#add-account-form button[type="submit"]').textContent = 'Update Account';
            
            // Remove existing event listener and add a new one for updating
            const form = document.getElementById('add-account-form');
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Update account
                account.name = document.getElementById('account-name').value;
                account.type = document.getElementById('account-type').value;
                account.currency = document.getElementById('account-currency').value;
                account.balance = parseFloat(document.getElementById('account-balance').value) || 0;
                
                // Save to localStorage
                this.saveAccountsToStorage();
                
                // Update UI
                this.renderAccounts();
                this.updateTransferDropdowns();
                this.updateDashboard();
                
                this.closeModal();
                this.showNotification('Account updated successfully!', 'success');
            });
            
            // Show the modal
            document.getElementById('add-account-modal').classList.remove('hidden');
            document.getElementById('add-account-modal').classList.add('flex');
        },

        renderAccounts() {
            const accountsContainer = document.getElementById('accounts-container');
            const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
            
            console.log('Rendering accounts:', this.accounts);
            
            if (this.accounts.length === 0) {
                accountsContainer.innerHTML = `
                    <div class="col-span-2 text-center py-12">
                        <i class="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">No Accounts Yet</h3>
                        <p class="text-gray-500">Add your first account to get started with tracking your finances.</p>
                    </div>
                `;
                return;
            }
            
            accountsContainer.innerHTML = this.accounts.map(account => {
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
                                <button class="text-green-600 hover:text-green-800" onclick="AccountManager.editAccount(${account.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="text-red-600 hover:text-red-800" onclick="AccountManager.deleteAccount(${account.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Update accounts count
            document.getElementById('accounts-count').textContent = this.accounts.length;
        },

        updateTransferDropdowns() {
            const fromAccountSelect = document.getElementById('from-account');
            const toAccountSelect = document.getElementById('to-account');
            const transferAmount = document.getElementById('transfer-amount');
            const transferBtn = document.getElementById('transfer-btn');
            
            // Clear existing options
            fromAccountSelect.innerHTML = '';
            toAccountSelect.innerHTML = '';
            
            if (this.accounts.length < 2) {
                // Not enough accounts for transfer
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
            
            // Enable transfer functionality
            fromAccountSelect.disabled = false;
            toAccountSelect.disabled = false;
            transferAmount.disabled = false;
            transferBtn.disabled = false;
            transferBtn.textContent = 'Transfer Funds';
            transferBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Add default options
            const defaultOptionFrom = document.createElement('option');
            defaultOptionFrom.value = '';
            defaultOptionFrom.textContent = 'Select Account';
            fromAccountSelect.appendChild(defaultOptionFrom);
            
            const defaultOptionTo = document.createElement('option');
            defaultOptionTo.value = '';
            defaultOptionTo.textContent = 'Select Account';
            toAccountSelect.appendChild(defaultOptionTo);
            
            // Add accounts to dropdowns
            this.accounts.forEach(account => {
                const optionFrom = document.createElement('option');
                optionFrom.value = account.id;
                optionFrom.textContent = `${account.name} (${currencies[account.currency].symbol}${account.balance.toFixed(2)})`;
                
                const optionTo = document.createElement('option');
                optionTo.value = account.id;
                optionTo.textContent = `${account.name} (${currencies[account.currency].symbol}${account.balance.toFixed(2)})`;
                
                fromAccountSelect.appendChild(optionFrom);
                toAccountSelect.appendChild(optionTo);
            });
        },

        updateDashboard() {
            this.updateTotalBalanceDisplay();
            document.getElementById('accounts-count').textContent = this.accounts.length;
        },

        updateTotalBalanceDisplay() {
            const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
            const currencyInfo = currencies[selectedCurrency];
            
            // Calculate total balance in selected currency
            let totalBalance = 0;
            
            this.accounts.forEach(account => {
                // In a real app, you would convert currencies
                // For demo, we'll just sum accounts in the selected currency
                if (account.currency === selectedCurrency) {
                    totalBalance += account.balance;
                }
            });
            
            document.getElementById('total-balance-display').textContent = 
                `${currencyInfo.symbol}${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        },

        closeModal() {
            document.getElementById('add-account-modal').classList.add('hidden');
            document.getElementById('add-account-modal').classList.remove('flex');
            document.getElementById('add-account-form').reset();
            
            // Reset modal title and button
            document.querySelector('#add-account-modal h3').textContent = 'Add New Account';
            document.querySelector('#add-account-form button[type="submit"]').textContent = 'Add Account';
            
            // Reset modal currency symbol
            document.getElementById('modal-currency-symbol').textContent = currencies['USD'].symbol;
            document.getElementById('account-currency').value = 'USD';
            
            // Reset form event listener to default add behavior
            const form = document.getElementById('add-account-form');
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const accountName = document.getElementById('account-name').value;
                const accountType = document.getElementById('account-type').value;
                const accountCurrency = document.getElementById('account-currency').value;
                const accountBalance = parseFloat(document.getElementById('account-balance').value) || 0;
                
                // Add new account
                const newAccount = {
                    id: Date.now(),
                    name: accountName,
                    type: accountType,
                    balance: accountBalance,
                    currency: accountCurrency
                };
                
                this.accounts.push(newAccount);
                
                // Save to localStorage
                this.saveAccountsToStorage();
                
                // Update UI
                this.renderAccounts();
                this.updateTransferDropdowns();
                this.updateDashboard();
                
                this.closeModal();
                this.showNotification('Account added successfully!', 'success');
            });
        },

        showNotification(message, type = 'info') {
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
        },

        filterAccounts(searchTerm) {
            if (!searchTerm) {
                this.renderAccounts();
                return;
            }
            
            const filteredAccounts = this.accounts.filter(account => 
                account.name.toLowerCase().includes(searchTerm) || 
                account.type.toLowerCase().includes(searchTerm)
            );
            
            const accountsContainer = document.getElementById('accounts-container');
            
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
                                <button class="text-green-600 hover:text-green-800" onclick="AccountManager.editAccount(${account.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="text-red-600 hover:text-red-800" onclick="AccountManager.deleteAccount(${account.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize account manager
        AccountManager.init();

        // Mobile menu functionality
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

        // Check if user is already signed in
        const currentUser = localStorage.getItem('smartgrocer-currentUser');
        if (currentUser) {
            hideSignInOverlay();
            document.getElementById('welcome-user-text').textContent = `Welcome, ${currentUser}!`;
            document.getElementById('user-initial').textContent = currentUser.charAt(0).toUpperCase();
        }

        // Initialize sign-in form
        document.getElementById('signin-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const userName = document.getElementById('signin-name').value.trim();
            if (userName) {
                localStorage.setItem('smartgrocer-currentUser', userName);
                hideSignInOverlay();
                document.getElementById('welcome-user-text').textContent = `Welcome, ${userName}!`;
                document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
                AccountManager.showNotification(`Welcome to SmartGrocer, ${userName}!`, 'success');
            }
        });

        // Currency selection
        const currencyOptions = document.querySelectorAll('.currency-option');
        let selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        
        // Initialize currency display
        updateCurrencyDisplay(selectedCurrency);
        
        currencyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const currency = this.getAttribute('data-currency');
                selectedCurrency = currency;
                localStorage.setItem('selectedCurrency', currency);
                
                // Update UI
                updateCurrencyDisplay(currency);
                
                // Update selected state
                currencyOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                AccountManager.showNotification(`Display currency set to ${currencies[currency].name}`, 'success');
            });
            
            // Set initial selected state
            if (option.getAttribute('data-currency') === selectedCurrency) {
                option.classList.add('selected');
            }
        });

        // Account currency change handler
        document.getElementById('account-currency').addEventListener('change', function() {
            const currency = this.value;
            document.getElementById('modal-currency-symbol').textContent = currencies[currency].symbol;
        });

        // Initialize account modal
        document.getElementById('add-account-btn').addEventListener('click', function() {
            document.getElementById('add-account-modal').classList.remove('hidden');
            document.getElementById('add-account-modal').classList.add('flex');
        });

        document.getElementById('close-account-modal').addEventListener('click', () => AccountManager.closeModal());
        document.getElementById('cancel-account').addEventListener('click', () => AccountManager.closeModal());

        // Search functionality
        document.getElementById('search-accounts').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            AccountManager.filterAccounts(searchTerm);
        });

        // Initial render
        AccountManager.renderAccounts();
        AccountManager.updateTransferDropdowns();
        AccountManager.updateDashboard();
        
        // Set up auto-update interval
        setInterval(() => {
            autoUpdateDashboard();
        }, 30000);

        function hideSignInOverlay() {
            document.getElementById('signin-overlay').classList.add('hidden');
            document.getElementById('main-app-container').classList.remove('hidden');
        }

        function updateCurrencyDisplay(currency) {
            const currencyInfo = currencies[currency];
            document.getElementById('selected-currency').textContent = currency;
            document.getElementById('currency-symbol').textContent = currencyInfo.symbol;
            
            // Update total balance display
            AccountManager.updateTotalBalanceDisplay();
            
            // Re-render accounts to show updated currency symbols
            AccountManager.renderAccounts();
        }
        
        function autoUpdateDashboard() {
            // Simulate data updates
            const updateIndicator = document.getElementById('auto-update-indicator');
            updateIndicator.classList.add('animate-pulse');
            
            // In a real app, this would fetch updated data from a server
            setTimeout(() => {
                AccountManager.updateDashboard();
                updateIndicator.classList.remove('animate-pulse');
            }, 1000);
        }
    });
</script>
