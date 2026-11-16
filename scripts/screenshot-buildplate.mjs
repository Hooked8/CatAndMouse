import { chromium } from 'playwright-core'
import fs from 'fs'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
page.on('pageerror', (e) => console.log('pageerror', e.message))
page.on('console', (m) => {
  if (m.type() === 'error') console.log('console', m.text())
})

await page.goto('http://127.0.0.1:8765/buildplate.html', {
  waitUntil: 'networkidle',
  timeout: 120000,
})
await page.waitForFunction(() => window.__READY === true || window.__ERROR, {
  timeout: 120000,
})
const err = await page.evaluate(() => window.__ERROR || null)
const height = await page.evaluate(() => window.__HEIGHT || null)
console.log({ err, height })
if (err) throw new Error(err)

await page.waitForTimeout(1500)

const out = '/agent/pulseform/public/cryptex-6767-buildplate.png'
await page.screenshot({ path: out, type: 'png' })
console.log('wrote', out, fs.statSync(out).size)

const canvas = page.locator('canvas')
const box = await canvas.boundingBox()
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4)
await page.mouse.down()
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.72, { steps: 25 })
await page.mouse.up()
await page.waitForTimeout(500)

const out2 = '/agent/pulseform/public/cryptex-6767-buildplate-top.png'
await page.screenshot({ path: out2, type: 'png' })
console.log('wrote', out2, fs.statSync(out2).size)

await browser.close()
