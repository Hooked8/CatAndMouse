import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const out = '/tmp/loom-screens'
await mkdir(out, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const log = []

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
const brand = await page.locator('.brand-hero').textContent()
log.push(`home brand: ${brand}`)
await page.screenshot({ path: path.join(out, '01-home.png'), fullPage: true })

await page.getByRole('button', { name: 'Forge a sealed riddle' }).click()
await page.waitForSelector('.seal-display')
const seal = (await page.locator('.seal-display').textContent()).trim()
const link = (await page.locator('.copy-row code').textContent()).trim()
log.push(`forged seal: ${seal}`)
log.push(`share link: ${link}`)
await page.screenshot({ path: path.join(out, '02-forge.png'), fullPage: true })

await page.getByRole('button', { name: 'Open as solver' }).click()
await page.waitForSelector('.riddle-block')
const riddle = (await page.locator('.riddle-block').textContent()).trim()
log.push(`riddle: ${riddle.slice(0, 80)}...`)
await page.screenshot({ path: path.join(out, '03-challenge.png'), fullPage: true })

await page.fill('#binding', 'clock')
await page.getByRole('button', { name: 'Mint the seal' }).click()
await page.waitForSelector('.feedback')
log.push(`single-word feedback: ${(await page.locator('.feedback').textContent()).trim()}`)

// Derive correct binding from seed in URL using same engine
const seed = new URL(page.url()).searchParams.get('c')
const { forgeChallenge } = await import('../src/engine/seal.ts')
const { riddleByIndex } = await import('../src/engine/riddles.ts')
const { pickFilament, hashSeed } = await import('../src/engine/filaments.ts')
const forged = await forgeChallenge(seed)
const answer = riddleByIndex(hashSeed(seed + ':riddle')).answer
const filament = pickFilament(seed)
const binding = `${answer} ${filament}`
log.push(`binding under test: ${binding}`)

await page.fill('#binding', binding)
await page.getByRole('button', { name: 'Mint the seal' }).click()
await page.waitForSelector('.victory .seal-display')
const won = (await page.locator('.victory .seal-display').textContent()).trim()
log.push(`won seal: ${won}`)
log.push(`seals match host: ${won === seal}`)
await page.screenshot({ path: path.join(out, '04-victory.png'), fullPage: true })

await page.getByRole('button', { name: 'Host ledger' }).click()
await page.waitForSelector('.ledger-list')
const ledgerText = await page.locator('.ledger-list').textContent()
log.push(`ledger contains seal: ${ledgerText.includes(seal)}`)
await page.fill('#seal-check', seal)
await page.getByRole('button', { name: 'Verify' }).click()
await page.waitForSelector('.feedback')
log.push(`verify: ${(await page.locator('.feedback').textContent()).trim()}`)
await page.screenshot({ path: path.join(out, '05-ledger.png'), fullPage: true })

console.log(log.join('\n'))
await browser.close()
