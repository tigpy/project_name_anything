// Contacts section logic for admin panel
export function initAdminContacts() {
  // --- CONTACTS: CRUD, SEARCH, BULK DELETE, CSV ---
  const contactsTable = document.getElementById('contactsTable').querySelector('tbody');
  let contacts = [];
  function fetchContacts() {
    fetch('/api/contacts').then(res => res.json()).then(data => {
      contacts = data;
      renderContacts();
    });
  }
  function renderContacts(filter = '') {
    contactsTable.innerHTML = '';
    let filtered = contacts;
    if (filter) filtered = contacts.filter(c => c.name.toLowerCase().includes(filter) || c.email.toLowerCase().includes(filter) || c.message.toLowerCase().includes(filter));
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.name}</td><td>${c.email}</td><td>${c.message}</td><td>${c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>`;
      contactsTable.appendChild(tr);
    });
  }
  // Search box for contacts
  const contactsTab = document.getElementById('contacts');
  const searchContacts = document.createElement('input');
  searchContacts.type = 'search';
  searchContacts.className = 'form-control form-control-sm mb-2';
  searchContacts.placeholder = 'Search contacts...';
  searchContacts.oninput = () => renderContacts(searchContacts.value.trim().toLowerCase());
  contactsTab.insertBefore(searchContacts, contactsTab.querySelector('.table-responsive'));
  // CSV Export for contacts
  const exportContactsBtn = document.createElement('button');
  exportContactsBtn.className = 'btn btn-outline-secondary btn-sm mb-2 ms-2';
  exportContactsBtn.innerHTML = '<i class="bi bi-download"></i> Export CSV';
  exportContactsBtn.onclick = function() {
    const csv = ['Name,Email,Message,Date'];
    contacts.forEach(c => csv.push(`${c.name},${c.email},${c.message.replace(/\n/g,' ')},${c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}`));
    const blob = new Blob([csv.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contacts.csv';
    a.click();
  };
  contactsTab.insertBefore(exportContactsBtn, contactsTab.querySelector('.table-responsive'));
  // Bulk delete (for demo, clears all)
  const bulkDeleteContactsBtn = document.createElement('button');
  bulkDeleteContactsBtn.className = 'btn btn-outline-danger btn-sm mb-2 ms-2';
  bulkDeleteContactsBtn.innerHTML = '<i class="bi bi-trash"></i> Delete All';
  bulkDeleteContactsBtn.onclick = function() {
    if (confirm('Delete ALL contacts?')) {
      fetch('/api/contacts', { method: 'DELETE' })
        .then(() => { fetchContacts(); showToast('All contacts deleted', 'danger'); });
    }
  };
  contactsTab.insertBefore(bulkDeleteContactsBtn, contactsTab.querySelector('.table-responsive'));
  fetchContacts();
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
