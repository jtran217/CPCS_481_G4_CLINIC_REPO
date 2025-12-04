// =======================================================
// Records Pages Tooltip Logic
// =======================================================

// Reuse global tooltip element (loaded once by main.js)
let recordsTooltipElement = null;

// Show tooltip on hover
function showRecordsTooltip(targetEl, tooltipText) {
  if (!recordsTooltipElement) {
    recordsTooltipElement = document.getElementById("tooltip");
  }
  if (!recordsTooltipElement) return;

  const tooltipContent = recordsTooltipElement.querySelector("[data-tooltip-content]");
  if (tooltipContent) tooltipContent.textContent = tooltipText;

  // Reset for measurement
  recordsTooltipElement.style.left = "-9999px";
  recordsTooltipElement.style.top = "-9999px";
  recordsTooltipElement.classList.add("visible");
  void recordsTooltipElement.offsetWidth;

  const rect = targetEl.getBoundingClientRect();
  const tooltipRect = recordsTooltipElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Try positioning to the right first
  let left = rect.right + 8;
  let top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);

  // Check if tooltip goes off screen to the right
  if (left + tooltipRect.width > viewportWidth) {
    // Position to the left instead
    left = rect.left - tooltipRect.width - 8;
  }

  // Check if tooltip goes off screen to the left
  if (left < 0) {
    // Center horizontally if both sides don't work
    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  }

  // Check if tooltip goes off screen at the top
  if (top < 0) {
    top = 8; // Small margin from top
  }

  // Check if tooltip goes off screen at the bottom
  if (top + tooltipRect.height > viewportHeight) {
    top = viewportHeight - tooltipRect.height - 8; // Small margin from bottom
  }

  recordsTooltipElement.style.left = `${left}px`;
  recordsTooltipElement.style.top = `${top}px`;
}

// Hide tooltip
function hideRecordsTooltip() {
  if (!recordsTooltipElement) return;
  recordsTooltipElement.classList.remove("visible");
}

// =======================================================
// INITIALIZATION FOR RECORDS PAGES
// =======================================================

async function initRecordsPage() {
  // Reuse global tooltip element (loaded once by main.js)
  recordsTooltipElement = document.getElementById("tooltip");

  setupRecordsTooltips();
  setupLabSummaryModal(); 
  setupPhysicalSummaryModal();// <-- NEW
}

// Attach listeners to tooltip-parent elements
function setupRecordsTooltips() {
  const tooltipParents = document.querySelectorAll(".tooltip-parent");

  tooltipParents.forEach((parentEl) => {
    if (parentEl.dataset.tooltipInitialized === "true") return;

    let tooltipText = parentEl.getAttribute("data-tooltip");
    if (!tooltipText) {
      const inlineTooltip = parentEl.querySelector(".tooltip");
      if (inlineTooltip) {
        tooltipText = inlineTooltip.textContent.trim();
        inlineTooltip.remove();
      }
    }
    if (!tooltipText) return;

    parentEl.dataset.tooltipInitialized = "true";

    parentEl.addEventListener("mouseenter", () => {
      showRecordsTooltip(parentEl, tooltipText);
    });

    parentEl.addEventListener("mouseleave", () => {
      hideRecordsTooltip();
    });
  });
}

// =======================================================
// LAB SUMMARY MODAL LOGIC (NEW)
// =======================================================

function setupLabSummaryModal() {
  const overlay = document.getElementById("lab-overlay");
  const modal = document.getElementById("lab-summary-modal");
  const closeBtn = modal ? modal.querySelector(".lab-close-btn") : null;

  if (!overlay || !modal) {
    console.warn("Lab summary modal elements not found — OK if not on lab page.");
    return;
  }

  // OPEN modal buttons (maximize buttons)
  const openButtons = document.querySelectorAll(".open-lab-summary");

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      overlay.classList.remove("hidden");
      modal.classList.remove("hidden");
    });
  });

  // CLOSE button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.add("hidden");
      modal.classList.add("hidden");
    });
  }

  // Clicking grey background closes modal
  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
  });
}

function setupPhysicalSummaryModal() {
  const overlay = document.getElementById("physical-overlay");
  const modal = document.getElementById("physical-summary-modal");
  const closeBtn = modal ? modal.querySelector(".lab-close-btn") : null;

  if (!overlay || !modal) return;

  const openBtns = document.querySelectorAll(".open-physical-summary");

  openBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      overlay.classList.remove("hidden");
      modal.classList.remove("hidden");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.add("hidden");
      modal.classList.add("hidden");
    });
  }

  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
  });
}