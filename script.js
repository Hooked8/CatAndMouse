(() => {
  const products = window.ACHILLES_PRODUCTS || [];
  const grid = document.getElementById("product-grid");
  const modal = document.getElementById("product-modal");
  const cartDrawer = document.getElementById("cart-drawer");
  const menuToggle = document.querySelector(".menu-toggle");
  const filters = [...document.querySelectorAll(".filter")];
  const navFilters = [...document.querySelectorAll("[data-filter]")];

  let activeFilter = "all";
  let activeProduct = null;
  let cart = [];

  const eyeSvg = `
    <svg class="card-eye" viewBox="0 0 64 40" aria-hidden="true">
      <path fill="currentColor" d="M32 6c-12 0-22 8-28 14 6 6 16 14 28 14s22-8 28-14C54 14 44 6 32 6zm0 22a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>`;

  function money(n) {
    return `$${n.toFixed(0)}`;
  }

  function cardHTML(product, design) {
    return `
      <article class="achilles-card">
        <div class="card-rules" aria-hidden="true"><span></span><span></span></div>
        <p class="card-brand">ACHILLES</p>
        <p class="card-title">${design.title}</p>
        <div class="card-rule" aria-hidden="true"></div>
        <div class="card-frame">
          <img src="${design.image}" alt="${product.name}" loading="lazy" width="800" height="1000" />
          <span class="card-badge">${product.badge}</span>
        </div>
        <div class="card-foot">
          ${eyeSvg}
          <p class="card-roman">— ${product.roman} —</p>
        </div>
      </article>`;
  }

  function renderGrid() {
    const list =
      activeFilter === "all"
        ? products
        : products.filter((p) => p.category === activeFilter);

    grid.innerHTML = list
      .map((product, index) => {
        const design = product.designs[0];
        return `
          <button class="listing" type="button" data-id="${product.id}" style="animation-delay:${index * 0.04}s">
            ${cardHTML(product, design)}
            <div class="listing-meta">
              <p class="listing-name">${product.name}</p>
              <p class="listing-price">${money(product.price)}</p>
            </div>
          </button>`;
      })
      .join("");
  }

  function setFilter(next) {
    activeFilter = next;
    filters.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === next);
    });
    renderGrid();
    document.body.classList.remove("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function openModal(product) {
    activeProduct = product;
    const designSelect = modal.querySelector("[data-modal-design]");
    const sizeSelect = modal.querySelector("[data-modal-size]");
    const qty = modal.querySelector("[data-modal-qty]");

    modal.querySelector("#modal-title").textContent = product.name;
    modal.querySelector("[data-modal-price]").textContent = money(product.price);
    modal.querySelector("[data-modal-desc]").textContent = product.description;

    designSelect.innerHTML = product.designs
      .map((d) => `<option value="${d.id}">${d.label}</option>`)
      .join("");
    sizeSelect.innerHTML = product.sizes
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");
    qty.value = "1";

    updateModalCard();
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function updateModalCard() {
    if (!activeProduct) return;
    const designId = modal.querySelector("[data-modal-design]").value;
    const design =
      activeProduct.designs.find((d) => d.id === designId) ||
      activeProduct.designs[0];
    modal.querySelector("[data-modal-card]").innerHTML = cardHTML(
      activeProduct,
      design
    );
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeProduct = null;
  }

  function openCart() {
    cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  function renderCart() {
    const mount = document.querySelector("[data-cart-items]");
    const count = document.querySelector("[data-cart-count]");
    const total = document.querySelector("[data-cart-total]");
    const qty = cart.reduce((sum, line) => sum + line.qty, 0);
    const sum = cart.reduce((acc, line) => acc + line.price * line.qty, 0);

    count.textContent = String(qty);
    total.textContent = money(sum);

    if (!cart.length) {
      mount.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
      return;
    }

    mount.innerHTML = cart
      .map(
        (line) => `
        <div class="cart-line">
          <img src="${line.image}" alt="" width="64" height="80" />
          <div>
            <h3>${line.name}</h3>
            <p>${line.design} · ${line.size} · Qty ${line.qty}</p>
          </div>
          <strong>${money(line.price * line.qty)}</strong>
        </div>`
      )
      .join("");
  }

  function addToCart() {
    if (!activeProduct) return;
    const designId = modal.querySelector("[data-modal-design]").value;
    const design =
      activeProduct.designs.find((d) => d.id === designId) ||
      activeProduct.designs[0];
    const size = modal.querySelector("[data-modal-size]").value;
    const qty = Math.max(
      1,
      Math.min(10, Number(modal.querySelector("[data-modal-qty]").value) || 1)
    );

    const key = `${activeProduct.id}-${design.id}-${size}`;
    const existing = cart.find((line) => line.key === key);
    if (existing) {
      existing.qty = Math.min(10, existing.qty + qty);
    } else {
      cart.push({
        key,
        name: activeProduct.name,
        design: design.label,
        size,
        qty,
        price: activeProduct.price,
        image: design.image,
      });
    }

    renderCart();
    closeModal();
    openCart();
  }

  grid.addEventListener("click", (event) => {
    const listing = event.target.closest(".listing");
    if (!listing) return;
    const product = products.find((p) => p.id === listing.dataset.id);
    if (product) openModal(product);
  });

  filters.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  navFilters.forEach((link) => {
    link.addEventListener("click", () => {
      if (link.dataset.filter) setFilter(link.dataset.filter);
    });
  });

  menuToggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.querySelector(".cart-btn")?.addEventListener("click", openCart);
  document.querySelector(".cart-close")?.addEventListener("click", closeCart);
  cartDrawer?.addEventListener("click", (event) => {
    if (event.target === cartDrawer) closeCart();
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
  modal.querySelector("[data-modal-design]")?.addEventListener("change", updateModalCard);
  modal.querySelector("[data-add-cart]")?.addEventListener("click", addToCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeCart();
      document.body.classList.remove("nav-open");
    }
  });

  renderGrid();
  renderCart();
})();
