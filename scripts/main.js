// ============================
// User Data Manager
// ============================
let sessionUser = null;

async function initSession() {
  try {
    const response = await fetch('data/users.json');
    const data = await response.json();

    // Simulated login - automatically picks Sarah Jones
    sessionUser = data.users[0]

    updateHeaderProfile();
  } catch (error) {
    console.error("Failed to load user data:", error);
  }
}

function updateHeaderProfile() {
  if (!sessionUser) return;

  const profileNameEl = document.querySelector('.profile-name');
  if (profileNameEl) {
    profileNameEl.textContent = sessionUser.profile.name; 
  }
}

function populateProfilePage() {
  if (!sessionUser) return;

  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const names = sessionUser.profile.name.split(' ');
  const fname = names [0];
  const lname = names.slice(1).join(' ');

  setVal('profile-fname', fname);
    setVal('profile-lname', lname);
    setVal('profile-email', sessionUser.email);
    setVal('profile-phone', sessionUser.profile.phone);
    setVal('profile-dob', sessionUser.profile.dateOfBirth);
    setVal('profile-sex', sessionUser.profile.sex);
    setVal('profile-health', sessionUser.profile.healthNumber);

    setVal('profile-street', sessionUser.profile.address.street);
    setVal('profile-city', sessionUser.profile.address.city);
    setVal('profile-state', sessionUser.profile.address.state);
    setVal('profile-postal', sessionUser.profile.address.postalCode);
}

// ============================
// SPA Router for Bellhart Clinic
// ============================
const routes = {
  dashboard: {
    path: "pages/dashboard.html",
    title: "Welcome Sarah",
    subtitle: "Here's your healthcare at a glance!",
  },
  schedule: {
    path: "pages/schedule.html",
    title: "Appointment Schedule",
    subtitle: "Select a time slot to book or view appointment details.",
  },
  labtest: {
    path: "pages/labtest.html",
    title: "Lab Tests",
    subtitle: "View and track your lab results.",
  },
  reports: {
    path: "pages/reports.html",
    title: "My Reports",
    subtitle: "View and manage your medical reports.",
  },
  lab: {
    path: "pages/lab.html",
    title: "Lab Test Results",
    subtitle: "View and track your lab results.",
  },
  prescriptions: {
    path: "pages/prescriptions.html",
    title: "Prescriptions and Medications",
    subtitle: "Manage your prescriptions and medications.",
  },
  physical: {
    path: "pages/physical.html",
    title: "Physical Test Results",
    subtitle: "View your physical examination results.",
  },
  imaging: {
    path: "pages/imaging.html",
    title: "Imaging and Scans",
    subtitle: "View your medical imaging and scan results.",
  },
  immunization: {
    path: "pages/immunization.html",
    title: "Immunization Records",
    subtitle: "View your vaccination and immunization history.",
  },
  insurance: {
    path: "pages/insurance.html",
    title: "Insurance Documents",
    subtitle: "Access your insurance documents and policies.",
  },
  xray: {
    path: "pages/xray.html",
    title: "Lung X-Ray",
    subtitle: "View your lung X-Ray scan results.",
  },
  bluecross: {
    path: "pages/bluecross.html",
    title: "Alberta Blue Cross",
    subtitle: "View your Alberta Blue Cross insurance document.",
  },
  profile: {
    path: "pages/profile.html",
    title: "My Account", 
    subtitle: "Manage your personal information and preferences",
  },
};

async function loadPage(routeName) {
  const route = routes[routeName] || routes.dashboard;
  const pageContentEl = document.getElementById("page-content");
  const headerContainer = document.getElementById("page-header-container");
  const breadcrumbContainer = document.getElementById("breadcrumb-container");

  if (!pageContentEl) return;

  try {
    const response = await fetch(route.path);
    const html = await response.text();
    pageContentEl.innerHTML = html;

    // Extract breadcrumb links from page content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const backLink = tempDiv.querySelector(".back-link");
    
    // Clear breadcrumb container
    if (breadcrumbContainer) {
      breadcrumbContainer.innerHTML = "";
      breadcrumbContainer.style.display = "none";
    }

    // If breadcrumb exists, move it above the header
    if (backLink && breadcrumbContainer) {
      breadcrumbContainer.innerHTML = backLink.outerHTML;
      breadcrumbContainer.style.display = "block";
      
      // Remove breadcrumb from page content
      const backLinkInContent = pageContentEl.querySelector(".back-link");
      if (backLinkInContent) {
        backLinkInContent.remove();
      }
    }

    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="page-header">
          <h1 class="page-header-title">${route.title}</h1>
          <p class="page-header-subtitle">${route.subtitle}</p>
        </div>
      `;
    }

    updateActiveNav(routeName);

    if (routeName == 'profile') {
      populateProfilePage();
    }

    if (routeName === "schedule") {
      setTimeout(() => {
        if (typeof initSchedulePage === "function") {
          initSchedulePage();
        }
        // Re-initialize tooltips after schedule page loads
        setTimeout(() => {
          setupAppTooltips();
        }, 200);
      }, 0);
    }

    // Initialize records pages (reports and all sub-pages)
    const recordsRoutes = ["reports", "lab", "prescriptions", "physical", "imaging", "immunization", "insurance", "xray", "bluecross"];
    if (recordsRoutes.includes(routeName)) {
      setTimeout(() => {
        if (typeof initRecordsPage === "function") {
          initRecordsPage();
        }
      }, 0);
    }

    // Initialize dashboard appointments
    if (routeName === "dashboard") {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (typeof window.initDashboardAppointments === "function") {
            window.initDashboardAppointments();
          } else if (typeof window.renderAppointments === "function") {
            // Fallback: just render if init doesn't exist
            window.renderAppointments();
          }
        }, 50);
      });
    }

  } catch (err) {
    console.error("Error loading page:", err);
    pageContentEl.innerHTML = "<p>Failed to load page.</p>";
  }
}

function updateActiveNav(routeName) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("nav-item--active");
  });
  
  // If it's a records page, highlight "reports" instead
  const recordsRoutes = ["reports", "lab", "prescriptions", "physical", "imaging", "immunization", "insurance", "xray", "bluecross"];
  const navRouteName = recordsRoutes.includes(routeName) ? "reports" : routeName;
  
  const activeLink = document.querySelector(
    `.nav-item[data-route="${navRouteName}"]`
  );
  if (activeLink) {
    activeLink.classList.add("nav-item--active");
  }
}

function getRouteFromHash() {
  const hash = window.location.hash.replace("#", "");
  return hash || "dashboard";
}

function handleRouteChange() {
  const routeName = getRouteFromHash();
  loadPage(routeName);
}

document.addEventListener("DOMContentLoaded", () => {
  // Load booking modal component
  fetch("components/booking-modal.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("booking-modal-container").innerHTML = html;
    });

  // Load appointment details modal component
  fetch("components/appointment-details-modal.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("appointment-details-modal-container").innerHTML =
        html;
    });

  // Load toast component
  fetch("components/toast.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("toast-container-wrapper").innerHTML = html;
    });

  // Initialize tooltips for app
  initAppTooltips();

  // Handle initial route
  handleRouteChange();
  window.addEventListener("hashchange", handleRouteChange);
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");
    if (!link) return;
    e.preventDefault();
    const routeName = link.getAttribute("data-route");
    window.location.hash = routeName;
  });

  initNotifications();
});

let notifications = [];

async function loadNotifications() {
  try {
    const response = await fetch("data/notifications.json");
    const data = await response.json();
    notifications = data.notifications || [];
    updateNotificationBadge();
  } catch (error) {
    console.error("Error loading notifications:", error);
    notifications = [];
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById("notification-badge");
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  if (badge) {
    badge.textContent = unreadCount > 0 ? unreadCount : "";
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function renderNotifications() {
  const notificationList = document.getElementById("notification-list");
  if (!notificationList) return;

  notificationList.innerHTML = "";

  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="notification-item">
        <div class="notification-content">
          <p class="notification-title">No notifications</p>
          <p class="notification-message">You're all caught up!</p>
        </div>
      </div>
    `;
    return;
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  unreadNotifications.forEach((notification) => {
    const notificationElement = createNotificationElement(notification);
    notificationList.appendChild(notificationElement);
  });

  if (readNotifications.length > 0) {
    const earlierSection = document.createElement("div");
    earlierSection.className = "notification-section-header";
    earlierSection.innerHTML = '<span class="notification-time">Earlier</span>';
    notificationList.appendChild(earlierSection);

    readNotifications.forEach((notification) => {
      const notificationElement = createNotificationElement(notification);
      notificationList.appendChild(notificationElement);
    });
  }
}

function createNotificationElement(notification) {
  const element = document.createElement("div");
  element.className = `notification-item ${
    notification.isRead ? "" : "unread"
  }`;
  element.dataset.id = notification.id;

  let iconClass = "appointment";
  if (notification.type === "lab") iconClass = "lab";
  if (notification.type === "reminder") iconClass = "reminder";

  element.innerHTML = `
    <div class="notification-icon ${iconClass}">
      <span class="notification-icon-svg icon-${notification.icon}"></span>
    </div>
    <div class="notification-content">
      <h4 class="notification-title">${notification.title}</h4>
      <p class="notification-message">${notification.message}</p>
      <div class="notification-time">${notification.time}</div>
    </div>
  `;

  element.addEventListener("click", () => {
    markNotificationAsRead(notification.id);
  });

  return element;
}

function markNotificationAsRead(notificationId) {
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification && !notification.isRead) {
    notification.isRead = true;
    updateNotificationBadge();

    const notificationElement = document.querySelector(
      `[data-id="${notificationId}"]`
    );
    if (notificationElement) {
      notificationElement.classList.remove("unread");
    }
  }
}

function showNotifications() {
  const modal = document.getElementById("notification-modal");
  if (modal) {
    renderNotifications();
    updateMarkAllReadButton();
    modal.classList.add("show");

    document.addEventListener("keydown", handleEscapeKey);
  }
}

function hideNotifications() {
  const modal = document.getElementById("notification-modal");
  if (modal) {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleEscapeKey);
  }
}

function handleEscapeKey(e) {
  if (e.key === "Escape") {
    hideNotifications();
  }
}

function initNotifications() {
  loadNotifications();

  const notificationBtn = document.getElementById("notifications-btn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showNotifications();
    });
  }

  const closeBtn = document.getElementById("close-notifications");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideNotifications);
  }

  const markAllReadBtn = document.getElementById("mark-all-read");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
  }

  const modal = document.getElementById("notification-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideNotifications();
      }
    });
  }

  const modalContent = document.querySelector(".notification-modal-content");
  if (modalContent) {
    modalContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
}

function addNotification(notification) {
  const newNotification = {
    id: Date.now(),
    isRead: false,
    time: "now",
    ...notification,
  };

  notifications.unshift(newNotification);
  updateNotificationBadge();

  if (
    document.getElementById("notification-modal").classList.contains("show")
  ) {
    renderNotifications();
  }
}

function updateMarkAllReadButton() {
  const markAllReadBtn = document.getElementById("mark-all-read");
  if (markAllReadBtn) {
    const hasUnreadNotifications = notifications.some((n) => !n.isRead);
    markAllReadBtn.disabled = !hasUnreadNotifications;
  }
}

function markAllAsRead() {
  let hasChanges = false;
  notifications.forEach((notification) => {
    if (!notification.isRead) {
      notification.isRead = true;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    updateNotificationBadge();
    renderNotifications();
    updateMarkAllReadButton();
  }
}
// Expose notification functions globally
window.addNotification = addNotification;
window.showNotifications = showNotifications;

document.addEventListener("DOMContentLoaded", () => {
  initSession();
  const profileTrigger = document.getElementById('profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  // Toggle Dropdown
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    handleRouteChange();

    // Handle Logout Action
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add your logout logic here (e.g., clearing tokens)
            window.location.href = 'login.html'; 
        });
    }
});