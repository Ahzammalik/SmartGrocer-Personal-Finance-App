// Global state to hold transactions
let transactionsData = [
    {
        id: 1, // Unique ID for each transaction
        date: "2025-09-12",
        description: "Initial Salary",
        category: "Income",
        amount: 2500.00,
        account: "Checking Account",
        type: "income"
    },
    {
        id: 2,
        date: "2025-09-13",
        description: "Grocery Shopping",
        category: "Groceries",
        amount: 125.50,
        account: "Credit Card",
        type: "expense"
    }
];
let nextTransactionId = 3; // Keep track of the next available ID

// Basic application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading process
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1500);

    // Initial render of transactions
    renderTransactions();
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToPage(targetId);
            
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.querySelector('aside').classList.toggle('hidden');
    });
    
    // Quick expense form submission
    document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const description = document.getElementById('quick-description').value;
        const category = document.getElementById('quick-category').value;
        const account = document.getElementById('quick-account').value;
        
        if (!amount || !description || !category || !account) {
            showNotification('Please fill out all fields', 'error');
            return;
        }
        
        const newTransaction = {
            id: nextTransactionId++, // Assign a unique ID
            date: new Date().toISOString().split('T')[0],
            description,
            category,
            amount,
            account,
            type: "expense"
        };
        transactionsData.unshift(newTransaction);

        renderTransactions();
        
        // Update dashboard stats
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses + amount).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth - amount).toFixed(2);

        this.reset();
        showNotification(`Added expense: $${amount} for ${description}`, 'success');
    });

    // Event listener for deleting transactions
    document.getElementById('transactions-table-body').addEventListener('click', function(e) {
        // Find the closest trash icon that was clicked
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const transactionId = parseInt(deleteButton.getAttribute('data-id'));
            deleteTransaction(transactionId);
        }
    });
    
    // Other event listeners (Tax, AI Report) remain the same...
    
    navigateToPage('dashboard');
    document.querySelector('a[href="#dashboard"]').classList.add('active');
    initializeSampleData();
});

function deleteTransaction(id) {
    const transactionIndex = transactionsData.findIndex(tx => tx.id === id);
    if (transactionIndex === -1) return;

    const transactionToDelete = transactionsData[transactionIndex];
    const amount = transactionToDelete.amount;

    // Remove transaction from the array
    transactionsData.splice(transactionIndex, 1);

    // Re-render the table
    renderTransactions();

    // Update dashboard stats based on the type of transaction deleted
    if (transactionToDelete.type === 'expense') {
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('total-expenses-stat').textContent = '$' + (currentExpenses - amount).toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth + amount).toFixed(2);
    } else if (transactionToDelete.type === 'income') {
        const currentIncome = parseFloat(document.getElementById('total-income-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('total-income-stat').textContent = '$' + (currentIncome - amount).toFixed(2);

        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        document.getElementById('net-worth-stat').textContent = '$' + (currentNetWorth - amount).toFixed(2);
    }

    showNotification('Transaction deleted successfully', 'info');
}

function renderTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    transactionsData.forEach(tx => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';

        const amountColor = tx.type === 'income' ? 'text-green-600' : 'text-red-600';
        const amountPrefix = tx.type === 'income' ? '+' : '-';

        row.innerHTML = `
            <td class="p-4">${new Date(tx.date).toLocaleDateString()}</td>
            <td class="p-4">${tx.description}</td>
            <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${tx.category}</span></td>
            <td class="p-4 text-right ${amountColor}">${amountPrefix}$${tx.amount.toFixed(2)}</td>
            <td class="p-4">${tx.account}</td>
            <td class="p-4 text-center">
                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${tx.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function navigateToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const pageTitle = document.getElementById('page-title');
    const navLink = document.querySelector(`a[href="#${pageId}"]`);
    if (navLink) pageTitle.textContent = navLink.textContent.trim();
    
    if (window.innerWidth < 1024) {
        document.querySelector('aside').classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    const banner = document.getElementById('notification-banner');
    const notificationText = document.getElementById('notification-text');
    notificationText.textContent = message;
    
    switch(type) {
        case 'success': banner.style.backgroundColor = '#228B22'; break;
        case 'error': banner.style.backgroundColor = '#DC2626'; break;
        default: banner.style.backgroundColor = '#3B82F6';
    }
    
    banner.style.transform = 'translateY(0)';
    setTimeout(() => { banner.style.transform = 'translateY(-100%)'; }, 5000);
}

function initializeSampleData() {
    const spendingCtx = document.getElementById('spending-doughnut-chart').getContext('2d');
    new Chart(spendingCtx, {
        type: 'doughnut',
        data: {
            labels: ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment'],
            datasets: [{
                data: [500, 300, 150, 200, 100],
                backgroundColor: ['#228B22', '#3CB371', '#90EE90', '#98FB98', '#00FA9A']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}
