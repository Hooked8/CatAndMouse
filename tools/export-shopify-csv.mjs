#!/usr/bin/env node
/**
 * Builds shopify/products-export.csv from products.js for Admin → Products → Import.
 * Image URLs point at the gh-pages raw CDN so Shopify can pull them.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imageBase =
  process.env.ACHILLES_IMAGE_BASE ||
  "https://raw.githubusercontent.com/Hooked8/CatAndMouse/gh-pages";

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "products.js"), "utf8"), ctx);
const products = ctx.window.ACHILLES_PRODUCTS || [];
const categories = ctx.window.ACHILLES_CATEGORIES || [];
const catName = Object.fromEntries(categories.map((c) => [c.id, c.name.replace(/\.$/, "")]));

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function absImage(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return `${imageBase}${src.startsWith("/") ? src : `/${src}`}`;
}

const headers = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Status",
];

const rows = [headers];

for (const product of products) {
  const handle = product.id;
  const tags = [catName[product.category] || product.category, product.sub]
    .filter(Boolean)
    .join(", ");
  const designs = product.designs?.length ? product.designs : [{ id: "default", label: "Default", image: "" }];
  const sizes = product.sizes?.length ? product.sizes : ["One Size"];
  let imagePos = 0;
  const seenImages = new Set();
  let firstRow = true;

  for (const design of designs) {
    for (const size of sizes) {
      const img = absImage(design.image);
      const isNewImage = img && !seenImages.has(img);
      if (isNewImage) {
        seenImages.add(img);
        imagePos += 1;
      }

      rows.push([
        handle,
        product.name,
        firstRow ? `<p>${product.description || ""}</p>` : "",
        "ACHILLES",
        "",
        product.sub || "",
        firstRow ? tags : "",
        "true",
        "Design",
        design.label || design.id,
        "Size",
        size,
        `${handle}-${design.id}-${String(size).replace(/\s+/g, "-")}`.slice(0, 100),
        "0",
        "shopify",
        "25",
        "deny",
        "manual",
        Number(product.price || 0).toFixed(2),
        "true",
        "true",
        isNewImage ? img : "",
        isNewImage ? String(imagePos) : "",
        isNewImage ? `${product.name} — ${design.label}` : "",
        "false",
        firstRow ? `ACHILLES ${product.name}` : "",
        firstRow ? product.description || "" : "",
        "active",
      ]);
      firstRow = false;
    }
  }
}

const outDir = path.join(root, "shopify");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "products-export.csv");
fs.writeFileSync(
  outPath,
  rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n",
  "utf8"
);
console.log(`Wrote ${outPath}`);
console.log(`Products: ${products.length}`);
console.log(`Variant rows: ${rows.length - 1}`);
console.log(`Image base: ${imageBase}`);
