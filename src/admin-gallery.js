// Admin Gallery Management JS
// Handles loading, adding, and deleting gallery images from the admin panel

document.addEventListener('DOMContentLoaded', function() {
  const galleryTab = document.getElementById('gallery-tab');
  const galleryTable = document.getElementById('galleryTable')?.querySelector('tbody');
  const addGalleryBtn = document.getElementById('addGalleryBtn');
  const addGalleryModal = new bootstrap.Modal(document.getElementById('addGalleryModal'));
  const addGalleryForm = document.getElementById('addGalleryForm');
  const galleryUploadMsg = document.getElementById('galleryUploadMsg');

  // Fallback gallery images if API returns empty or fails
  const fallbackGalleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      title: 'Modern Building',
      description: 'A modern construction project with glass facade.',
      category: 'Commercial',
      featured: true
    },
    {
      url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
      title: 'Bridge Project',
      description: 'Large-scale bridge construction over water.',
      category: 'Infrastructure',
      featured: false
    },
    {
      url: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=600&q=80',
      title: 'Residential Complex',
      description: 'High-rise residential buildings under construction.',
      category: 'Residential',
      featured: true
    },
    {
      url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80',
      title: 'Roadwork',
      description: 'Highway roadwork and heavy machinery.',
      category: 'Infrastructure',
      featured: false
    },
    {
      url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80',
      title: 'Renovation',
      description: 'Renovation of a classic building.',
      category: 'Renovation',
      featured: false
    }
  ];

  async function loadGallery() {
    if (!galleryTable) return;
    galleryTable.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    try {
      const res = await fetch('http://localhost:5000/api/gallery');
      const data = await res.json();
      let images = Array.isArray(data) ? data : [];
      // Use fallbackGalleryImages if API returns empty or fails
      if (!images.length) images = fallbackGalleryImages;
      if (images.length) {
        galleryTable.innerHTML = images.map(img => `
          <tr>
            <td><img src="${img.url || img.imageUrl}" alt="" style="width:60px;height:40px;object-fit:cover;"></td>
            <td>${img.title||''}</td>
            <td>${img.category||''}</td>
            <td>${img.description||''}</td>
            <td>${img._id ? `<button class='btn btn-danger btn-sm delete-gallery-btn' data-id='${img._id}'><i class='bi bi-trash'></i></button>` : ''}</td>
          </tr>
        `).join('');
      } else {
        galleryTable.innerHTML = '<tr><td colspan="5">No images found.</td></tr>';
      }
    } catch (err) {
      // On error, show fallback images
      galleryTable.innerHTML = fallbackGalleryImages.map(img => `
        <tr>
          <td><img src="${img.url}" alt="" style="width:60px;height:40px;object-fit:cover;"></td>
          <td>${img.title}</td>
          <td>${img.category}</td>
          <td>${img.description}</td>
          <td></td>
        </tr>
      `).join('');
    }
  }

  // Open modal
  addGalleryBtn?.addEventListener('click', () => {
    addGalleryForm.reset();
    galleryUploadMsg.className = 'alert d-none';
    addGalleryModal.show();
  });

  // Add image
  addGalleryForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    galleryUploadMsg.className = 'alert d-none';
    let url = document.getElementById('galleryImageUrl').value.trim();
    const file = document.getElementById('galleryImageFile').files[0];
    const title = document.getElementById('galleryTitle').value.trim();
    const category = document.getElementById('galleryCategory').value;
    const description = document.getElementById('galleryDesc').value.trim();
    let imageUrl = url;
    if (!url && file) {
      // For demo: use FileReader to preview, but in production, upload to server/cloud
      const reader = new FileReader();
      reader.onload = async function(ev) {
        imageUrl = ev.target.result;
        await submitGalleryImage(imageUrl);
      };
      reader.readAsDataURL(file);
      return;
    }
    await submitGalleryImage(imageUrl);
    async function submitGalleryImage(imageUrl) {
      if (!imageUrl) {
        galleryUploadMsg.className = 'alert alert-danger';
        galleryUploadMsg.textContent = 'Please provide an image URL or upload a file.';
        return;
      }
      const res = await fetch('http://localhost:5000/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, title, category, description })
      });
      if (res.ok) {
        galleryUploadMsg.className = 'alert alert-success';
        galleryUploadMsg.textContent = 'Image added!';
        loadGallery();
        setTimeout(()=>addGalleryModal.hide(), 800);
      } else {
        galleryUploadMsg.className = 'alert alert-danger';
        galleryUploadMsg.textContent = 'Failed to add image.';
      }
    }
  });

  // Delete image
  galleryTable?.addEventListener('click', async function(e) {
    if (e.target.closest('.delete-gallery-btn')) {
      const id = e.target.closest('.delete-gallery-btn').getAttribute('data-id');
      if (confirm('Delete this image?')) {
        const res = await fetch(`http://localhost:5000/api/gallery/${id}`, { method: 'DELETE' });
        if (res.ok) loadGallery();
      }
    }
  });

  // Load gallery when tab is shown
  document.getElementById('gallery-tab')?.addEventListener('shown.bs.tab', loadGallery);
  // If already active
  if (document.getElementById('gallery-tab')?.classList.contains('active')) loadGallery();

  // --- GALLERY: SEARCH, BULK DELETE ---
  const galleryTabPanel = document.getElementById('gallery');
  let galleryImages = [];
  function fetchGallery() {
    fetch('http://localhost:5000/api/gallery').then(res => res.json()).then(data => {
      galleryImages = data;
      renderGallery();
    });
  }
  function renderGallery(filter = '') {
    if (!galleryTable) return;
    galleryTable.innerHTML = '';
    let filtered = galleryImages;
    if (filter) filtered = galleryImages.filter(g => g.title.toLowerCase().includes(filter) || g.category.toLowerCase().includes(filter) || g.description.toLowerCase().includes(filter));
    filtered.forEach(img => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><img src="${img.url || img.imageUrl}" alt="" style="width:60px;height:40px;object-fit:cover;"></td><td>${img.title||''}</td><td>${img.category||''}</td><td>${img.description||''}</td><td><button class="btn btn-danger btn-sm delete-gallery-btn" data-id="${img._id}"><i class="bi bi-trash"></i></button></td>`;
      galleryTable.appendChild(tr);
    });
  }
  // Search box for gallery
  const searchGallery = document.createElement('input');
  searchGallery.type = 'search';
  searchGallery.className = 'form-control form-control-sm mb-2';
  searchGallery.placeholder = 'Search gallery...';
  searchGallery.oninput = () => renderGallery(searchGallery.value.trim().toLowerCase());
  galleryTabPanel.insertBefore(searchGallery, galleryTabPanel.querySelector('.table-responsive'));
  // Bulk delete for gallery
  const bulkDeleteGalleryBtn = document.createElement('button');
  bulkDeleteGalleryBtn.className = 'btn btn-outline-danger btn-sm mb-2 ms-2';
  bulkDeleteGalleryBtn.innerHTML = '<i class="bi bi-trash"></i> Delete All';
  bulkDeleteGalleryBtn.onclick = function() {
    if (confirm('Delete ALL gallery images?')) {
      fetch('http://localhost:5000/api/gallery', { method: 'DELETE' })
        .then(() => { fetchGallery(); showToast('All gallery images deleted', 'danger'); });
    }
  };
  galleryTabPanel.insertBefore(bulkDeleteGalleryBtn, galleryTabPanel.querySelector('.table-responsive'));
  fetchGallery();

  // --- SHOW GALLERY PHOTOS ON MAIN PAGE ---
  // If you want to show gallery images on the main site (not admin),
  // add this code to your main.js or the relevant public page JS:
  //
  // fetch('/api/gallery')
  //   .then(res => res.json())
  //   .then(images => {
  //     const galleryDiv = document.getElementById('main-gallery');
  //     if (galleryDiv && Array.isArray(images)) {
  //       galleryDiv.innerHTML = images.map(img =>
  //         `<img src="${img.url || img.imageUrl}" alt="${img.title||''}" class="gallery-img">`
  //       ).join('');
  //     }
  //   });
});

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
