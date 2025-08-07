// Inventory Management page specific JS (modularized placeholder)
// Add page-specific interactivity here if needed in the future

document.addEventListener('DOMContentLoaded', function() {
  // --- Inventory Analytics Chart ---
  const analyticsModal = document.getElementById('analyticsModal');
  let analyticsChart;
  if (analyticsModal) {
    analyticsModal.addEventListener('shown.bs.modal', function() {
      const ctx = document.getElementById('inventory-analytics-chart').getContext('2d');
      if (analyticsChart) analyticsChart.destroy();
      // Example data (replace with real API data)
      analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Cement (bags)',
            data: [120, 90, 100, 80],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255,193,7,0.2)',
            tension: 0.3
          }, {
            label: 'Bricks (units)',
            data: [500, 450, 400, 350],
            borderColor: '#17a2b8',
            backgroundColor: 'rgba(23,162,184,0.2)',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {legend: {position: 'top'}},
          scales: {y: {beginAtZero: true}}
        }
      });
    });
  }

  // --- Stock Level Table: API Integration & Feedback (future CRUD) ---
  const stockModal = document.getElementById('stockModal');
  const stockFormFeedback = document.getElementById('stockFormFeedback');
  if (stockModal && stockFormFeedback) {
    stockModal.addEventListener('shown.bs.modal', function() {
      // Example: fetch inventory from API (replace with real endpoint)
      fetch('/api/inventory')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch inventory');
          return res.json();
        })
        .then(data => {
          stockFormFeedback.textContent = '';
          // Optionally update table rows dynamically here
        })
        .catch(err => {
          stockFormFeedback.textContent = 'Error loading inventory: ' + err.message;
        });
    });
  }
});
