/* Enhanced styles for complete functionality */

/* Budget status indicators */
.budget-status-good {
    border-left: 4px solid #10B981;
}

.budget-status-warning {
    border-left: 4px solid #F59E0B;
}

.budget-status-danger {
    border-left: 4px solid #EF4444;
}

/* Transfer section styling */
.transfer-section {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
}

/* Data management buttons */
.data-management-btn {
    transition: all 0.3s ease;
}

.data-management-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

/* Search and filter improvements */
.search-filter-container input:focus,
.search-filter-container select:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Progress bar animations */
.progress-bar {
    transition: width 0.5s ease-in-out;
}

/* Hover effects for interactive elements */
.delete-transaction:hover,
.delete-account:hover,
.delete-budget:hover {
    transform: scale(1.1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .transfer-section form {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .search-filter-container {
        flex-direction: column;
    }
    
    .search-filter-container > div {
        width: 100%;
    }
}

/* Print optimizations */
@media print {
    .no-print {
        display: none !important;
    }
    
    .card {
        break-inside: avoid;
        box-shadow: none;
        border: 1px solid #e5e7eb;
    }
}

/* Loading states */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

/* Empty state styling */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}
