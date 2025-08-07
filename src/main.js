// Main site-wide JS for CBMS
// Gallery Section Logic
let galleryImages = [];
let currentGalleryIndex = 0;

// Fallback sample images (Unsplash or local assets)
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

fetch('http://localhost:5000/api/gallery')
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(images => {
    if (!Array.isArray(images) || images.length === 0) throw new Error('No images');
    images.forEach(img => img.featured = Math.random() < 0.25);
    galleryImages = images;
    renderGallery('All');
  })
  .catch(() => {
    // Use fallback images if fetch fails or is empty
    galleryImages = fallbackGalleryImages;
    renderGallery('All');
  });

function renderGallery(category) {
  const grid = document.getElementById('gallery-grid');
  let filtered = category==='All' ? galleryImages : galleryImages.filter(img => img.category===category);
  grid.innerHTML = filtered.map((img, idx) => `
    <div class='col-6 col-md-4 col-lg-3 d-flex align-items-stretch'>
      <div class='gallery-img-wrapper w-100 h-100 position-relative' data-idx='${galleryImages.indexOf(img)}'>
        ${img.featured ? `<div class='gallery-featured-ribbon'>Featured</div>` : ''}
        <img src='${img.url}' class='gallery-img rounded shadow-sm' alt='${img.title||"Project"}'>
        <div class='gallery-hover-overlay'>
          <div>${img.title||''}</div>
          <button class='btn btn-light btn-sm mt-2 view-details-btn'>View Details</button>
        </div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('load',()=>img.classList.add('loaded'));
  });
}
document.getElementById('gallery-filters').addEventListener('click', function(e) {
  if (e.target.matches('button[data-filter]')) {
    this.querySelectorAll('button').forEach(btn=>btn.classList.remove('active'));
    e.target.classList.add('active');
    renderGallery(e.target.getAttribute('data-filter'));
  }
});
document.getElementById('gallery-grid').addEventListener('click', function(e) {
  let wrapper = e.target.closest('.gallery-img-wrapper');
  if (!wrapper) return;
  let idx = +wrapper.getAttribute('data-idx');
  if (e.target.classList.contains('view-details-btn') || e.target.classList.contains('gallery-img')) {
    openGalleryModal(idx);
  }
});
function openGalleryModal(idx) {
  currentGalleryIndex = idx;
  const img = galleryImages[idx];
  document.getElementById('galleryModalImg').src = img.url;
  document.getElementById('galleryModalTitle').textContent = img.title || 'Project';
  document.getElementById('galleryModalDesc').textContent = img.description || '';
  let modal = new bootstrap.Modal(document.getElementById('galleryModal'));
  modal.show();
}
document.getElementById('galleryPrevBtn').onclick = function() {
  currentGalleryIndex = (currentGalleryIndex-1+galleryImages.length)%galleryImages.length;
  openGalleryModal(currentGalleryIndex);
};
document.getElementById('galleryNextBtn').onclick = function() {
  currentGalleryIndex = (currentGalleryIndex+1)%galleryImages.length;
  openGalleryModal(currentGalleryIndex);
};
// Smooth Scroll
if (document.querySelectorAll('a.nav-link').length) {
  document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
// Modal-backdrop and modal-open robust fix
function cleanModals() {
  document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  });
  document.body.classList.remove('modal-open');
  document.body.style = '';
}
document.addEventListener('DOMContentLoaded', function() {
  var modals = document.querySelectorAll('.modal');
  modals.forEach(function(modal) {
    modal.addEventListener('hidden.bs.modal', cleanModals);
    modal.addEventListener('show.bs.modal', cleanModals);
  });
  document.body.addEventListener('click', cleanModals, true);
});
// Navbar search logic (fix for main.js-driven sites)
document.addEventListener('DOMContentLoaded', function() {
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
      // Remove previous highlights
      document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
      // Search main sections by id
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
        // Fallback: search visible cards
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
    // Hide search box on outside click
    document.addEventListener('click', function(e) {
      if (!navbarSearchForm.contains(e.target) && e.target !== navbarSearchBtn && !navbarSearchBtn.contains(e.target)) {
        navbarSearchForm.style.display = 'none';
      }
    });
  }
});

// === ADVANCED UX FEATURES ===

document.addEventListener('DOMContentLoaded', function() {
  // 1. Dark/Light Mode Toggle
  const modeToggle = document.getElementById('modeToggleBtn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('cbms-theme');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cbms-theme', theme);
    if (modeToggle) modeToggle.setAttribute('aria-label', theme==='dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
  if (modeToggle) {
    modeToggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
      showToast('Switched to ' + (current === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  // Dark/Light mode toggle (force full light mode on click)
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cbms-theme', 'light');
      modeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      modeToggleBtn.querySelector('i').classList.remove('bi-sun');
      modeToggleBtn.querySelector('i').classList.add('bi-moon-stars');
      showToast('Switched to light mode', 'success');
    });
  }

  // 2. User Profile Dropdown (UI only)
  const profileBtn = document.getElementById('profileDropdownBtn');
  const profileMenu = document.getElementById('profileDropdownMenu');
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
      profileBtn.setAttribute('aria-expanded', profileMenu.classList.contains('show'));
    });
    document.addEventListener('click', function(e) {
      if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
        profileMenu.classList.remove('show');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });
    // Keyboard accessibility
    profileBtn.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        profileMenu.classList.add('show');
        profileMenu.querySelector('a,button').focus();
      }
    });
    profileMenu.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        profileMenu.classList.remove('show');
        profileBtn.focus();
      }
    });
  }

  // 3. Toast Notification System
  function showToast(msg, type = 'info') {
    let toast = document.getElementById('cbmsToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cbmsToast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.className = 'cbms-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'cbms-toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 2200);
  }
  window.showToast = showToast;

  // 4. Floating Help/FAQ Button & Modal
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const helpModalClose = document.getElementById('helpModalClose');
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', function() {
      helpModal.classList.add('show');
      helpModal.setAttribute('aria-hidden', 'false');
      helpModal.querySelector('.help-modal-content').focus();
    });
    helpModalClose && helpModalClose.addEventListener('click', function() {
      helpModal.classList.remove('show');
      helpModal.setAttribute('aria-hidden', 'true');
      helpBtn.focus();
    });
    helpModal.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        helpModal.classList.remove('show');
        helpModal.setAttribute('aria-hidden', 'true');
        helpBtn.focus();
      }
    });
    helpModal.addEventListener('click', function(e) {
      if (e.target === helpModal) {
        helpModal.classList.remove('show');
        helpModal.setAttribute('aria-hidden', 'true');
        helpBtn.focus();
      }
    });
  }

  // 5. Live Search Suggestions
  const searchInput = document.querySelector('#navbarSearchForm input[type="text"]');
  const suggestionBox = document.getElementById('searchSuggestions');
  if (searchInput && suggestionBox) {
    const sectionIds = ['hero','about','services','gallery','testimonials','contact','admin'];
    searchInput.addEventListener('input', function() {
      const val = this.value.trim().toLowerCase();
      suggestionBox.innerHTML = '';
      if (!val) {
        suggestionBox.style.display = 'none';
        return;
      }
      let suggestions = [];
      sectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section && section.offsetParent !== null && getComputedStyle(section).visibility !== 'hidden') {
          if (section.textContent.toLowerCase().includes(val)) {
            suggestions.push({id, label: section.querySelector('h1,h2,h3,h4,h5,h6')?.textContent || id});
          }
        }
      });
      if (suggestions.length) {
        suggestionBox.innerHTML = suggestions.map(s => `<div class='suggestion-item' tabindex='0' data-id='${s.id}'>${s.label}</div>`).join('');
        suggestionBox.style.display = 'block';
      } else {
        suggestionBox.style.display = 'none';
      }
    });
    suggestionBox.addEventListener('click', function(e) {
      if (e.target.classList.contains('suggestion-item')) {
        const id = e.target.getAttribute('data-id');
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({behavior:'smooth', block:'center'});
          section.classList.add('search-highlight');
          setTimeout(() => section.classList.remove('search-highlight'), 1800);
          showToast('Jumped to: ' + (section.querySelector('h1,h2,h3,h4,h5,h6')?.textContent || id));
        }
        suggestionBox.style.display = 'none';
        searchInput.value = '';
      }
    });
    // Keyboard navigation for suggestions
    searchInput.addEventListener('keydown', function(e) {
      if (suggestionBox.style.display === 'block') {
        const items = Array.from(suggestionBox.querySelectorAll('.suggestion-item'));
        let idx = items.findIndex(item => item === document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (idx < items.length - 1) items[idx+1]?.focus();
          else items[0]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx > 0) items[idx-1]?.focus();
          else items[items.length-1]?.focus();
        } else if (e.key === 'Escape') {
          suggestionBox.style.display = 'none';
        }
      }
    });
    suggestionBox.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && document.activeElement.classList.contains('suggestion-item')) {
        document.activeElement.click();
      }
    });
  }

  // === DASHBOARD WIDGETS: FETCH & UPDATE ===
  // Dashboard widgets fetch (demo: random/fake data, replace with real API if available)
  function updateDashboardWidgets() {
    // Simulate API fetch or use real endpoints
    fetch('/api/dashboard-widgets').then(res => res.json()).then(data => {
      document.getElementById('widget-workers').textContent = data.workers ?? '--';
      document.getElementById('widget-projects').textContent = data.projects ?? '--';
      document.getElementById('widget-inventory').textContent = data.inventory ?? '--';
      document.getElementById('widget-estimates').textContent = data.estimates ?? '--';
    }).catch(() => {
      // Fallback: random demo data
      document.getElementById('widget-workers').textContent = Math.floor(Math.random()*50+10);
      document.getElementById('widget-projects').textContent = Math.floor(Math.random()*10+2);
      document.getElementById('widget-inventory').textContent = Math.floor(Math.random()*200+50);
      document.getElementById('widget-estimates').textContent = Math.floor(Math.random()*8+1);
    });
  }
  updateDashboardWidgets();
  setInterval(updateDashboardWidgets, 15000); // Refresh every 15s

  // === MULTI-LANGUAGE SUPPORT ===
  const langSelect = document.getElementById('langSelect');
  const translations = {
    en: {},
    es: {
      'Dashboard Overview': 'Resumen del Panel',
      'Active Workers': 'Trabajadores Activos',
      'Ongoing Projects': 'Proyectos en Curso',
      'Inventory Items': 'Artículos en Inventario',
      'Estimates Today': 'Estimaciones Hoy',
      'Home': 'Inicio', 'About': 'Acerca de', 'Services': 'Servicios', 'Gallery': 'Galería', 'Testimonials': 'Testimonios', 'Contact': 'Contacto', 'Admin': 'Admin',
      'Get Started': 'Comenzar',
      'Send': 'Enviar',
      'Login': 'Acceder',
      'Worker Management': 'Gestión de Trabajadores',
      'Project Tracking': 'Seguimiento de Proyectos',
      'Inventory Management': 'Gestión de Inventario',
      'Client Communication': 'Comunicación con Clientes',
      'AI Project Estimator': 'Estimador de Proyectos IA',
      'Mobile App': 'Aplicación Móvil',
      'Estimate Now': 'Estimar Ahora',
      'Thank you for contacting us!': '¡Gracias por contactarnos!',
      'New!': '¡Nuevo!',
      'Help & FAQ': 'Ayuda y Preguntas',
      'Close help': 'Cerrar ayuda'
    },
    fr: {
      'Dashboard Overview': 'Aperçu du Tableau de Bord',
      'Active Workers': 'Ouvriers Actifs',
      'Ongoing Projects': 'Projets en Cours',
      'Inventory Items': 'Articles en Stock',
      'Estimates Today': 'Estimations Aujourd’hui',
      'Home': 'Accueil', 'About': 'À propos', 'Services': 'Services', 'Gallery': 'Galerie', 'Testimonials': 'Témoignages', 'Contact': 'Contact', 'Admin': 'Admin',
      'Get Started': 'Commencer',
      'Send': 'Envoyer',
      'Login': 'Connexion',
      'Worker Management': 'Gestion des Ouvriers',
      'Project Tracking': 'Suivi de Projet',
      'Inventory Management': 'Gestion des Stocks',
      'Client Communication': 'Communication Client',
      'AI Project Estimator': 'Estimateur IA',
      'Mobile App': 'Application Mobile',
      'Estimate Now': 'Estimer',
      'Thank you for contacting us!': 'Merci de nous avoir contactés !',
      'New!': 'Nouveau !',
      'Help & FAQ': 'Aide & FAQ',
      'Close help': 'Fermer l’aide'
    },
    de: {
      'Dashboard Overview': 'Dashboard Übersicht',
      'Active Workers': 'Aktive Arbeiter',
      'Ongoing Projects': 'Laufende Projekte',
      'Inventory Items': 'Inventarartikel',
      'Estimates Today': 'Schätzungen Heute',
      'Home': 'Start', 'About': 'Über', 'Services': 'Dienstleistungen', 'Gallery': 'Galerie', 'Testimonials': 'Referenzen', 'Contact': 'Kontakt', 'Admin': 'Admin',
      'Get Started': 'Loslegen',
      'Send': 'Senden',
      'Login': 'Anmelden',
      'Worker Management': 'Mitarbeiterverwaltung',
      'Project Tracking': 'Projektverfolgung',
      'Inventory Management': 'Inventarverwaltung',
      'Client Communication': 'Kundenkommunikation',
      'AI Project Estimator': 'KI-Projektschätzer',
      'Mobile App': 'Mobile App',
      'Estimate Now': 'Jetzt schätzen',
      'Thank you for contacting us!': 'Danke für Ihre Kontaktaufnahme!',
      'New!': 'Neu!',
      'Help & FAQ': 'Hilfe & FAQ',
      'Close help': 'Hilfe schließen'
    },
    hi: {
      'Dashboard Overview': 'डैशबोर्ड अवलोकन',
      'Active Workers': 'सक्रिय कर्मचारी',
      'Ongoing Projects': 'चल रहे प्रोजेक्ट',
      'Inventory Items': 'इन्वेंटरी आइटम्स',
      'Estimates Today': 'आज की अनुमान',
      'Home': 'होम', 'About': 'परिचय', 'Services': 'सेवाएँ', 'Gallery': 'गैलरी', 'Testimonials': 'प्रशंसापत्र', 'Contact': 'संपर्क', 'Admin': 'प्रशासन',
      'Get Started': 'शुरू करें',
      'Send': 'भेजें',
      'Login': 'लॉगिन',
      'Worker Management': 'कर्मचारी प्रबंधन',
      'Project Tracking': 'परियोजना ट्रैकिंग',
      'Inventory Management': 'इन्वेंटरी प्रबंधन',
      'Client Communication': 'ग्राहक संचार',
      'AI Project Estimator': 'एआई परियोजना अनुमानक',
      'Mobile App': 'मोबाइल ऐप',
      'Estimate Now': 'अब अनुमान लगाएं',
      'Thank you for contacting us!': 'संपर्क करने के लिए धन्यवाद!',
      'New!': 'नया!',
      'Help & FAQ': 'सहायता और प्रश्न',
      'Close help': 'सहायता बंद करें'
    },
    zh: {
      'Dashboard Overview': '仪表板概览',
      'Active Workers': '活跃工人',
      'Ongoing Projects': '进行中的项目',
      'Inventory Items': '库存项目',
      'Estimates Today': '今日估算',
      'Home': '首页', 'About': '关于', 'Services': '服务', 'Gallery': '画廊', 'Testimonials': '评价', 'Contact': '联系', 'Admin': '管理员',
      'Get Started': '开始',
      'Send': '发送',
      'Login': '登录',
      'Worker Management': '工人管理',
      'Project Tracking': '项目跟踪',
      'Inventory Management': '库存管理',
      'Client Communication': '客户沟通',
      'AI Project Estimator': 'AI项目估算器',
      'Mobile App': '移动应用',
      'Estimate Now': '立即估算',
      'Thank you for contacting us!': '感谢您的联系！',
      'New!': '新！',
      'Help & FAQ': '帮助与常见问题',
      'Close help': '关闭帮助'
    }
  };
  // --- Language Selector Logic ---
  if (langSelect) {
    langSelect.setAttribute('aria-label', 'Select language');
    langSelect.setAttribute('aria-live', 'polite');
    langSelect.addEventListener('change', function() {
      const lang = this.value;
      localStorage.setItem('cbms-lang', lang);
      translatePage(lang);
      showToast('Language switched to ' + this.options[this.selectedIndex].text, 'info');
    });
    // Keyboard navigation for accessibility
    langSelect.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.size = this.options.length;
      } else if (e.key === 'Escape') {
        this.size = 0;
      }
    });
    langSelect.addEventListener('blur', function() { this.size = 0; });
    // On load, set language
    const savedLang = localStorage.getItem('cbms-lang') || 'en';
    langSelect.value = savedLang;
    translatePage(savedLang);
  }

  // --- Translation Fallback and Dynamic i18n ---
  function translatePage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      } else if (translations['en'][key]) {
        el.textContent = translations['en'][key];
      } else {
        // Fallback: keep original text
      }
    });
  }
});

// === MULTI-LANGUAGE: Add data-i18n to all key button/label text ===
document.addEventListener('DOMContentLoaded', function() {
  // Add data-i18n to dynamic elements (buttons, modals, etc.)
  const i18nMap = [
    { selector: 'a.btn.btn-primary.btn-lg', key: 'Get Started' },
    { selector: '#contactForm button[type="submit"]', key: 'Send' },
    { selector: '#adminLoginForm button[type="submit"]', key: 'Login' },
    { selector: '#serviceWorkerModalLabel', key: 'Worker Management' },
    { selector: '#serviceProjectModalLabel', key: 'Project Tracking' },
    { selector: '#serviceInventoryModalLabel', key: 'Inventory Management' },
    { selector: '#serviceClientModalLabel', key: 'Client Communication' },
    { selector: '#aiEstimatorModalLabel', key: 'AI Project Estimator' },
    { selector: '#serviceMobileModalLabel', key: 'Mobile App' },
    { selector: '#aiEstimatorForm button[type="submit"]', key: 'Estimate Now' },
    { selector: '#contactSuccess', key: 'Thank you for contacting us!' },
    { selector: '.alert.alert-warning strong', key: 'New!' },
    { selector: '.alert.alert-warning a', key: 'AI Project Estimator' },
    { selector: '#helpModal h2', key: 'Help & FAQ' },
    { selector: '#helpModalClose', key: 'Close help' }
  ];
  i18nMap.forEach(item => {
    const el = document.querySelector(item.selector);
    if (el) el.setAttribute('data-i18n', item.key);
  });
});

// PWA: Show install prompt if available
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  let deferredPrompt = e;
  const installBtn = document.createElement('button');
  installBtn.textContent = 'Install App';
  installBtn.className = 'btn btn-primary position-fixed';
  installBtn.style.bottom = '80px';
  installBtn.style.right = '2rem';
  installBtn.style.zIndex = 2100;
  installBtn.style.borderRadius = '1.2rem';
  installBtn.style.boxShadow = '0 4px 24px #007cf055';
  document.body.appendChild(installBtn);
  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('App installed!', 'success');
      }
      installBtn.remove();
    });
  });
});
