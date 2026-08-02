/**
 * Fábio Junior Decor - Jardins Artificiais Script
 * Phone: +55 22 99224-2189
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '5522992242189';

  // Modal elements
  const modal = document.getElementById('jardim-modal');
  const modalClose = document.getElementById('jardim-modal-close');
  const modalImg = document.getElementById('jardim-modal-img');
  const modalTitle = document.getElementById('jardim-modal-title');
  const modalDesc = document.getElementById('jardim-modal-desc');
  const modalWhatsapp = document.getElementById('jardim-modal-whatsapp');

  // Quick view buttons
  const quickViewBtns = document.querySelectorAll('.btn-quick-view-jardim');

  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.getAttribute('data-img');
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');

      if (modalImg) modalImg.src = img;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalWhatsapp) {
        const text = encodeURIComponent(`Olá, gostaria de solicitar um orçamento para o *${title}*!`);
        modalWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      }

      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Interactive Panel Calculator
  const calcWidth = document.getElementById('jardim-wall-width');
  const calcHeight = document.getElementById('jardim-wall-height');
  const calcType = document.getElementById('jardim-panel-type');
  const calcResult = document.getElementById('jardim-calc-result');

  function calculatePanels() {
    if (!calcWidth || !calcHeight || !calcResult) return;

    const w = parseFloat(calcWidth.value);
    const h = parseFloat(calcHeight.value);
    const type = calcType ? calcType.value : '40x60';

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      calcResult.innerHTML = '💡 Preencha a largura e altura acima para calcular automaticamente a quantidade exata de placas com margem de segurança.';
      calcResult.style.background = '#ECFDF5';
      calcResult.style.borderColor = '#6EE7B7';
      calcResult.style.color = '#065F46';
      return;
    }

    const wallArea = w * h;
    let panelArea = 0.24; // 40x60 default
    let panelLabel = '40x60cm';

    if (type === '50x50') {
      panelArea = 0.25;
      panelLabel = '50x50cm';
    }

    // Exact count & recommended count with 10% safety margin for cuts
    const exactPanels = wallArea / panelArea;
    const recommendedPanels = Math.ceil(exactPanels * 1.10);

    const waText = encodeURIComponent(`Olá, calculei no site para uma parede de ${w}m x ${h}m (${wallArea.toFixed(2)}m²) e preciso de aproximadamente ${recommendedPanels} placas (${panelLabel}) de Jardim Artificial. Gostaria de um orçamento!`);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    calcResult.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 6px;">
        Parede: <strong>${w.toFixed(2)}m x ${h.toFixed(2)}m</strong> (${wallArea.toFixed(2)} m²)
      </div>
      <div style="font-size: 20px; font-weight: 700; color: #047857; margin-bottom: 12px;">
        📦 Quantidade recomendada: <u>${recommendedPanels} placas</u> (${panelLabel})
      </div>
      <p style="font-size: 13px; opacity: 0.9; margin-bottom: 14px;">(Já inclui 10% de margem para recortes e acabamentos)</p>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-header" style="display: inline-flex; justify-content: center; padding: 10px 20px; font-size: 15px; text-decoration: none;">
        Soliciar Orçamento destas ${recommendedPanels} Placas no WhatsApp
      </a>
    `;
    calcResult.style.background = '#ECFDF5';
    calcResult.style.borderColor = '#34D399';
    calcResult.style.color = '#064E3B';
  }

  if (calcWidth && calcHeight) {
    calcWidth.addEventListener('input', calculatePanels);
    calcHeight.addEventListener('input', calculatePanels);
    if (calcType) calcType.addEventListener('change', calculatePanels);
  }
});
