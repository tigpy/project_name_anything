// Inventory section logic for admin panel
export function initAdminInventory() {
  // --- INVENTORY CRUD ---
  const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
  const addInventoryBtn = document.getElementById('addInventoryBtn');
  let inventory = [];
  function fetchInventory() {
    fetch('/api/inventory').then(res => res.json()).then(data => {
      inventory = data;
      renderInventory();
    });
  }
  function renderInventory() {
    inventoryTable.innerHTML = '';
    inventory.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name || ''}</td>
        <td>${item.quantity || ''}</td>
        <td>${item.unit || ''}</td>
        <td>${item.supplier || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-inventory" data-id="${item._id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger delete-inventory" data-id="${item._id}"><i class="bi bi-trash"></i></button>
        </td>`;
      inventoryTable.appendChild(tr);
    });
  }
  inventoryTable.addEventListener('click', function(e) {
    if (e.target.closest('.edit-inventory')) {
      const id = e.target.closest('.edit-inventory').dataset.id;
      const item = inventory.find(i => i._id === id);
      openInventoryModal(item);
    } else if (e.target.closest('.delete-inventory')) {
      const id = e.target.closest('.delete-inventory').dataset.id;
      if (confirm('Delete this item?')) {
        fetch(`/api/inventory/${id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(() => { fetchInventory(); showToast('Item deleted', 'success'); });
      }
    }
  });
  addInventoryBtn.addEventListener('click', () => openInventoryModal());
  function openInventoryModal(item = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">${item._id ? 'Edit' : 'Add'} Inventory Item</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <form id="inventoryForm">
              <div class="mb-3"><label>Name</label><input class="form-control" name="name" value="${item.name||''}" required></div>
              <div class="mb-3"><label>Quantity</label><input class="form-control" name="quantity" value="${item.quantity||''}" required type="number" min="0"></div>
              <div class="mb-3"><label>Unit</label><input class="form-control" name="unit" value="${item.unit||''}" required></div>
              <div class="mb-3"><label>Supplier</label><input class="form-control" name="supplier" value="${item.supplier||''}"></div>
              <button class="btn btn-success w-100" type="submit">${item._id ? 'Update' : 'Add'}</button>
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
      const method = item._id ? 'PUT' : 'POST';
      const url = item._id ? `/api/inventory/${item._id}` : '/api/inventory';
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(res => res.json()).then(() => {
        bsModal.hide();
        fetchInventory();
        showToast(`Item ${item._id ? 'updated' : 'added'}`, 'success');
      });
    });
  }
  // CSV Export/Import for Inventory
  const inventoryTab = document.getElementById('inventory');
  const exportInvBtn = document.createElement('button');
  exportInvBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  exportInvBtn.innerHTML = '<i class="bi bi-download"></i> Export CSV';
  exportInvBtn.onclick = function() {
    const csv = ['Name,Quantity,Unit,Supplier'];
    inventory.forEach(i => csv.push(`${i.name||''},${i.quantity||''},${i.unit||''},${i.supplier||''}`));
    const blob = new Blob([csv.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.csv';
    a.click();
  };
  inventoryTab.querySelector('.d-flex').appendChild(exportInvBtn);
  const importInvBtn = document.createElement('button');
  importInvBtn.className = 'btn btn-outline-secondary btn-sm ms-2';
  importInvBtn.innerHTML = '<i class="bi bi-upload"></i> Import CSV';
  importInvBtn.onclick = function() {
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
          const [name, quantity, unit, supplier] = line.split(',');
          if (name && quantity && unit) {
            fetch('/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, quantity, unit, supplier })
            }).then(() => fetchInventory());
          }
        });
        showToast('CSV import complete', 'success');
      };
      reader.readAsText(file);
    };
    input.click();
  };
  inventoryTab.querySelector('.d-flex').appendChild(importInvBtn);
  fetchInventory();
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
