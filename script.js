// Basic application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading process
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 1500);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToPage(targetId);
            
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        const sidebar = document.querySelector('aside');
        sidebar.classList.toggle('hidden');
    });
    
    // Quick expense form submission
    document.getElementById('quick-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = document.getElementById('quick-amount').value;
        const description = document.getElementById('quick-description').value;
        const category = document.getElementById('quick-category').value;
        const account = document.getElementById('quick-account').value;
        
        if (!amount || !description || !category || !account) {
            showNotification('Please fill out all fields', 'error');
            return;
        }
        
        this.reset();
        
        showNotification(`Added expense: $${amount} for ${description}`, 'success');
        
        const currentExpenses = parseFloat(document.getElementById('total-expenses-stat').textContent.replace('$', '').replace(',', ''));
        const newExpenses = currentExpenses + parseFloat(amount);
        document.getElementById('total-expenses-stat').textContent = '$' + newExpenses.toFixed(2);
        
        const currentNetWorth = parseFloat(document.getElementById('net-worth-stat').textContent.replace('$', '').replace(',', ''));
        const newNetWorth = currentNetWorth - parseFloat(amount);
        document.getElementById('net-worth-stat').textContent = '$' + newNetWorth.toFixed(2);
    });
    
    // Tax estimation
    document.getElementById('estimate-tax-btn').addEventListener('click', function() {
        const income = document.getElementById('annual-income').value;
        const filingStatus = document.getElementById('filing-status').value;
        
        if (!income) {
            showNotification('Please enter your annual income', 'error');
            return;
        }
        
        const taxResult = document.getElementById('tax-result-container');
        const taxLoader = document.getElementById('tax-result-loader');
        const taxText = document.getElementById('tax-result-text');
        
        taxResult.classList.remove('hidden');
        taxLoader.classList.remove('hidden');
        taxText.textContent = '';
        
        setTimeout(() => {
            taxLoader.classList.add('hidden');
            
            const incomeNum = parseFloat(income);
            let taxAmount = 0;
            
            // Simplified tax logic
            if (incomeNum <= 11000) { taxAmount = incomeNum * 0.10; } 
            else if (incomeNum <= 44725) { taxAmount = 1100 + (incomeNum - 11000) * 0.12; } 
            else if (incomeNum <= 95375) { taxAmount = 5147 + (incomeNum - 44725) * 0.22; } 
            else if (incomeNum <= 182100) { taxAmount = 16290 + (incomeNum - 95375) * 0.24; } 
            else if (incomeNum <= 231250) { taxAmount = 37104 + (incomeNum - 182100) * 0.32; } 
            else if (incomeNum <= 578125) { taxAmount = 52832 + (incomeNum - 231250) * 0.35; } 
            else { taxAmount = 174238.25 + (incomeNum - 578125) * 0.37; }
            
            if (filingStatus === 'Married filing jointly') { taxAmount *= 0.85; } 
            else if (filingStatus === 'Head of household') { taxAmount *= 0.9; }
            
            taxText.textContent = `Based on your ${filingStatus.toLowerCase()} status and $${income} annual income, your estimated federal tax is approximately $${taxAmount.toFixed(2)}. This is a rough estimate.`;
        }, 2000);
    });
    
    // AI report generation
    document.getElementById('generate-ai-report-btn').addEventListener('click', function() {
        const reportLoader = document.getElementById('ai-report-loader');
        const reportContent = document.getElementById('ai-report-content');
        
        reportLoader.classList.remove('hidden');
        reportContent.innerHTML = '';
        
        setTimeout(() => {
            reportLoader.classList.add('hidden');
            
            reportContent.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">Your Financial Health Report</h3>
                <p class="text-gray-700 mt-4">Based on your financial data, here's an analysis:</p>
                <div class="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 class="font-semibold text-green-800">Strengths</h4>
                    <ul class="list-disc pl-5 mt-2 text-green-700">
                        <li>Saving approximately 15% of your income.</li>
                        <li>Emergency fund covers 3 months of expenses.</li>
                    </ul>
                </div>
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 class="font-semibold text-yellow-800">Areas for Improvement</h4>
                    <ul class="list-disc pl-5 mt-2 text-yellow-700">
                        <li>Dining expenses are 25% higher than average.</li>
                        <li>Consider increasing retirement contributions.</li>
                    </ul>
                </div>
            `;
        }, 3000);
    });
    
    // Initialize with dashboard page
    navigateToPage('dashboard');
    document.querySelector('a[href="#dashboard"]').classList.add('active');
    
    // Sample data for charts
    initializeSampleData();
});

function navigateToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    const pageTitle = document.getElementById('page-title');
    const navLink = document.querySelector(`a[href="#${pageId}"]`);
    if (navLink) {
       pageTitle.textContent = navLink.textContent.trim();
    }
    
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
        case 'warning': banner.style.backgroundColor = '#D97706'; break;
        default: banner.style.backgroundColor = '#3B82F6';
    }
    
    banner.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        banner.style.transform = 'translateY(-100%)';
    }, 5000);
}

function initializeSampleData() {
    // Sample spending chart
    const spendingCtx = document.getElementById('spending-doughnut-chart').getContext('2d');
    new Chart(spendingCtx, {
        type: 'doughnut',
        data: {
            labels: ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping'],
            datasets: [{
                data: [500, 300, 150, 200, 100, 250],
                backgroundColor: ['#228B22', '#3CB371', '#90EE90', '#98FB98', '#00FA9A', '#00FF7F']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 15 }
                }
            }
        }
    });
}
