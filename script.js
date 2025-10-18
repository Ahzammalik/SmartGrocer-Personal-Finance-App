<script>
    // Currency configuration
    const currencies = {
        'USD': { symbol: '$', name: 'US Dollar' },
        'PKR': { symbol: '₨', name: 'Pakistani Rupee' },
        'INR': { symbol: '₹', name: 'Indian Rupee' }
    };

    // Global variables
    let budgets = [];
    let selectedCurrency = 'USD';

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        // Check if user is signed in
        const currentUser = localStorage.getItem('smartgrocer-currentUser');
        if (currentUser) {
            hideSignInOverlay();
            document.getElementById('welcome-user-text').textContent = `Welcome, ${currentUser}!`;
            document.getElementById('user-initial').textContent = currentUser.charAt(0).toUpperCase();
        }

        // Sign-in form
        document.getElementById('signin-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const userName = document.getElementById('signin-name').value.trim();
            if (userName) {
                localStorage.setItem('smartgrocer-currentUser', userName);
                hideSignInOverlay();
                document.getElementById('welcome-user-text').textContent = `Welcome, ${userName}!`;
                document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
                showNotification(`Welcome to SmartGrocer, ${userName}!`, 'success');
            }
        });

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

        // Currency selection
        setupCurrencySelection();
        
        // Budget functionality
        setupBudgetFunctionality();
        
        // Expense syncing
        handleExpenseUpdates();
        
        // Load initial data
        loadBudgets();
        updateUI();
    }

    function setupCurrencySelection() {
        const currencyOptions = document.querySelectorAll('.currency-option');
        selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        
        currencyOptions.forEach(option => {
            option.addEventListener('click', function() {
                const currency = this.getAttribute('data-currency');
                selectedCurrency = currency;
                localStorage.setItem('selectedCurrency', currency);
                
                // Update selected state
                currencyOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Update UI
                updateUI();
                showNotification(`Display currency set to ${currencies[currency].name}`, 'success');
            });
            
            // Set initial selected state
            if (option.getAttribute('data-currency') === selectedCurrency) {
                option.classList.add('selected');
            }
        });
    }

    function setupBudgetFunctionality() {
        // Modal elements
        const addBudgetBtn = document.getElementById('add-budget-btn');
        const addModal = document.getElementById('add-budget-modal');
        const editModal = document.getElementById('edit-budget-modal');
        const closeAddBtn = document.getElementById('close-budget-modal');
        const closeEditBtn = document.getElementById('close-edit-budget-modal');
        const cancelAddBtn = document.getElementById('cancel-budget');
        const addForm = document.getElementById('add-budget-form');
        const editForm = document.getElementById('edit-budget-form');
        const deleteBtn = document.getElementById('delete-budget');

        // Add budget modal
        addBudgetBtn.addEventListener('click', () => {
            addModal.classList.remove('hidden');
            addModal.classList.add('flex');
        });

        // Close modals
        closeAddBtn.addEventListener('click', closeAddModal);
        cancelAddBtn.addEventListener('click', closeAddModal);
        closeEditBtn.addEventListener('click', closeEditModal);

        // Currency symbol updates
        document.getElementById('budget-currency').addEventListener('change', function() {
            document.getElementById('modal-currency-symbol').textContent = currencies[this.value].symbol;
        });

        document.getElementById('edit-budget-currency').addEventListener('change', function() {
            document.getElementById('edit-modal-currency-symbol').textContent = currencies[this.value].symbol;
        });

        // Form submissions
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewBudget();
        });

        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBudget();
        });

        // Delete budget
        deleteBtn.addEventListener('click', function() {
            deleteBudget();
        });

        // Search functionality
        document.getElementById('search-budgets').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterBudgets(searchTerm);
        });

        // Add manual sync button
        addManualSyncButton();
    }

    // Add this function to sync expenses with budgets
    function syncExpensesWithBudgets() {
        // Get all expenses from localStorage
        const expenses = JSON.parse(localStorage.getItem('smartgrocer-expenses') || '[]');
        
        // Reset all budget spent amounts to 0
        budgets.forEach(budget => {
            budget.spent = 0;
        });
        
        // Update budget spent amounts based on expenses
        expenses.forEach(expense => {
            const budget = budgets.find(b => 
                b.category === expense.category && 
                b.currency === expense.currency
            );
            
            if (budget) {
                budget.spent = (budget.spent || 0) + parseFloat(expense.amount);
            }
        });
        
        // Save updated budgets
        saveBudgets();
    }

    // Update the loadBudgets function to include expense syncing
    function loadBudgets() {
        const storedBudgets = localStorage.getItem('smartgrocer-budgets');
        if (storedBudgets) {
            budgets = JSON.parse(storedBudgets);
        }
        
        // Sync with expenses whenever budgets are loaded
        syncExpensesWithBudgets();
    }

    // Add this function to handle expense updates from other pages
    function handleExpenseUpdates() {
        // Listen for storage events (when other tabs update expenses)
        window.addEventListener('storage', function(e) {
            if (e.key === 'smartgrocer-expenses') {
                syncExpensesWithBudgets();
                updateUI();
            }
        });
        
        // Also sync when the page becomes visible again
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                syncExpensesWithBudgets();
                updateUI();
            }
        });
    }

    // Add a manual sync button
    function addManualSyncButton() {
        const quickActions = document.querySelector('.card .space-y-3');
        if (quickActions) {
            const syncButton = document.createElement('button');
            syncButton.type = 'button';
            syncButton.className = 'w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors';
            syncButton.innerHTML = `
                <span class="text-gray-700">Sync with Expenses</span>
                <i class="fas fa-sync-alt text-green-500"></i>
            `;
            syncButton.addEventListener('click', function() {
                syncExpensesWithBudgets();
                updateUI();
                showNotification('Budgets synced with latest expenses!', 'success');
            });
            quickActions.appendChild(syncButton);
        }
    }

    function addNewBudget() {
        const name = document.getElementById('budget-name').value.trim();
        const category = document.getElementById('budget-category').value;
        const currency = document.getElementById('budget-currency').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const period = document.getElementById('budget-period').value;

        // Validation
        if (!name || !category || !amount || amount <= 0) {
            showNotification('Please fill all fields correctly', 'error');
            return;
        }

        const newBudget = {
            id: Date.now().toString(),
            name,
            category,
            currency,
            amount,
            period,
            spent: 0,
            createdAt: new Date().toISOString()
        };

        budgets.push(newBudget);
        saveBudgets();
        closeAddModal();
        updateUI();
        showNotification('Budget created successfully!', 'success');
    }

    function editBudget(budgetId) {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;

        // Populate form
        document.getElementById('edit-budget-id').value = budget.id;
        document.getElementById('edit-budget-name').value = budget.name;
        document.getElementById('edit-budget-category').value = budget.category;
        document.getElementById('edit-budget-currency').value = budget.currency;
        document.getElementById('edit-budget-amount').value = budget.amount;
        document.getElementById('edit-budget-period').value = budget.period;

        // Update currency symbol
        document.getElementById('edit-modal-currency-symbol').textContent = currencies[budget.currency].symbol;

        // Show modal
        document.getElementById('edit-budget-modal').classList.remove('hidden');
        document.getElementById('edit-budget-modal').classList.add('flex');
    }

    function updateBudget() {
        const budgetId = document.getElementById('edit-budget-id').value;
        const name = document.getElementById('edit-budget-name').value.trim();
        const category = document.getElementById('edit-budget-category').value;
        const currency = document.getElementById('edit-budget-currency').value;
        const amount = parseFloat(document.getElementById('edit-budget-amount').value);
        const period = document.getElementById('edit-budget-period').value;

        const budgetIndex = budgets.findIndex(b => b.id === budgetId);
        if (budgetIndex === -1) {
            showNotification('Budget not found', 'error');
            return;
        }

        if (!name || !category || !amount || amount <= 0) {
            showNotification('Please fill all fields correctly', 'error');
            return;
        }

        budgets[budgetIndex] = {
            ...budgets[budgetIndex],
            name,
            category,
            currency,
            amount,
            period
        };

        saveBudgets();
        closeEditModal();
        updateUI();
        showNotification('Budget updated successfully!', 'success');
    }

    function deleteBudget() {
        const budgetId = document.getElementById('edit-budget-id').value;
        
        if (!budgetId) {
            showNotification('Error: Could not find budget to delete', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this budget?')) {
            budgets = budgets.filter(b => b.id !== budgetId);
            saveBudgets();
            closeEditModal();
            updateUI();
            showNotification('Budget deleted successfully!', 'success');
        }
    }

    function closeAddModal() {
        const modal = document.getElementById('add-budget-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('add-budget-form').reset();
        document.getElementById('modal-currency-symbol').textContent = '$';
        document.getElementById('budget-currency').value = 'USD';
    }

    function closeEditModal() {
        const modal = document.getElementById('edit-budget-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function updateUI() {
        renderBudgets();
        updateBudgetOverview();
        updateBudgetProgress();
    }

    function renderBudgets() {
        const container = document.getElementById('budgets-container');
        const currencyInfo = currencies[selectedCurrency];

        // Filter budgets by selected currency
        const filteredBudgets = budgets.filter(budget => budget.currency === selectedCurrency);

        if (filteredBudgets.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-chart-pie text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Budgets in ${currencyInfo.name}</h3>
                    <p class="text-gray-500">Create your first ${selectedCurrency} budget to start tracking your spending.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredBudgets.map(budget => {
            const spent = budget.spent || 0;
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            
            const progressColor = isOverBudget ? 'bg-red-500' : 
                               percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
            
            const icon = getBudgetIcon(budget.category);
            const periodText = getPeriodText(budget.period);

            return `
                <div class="budget-card bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="${icon} text-green-600 text-lg"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">${budget.name}</h4>
                                <p class="text-sm text-gray-600">${budget.category} • ${periodText}</p>
                            </div>
                        </div>
                        <button onclick="editBudget('${budget.id}')" class="text-gray-400 hover:text-green-600 transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Spent: <span class="currency-symbol">${currencyInfo.symbol}</span>${spent.toFixed(2)}</span>
                            <span>Budget: <span class="currency-symbol">${currencyInfo.symbol}</span>${budget.amount.toFixed(2)}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}">
                            ${currencyInfo.symbol}${Math.abs(remaining).toFixed(2)} ${isOverBudget ? 'Over' : 'Remaining'}
                        </p>
                        <p class="text-sm text-gray-500 mt-1">${percentage.toFixed(1)}% of budget used</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function filterBudgets(searchTerm) {
        if (!searchTerm) {
            renderBudgets();
            return;
        }

        const container = document.getElementById('budgets-container');
        const currencyInfo = currencies[selectedCurrency];

        const filteredBudgets = budgets.filter(budget => 
            budget.currency === selectedCurrency &&
            (budget.name.toLowerCase().includes(searchTerm) || 
             budget.category.toLowerCase().includes(searchTerm))
        );

        if (filteredBudgets.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Budgets Found</h3>
                    <p class="text-gray-500">Try adjusting your search terms.</p>
                </div>
            `;
            return;
        }

        // Re-render with filtered budgets
        container.innerHTML = filteredBudgets.map(budget => {
            const spent = budget.spent || 0;
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            
            const progressColor = isOverBudget ? 'bg-red-500' : 
                               percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
            
            const icon = getBudgetIcon(budget.category);
            const periodText = getPeriodText(budget.period);

            return `
                <div class="budget-card bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="${icon} text-green-600 text-lg"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">${budget.name}</h4>
                                <p class="text-sm text-gray-600">${budget.category} • ${periodText}</p>
                            </div>
                        </div>
                        <button onclick="editBudget('${budget.id}')" class="text-gray-400 hover:text-green-600 transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Spent: <span class="currency-symbol">${currencyInfo.symbol}</span>${spent.toFixed(2)}</span>
                            <span>Budget: <span class="currency-symbol">${currencyInfo.symbol}</span>${budget.amount.toFixed(2)}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}">
                            ${currencyInfo.symbol}${Math.abs(remaining).toFixed(2)} ${isOverBudget ? 'Over' : 'Remaining'}
                        </p>
                        <p class="text-sm text-gray-500 mt-1">${percentage.toFixed(1)}% of budget used</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateBudgetOverview() {
        const currencyInfo = currencies[selectedCurrency];
        
        const totalBudget = budgets
            .filter(budget => budget.currency === selectedCurrency)
            .reduce((total, budget) => total + budget.amount, 0);
            
        const totalSpent = budgets
            .filter(budget => budget.currency === selectedCurrency)
            .reduce((total, budget) => total + (budget.spent || 0), 0);
            
        const totalRemaining = totalBudget - totalSpent;

        document.getElementById('total-budget-display').textContent = `${currencyInfo.symbol}${totalBudget.toFixed(2)}`;
        document.getElementById('total-spent-display').textContent = `${currencyInfo.symbol}${totalSpent.toFixed(2)}`;
        document.getElementById('total-remaining-display').textContent = `${currencyInfo.symbol}${Math.max(totalRemaining, 0).toFixed(2)}`;
    }

    function updateBudgetProgress() {
        const container = document.getElementById('budget-progress-container');
        const filteredBudgets = budgets.filter(budget => budget.currency === selectedCurrency);

        if (filteredBudgets.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-chart-pie text-2xl mb-2 opacity-40"></i>
                    <p class="text-sm">No budget data</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredBudgets.map(budget => {
            const spent = budget.spent || 0;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const progressColor = percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
            
            return `
                <div>
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${budget.name}</span>
                        <span>${percentage.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${progressColor}" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function loadBudgets() {
        const storedBudgets = localStorage.getItem('smartgrocer-budgets');
        if (storedBudgets) {
            budgets = JSON.parse(storedBudgets);
        }
    }

    function saveBudgets() {
        localStorage.setItem('smartgrocer-budgets', JSON.stringify(budgets));
    }

    function getBudgetIcon(category) {
        const icons = {
            'Food & Dining': 'fas fa-utensils',
            'Transportation': 'fas fa-car',
            'Shopping': 'fas fa-shopping-bag',
            'Entertainment': 'fas fa-film',
            'Bills & Utilities': 'fas fa-file-invoice-dollar',
            'Healthcare': 'fas fa-heartbeat',
            'Education': 'fas fa-graduation-cap',
            'Travel': 'fas fa-plane',
            'Personal Care': 'fas fa-spa',
            'Other': 'fas fa-wallet'
        };
        return icons[category] || icons.Other;
    }

    function getPeriodText(period) {
        const periods = {
            'weekly': 'Weekly',
            'monthly': 'Monthly',
            'yearly': 'Yearly'
        };
        return periods[period] || 'Monthly';
    }

    function hideSignInOverlay() {
        document.getElementById('signin-overlay').classList.add('hidden');
        document.getElementById('main-app-container').classList.remove('hidden');
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

    // Make functions globally available for onclick handlers
    window.editBudget = editBudget;
</script>
