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
      openBookingModal(info.event);
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
// Booking Modal Functions
// ============================

let currentStep = 1;
let bookingData = {};
let validationRules = {};

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

function openBookingModal(event) {
  const modal = document.getElementById('booking-modal');
  if (!modal) {
    console.warn('Modal not loaded yet');
    return;
  }

  // Reset to step 1
  currentStep = 1;
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
  if (dateEl) dateEl.textContent = dateStr;

  // Store appointment data for summary
  bookingData.appointmentDate = dateStr;
  bookingData.location = event.extendedProps.location || 'Unknown';

  // Prefill form fields
  // Appointment type
  const typeSelect = document.getElementById('appointment-type');
  if (typeSelect && event.extendedProps.type) {
    typeSelect.value = event.extendedProps.type;
  }

  // Doctor
  const doctorSelect = document.getElementById('appointment-doctor');
  if (doctorSelect && event.title) {
    doctorSelect.value = event.title;
  }

  // Time slot
  const timeSlotEl = document.getElementById('selected-time-slot');
  if (timeSlotEl) {
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
    timeSlotEl.textContent = `${startTime} - ${endTime}`;
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
    fieldsToValidate = ['appointment-type', 'appointment-doctor'];
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

  // Clear errors for step 1 fields
  fieldsToValidate.forEach(fieldId => clearFieldError(fieldId));

  // Validate each field
  fieldsToValidate.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const value = field ? field.value : '';
    const result = validateField(fieldId, value);

    if (!result.isValid) {
      showFieldError(fieldId, result.message);
      isValid = false;
    }
  });

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
    const timeSlot = document.getElementById('selected-time-slot');
    const notes = document.getElementById('appointment-notes');

    bookingData.appointmentType = appointmentType ? appointmentType.value : '';
    bookingData.doctor = doctor ? doctor.value : '';
    bookingData.timeSlot = timeSlot ? timeSlot.textContent : '';
    
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

  // Appointment Summary
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  summaryDate.textContent = bookingData.appointmentDate;
  summaryTime.textContent = bookingData.timeSlot;

  const summaryDoctor = document.getElementById('summary-doctor');
  summaryDoctor.textContent = bookingData.doctor;

  const summaryType = document.getElementById('summary-type');
  summaryType.textContent = bookingData.appointmentType;

  const summaryLocation = document.getElementById('summary-location');
  summaryLocation.textContent = bookingData.location;
}

function confirmBooking() {
  console.log('Final booking data:', bookingData);
  alert('Appointment confirmed!\n\nBooking data logged to console.');
  closeBookingModal();
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeBookingModal();
  }
});
