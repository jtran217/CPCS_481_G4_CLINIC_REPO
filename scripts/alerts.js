async function loadAlertComponent() {
    const container = document.getElementById("alert-container");
    if (!container) return;
  
    const res = await fetch("components/alert.html");
    container.innerHTML = await res.text();
  }
  
  function showAlert(type, message) {
    const alert = document.getElementById("alert");
    const msg = document.getElementById("alert-message");
    const close = document.getElementById("alert-close");
  
    if (!alert || !msg) return;
  
    alert.classList.remove("alert-success", "alert-error");
    alert.classList.add(`alert-${type}`);
  
    msg.textContent = message;
    alert.style.display = "flex";
  
    requestAnimationFrame(() => {
      alert.classList.add("show");
    });
  
    if (close) close.onclick = hideAlert;
  }
  
  function hideAlert() {
    const alert = document.getElementById("alert");
    if (!alert) return;
  
    alert.classList.remove("show");
    setTimeout(() => (alert.style.display = "none"), 200);
  }
  
  document.addEventListener("DOMContentLoaded", loadAlertComponent);
  
  window.showAlert = showAlert;
  window.hideAlert = hideAlert;
  