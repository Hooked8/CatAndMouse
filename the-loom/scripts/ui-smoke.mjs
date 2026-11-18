import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { forgeChallenge } from '../src/engine/seal.ts'
import { riddleByIndex } from '../src/engine/riddles.ts'
import { hashSeed } from '../src/engine/filaments.ts'

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
log.push(`home: ${(await page.locator('.brand-hero').textContent()).trim()}`)
await page.screenshot({ path: path.join(out, '01-home.png'), fullPage: true })

await page.getByRole('button', { name: 'Post a contest riddle' }).click()
await page.waitForSelector('.seal-display')
const seal = (await page.locator('.seal-display').textContent()).trim()
log.push(`seal: ${seal}`)
await page.screenshot({ path: path.join(out, '02-forge.png'), fullPage: true })

await page.getByRole('button', { name: 'Open as a solver' }).click()
await page.waitForSelector('.riddle-block')
await page.screenshot({ path: path.join(out, '03-challenge.png'), fullPage: true })

await page.fill('#answer', 'notit')
await page.getByRole('button', { name: 'Submit for the seal' }).click()
await page.waitForSelector('.feedback')
log.push(`wrong: ${(await page.locator('.feedback').textContent()).trim()}`)

const seed = new URL(page.url()).searchParams.get('c')
const answer = riddleByIndex(hashSeed(seed + ':riddle')).answer
await page.fill('#answer', answer)
await page.getByRole('button', { name: 'Submit for the seal' }).click()
await page.waitForSelector('.victory .seal-display')
const won = (await page.locator('.victory .seal-display').textContent()).trim()
log.push(`won: ${won}`)
log.push(`match: ${won === seal}`)
await page.screenshot({ path: path.join(out, '04-victory.png'), fullPage: true })

// sanity forgeChallenge import used
await forgeChallenge(seed)

console.log(log.join('\n'))
await browser.close()
