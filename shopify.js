(() => {
  const cfg = () => window.ACHILLES_SHOPIFY || {};

  function isConfigured() {
    const { shop, storefrontToken } = cfg();
    return Boolean(shop && storefrontToken);
  }

  function shopDomain() {
    return String(cfg().shop || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
  }

  function endpoint() {
    const version = cfg().apiVersion || "2025-01";
    return `https://${shopDomain()}/api/${version}/graphql.json`;
  }

  async function storefront(query, variables = {}) {
    if (!isConfigured()) {
      throw new Error("Shopify is not configured yet.");
    }
    const res = await fetch(endpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": cfg().storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (!res.ok || json.errors?.length) {
      const msg =
        json.errors?.map((e) => e.message).join("; ") ||
        `Shopify HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json.data;
  }

  const variantCache = new Map();

  async function resolveVariantId(handle, designLabel, sizeLabel) {
    const cacheKey = `${handle}::${designLabel}::${sizeLabel}`;
    if (variantCache.has(cacheKey)) return variantCache.get(cacheKey);

    const data = await storefront(
      `query ProductVariants($handle: String!) {
        product(handle: $handle) {
          id
          title
          variants(first: 100) {
            nodes {
              id
              title
              availableForSale
              selectedOptions { name value }
            }
          }
        }
      }`,
      { handle }
    );

    const product = data?.product;
    if (!product) {
      throw new Error(
        `No Shopify product with handle "${handle}". Import the CSV first.`
      );
    }

    const nodes = product.variants?.nodes || [];
    const design = String(designLabel || "").trim().toLowerCase();
    const size = String(sizeLabel || "").trim().toLowerCase();

    const match = nodes.find((v) => {
      const opts = Object.fromEntries(
        (v.selectedOptions || []).map((o) => [
          String(o.name).toLowerCase(),
          String(o.value).toLowerCase(),
        ])
      );
      const designOk =
        !design ||
        opts.design === design ||
        opts.title === design ||
        String(v.title).toLowerCase().includes(design);
      const sizeOk =
        !size ||
        opts.size === size ||
        String(v.title).toLowerCase().includes(size);
      return designOk && sizeOk;
    });

    const fallback =
      match ||
      nodes.find((v) => {
        const opts = Object.fromEntries(
          (v.selectedOptions || []).map((o) => [
            String(o.name).toLowerCase(),
            String(o.value).toLowerCase(),
          ])
        );
        return opts.size === size;
      }) ||
      nodes[0];

    if (!fallback?.id) {
      throw new Error(`No variants found for "${handle}".`);
    }

    variantCache.set(cacheKey, fallback.id);
    return fallback.id;
  }

  async function createCheckout(lines) {
    if (!lines?.length) throw new Error("Cart is empty.");

    const merchandise = [];
    for (const line of lines) {
      const merchandiseId = await resolveVariantId(
        line.handle,
        line.design,
        line.size
      );
      merchandise.push({
        merchandiseId,
        quantity: Math.max(1, Number(line.qty) || 1),
      });
    }

    const data = await storefront(
      `mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }`,
      { lines: merchandise }
    );

    const payload = data?.cartCreate;
    const err = payload?.userErrors?.[0]?.message;
    if (err) throw new Error(err);
    const url = payload?.cart?.checkoutUrl;
    if (!url) throw new Error("Shopify did not return a checkout URL.");
    return url;
  }

  function permanentShopUrl() {
    if (!isConfigured()) return null;
    return `https://${shopDomain()}`;
  }

  window.AchillesShopify = {
    isConfigured,
    createCheckout,
    permanentShopUrl,
    shopDomain,
  };
})();
