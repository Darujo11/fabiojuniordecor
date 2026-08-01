// Álbum Papel de Parede Interactivity Script
document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = 'Toulon'; // 'Toulon', 'Valence', 'Cassys', or 'Marrom'
  let currentTagFilter = 'ALL';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 24;

  const photosGrid = document.getElementById('photos-grid');
  const resultsCount = document.getElementById('photos-count');
  const searchInput = document.getElementById('photos-search-input');
  const btnLoadMore = document.getElementById('photos-load-more');
  const tagChipsWrapper = document.getElementById('tag-chips-wrapper');
  const catCards = document.querySelectorAll('.cat-switcher-card');

  // Available tag lists per collection
  const collectionTags = {
    Toulon: [
      { id: 'ALL', label: 'Todos (209)' },
      { id: 'Floral', label: 'Floral' },
      { id: 'Tijolinho', label: 'Tijolinho' },
      { id: 'Infantil', label: 'Infantil' },
      { id: 'Madeira & Ripado', label: 'Madeira & Ripado' },
      { id: 'Cimento Queimado', label: 'Cimento Queimado' },
      { id: 'Mármore', label: 'Mármore' },
      { id: 'Liso', label: 'Liso' },
      { id: 'Texturizado', label: 'Texturizado' }
    ],
    Valence: [
      { id: 'ALL', label: 'Todos (106)' },
      { id: 'Floral', label: 'Floral' },
      { id: 'Listrado', label: 'Listrado' },
      { id: 'Infantil', label: 'Infantil' },
      { id: 'Madeira & Ripado', label: 'Madeira & Ripado' },
      { id: 'Liso', label: 'Liso' }
    ],
    Cassys: [
      { id: 'ALL', label: 'Todos (51)' },
      { id: 'Cimento Queimado', label: 'Cimento Queimado' },
      { id: 'Floral', label: 'Floral' },
      { id: 'Texturizado', label: 'Texturizado' },
      { id: 'Liso', label: 'Liso' }
    ],
    Marrom: [
      { id: 'ALL', label: 'Todos (34)' },
      { id: 'Geométrico', label: 'Geométrico' },
      { id: 'Infantil', label: 'Infantil' },
      { id: 'Madeira & Ripado', label: 'Madeira & Ripado' },
      { id: 'Texturizado', label: 'Texturizado' },
      { id: 'Liso', label: 'Liso' }
    ]
  };

  // Get active dataset based on collection selection
  function getActiveDataset() {
    if (currentCategory === 'Valence') {
      return (typeof valencePhotosData !== 'undefined') ? valencePhotosData : [];
    }
    if (currentCategory === 'Cassys') {
      return (typeof cassysPhotosData !== 'undefined') ? cassysPhotosData : [];
    }
    if (currentCategory === 'Marrom') {
      return (typeof marromPhotosData !== 'undefined') ? marromPhotosData : [];
    }
    return (typeof toulonPhotosData !== 'undefined') ? toulonPhotosData : [];
  }

  // Filter Data Algorithm
  function getFilteredData() {
    const dataset = getActiveDataset();

    return dataset.filter(item => {
      // Style Tag Filter
      const matchTag = (currentTagFilter === 'ALL') || (item.tag === currentTagFilter);

      // Search Query Filter (Matches code, description, or style tag)
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        item.code.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) || 
        item.tag.toLowerCase().includes(q);

      return matchTag && matchQuery;
    });
  }

  // Render Filter Tag Chips dynamically
  function renderTagChips() {
    if (!tagChipsWrapper) return;

    const tags = collectionTags[currentCategory] || collectionTags['Toulon'];
    tagChipsWrapper.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: var(--color-secondary-2);">Filtrar por Estilo:</span>`;

    tags.forEach(t => {
      const chip = document.createElement('span');
      chip.className = `toulon-tag-chip ${currentTagFilter === t.id ? 'active' : ''}`;
      chip.setAttribute('data-tag', t.id);
      chip.textContent = t.label;

      chip.addEventListener('click', () => {
        document.querySelectorAll('.toulon-tag-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentTagFilter = t.id;
        currentPage = 1;
        renderPhotos();
      });

      tagChipsWrapper.appendChild(chip);
    });
  }

  // Render Grid Cards
  function renderPhotos(append = false) {
    if (!photosGrid) return;

    const filtered = getFilteredData();
    const total = filtered.length;

    if (resultsCount) {
      const catLabel = (currentCategory === 'Marrom') ? 'Papéis Marrons' : `Coleção ${currentCategory}`;
      resultsCount.textContent = `Exibindo ${Math.min(currentPage * itemsPerPage, total)} de ${total} papéis de parede na ${catLabel}`;
    }

    if (!append) {
      photosGrid.innerHTML = '';
    }

    if (total === 0) {
      photosGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: var(--color-surface-2); border-radius: 16px; border: 1px dashed var(--border-color);">
          <span style="font-size: 40px; display: block; margin-bottom: 12px;">🔎</span>
          <h3 style="font-size: 20px; font-family: var(--font-family-heading); margin-bottom: 8px;">Nenhum papel de parede encontrado</h3>
          <p style="color: var(--color-text-muted); font-size: 15px;">Tente pesquisar por outro código ou escolha outra categoria de estilo.</p>
        </div>
      `;
      if (btnLoadMore) btnLoadMore.style.display = 'none';
      return;
    }

    const itemsToDisplay = filtered.slice(0, currentPage * itemsPerPage);
    const fragment = document.createDocumentFragment();

    itemsToDisplay.forEach((item, index) => {
      // Skip already rendered items if appending
      if (append && index < (currentPage - 1) * itemsPerPage) return;

      const card = document.createElement('div');
      card.className = 'toulon-photo-card';

      const catText = (currentCategory === 'Marrom') ? 'Papéis Marrons' : `Coleção ${currentCategory}`;
      const waMsg = encodeURIComponent(`Olá! Vi a foto do Papel de Parede (${item.desc}) - Código: ${item.code} na página Álbum Papel de Parede (${catText}) da Fabiojuniordecor e gostaria de solicitar um orçamento!`);
      const waUrl = `https://wa.me/5522992242189?text=${waMsg}`;

      card.innerHTML = `
        <div class="toulon-img-box">
          <img src="${item.url}" alt="${item.desc} - Código ${item.code}" class="toulon-photo-img" loading="lazy" />
          <span class="toulon-style-badge">${item.tag}</span>
        </div>
        <div class="toulon-card-body">
          <span class="toulon-code-tag">CÓDIGO: ${item.code}</span>
          <h4 class="toulon-card-title">${item.desc}</h4>
          <span class="toulon-brand-text">Papel de parede é na Fabiojuniordecor</span>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-catalog toulon-wa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.299.426 2.502 1.156 3.473L6.5 18.5l3.185-.928c.937.585 2.039.919 3.226.919 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.647-5.766zm2.84 8.232c-.119.336-.692.646-.957.684-.265.038-.611.139-2.025-.443-1.693-.697-2.77-2.428-2.855-2.541-.085-.113-.687-.914-.687-1.743 0-.829.434-1.238.588-1.407.155-.169.336-.212.448-.212.113 0 .225.002.323.007.104.005.244-.04.381.289.141.339.479 1.168.521 1.253.042.085.07.183.014.296-.056.113-.085.183-.169.282-.085.099-.177.221-.253.297-.085.085-.174.177-.075.347.099.169.44.726.944 1.176.648.577 1.196.756 1.365.841.169.085.268.07.367-.042.099-.113.423-.494.536-.663.113-.169.225-.141.381-.085.155.056.987.465 1.156.549.169.085.282.127.324.197.042.07.042.409-.077.745z"/></svg>
            Orçamento pelo WhatsApp
          </a>
        </div>
      `;

      // Image Zoom Click Listener
      const imgBox = card.querySelector('.toulon-img-box');
      if (imgBox) {
        imgBox.addEventListener('click', () => {
          openPhotoZoomModal(item);
        });
      }

      fragment.appendChild(card);
    });

    photosGrid.appendChild(fragment);

    // Toggle Load More Button Visibility
    if (btnLoadMore) {
      if (itemsToDisplay.length < total) {
        btnLoadMore.style.display = 'inline-flex';
      } else {
        btnLoadMore.style.display = 'none';
      }
    }
  }

  // Category Switcher Cards Click
  catCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-collection');
      if (cat && cat !== currentCategory) {
        catCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentCategory = cat;
        currentTagFilter = 'ALL';
        currentPage = 1;
        renderTagChips();
        renderPhotos();
      }
    });
  });

  // Load More Button Event
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      currentPage++;
      renderPhotos(true);
    });
  }

  // Live Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderPhotos();
    });
  }

  // Photo Zoom Modal Logic
  const zoomModal = document.getElementById('photo-zoom-modal');
  const zoomImg = document.getElementById('zoom-modal-img');
  const zoomTitle = document.getElementById('zoom-modal-title');
  const zoomCode = document.getElementById('zoom-modal-code');
  const zoomWaBtn = document.getElementById('zoom-modal-wa-btn');
  const zoomCloseBtn = document.getElementById('zoom-modal-close');

  function openPhotoZoomModal(item) {
    if (zoomModal && zoomImg) {
      zoomImg.src = item.url;
      if (zoomTitle) zoomTitle.textContent = item.desc;
      const catText = (currentCategory === 'Marrom') ? 'Papéis Marrons' : `Coleção ${currentCategory}`;
      if (zoomCode) zoomCode.textContent = `Código: ${item.code} • ${catText}`;
      if (zoomWaBtn) {
        const waMsg = encodeURIComponent(`Olá! Gostaria de consultar o Papel de Parede (${item.desc}) - Código: ${item.code} (${catText})!`);
        zoomWaBtn.href = `https://wa.me/5522992242189?text=${waMsg}`;
      }
      zoomModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  if (zoomCloseBtn && zoomModal) {
    zoomCloseBtn.addEventListener('click', () => {
      zoomModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal) {
        zoomModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active-mobile');
    });
  }

  // Initial Render
  renderTagChips();
  renderPhotos();
});
