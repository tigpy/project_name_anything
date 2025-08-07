// Home page specific JS extracted from Index.html
// Modularize further as needed (gallery, help modal, search, etc.)

// --- Enhanced Gallery Section Logic ---
let galleryImages = [];
let currentGalleryIndex = 0;
let currentSort = 'default';
const galleryGrid = document.getElementById('gallery-grid');
const galleryFilters = document.getElementById('gallery-filters');
const gallerySort = document.getElementById('gallery-sort');

// Sample images for fallback/demo
const sampleGalleryImages = [
  { title: 'Modern Villa', description: 'A luxury residential villa with eco-friendly features.', category: 'Residential', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
  { title: 'Downtown Office Complex', description: 'A state-of-the-art commercial office building in the city center.', category: 'Commercial', url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Renovated Heritage Home', description: 'A classic home restored with modern amenities.', category: 'Renovation', url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80' },
  { title: 'Smart Apartment Block', description: 'A multi-storey residential building with smart automation.', category: 'Residential', url: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=600&q=80' },
  { title: 'Retail Mall Expansion', description: 'Expansion of a popular shopping mall with new retail spaces.', category: 'Commercial', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80' },
  { title: 'Cottage Makeover', description: 'A cozy cottage renovated for modern living.', category: 'Renovation', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80' },
  { title: 'Eco Office Park', description: 'A green commercial park with solar panels and gardens.', category: 'Commercial', url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80' },
  { title: 'Luxury Penthouse', description: 'A high-rise penthouse with panoramic city views.', category: 'Residential', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' }
];

galleryGrid.innerHTML = `<div class="d-flex justify-content-center w-100 py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

fetch('/api/gallery')
  .then(res => { if (!res.ok) throw new Error('Failed to fetch gallery'); return res.json(); })
  .then(images => {
    images.forEach(img => img.featured = Math.random() < 0.25);
    galleryImages = images.length ? images : sampleGalleryImages;
    if (!galleryImages.length) {
      galleryGrid.innerHTML = `<div class='text-center w-100 py-5 text-muted'><i class='bi bi-emoji-frown fs-1'></i><br>No projects found.</div>`;
    } else {
      renderGallery('All', currentSort);
    }
  })
  .catch(() => {
    galleryImages = sampleGalleryImages;
    renderGallery('All', currentSort);
  });

function sortGallery(images, sort) {
  let arr = [...images];
  if (sort === 'title-asc') arr.sort((a,b) => (a.title||'').localeCompare(b.title||''));
  else if (sort === 'title-desc') arr.sort((a,b) => (b.title||'').localeCompare(a.title||''));
  else if (sort === 'category') arr.sort((a,b) => (a.category||'').localeCompare(b.category||''));
  return arr;
}

function renderGallery(category, sort = 'default') {
  let filtered = category==='All' ? galleryImages : galleryImages.filter(img => img.category===category);
  filtered = sortGallery(filtered, sort);
  if (!filtered.length) {
    galleryGrid.innerHTML = `<div class='text-center w-100 py-5 text-muted'><i class='bi bi-emoji-frown fs-1'></i><br>No projects found in this category.</div>`;
    return;
  }
  galleryGrid.innerHTML = filtered.map((img, idx) => {
    let typeIcon = 'bi bi-house';
    if (img.category === 'Commercial') typeIcon = 'bi bi-building';
    else if (img.category === 'Renovation') typeIcon = 'bi bi-brush';
    else if (img.category === 'Residential') typeIcon = 'bi bi-house-door';
    return `
      <div class='col-6 col-md-4 col-lg-3 d-flex align-items-stretch'>
        <div class='gallery-card w-100 h-100 position-relative' data-idx='${galleryImages.indexOf(img)}' style="opacity:0;transform:scale(0.96);transition:all .5s cubic-bezier(.4,2,.3,1);">
          <img src='${img.url || img.imageUrl}' class='gallery-img' alt='${img.title||"Project"}' loading="lazy">
          <span class="gallery-fav"><i class="bi bi-heart"></i></span>
          <div class='gallery-overlay'>
            <span class="gallery-type-icon ${typeIcon}"></span>
            <div class='gallery-title'>${img.title||''}</div>
            <button class='gallery-view-btn btn btn-outline-primary btn-sm mt-2' data-i18n="View Details">View Details</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  galleryGrid.querySelectorAll('.gallery-card').forEach((card, i) => {
    setTimeout(() => {
      card.style.opacity = 1;
      card.style.transform = 'scale(1)';
    }, 80 + i * 80);
  });
  galleryGrid.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('load',()=>img.classList.add('loaded'));
  });
}

galleryFilters.addEventListener('click', function(e) {
  const btn = e.target.closest('button[data-filter]');
  if (btn) {
    this.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.getAttribute('data-filter'), currentSort);
  }
});
gallerySort.addEventListener('change', function() {
  currentSort = this.value;
  const activeBtn = galleryFilters.querySelector('button.active');
  const category = activeBtn ? activeBtn.getAttribute('data-filter') : 'All';
  renderGallery(category, currentSort);
});
galleryGrid.addEventListener('click', function(e) {
  const card = e.target.closest('.gallery-card');
  if (!card) return;
  let idx = +card.getAttribute('data-idx');
  if (e.target.classList.contains('gallery-view-btn') || e.target.classList.contains('gallery-img')) {
    openGalleryModal(idx);
  }
  if (e.target.classList.contains('gallery-fav') || e.target.closest('.gallery-fav')) {
    const fav = e.target.classList.contains('gallery-fav') ? e.target : e.target.closest('.gallery-fav');
    fav.classList.toggle('favorited');
    if (fav.classList.contains('favorited') && window.confetti) {
      const rect = fav.getBoundingClientRect();
      confetti({
        particleCount: 32,
        spread: 60,
        origin: {
          x: (rect.left + rect.width/2) / window.innerWidth,
          y: (rect.top + rect.height/2) / window.innerHeight
        },
        colors: ['#ff416c','#ff4b2b','#007cf0','#00dfd8']
      });
    }
  }
});
function openGalleryModal(idx) {
  if (!galleryImages.length) return;
  currentGalleryIndex = idx;
  const img = galleryImages[idx];
  const modalImg = document.getElementById('galleryModalImg');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalDesc = document.getElementById('galleryModalDesc');
  const modalCategory = document.getElementById('galleryModalCategory');
  if (modalImg) modalImg.src = img.url || img.imageUrl;
  if (modalTitle) modalTitle.textContent = img.title || 'Project';
  if (modalDesc) modalDesc.textContent = img.description || '';
  if (modalCategory) modalCategory.textContent = img.category || '';
  const modalEl = document.getElementById('galleryModal');
  if (modalEl && !modalEl.classList.contains('show')) {
    let modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}
['galleryPrevBtn','galleryNextBtn'].forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) btn.onclick = null;
});
document.getElementById('galleryPrevBtn').onclick = function() {
  if (!galleryImages.length) return;
  currentGalleryIndex = (currentGalleryIndex-1+galleryImages.length)%galleryImages.length;
  openGalleryModal(currentGalleryIndex);
};
document.getElementById('galleryNextBtn').onclick = function() {
  if (!galleryImages.length) return;
  currentGalleryIndex = (currentGalleryIndex+1)%galleryImages.length;
  openGalleryModal(currentGalleryIndex);
};
const galleryModalEl = document.getElementById('galleryModal');
if (galleryModalEl) {
  galleryModalEl.addEventListener('hidden.bs.modal', function() {
    document.getElementById('galleryModalImg').src = '';
    document.getElementById('galleryModalTitle').textContent = '';
    document.getElementById('galleryModalDesc').textContent = '';
    document.getElementById('galleryModalCategory').textContent = '';
  });
}
document.addEventListener('keydown', function(e) {
  if (document.body.classList.contains('modal-open')) {
    if (e.key === 'ArrowLeft') document.getElementById('galleryPrevBtn').click();
    if (e.key === 'ArrowRight') document.getElementById('galleryNextBtn').click();
  }
});

// Navbar search logic
const navbarSearchBtn = document.getElementById('navbarSearchBtn');
const navbarSearchForm = document.getElementById('navbarSearchForm');
if (navbarSearchBtn && navbarSearchForm) {
  navbarSearchBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    navbarSearchForm.style.display = navbarSearchForm.style.display === 'none' ? 'flex' : 'none';
    if (navbarSearchForm.style.display === 'flex') {
      navbarSearchForm.querySelector('input').focus();
    }
  });
  navbarSearchForm.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  navbarSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = navbarSearchForm.querySelector('input').value.trim().toLowerCase();
    if (!query) return;
    document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
    let found = false;
    const sectionIds = ['hero','about','services','gallery','testimonials','contact','admin'];
    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section && section.offsetParent !== null && getComputedStyle(section).visibility !== 'hidden') {
        if (section.textContent.toLowerCase().includes(query)) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          section.classList.add('search-highlight');
          setTimeout(() => section.classList.remove('search-highlight'), 1800);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      const cards = Array.from(document.querySelectorAll('.card')).filter(el => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');
      for (const card of cards) {
        if (card.textContent.toLowerCase().includes(query)) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('search-highlight');
          setTimeout(() => card.classList.remove('search-highlight'), 1800);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      alert('No results found for: ' + query);
    }
    navbarSearchForm.style.display = 'none';
    navbarSearchForm.querySelector('input').value = '';
  });
  document.addEventListener('click', function(e) {
    if (!navbarSearchForm.contains(e.target) && e.target !== navbarSearchBtn && !navbarSearchBtn.contains(e.target)) {
      navbarSearchForm.style.display = 'none';
    }
  });
}

// Toast notification logic
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('cbmsToast');
  const toastId = 'toast-' + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" style="position:relative;z-index:1050;">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Help/FAQ modal
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const helpModalClose = document.getElementById('helpModalClose');
helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'flex';
  setTimeout(() => helpModal.classList.add('show'), 10);
});
helpModalClose.addEventListener('click', () => {
  helpModal.classList.remove('show');
  setTimeout(() => helpModal.style.display = 'none', 300);
});
window.addEventListener('click', (e) => {
  if (helpModal.style.display === 'flex' && !helpModal.contains(e.target) && e.target !== helpBtn) {
    helpModal.classList.remove('show');
    setTimeout(() => helpModal.style.display = 'none', 300);
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (helpModal.classList.contains('show')) {
      helpModal.classList.remove('show');
      setTimeout(() => helpModal.style.display = 'none', 300);
    }
  }
});

// --- Live Search Suggestions Logic ---
const searchSuggestions = document.getElementById('searchSuggestions');
const searchInput = document.querySelector('input[aria-label="Search"]');
searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  searchSuggestions.innerHTML = '';
  if (!query) return;
  fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(suggestions => {
      suggestions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;
        div.onclick = () => {
          searchInput.value = item;
          searchSuggestions.innerHTML = '';
          navbarSearchForm.dispatchEvent(new Event('submit'));
        };
        searchSuggestions.appendChild(div);
      });
      if (suggestions.length === 0) {
        const div = document.createElement('div');
        div.className = 'dropdown-item text-muted';
        div.textContent = 'No suggestions found';
        searchSuggestions.appendChild(div);
      }
    })
    .catch(err => {
      console.error('Error fetching search suggestions:', err);
    });
});

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {}, function(err) {});
  });
}

// --- Language Selector Logic ---
const langSelect = document.getElementById('langSelect');
if (langSelect) {
  langSelect.addEventListener('change', function() {
    const selectedLang = this.value;
    console.log('Language changed to:', selectedLang);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var cbmsToast = document.getElementById('cbmsToast');
  if (cbmsToast) cbmsToast.style.display = 'block';
  var modeToggleBtn = document.getElementById('modeToggleBtn');
  var body = document.body;
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', function() {
      body.classList.toggle('dark-mode');
      var isDarkMode = body.classList.contains('dark-mode');
      modeToggleBtn.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
      var icon = modeToggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-moon-stars', !isDarkMode);
        icon.classList.toggle('bi-sun', isDarkMode);
      }
      if (typeof showToast === 'function') {
        showToast(`Switched to ${isDarkMode ? 'dark' : 'light'} mode`, 'success');
      }
    });
  }
  var helpBtn = document.getElementById('helpBtn');
  var helpModal = document.getElementById('helpModal');
  var helpModalClose = document.getElementById('helpModalClose');
  if (helpBtn && helpModal && helpModalClose) {
    helpBtn.addEventListener('click', function() {
      helpModal.style.display = 'flex';
      setTimeout(function() { helpModal.classList.add('show'); }, 10);
    });
    helpModalClose.addEventListener('click', function() {
      helpModal.classList.remove('show');
      setTimeout(function() { helpModal.style.display = 'none'; }, 300);
    });
    window.addEventListener('click', function(e) {
      if (helpModal.style.display === 'flex' && !helpModal.contains(e.target) && e.target !== helpBtn) {
        helpModal.classList.remove('show');
        setTimeout(function() { helpModal.style.display = 'none'; }, 300);
      }
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && helpModal.classList.contains('show')) {
        helpModal.classList.remove('show');
        setTimeout(function() { helpModal.style.display = 'none'; }, 300);
      }
    });
  }
});
