// Admin Panel JS for Estimator Tab
async function loadEstimatorSubmissions() {
  const table = document.getElementById('estimatorTable').querySelector('tbody');
  table.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  try {
    const res = await fetch('http://localhost:5000/api/estimator/all');
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      table.innerHTML = data.map(e => `
        <tr>
          <td>${e.projectName}</td>
          <td>${e.projectType}</td>
          <td>${e.area}</td>
          <td>${e.budget ? '₹'+e.budget.toLocaleString() : '-'}</td>
          <td>₹${e.estimatedCost.toLocaleString()}</td>
          <td>${e.estimatedDuration} month(s)</td>
          <td>${new Date(e.createdAt).toLocaleString()}</td>
        </tr>
      `).join('');
    } else {
      table.innerHTML = '<tr><td colspan="7">No submissions found.</td></tr>';
    }
  } catch (err) {
    table.innerHTML = '<tr><td colspan="7">Failed to load data.</td></tr>';
  }
}
// Load on tab show
const estimatorTab = document.getElementById('estimator-tab');
if (estimatorTab) {
  estimatorTab.addEventListener('shown.bs.tab', loadEstimatorSubmissions);
  // If the estimator tab is already active on page load, load data immediately
  if (estimatorTab.classList.contains('active')) {
    loadEstimatorSubmissions();
  }
}

// Estimator section logic for admin panel
function initAdminEstimator() {
  // --- ESTIMATOR: SEARCH, CSV ---
  const estimatorTable = document.getElementById('estimatorTable').querySelector('tbody');
  let estimators = [];
  function fetchEstimators() {
    fetch('/api/estimator/all').then(res => res.json()).then(data => {
      estimators = data;
      renderEstimators();
    });
  }
  function renderEstimators(filter = '') {
    estimatorTable.innerHTML = '';
    let filtered = estimators;
    if (filter) filtered = estimators.filter(e => e.projectName.toLowerCase().includes(filter) || e.projectType.toLowerCase().includes(filter));
    filtered.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${e.projectName}</td><td>${e.projectType}</td><td>${e.area}</td><td>${e.budget ? '₹'+e.budget.toLocaleString() : '-'}</td><td>₹${e.estimatedCost.toLocaleString()}</td><td>${e.estimatedDuration} month(s)</td><td>${e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</td>`;
      estimatorTable.appendChild(tr);
    });
  }
  // Search box for estimator
  const estimatorTab = document.getElementById('estimator');
  const searchEstimator = document.createElement('input');
  searchEstimator.type = 'search';
  searchEstimator.className = 'form-control form-control-sm mb-2';
  searchEstimator.placeholder = 'Search estimator...';
  searchEstimator.oninput = () => renderEstimators(searchEstimator.value.trim().toLowerCase());
  estimatorTab.insertBefore(searchEstimator, estimatorTab.querySelector('.table-responsive'));
  // CSV Export for estimator
  const exportEstimatorBtn = document.createElement('button');
  exportEstimatorBtn.className = 'btn btn-outline-secondary btn-sm mb-2 ms-2';
  exportEstimatorBtn.innerHTML = '<i class="bi bi-download"></i> Export CSV';
  exportEstimatorBtn.onclick = function() {
    const csv = ['Project Name,Type,Area,Budget,Est. Cost,Est. Duration,Date'];
    estimators.forEach(e => csv.push(`${e.projectName},${e.projectType},${e.area},${e.budget||''},${e.estimatedCost},${e.estimatedDuration},${e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}`));
    const blob = new Blob([csv.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'estimator.csv';
    a.click();
  };
  estimatorTab.insertBefore(exportEstimatorBtn, estimatorTab.querySelector('.table-responsive'));
  fetchEstimators();
}

// Helper for toast (should be global or imported)
function showToast(msg, type = 'info') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'toast align-items-center text-bg-' + type + ' border-0 position-fixed bottom-0 end-0 m-3';
    toast.style.zIndex = 9999;
    toast.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div>';
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-body').textContent = msg;
  new bootstrap.Toast(toast, { delay: 2000 }).show();
}
