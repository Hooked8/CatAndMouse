# ACHILLES

Athletic apparel, boards, protection, and accessories lookbook with Shopify checkout.

## Run locally

```bash
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Shopify (permanent checkout)

See **[SHOPIFY.md](./SHOPIFY.md)**.

```bash
npm run shopify:export
```

Then import `shopify/products-export.csv`, add your store domain + Storefront token in `shopify-config.js`, and cart checkout opens on `https://YOUR-STORE.myshopify.com`.
