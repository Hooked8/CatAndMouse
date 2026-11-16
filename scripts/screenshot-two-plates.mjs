import { chromium } from 'playwright-core'
import fs from 'fs'

const browser = await chromium.launch({ headless: true })

async function shot(url, out) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  page.on('pageerror', (e) => console.log('pageerror', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('console', m.text())
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 180000 })
  await page.waitForFunction(() => window.__READY === true || window.__ERROR, { timeout: 180000 })
  const err = await page.evaluate(() => window.__ERROR || null)
  if (err) throw new Error(err)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: out, type: 'png' })
  console.log('wrote', out, fs.statSync(out).size)
  await page.close()
}

await shot(
  'http://127.0.0.1:8765/buildplate-1.html',
  '/agent/pulseform/public/plate-1-housing-vault.png',
)
await shot(
  'http://127.0.0.1:8765/buildplate-2.html',
  '/agent/pulseform/public/plate-2-dials-caps.png',
)
await browser.close()
