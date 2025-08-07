// Users section logic for admin panel
export function initAdminUsers() {
  // --- USERS CRUD ---
  const usersTable = document.getElementById('usersTable').querySelector('tbody');
  const addUserBtn = document.getElementById('addUserBtn');
  let users = [];

  function fetchUsers() {
    fetch('/api/users').then(res => res.json()).then(data => {
      users = data;
      renderUsers();
    });
  }
  function renderUsers() {
    usersTable.innerHTML = '';
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.name || ''}</td>
        <td>${user.email || ''}</td>
        <td>${user.role || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-user" data-id="${user._id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}"><i class="bi bi-trash"></i></button>
        </td>`;
      usersTable.appendChild(tr);
    });
  }
  usersTable.addEventListener('click', function(e) {
    if (e.target.closest('.edit-user')) {
      const id = e.target.closest('.edit-user').dataset.id;
      const user = users.find(u => u._id === id);
      openUserModal(user);
    } else if (e.target.closest('.delete-user')) {
      const id = e.target.closest('.delete-user').dataset.id;
      if (confirm('Delete this user?')) {
        fetch(`/api/users/${id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(() => { fetchUsers(); showToast('User deleted', 'success'); });
      }
    }
  });
  addUserBtn.addEventListener('click', () => openUserModal());

  // --- User Modal (Add/Edit) ---
  function openUserModal(user = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">${user._id ? 'Edit' : 'Add'} User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <form id="userForm">
              <div class="mb-3"><label>Name</label><input class="form-control" name="name" value="${user.name||''}" required></div>
              <div class="mb-3"><label>Email</label><input class="form-control" name="email" value="${user.email||''}" required type="email"></div>
              <div class="mb-3"><label>Role</label><input class="form-control" name="role" value="${user.role||''}" required></div>
              <button class="btn btn-success w-100" type="submit">${user._id ? 'Update' : 'Add'}</button>
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
      const method = user._id ? 'PUT' : 'POST';
      const url = user._id ? `/api/users/${user._id}` : '/api/users';
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(res => res.json()).then(() => {
        bsModal.hide();
        fetchUsers();
        showToast(`User ${user._id ? 'updated' : 'added'}`, 'success');
      });
    });
  }

  // --- CSV Export/Import ---
  const usersTab = document.getElementById('users');
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  exportBtn.innerHTML = '<i class="bi bi-download"></i> Export CSV';
  exportBtn.onclick = function() {
    const csv = ['Name,Email,Role'];
    users.forEach(u => csv.push(`${u.name||''},${u.email||''},${u.role||''}`));
    const blob = new Blob([csv.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
  };
  usersTab.querySelector('.d-flex').appendChild(exportBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  importBtn.innerHTML = '<i class="bi bi-upload"></i> Import CSV';
  importBtn.onclick = function() {
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
          const [name, email, role] = line.split(',');
          if (name && email && role) {
            fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, role })
            }).then(() => fetchUsers());
          }
        });
        showToast('CSV import complete', 'success');
      };
      reader.readAsText(file);
    };
    input.click();
  };
  usersTab.querySelector('.d-flex').appendChild(importBtn);

  // Initial fetch
  fetchUsers();
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
