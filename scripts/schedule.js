// ============================
// Schedule Page Logic
// ============================

/**
 * DATA MODEL:
 * - BASE_SLOTS = Hardcoded base schedule (from baseSchedule.js)
 * - localStorage overrides = Runtime bookings/changes
 * 
 * FLOW:
 * 1. User books → Store override in localStorage with booking data
 * 2. User cancels → Remove override from localStorage (reverts to base)
 * 3. User reschedules → Update overrides (old slot reverts, new slot booked)
 */

let calendar = null;
const STORAGE_KEY = "bellhartBookings";

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
  completed: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    textColor: '#6b7280'
  }
};

// Load overrides from localStorage
function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error loading overrides:', error);
    return {};
  }
}

// Save overrides to localStorage
function saveOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving overrides:', error);
  }
}

// Merge base slots with runtime overrides
function getCurrentSchedule() {
  if (typeof BASE_SLOTS === 'undefined') {
    console.error('BASE_SLOTS is not defined! Make sure baseSchedule.js is loaded first.');
    return [];
  }
  
  const overrides = loadOverrides();
  
  return BASE_SLOTS.map((slot) => {
    const override = overrides[slot.id];
    
    if (!override) {
      // No override → use baseStatus
      return {
        ...slot,
        extendedProps: {
          ...slot.extendedProps,
          availability: slot.extendedProps.baseStatus
        }
      };
    }
    
    // Override exists → merge with base slot
    return {
      ...slot,
      extendedProps: {
        ...slot.extendedProps,
        availability: override.status,
        bookingId: override.bookingId,
        type: override.booking?.type || slot.extendedProps.type, // Use booking type for filtering
        ...override
      }
    };
  });
}

// Generate sequential booking ID (gapless)
function generateBookingId() {
  const overrides = loadOverrides();
  // Collect all used booking numbers
  const usedNumbers = new Set();
  Object.values(overrides).forEach((override) => {
    if (override.bookingId) {
      const match = override.bookingId.match(/booking-(\d+)/);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }
  });
  // Find the lowest unused positive integer
  let nextIdNum = 1;
  while (usedNumbers.has(nextIdNum)) {
    nextIdNum++;
  }
  return `booking-${String(nextIdNum).padStart(3, '0')}`;
}

// Developer tools - view data in console
window.viewBookings = function() {
  const overrides = loadOverrides();
  const bookings = Object.entries(overrides)
    .filter(([_, override]) => override.status === 'booked')
    .map(([slotId, override]) => ({
      slotId,
      ...override.booking
    }));
  console.table(bookings);
  return bookings;
};

window.viewOverrides = function() {
  const overrides = loadOverrides();
  console.log('All overrides:', overrides);
  return overrides;
};

window.clearBookings = function() {
  if (confirm('Clear all bookings?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
};


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
  
  // Get current schedule (base + overrides)
  const currentSchedule = getCurrentSchedule();

  return currentSchedule.filter(appointment => {
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

// Load tooltip component
async function loadTooltipComponent() {
  try {
    const response = await fetch('components/tooltip.html');
    const html = await response.text();
    const container = document.getElementById('tooltip-container');
    if (container) {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading tooltip component:', error);
  }
}

// Tooltip management
let tooltipElement = null;

function showTooltip(eventEl, eventData) {
  // Get or initialize tooltip element
  if (!tooltipElement) {
    tooltipElement = document.getElementById('tooltip');
  }
  
  if (!tooltipElement) return;

  // Get event details
  const { availability } = eventData.extendedProps;
  
  // Format time range
  const startTime = new Date(eventData.start).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  const endTime = new Date(eventData.end).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  // Create tooltip text based on availability status
  let statusText = '';
  switch(availability) {
    case 'available':
      statusText = 'Open';
      break;
    case 'booked':
      statusText = 'Booked';
      break;
    case 'waitlist':
      statusText = 'Waitlist';
      break;
    case 'completed':
      statusText = 'Completed';
      break;
    default:
      statusText = 'Slot';
  }

  // Set simple text content
  const tooltipContent = tooltipElement.querySelector('[data-tooltip-content]');
  if (tooltipContent) {
    tooltipContent.textContent = `${statusText}: ${startTime} - ${endTime}`;
  }

  // Temporarily show to measure
  tooltipElement.style.visibility = 'hidden';
  tooltipElement.style.opacity = '0';
  tooltipElement.classList.add('visible');
  
  // Position tooltip above the event element
  const rect = eventEl.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  
  // Center horizontally above the element
  const left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  const top = rect.top - tooltipRect.height - 8; // 8px gap above element

  tooltipElement.style.left = `${left}px`;
  tooltipElement.style.top = `${top}px`;

  // Now make it properly visible
  tooltipElement.style.visibility = '';
  tooltipElement.style.opacity = '';
}

function hideTooltip() {
  if (!tooltipElement) return;
  tooltipElement.classList.remove('visible');
}

// Initialize schedule page - called by router
async function initSchedulePage() {
  // Load tooltip component first
  await loadTooltipComponent();
  
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

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
    events: getCurrentSchedule(), // Load base schedule + overrides
    
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
      
      // Only show type for booked and completed
      if (type && ['booked', 'completed'].includes(availability)) {
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
      handleEventClick(info.event);
    },
    
    // Add hover events for tooltip
    eventDidMount: function(info) {
      const eventEl = info.el;
      const eventData = info.event;
      
      // Mouse enter - show tooltip
      eventEl.addEventListener('mouseenter', function() {
        showTooltip(eventEl, eventData);
      });
      
      // Mouse leave - hide tooltip
      eventEl.addEventListener('mouseleave', function() {
        hideTooltip();
      });
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

// ============================
// Event Click Handler
// ============================

function handleEventClick(event) {
  const availability = event.extendedProps.availability;

  if (isRescheduleMode) {
    // In reschedule mode: only allow clicking on available or waitlist slots
    if (availability === 'available' || availability === 'waitlist') {
      rescheduleNewSlot = event;
      openBookingModal(event, true); // true = reschedule mode
    } else {
      // Can't select this slot for rescheduling
      showToast('warning', 'Cannot Select', 'Please select an Available or Waitlist time slot.');
    }
  } else {
    // Normal mode: handle based on availability
    if (availability === 'booked' || availability === 'completed') {
      // Show appointment details modal (completed appointments are view-only)
      showAppointmentDetails(event);
    } else if (availability === 'available' || availability === 'waitlist') {
      // Open booking modal
      openBookingModal(event, false);
    } else {
      // Other non-bookable slots
      showToast('info', 'Slot Not Available', 'This time slot is not available for booking.');
    }
  }
}

// ============================
// Booking Modal Functions
// ============================

let currentStep = 1;
let bookingData = {};
let validationRules = {};
let selectedTimeSlot = null;
let currentAppointmentData = null;

// Reschedule mode state
let isRescheduleMode = false;
let originalAppointment = null;
let rescheduleNewSlot = null;

// Load validation rules from JSON
async function loadValidationRules() {
  try {
    const response = await fetch('data/validation-rules.json');
    const rules = await response.json();
    
    // Convert string patterns to RegExp objects
    Object.keys(rules).forEach(fieldId => {
      if (rules[fieldId].pattern) {
        rules[fieldId].pattern = new RegExp(rules[fieldId].pattern);
      }
    });
    
    validationRules = rules;
  } catch (error) {
    console.error('Error loading validation rules:', error);
  }
}

// Load validation rules on page load
loadValidationRules();

// Generate 30-minute time slots between start and end times
function generateTimeSlots(startTime, endTime, slotDuration = 30) {
  const slots = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  let current = new Date(start);
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + slotDuration * 60000);
    
    const startTimeStr = current.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const endTimeStr = slotEnd.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Store the time in 24-hour format for comparison with takenSlots
    const timeKey = current.toTimeString().substring(0, 5); // "HH:MM"
    
    slots.push({
      start: new Date(current),
      end: slotEnd,
      display: `${startTimeStr} - ${endTimeStr}`,
      timeKey: timeKey
    });
    
    current = slotEnd;
  }
  
  return slots;
}

// Render time slot selection for waitlist appointments
function renderWaitlistTimeSlots(event) {
  const container = document.getElementById('time-slot-container');
  if (!container) return;
  
  const { waitlistSlots } = event.extendedProps;
  const takenSlots = waitlistSlots?.takenSlots || [];
  
  // Generate time slots
  const slots = generateTimeSlots(event.start, event.end, waitlistSlots?.slotDuration || 30);
  
  // Clear container
  container.innerHTML = '';
  
  // Create grid container
  const gridDiv = document.createElement('div');
  gridDiv.className = 'time-slot-grid';
  
  // Create button for each slot
  slots.forEach((slot, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-slot-button';
    button.textContent = slot.display;
    button.dataset.slotIndex = index;
    button.dataset.timeKey = slot.timeKey;
    
    // Disable if slot is taken
    if (takenSlots.includes(slot.timeKey)) {
      button.disabled = true;
      button.title = 'This slot is already taken';
    } else {
      button.addEventListener('click', () => selectTimeSlot(slot, button));
    }
    
    gridDiv.appendChild(button);
  });
  
  container.appendChild(gridDiv);
}

// Handle time slot selection
function selectTimeSlot(slot, buttonElement) {
  // Remove selection from all buttons
  document.querySelectorAll('.time-slot-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Mark this button as selected
  buttonElement.classList.add('selected');
  
  // Store selected slot
  selectedTimeSlot = slot;
  
  // Clear any error
  clearFieldError('time-slot');
}

function openBookingModal(event, isReschedule = false) {
  const modal = document.getElementById('booking-modal');
  if (!modal) {
    console.warn('Modal not loaded yet');
    return;
  }

  // Set max date for DOB (must be 18+ years old)
  const dobInput = document.getElementById('patient-dob');
  if (dobInput) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    dobInput.max = maxDate.toISOString().split('T')[0];
  }

  // Reset state
  currentStep = 1;
  selectedTimeSlot = null;
  currentAppointmentData = event;
  updateStepUI();

  // Set the date in the header
  const date = new Date(event.start);
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const dateEl = document.getElementById('appointment-date');
  const modalTitle = document.querySelector('#booking-modal .modal-title');
  
  if (isReschedule && originalAppointment) {
    // Update title for reschedule
    if (modalTitle) {
      modalTitle.innerHTML = `Reschedule Appointment - <span id="appointment-date">${dateStr}</span>`;
    }
  } else {
    // Regular booking title
    if (modalTitle) {
      modalTitle.innerHTML = `Book Appointment - <span id="appointment-date">${dateStr}</span>`;
    }
  }
  
  if (dateEl) dateEl.textContent = dateStr;

  // Store appointment data for summary
  bookingData.appointmentDate = dateStr;
  bookingData.location = event.extendedProps.location || 'Unknown';

  // Prefill form fields
  // Doctor (readonly field)
  const doctorInput = document.getElementById('appointment-doctor');
  if (doctorInput && event.title) {
    doctorInput.value = event.title;
  }

  // Reset appointment type selection
  const typeSelect = document.getElementById('appointment-type');
  if (typeSelect) {
    typeSelect.value = '';
  }

  // Handle time slot display
  const isWaitlist = event.extendedProps.availability === 'waitlist';
  
  if (isWaitlist && event.extendedProps.waitlistSlots) {
    // Render waitlist time slot selection
    renderWaitlistTimeSlots(event);
  } else {
    // Show single time slot for non-waitlist appointments
    const container = document.getElementById('time-slot-container');
    if (container) {
      const startTime = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      const endDate = new Date(event.end);
      const endTime = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      container.innerHTML = `<div class="time-slot-pill" id="selected-time-slot">${startTime} - ${endTime}</div>`;
      
      // Store the time slot for non-waitlist appointments
      selectedTimeSlot = {
        display: `${startTime} - ${endTime}`,
        start: date,
        end: new Date(event.end)
      };
    }
  }

  // Update confirm button text if in reschedule mode
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = isReschedule ? 'Confirm Reschedule' : 'Confirm';
  }

  // Show modal
  modal.style.display = 'flex';
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentStep = 1;
  bookingData = {}; // Reset booking data
  selectedTimeSlot = null;
  currentAppointmentData = null;
  
  // If closing during reschedule, ask if they want to cancel reschedule
  if (isRescheduleMode) {
    // Don't automatically cancel reschedule, user can still click other slots
    // rescheduleNewSlot is reset but reschedule mode stays active
    rescheduleNewSlot = null;
  }
}

function nextStep() {
  // Validate current step before proceeding
  if (!validateCurrentStep()) {
    return;
  }

  // Save current step data
  saveStepData();

  if (currentStep < 3) {
    currentStep++;
    updateStepUI();
  }
}

function validateField(fieldId, value) {
  const rules = validationRules[fieldId];
  if (!rules) return { isValid: true };

  // Required validation
  if (rules.required && (!value || !value.trim())) {
    return {
      isValid: false,
      message: rules.errorMessage
    };
  }

  // Skip other validations if field is empty and not required
  if (!value || !value.trim()) {
    return { isValid: true };
  }

  // Min length validation
  if (rules.minLength) {
    const cleanValue = value.replace(/[\s\-()]/g, ''); // Remove spaces, hyphens, parentheses for length check
    if (cleanValue.length < rules.minLength) {
      return {
        isValid: false,
        message: rules.lengthMessage || `Must be at least ${rules.minLength} characters`
      };
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.trim())) {
    return {
      isValid: false,
      message: rules.patternMessage || 'Invalid format'
    };
  }

  return { isValid: true };
}

function validateCurrentStep() {
  let isValid = true;
  let fieldsToValidate = [];

  if (currentStep === 1) {
    fieldsToValidate = ['appointment-type'];
    
    // Clear previous errors
    fieldsToValidate.forEach(fieldId => clearFieldError(fieldId));
    clearFieldError('time-slot');
    
    // Validate required fields
    fieldsToValidate.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const value = field ? field.value : '';
      const result = validateField(fieldId, value);

      if (!result.isValid) {
        showFieldError(fieldId, result.message);
        isValid = false;
      }
    });
    
    // Validate time slot selection for waitlist appointments
    if (currentAppointmentData && currentAppointmentData.extendedProps.availability === 'waitlist') {
      if (!selectedTimeSlot) {
        showFieldError('time-slot', 'Please select a time slot');
        isValid = false;
      }
    }
    
  } else if (currentStep === 2) {
    fieldsToValidate = [
      'patient-name',
      'patient-health-number',
      'patient-dob',
      'patient-sex'
    ];

    // Clear previous errors for all fields
    fieldsToValidate.forEach(fieldId => clearFieldError(fieldId));
    clearFieldError('patient-phone');
    clearFieldError('patient-email');
    clearFieldError('preferred-contact');

    // Validate required fields first
    fieldsToValidate.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const value = field ? field.value : '';
      const result = validateField(fieldId, value);

      if (!result.isValid) {
        showFieldError(fieldId, result.message);
        isValid = false;
      }
    });

    // Validate contact methods - at least one required
    const phone = document.getElementById('patient-phone');
    const email = document.getElementById('patient-email');
    const phoneValue = phone ? phone.value.trim() : '';
    const emailValue = email ? email.value.trim() : '';

    if (!phoneValue && !emailValue) {
      const errorMessage = validationRules['contact-required'].errorMessage;
      showFieldError('patient-phone', errorMessage);
      showFieldError('patient-email', errorMessage);
      isValid = false;
    } else {
      // Validate phone format if provided
      if (phoneValue) {
        const phoneResult = validateField('patient-phone', phoneValue);
        if (!phoneResult.isValid) {
          showFieldError('patient-phone', phoneResult.message);
          isValid = false;
        }
      }

      // Validate email format if provided
      if (emailValue) {
        const emailResult = validateField('patient-email', emailValue);
        if (!emailResult.isValid) {
          showFieldError('patient-email', emailResult.message);
          isValid = false;
        }
      }

      // Validate preferred contact checkbox - at least one must be selected
      const phonePreferred = document.getElementById('phone-preferred');
      const emailPreferred = document.getElementById('email-preferred');
      
      if (!phonePreferred.checked && !emailPreferred.checked) {
        showFieldError('preferred-contact', validationRules['preferred-contact'].errorMessage);
        isValid = false;
      }
    }

    return isValid;
  }

  return isValid;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  
  if (field) {
    field.classList.add('error');
  }
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  
  if (field) {
    field.classList.remove('error');
  }
  
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

function saveStepData() {
  if (currentStep === 1) {
    const appointmentType = document.getElementById('appointment-type');
    const doctor = document.getElementById('appointment-doctor');
    const notes = document.getElementById('appointment-notes');

    bookingData.appointmentType = appointmentType ? appointmentType.value : '';
    bookingData.doctor = doctor ? doctor.value : '';
    
    // Save selected time slot
    if (selectedTimeSlot) {
      bookingData.timeSlot = selectedTimeSlot.display;
    }
    
    // Only add notes to data if they're not empty
    if (notes && notes.value.trim()) {
      bookingData.notes = notes.value.trim();
    } else {
      // Remove notes from data if empty
      delete bookingData.notes;
    }
  }

  if (currentStep === 2) {
    const name = document.getElementById('patient-name');
    const healthNumber = document.getElementById('patient-health-number');
    const dob = document.getElementById('patient-dob');
    const sex = document.getElementById('patient-sex');
    const phone = document.getElementById('patient-phone');
    const email = document.getElementById('patient-email');
    const phonePreferred = document.getElementById('phone-preferred');
    const emailPreferred = document.getElementById('email-preferred');

    bookingData.patientName = name ? name.value.trim() : '';
    bookingData.healthNumber = healthNumber ? healthNumber.value.trim() : '';
    bookingData.dateOfBirth = dob ? dob.value : '';
    bookingData.sex = sex ? sex.value : '';
    
    // Only add contact info if provided
    if (phone && phone.value.trim()) {
      bookingData.phone = phone.value.trim();
    } else {
      delete bookingData.phone;
    }

    if (email && email.value.trim()) {
      bookingData.email = email.value.trim();
    } else {
      delete bookingData.email;
    }

    // Determine preferred contact
    const preferredMethods = [];
    if (phonePreferred && phonePreferred.checked) {
      preferredMethods.push('Phone');
    }
    if (emailPreferred && emailPreferred.checked) {
      preferredMethods.push('Email');
    }
    bookingData.preferredContact = preferredMethods.join(', ');
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepUI();
  }
}

function prefillPatientDetails() {
  // Pre-fill form fields with existing patient data
  const fields = {
    'patient-name': bookingData.patientName,
    'patient-health-number': bookingData.healthNumber,
    'patient-dob': bookingData.dateOfBirth,
    'patient-sex': bookingData.sex,
    'patient-phone': bookingData.phone,
    'patient-email': bookingData.email
  };

  Object.keys(fields).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && fields[fieldId]) {
      field.value = fields[fieldId];
    }
  });

  // Handle preferred contact (checkboxes)
  if (bookingData.preferredContact) {
    const preferredContacts = bookingData.preferredContact.split(', ');
    const phoneCheckbox = document.getElementById('phone-preferred');
    const emailCheckbox = document.getElementById('email-preferred');
    
    if (phoneCheckbox) phoneCheckbox.checked = preferredContacts.includes('Phone');
    if (emailCheckbox) emailCheckbox.checked = preferredContacts.includes('Email');
  }
}

function updateStepUI() {
  // Update step indicators
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach((item, index) => {
    if (index + 1 === currentStep) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update step content visibility
  const stepContents = document.querySelectorAll('.step-content');
  stepContents.forEach((content, index) => {
    if (index + 1 === currentStep) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // If moving to step 2 in reschedule mode, pre-fill patient details
  if (currentStep === 2 && isRescheduleMode && bookingData.patientName) {
    prefillPatientDetails();
  }

  // If moving to step 3, populate summary
  if (currentStep === 3) {
    updateSummary();
  }

  // Update buttons
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const confirmBtn = document.getElementById('confirm-btn');

  if (!backBtn || !nextBtn || !confirmBtn) return;

  // Show/hide back button
  if (currentStep === 1) {
    backBtn.style.display = 'none';
  } else {
    backBtn.style.display = 'inline-flex';
  }

  // Show Next or Confirm button
  if (currentStep === 3) {
    nextBtn.style.display = 'none';
    confirmBtn.style.display = 'inline-flex';
  } else {
    nextBtn.style.display = 'inline-flex';
    confirmBtn.style.display = 'none';
  }
}

function updateSummary() {
  // Patient Summary
  const summaryName = document.getElementById('summary-name');
  const summaryPhone = document.getElementById('summary-phone');
  const summaryEmail = document.getElementById('summary-email');
  const summaryPreferred = document.getElementById('summary-preferred');

  summaryName.textContent = bookingData.patientName;
  if (summaryPhone) summaryPhone.textContent = bookingData.phone || 'Not provided';
  if (summaryEmail) summaryEmail.textContent = bookingData.email || 'Not provided';
  summaryPreferred.textContent = bookingData.preferredContact;

  // Appointment Summary - Toggle between regular and reschedule modes
  const regularSummary = document.getElementById('regular-summary');
  const rescheduleSummary = document.getElementById('reschedule-summary');

  if (isRescheduleMode && originalAppointment && rescheduleNewSlot) {
    // Show reschedule boxes
    if (regularSummary) regularSummary.style.display = 'none';
    if (rescheduleSummary) rescheduleSummary.style.display = 'block';

    // Type display mapping
    const typeDisplay = {
      'consultation': 'General Consultation',
      'lab-test': 'Lab Test',
      'follow-up': 'Follow-Up'
    };

    // Populate OLD (Previous/Cancelled) Appointment
    const oldDate = new Date(originalAppointment.start);
    const oldDateStr = oldDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const oldStartTime = oldDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const oldEndDate = new Date(originalAppointment.end);
    const oldEndTime = oldEndDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    const oldSummaryDate = document.getElementById('old-summary-date');
    const oldSummaryTime = document.getElementById('old-summary-time');
    const oldSummaryDoctor = document.getElementById('old-summary-doctor');
    const oldSummaryType = document.getElementById('old-summary-type');
    const oldSummaryLocation = document.getElementById('old-summary-location');

    if (oldSummaryDate) oldSummaryDate.textContent = oldDateStr;
    if (oldSummaryTime) oldSummaryTime.textContent = `${oldStartTime} - ${oldEndTime}`;
    if (oldSummaryDoctor) oldSummaryDoctor.textContent = originalAppointment.title;
    if (oldSummaryType) oldSummaryType.textContent = typeDisplay[originalAppointment.extendedProps.type] || originalAppointment.extendedProps.type;
    if (oldSummaryLocation) oldSummaryLocation.textContent = originalAppointment.extendedProps.location;

    // Populate NEW Appointment
    const newSummaryDate = document.getElementById('new-summary-date');
    const newSummaryTime = document.getElementById('new-summary-time');
    const newSummaryDoctor = document.getElementById('new-summary-doctor');
    const newSummaryType = document.getElementById('new-summary-type');
    const newSummaryLocation = document.getElementById('new-summary-location');

    if (newSummaryDate) newSummaryDate.textContent = bookingData.appointmentDate;
    if (newSummaryTime) newSummaryTime.textContent = bookingData.timeSlot;
    if (newSummaryDoctor) newSummaryDoctor.textContent = bookingData.doctor;
    if (newSummaryType) newSummaryType.textContent = typeDisplay[bookingData.appointmentType] || bookingData.appointmentType;
    if (newSummaryLocation) newSummaryLocation.textContent = bookingData.location;

  } else {
    // Show regular summary
    if (regularSummary) regularSummary.style.display = 'block';
    if (rescheduleSummary) rescheduleSummary.style.display = 'none';

    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    summaryDate.textContent = bookingData.appointmentDate;
    summaryTime.textContent = bookingData.timeSlot;

    const summaryDoctor = document.getElementById('summary-doctor');
    summaryDoctor.textContent = bookingData.doctor;

    const summaryType = document.getElementById('summary-type');
    const typeDisplay = {
      'consultation': 'General Consultation',
      'lab-test': 'Lab Test',
      'follow-up': 'Follow-Up'
    };
    summaryType.textContent = typeDisplay[bookingData.appointmentType] || bookingData.appointmentType;

    const summaryLocation = document.getElementById('summary-location');
    summaryLocation.textContent = bookingData.location;
  }
}

function confirmBooking() {
  if (isRescheduleMode && originalAppointment) {
    handleRescheduleConfirmation();
  } else {
    const bookingId = generateBookingId();
    const slotId = currentAppointmentData.id;
    
    const overrides = loadOverrides();
    overrides[slotId] = {
      status: 'booked',
      bookingId: bookingId,
      booking: {
        bookingId: bookingId,
        doctor: bookingData.doctor,
        date: bookingData.appointmentDate,
        timeSlot: bookingData.timeSlot,
        type: bookingData.appointmentType,
        location: bookingData.location,
        notes: bookingData.notes || null,
        patient: {
          name: bookingData.patientName,
          healthNumber: bookingData.healthNumber,
          dateOfBirth: bookingData.dateOfBirth,
          sex: bookingData.sex,
          phone: bookingData.phone || null,
          email: bookingData.email || null,
          preferredContact: bookingData.preferredContact
        }
      }
    };
    
    saveOverrides(overrides);
    updateCalendar();
    
    showToast('success', 'Appointment Confirmed', 
      `Your appointment has been booked for ${bookingData.appointmentDate}, ${bookingData.timeSlot}.`);
    closeBookingModal();
  }
}


// ============================
// Appointment Details Modal Functions
// ============================

function showAppointmentDetails(event) {
  const modal = document.getElementById('appointment-details-modal');
  if (!modal) {
    console.warn('Appointment details modal not loaded yet');
    return;
  }

  // Store appointment for later use
  originalAppointment = event;

  // Get booking data from override if this is a booked appointment
  const overrides = loadOverrides();
  const override = event.id ? overrides[event.id] : null;
  const booking = override?.booking;

  // Populate modal with appointment details
  const doctorEl = document.getElementById('details-doctor');
  const datetimeEl = document.getElementById('details-datetime');
  const typeEl = document.getElementById('details-type');
  const locationEl = document.getElementById('details-location');

  // If we have booking data, use it; otherwise use event data
  let dateStr, timeStr;
  
  if (booking) {
    dateStr = booking.date;
    timeStr = booking.timeSlot;
  } else {
    const date = new Date(event.start);
    dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const startTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const endDate = new Date(event.end);
    const endTime = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    timeStr = `${startTime} - ${endTime}`;
  }

  const typeDisplay = {
    'consultation': 'General Consultation',
    'lab-test': 'Lab Test',
    'follow-up': 'Follow-Up'
  };

  const doctor = booking ? booking.doctor : (event.title || 'Unknown');
  const type = booking ? booking.type : (event.extendedProps.type || 'Unknown');
  const location = booking ? booking.location : (event.extendedProps.location || 'Unknown');

  if (doctorEl) doctorEl.textContent = doctor;
  if (datetimeEl) datetimeEl.textContent = `${dateStr}, ${timeStr}`;
  if (typeEl) typeEl.textContent = typeDisplay[type] || type;
  if (locationEl) locationEl.textContent = location;

  // Check if appointment is in the past
  const appointmentDateTime = new Date(event.start);
  const now = new Date();
  const isPast = appointmentDateTime < now;

  // Handle action buttons based on appointment status
  const actionsContainer = modal.querySelector('.appointment-details-actions');
  
  if (actionsContainer) {
    if (event.extendedProps.availability === 'completed') {
      // Hide all buttons for completed appointments
      actionsContainer.style.display = 'none';
    } else {
      actionsContainer.style.display = 'flex';
      
      // Always get fresh button reference
      const cancelBtn = actionsContainer.querySelector('button:first-child');
      
      if (cancelBtn) {
        // Reset button completely
        cancelBtn.onclick = null;
        
        if (isPast) {
          // Change to "Mark as Complete" button
          cancelBtn.innerHTML = '<img src="icons/check-circle.svg" alt="" width="16" height="16" style="margin-right: 8px;"> Mark as Complete';
          cancelBtn.className = 'btn btn-secondary'; // Neutral styling
          cancelBtn.onclick = function() { markAsComplete(); };
        } else {
          // Keep as "Cancel Appointment" button
          cancelBtn.textContent = 'Cancel Appointment';
          cancelBtn.className = 'btn btn-warning';
          cancelBtn.onclick = function() { cancelAppointment(); };
        }
      }
    }
  }

  // Show modal
  modal.style.display = 'flex';
}

function closeAppointmentDetailsModal() {
  const modal = document.getElementById('appointment-details-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function cancelAppointment() {
  if (!originalAppointment) return;

  const slotId = originalAppointment.id;
  if (!slotId) return;

  if (confirm('Are you sure you want to cancel this appointment?')) {
    const overrides = loadOverrides();
    
    // Delete override → slot reverts to baseStatus
    delete overrides[slotId];
    
    saveOverrides(overrides);
    updateCalendar();
    
    showToast('success', 'Appointment Cancelled', 'Your appointment has been cancelled and the time slot is now available.');
    closeAppointmentDetailsModal();
  }
}

function markAsComplete() {
  if (!originalAppointment) return;

  const slotId = originalAppointment.id;
  if (!slotId) return;

  const overrides = loadOverrides();
  const override = overrides[slotId];
  
  if (override) {
    // Update status to completed
    override.status = 'completed';
    
    saveOverrides(overrides);
    updateCalendar();
    
    showToast('success', 'Appointment Completed', 'This appointment has been marked as completed.');
    closeAppointmentDetailsModal();
  }
}


// ============================
// Reschedule Functions
// ============================

function startReschedule() {
  if (!originalAppointment) return;

  // Get booking data from override to pre-populate patient details
  const overrides = loadOverrides();
  const override = originalAppointment.id ? overrides[originalAppointment.id] : null;
  const booking = override?.booking;
  
  if (booking && booking.patient) {
    // Pre-populate booking data with existing patient info
    bookingData = {
      patientName: booking.patient.name,
      healthNumber: booking.patient.healthNumber,
      dateOfBirth: booking.patient.dateOfBirth,
      sex: booking.patient.sex,
      phone: booking.patient.phone || '',
      email: booking.patient.email || '',
      preferredContact: booking.patient.preferredContact
    };
  }

  // Close appointment details modal
  closeAppointmentDetailsModal();

  // Enter reschedule mode
  isRescheduleMode = true;

  // Load and show reschedule banner
  loadRescheduleBanner();

  // Highlight the current appointment on the calendar
  highlightCurrentAppointment();

  // Update calendar to only allow clicking on available/waitlist slots
  updateCalendarForReschedule();
}

function loadRescheduleBanner() {
  fetch('components/reschedule-banner.html')
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('reschedule-banner-container');
      if (container) {
        container.innerHTML = html;
        const banner = document.getElementById('reschedule-banner');
        if (banner) {
          banner.style.display = 'block';
          
          // Update doctor name in banner
          const doctorNameEl = document.getElementById('reschedule-doctor-name');
          if (doctorNameEl && originalAppointment) {
            doctorNameEl.textContent = originalAppointment.title || 'Doctor';
          }
        }
      }
    });
}

function highlightCurrentAppointment() {
  if (!calendar || !originalAppointment) return;

  // Add class to highlight the current appointment
  setTimeout(() => {
    const eventEl = calendar.getEventById(originalAppointment.id)?.el;
    if (eventEl) {
      eventEl.classList.add('fc-event-reschedule-current');
    }
  }, 100);
}

function updateCalendarForReschedule() {
  if (!calendar) return;

  // Force re-render of events to apply reschedule styling
  calendar.render();
}

function cancelReschedule() {
  // Exit reschedule mode
  isRescheduleMode = false;
  originalAppointment = null;
  rescheduleNewSlot = null;

  // Hide banner
  const banner = document.getElementById('reschedule-banner');
  if (banner) {
    banner.style.display = 'none';
  }

  // Remove highlight from current appointment
  const highlightedEvents = document.querySelectorAll('.fc-event-reschedule-current');
  highlightedEvents.forEach(el => el.classList.remove('fc-event-reschedule-current'));

  // Re-render calendar
  if (calendar) {
    calendar.render();
  }
}

function handleRescheduleConfirmation() {
  if (!originalAppointment || !rescheduleNewSlot) return;

  const oldSlotId = originalAppointment.id;
  const newSlotId = rescheduleNewSlot.id;
  
  if (!oldSlotId || !newSlotId) return;

  const overrides = loadOverrides();
  const oldOverride = overrides[oldSlotId];
  const bookingId = oldOverride?.bookingId || generateBookingId();
  
  // Delete old slot override → reverts to baseStatus
  delete overrides[oldSlotId];
  
  // Create new slot override with booking data
  overrides[newSlotId] = {
    status: 'booked',
    bookingId: bookingId,
    booking: {
      bookingId: bookingId,
      doctor: bookingData.doctor,
      date: bookingData.appointmentDate,
      timeSlot: bookingData.timeSlot,
      type: bookingData.appointmentType,
      location: bookingData.location,
      notes: bookingData.notes || null,
      patient: {
        name: bookingData.patientName,
        healthNumber: bookingData.healthNumber,
        dateOfBirth: bookingData.dateOfBirth,
        sex: bookingData.sex,
        phone: bookingData.phone || null,
        email: bookingData.email || null,
        preferredContact: bookingData.preferredContact
      }
    }
  };
  
  saveOverrides(overrides);

  const newDate = new Date(rescheduleNewSlot.start);
  const dateStr = newDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const startTime = newDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  const endDate = new Date(rescheduleNewSlot.end);
  const endTime = endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  updateCalendar();

  showToast('success', 'Appointment Rescheduled', 
    `Your appointment has been rescheduled to ${dateStr}, ${startTime} - ${endTime}.`);

  closeBookingModal();
  cancelReschedule();
}

// ============================
// Toast Notification Functions
// ============================

function showToast(type, title, message, duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: `<img src="icons/check-circle.svg" alt="" width="24" height="24">`,
    error: `<img src="icons/x-circle.svg" alt="" width="24" height="24">`,
    warning: `<img src="icons/exclamation-circle.svg" alt="" width="24" height="24">`,
    info: `<img src="icons/information-circle.svg" alt="" width="24" height="24">`
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <img src="icons/x-mark.svg" alt="" width="20" height="20">
    </button>
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeBookingModal();
    closeAppointmentDetailsModal();
  }
});
