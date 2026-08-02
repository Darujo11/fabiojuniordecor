/**
 * Fábio Junior Decor - Mesa Posta Logic
 * Phone: +55 22 99224-2189
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '5522992242189';

  const mesaProductsGrid = document.getElementById('mesa-products-grid');
  const mesaSearchInput = document.getElementById('mesa-search-input');
  const mesaTagBtns = document.querySelectorAll('.mesa-tag-btn');

  // Modal elements
  const modal = document.getElementById('mesa-modal');
  const modalClose = document.getElementById('mesa-modal-close');
  const modalImg = document.getElementById('mesa-modal-img');
  const modalTitle = document.getElementById('mesa-modal-title');
  const modalDesc = document.getElementById('mesa-modal-desc');
  const modalWhatsapp = document.getElementById('mesa-modal-whatsapp');

  let currentSearch = '';
  let currentFilter = 'ALL';

  // Get Mesa Posta products from PRODUCTS_DATA array
  const mesaProducts = (typeof PRODUCTS_DATA !== 'undefined')
    ? PRODUCTS_DATA.filter(p => p.category === 'Mesa Posta')
    : [];

  renderMesaProducts();

  function renderMesaProducts() {
    if (!mesaProductsGrid) return;

    let items = mesaProducts;

    if (currentFilter !== 'ALL') {
      const filterLower = currentFilter.toLowerCase();
      items = items.filter(p => {
        const titleLower = p.title.toLowerCase();
        const tagsLower = p.tags.map(t => t.toLowerCase()).join(' ');
        return titleLower.includes(filterLower) || tagsLower.includes(filterLower);
      });
    }

    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase().trim();
      items = items.filter(p => {
        return p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      });
    }

    if (items.length === 0) {
      mesaProductsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
          <h3>Nenhum produto encontrado</h3>
          <p>Tente buscar por outro termo ou cor.</p>
        </div>
      `;
      return;
    }

    mesaProductsGrid.innerHTML = items.map(product => {
      const waText = encodeURIComponent(`Olá, gostaria de solicitar um orçamento para o *${product.title}*!`);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

      const detailsBtn = product.productPage
        ? `<a href="${product.productPage}" class="btn-primary" style="display: flex; justify-content: center; align-items: center; text-decoration: none; padding: 8px; font-size: 14px; background: #DB2777; border-color: #DB2777; color: #FFFFFF; font-weight: 700;">🌸 Ver Fotos & Detalhes</a>`
        : `<button type="button" class="btn-quick-view-mesa" data-img="${product.imageUrl}" data-title="${product.title}" data-desc="Item da linha exclusiva Mesa Posta Fábio Junior Decor. Material de alta qualidade, resistente e fácil de higienizar." style="width: 100%; padding: 8px; border: 1px solid var(--border-color); background: var(--color-surface-2); border-radius: 4px; cursor: pointer; font-weight: 600; color: var(--color-text-1);">🔍 Ampliar Foto</button>`;

      const imageWrap = product.productPage
        ? `<a href="${product.productPage}"><img src="${product.imageUrl}" alt="${product.title} - Fábio Junior Decor" loading="lazy" /></a>`
        : `<img src="${product.imageUrl}" alt="${product.title} - Fábio Junior Decor" loading="lazy" />`;

      const titleWrap = product.productPage
        ? `<h3 class="product-title"><a href="${product.productPage}" style="color: inherit; text-decoration: none;">${product.title}</a></h3>`
        : `<h3 class="product-title">${product.title}</h3>`;

      return `
        <article class="product-card" style="border-color: #FDE68A;">
          <div class="product-image-wrap">
            <span class="product-category-badge" style="background: #B45309;">Mesa Posta</span>
            ${imageWrap}
          </div>
          <div class="product-body">
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="product-tag" style="background: #FEF3C7; color: #92400E;">${tag}</span>`).join('')}
            </div>
            ${titleWrap}
            <div class="product-actions" style="display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-header" style="justify-content: center; text-decoration: none;">
                Comprar no WhatsApp
              </a>
              ${detailsBtn}
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachModalEvents();
  }

  function attachModalEvents() {
    const btns = document.querySelectorAll('.btn-quick-view-mesa');
    btns.forEach(btn => {
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
  }

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

  // Search input event
  if (mesaSearchInput) {
    mesaSearchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderMesaProducts();
    });
  }

  // Tag filter buttons events
  mesaTagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mesaTagBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = '#FFFFFF';
        b.style.color = 'var(--color-text-1)';
      });
      btn.classList.add('active');
      btn.style.background = '#D97706';
      btn.style.color = '#FFFFFF';
      currentFilter = btn.getAttribute('data-filter') || 'ALL';
      renderMesaProducts();
    });
  });
});
