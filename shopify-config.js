/**
 * ACHILLES ↔ Shopify connection
 * ------------------------------
 * 1. Create a Shopify store (trial is fine): https://www.shopify.com/free-trial
 * 2. Import shopify/products-export.csv (Products → Import)
 * 3. Settings → Apps → Develop apps → Create app → Storefront API scopes:
 *    unauthenticated_read_product_listings, unauthenticated_read_product_inventory,
 *    unauthenticated_write_checkouts, unauthenticated_read_checkouts
 *    (or install the Headless channel and copy the public Storefront token)
 * 4. Paste your store domain + public Storefront token below, then commit/redeploy.
 *
 * Public Storefront tokens are designed to ship in the browser.
 * Permanent shop URL: https://YOUR-STORE.myshopify.com
 * Checkout opens from this lookbook via the Storefront cart checkoutUrl.
 */
window.ACHILLES_SHOPIFY = {
  /** e.g. "achilles-athletic.myshopify.com" — no https:// */
  shop: "",
  /** Public Storefront API access token */
  storefrontToken: "",
  /** Storefront API version */
  apiVersion: "2025-01",
  /**
   * Absolute base for product images in Shopify imports.
   * Defaults to the gh-pages raw CDN for this repo.
   */
  imageBase:
    "https://raw.githubusercontent.com/Hooked8/CatAndMouse/gh-pages",
};
