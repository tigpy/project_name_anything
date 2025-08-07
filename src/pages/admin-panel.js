// Admin Panel page specific JS (modularized placeholder)
// Add page-specific interactivity here if needed in the future.

document.addEventListener('DOMContentLoaded', function() {
  // --- ADMIN DASHBOARD WIDGETS ---
  function updateAdminDashboardWidgets() {
    Promise.all([
      fetch('http://localhost:5000/api/users').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-'),
      fetch('http://localhost:5000/api/projects').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-'),
      fetch('http://localhost:5000/api/inventory').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-'),
      fetch('http://localhost:5000/api/contacts').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-'),
      fetch('http://localhost:5000/api/estimator/all').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-'),
      fetch('http://localhost:5000/api/gallery').then(r=>r.json()).then(arr=>arr.length).catch(()=>'-')
    ]).then(([users,projects,inventory,contacts,estimator,gallery]) => {
      document.getElementById('widget-admin-users').textContent = users;
      document.getElementById('widget-admin-projects').textContent = projects;
      document.getElementById('widget-admin-inventory').textContent = inventory;
      document.getElementById('widget-admin-contacts').textContent = contacts;
      document.getElementById('widget-admin-estimator').textContent = estimator;
      document.getElementById('widget-admin-gallery').textContent = gallery;
    });
  }
  updateAdminDashboardWidgets();
  setInterval(updateAdminDashboardWidgets, 15000);

  // --- SIDEBAR NAVIGATION LOGIC (SECTION ACTIVATION) ---
  var sidebarLinks = document.querySelectorAll('.sidebar-link');
  var adminSections = document.querySelectorAll('.admin-section');
  var hero = document.getElementById('admin-hero');
  var dashboard = document.getElementById('admin-dashboard');

  function showSection(targetId) {
    let found = false;
    adminSections.forEach(function(section) {
      if (section.id === targetId) {
        section.classList.remove('d-none');
        found = true;
      } else {
        section.classList.add('d-none');
      }
    });
    if (hero && dashboard) {
      if (targetId === 'admin-dashboard') {
        hero.style.display = '';
        dashboard.style.display = '';
      } else {
        hero.style.display = 'none';
        dashboard.style.display = 'none';
      }
    }
    // Fallback: if not found, show dashboard
    if (!found && dashboard) {
      dashboard.classList.remove('d-none');
      if (hero) hero.style.display = '';
    }
  }

  sidebarLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      sidebarLinks.forEach(function(l) { l.classList.remove('active'); });
      this.classList.add('active');
      var target = this.getAttribute('data-target').replace('#','');
      showSection(target);
      var mainContent = document.querySelector('.admin-content');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Show dashboard by default
  showSection('admin-dashboard');
  if (sidebarLinks[0]) sidebarLinks[0].classList.add('active');

  // Sidebar toggle (for mobile/collapsed)
  var sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      document.querySelector('.admin-sidebar').classList.toggle('collapsed');
    });
  }

  // --- DASHBOARD WIDGETS CLICKABLE (REVISED) ---
  var widgetMap = [
    {widget: 'widget-admin-users', link: 'users'},
    {widget: 'widget-admin-projects', link: 'projects'},
    {widget: 'widget-admin-inventory', link: 'inventory'},
    {widget: 'widget-admin-contacts', link: 'contacts'},
    {widget: 'widget-admin-estimator', link: 'estimator'},
    {widget: 'widget-admin-gallery', link: 'gallery'}
  ];
  widgetMap.forEach(function(map) {
    var el = document.getElementById(map.widget);
    if (el && el.closest('.dashboard-widget')) {
      el.closest('.dashboard-widget').addEventListener('click', function(e) {
        e.preventDefault();
        var sidebarBtn = Array.from(sidebarLinks).find(function(btn) { return btn.getAttribute('data-target') === '#' + map.link; });
        if (sidebarBtn) sidebarBtn.click();
      });
    }
  });

  // --- SOCKET.IO NOTIFICATIONS ---
  (function() {
    if (typeof io !== 'undefined') {
      console.log('[CBMS] Socket.IO found, connecting...');
      const socket = io('http://localhost:5000');
      socket.on('connect', function() {
        console.log('[CBMS] Socket.IO connected:', socket.id);
      });
      socket.on('notification', function(data) {
        console.log('[CBMS] Notification event received:', data);
        const notif = document.getElementById('admin-notification');
        const msg = document.getElementById('admin-notification-msg');
        if (notif && msg && data && data.message) {
          msg.textContent = data.message;
          notif.classList.remove('d-none');
          notif.classList.add('show');
          setTimeout(() => {
            notif.classList.remove('show');
            notif.classList.add('d-none');
          }, 5000);
        }
      });
      socket.on('connect_error', function(err) {
        console.error('[CBMS] Socket.IO connection error:', err);
      });
    } else {
      console.warn('[CBMS] Socket.IO client not found!');
    }
  })();

  // --- PROJECTS STATUS CHART (Chart.js) ---
  async function renderProjectsStatusChart() {
    try {
      const res = await fetch('http://localhost:5000/api/projects');
      const projects = await res.json();
      // Count projects by status
      const statusCounts = {};
      projects.forEach(p => {
        const status = (p.status || 'Unknown').toString();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const ctx = document.getElementById('projectsStatusChart').getContext('2d');
      if (window.projectsStatusChart) window.projectsStatusChart.destroy();
      window.projectsStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            label: 'Projects',
            data: Object.values(statusCounts),
            backgroundColor: 'rgba(220,53,69,0.7)'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    } catch (err) {
      // Chart error handling
    }
  }
  document.addEventListener('DOMContentLoaded', renderProjectsStatusChart);
});
