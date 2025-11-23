// ============================
// Schedule Page Logic
// ============================

let appointments = [];
let calendar = null;

// Availability color mapping
const availabilityColors = {
  available: {
    backgroundColor: 'var(--color-success-soft)',
    borderColor: 'var(--color-success-500)',
    textColor: '#000'
  },
  booked: {
    backgroundColor: 'var(--color-info-soft)',
    borderColor: 'var(--color-info-500)',
    textColor: '#000'
  },
  waitlist: {
    backgroundColor: 'var(--color-warning-soft)',
    borderColor: 'var(--color-warning-500)',
    textColor: '#000'
  },
  cancelled: {
    backgroundColor: 'var(--color-error-soft)',
    borderColor: 'var(--color-error-500)',
    textColor: '#000'
  },
  completed: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    textColor: '#6b7280'
  }
};

// Load appointments from JSON
async function loadAppointments() {
  try {
    const response = await fetch('data/appointments.json');
    const data = await response.json();
    appointments = data.appointments;
  } catch (error) {
    console.error('Error loading appointments:', error);
    appointments = [];
  }
}

// Get current filter state
function getActiveFilters() {
  const filters = {
    doctor: document.getElementById('doctor-filter')?.value || 'all',
    location: document.getElementById('location-filter')?.value || 'all',
    types: [],
    availability: []
  };

  // Get checked appointment types
  document.querySelectorAll('#type-filters input[type="checkbox"]:checked').forEach(checkbox => {
    filters.types.push(checkbox.dataset.type);
  });

  // Get checked availability statuses
  document.querySelectorAll('#availability-filters input[type="checkbox"]:checked').forEach(checkbox => {
    filters.availability.push(checkbox.dataset.availability);
  });

  return filters;
}

// Filter appointments based on current filter state
function getFilteredAppointments() {
  const filters = getActiveFilters();

  return appointments.filter(appointment => {
    const props = appointment.extendedProps;

    // Filter by doctor (only if not "all")
    if (filters.doctor !== 'all' && props.doctor !== filters.doctor) {
      return false;
    }

    // Filter by location (only if not "all")
    if (filters.location !== 'all' && props.location !== filters.location) {
      return false;
    }

    // Filter by type (only if some types are checked)
    // If no types checked, show all types
    if (filters.types.length > 0 && !filters.types.includes(props.type)) {
      return false;
    }

    // Filter by availability (only if some availability checked)
    // If no availability checked, show all availability
    if (filters.availability.length > 0 && !filters.availability.includes(props.availability)) {
      return false;
    }

    return true;
  });
}

// Update calendar with filtered appointments
function updateCalendar() {
  if (!calendar) return;

  const filteredAppointments = getFilteredAppointments();
  
  // Remove all events
  calendar.removeAllEvents();
  
  // Add filtered events
  calendar.addEventSource(filteredAppointments);
}

// Setup filter event listeners
function setupFilters() {
  // Doctor filter
  const doctorFilter = document.getElementById('doctor-filter');
  if (doctorFilter) {
    doctorFilter.addEventListener('change', updateCalendar);
  }

  // Location filter
  const locationFilter = document.getElementById('location-filter');
  if (locationFilter) {
    locationFilter.addEventListener('change', updateCalendar);
  }

  // Type checkboxes
  document.querySelectorAll('#type-filters input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateCalendar);
  });

  // Availability checkboxes
  document.querySelectorAll('#availability-filters input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateCalendar);
  });

  // Reset filters button
  const resetBtn = document.querySelector('.reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset dropdown filters
      if (doctorFilter) doctorFilter.value = 'all';
      if (locationFilter) locationFilter.value = 'all';

      // Uncheck all checkboxes
      document.querySelectorAll('#type-filters input[type="checkbox"], #availability-filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });

      // Update calendar
      updateCalendar();
    });
  }
}

// Initialize schedule page - called by router
async function initSchedulePage() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  await loadAppointments();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '17:30:00',
    allDaySlot: false,
    height: 'auto',
    expandRows: true,
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    events: appointments, // Start with ALL appointments visible
    
    // Custom event rendering
    eventContent: function(arg) {
      const { event } = arg;
      const { type, availability, waitlist } = event.extendedProps;
      
      const colors = availabilityColors[availability];
      
      const container = document.createElement('div');
      container.className = 'fc-event-custom';
      container.style.backgroundColor = colors.backgroundColor;
      container.style.borderColor = colors.borderColor;
      container.style.borderLeftWidth = '3px';
      container.style.borderLeftStyle = 'solid';
      container.style.color = colors.textColor;
      container.style.padding = '6px 8px';
      container.style.fontSize = '13px';
      container.style.height = '100%';
      container.style.boxSizing = 'border-box';
      
      // Show doctor name
      let html = `<div style="font-weight: 600; margin-bottom: 2px;">${event.title}</div>`;
      
      // Format type for display
      const typeDisplay = {
        'consultation': 'Consultation',
        'lab-test': 'Lab Test',
        'follow-up': 'Follow-Up'
      };
      
      // Only show type for booked, completed, and cancelled
      if (type && ['booked', 'completed', 'cancelled'].includes(availability)) {
        html += `<div style="font-size: 12px; color: #6b7280;">${typeDisplay[type] || type}</div>`;
      }
      
      // Show waitlist count if applicable
      if (waitlist) {
        html += `<div style="font-size: 11px; color: #92400e; margin-top: 4px; font-weight: 500;">${waitlist} on waitlist</div>`;
      }
      
      container.innerHTML = html;
      return { domNodes: [container] };
    },
    
    eventClick: function(info) {
      const typeDisplay = {
        'consultation': 'Consultation',
        'lab-test': 'Lab Test',
        'follow-up': 'Follow-Up'
      };
      const type = typeDisplay[info.event.extendedProps.type] || info.event.extendedProps.type;
      alert('Appointment: ' + info.event.title + '\nType: ' + type);
      // TODO: Open appointment details modal
    }
  });

  calendar.render();
  
  // Force resize after render to fix initial display issue
  setTimeout(() => {
    calendar.updateSize();
  }, 100);
  
  // Setup filter event listeners
  setupFilters();
  
  // Store calendar instance globally
  window.scheduleCalendar = calendar;
}
