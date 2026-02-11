/* ========================================
   SAGAR BAGS - Inline Form Validation
   ======================================== */

const FormValidation = {
  // Validation rules
  rules: {
    name: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      messages: {
        required: 'Please enter your name',
        minLength: 'Name must be at least 2 characters',
        pattern: 'Name should only contain letters'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        required: 'Please enter your email',
        pattern: 'Please enter a valid email address'
      }
    },
    phone: {
      required: true,
      pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
      minLength: 10,
      messages: {
        required: 'Please enter your phone number',
        pattern: 'Please enter a valid phone number',
        minLength: 'Phone number must be at least 10 digits'
      }
    },
    message: {
      required: true,
      minLength: 10,
      messages: {
        required: 'Please enter your message',
        minLength: 'Message must be at least 10 characters'
      }
    }
  },

  // Initialize validation on a form
  init(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // Get all input fields
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Add validation on blur (when user leaves the field)
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      // Add live validation on input (after first blur)
      input.addEventListener('input', () => {
        if (input.dataset.touched === 'true') {
          this.validateField(input);
        }
      });
    });

    // Form submit validation
    form.addEventListener('submit', (e) => {
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Scroll to first error
        const firstError = form.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  },

  // Validate a single field
  validateField(input) {
    const name = input.name || input.id;
    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    const rule = this.rules[name];

    // Mark as touched
    input.dataset.touched = 'true';

    // Remove existing error
    this.clearError(formGroup);

    // Skip validation if no rules defined
    if (!rule) return true;

    // Required check
    if (rule.required && !value) {
      this.showError(formGroup, rule.messages.required);
      return false;
    }

    // Only validate further if there's a value
    if (value) {
      // Min length check
      if (rule.minLength && value.length < rule.minLength) {
        this.showError(formGroup, rule.messages.minLength);
        return false;
      }

      // Pattern check
      if (rule.pattern && !rule.pattern.test(value)) {
        this.showError(formGroup, rule.messages.pattern);
        return false;
      }
    }

    // Show success state
    this.showSuccess(formGroup);
    return true;
  },

  // Show error state
  showError(formGroup, message) {
    if (!formGroup) return;

    formGroup.classList.remove('success');
    formGroup.classList.add('error');

    // Remove existing error message
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Add error message
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      ${message}
    `;
    formGroup.appendChild(errorEl);
  },

  // Show success state
  showSuccess(formGroup) {
    if (!formGroup) return;

    formGroup.classList.remove('error');
    formGroup.classList.add('success');

    // Remove any existing error message
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();
  },

  // Clear error state
  clearError(formGroup) {
    if (!formGroup) return;

    formGroup.classList.remove('error', 'success');
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();
  }
};

// Auto-initialize on pages with contact form
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('contactForm')) {
    FormValidation.init('#contactForm');
  }
});

// Export for use in other scripts
window.FormValidation = FormValidation;
