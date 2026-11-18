# ACHILLES × Shopify (permanent checkout)

This lookbook stays the storefront. Shopify hosts **products + permanent checkout** at:

`https://YOUR-STORE.myshopify.com`

## 1. Create the store

1. Open [Shopify free trial](https://www.shopify.com/free-trial) and create a store.
2. Note the permanent domain: `your-store.myshopify.com`.

## 2. Import the catalog

1. In this repo run:

```bash
node tools/export-shopify-csv.mjs
```

2. In Shopify Admin → **Products → Import**, upload:

`shopify/products-export.csv`

Images load from the GitHub `gh-pages` branch. After import, wait until image thumbnails finish processing.

## 3. Create a Storefront API token

**Option A — Headless channel (recommended)**  
Shopify Admin → **Sales channels** → add **Headless** → copy the **public** Storefront API access token.

**Option B — Custom app**  
Settings → Apps → Develop apps → Create an app → Configure Storefront API scopes:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

Install the app and copy the Storefront API public access token.

## 4. Connect this lookbook

Edit `shopify-config.js`:

```js
window.ACHILLES_SHOPIFY = {
  shop: "your-store.myshopify.com",
  storefrontToken: "shpat_or_storefront_public_token",
  apiVersion: "2025-01",
  imageBase: "https://raw.githubusercontent.com/Hooked8/CatAndMouse/gh-pages",
};
```

Commit and push. Cart → **Checkout with Shopify** opens Shopify’s hosted checkout URL for a real order.

## 5. Permanent public lookbook URL

Keep serving this static site from GitHub Pages / your domain. Example CDN preview:

`https://rawcdn.githack.com/Hooked8/CatAndMouse/gh-pages/index.html`

To use `https://hooked8.github.io/CatAndMouse/`, enable GitHub Pages on the `gh-pages` branch (Settings → Pages → Deploy from branch `gh-pages` / `/`).

Optional: point a custom domain at GitHub Pages for the lookbook, and keep checkout on `your-store.myshopify.com` (or a `checkout.` subdomain later).

## Notes

- Product **handles** match catalog `id` values (e.g. `hoodie-black`).
- Variants use options **Design** + **Size**.
- Re-run the CSV export after big catalog drops, then re-import (or update) in Shopify.
