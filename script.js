(() => {
  const categories = window.ACHILLES_CATEGORIES || [];
  const products = window.ACHILLES_PRODUCTS || [];

  const header = document.querySelector("[data-header]");
  const drawer = document.getElementById("drawer-nav");
  const modelStack = document.getElementById("model-stack");
  const homeView = document.getElementById("view-home");
  const categoryView = document.getElementById("view-category");
  const categoryGrid = document.getElementById("category-grid");
  const subnav = document.querySelector("[data-subnav]");
  const modal = document.getElementById("product-modal");
  const cartDrawer = document.getElementById("cart-drawer");

  let activeCategory = null;
  let activeSub = "all";
  let activeProduct = null;
  let cart = [];

  const eyeSvg = `
    <svg class="card-eye" viewBox="0 0 64 40" aria-hidden="true">
      <path fill="currentColor" d="M32 6c-12 0-22 8-28 14 6 6 16 14 28 14s22-8 28-14C54 14 44 6 32 6zm0 22a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>`;

  function money(n) {
    return `$${n.toFixed(0)}`;
  }

  function parseRoute() {
    const hash = location.hash.replace(/^#/, "") || "home";
    if (hash.startsWith("category/")) {
      const id = hash.split("/")[1];
      return { view: "category", categoryId: id };
    }
    if (hash === "models") return { view: "home", scroll: "models" };
    return { view: "home" };
  }

  function setRoute(hash) {
    if (location.hash.replace(/^#/, "") === hash.replace(/^#/, "")) {
      applyRoute();
      return;
    }
    location.hash = hash;
  }

  function closeDrawer() {
    drawer?.setAttribute("aria-hidden", "true");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  }

  function openDrawer() {
    drawer?.setAttribute("aria-hidden", "false");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "true");
  }

  function renderModels() {
    modelStack.innerHTML = categories
      .map(
        (cat, i) => `
        <button class="model-card" type="button" data-open-category="${cat.id}" style="animation-delay:${i * 0.05}s">
          <img src="${cat.image}" alt="" loading="lazy" width="1200" height="800" />
          <div class="model-copy">
            <h3>${cat.name}</h3>
            <p>${cat.blurb}</p>
          </div>
          <span class="model-go" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M8 5l8 7-8 7"/></svg>
          </span>
        </button>`
      )
      .join("");
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

  function renderCategory() {
    if (!activeCategory) return;
    const cat = categories.find((c) => c.id === activeCategory);
    if (!cat) return;

    document.querySelector("[data-category-hero]").src = cat.image;
    document.querySelector("[data-category-title]").textContent = cat.name;
    document.querySelector("[data-category-desc]").textContent = cat.blurb;

    subnav.innerHTML = cat.subs
      .map(
        (s) =>
          `<button type="button" data-sub="${s.id}" class="${s.id === activeSub ? "is-active" : ""}">${s.label}</button>`
      )
      .join("");

    const subOrder = Object.fromEntries(
      (cat.subs || []).map((s, i) => [s.id, i])
    );
    const list = products
      .filter((p) => {
        if (p.category !== activeCategory) return false;
        if (activeSub === "all") return true;
        return p.sub === activeSub;
      })
      .sort((a, b) => {
        const sa = subOrder[a.sub] ?? 99;
        const sb = subOrder[b.sub] ?? 99;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
      });

    if (!list.length) {
      categoryGrid.innerHTML = `
        <div class="empty-state">
          <img class="mini-crest" src="/images/brand/achilles-crest.png" alt="" width="40" height="40" style="margin:0 auto 0.75rem" />
          <p>More ${cat.name.replace(".", "")} pieces are coming in with the next photo drop.</p>
        </div>`;
      return;
    }

    categoryGrid.innerHTML = list
      .map(
        (product, index) => `
        <button class="listing" type="button" data-id="${product.id}" style="animation-delay:${index * 0.04}s">
          ${cardHTML(product, product.designs[0])}
          <div class="listing-meta">
            <p class="listing-name">${product.name}</p>
            <p class="listing-price">${money(product.price)}</p>
          </div>
        </button>`
      )
      .join("");
  }

  function showHome(scrollTo) {
    homeView.hidden = false;
    homeView.classList.add("is-active");
    categoryView.hidden = true;
    categoryView.classList.remove("is-active");
    if (scrollTo === "models") {
      requestAnimationFrame(() => {
        document.getElementById("models")?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showCategory(id) {
    activeCategory = id;
    activeSub = "all";
    homeView.hidden = true;
    homeView.classList.remove("is-active");
    categoryView.hidden = false;
    categoryView.classList.add("is-active");
    renderCategory();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function applyRoute() {
    const route = parseRoute();
    closeDrawer();
    if (route.view === "category") {
      const exists = categories.some((c) => c.id === route.categoryId);
      if (exists) showCategory(route.categoryId);
      else showHome();
      return;
    }
    showHome(route.scroll);
  }

  function openModal(product) {
    activeProduct = product;
    const designSelect = modal.querySelector("[data-modal-design]");
    const sizeSelect = modal.querySelector("[data-modal-size]");
    modal.querySelector("#modal-title").textContent = product.name;
    modal.querySelector("[data-modal-price]").textContent = money(product.price);
    modal.querySelector("[data-modal-desc]").textContent = product.description;
    designSelect.innerHTML = product.designs
      .map((d) => `<option value="${d.id}">${d.label}</option>`)
      .join("");
    sizeSelect.innerHTML = product.sizes
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");
    const sizeLabel = sizeSelect.closest("label")?.querySelector("span");
    if (sizeLabel) {
      const boardSubs = new Set(["wakeboards", "surfboards", "snowboards", "skis"]);
      sizeLabel.textContent = boardSubs.has(product.sub)
        ? "Size (Roman · cm)"
        : "Size";
    }
    modal.querySelector("[data-modal-qty]").value = "1";
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
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else {
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

  /* Events */
  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    const open = drawer.getAttribute("aria-hidden") !== "false";
    if (open) openDrawer();
    else closeDrawer();
  });

  document.querySelectorAll("[data-close-drawer]").forEach((el) => {
    el.addEventListener("click", closeDrawer);
  });

  document.querySelector(".cart-btn")?.addEventListener("click", openCart);
  document.querySelector(".cart-close")?.addEventListener("click", closeCart);
  cartDrawer?.addEventListener("click", (e) => {
    if (e.target === cartDrawer) closeCart();
  });

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      const kind = nav.dataset.nav;
      if (kind === "home") setRoute("home");
      else if (kind === "models") setRoute("models");
      else if (kind === "category") setRoute(`category/${nav.dataset.category}`);
      return;
    }

    const openCat = e.target.closest("[data-open-category]");
    if (openCat) {
      setRoute(`category/${openCat.dataset.openCategory}`);
      return;
    }

    const listing = e.target.closest(".listing");
    if (listing) {
      const product = products.find((p) => p.id === listing.dataset.id);
      if (product) openModal(product);
    }
  });

  subnav?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sub]");
    if (!btn) return;
    activeSub = btn.dataset.sub;
    renderCategory();
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
  modal.querySelector("[data-modal-design]")?.addEventListener("change", updateModalCard);
  modal.querySelector("[data-add-cart]")?.addEventListener("click", addToCart);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
      closeDrawer();
    }
  });

  window.addEventListener("hashchange", applyRoute);
  window.addEventListener("scroll", () => {
    header?.classList.toggle("is-solid", window.scrollY > 24);
    const bg = document.querySelector(".hero-bg");
    if (bg && !homeView.hidden) {
      const y = Math.min(28, window.scrollY * 0.06);
      bg.style.translate = `0 ${y}px`;
    }
  });

  renderModels();
  renderCart();
  applyRoute();
})();
