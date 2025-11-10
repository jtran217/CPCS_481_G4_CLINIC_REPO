function loadComponent(targetId, path, callback) {
  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      const el = document.getElementById(targetId);
      if (el) {
        el.innerHTML = html;
        if (callback) callback(el);
      }
    })
    .catch((err) => console.error(`Error loading ${path}`, err));
}

function setActiveNav(sidebarRoot) {
  if (!sidebarRoot) return;

  // get current file name: 'dashboard.html', 'schedule.html', etc.
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';

  let key = 'dashboard';
  if (file.includes('schedule')) key = 'schedule';
  else if (file.includes('reports')) key = 'reports';

  // clear any existing active
  sidebarRoot.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('nav-item--active');
  });

  // mark the matching one active
  const active = sidebarRoot.querySelector(`.nav-item[data-link="${key}"]`);
  if (active) active.classList.add('nav-item--active');
}

// load sidebar, then highlight active
loadComponent('sidebar-container', 'components/sidebar.html', (sidebarRoot) => {
  setActiveNav(sidebarRoot);
});

// load topbar (no extra logic needed)
loadComponent('topbar-container', 'components/topbar.html');
