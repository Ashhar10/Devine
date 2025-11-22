/* ========================================
   DEVINE WATER V2.0 - INTERACTIVITY ENGINE
   ======================================== */

/**
 * Initialize all interactive elements
 */
export function initInteractions() {
    initRippleEffect();
    initPageLoader();
    initInputAnimations();
}

/**
 * Handle Global Page Loader
 */
function initPageLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 800); // Minimal delay to show animation
        });
    }
}

/**
 * Add Material Design-like Ripple Effect to buttons
 */
function initRippleEffect() {
    document.addEventListener('click', function (e) {
        const target = e.target.closest('.btn');
        if (target) {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            target.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
}

/**
 * Floating Label Input Animations
 */
function initInputAnimations() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        // Check initial state
        if (input.value) {
            input.classList.add('has-value');
        }

        input.addEventListener('blur', () => {
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });
}

/**
 * Set button to loading state
 * @param {HTMLElement} btn - The button element
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} [loadingText] - Optional text to show while loading
 */
export function setButtonLoading(btn, isLoading, loadingText = 'Loading...') {
    if (!btn) return;

    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `
      <span class="spinner"></span>
      <span style="margin-left: 8px">${loadingText}</span>
    `;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    }
}

/**
 * Create a skeleton loader HTML string
 * @param {string} type - 'text', 'card', 'avatar', 'table-row'
 * @param {number} count - Number of skeletons to generate
 */
export function getSkeletonLoader(type, count = 1) {
    let html = '';
    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            html += `
        <div class="card p-6 skeleton-container">
          <div class="skeleton skeleton-avatar mb-4"></div>
          <div class="skeleton skeleton-text" style="width: 60%"></div>
          <div class="skeleton skeleton-text" style="width: 80%"></div>
          <div class="skeleton skeleton-text" style="width: 40%"></div>
        </div>
      `;
        } else if (type === 'table-row') {
            html += `
        <tr>
          <td colspan="100%">
            <div class="skeleton skeleton-text" style="height: 40px; margin: 0;"></div>
          </td>
        </tr>
      `;
        } else {
            html += `<div class="skeleton skeleton-${type}"></div>`;
        }
    }
    return html;
}
