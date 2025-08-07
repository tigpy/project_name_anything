// Projects section logic for admin panel
export function initAdminProjects() {
  // --- PROJECTS CRUD ---
  const projectsTable = document.getElementById('projectsTable').querySelector('tbody');
  const addProjectBtn = document.getElementById('addProjectBtn');
  let projects = [];
  function fetchProjects() {
    fetch('/api/projects').then(res => res.json()).then(data => {
      projects = data;
      renderProjects();
    });
  }
  function renderProjects() {
    projectsTable.innerHTML = '';
    projects.forEach(project => {
      const tr = document.createElement('tr');
      let filesHtml = '';
      if (Array.isArray(project.files) && project.files.length) {
        filesHtml = project.files.map(f => `<a href="http://localhost:5000/uploads/projects/${f.filename}" target="_blank" class="btn btn-link btn-sm p-0 me-1" download><i class="bi bi-paperclip"></i> ${f.originalname}</a>`).join('');
      }
      tr.innerHTML = `
        <td>${project.name || ''}</td>
        <td>${project.status || ''}</td>
        <td>${project.startDate ? project.startDate.slice(0,10) : ''}</td>
        <td>${project.endDate ? project.endDate.slice(0,10) : ''}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-project" data-id="${project._id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger delete-project" data-id="${project._id}"><i class="bi bi-trash"></i></button>
          <label class="btn btn-sm btn-secondary mb-0 ms-1">
            <i class="bi bi-upload"></i> <input type="file" class="d-none project-file-upload" data-id="${project._id}">
          </label>
          <div class="mt-1">${filesHtml}</div>
        </td>`;
      projectsTable.appendChild(tr);
    });
    // File upload logic
    projectsTable.querySelectorAll('.project-file-upload').forEach(input => {
      input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const id = e.target.dataset.id;
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        fetch(`http://localhost:5000/api/projects/${id}/upload`, {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          showToast(data.success ? 'File uploaded' : (data.message || 'Upload failed'), data.success ? 'success' : 'danger');
          fetchProjects();
        })
        .catch(() => showToast('Upload failed', 'danger'));
      });
    });
  }
  projectsTable.addEventListener('click', function(e) {
    if (e.target.closest('.edit-project')) {
      const id = e.target.closest('.edit-project').dataset.id;
      const project = projects.find(p => p._id === id);
      openProjectModal(project);
    } else if (e.target.closest('.delete-project')) {
      const id = e.target.closest('.delete-project').dataset.id;
      if (confirm('Delete this project?')) {
        fetch(`/api/projects/${id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(() => { fetchProjects(); showToast('Project deleted', 'success'); });
      }
    }
  });
  addProjectBtn.addEventListener('click', () => openProjectModal());
  function openProjectModal(project = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">${project._id ? 'Edit' : 'Add'} Project</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <form id="projectForm">
              <div class="mb-3"><label>Name</label><input class="form-control" name="name" value="${project.name||''}" required></div>
              <div class="mb-3"><label>Status</label><input class="form-control" name="status" value="${project.status||''}" required></div>
              <div class="mb-3"><label>Start Date</label><input class="form-control" name="startDate" type="date" value="${project.startDate ? project.startDate.slice(0,10) : ''}"></div>
              <div class="mb-3"><label>End Date</label><input class="form-control" name="endDate" type="date" value="${project.endDate ? project.endDate.slice(0,10) : ''}"></div>
              <button class="btn btn-success w-100" type="submit">${project._id ? 'Update' : 'Add'}</button>
            </form>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    modal.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(this));
      const method = project._id ? 'PUT' : 'POST';
      const url = project._id ? `/api/projects/${project._id}` : '/api/projects';
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(res => res.json()).then(() => {
        bsModal.hide();
        fetchProjects();
        showToast(`Project ${project._id ? 'updated' : 'added'}`, 'success');
      });
    });
  }
  // CSV Export/Import for Projects
  const projectsTab = document.getElementById('projects');
  const exportProjBtn = document.createElement('button');
  exportProjBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  exportProjBtn.innerHTML = '<i class="bi bi-download"></i> Export CSV';
  exportProjBtn.onclick = function() {
    const csv = ['Name,Status,Start,End'];
    projects.forEach(p => csv.push(`${p.name||''},${p.status||''},${p.startDate||''},${p.endDate||''}`));
    const blob = new Blob([csv.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projects.csv';
    a.click();
  };
  projectsTab.querySelector('.d-flex').appendChild(exportProjBtn);
  const importProjBtn = document.createElement('button');
  importProjBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  importProjBtn.innerHTML = '<i class="bi bi-upload"></i> Import CSV';
  importProjBtn.onclick = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const lines = evt.target.result.split(/\r?\n/).slice(1);
        lines.forEach(line => {
          const [name, status, startDate, endDate] = line.split(',');
          if (name && status) {
            fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, status, startDate, endDate })
            }).then(() => fetchProjects());
          }
        });
        showToast('CSV import complete', 'success');
      };
      reader.readAsText(file);
    };
    input.click();
  };
  projectsTab.querySelector('.d-flex').appendChild(importProjBtn);
  fetchProjects();
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
