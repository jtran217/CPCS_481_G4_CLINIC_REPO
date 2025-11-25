// ============================
// SPA Router for Bellhart Clinic
// ============================
const routes = {
  dashboard: {
    path: 'pages/dashboard.html',
    title: 'Welcome [User]!', //TODO: Get user name logic
    subtitle: 'Here\'s your healthcare at a glance!'
  },
  schedule: {
    path: 'pages/schedule.html',
    title: 'Appointment Schedule',
    subtitle: 'Select a time slot to book or view appointment details.'
  },
  labtest: {
    path: 'pages/labtest.html',
    title: 'Lab Tests',
    subtitle: 'View and track your lab results.'
  },
  reports: {
    path: 'pages/reports.html',
    title: 'My Reports',
    subtitle: 'View and manage your medical reports.'
  }
};

async function loadPage(routeName) {
  const route = routes[routeName] || routes.dashboard;
  const pageContentEl = document.getElementById('page-content');
  const headerContainer = document.getElementById('page-header-container');

  if (!pageContentEl) return;

  try {
    const response = await fetch(route.path);
    const html = await response.text();
    pageContentEl.innerHTML = html;

    // Update header
    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="page-header">
          <h1 class="page-header-title">${route.title}</h1>
          <p class="page-header-subtitle">${route.subtitle}</p>
        </div>
      `;
    }

    // Update active nav item
    updateActiveNav(routeName);

    // If this page needs JS (e.g. schedule calendar), init it now
    if (routeName === 'schedule') {
      // Wait a tick for DOM to be ready
      setTimeout(() => {
        if (typeof initSchedulePage === 'function') {
          initSchedulePage();
        }
      }, 0);
    }
  } catch (err) {
    console.error('Error loading page:', err);
    pageContentEl.innerHTML = '<p>Failed to load page.</p>';
  }
}

function updateActiveNav(routeName) {
  // Clear all active states
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('nav-item--active');
  });

  // Set active for current route
  const activeLink = document.querySelector(`.nav-item[data-route="${routeName}"]`);
  if (activeLink) {
    activeLink.classList.add('nav-item--active');
  }
}

function getRouteFromHash() {
  const hash = window.location.hash.replace('#', '');
  return hash || 'dashboard';
}

function handleRouteChange() {
  const routeName = getRouteFromHash();
  loadPage(routeName);
}

document.addEventListener('DOMContentLoaded', () => {
  // Load booking modal component
  fetch('components/booking-modal.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('booking-modal-container').innerHTML = html;
    });

  // Handle initial route
  handleRouteChange();

  // Handle back/forward
  window.addEventListener('hashchange', handleRouteChange);

  // Handle nav link clicks (optional – hash already does most of it)
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (!link) return;
    e.preventDefault();
    const routeName = link.getAttribute('data-route');
    window.location.hash = routeName; // triggers hashchange → loadPage
  });
});
