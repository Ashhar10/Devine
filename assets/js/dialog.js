// Custom Dialog System
// Replaces native alert/confirm with styled modals

const styles = `
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .dialog-overlay.visible {
    opacity: 1;
  }
  .dialog-box {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 90%;
    transform: scale(0.9);
    transition: transform 0.2s ease;
  }
  .dialog-overlay.visible .dialog-box {
    transform: scale(1);
  }
  .dialog-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }
  .dialog-message {
    color: #4b5563;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  .dialog-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .dialog-btn-primary {
    background-color: #0891b2;
    color: white;
    border: none;
  }
  .dialog-btn-primary:hover {
    background-color: #0e7490;
  }
  .dialog-btn-secondary {
    background-color: #e5e7eb;
    color: #374151;
    border: none;
  }
  .dialog-btn-secondary:hover {
    background-color: #d1d5db;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function createDialog(title, message, type = 'alert') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const box = document.createElement('div');
    box.className = 'dialog-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'dialog-title');

    const titleEl = document.createElement('h3');
    titleEl.className = 'dialog-title';
    titleEl.id = 'dialog-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('p');
    msgEl.className = 'dialog-message';
    msgEl.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'dialog-actions';

    if (type === 'confirm') {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'dialog-btn dialog-btn-secondary';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = () => close(false);
      actions.appendChild(cancelBtn);
    }

    const okBtn = document.createElement('button');
    okBtn.className = 'dialog-btn dialog-btn-primary';
    okBtn.textContent = 'OK';
    okBtn.onclick = () => close(true);
    actions.appendChild(okBtn);

    box.appendChild(titleEl);
    box.appendChild(msgEl);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Animation
    requestAnimationFrame(() => overlay.classList.add('visible'));

    function close(result) {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 200);
    }
  });
}

export async function showAlert(message, title = 'Alert') {
  return createDialog(title, message, 'alert');
}

export async function showConfirm(message, title = 'Confirm') {
  return createDialog(title, message, 'confirm');
}

// Custom Form Dialog for inputs
export async function showFormDialog(title, fields, customers = []) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const box = document.createElement('div');
    box.className = 'dialog-box';
    box.style.maxWidth = '500px';

    const titleEl = document.createElement('h3');
    titleEl.className = 'dialog-title';
    titleEl.textContent = title;

    const form = document.createElement('form');

    const formData = {};

    fields.forEach(field => {
      const fieldDiv = document.createElement('div');
      fieldDiv.style.marginBottom = '1rem';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      label.style.fontWeight = '500';
      label.style.color = '#374151';

      let input;
      if (field.type === 'select' && field.name === 'customerId') {
        input = document.createElement('select');
        input.className = 'dialog-input';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Select Customer --';
        input.appendChild(placeholder);

        customers.forEach(c => {
          const option = document.createElement('option');
          option.value = c.id;
          option.textContent = `${c.name} (${c.phone})`;
          input.appendChild(option);
        });
      } else if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'dialog-input';

        field.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.className = 'dialog-input';
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.min !== undefined) input.min = field.min;
        if (field.step) input.step = field.step;
      }

      input.name = field.name;
      input.required = field.required !== false;
      input.style.width = '100%';
      input.style.padding = '0.5rem';
      input.style.border = '1px solid #d1d5db';
      input.style.borderRadius = '0.375rem';
      input.style.fontSize = '1rem';

      formData[field.name] = input;

      fieldDiv.appendChild(label);
      fieldDiv.appendChild(input);
      form.appendChild(fieldDiv);
    });

    // Actions div INSIDE the form
    const actions = document.createElement('div');
    actions.className = 'dialog-actions';
    actions.style.marginTop = '1.5rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'dialog-btn dialog-btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => close(null);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'dialog-btn dialog-btn-primary';
    submitBtn.textContent = 'Submit';

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);

    // Add actions to form
    form.appendChild(actions);

    form.onsubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted');

      // Validate all fields
      let isValid = true;
      const result = {};

      fields.forEach(field => {
        const input = formData[field.name];
        const value = input.value;

        console.log(`Field ${field.name}: value="${value}", required=${field.required !== false}`);

        // Check required fields
        if (field.required !== false && !value) {
          isValid = false;
          input.style.borderColor = '#ef4444';
          console.log(`Field ${field.name} is invalid (empty)`);
          return;
        } else {
          input.style.borderColor = '#d1d5db';
        }

        // Convert types
        if (field.type === 'number') {
          result[field.name] = Number(value);
        } else if (field.type === 'select' && field.name === 'customerId') {
          result[field.name] = Number(value);
        } else {
          result[field.name] = value;
        }
      });

      console.log('Validation result:', isValid, result);

      if (isValid) {
        close(result);
      } else {
        console.log('Form validation failed');
      }
    };

    box.appendChild(titleEl);
    box.appendChild(form);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      if (formData[fields[0].name]) {
        formData[fields[0].name].focus();
      }
    });

    function close(result) {
      console.log('Closing dialog with result:', result);
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 200);
    }
  });
}

// Messaging Options Dialog (SMS vs WhatsApp)
export async function showMessagingOptions(customerName, phone, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const box = document.createElement('div');
    box.className = 'dialog-box';
    box.style.maxWidth = '450px';

    const titleEl = document.createElement('h3');
    titleEl.className = 'dialog-title';
    titleEl.textContent = `Send Reminder to ${customerName}`;

    const msgEl = document.createElement('p');
    msgEl.className = 'dialog-message';
    msgEl.textContent = 'Choose how to send the payment reminder:';
    msgEl.style.marginBottom = '1rem';

    const phoneInfo = document.createElement('p');
    phoneInfo.style.fontSize = '0.875rem';
    phoneInfo.style.color = '#6b7280';
    phoneInfo.style.marginBottom = '1.5rem';
    phoneInfo.textContent = `Phone: ${phone}`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexDirection = 'column';
    actions.style.gap = '0.75rem';

    const whatsappBtn = document.createElement('button');
    whatsappBtn.className = 'dialog-btn dialog-btn-primary';
    whatsappBtn.style.width = '100%';
    whatsappBtn.style.display = 'flex';
    whatsappBtn.style.alignItems = 'center';
    whatsappBtn.style.justifyContent = 'center';
    whatsappBtn.style.gap = '0.5rem';
    whatsappBtn.innerHTML = '📱 Send via WhatsApp';
    whatsappBtn.onclick = () => close('whatsapp');

    const smsBtn = document.createElement('button');
    smsBtn.className = 'dialog-btn dialog-btn-secondary';
    smsBtn.style.width = '100%';
    smsBtn.style.display = 'flex';
    smsBtn.style.alignItems = 'center';
    smsBtn.style.justifyContent = 'center';
    smsBtn.style.gap = '0.5rem';
    smsBtn.innerHTML = '💬 Send via SMS';
    smsBtn.onclick = () => close('sms');

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'dialog-btn dialog-btn-secondary';
    cancelBtn.style.width = '100%';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => close(null);

    actions.appendChild(whatsappBtn);
    actions.appendChild(smsBtn);
    actions.appendChild(cancelBtn);

    box.appendChild(titleEl);
    box.appendChild(msgEl);
    box.appendChild(phoneInfo);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    function close(choice) {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        resolve(choice);
      }, 200);
    }
  });
}
