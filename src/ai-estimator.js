// AI Project Estimator JS
const aiEstimatorForm = document.getElementById('aiEstimatorForm');
const aiEstimatorResult = document.getElementById('aiEstimatorResult');
if (aiEstimatorForm) {
  aiEstimatorForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('estimatorProjectName').value.trim();
    const type = document.getElementById('estimatorProjectType').value;
    const area = parseFloat(document.getElementById('estimatorArea').value);
    const budget = parseFloat(document.getElementById('estimatorBudget').value) || null;
    // Validation
    let valid = true;
    if (!name) {
      document.getElementById('estimatorProjectName').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('estimatorProjectName').classList.remove('is-invalid');
    }
    if (!type) {
      document.getElementById('estimatorProjectType').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('estimatorProjectType').classList.remove('is-invalid');
    }
    if (!area || area < 1) {
      document.getElementById('estimatorArea').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('estimatorArea').classList.remove('is-invalid');
    }
    if (!valid) {
      aiEstimatorResult.className = 'alert alert-danger mt-3';
      aiEstimatorResult.textContent = 'Please fill all required fields correctly.';
      aiEstimatorResult.classList.remove('d-none');
      return;
    }
    // Simple AI-like logic for demo
    let baseRate = 0;
    let duration = 0;
    switch(type) {
      case 'Residential': baseRate = 1200; duration = 0.04; break;
      case 'Commercial': baseRate = 1800; duration = 0.06; break;
      case 'Renovation': baseRate = 900; duration = 0.03; break;
      default: baseRate = 1000; duration = 0.05;
    }
    let cost = Math.round(area * baseRate);
    let months = Math.max(1, Math.round(area * duration / 100));
    // Store estimator data in backend
    fetch('http://localhost:5000/api/estimator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: name,
        projectType: type,
        area,
        budget,
        estimatedCost: cost,
        estimatedDuration: months
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        aiEstimatorResult.className = 'alert alert-success mt-3';
        aiEstimatorResult.textContent = 'Estimator data saved successfully!';
        setTimeout(() => {
          aiEstimatorResult.classList.add('d-none');
        }, 2500);
        aiEstimatorForm.reset();
      }
    })
    .catch(err => {
      aiEstimatorResult.className = 'alert alert-danger mt-3';
      aiEstimatorResult.textContent = 'Failed to save estimator data.';
      aiEstimatorResult.classList.remove('d-none');
    });
    if (budget && budget < cost) {
      aiEstimatorResult.className = 'alert alert-warning mt-3';
      aiEstimatorResult.textContent = `Warning: Your budget (₹${budget.toLocaleString()}) is below the estimated cost (₹${cost.toLocaleString()}).`;
    } else {
      aiEstimatorResult.className = 'alert alert-info mt-3';
      aiEstimatorResult.innerHTML = `<strong>Estimated Cost:</strong> ₹${cost.toLocaleString()}<br><strong>Estimated Duration:</strong> ${months} month(s)`;
    }
    aiEstimatorResult.setAttribute('aria-live', 'polite');
    aiEstimatorResult.classList.remove('d-none');
  });
}
