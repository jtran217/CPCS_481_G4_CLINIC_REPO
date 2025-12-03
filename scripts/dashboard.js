// ============================
// Dashboard Appointments Logic
// ============================
let appointments = [];

// Load appointments from localStorage
function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const overrides = raw ? JSON.parse(raw) : {};
    
    // Get base schedule to merge with overrides
    if (typeof BASE_SLOTS === 'undefined') {
      console.error('BASE_SLOTS is not defined!');
      return [];
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const appointmentList = [];
    
    // Iterate through base slots and check for bookings
    BASE_SLOTS.forEach((slot) => {
      const override = overrides[slot.id];
      
      // Only include booked appointments that are in the future
      if (override && override.status === 'booked' && override.booking) {
        const appointmentDate = new Date(slot.start);
        appointmentDate.setHours(0, 0, 0, 0);
        
        if (appointmentDate >= now) {
          appointmentList.push({
            slotId: slot.id,
            start: slot.start,
            end: slot.end,
            doctor: override.booking.doctor || slot.title,
            type: override.booking.type || 'Unknown',
            date: override.booking.date,
            timeSlot: override.booking.timeSlot,
            location: override.booking.location || slot.extendedProps.location,
            bookingId: override.bookingId
          });
        }
      }
    });
    
    // Sort by date (earliest first)
    appointmentList.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    appointments = appointmentList;
    return appointments;
  } catch (error) {
    console.error('Error loading appointments:', error);
    appointments = [];
    return [];
  }
}

// Format appointment type for display
function formatAppointmentType(type) {
  const typeMap = {
    'consultation': 'General Consultation',
    'lab-test': 'Lab Test',
    'follow-up': 'Follow-Up'
  };
  return typeMap[type] || type;
}

// Render appointments (similar to renderNotifications) - make globally accessible
window.renderAppointments = function renderAppointments() {
  const container = document.getElementById('appt-container');
  if (!container) {
    // Container not ready yet, try again shortly
    setTimeout(window.renderAppointments, 100);
    return;
  }
  
  loadAppointments();
  
  if (appointments.length === 0) {
    // Show empty state
    container.innerHTML = '';
    container.classList.add('empty');
    container.innerHTML = `
      <div class="appt-icon"></div>
      <p class="appt-message">No appointments scheduled</p>
      <div class="appt-prompt">
        <p>Schedule your first appointment to get started!</p>
        <div class="button-container">
          <button class="primary-btn" onclick="window.location.hash='schedule'">
            Schedule Appointment
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // Remove empty class if it exists
  container.classList.remove('empty');
  
  // Clear container only when we have appointments to render
  container.innerHTML = '';
  
  // Render each appointment
  // createAppointmentCardElement will append skeleton immediately, then replace with real card
  appointments.forEach((appointment) => {
    createAppointmentCardElement(appointment);
  });
}

// Create appointment card element (similar to createNotificationElement)
function createAppointmentCardElement(appointment) {
  const container = document.getElementById("appt-container");
  if (!container) return;

  // Create temporary placeholder FIRST
  const skeleton = document.createElement("div");
  skeleton.className = "appointment-card loading";
  skeleton.innerHTML = `<div class="loading-line">Loading...</div>`;
  container.appendChild(skeleton);

  // Now fetch the real template
  fetch("components/appointment-card.html")
    .then(r => r.text())
    .then(html => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      const card = wrapper.querySelector(".appointment-card");
      if (!card) {
        console.error("❌ appointment-card not found in template!");
        return;
      }

      // Populate fields
      card.querySelector(".appointment-doctor").textContent = appointment.doctor;
      card.querySelector(".appointment-type").textContent = formatAppointmentType(appointment.type);
      card.querySelector(".datetime-text").textContent = `${appointment.date} at ${appointment.timeSlot}`;

      // Check if appointment is in the past
      const appointmentDateTime = new Date(appointment.start);
      const now = new Date();
      const isPast = appointmentDateTime < now;

      // Get buttons
      const rescheduleBtn = card.querySelector(".btn-reschedule");
      const cancelBtn = card.querySelector(".btn-cancel");

      // Update button classes to match modal
      if (rescheduleBtn) {
        rescheduleBtn.className = "btn btn-primary";
        rescheduleBtn.onclick = () => handleReschedule(appointment);
      }

      if (cancelBtn) {
        if (isPast) {
          // Change to "Mark as Complete" button
          cancelBtn.innerHTML = '<img src="icons/check-circle.svg" alt="" width="16" height="16" style="margin-right: 8px;"> Mark as Complete';
          cancelBtn.className = "btn btn-secondary";
          cancelBtn.onclick = () => handleMarkAsComplete(appointment);
        } else {
          // Keep as "Cancel Appointment" button
          cancelBtn.textContent = "Cancel";
          cancelBtn.className = "btn btn-warning";
          cancelBtn.onclick = () => handleCancel(appointment);
        }
      }

      // Replace skeleton with real card
      container.replaceChild(card, skeleton);
    })
    .catch((err) => {
      console.error("Error loading appointment card:", err);
      skeleton.innerHTML = "<div class='error'>Failed to load card.</div>";
    });
}

// Handle reschedule button click
function handleReschedule(appointment) {
  // Store appointment data in sessionStorage for schedule page to pick up
  sessionStorage.setItem('dashboardReschedule', JSON.stringify({
    slotId: appointment.slotId,
    action: 'reschedule'
  }));
  
  // Navigate to schedule page
  window.location.hash = 'schedule';
}

// Handle cancel button click
function handleCancel(appointment) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }

  const slotId = appointment.slotId;
  if (!slotId) return;

  // Load overrides from schedule.js functions (they're global)
  if (typeof loadOverrides === 'function' && typeof saveOverrides === 'function') {
    const overrides = loadOverrides();
    
    // Delete override → slot reverts to baseStatus
    delete overrides[slotId];
    
    saveOverrides(overrides);
    
    // Update calendar if it exists
    if (typeof updateCalendar === 'function') {
      updateCalendar();
    }
    
    // Show toast if available
    if (typeof showToast === 'function') {
      showToast('success', 'Appointment Cancelled', 'Your appointment has been cancelled and the time slot is now available.');
    }
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('appointmentsUpdated'));
  } else {
    // Fallback: navigate to schedule page
    sessionStorage.setItem('dashboardCancel', JSON.stringify({
      slotId: appointment.slotId,
      action: 'cancel'
    }));
    window.location.hash = 'schedule';
  }
}

// Handle mark as complete button click
function handleMarkAsComplete(appointment) {
  const slotId = appointment.slotId;
  if (!slotId) return;

  // Load overrides from schedule.js functions (they're global)
  if (typeof loadOverrides === 'function' && typeof saveOverrides === 'function') {
    const overrides = loadOverrides();
    const override = overrides[slotId];
    
    if (override) {
      // Update status to completed
      override.status = 'completed';
      
      saveOverrides(overrides);
      
      // Update calendar if it exists
      if (typeof updateCalendar === 'function') {
        updateCalendar();
      }
      
      // Show toast if available
      if (typeof showToast === 'function') {
        showToast('success', 'Appointment Completed', 'This appointment has been marked as completed.');
      }
      
      // Trigger dashboard update
      window.dispatchEvent(new Event('appointmentsUpdated'));
    }
  } else {
    // Fallback: navigate to schedule page and let it handle it
    sessionStorage.setItem('dashboardMarkComplete', JSON.stringify({
      slotId: appointment.slotId,
      action: 'markComplete'
    }));
    window.location.hash = 'schedule';
  }
}

// Initialize dashboard appointments
window.initDashboardAppointments = function initDashboardAppointments() {
  window.renderAppointments();
  
  // Listen for updates from schedule page
  window.addEventListener('appointmentsUpdated', () => {
    window.renderAppointments();
  });
};

