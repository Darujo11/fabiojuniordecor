/**
 * Fábio Junior Decor - Main Application JS Logic
 * Phone: +55 22 99224-2189 (5522992242189)
 * Strategic distinction:
 * - Vendas: Todo o Brasil
 * - Serviços (Aplicação): Exclusivo para Campos dos Goytacazes e Macaé - RJ
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '5522992242189';
  const PAGE_SIZE = 24;

  let currentCategory = 'ALL';
  let currentSearchQuery = '';
  let selectedTag = 'ALL';
  let currentPage = 1;
  let filteredProducts = [];

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const resultsCount = document.getElementById('results-count');
  const loadMoreBtn = document.getElementById('btn-load-more');
  const searchInput = document.getElementById('catalog-search-input');
  const categoryTabBtns = document.querySelectorAll('.category-tab-btn');
  const tagChips = document.querySelectorAll('.tag-filter-chip');

  // Modal Elements
  const quickViewModal = document.getElementById('quick-view-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalProductImg = document.getElementById('modal-product-img');
  const modalProductCategory = document.getElementById('modal-product-category');
  const modalProductTitle = document.getElementById('modal-product-title');
  const modalProductTags = document.getElementById('modal-product-tags');
  const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');
  
  // Roll Calculator inside Modal
  const calcWidthInput = document.getElementById('calc-wall-width');
  const calcHeightInput = document.getElementById('calc-wall-height');
  const calcRollsResult = document.getElementById('calc-rolls-result');
  let currentModalProduct = null;

  // Initialize
  initApp();

  function initApp() {
    setupEventListeners();
    applyFilters();
  }

  function setupEventListeners() {
    // Search input listener
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().strip ? e.target.value.toLowerCase().trim() : e.target.value.toLowerCase();
        currentPage = 1;
        applyFilters();
      });
    }

    // Category tabs listeners
    categoryTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category || 'ALL';
        currentPage = 1;
        applyFilters();
      });
    });

    // Tag chips listeners
    tagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        tagChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedTag = chip.dataset.tag || 'ALL';
        currentPage = 1;
        applyFilters();
      });
    });

    // Load More listener
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderProducts(true);
      });
    }

    // Close Modal Listener
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    if (quickViewModal) {
      quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) closeModal();
      });
    }

    // Calculator inputs listener
    if (calcWidthInput && calcHeightInput) {
      calcWidthInput.addEventListener('input', updateCalculator);
      calcHeightInput.addEventListener('input', updateCalculator);
    }

    // Mobile menu drawer lives in js/nav.js (shared by all pages)

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
          if (pdfModalTitle) pdfModalTitle.textContent = pdfTitle + ' - Leitor Online';
          pdfModalIframe.src = pdfUrl;
          if (pdfModalOpenTab) pdfModalOpenTab.href = pdfUrl;
          pdfViewerModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    if (pdfModalCloseBtn) {
      pdfModalCloseBtn.addEventListener('click', () => {
        if (pdfViewerModal) {
          pdfViewerModal.classList.remove('active');
          if (pdfModalIframe) pdfModalIframe.src = '';
          document.body.style.overflow = '';
        }
      });
    }

    if (pdfViewerModal) {
      pdfViewerModal.addEventListener('click', (e) => {
        if (e.target === pdfViewerModal) {
          pdfViewerModal.classList.remove('active');
          if (pdfModalIframe) pdfModalIframe.src = '';
          document.body.style.overflow = '';
        }
      });
    }
  }

  // Filter Products Algorithm
  function applyFilters() {
    if (typeof PRODUCTS_DATA === 'undefined') return;

    filteredProducts = PRODUCTS_DATA.filter(product => {
      // Ignore main collection cover images from grid
      if (product.isCover) return false;

      // Category match
      const matchCategory = (currentCategory === 'ALL') || (product.category === currentCategory);

      // Tag match
      const matchTag = (selectedTag === 'ALL') || (product.tags && product.tags.includes(selectedTag));

      // Search match
      const matchSearch = !currentSearchQuery || 
        product.title.toLowerCase().includes(currentSearchQuery) ||
        product.category.toLowerCase().includes(currentSearchQuery) ||
        (product.tags && product.tags.some(t => t.toLowerCase().includes(currentSearchQuery)));

      return matchCategory && matchTag && matchSearch;
    });

    // Update Counter
    if (resultsCount) {
      resultsCount.textContent = `Exibindo ${filteredProducts.length} modelo(s) de papel de parede`;
    }

    renderProducts(false);
  }

  // Render Product Cards
  function renderProducts(append = false) {
    if (!productsGrid) return;

    if (!append) {
      productsGrid.innerHTML = '';
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = currentPage * PAGE_SIZE;
    const itemsToRender = filteredProducts.slice(startIndex, endIndex);

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #FFFFFF; border-radius: 8px; border: 1px solid #E9E0DA;">
          <i class="ri-search-line" style="font-size: 48px; color: #A6846A; margin-bottom: 12px;"></i>
          <h3 style="margin-bottom: 8px;">Nenhum papel de parede encontrado</h3>
          <p style="color: #666666;">Tente buscar com outros termos ou selecione uma categoria diferente.</p>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    itemsToRender.forEach(product => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });

    // Toggle Load More button
    if (loadMoreBtn) {
      if (endIndex >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'inline-flex';
      }
    }
  }

  // Helper to Generate Dynamic WhatsApp Link
  function generateWhatsappLink(productTitle) {
    const text = `Olá, tenho interesse no papel de parede: ${productTitle}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  // Create Product Card DOM Element
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const waLink = generateWhatsappLink(product.title);

    card.innerHTML = `
      <div class="product-image-wrap">
        <span class="product-category-badge">${product.category}</span>
        <img src="${product.imageUrl}" alt="${product.title}" loading="lazy" />
      </div>
      <div class="product-body">
        <div class="product-tags">
          ${(product.tags || []).map(t => `<span class="product-tag">${t}</span>`).join('')}
        </div>
        <h3 class="product-title" title="${product.title}">${product.title}</h3>
        <div class="product-actions">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-buy-whatsapp">
            <i class="ri-whatsapp-line">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.299.426 2.502 1.156 3.473L6.5 18.5l3.185-.928c.937.585 2.039.919 3.226.919 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.647-5.766zm2.84 8.232c-.119.336-.692.646-.957.684-.265.038-.611.139-2.025-.443-1.693-.697-2.77-2.428-2.855-2.541-.085-.113-.687-.914-.687-1.743 0-.829.434-1.238.588-1.407.155-.169.336-.212.448-.212.113 0 .225.002.323.007.104.005.244-.04.381.289.141.339.479 1.168.521 1.253.042.085.07.183.014.296-.056.113-.085.183-.169.282-.085.099-.177.221-.253.297-.085.085-.174.177-.075.347.099.169.44.726.944 1.176.648.577 1.196.756 1.365.841.169.085.268.07.367-.042.099-.113.423-.494.536-.663.113-.169.225-.141.381-.085.155.056.987.465 1.156.549.169.085.282.127.324.197.042.07.042.409-.077.745z"/></svg>
            </i> Comprar
          </a>
          <button type="button" class="btn-quick-view" title="Visualizar & Calcular Rolos">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
    `;

    // Attach quick view event
    const quickViewBtn = card.querySelector('.btn-quick-view');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', () => openQuickView(product));
    }

    return card;
  }

  // Open Quick View Modal
  function openQuickView(product) {
    currentModalProduct = product;
    if (!quickViewModal) return;

    modalProductImg.src = product.imageUrl;
    modalProductImg.alt = product.title;
    modalProductCategory.textContent = product.category;
    modalProductTitle.textContent = product.title;

    modalProductTags.innerHTML = (product.tags || [])
      .map(t => `<span style="background: #F9F5EC; color: #906545; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${t}</span>`)
      .join('');

    const waUrl = generateWhatsappLink(product.title);
    modalWhatsappBtn.href = waUrl;

    // Reset Calculator
    if (calcWidthInput) calcWidthInput.value = '';
    if (calcHeightInput) calcHeightInput.value = '';
    updateCalculator();

    quickViewModal.classList.add('active');
  }

  function closeModal() {
    if (quickViewModal) {
      quickViewModal.classList.remove('active');
    }
  }

  // Wall Wallpaper Roll Calculator Logic
  // Standard Roll: 0.53m width x 10.0m length = ~5.3m² (useful yield approx 4.5m² considering pattern alignment)
  function updateCalculator() {
    if (!calcWidthInput || !calcHeightInput || !calcRollsResult) return;

    const width = parseFloat(calcWidthInput.value);
    const height = parseFloat(calcHeightInput.value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      calcRollsResult.innerHTML = `Digite a largura e altura da parede para calcular a quantidade exata de rolagem necessária.`;
      return;
    }

    const wallArea = width * height;
    
    // Check if it's adhesive roll (which comes in 2.80m or 3m x 60cm) vs standard paper roll (10m x 0.53m)
    let rollsNeeded = 0;

    if (currentModalProduct && currentModalProduct.category === 'Rolos Adesivos') {
      // Adhesive rolls are 0.60m width
      const stripsNeeded = Math.ceil(width / 0.60);
      rollsNeeded = stripsNeeded; // Assuming 1 roll per strip for 2.8m - 3m height
    } else {
      // Standard roll coverage: ~4.5m² effective area with pattern matching margin
      rollsNeeded = Math.ceil(wallArea / 4.5);
    }

    calcRollsResult.innerHTML = `
      <strong>Resultado Estimado:</strong><br />
      Área da parede: <strong>${wallArea.toFixed(2)}m²</strong><br />
      Recomendamos adquirir: <strong style="color: #25D366; font-size: 18px;">${rollsNeeded} rolo(s)</strong> (inclui margem de segurança de encaixe).
    `;

    // Update modal WhatsApp button to include roll count if product selected
    if (currentModalProduct) {
      const text = `Olá, gostaria de solicitar orçamento para o papel: ${currentModalProduct.title} (${rollsNeeded} rolo(s) para parede de ${width}m x ${height}m).`;
      modalWhatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    }
  }
});
