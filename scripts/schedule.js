// ============================
// Schedule Page Logic
// ============================

let appointments = [];

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

// Initialize schedule page - called by router
async function initSchedulePage() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  await loadAppointments();

  const calendar = new FullCalendar.Calendar(calendarEl, {
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
    events: appointments,
    
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
      
      // Only show type for booked, completed, and cancelled (user already made selection)
      if (type && ['booked', 'completed', 'cancelled'].includes(availability)) {
        html += `<div style="font-size: 12px; color: #6b7280;">${type}</div>`;
      }
      
      // Show waitlist count if applicable
      if (waitlist) {
        html += `<div style="font-size: 11px; color: #92400e; margin-top: 4px; font-weight: 500;">${waitlist} on waitlist</div>`;
      }
      
      container.innerHTML = html;
      return { domNodes: [container] };
    },
    
    eventClick: function(info) {
      alert('Appointment: ' + info.event.title + '\nType: ' + info.event.extendedProps.type);
      // TODO: Open appointment details modal
    }
  });

  calendar.render();
  
  // Force resize after render to fix initial display issue
  setTimeout(() => {
    calendar.updateSize();
  }, 100);
  
  // Store calendar instance globally for filter interactions
  window.scheduleCalendar = calendar;
}
