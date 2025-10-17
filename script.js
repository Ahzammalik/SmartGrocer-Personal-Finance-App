    <script src="script.js"></script>
    <script>
        // Dashboard Manager for index.html
        class DashboardManager {
            constructor() {
                this.charts = {};
                this.currencies = {
                    'USD': { symbol: '$', name: 'US Dollar', flag: 'US' },
                    'PKR': { symbol: '₨', name: 'Pakistani Rupee', flag: 'PK' },
                    'INR': { symbol: '₹', name: 'Indian Rupee', flag: 'IN' }
                };
                this.init();
            }

            init() {
                console.log('🚀 Initializing Dashboard Manager');
                this.setupEventListeners();
                this.setupCurrencySelection();
                this.checkUserAuth();
                this.setupAutoUpdate();
                
                // Initial dashboard update
                setTimeout(() => {
                    this.updateDashboard();
                }, 100);
            }

            setupEventListeners() {
                // Listen for data updates from ALL pages
                window.addEventListener('smartgrocer-data-update', () => {
                    console.log('📊 Dashboard received data update event');
                    this.updateDashboard();
                });

                // Mobile menu
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                const sidebar = document.getElementById('sidebar');
                const sidebarOverlay = document.getElementById('sidebar-overlay');
                
                if (mobileMenuButton) {
                    mobileMenuButton.addEventListener('click', function() {
                        sidebar.classList.toggle('-translate-x-full');
                        sidebarOverlay.classList.toggle('hidden');
                    });
                }
                
                if (sidebarOverlay) {
                    sidebarOverlay.addEventListener('click', function() {
                        sidebar.classList.add('-translate-x-full');
                        sidebarOverlay.classList.add('hidden');
                    });
                }

                // Sign in form
                const signinForm = document.getElementById('signin-form');
                if (signinForm) {
                    signinForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.handleSignIn();
                    });
                }

                // Add manual refresh button
                this.addRefreshButton();
            }

            addRefreshButton() {
                const header = document.querySelector('header .flex-1');
                if (!header) return;

                // Remove existing button if any
                const existingBtn = document.getElementById('manual-refresh-btn');
                if (existingBtn) existingBtn.remove();

                const refreshBtn = document.createElement('button');
                refreshBtn.id = 'manual-refresh-btn';
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh Now';
                refreshBtn.className = 'ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium';
                refreshBtn.onclick = () => {
                    console.log('🔄 Manual refresh triggered');
                    triggerDataUpdate();
                    this.showNotification('Dashboard refreshed!', 'success');
                };

                header.appendChild(refreshBtn);
            }

            setupAutoUpdate() {
                // Auto-update dashboard every 3 seconds
                setInterval(() => {
                    console.log('🔄 Auto-updating dashboard...');
                    this.updateDashboard();
                }, 3000);
            }

            setupCurrencySelection() {
                const currencyOptions = document.querySelectorAll('.currency-option');
                currencyOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        // Remove selected class from all options
                        currencyOptions.forEach(opt => opt.classList.remove('selected'));
                        // Add selected class to clicked option
                        option.classList.add('selected');
                        
                        const currency = option.getAttribute('data-currency');
                        localStorage.setItem('selectedCurrency', currency);
                        this.updateCurrencyDisplay(currency);
                        this.updateDashboard();
                    });
                });
            }

            checkUserAuth() {
                const userName = localStorage.getItem('smartgrocer-currentUser');
                if (userName) {
                    this.showMainApp(userName);
                    this.updateDashboard();
                } else {
                    console.log('👤 No user found, showing signin overlay');
                }
            }

            handleSignIn() {
                const userName = document.getElementById('signin-name').value.trim();
                const selectedCurrency = document.querySelector('.currency-option.selected')?.getAttribute('data-currency') || 'PKR';
                
                if (userName) {
                    localStorage.setItem('smartgrocer-currentUser', userName);
                    localStorage.setItem('selectedCurrency', selectedCurrency);
                    this.showMainApp(userName);
                    this.updateDashboard();
                    this.showNotification(`Welcome to SmartGrocer, ${userName}!`, 'success');
                }
            }

            showMainApp(userName) {
                document.getElementById('signin-overlay').style.display = 'none';
                document.getElementById('main-app-container').classList.remove('hidden');
                
                if (document.getElementById('user-greeting')) {
                    document.getElementById('user-greeting').textContent = `Hello, ${userName}!`;
                }
                if (document.getElementById('user-initial')) {
                    document.getElementById('user-initial').textContent = userName.charAt(0).toUpperCase();
                }
                
                const currency = localStorage.getItem('selectedCurrency') || 'PKR';
                this.updateCurrencyDisplay(currency);
            }

            updateCurrencyDisplay(currency) {
                const currencyInfo = this.currencies[currency];
                if (currencyInfo) {
                    if (document.getElementById('current-currency')) {
                        document.getElementById('current-currency').textContent = currency;
                    }
                    if (document.getElementById('currency-symbol')) {
                        document.getElementById('currency-symbol').textContent = currencyInfo.symbol;
                    }
                }
            }

            updateDashboard() {
                console.log('🔄 DashboardManager updating dashboard...');
                try {
                    // Use the global updateDashboard function from script.js
                    if (typeof updateDashboard === 'function') {
                        updateDashboard();
                    } else {
                        console.error('❌ updateDashboard function not found');
                    }
                } catch (error) {
                    console.error('❌ Error updating dashboard:', error);
                    this.showNotification('Error updating dashboard data', 'error');
                }
            }

            showNotification(message, type = 'info') {
                const notification = document.getElementById('notification');
                if (!notification) {
                    console.log('❌ Notification element not found');
                    return;
                }
                
                const bgColor = type === 'success' ? 'bg-green-500' :
                               type === 'error' ? 'bg-red-500' :
                               type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
                
                notification.innerHTML = `
                    <div class="${bgColor} text-white p-4 rounded-lg flex items-center justify-between">
                        <div class="flex items-center">
                            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                         type === 'error' ? 'fa-exclamation-circle' : 
                                         type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
                            <span>${message}</span>
                        </div>
                        <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="ml-4 text-white hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                notification.classList.remove('hidden');
                
                setTimeout(() => {
                    notification.classList.add('hidden');
                }, 5000);
            }
        }

        // Initialize dashboard when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🏠 Dashboard DOM loaded, initializing manager...');
            window.dashboardManager = new DashboardManager();
        });

        // Global functions for HTML onclick handlers
        function initializeSampleData() {
            console.log('🎯 Initializing sample data from global function');
            // Create sample data if needed
            const sampleExpenses = [
                {
                    id: 'sample-expense-1',
                    type: 'expense',
                    amount: 4500,
                    category: 'Food & Dining',
                    description: 'Grocery Shopping',
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString()
                }
            ];
            
            const sampleIncome = [
                {
                    id: 'sample-income-1',
                    type: 'income',
                    amount: 75000,
                    category: 'Salary',
                    description: 'Monthly Salary',
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
            localStorage.setItem('income', JSON.stringify(sampleIncome));
            
            triggerDataUpdate();
            showNotification('Sample data added!', 'success');
        }
    </script>
