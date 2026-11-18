import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { riddleByIndex } from '../src/engine/riddles.ts'
import { hashSeed } from '../src/engine/filaments.ts'
import { forgeChallenge } from '../src/engine/seal.ts'

const out = '/tmp/loom-screens'
await mkdir(out, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome-stable',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const log = []

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Post a contest riddle' }).click()
await page.waitForSelector('.seal-display')
const seal = (await page.locator('.seal-display').textContent()).trim()
const edition = (await page.locator('.edition-mark').textContent()).replace(/\s+/g, '')
log.push(`edition:${edition} seal:${seal}`)
await page.screenshot({ path: path.join(out, 'anti-ai-forge.png'), fullPage: true })

await page.getByRole('button', { name: 'Open as a solver' }).click()
await page.waitForSelector('#answer')
const seed = new URL(page.url()).searchParams.get('c')
const answer = riddleByIndex(hashSeed(seed + ':riddle')).answer

await page.fill('#answer', answer)
await page.getByRole('button', { name: 'Submit for the seal' }).click()
await page.waitForSelector('.feedback')
log.push(`answer-only: ${(await page.locator('.feedback').textContent()).trim()}`)

await page.fill('#answer', `${answer} ${edition}`)
await page.getByRole('button', { name: 'Submit for the seal' }).click()
await page.waitForSelector('.victory .seal-display')
const won = (await page.locator('.victory .seal-display').textContent()).trim()
log.push(`won:${won} match:${won === seal}`)
await page.screenshot({ path: path.join(out, 'anti-ai-win.png'), fullPage: true })

await forgeChallenge(seed)
console.log(log.join('\n'))
await browser.close()
