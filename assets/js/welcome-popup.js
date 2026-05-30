(function() {
  if (document.getElementById('welcomePopup')) return;
  try {
    if (sessionStorage.getItem('welcomePopupShown') === '1') return;
    sessionStorage.setItem('welcomePopupShown', '1');
  } catch (e) {}

  const style = document.createElement('style');
  style.textContent = `
    .welcome-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .welcome-popup-overlay.show {
      opacity: 1;
      visibility: visible;
    }
    .welcome-popup-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      line-height: 0;
    }
    .welcome-popup-overlay.show .welcome-popup-content {
      transform: scale(1);
    }
    .welcome-popup-image {
      display: block;
      max-width: 100%;
      max-height: 90vh;
      width: auto;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .welcome-popup-close {
      position: absolute;
      top: 2.5%;
      right: 2.5%;
      width: 9%;
      aspect-ratio: 1;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      border-radius: 50%;
    }
    .welcome-popup-close:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'welcome-popup-overlay';
  overlay.id = 'welcomePopup';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Welcome');
  overlay.innerHTML = `
    <div class="welcome-popup-content">
      <picture>
        <source media="(max-width: 768px)" srcset="assets/images/welcome-popup.png">
        <img src="assets/images/welcome-popup-desktop.png" alt="Sagar Bags - Style Meets Strength" class="welcome-popup-image">
      </picture>
      <button class="welcome-popup-close" id="welcomePopupClose" aria-label="Close popup"></button>
    </div>
  `;

  function init() {
    document.body.appendChild(overlay);
    const closeBtn = overlay.querySelector('#welcomePopupClose');
    let autoCloseTimer;
    function closePopup() {
      overlay.classList.remove('show');
      clearTimeout(autoCloseTimer);
    }
    function openPopup() {
      overlay.classList.add('show');
      autoCloseTimer = setTimeout(closePopup, 5000);
    }
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
    openPopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
