// Load page header component and set title/subtitle
loadComponent('page-header-container', 'components/page-header.html', (container) => {
  container.querySelector('[data-title]').textContent = 'Appointment Schedule';
  container.querySelector('[data-subtitle]').textContent = 'Select a time slot to book or view appointment details.';
});

