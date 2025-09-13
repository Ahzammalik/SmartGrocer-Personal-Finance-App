// ... (Global state variables and Local Storage functions are unchanged) ...

// --- MAIN APPLICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    // ... (All previous setup code is unchanged) ...

    // --- Event Delegation for Actions ---
    // ... (Event listeners for transactions, budgets, and accounts are unchanged) ...

    // --- AI Insights Page Listener ---
    document.getElementById('generate-ai-report-btn').addEventListener('click', generateAndRenderInsights);
});

// --- AI INSIGHTS FUNCTIONS ---

/**
 * Main function to generate and display financial insights.
 */
function generateAndRenderInsights() {
    const reportLoader = document.getElementById('ai-report-loader');
    const reportContent = document.getElementById('ai-report-content');

    reportLoader.classList.remove('hidden');
    reportContent.innerHTML = '';

    // Simulate AI processing time
    setTimeout(() => {
        const insights = {
            strengths: [],
            improvements: [],
            observations: []
        };

        // 1. Get transaction data for current and previous month
        const today = new Date();
        const { start: currentMonthStart, end: currentMonthEnd } = getMonthDateRange(today.getFullYear(), today.getMonth());
        const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const { start: prevMonthStart, end: prevMonthEnd } = getMonthDateRange(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

        const currentMonthTransactions = transactionsData.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= currentMonthStart && txDate <= currentMonthEnd;
        });
        const prevMonthTransactions = transactionsData.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= prevMonthStart && txDate <= prevMonthEnd;
        });
        
        // --- Generate Insights ---
        generateBudgetInsights(insights, currentMonthTransactions);
        generateSpendingInsights(insights, currentMonthTransactions, prevMonthTransactions);

        // --- Render Insights ---
        let html = '<h3 class="text-xl font-semibold text-gray-800">Your Financial Health Report</h3>';

        // Strengths
        if (insights.strengths.length > 0) {
            html += `
                <div class="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 class="font-semibold text-green-800">Strengths 💪</h4>
                    <ul class="list-disc pl-5 mt-2 text-green-700 space-y-1">${insights.strengths.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>`;
        }
        
        // Improvements
        if (insights.improvements.length > 0) {
            html += `
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 class="font-semibold text-yellow-800">Areas for Improvement 🧐</h4>
                    <ul class="list-disc pl-5 mt-2 text-yellow-700 space-y-1">${insights.improvements.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>`;
        }

        // Observations
        if (insights.observations.length > 0) {
             html += `
                <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-semibold text-blue-800">Observations 📊</h4>
                    <ul class="list-disc pl-5 mt-2 text-blue-700 space-y-1">${insights.observations.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>`;
        }
        
        if (insights.strengths.length === 0 && insights.improvements.length === 0) {
            html += `<p class="mt-4 text-gray-600">Not enough data for a full analysis yet. Keep adding transactions to get insights!</p>`;
        }

        reportContent.innerHTML = html;
        reportLoader.classList.add('hidden');

    }, 2000);
}

/**
 * Analyzes budget adherence and adds insights.
 */
function generateBudgetInsights(insights, transactions) {
    if (budgetsData.length === 0) return;

    let onTrackCount = 0;
    budgetsData.forEach(budget => {
        const spent = transactions
            .filter(tx => tx.category === budget.category && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        if (spent > budget.limit) {
            insights.improvements.push(`You've gone over your **$${budget.limit}** budget for **${budget.category}**, spending **$${spent.toFixed(2)}**.`);
        } else if (spent >= budget.limit * 0.9) {
            insights.improvements.push(`You're close to your **$${budget.limit}** budget for **${budget.category}**, with **$${(budget.limit - spent).toFixed(2)}** remaining.`);
        } else {
            onTrackCount++;
        }
    });
    if (onTrackCount > 0) {
        insights.strengths.push(`Great job staying on track with **${onTrackCount}** of your budget${onTrackCount > 1 ? 's' : ''}!`);
    }
}

/**
 * Analyzes spending habits and adds insights.
 */
function generateSpendingInsights(insights, currentMonthTx, prevMonthTx) {
    const currentExpenses = currentMonthTx.filter(tx => tx.type === 'expense');
    if (currentExpenses.length === 0) return;

    // Find top spending category
    const spendingByCategory = currentExpenses.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {});

    let topCategory = '';
    let topAmount = 0;
    for (const category in spendingByCategory) {
        if (spendingByCategory[category] > topAmount) {
            topAmount = spendingByCategory[category];
            topCategory = category;
        }
    }
    if(topCategory) {
        insights.observations.push(`Your top spending category this month is **${topCategory}** with **$${topAmount.toFixed(2)}** spent.`);
    }

    // Compare with previous month
    const totalCurrentSpending = currentExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPrevSpending = prevMonthTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

    if (totalPrevSpending > 0) {
        const percentageChange = ((totalCurrentSpending - totalPrevSpending) / totalPrevSpending) * 100;
        if (percentageChange > 10) {
            insights.improvements.push(`Your overall spending is up by **${percentageChange.toFixed(0)}%** compared to last month.`);
        } else if (percentageChange < -10) {
            insights.strengths.push(`Excellent! Your overall spending is down by **${Math.abs(percentageChange).toFixed(0)}%** compared to last month.`);
        }
    }
}

/**
 * Helper function to get the start and end dates for a given month/year.
 */
function getMonthDateRange(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Day 0 of next month is the last day of current month
    end.setHours(23, 59, 59, 999); // Set to end of the day
    return { start, end };
}


// All other functions remain the same.
