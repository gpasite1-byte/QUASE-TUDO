/**
 * QUASE TUDO - COMÉRCIO E PRESTAÇÃO DE SERVIÇOS, LDA
 * Interactive Logic, Menu Filtering, Shopping Cart & WhatsApp Checkout
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Active Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetLink.classList.add('active');
        } else {
          targetLink.classList.remove('active');
        }
      }
    });
  });

  // ==========================================
  // CARDÁPIO / MENU FILTER (SABOR GAÚCHO & BAR)
  // ==========================================
  const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuItemCards = document.querySelectorAll('.menu-item-card');

  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      menuTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      menuItemCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================
  // MINI MERCADO PRODUCTS FILTER
  // ==========================================
  const marketTabBtns = document.querySelectorAll('.market-tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  marketTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      marketTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-category');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================
  // SHOPPING CART SYSTEM & WHATSAPP CHECKOUT
  // ==========================================
  let cart = [];
  try {
    const savedCart = localStorage.getItem('quasetudo_cart');
    if (savedCart) cart = JSON.parse(savedCart);
  } catch (e) {
    cart = [];
  }

  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartTotalVal = document.getElementById('cart-total-val');
  const cartBadge = document.getElementById('cart-badge');
  const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');

  function saveCart() {
    try {
      localStorage.setItem('quasetudo_cart', JSON.stringify(cart));
    } catch (e) {}
    renderCart();
  }

  function formatKz(val) {
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val) + ' Kz';
  }

  function openCart() {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function addToCart(id, name, price, category) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price: parseFloat(price), category, qty: 1 });
    }
    saveCart();
    showToast(`"${name}" adicionado ao pedido!`);
  }

  function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
  }

  function renderCart() {
    if (!cartItemsList) return;

    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    if (cartBadge) {
      cartBadge.textContent = totalQty;
      cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <svg style="width: 48px; height: 48px; margin-bottom: 0.8rem; color: #cbd5e1;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>O seu pedido está vazio no momento.</p>
          <small>Adicione itens do nosso cardápio ou minimercado!</small>
        </div>
      `;
      if (cartTotalVal) cartTotalVal.textContent = '0,00 Kz';
      if (checkoutWhatsappBtn) checkoutWhatsappBtn.setAttribute('disabled', 'true');
      return;
    }

    if (checkoutWhatsappBtn) checkoutWhatsappBtn.removeAttribute('disabled');

    let total = 0;
    let html = '';

    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">${formatKz(item.price)} cada</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn btn-dec" data-id="${item.id}">-</button>
            <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.qty}</span>
            <button class="qty-btn btn-inc" data-id="${item.id}">+</button>
          </div>
        </div>
      `;
    });

    cartItemsList.innerHTML = html;
    if (cartTotalVal) cartTotalVal.textContent = formatKz(total);

    // Bind quantity buttons
    cartItemsList.querySelectorAll('.btn-dec').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), -1));
    });
    cartItemsList.querySelectorAll('.btn-inc').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), 1));
    });
  }

  // Bind Add Buttons (Menu & Products)
  document.querySelectorAll('.btn-add-item, .btn-add-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const category = btn.getAttribute('data-category') || 'Geral';
      addToCart(id, name, price, category);
    });
  });

  // WhatsApp Checkout Generator
  if (checkoutWhatsappBtn) {
    checkoutWhatsappBtn.addEventListener('click', () => {
      if (cart.length === 0) return;

      const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      let message = `🛒 *NOVO PEDIDO - QUASE TUDO*\n`;
      message += `------------------------------------\n`;
      
      cart.forEach(item => {
        message += `▪ *${item.qty}x* ${item.name} (${formatKz(item.price)}) = ${formatKz(item.price * item.qty)}\n`;
      });

      message += `------------------------------------\n`;
      message += `💰 *TOTAL DO PEDIDO:* ${formatKz(total)}\n\n`;
      message += `📍 *Endereço de Entrega / Local:* \n`;
      message += `👤 *Nome do Cliente:* \n`;
      message += `📞 *Contacto Adicional:* \n\n`;
      message += `Gostaria de confirmar a disponibilidade e o prazo de entrega. Obrigado!`;

      const encodedMsg = encodeURIComponent(message);
      // Primary business WhatsApp: 244929705873 (from official signage & contacts)
      const whatsappUrl = `https://wa.me/244929705873?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // Toast Notification Function
  function showToast(text) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg style="width: 18px; height: 18px; color: #76b83b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${text}</span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initial render
  renderCart();

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('form-name')?.value || '';
      const tel = document.getElementById('form-phone')?.value || '';
      const assunto = document.getElementById('form-subject')?.value || 'Informação';
      const msg = document.getElementById('form-message')?.value || '';

      const fullText = `*MENSAGEM DO SITE QUASE TUDO*\n\n*Nome:* ${nome}\n*Telefone:* ${tel}\n*Assunto:* ${assunto}\n*Mensagem:* ${msg}`;
      const url = `https://wa.me/244929705731?text=${encodeURIComponent(fullText)}`;
      window.open(url, '_blank');
      showToast('Mensagem pronta para envio via WhatsApp!');
      contactForm.reset();
    });
  }
});
