// Load page header component and set title/subtitle
loadComponent('page-header-container', 'components/page-header.html', (container) => {
  container.querySelector('[data-title]').textContent = 'Appointment Schedule';
  container.querySelector('[data-subtitle]').textContent = 'Select a time slot to book or view appointment details.';
});

// Sample appointment data
const sampleAppointments = [
  { day: 0, time: '08:00', doctor: 'Dr. Lee', type: 'Consultation', availability: 'completed' },
  { day: 0, time: '09:00', doctor: 'Dr. Lee', type: 'Consultation', availability: 'available' },
  { day: 0, time: '10:30', doctor: 'Dr. Kaur', type: 'Follow-Up', availability: 'available' },
  { day: 1, time: '09:00', doctor: 'Dr. Smith', type: 'Lab Test', availability: 'completed' },
  { day: 2, time: '09:30', doctor: 'Dr. Lee', type: 'Follow-Up', availability: 'available' },
  { day: 2, time: '10:00', doctor: 'Dr. Lee', type: 'Follow-Up', availability: 'booked', status: 'Pending' },
  { day: 2, time: '11:00', doctor: 'Dr. Smith', type: 'Lab Test', availability: 'available' },
  { day: 3, time: '10:00', doctor: 'Dr. Smith', type: 'Lab Test', availability: 'waitlist', waitlist: 5 },
];

// Build calendar week view
function buildCalendarWeek() {
  const container = document.getElementById('calendar-container');
  if (!container) return;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = [30, 1, 2, 3, 4, 5, 6];
  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

  let html = '<div class="calendar-grid">';

  // Header row
  html += '<div class="calendar-header-row">';
  html += '<div class="time-header">Time</div>';
  days.forEach((day, i) => {
    html += `
      <div class="day-header">
        <span class="day-name">${day}</span>
        <span class="day-number">${dates[i]}</span>
      </div>
    `;
  });
  html += '</div>';

  // Time slots and cells
  timeSlots.forEach(time => {
    html += `<div class="time-slot">${time}</div>`;
    
    days.forEach((_, dayIndex) => {
      const appointment = sampleAppointments.find(apt => apt.day === dayIndex && apt.time === time);
      
      html += '<div class="calendar-cell">';
      if (appointment) {
        html += `
          <div class="appointment-slot" data-availability="${appointment.availability}">
            <div class="slot-doctor">${appointment.doctor}</div>
            <div class="slot-type">${appointment.type}</div>
            ${appointment.waitlist ? `<div class="slot-waitlist">${appointment.waitlist} on waitlist</div>` : ''}
          </div>
        `;
      }
      html += '</div>';
    });
  });

  html += '</div>';
  container.innerHTML = html;
}

// Initialize calendar when page loads
buildCalendarWeek();

