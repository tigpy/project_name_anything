// Worker Management page specific JS (modularized placeholder)
// Add page-specific interactivity here if needed in the future

document.addEventListener('DOMContentLoaded', function() {
  // --- Worker Performance Analytics Chart ---
  const performanceModal = document.getElementById('performanceModal');
  let performanceChart;
  if (performanceModal) {
    performanceModal.addEventListener('shown.bs.modal', function() {
      const container = document.getElementById('worker-performance-chart-container');
      if (!container) return;
      container.innerHTML = '<canvas id="worker-performance-chart" width="100%" height="300"></canvas>';
      const ctx = document.getElementById('worker-performance-chart').getContext('2d');
      if (performanceChart) performanceChart.destroy();
      // Example data (replace with real API data)
      performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['John Doe', 'Jane Smith', 'Alex Brown'],
          datasets: [{
            label: 'Tasks Completed',
            data: [22, 18, 15],
            backgroundColor: ['#0dcaf0', '#ffc107', '#43d39e']
          }]
        },
        options: {
          responsive: true,
          plugins: {legend: {display: false}},
          scales: {y: {beginAtZero: true}}
        }
      });
    });
  }

  // --- Task Assignment Form Validation & API ---
  const taskModal = document.getElementById('taskModal');
  if (taskModal) {
    const form = taskModal.querySelector('form');
    const workerSelect = form.querySelector('#workerSelect');
    const taskDesc = form.querySelector('#taskDesc');
    const currentTasksList = taskModal.querySelector('.list-group');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Validation
      let valid = true;
      if (!workerSelect.value) {
        workerSelect.classList.add('is-invalid');
        valid = false;
      } else {
        workerSelect.classList.remove('is-invalid');
      }
      if (!taskDesc.value.trim()) {
        taskDesc.classList.add('is-invalid');
        valid = false;
      } else {
        taskDesc.classList.remove('is-invalid');
      }
      if (!valid) return;
      // API call (replace with real endpoint)
      fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({worker: workerSelect.value, description: taskDesc.value.trim()})
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to assign task');
        return res.json();
      })
      .then(data => {
        // Add to current tasks list
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = data.description || taskDesc.value.trim();
        const badge = document.createElement('span');
        badge.className = 'badge bg-info';
        badge.textContent = 'In Progress';
        li.appendChild(badge);
        currentTasksList.appendChild(li);
        form.reset();
        workerSelect.classList.remove('is-invalid');
        taskDesc.classList.remove('is-invalid');
        showToast('Task assigned successfully', 'success');
      })
      .catch(err => {
        showToast('Error assigning task: ' + err.message, 'danger');
      });
    });
  }
});
