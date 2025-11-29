// ============================
// Records Pages Tooltip Logic
// ============================

// Load tooltip component for records pages
async function loadRecordsTooltip() {
    try {
      const response = await fetch('components/tooltip.html');
      const html = await response.text();
      const container = document.getElementById('tooltip-container');
      if (container) container.innerHTML = html;
    } catch (error) {
      console.error('Error loading records tooltip:', error);
    }
  }
  
  // SEPARATE tooltip element (DO NOT CONFLICT WITH SCHEDULE)
  let recordsTooltipElement = null;
  
  // Show tooltip on hover
  function showRecordsTooltip(targetEl, tooltipText) {
    // Ensure the tooltip exists
    if (!recordsTooltipElement) {
      recordsTooltipElement = document.getElementById('tooltip');
    }
    if (!recordsTooltipElement) return;
  
    // Insert tooltip text
    const tooltipContent = recordsTooltipElement.querySelector('[data-tooltip-content]');
    if (tooltipContent) {
      tooltipContent.textContent = tooltipText;
    }
  
    // Reset + make visible for measurement
    recordsTooltipElement.style.left = '-9999px';
    recordsTooltipElement.style.top = '-9999px';
    recordsTooltipElement.classList.add('visible');
    void recordsTooltipElement.offsetWidth;
  
    // Position above parent element
    const rect = targetEl.getBoundingClientRect();
    const tooltipRect = recordsTooltipElement.getBoundingClientRect();
  
    const left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    const top = rect.top - tooltipRect.height - 8;
  
    recordsTooltipElement.style.left = `${left}px`;
    recordsTooltipElement.style.top = `${top}px`;
  }
  
  // Hide tooltip
  function hideRecordsTooltip() {
    if (!recordsTooltipElement) return;
    recordsTooltipElement.classList.remove('visible');
  }
  
  // Initialize records tooltips
  async function initRecordsPage() {
    // Load HTML
    await loadRecordsTooltip();
  
    // Wait for DOM render
    await new Promise(r => setTimeout(r, 50));
  
    recordsTooltipElement = document.getElementById('tooltip');
  
    if (!recordsTooltipElement) {
      console.error('Records tooltip element missing');
      return;
    }
  
    setupRecordsTooltips();
  }
  
  // Attach listeners to tooltip-parent elements
  function setupRecordsTooltips() {
    const tooltipParents = document.querySelectorAll('.tooltip-parent');
  
    console.log(`Records: found ${tooltipParents.length} tooltip-parent elements`);
  
    tooltipParents.forEach(parentEl => {
      // Avoid double-initializing
      if (parentEl.dataset.tooltipInitialized === 'true') return;
  
      // Read tooltip text
      let tooltipText = parentEl.getAttribute('data-tooltip');
  
      // Fallback: inline tooltip
      if (!tooltipText) {
        const inlineTooltip = parentEl.querySelector('.tooltip');
        if (inlineTooltip) {
          tooltipText = inlineTooltip.textContent.trim();
          inlineTooltip.remove();
        }
      }
  
      if (!tooltipText) return;
  
      parentEl.dataset.tooltipInitialized = 'true';
  
      parentEl.addEventListener('mouseenter', () => {
        showRecordsTooltip(parentEl, tooltipText);
      });
  
      parentEl.addEventListener('mouseleave', () => {
        hideRecordsTooltip();
      });
    });
  }
  