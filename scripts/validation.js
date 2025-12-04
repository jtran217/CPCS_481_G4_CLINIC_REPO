// Field validation system used across forms

async function loadValidationRules() {
    const res = await fetch("./data/validation-rules.json");
    return await res.json();
  }
  
  function setFieldError(id, message) {
    // Try to find error element using data-error-for attribute first
    let errorEl = document.querySelector(`[data-error-for="${id}"]`);
    
    // Fallback to id pattern (for booking modal compatibility)
    if (!errorEl) {
      errorEl = document.getElementById(`${id}-error`);
    }
    
    const inputEl = document.getElementById(id);
    
    // Set error message
    if (errorEl) {
      errorEl.textContent = message;
      
      // Handle both .input-error (display: block/none) and .form-error (.visible class) patterns
      if (errorEl.classList.contains('form-error')) {
        if (message) {
          errorEl.classList.add('visible');
        } else {
          errorEl.classList.remove('visible');
        }
      } else {
        errorEl.style.display = message ? "block" : "none";
      }
    }
    
    // Add/remove error class from input
    if (inputEl) {
      if (message) {
        inputEl.classList.add("error");
      } else {
        inputEl.classList.remove("error");
      }
    }
    
    // Special handling for captcha checkbox - style the captcha-box
    if (id === "captcha-check") {
      const captchaBox = inputEl?.closest(".captcha-box");
      if (captchaBox) {
        if (message) {
          captchaBox.style.borderColor = "var(--color-error-600)";
        } else {
          captchaBox.style.borderColor = "";
        }
      }
    }
  }
  
  async function validateForm(formId) {
    const rules = await loadValidationRules();
    const form = document.getElementById(formId);
  
    let isValid = true;
  
    for (const fieldId in rules) {
      const rule = rules[fieldId];
      const input = document.getElementById(fieldId);
  
      if (!input) continue;
  
      let value = input.type === "checkbox"
        ? input.checked
        : input.value.trim();
  
      // Required rule
      if (rule.required && (value === "" || value === false)) {
        setFieldError(fieldId, rule.errorMessage);
        isValid = false;
        continue;
      }
  
      // Min length
      if (rule.minLength && value.length < rule.minLength) {
        setFieldError(fieldId, rule.lengthMessage);
        isValid = false;
        continue;
      }
  
      // Pattern match
      if (rule.pattern) {
        const reg = new RegExp(rule.pattern);
        if (!reg.test(value)) {
          setFieldError(fieldId, rule.patternMessage);
          isValid = false;
          continue;
        }
      }
  
      // Clear previous error
      setFieldError(fieldId, "");
    }
  
    return isValid;
  }
  
  // Expose globally
  window.validateForm = validateForm;
  window.setFieldError = setFieldError;
  window.loadValidationRules = loadValidationRules;
  