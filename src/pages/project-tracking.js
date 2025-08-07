// Project Tracking page specific JS (modularized placeholder)
// Add page-specific interactivity here if needed in the future

document.addEventListener('DOMContentLoaded', function() {
  // --- Gantt Chart Logic ---
  const ganttModal = document.getElementById('ganttModal');
  let gantt;
  if (ganttModal) {
    ganttModal.addEventListener('shown.bs.modal', function() {
      const container = document.getElementById('gantt-chart-container');
      container.innerHTML = '';
      // Example tasks (replace with real API data)
      const tasks = [
        {id: 'Task 1', name: 'Foundation', start: '2025-06-01', end: '2025-06-07', progress: 100},
        {id: 'Task 2', name: 'Framing', start: '2025-06-08', end: '2025-06-14', progress: 60, dependencies: 'Task 1'},
        {id: 'Task 3', name: 'Roofing', start: '2025-06-15', end: '2025-06-20', progress: 0, dependencies: 'Task 2'}
      ];
      gantt = new Gantt(container, tasks, {view_mode: 'Day', language: 'en'});
    });
  }

  // --- Progress Analytics Chart ---
  const analyticsModal = document.getElementById('analyticsModal');
  let analyticsChart;
  if (analyticsModal) {
    analyticsModal.addEventListener('shown.bs.modal', function() {
      const ctx = document.getElementById('progress-analytics-chart').getContext('2d');
      if (analyticsChart) analyticsChart.destroy();
      // Example data (replace with real API data)
      analyticsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Foundation', 'Framing', 'Roofing'],
          datasets: [{
            label: 'Completion (%)',
            data: [100, 60, 0],
            backgroundColor: ['#43d39e', '#43a1d3', '#d3d343']
          }]
        },
        options: {
          responsive: true,
          plugins: {legend: {display: false}},
          scales: {y: {beginAtZero: true, max: 100}}
        }
      });
    });
  }

  // --- Milestone Table: API Integration & Feedback (future CRUD) ---
  const milestoneModal = document.getElementById('milestoneModal');
  const milestoneFormFeedback = document.getElementById('milestoneFormFeedback');
  if (milestoneModal && milestoneFormFeedback) {
    milestoneModal.addEventListener('shown.bs.modal', function() {
      // Example: fetch milestones from API (replace with real endpoint)
      fetch('/api/projects')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch milestones');
          return res.json();
        })
        .then(data => {
          milestoneFormFeedback.textContent = '';
          // Optionally update table rows dynamically here
        })
        .catch(err => {
          milestoneFormFeedback.textContent = 'Error loading milestones: ' + err.message;
        });
    });
  }

  // --- Notifications: API Integration & Feedback (future real-time) ---
  const notificationModal = document.getElementById('notificationModal');
  const notificationFormFeedback = document.getElementById('notificationFormFeedback');
  if (notificationModal && notificationFormFeedback) {
    notificationModal.addEventListener('shown.bs.modal', function() {
      // Example: fetch notifications from API (replace with real endpoint)
      fetch('/api/notifications')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch notifications');
          return res.json();
        })
        .then(data => {
          notificationFormFeedback.textContent = '';
          // Optionally update notifications list dynamically here
        })
        .catch(err => {
          notificationFormFeedback.textContent = 'Error loading notifications: ' + err.message;
        });
    });
  }
});
