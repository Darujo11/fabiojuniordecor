/**
 * Fábio Junior Decor - Dedicated PDF Catalogs Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active-mobile');
    });
  }

  // Live Search Filter for Catalogs
  const pdfSearchInput = document.getElementById('pdf-search-input');
  const pdfCards = document.querySelectorAll('.pdf-showcase-card');

  if (pdfSearchInput) {
    pdfSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      pdfCards.forEach(card => {
        const searchData = card.getAttribute('data-title') || '';
        if (!query || searchData.toLowerCase().includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // PDF Viewer Modal Logic
  const pdfViewerModal = document.getElementById('pdf-viewer-modal');
  const pdfModalCloseBtn = document.getElementById('pdf-modal-close-btn');
  const pdfModalIframe = document.getElementById('pdf-modal-iframe');
  const pdfModalTitle = document.getElementById('pdf-modal-title');
  const pdfModalOpenTab = document.getElementById('pdf-modal-open-tab');
  const viewModalBtns = document.querySelectorAll('.btn-pdf-view-modal');

  viewModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pdfUrl = btn.getAttribute('data-pdf-url');
      const pdfTitle = btn.getAttribute('data-pdf-title') || 'Book PDF';

      if (pdfViewerModal && pdfModalIframe) {
        pdfModalTitle.textContent = pdfTitle + ' - Leitor Online';
        pdfModalIframe.src = pdfUrl;
        if (pdfModalOpenTab) pdfModalOpenTab.href = pdfUrl;
        pdfViewerModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
      }
    });
  });

  function closePdfModal() {
    if (pdfViewerModal) {
      pdfViewerModal.classList.remove('active');
      if (pdfModalIframe) pdfModalIframe.src = '';
      document.body.style.overflow = '';
    }
  }

  if (pdfModalCloseBtn) {
    pdfModalCloseBtn.addEventListener('click', closePdfModal);
  }

  if (pdfViewerModal) {
    pdfViewerModal.addEventListener('click', (e) => {
      if (e.target === pdfViewerModal) {
        closePdfModal();
      }
    });
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdfViewerModal && pdfViewerModal.classList.contains('active')) {
      closePdfModal();
    }
  });

  // Integrated Roll Calculator
  const pdfCalcWidth = document.getElementById('pdf-calc-width');
  const pdfCalcHeight = document.getElementById('pdf-calc-height');
  const pdfCalcResult = document.getElementById('pdf-calc-result');

  function calculateRolls() {
    if (!pdfCalcWidth || !pdfCalcHeight || !pdfCalcResult) return;

    const width = parseFloat(pdfCalcWidth.value);
    const height = parseFloat(pdfCalcHeight.value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      pdfCalcResult.innerHTML = 'Preencha a largura e a altura para ver a quantidade recomendada de rolos.';
      return;
    }

    const wallArea = width * height;
    // Standard European wallpaper roll: 0.53m width x 10m length = 5.3m² gross area
    // Net usable area per roll accounting for pattern match cuts is approx 4.5m²
    const USABLE_AREA_PER_ROLL = 4.5;
    const rollsNeeded = Math.ceil(wallArea / USABLE_AREA_PER_ROLL);

    pdfCalcResult.innerHTML = `
      <strong style="color: var(--color-secondary-2); font-size: 17px; display: block; margin-bottom: 4px;">
        📊 Estimativa: Você precisará de <u>${rollsNeeded} rolo(s)</u> de papel de parede.
      </strong>
      <span style="font-size: 13px; color: var(--color-text-muted);">
        Área total da parede: ${wallArea.toFixed(2)}m² (Considerando margem de segurança para encaixe de estampa em rolos de 0,53m x 10m).
      </span>
    `;
  }

  if (pdfCalcWidth && pdfCalcHeight) {
    pdfCalcWidth.addEventListener('input', calculateRolls);
    pdfCalcHeight.addEventListener('input', calculateRolls);
  }
});
