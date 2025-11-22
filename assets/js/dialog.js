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

        const titleEl = document.createElement('h3');
        titleEl.className = 'dialog-title';
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
