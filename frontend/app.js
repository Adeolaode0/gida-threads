/**
 * GIDA THREADS — APPLICATION CONTROLLER
 * Full-stack Client Orchestrator
 */

// Global State
const state = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('gida_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('gida_wishlist') || '[]'),
  activeCategory: 'all',
  searchQuery: '',
  sortOption: 'featured',
  inStockOnly: false,
  theme: localStorage.getItem('gida_theme') || 'dark',
  glassmorphism: localStorage.getItem('gida_glassmorphism') !== 'false', // Default to true for instant preview
  currency: localStorage.getItem('gida_currency') || 'USD',
  rates: {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 }
  },
  promo: JSON.parse(localStorage.getItem('gida_promo') || 'null'),
  selectedProduct: null,
  modalSelectedSize: null,
  modalSelectedColor: null,
  modalActiveSide: 'front',
  modalQuantity: 1,
  cardSides: {},
  cardColors: {},
  checkoutData: {
    shipping: null,
    paymentMethod: 'Credit Card',
    lastOrder: null
  }
};

// DOM Elements
const elements = {
  productGrid: document.getElementById('product-grid'),
  categoryPills: document.getElementById('category-pills'),
  sortSelect: document.getElementById('sort-select'),
  stockToggle: document.getElementById('stock-filter-toggle'),
  globalSearchInput: document.getElementById('global-search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  searchTriggerBox: document.getElementById('search-trigger-box'),
  searchExpandable: document.getElementById('search-expandable'),
  hamburgerToggleBtn: document.getElementById('hamburger-toggle-btn'),
  currencySelect: document.getElementById('currency-select'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  // Cart Elements
  cartToggleBtn: document.getElementById('cart-drawer-toggle'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartBackdrop: document.getElementById('cart-backdrop'),
  closeCartBtn: document.getElementById('close-cart-btn'),
  cartBadge: document.getElementById('cart-item-count'),
  cartTagCount: document.getElementById('cart-tag-count'),
  cartItemsList: document.getElementById('cart-items-list'),
  shippingMeterFill: document.getElementById('shipping-meter-fill'),
  shippingMeterText: document.getElementById('shipping-meter-text'),
  promoInput: document.getElementById('promo-input'),
  applyPromoBtn: document.getElementById('apply-promo-btn'),
  promoFeedback: document.getElementById('promo-feedback'),
  summarySubtotal: document.getElementById('summary-subtotal'),
  summaryDiscountRow: document.getElementById('summary-discount-row'),
  summaryDiscount: document.getElementById('summary-discount'),
  summaryShipping: document.getElementById('summary-shipping'),
  summaryTotal: document.getElementById('summary-total'),
  proceedCheckoutBtn: document.getElementById('proceed-checkout-btn'),

  // Wishlist
  wishlistToggleBtn: document.getElementById('wishlist-toggle-btn'),
  wishlistCount: document.getElementById('wishlist-count'),

  // Product Modal
  productModalBackdrop: document.getElementById('product-modal-backdrop'),
  closeProductModalBtn: document.getElementById('close-product-modal'),
  modalProductImage: document.getElementById('modal-product-image'),
  modalProductBadge: document.getElementById('modal-product-badge'),
  modalProductCategory: document.getElementById('modal-product-category'),
  modalProductTitle: document.getElementById('modal-product-title'),
  modalProductRating: document.getElementById('modal-product-rating'),
  modalProductPrice: document.getElementById('modal-product-price'),
  modalProductOrigPrice: document.getElementById('modal-product-orig-price'),
  modalProductSave: document.getElementById('modal-product-save'),
  modalProductDesc: document.getElementById('modal-product-desc'),
  modalSizePills: document.getElementById('modal-size-pills'),
  modalSelectedColorName: document.getElementById('modal-selected-color-name'),
  modalColorSwatches: document.getElementById('modal-color-swatches'),
  modalStockBanner: document.getElementById('modal-stock-banner'),
  modalStockText: document.getElementById('modal-stock-text'),
  modalQtyMinus: document.getElementById('modal-qty-minus'),
  modalQtyPlus: document.getElementById('modal-qty-plus'),
  modalQtyDisplay: document.getElementById('modal-qty-display'),
  modalAddToCartBtn: document.getElementById('modal-add-to-cart-btn'),
  modalSpecsList: document.getElementById('modal-specs-list'),

  // Checkout Modal
  checkoutModalBackdrop: document.getElementById('checkout-modal-backdrop'),
  closeCheckoutModalBtn: document.getElementById('close-checkout-modal'),
  shippingForm: document.getElementById('shipping-form'),
  paymentPane: document.getElementById('payment-pane'),
  confirmationPane: document.getElementById('confirmation-pane'),
  step1Indicator: document.getElementById('step-indicator-1'),
  step2Indicator: document.getElementById('step-indicator-2'),
  step3Indicator: document.getElementById('step-indicator-3'),
  backToCartBtn: document.getElementById('back-to-cart-btn'),
  backToShippingBtn: document.getElementById('back-to-shipping-btn'),
  submitOrderBtn: document.getElementById('submit-order-btn'),
  checkoutChargeTotal: document.getElementById('checkout-charge-total'),
  cardHolderPreview: document.getElementById('card-holder-preview'),
  finishCheckoutBtn: document.getElementById('finish-checkout-btn'),
  printReceiptBtn: document.getElementById('print-receipt-btn'),
  receiptOrderId: document.getElementById('receipt-order-id'),
  receiptCustomerName: document.getElementById('receipt-customer-name'),
  receiptCustomerCity: document.getElementById('receipt-customer-city'),
  receiptDeliveryDate: document.getElementById('receipt-delivery-date'),
  receiptTotalBilled: document.getElementById('receipt-total-billed'),
  receiptItemsContainer: document.getElementById('receipt-items-container'),

  // Admin Modal
  adminModalBtn: document.getElementById('admin-modal-btn'),
  adminModalBackdrop: document.getElementById('admin-modal-backdrop'),
  closeAdminModalBtn: document.getElementById('close-admin-modal'),
  adminTabs: document.querySelectorAll('.admin-tab'),
  adminTabPanes: document.querySelectorAll('.admin-tab-content'),
  statRevenue: document.getElementById('stat-revenue'),
  statOrders: document.getElementById('stat-orders'),
  statProducts: document.getElementById('stat-products'),
  statLowStock: document.getElementById('stat-low-stock'),
  adminInventoryTbody: document.getElementById('admin-inventory-tbody'),
  adminOrdersTbody: document.getElementById('admin-orders-tbody'),
  adminNewProductForm: document.getElementById('admin-new-product-form'),

  // Newsletter
  newsletterForm: document.getElementById('newsletter-form'),
  newsletterEmail: document.getElementById('newsletter-email'),
  newsletterMessage: document.getElementById('newsletter-message'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// ============================================================================
// CURRENCY & FORMATTING HELPERS
// ============================================================================
function formatPrice(amountInUSD) {
  const current = state.rates[state.currency] || state.rates.USD;
  const converted = amountInUSD * current.rate;
  return `${current.symbol}${converted.toFixed(2)}`;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ============================================================================
// API SERVICE
// ============================================================================
async function apiGetProducts() {
  try {
    const params = new URLSearchParams();
    if (state.activeCategory !== 'all') params.append('category', state.activeCategory);
    if (state.searchQuery) params.append('search', state.searchQuery);
    if (state.inStockOnly) params.append('in_stock_only', 'true');
    if (state.sortOption) params.append('sort', state.sortOption);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    showToast('Failed to connect to backend database', 'error');
    return [];
  }
}

async function apiCreateOrder(orderPayload) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit order');
  }
  return await res.json();
}

async function apiGetAdminStats() {
  const res = await fetch('/api/stats');
  return await res.json();
}

async function apiGetAdminOrders() {
  const res = await fetch('/api/orders');
  return await res.json();
}

async function apiUpdateOrderStatus(id, status) {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

async function apiUpdateProduct(id, payload) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function apiCreateProduct(payload) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// ============================================================================
// CATALOG RENDERING
// ============================================================================
async function loadAndRenderProducts() {
  elements.productGrid.innerHTML = `
    <div class="grid-loading-state">
      <div class="spinner"></div>
      <p>Synchronizing archive inventory...</p>
    </div>
  `;

  state.products = await apiGetProducts();
  renderProductsGrid(state.products);
}

function getProductLighting(product) {
  const s = (product.slug || product.name || '').toLowerCase();
  if (s.includes('muse') || s.includes('afro')) {
    return 'muse-prism';
  }
  if (s.includes('chasing') || s.includes('dreams')) {
    return 'royal-cyber';
  }
  if (s.includes('bear')) {
    return 'champagne-studio';
  }
  if (s.includes('star') || s.includes('distressed') || s.includes('yellow')) {
    return 'amber';
  }
  if (s.includes('abstract') || s.includes('wireframe') || s.includes('contour')) {
    return 'cyber-neon';
  }
  if (s.includes('battery') || s.includes('low-battery') || s.includes('chatgpt')) {
    return 'crimson-beacon';
  }
  return 'amber';
}

function getProductDropBadge(product) {
  const s = (product.slug || product.name || '').toLowerCase();
  if (s.includes('muse')) return 'DROP 03 // HERITAGE MUSE';
  if (s.includes('chasing')) return 'DROP 04 // CYBER MANIFESTO';
  if (s.includes('bear')) return 'DROP 05 // ATELIER MASCOT';
  if (product.category === 'tees') {
    return 'DROP 01 // ARCHIVE TEE';
  }
  if (product.category === 'hoodies') {
    return 'DROP 02 // ATELIER FLEECE';
  }
  return 'LIMITED EDITION';
}

function renderProductsGrid(products) {
  if (!products.length) {
    elements.productGrid.innerHTML = `
      <div class="grid-loading-state">
        <p>No archive pieces match your current criteria.</p>
        <button class="btn btn-outline" style="margin-top:16px;" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  elements.productGrid.innerHTML = products.map((product, index) => {
    let stockClass = 'in';
    let stockLabel = `${product.stock_quantity} Units Left`;
    if (product.stock_quantity <= 0) {
      stockClass = 'out';
      stockLabel = 'Sold Out';
    } else if (product.stock_quantity <= 10) {
      stockClass = 'low';
      stockLabel = `Only ${product.stock_quantity} Left`;
    }

    const staggerDelay = (index * 0.75).toFixed(2);
    const lighting = getProductLighting(product);
    const dropBadge = getProductDropBadge(product);
    const hasBackView = Boolean(product.back_image_url);
    const currentSide = (state.cardSides && state.cardSides[product.id]) || 'front';
    const defaultColor = (product.colors && product.colors.length) ? product.colors[0] : { name: 'Standard', hex: '#111', image_url: product.image_url, back_image_url: product.back_image_url };
    const defaultSize = (product.sizes && product.sizes.length >= 3) ? product.sizes[2] : 'L';

    const activeColor = (state.cardColors && state.cardColors[product.id]) || defaultColor;
    const activeImgSrc = (currentSide === 'back' && (activeColor.back_image_url || product.back_image_url))
      ? (activeColor.back_image_url || product.back_image_url)
      : (activeColor.image_url || product.image_url);

    return `
      <article class="product-card hanging-garment-card" data-id="${product.id}" style="--stagger-delay: ${staggerDelay}s">
        <!-- Showroom Clothes Rack Chrome Top Bar -->
        <div class="rack-chrome-rail" title="Studio Showroom Rack"></div>

        <!-- Hanging Header Bar: MSCHF Drop Tag & Dual Front/Back View + 360° Roll Trigger (Clean dedicated top bar) -->
        <div class="hanging-card-header">
          <span class="mschf-drop-tag">${dropBadge}</span>
          <div class="card-header-controls">
            ${hasBackView ? `
              <div class="garment-view-pill" id="view-pill-${product.id}">
                <button type="button" class="view-side-btn ${currentSide === 'front' ? 'active' : ''}" id="view-front-btn-${product.id}" onclick="event.stopPropagation(); flipGarmentSide(${product.id}, 'front', this)">FRONT</button>
                <button type="button" class="view-side-btn ${currentSide === 'back' ? 'active' : ''}" id="view-back-btn-${product.id}" onclick="event.stopPropagation(); flipGarmentSide(${product.id}, 'back', this)">BACK</button>
              </div>
            ` : ''}
            <button type="button" class="roll-hanger-btn" onclick="event.stopPropagation(); triggerGarmentRoll(${product.id})" title="Roll & Spin 360° on Hanger">⟳ ROLL</button>
          </div>
        </div>

        <!-- Individual Studio Showroom Stage with Dedicated Overhead Pendant Lamp & Conical Spotlight -->
        <div class="card-media-wrap hanging-rack-viewport studio-stage" data-lighting="${lighting}">
          <!-- Overhead Suspended Industrial Cone Pendant Lamp (Reference Image 2) -->
          <div class="studio-pendant-fixture">
            <div class="pendant-cable"></div>
            <div class="pendant-cone-shade"></div>
            <div class="pendant-bulb-glow"></div>
          </div>

          <!-- Volumetric Downward Conical Spotlight Beam (Matching each cloth) -->
          <div class="studio-spotlight-cone"></div>

          <!-- Architectural Studio Wall Grid Lines -->
          <div class="studio-wall-grid"></div>

          <!-- Dynamic Floor Pedestal & Contact Shadow -->
          <div class="studio-floor-shadow" id="card-shadow-${product.id}"></div>

          <!-- 3D Standalone Floating/Hanging Garment Rig -->
          <div class="hanging-garment-rig idle-sway" id="garment-rig-${product.id}" data-id="${product.id}">
            <!-- Realistic Metallic & Wood Hanger Hook -->
            <div class="hanger-assembly">
              <div class="hanger-hook-wire"></div>
              <div class="hanger-bar"></div>
            </div>

            <!-- Cloth Fabric Cutout (Background removed, isolated stand-alone) -->
            <div class="garment-cloth-frame">
              <img src="${activeImgSrc}" alt="${product.name}" class="card-img hanging-cloth-img" id="card-img-${product.id}" loading="lazy">
              <div class="card-specular-sheen"></div>
            </div>
          </div>

          <!-- Card Stage Footer: Dynamic Cursor Hint & Quick Action Buttons (Zero collision) -->
          <div class="card-stage-footer">
            <div class="roll-hint-badge">⇄ Put cursor on cloth to roll ${hasBackView ? '• FRONT / BACK to flip' : ''}</div>
            <div class="card-quick-actions">
              <button type="button" class="quick-view-btn" onclick="openProductModal(${product.id})">3D Studio View</button>
              <button type="button" class="quick-add-btn" onclick="quickAddToCart(${product.id})" ${product.stock_quantity <= 0 ? 'disabled' : ''}>
                ${product.stock_quantity <= 0 ? 'Sold Out' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>

        <!-- In-Card Live Color Variant Switcher & Size Selector (Preserves all graphics) -->
        <div class="card-variant-toolbar">
          <div class="card-swatches-row">
            <span class="card-color-label">Color: <strong id="card-color-name-${product.id}">${activeColor.name}</strong></span>
            <div class="card-color-swatches" id="card-swatches-${product.id}">
              ${(product.colors || [defaultColor]).map((c, idx) => `
                <button type="button" 
                  class="card-swatch-dot ${c.name === activeColor.name ? 'active' : ''}" 
                  style="background-color: ${c.hex};" 
                  title="${c.name}" 
                  aria-label="${c.name}"
                  onclick="event.stopPropagation(); changeCardGarmentColor(${product.id}, '${c.hex}', '${c.image_url || product.image_url}', '${c.name.replace(/'/g, "\\'")}', this)">
                </button>
              `).join('')}
            </div>
          </div>

          <div class="card-swatches-row">
            <span class="card-color-label">Fit / Scale:</span>
            <div class="card-size-row">
              ${(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((s, idx) => `
                <button type="button" 
                  class="card-size-pill ${s === defaultSize ? 'active' : ''}" 
                  onclick="event.stopPropagation(); changeCardGarmentSize(${product.id}, '${s}', this)">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card-info">
          <div class="card-category-row">
            <span class="card-category">${product.category}</span>
            <span class="card-rating">★ ${product.rating.toFixed(2)}</span>
          </div>
          <h3 class="card-title">${product.name}</h3>

          <div class="card-price-row">
            <div class="card-prices">
              <span class="card-price">${formatPrice(product.price)}</span>
              ${product.original_price ? `<span class="card-orig-price">${formatPrice(product.original_price)}</span>` : ''}
            </div>
            <span class="stock-tag ${stockClass}">${stockLabel}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Initialize interactive 3D perspective tilt on clothing cards
  init3DClothingTilt();
  initCollectionTabs();
}

// In-Card 3D Front / Back Side Flip
window.flipGarmentSide = function (productId, targetSide, btn) {
  if (!state.cardSides) state.cardSides = {};
  const currentSide = state.cardSides[productId] || 'front';
  if (currentSide === targetSide) return;
  state.cardSides[productId] = targetSide;

  const pill = document.getElementById(`view-pill-${productId}`);
  if (pill) {
    pill.querySelectorAll('.view-side-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const currentColor = (state.cardColors && state.cardColors[productId]) ||
    (product.colors && product.colors[0]) ||
    { name: 'Standard', image_url: product.image_url, back_image_url: product.back_image_url };

  const targetSrc = (targetSide === 'back')
    ? (currentColor.back_image_url || product.back_image_url || currentColor.image_url)
    : (currentColor.image_url || product.image_url);

  const rig = document.getElementById(`garment-rig-${productId}`);
  const img = document.getElementById(`card-img-${productId}`);

  if (rig && img) {
    rig.classList.remove('flipping-180');
    void rig.offsetWidth; // Trigger reflow for re-animation
    rig.classList.add('flipping-180');

    setTimeout(() => {
      img.src = targetSrc;
    }, 220);

    setTimeout(() => {
      rig.classList.remove('flipping-180');
    }, 550);
  }

  playRetroSound('click');
};

// In-Card Live Color Variant Switcher
window.changeCardGarmentColor = function (productId, hex, imageUrl, colorName, el) {
  const product = state.products.find(p => p.id === productId);
  let colorObj = null;
  if (product && product.colors) {
    colorObj = product.colors.find(c => c.name === colorName);
  }
  if (!colorObj) {
    colorObj = { name: colorName, hex, image_url: imageUrl };
  }

  if (!state.cardColors) state.cardColors = {};
  state.cardColors[productId] = colorObj;

  const currentSide = (state.cardSides && state.cardSides[productId]) || 'front';
  const targetSrc = (currentSide === 'back' && colorObj.back_image_url)
    ? colorObj.back_image_url
    : (colorObj.image_url || imageUrl);

  const img = document.getElementById(`card-img-${productId}`);
  const rig = document.getElementById(`garment-rig-${productId}`);
  if (img && targetSrc) {
    if (rig) {
      rig.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      rig.style.transform = 'perspective(1200px) translateY(-5px) scale(0.98)';
      setTimeout(() => {
        if (rig) rig.style.transform = '';
      }, 250);
    }
    img.style.opacity = '0.35';
    img.src = targetSrc;
    img.onload = () => { img.style.opacity = '1'; };
  }

  const label = document.getElementById(`card-color-name-${productId}`);
  if (label) label.textContent = colorName;

  const container = document.getElementById(`card-swatches-${productId}`);
  if (container) {
    container.querySelectorAll('.card-swatch-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
  }

  if (product) {
    product._selectedColor = colorObj;
  }
  playRetroSound('click');
};

// In-Card 3D Size Scale Adjuster
window.changeCardGarmentSize = function (productId, size, el) {
  const card = el.closest('.product-card');
  if (card) {
    card.querySelectorAll('.card-size-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  }

  const scales = {
    'S': 0.92,
    'M': 0.96,
    'L': 1.0,
    'XL': 1.04,
    'XXL': 1.08
  };
  const targetScale = scales[size] || 1.0;
  const img = document.getElementById(`card-img-${productId}`);
  if (img) {
    img.style.transform = `scale(${targetScale})`;
  }

  const prod = state.products.find(p => p.id === productId);
  if (prod) {
    prod._selectedSize = size;
  }
  playRetroSound('click');
};

// MSCHF-Style Collection Tabs Controller
function initCollectionTabs() {
  const tabs = document.querySelectorAll('#collection-tabs .mschf-tab-btn');
  tabs.forEach(tab => {
    if (tab.dataset.bound) return;
    tab.dataset.bound = 'true';
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.category || 'all';
      state.activeCategory = category;
      playRetroSound('click');
      loadAndRenderProducts();
    });
  });
}

window.resetFilters = function () {
  state.activeCategory = 'all';
  state.searchQuery = '';
  state.inStockOnly = false;
  state.sortOption = 'featured';
  elements.globalSearchInput.value = '';
  elements.stockToggle.checked = false;
  elements.sortSelect.value = 'featured';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#collection-tabs .mschf-tab-btn').forEach(p => p.classList.remove('active'));
  const allTab = document.querySelector('#collection-tabs .mschf-tab-btn[data-category="all"]');
  if (allTab) allTab.classList.add('active');
  loadAndRenderProducts();
};

// ============================================================================
// PRODUCT QUICK VIEW / DETAIL MODAL
// ============================================================================
window.openProductModal = function (productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  state.modalSelectedSize = product._selectedSize || (product.sizes && product.sizes.length ? product.sizes[0] : 'M');
  state.modalSelectedColor = product._selectedColor || (product.colors && product.colors.length ? product.colors[0] : { name: 'Standard', hex: '#000', image_url: product.image_url });
  state.modalQuantity = 1;

  // Set Modal Lighting stage matching this garment
  const modalViewport = document.getElementById('modal-rack-viewport');
  if (modalViewport) {
    modalViewport.dataset.lighting = getProductLighting(product);
  }

  elements.modalProductImage.src = state.modalSelectedColor.image_url || product.image_url;
  elements.modalProductImage.alt = product.name;
  elements.modalProductBadge.textContent = product.badge || 'Drop Piece';
  elements.modalProductCategory.textContent = product.category.toUpperCase();
  elements.modalProductTitle.textContent = product.name;
  elements.modalProductRating.textContent = `${product.rating.toFixed(2)} (${product.reviews_count || 84} verified reviews)`;
  elements.modalProductPrice.textContent = formatPrice(product.price);

  if (product.original_price) {
    elements.modalProductOrigPrice.textContent = formatPrice(product.original_price);
    elements.modalProductOrigPrice.style.display = 'inline';
    const percent = Math.round((1 - product.price / product.original_price) * 100);
    elements.modalProductSave.textContent = `SAVE ${percent}%`;
    elements.modalProductSave.style.display = 'inline-block';
  } else {
    elements.modalProductOrigPrice.style.display = 'none';
    elements.modalProductSave.style.display = 'none';
  }

  elements.modalProductDesc.textContent = product.description;

  // Render Sizes in Modal
  elements.modalSizePills.innerHTML = (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((s) => `
    <button class="size-pill ${s === state.modalSelectedSize ? 'active' : ''}" onclick="selectModalSize('${s}', this)">${s}</button>
  `).join('');

  // Render Colors in Modal
  elements.modalSelectedColorName.textContent = state.modalSelectedColor.name;
  elements.modalColorSwatches.innerHTML = (product.colors || [{ name: 'Black', hex: '#111', image_url: product.image_url }]).map((c) => `
    <button class="color-swatch ${c.name === state.modalSelectedColor.name ? 'active' : ''}" 
      style="background-color: ${c.hex};" 
      title="${c.name}" 
      onclick="selectModalColor('${c.name.replace(/'/g, "\\'")}', '${c.hex}', '${c.image_url || product.image_url}', this)">
    </button>
  `).join('');

  // Apply initial scale
  const scales = { 'S': 0.92, 'M': 0.96, 'L': 1.0, 'XL': 1.04, 'XXL': 1.08 };
  elements.modalProductImage.style.transform = `scale(${scales[state.modalSelectedSize] || 1.0})`;

  // Stock Banner
  if (product.stock_quantity > 0) {
    elements.modalStockBanner.className = 'stock-status-banner';
    elements.modalStockText.textContent = `In Stock (${product.stock_quantity} available) • Express Dispatch Ready`;
    elements.modalAddToCartBtn.disabled = false;
    elements.modalAddToCartBtn.textContent = 'Add to Bag';
  } else {
    elements.modalStockBanner.className = 'stock-status-banner out';
    elements.modalStockText.textContent = 'Archive Sold Out • Re-drop notification registered';
    elements.modalAddToCartBtn.disabled = true;
    elements.modalAddToCartBtn.textContent = 'Sold Out';
  }

  // Specifications Accordion
  elements.modalSpecsList.innerHTML = (product.details || [
    'Hand-inspected textile construction',
    'Heavy-gauge hardware reinforcements',
    'Pre-washed for zero dimensional shrinkage'
  ]).map(spec => `<li>${spec}</li>`).join('');

  // Dual Front / Back Perspective Switcher in Modal
  state.modalActiveSide = 'front';
  const sideToggleWrap = document.getElementById('modal-side-toggle-wrap');
  if (sideToggleWrap) {
    if (product.back_image_url) {
      sideToggleWrap.style.display = 'flex';
      const frontBtn = document.getElementById('modal-side-front-btn');
      const backBtn = document.getElementById('modal-side-back-btn');
      if (frontBtn) frontBtn.classList.add('active');
      if (backBtn) backBtn.classList.remove('active');
    } else {
      sideToggleWrap.style.display = 'none';
    }
  }

  elements.modalQtyDisplay.textContent = '1';
  elements.productModalBackdrop.classList.add('open');
  initModal3DHangingStudio();
};

window.selectModalSize = function (size, el) {
  state.modalSelectedSize = size;
  document.querySelectorAll('#modal-size-pills .size-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  const scales = { 'S': 0.92, 'M': 0.96, 'L': 1.0, 'XL': 1.04, 'XXL': 1.08 };
  elements.modalProductImage.style.transform = `scale(${scales[size] || 1.0})`;
  playRetroSound('click');
};

window.setModalGarmentSide = function (side) {
  if (!state.selectedProduct) return;
  state.modalActiveSide = side;

  const frontBtn = document.getElementById('modal-side-front-btn');
  const backBtn = document.getElementById('modal-side-back-btn');
  if (frontBtn && backBtn) {
    if (side === 'front') {
      frontBtn.classList.add('active');
      backBtn.classList.remove('active');
    } else {
      backBtn.classList.add('active');
      frontBtn.classList.remove('active');
    }
  }

  const color = state.modalSelectedColor || {};
  const product = state.selectedProduct;
  const targetSrc = (side === 'back')
    ? (color.back_image_url || product.back_image_url || color.image_url || product.image_url)
    : (color.image_url || product.image_url);

  const rig = elements.modalGarmentRig;
  const img = elements.modalProductImage;

  if (rig && img) {
    rig.classList.remove('flipping-180');
    void rig.offsetWidth;
    rig.classList.add('flipping-180');

    setTimeout(() => {
      img.src = targetSrc;
    }, 220);

    setTimeout(() => {
      rig.classList.remove('flipping-180');
    }, 550);
  }

  playRetroSound('click');
};

window.selectModalColor = function (name, hex, imageUrl, el) {
  let colorObj = null;
  if (state.selectedProduct && state.selectedProduct.colors) {
    colorObj = state.selectedProduct.colors.find(c => c.name === name);
  }
  if (!colorObj) {
    colorObj = { name, hex, image_url: imageUrl };
  }

  state.modalSelectedColor = colorObj;
  elements.modalSelectedColorName.textContent = name;

  const side = state.modalActiveSide || 'front';
  const targetImage = (side === 'back' && colorObj.back_image_url)
    ? colorObj.back_image_url
    : (colorObj.image_url || imageUrl);

  if (targetImage) {
    elements.modalProductImage.style.opacity = '0.3';
    elements.modalProductImage.src = targetImage;
    elements.modalProductImage.onload = () => {
      elements.modalProductImage.style.opacity = '1';
    };
  }
  document.querySelectorAll('#modal-color-swatches .color-swatch').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  playRetroSound('click');
};

// Quantity Counter
elements.modalQtyMinus.addEventListener('click', () => {
  if (state.modalQuantity > 1) {
    state.modalQuantity--;
    elements.modalQtyDisplay.textContent = state.modalQuantity;
  }
});

elements.modalQtyPlus.addEventListener('click', () => {
  if (state.selectedProduct && state.modalQuantity < state.selectedProduct.stock_quantity) {
    state.modalQuantity++;
    elements.modalQtyDisplay.textContent = state.modalQuantity;
  } else {
    showToast('Maximum available stock selected', 'info');
  }
});

// Modal Add to Cart
elements.modalAddToCartBtn.addEventListener('click', () => {
  if (!state.selectedProduct) return;
  addItemToCart(
    state.selectedProduct,
    state.modalSelectedSize,
    state.modalSelectedColor.name,
    state.modalQuantity
  );
  elements.productModalBackdrop.classList.remove('open');
  openCartDrawer();
});

elements.closeProductModalBtn.addEventListener('click', () => {
  elements.productModalBackdrop.classList.remove('open');
});

elements.productModalBackdrop.addEventListener('click', (e) => {
  if (e.target === elements.productModalBackdrop) {
    elements.productModalBackdrop.classList.remove('open');
  }
});

// Quick Add from Card
window.quickAddToCart = function (productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.stock_quantity <= 0) return;

  const defaultSize = (product.sizes && product.sizes.length) ? product.sizes[0] : 'M';
  const defaultColor = (product.colors && product.colors.length) ? product.colors[0].name : 'Standard';

  addItemToCart(product, defaultSize, defaultColor, 1);
  showToast(`Added ${product.name} to bag`, 'success');
};

// ============================================================================
// CART MANAGEMENT & CALCULATIONS
// ============================================================================
function addItemToCart(product, size, color, quantity = 1) {
  const existingIdx = state.cart.findIndex(
    item => item.id === product.id && item.size === size && item.color === color
  );

  if (existingIdx > -1) {
    state.cart[existingIdx].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      color,
      quantity
    });
  }

  saveCart();
  renderCart();
  showToast(`Added to your bag`, 'success');
}

function updateCartQuantity(index, delta) {
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  renderCart();
  showToast('Item removed from bag', 'info');
}

function saveCart() {
  localStorage.setItem('gida_cart', JSON.stringify(state.cart));
}

function renderCart() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartBadge.textContent = totalCount;
  elements.cartTagCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;

  if (state.cart.length === 0) {
    elements.cartItemsList.innerHTML = `
      <div class="empty-cart-view">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
        </svg>
        <p>Your bag is currently empty.</p>
        <button class="btn btn-outline" onclick="closeCartDrawer()">Explore SS-26 Drops</button>
      </div>
    `;
    elements.summarySubtotal.textContent = formatPrice(0);
    elements.summaryDiscountRow.style.display = 'none';
    elements.summaryTotal.textContent = formatPrice(0);
    elements.shippingMeterFill.style.width = '0%';
    elements.shippingMeterText.textContent = 'Add $120.00 to qualify for Free Express Shipping';
    elements.proceedCheckoutBtn.disabled = true;
    return;
  }

  elements.proceedCheckoutBtn.disabled = false;

  // Render Line Items
  elements.cartItemsList.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item-row">
      <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-meta">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-attr">Size: ${item.size} • Color: ${item.color}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-item-remove" onclick="removeCartItem(${idx})" title="Remove item">&times;</button>
        <div class="qty-counter">
          <button class="qty-btn" onclick="updateCartQuantity(${idx}, -1)">&minus;</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity(${idx}, 1)">&plus;</button>
        </div>
      </div>
    </div>
  `).join('');

  // Financial Calculations
  const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  elements.summarySubtotal.textContent = formatPrice(subtotalUSD);

  let discountUSD = 0;
  if (state.promo && state.promo.discountPercent) {
    discountUSD = subtotalUSD * (state.promo.discountPercent / 100);
    elements.summaryDiscountRow.style.display = 'flex';
    elements.summaryDiscount.textContent = `-${formatPrice(discountUSD)}`;
  } else {
    elements.summaryDiscountRow.style.display = 'none';
  }

  const thresholdUSD = 120.0;
  if (subtotalUSD >= thresholdUSD) {
    elements.shippingMeterFill.style.width = '100%';
    elements.shippingMeterText.textContent = '✓ Complimentary Global Express Shipping Unlocked';
    elements.summaryShipping.textContent = 'FREE';
  } else {
    const remaining = thresholdUSD - subtotalUSD;
    const pct = Math.min(100, Math.round((subtotalUSD / thresholdUSD) * 100));
    elements.shippingMeterFill.style.width = `${pct}%`;
    elements.shippingMeterText.textContent = `Add ${formatPrice(remaining)} to qualify for Free Express Shipping`;
    elements.summaryShipping.textContent = formatPrice(18.00);
  }

  const shippingUSD = subtotalUSD >= thresholdUSD ? 0 : 18.00;
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingUSD);
  elements.summaryTotal.textContent = formatPrice(totalUSD);
}

// Promo Code Apply
elements.applyPromoBtn.addEventListener('click', () => {
  const code = elements.promoInput.value.trim().toUpperCase();
  if (!code) return;

  if (code === 'GIDA10') {
    state.promo = { code: 'GIDA10', discountPercent: 10 };
    localStorage.setItem('gida_promo', JSON.stringify(state.promo));
    elements.promoFeedback.className = 'promo-feedback success';
    elements.promoFeedback.textContent = '✓ 10% VIP Syndicate discount activated';
    renderCart();
    showToast('10% Promo Code applied!', 'success');
  } else {
    elements.promoFeedback.className = 'promo-feedback error';
    elements.promoFeedback.textContent = 'Invalid promo code. Try: GIDA10';
  }
});

function openCartDrawer() {
  elements.cartDrawer.classList.add('open');
  elements.cartBackdrop.classList.add('open');
}

function closeCartDrawer() {
  elements.cartDrawer.classList.remove('open');
  elements.cartBackdrop.classList.remove('open');
}

elements.cartToggleBtn.addEventListener('click', openCartDrawer);
elements.closeCartBtn.addEventListener('click', closeCartDrawer);
elements.cartBackdrop.addEventListener('click', closeCartDrawer);

// ============================================================================
// CHECKOUT WIZARD & ORDER CREATION
// ============================================================================
elements.proceedCheckoutBtn.addEventListener('click', () => {
  closeCartDrawer();
  openCheckoutModal();
});

function openCheckoutModal() {
  // Reset Wizard to Step 1
  setCheckoutStep(1);

  const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountUSD = state.promo ? (subtotalUSD * (state.promo.discountPercent / 100)) : 0;
  const shippingUSD = subtotalUSD >= 120 ? 0 : 18.00;
  const totalUSD = subtotalUSD - discountUSD + shippingUSD;

  elements.checkoutChargeTotal.textContent = formatPrice(totalUSD);
  elements.checkoutModalBackdrop.classList.add('open');
}

function setCheckoutStep(step) {
  elements.shippingForm.classList.remove('active');
  elements.paymentPane.classList.remove('active');
  elements.confirmationPane.classList.remove('active');

  elements.step1Indicator.classList.remove('active');
  elements.step2Indicator.classList.remove('active');
  elements.step3Indicator.classList.remove('active');

  if (step === 1) {
    elements.shippingForm.classList.add('active');
    elements.step1Indicator.classList.add('active');
  } else if (step === 2) {
    elements.paymentPane.classList.add('active');
    elements.step1Indicator.classList.add('active');
    elements.step2Indicator.classList.add('active');
  } else if (step === 3) {
    elements.confirmationPane.classList.add('active');
    elements.step1Indicator.classList.add('active');
    elements.step2Indicator.classList.add('active');
    elements.step3Indicator.classList.add('active');
  }
}

// Shipping form submit -> proceed to step 2
elements.shippingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.checkoutData.shipping = {
    name: document.getElementById('ship-name').value,
    email: document.getElementById('ship-email').value,
    address: document.getElementById('ship-address').value,
    city: document.getElementById('ship-city').value,
    postal: document.getElementById('ship-postal').value,
    country: document.getElementById('ship-country').value
  };

  elements.cardHolderPreview.textContent = state.checkoutData.shipping.name.toUpperCase();
  setCheckoutStep(2);
});

elements.backToCartBtn.addEventListener('click', () => {
  elements.checkoutModalBackdrop.classList.remove('open');
  openCartDrawer();
});

elements.backToShippingBtn.addEventListener('click', () => {
  setCheckoutStep(1);
});

// Payment Method selection tabs
document.querySelectorAll('.pay-method-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    document.querySelectorAll('.pay-method-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.checkoutData.paymentMethod = tab.textContent;
  });
});

// Final Order Submission
elements.submitOrderBtn.addEventListener('click', async () => {
  elements.submitOrderBtn.disabled = true;
  elements.submitOrderBtn.innerHTML = `<span>Processing Order...</span>`;

  try {
    const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountUSD = state.promo ? (subtotalUSD * (state.promo.discountPercent / 100)) : 0;
    const shippingUSD = subtotalUSD >= 120 ? 0 : 18.00;
    const totalUSD = subtotalUSD - discountUSD + shippingUSD;

    const orderPayload = {
      customer_name: state.checkoutData.shipping.name,
      customer_email: state.checkoutData.shipping.email,
      shipping_address: state.checkoutData.shipping.address,
      city: state.checkoutData.shipping.city,
      postal_code: state.checkoutData.shipping.postal,
      country: state.checkoutData.shipping.country,
      total_amount: totalUSD,
      discount_amount: discountUSD,
      currency: state.currency,
      payment_method: state.checkoutData.paymentMethod,
      items: state.cart
    };

    const orderResult = await apiCreateOrder(orderPayload);
    state.checkoutData.lastOrder = orderResult;

    // Display confirmation receipt
    elements.receiptOrderId.textContent = orderResult.order_id;
    elements.receiptCustomerName.textContent = orderResult.customer_name;
    elements.receiptCustomerCity.textContent = `${state.checkoutData.shipping.city}, ${state.checkoutData.shipping.country}`;
    elements.receiptTotalBilled.textContent = formatPrice(totalUSD);

    elements.receiptItemsContainer.innerHTML = state.cart.map(item => `
      <div class="receipt-line-item">
        <span>${item.quantity}x ${item.name} (${item.size})</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');

    // Clear cart
    state.cart = [];
    saveCart();
    renderCart();

    // Reload catalog to reflect decremented stock
    loadAndRenderProducts();

    setCheckoutStep(3);
    showToast(`Order ${orderResult.order_id} confirmed!`, 'success');
  } catch (err) {
    console.error(err);
    showToast(`Order failed: ${err.message}`, 'error');
  } finally {
    elements.submitOrderBtn.disabled = false;
    elements.submitOrderBtn.innerHTML = `<span>Authorize & Confirm Order</span>`;
  }
});

elements.closeCheckoutModalBtn.addEventListener('click', () => {
  elements.checkoutModalBackdrop.classList.remove('open');
});

elements.finishCheckoutBtn.addEventListener('click', () => {
  elements.checkoutModalBackdrop.classList.remove('open');
});

elements.printReceiptBtn.addEventListener('click', () => {
  window.print();
});

// ============================================================================
// ADMIN OPERATIONS MODAL
// ============================================================================
elements.adminModalBtn.addEventListener('click', () => {
  openAdminModal();
});

elements.closeAdminModalBtn.addEventListener('click', () => {
  elements.adminModalBackdrop.classList.remove('open');
});

elements.adminModalBackdrop.addEventListener('click', (e) => {
  if (e.target === elements.adminModalBackdrop) {
    elements.adminModalBackdrop.classList.remove('open');
  }
});

// Tab Switcher
elements.adminTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    elements.adminTabs.forEach(t => t.classList.remove('active'));
    elements.adminTabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById(`admin-tab-${target}`).classList.add('active');

    if (target === 'analytics') loadAdminStats();
    if (target === 'inventory') loadAdminInventory();
    if (target === 'orders') loadAdminOrders();
  });
});

async function openAdminModal() {
  elements.adminModalBackdrop.classList.add('open');
  await loadAdminStats();
  await loadAdminInventory();
}

async function loadAdminStats() {
  try {
    const stats = await apiGetAdminStats();
    elements.statRevenue.textContent = formatPrice(stats.total_revenue);
    elements.statOrders.textContent = stats.total_orders;
    elements.statProducts.textContent = stats.total_products;
    elements.statLowStock.textContent = stats.low_stock_count;
  } catch (err) {
    console.error(err);
  }
}

async function loadAdminInventory() {
  try {
    const products = await apiGetProducts();
    elements.adminInventoryTbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${p.image_url}" style="width:36px;height:36px;border-radius:4px;object-fit:cover;">
            <strong>${p.name}</strong>
          </div>
        </td>
        <td>${p.category}</td>
        <td>
          <input type="number" step="0.01" value="${p.price}" style="width:80px;background:#151922;border:1px solid #1e2430;padding:4px;border-radius:4px;" onchange="savePrice(${p.id}, this.value)">
        </td>
        <td>
          <input type="number" value="${p.stock_quantity}" style="width:70px;background:#151922;border:1px solid #1e2430;padding:4px;border-radius:4px;" onchange="saveStock(${p.id}, this.value)">
        </td>
        <td>
          <span class="status-badge ${p.stock_quantity > 0 ? 'shipped' : 'delivered'}">
            ${p.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;" onclick="refreshSinglePiece(${p.id})">Save</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.saveStock = async function (id, val) {
  await apiUpdateProduct(id, { stock_quantity: parseInt(val, 10) });
  showToast('Inventory stock updated', 'success');
  loadAndRenderProducts();
};

window.savePrice = async function (id, val) {
  await apiUpdateProduct(id, { price: parseFloat(val) });
  showToast('Retail price updated', 'success');
  loadAndRenderProducts();
};

window.refreshSinglePiece = function (id) {
  showToast('Product settings committed to database', 'success');
};

async function loadAdminOrders() {
  try {
    const orders = await apiGetAdminOrders();
    if (!orders.length) {
      elements.adminOrdersTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;">No customer orders found in database.</td></tr>`;
      return;
    }

    elements.adminOrdersTbody.innerHTML = orders.map(o => `
      <tr>
        <td><code>${o.id}</code></td>
        <td>
          <div>${o.customer_name}</div>
          <div style="font-size:0.7rem;color:#64748b;">${o.customer_email}</div>
        </td>
        <td>
          ${o.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}
        </td>
        <td><strong>${formatPrice(o.total_amount)}</strong></td>
        <td>${o.city}, ${o.country}</td>
        <td>
          <span class="status-badge ${o.status.toLowerCase()}">${o.status}</span>
        </td>
        <td>
          <select class="status-select" onchange="changeOrderStatus('${o.id}', this.value)">
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.changeOrderStatus = async function (orderId, newStatus) {
  try {
    await apiUpdateOrderStatus(orderId, newStatus);
    showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
    loadAdminOrders();
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

// Add New Product Form Submit
elements.adminNewProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('new-prod-name').value;
  const category = document.getElementById('new-prod-category').value;
  const price = document.getElementById('new-prod-price').value;
  const stock = document.getElementById('new-prod-stock').value;
  const badge = document.getElementById('new-prod-badge').value;
  const desc = document.getElementById('new-prod-desc').value;

  try {
    await apiCreateProduct({
      name,
      category,
      price,
      stock_quantity: stock,
      badge,
      description: desc,
      image_url: '/images/hoodie.jpg'
    });

    showToast(`Added ${name} to database!`, 'success');
    elements.adminNewProductForm.reset();
    loadAndRenderProducts();
    loadAdminInventory();
  } catch (err) {
    showToast('Error adding product: ' + err.message, 'error');
  }
});

// ============================================================================
// NEWSLETTER & FOOTER
// ============================================================================
elements.newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = elements.newsletterEmail.value.trim();
  if (!email) return;

  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    elements.newsletterMessage.textContent = data.message;
    elements.newsletterEmail.value = '';
    showToast('Welcome to the VIP syndicate!', 'success');
  } catch (err) {
    elements.newsletterMessage.textContent = 'Thank you for joining!';
  }
});

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================

// Filter Pills
elements.categoryPills.addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;

  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');

  state.activeCategory = pill.dataset.category;
  loadAndRenderProducts();
});

// Sort Dropdown
elements.sortSelect.addEventListener('change', (e) => {
  state.sortOption = e.target.value;
  loadAndRenderProducts();
});

// In-Stock Toggle
elements.stockToggle.addEventListener('change', (e) => {
  state.inStockOnly = e.target.checked;
  loadAndRenderProducts();
});

// Search Input
elements.globalSearchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.trim();
  elements.searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
  loadAndRenderProducts();
});

elements.searchClearBtn.addEventListener('click', () => {
  elements.globalSearchInput.value = '';
  state.searchQuery = '';
  elements.searchClearBtn.style.display = 'none';
  loadAndRenderProducts();
});

// Search Trigger Box & Keyboard Shortcut (⌘K / Ctrl+K)
if (elements.searchTriggerBox) {
  elements.searchTriggerBox.addEventListener('click', () => {
    elements.searchExpandable.classList.toggle('active');
    if (elements.searchExpandable.classList.contains('active')) {
      elements.globalSearchInput.focus();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (elements.searchExpandable) {
      elements.searchExpandable.classList.add('active');
      elements.globalSearchInput.focus();
    }
  }
  if (e.key === 'Escape' && elements.searchExpandable) {
    elements.searchExpandable.classList.remove('active');
  }
});

// Hamburger Menu Action
if (elements.hamburgerToggleBtn) {
  elements.hamburgerToggleBtn.addEventListener('click', () => {
    const catalog = document.getElementById('catalog-section');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    showToast('Browsing full Gida archive catalog', 'info');
  });
}

// Currency Switcher
elements.currencySelect.value = state.currency;
elements.currencySelect.addEventListener('change', (e) => {
  state.currency = e.target.value;
  localStorage.setItem('gida_currency', state.currency);
  renderProductsGrid(state.products);
  renderCart();
  showToast(`Currency set to ${state.currency}`, 'info');
});

// Theme Manager (Dark / Light)
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gida_theme', theme);
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.setAttribute('title', `Active: ${theme.toUpperCase()} Mode (Click to toggle)`);
  }
}

if (elements.themeToggleBtn) {
  elements.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Luxury' : 'Minimal Light'} theme`, 'info');
  });
}

// ============================================================================
// GLASSMORPHISM MANAGER (FROSTED GLASS REFRACTION & AMBIENT ATMOSPHERE)
// ============================================================================
function applyGlassmorphism(enabled, notify = true) {
  state.glassmorphism = enabled;
  if (enabled) {
    document.documentElement.setAttribute('data-glassmorphism', 'active');
  } else {
    document.documentElement.removeAttribute('data-glassmorphism');
  }
  localStorage.setItem('gida_glassmorphism', enabled ? 'true' : 'false');

  // Header glass button sync
  const glassToggle = document.getElementById('glass-toggle-btn');
  if (glassToggle) {
    glassToggle.classList.toggle('active', enabled);
    glassToggle.setAttribute('title', `Glassmorphism: ${enabled ? 'Active' : 'Off'} (Click to toggle comparison)`);
  }

  // Floating dock pill sync
  const dockPill = document.getElementById('glass-dock-pill');
  const dockStatus = document.getElementById('glass-dock-status');
  if (dockPill && dockStatus) {
    dockPill.classList.toggle('active', enabled);
    dockStatus.textContent = enabled ? 'ACTIVE' : 'OFF';
  }

  if (notify) {
    showToast(
      enabled
        ? '✨ Glassmorphism Active: Frosted glass layers & ambient atmospheric light mesh enabled'
        : 'Solid Theme Restored: Standard opaque design active',
      'info'
    );
  }
}

function toggleGlassMode() {
  applyGlassmorphism(!state.glassmorphism, true);
}

// Bind Header & Floating Dock Toggle Buttons
const headerGlassBtn = document.getElementById('glass-toggle-btn');
if (headerGlassBtn) {
  headerGlassBtn.addEventListener('click', toggleGlassMode);
}

const dockSwitchBtn = document.getElementById('glass-dock-switch-btn');
if (dockSwitchBtn) {
  dockSwitchBtn.addEventListener('click', toggleGlassMode);
}

// Wishlist Trigger
elements.wishlistCount.textContent = state.wishlist.length;
elements.wishlistToggleBtn.addEventListener('click', () => {
  showToast(`You have ${state.wishlist.length} items in your private wishlist`, 'info');
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  applyGlassmorphism(state.glassmorphism, false);
  loadAndRenderProducts();
  renderCart();
  initCrtArcade();
});

// ============================================================================
// RETRO 8-BIT AUDIO SYNTHESIZER (Web Audio API)
// ============================================================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { });
  }
  return audioCtx;
}

function playRetroSound(type = 'click') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'start') {
      // 8-bit rising triumph chime: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } else if (type === 'warp') {
      // Fast sci-fi warp down tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'boot') {
      // CRT boot power on buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.22);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'power-off') {
      // Power down tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else {
      // Simple crisp mechanical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (err) {
    // Gracefully handle any browser audio policy restrictions
  }
}

// ============================================================================
// AWGE RETRO CRT MONITOR CONTROLLER
// ============================================================================
function initCrtArcade() {
  const crtOverlay = document.getElementById('crt-overlay-wrapper');
  if (!crtOverlay) return;

  const screenTube = document.getElementById('crt-screen-tube');
  const sceneStart = document.getElementById('crt-scene-start');
  const sceneMenu = document.getElementById('crt-scene-menu');
  const pressStartBtn = document.getElementById('crt-press-start-btn');
  const enterStoreBtn = document.getElementById('crt-enter-store-btn');
  const skipBtn = document.getElementById('crt-skip-btn');
  const reopenBtn = document.getElementById('crt-reopen-btn');
  const powerBtn = document.getElementById('monitor-power-btn');
  const powerLed = document.getElementById('monitor-power-led');
  const quickEnterLink = document.getElementById('crt-quick-enter-link');

  let isPoweredOn = true;

  // Transition from Title Screen to Retro Desktop Menu (AWGE flow)
  function startToMenu() {
    if (!isPoweredOn) return;
    playRetroSound('start');

    // Tube flash effect
    if (screenTube) {
      screenTube.style.filter = 'brightness(2.5) contrast(1.4)';
      setTimeout(() => {
        screenTube.style.filter = '';
      }, 120);
    }

    if (sceneStart && sceneMenu) {
      sceneStart.classList.remove('active');
      sceneMenu.classList.add('active');
    }
  }

  // Dismiss CRT and enter modern 3D storefront
  function dismissCrtToStore(targetId = 'catalog-section') {
    playRetroSound('warp');
    crtOverlay.classList.add('dismissed');

    setTimeout(() => {
      const target = document.getElementById(targetId) || document.getElementById('catalog-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Gida Archive unlocked. Hover clothing pieces for 3D tilt perspective.', 'info');
    }, 280);
  }

  // Re-open CRT arcade from storefront header
  function reopenCrt() {
    crtOverlay.classList.remove('dismissed');
    playRetroSound('boot');
    if (sceneStart && sceneMenu) {
      sceneStart.classList.add('active');
      sceneMenu.classList.remove('active');
    }
  }

  // Hook up Start Button
  if (pressStartBtn) {
    pressStartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startToMenu();
    });
  }

  // Clicking anywhere on start scene also triggers start
  if (sceneStart) {
    sceneStart.addEventListener('click', (e) => {
      if (e.target.closest('#monitor-power-btn') || e.target.closest('#crt-skip-btn')) return;
      startToMenu();
    });
  }

  // Hook up Enter Store Button & Skip Button
  if (enterStoreBtn) {
    enterStoreBtn.addEventListener('click', () => dismissCrtToStore('catalog-section'));
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', () => dismissCrtToStore('catalog-section'));
  }
  if (quickEnterLink) {
    quickEnterLink.addEventListener('click', (e) => {
      e.preventDefault();
      dismissCrtToStore('philosophy-section');
    });
  }

  // Hook up CRT Reopen Button
  if (reopenBtn) {
    reopenBtn.addEventListener('click', reopenCrt);
  }

  // Menu Icons Navigation
  const menuButtons = [
    { id: 'crt-menu-shop-btn', target: 'catalog-section', label: 'Loading 3D Garment Rack...' },
    { id: 'crt-menu-lookbook-btn', target: 'hero-section', label: 'Opening Atelier Archive Lookbook...' },
    { id: 'crt-menu-heritage-btn', target: 'hero-section', label: 'Hausa Heritage: Gida Means Home.' },
    { id: 'crt-menu-about-btn', target: 'philosophy-section', label: 'Reading Atelier Philosophy...' },
    { id: 'crt-menu-contact-btn', target: 'newsletter-section', label: 'Opening Archive Pager & Dispatch...' },
    { id: 'crt-menu-media-btn', target: 'catalog-section', label: 'Playing Visual Archive Reels...' }
  ];

  menuButtons.forEach(item => {
    const btn = document.getElementById(item.id);
    if (btn) {
      btn.addEventListener('click', () => {
        playRetroSound('click');
        showToast(item.label, 'info');
        dismissCrtToStore(item.target);
      });
    }
  });

  // Chassis I/O Power Button
  if (powerBtn) {
    powerBtn.addEventListener('click', () => {
      isPoweredOn = !isPoweredOn;
      if (isPoweredOn) {
        playRetroSound('boot');
        if (screenTube) screenTube.style.opacity = '1';
        if (powerLed) {
          powerLed.style.background = '#10b981';
          powerLed.style.boxShadow = '0 0 8px #10b981';
        }
      } else {
        playRetroSound('power-off');
        if (screenTube) screenTube.style.opacity = '0.04';
        if (powerLed) {
          powerLed.style.background = '#333';
          powerLed.style.boxShadow = 'none';
        }
      }
    });
  }

  // Keyboard shortcut listener (Enter, Space to start; Escape to dismiss)
  document.addEventListener('keydown', (e) => {
    if (crtOverlay.classList.contains('dismissed')) return;

    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      if (sceneStart && sceneStart.classList.contains('active')) {
        startToMenu();
      } else if (sceneMenu && sceneMenu.classList.contains('active')) {
        dismissCrtToStore('catalog-section');
      }
    } else if (e.key === 'Escape') {
      dismissCrtToStore('catalog-section');
    }
  });
}

// ============================================================================
// INTERACTIVE 3D HANGING CLOTHES RACK & ROLLING PHYSICS
// ============================================================================
window.triggerGarmentRoll = function (productId) {
  const rig = document.getElementById(`garment-rig-${productId}`);
  if (!rig) return;

  playRetroSound('warp');
  rig.classList.remove('idle-sway');
  rig.classList.remove('spinning-360');
  void rig.offsetWidth; // Force CSS reflow
  rig.classList.add('spinning-360');

  const prod = state.products.find(p => p.id === productId);
  if (prod) {
    showToast(`Rolling "${prod.name}" 360° on atelier rack`, 'info');
  }

  setTimeout(() => {
    rig.classList.remove('spinning-360');
    rig.classList.add('idle-sway');
  }, 1300);
};

function init3DClothingTilt() {
  const cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;

  cards.forEach(card => {
    if (card.dataset.tiltInitialized) return;
    card.dataset.tiltInitialized = 'true';

    const rig = card.querySelector('.hanging-garment-rig');
    const sheen = card.querySelector('.card-specular-sheen');
    const shadow = card.querySelector('.studio-floor-shadow');
    const spotlight = card.querySelector('.studio-spotlight-cone');
    const hook = card.querySelector('.hanger-assembly');

    if (!rig) return;

    let isDragging = false;
    let dragStartX = 0;
    let currentRoll = 0;

    // "let it role as you put cursor on it"
    card.addEventListener('mouseenter', () => {
      rig.classList.remove('idle-sway');
      rig.style.transition = 'transform 0.12s ease-out';
    });

    card.addEventListener('mousemove', (e) => {
      if (isDragging) return;

      rig.classList.remove('idle-sway');

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized coordinates (-1.0 to +1.0)
      const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
      const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

      // Dynamic 3D rolling physics on cursor
      const rollY = normX * 54; // Smooth horizontal roll up to ±54 degrees
      const swayZ = normX * 7.5; // Natural pendulum sway
      const pitchX = normY * -9; // Subtle vertical cloth pitch
      const liftY = -6; // Hover levitation

      rig.style.transform = `perspective(1200px) translateY(${liftY}px) rotateY(${rollY.toFixed(1)}deg) rotateZ(${swayZ.toFixed(1)}deg) rotateX(${pitchX.toFixed(1)}deg)`;

      if (hook) {
        hook.style.transform = `rotateZ(${(-swayZ * 0.45).toFixed(1)}deg)`;
      }

      // Dynamic floor shadow compression & displacement
      if (shadow) {
        const shadowScale = Math.max(0.46, Math.cos((rollY * Math.PI) / 180));
        shadow.style.transform = `translateX(${(normX * 9).toFixed(1)}px) scaleX(${shadowScale.toFixed(2)})`;
      }

      // Volumetric spotlight cone tilt towards cursor for realistic 3D lighting
      if (spotlight) {
        spotlight.style.transform = `translateX(-50%) perspective(800px) rotateY(${(normX * 5).toFixed(1)}deg)`;
      }

      // Moving specular highlight across fabric texture
      if (sheen) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        sheen.style.background = `radial-gradient(circle at ${percentX.toFixed(1)}% ${percentY.toFixed(1)}%, rgba(255,255,255,0.45) 0%, transparent 62%)`;
        sheen.style.opacity = '1';
      }
    });

    // Mouse Leave: Settle back onto clothes rack
    card.addEventListener('mouseleave', () => {
      if (isDragging) return;

      rig.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      rig.style.transform = 'perspective(1200px) translateY(0px) rotateY(0deg) rotateZ(0deg) rotateX(0deg)';

      if (hook) hook.style.transform = 'rotateZ(0deg)';
      if (shadow) shadow.style.transform = 'translateX(0px) scaleX(1)';
      if (spotlight) spotlight.style.transform = 'translateX(-50%)';
      if (sheen) sheen.style.opacity = '0';

      setTimeout(() => {
        rig.style.transition = '';
        if (!card.matches(':hover') && !isDragging) {
          rig.classList.add('idle-sway');
        }
      }, 450);
    });

    // Interactive Drag-to-Roll (Click & drag sideways to roll the hanging clothes 360°)
    const handleDragStart = (clientX) => {
      isDragging = true;
      dragStartX = clientX;
      rig.classList.remove('idle-sway');
      rig.style.transition = 'none';
    };

    const handleDragMove = (clientX) => {
      if (!isDragging) return;
      const deltaX = clientX - dragStartX;
      currentRoll += deltaX * 0.85;
      dragStartX = clientX;

      const pendulumSway = Math.sin((currentRoll * Math.PI) / 180) * 8;
      rig.style.transform = `perspective(1200px) translateY(-6px) rotateY(${currentRoll.toFixed(1)}deg) rotateZ(${pendulumSway.toFixed(1)}deg)`;

      if (shadow) {
        const shadowScale = Math.max(0.42, Math.abs(Math.cos((currentRoll * Math.PI) / 180)));
        shadow.style.transform = `scaleX(${shadowScale.toFixed(2)})`;
      }

      if (sheen) {
        sheen.style.opacity = '0.75';
        sheen.style.background = `linear-gradient(${currentRoll}deg, rgba(255,255,255,0.35) 0%, transparent 68%)`;
      }
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      rig.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      playRetroSound('click');

      // Snap gently back to clean front face
      rig.style.transform = 'perspective(1200px) translateY(0px) rotateY(0deg) rotateZ(0deg)';
      if (shadow) shadow.style.transform = 'translateX(0px) scaleX(1)';
      if (sheen) sheen.style.opacity = '0';

      setTimeout(() => {
        rig.style.transition = '';
        if (!card.matches(':hover')) {
          rig.classList.add('idle-sway');
        }
      }, 600);
    };

    rig.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      handleDragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleDragMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) handleDragEnd();
    });

    // Touch support for trackpads & touch screens
    rig.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && !e.target.closest('button')) {
        handleDragStart(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        handleDragMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) handleDragEnd();
    });
  });
}

// ============================================================================
// QUICK VIEW MODAL 3D HANGING RACK STUDIO
// ============================================================================
let modalRollAngle = 0;
let modalSwayActive = true;
let modalStudioInitialized = false;

function initModal3DHangingStudio() {
  const modalViewport = document.getElementById('modal-rack-viewport');
  const modalRig = document.getElementById('modal-garment-rig');
  const rollLeftBtn = document.getElementById('modal-roll-left-btn');
  const rollRightBtn = document.getElementById('modal-roll-right-btn');
  const swayToggleBtn = document.getElementById('modal-sway-toggle-btn');
  const sheen = document.getElementById('modal-specular-sheen');
  const modalShadow = document.getElementById('modal-floor-shadow');
  const modalSpotlight = modalViewport ? modalViewport.querySelector('.studio-spotlight-cone') : null;

  if (!modalRig || !modalViewport) return;

  modalRollAngle = 0;
  modalRig.style.transform = 'perspective(1400px) rotateY(0deg) rotateZ(0deg)';

  // Modal cursor-reactive 3D rolling: "let it role as you put cursor on it"
  modalViewport.addEventListener('mousemove', (e) => {
    if (modalDragging) return;

    modalRig.classList.remove('idle-sway');

    const rect = modalViewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

    const rollY = normX * 56;
    const swayZ = normX * 8;
    const pitchX = normY * -9;

    modalRig.style.transform = `perspective(1400px) translateY(-6px) rotateY(${rollY.toFixed(1)}deg) rotateZ(${swayZ.toFixed(1)}deg) rotateX(${pitchX.toFixed(1)}deg)`;

    if (modalShadow) {
      const shadowScale = Math.max(0.45, Math.cos((rollY * Math.PI) / 180));
      modalShadow.style.transform = `translateX(${(normX * 10).toFixed(1)}px) scaleX(${shadowScale.toFixed(2)})`;
    }

    if (modalSpotlight) {
      modalSpotlight.style.transform = `translateX(-50%) perspective(800px) rotateY(${(normX * 6).toFixed(1)}deg)`;
    }

    if (sheen) {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      sheen.style.background = `radial-gradient(circle at ${percentX.toFixed(1)}% ${percentY.toFixed(1)}%, rgba(255,255,255,0.48) 0%, transparent 60%)`;
      sheen.style.opacity = '1';
    }
  });

  modalViewport.addEventListener('mouseleave', () => {
    if (modalDragging) return;
    modalRig.style.transition = 'transform 0.4s ease';
    modalRig.style.transform = 'perspective(1400px) translateY(0px) rotateY(0deg) rotateZ(0deg)';

    if (modalShadow) modalShadow.style.transform = 'translateX(0px) scaleX(1)';
    if (modalSpotlight) modalSpotlight.style.transform = 'translateX(-50%)';
    if (sheen) sheen.style.opacity = '0';

    setTimeout(() => {
      modalRig.style.transition = '';
      if (modalSwayActive) {
        modalRig.classList.add('idle-sway');
      }
    }, 400);
  });

  if (modalStudioInitialized) return;
  modalStudioInitialized = true;

  if (rollLeftBtn) {
    rollLeftBtn.addEventListener('click', () => {
      playRetroSound('warp');
      modalRollAngle -= 45;
      modalRig.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      modalRig.style.transform = `perspective(1400px) rotateY(${modalRollAngle}deg) rotateZ(-3deg)`;
      showToast(`Hanging rack view: ${modalRollAngle}° rotation`, 'info');
      setTimeout(() => { modalRig.style.transition = ''; }, 450);
    });
  }

  if (rollRightBtn) {
    rollRightBtn.addEventListener('click', () => {
      playRetroSound('warp');
      modalRollAngle += 45;
      modalRig.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      modalRig.style.transform = `perspective(1400px) rotateY(${modalRollAngle}deg) rotateZ(3deg)`;
      showToast(`Hanging rack view: ${modalRollAngle}° rotation`, 'info');
      setTimeout(() => { modalRig.style.transition = ''; }, 450);
    });
  }

  if (swayToggleBtn) {
    swayToggleBtn.addEventListener('click', () => {
      modalSwayActive = !modalSwayActive;
      swayToggleBtn.classList.toggle('active', modalSwayActive);
      playRetroSound('click');
      if (modalSwayActive) {
        modalRig.classList.add('idle-sway');
        showToast('Atelier rack pendulum physics enabled', 'info');
      } else {
        modalRig.classList.remove('idle-sway');
        modalRig.style.transform = `perspective(1400px) rotateY(${modalRollAngle}deg)`;
        showToast('Hanging sway paused', 'info');
      }
    });
  }

  // Drag-to-roll in modal
  let modalDragging = false;
  let modalStartX = 0;

  modalRig.addEventListener('mousedown', (e) => {
    modalDragging = true;
    modalStartX = e.clientX;
    modalRig.classList.remove('idle-sway');
    modalRig.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!modalDragging) return;
    const delta = e.clientX - modalStartX;
    modalRollAngle += delta * 0.9;
    modalStartX = e.clientX;
    const swayZ = Math.sin((modalRollAngle * Math.PI) / 180) * 7;
    modalRig.style.transform = `perspective(1400px) rotateY(${modalRollAngle.toFixed(1)}deg) rotateZ(${swayZ.toFixed(1)}deg)`;

    if (sheen) {
      sheen.style.opacity = '0.6';
      sheen.style.background = `linear-gradient(${modalRollAngle}deg, rgba(255,255,255,0.35) 0%, transparent 60%)`;
    }
  });

  window.addEventListener('mouseup', () => {
    if (!modalDragging) return;
    modalDragging = false;
    modalRig.style.transition = 'transform 0.4s ease';
    if (sheen) sheen.style.opacity = '0';
    if (modalSwayActive) {
      setTimeout(() => {
        modalRig.style.transition = '';
        modalRig.classList.add('idle-sway');
      }, 400);
    }
  });
}
