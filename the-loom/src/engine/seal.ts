import { riddleByIndex } from './riddles'
import { hashSeed } from './filaments'

export type PublicChallenge = {
  seed: string
  riddleId: string
  prompt: string
  nudge: string
  /** SHA-256 of the normalized answer — never plaintext in the share payload */
  answerDigest: string
}

export type ForgedChallenge = PublicChallenge & {
  /** Host-only prize key — never post with the riddle */
  seal: string
}

export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function mintSeal(answer: string, seed: string): Promise<string> {
  const digest = await sha256Hex(`${seed}::${normalizeAnswer(answer)}::loom-v2`)
  const a = digest.slice(0, 4).toUpperCase()
  const b = digest.slice(4, 8).toUpperCase()
  const c = digest.slice(8, 12).toUpperCase()
  return `LOOM-${a}-${b}-${c}`
}

export function encodeSeed(bytes?: number): string {
  const arr = new Uint8Array(bytes ?? 6)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function forgeChallenge(seedInput?: string): Promise<ForgedChallenge> {
  const seed = (seedInput?.trim() || encodeSeed()).toLowerCase()
  const riddle = riddleByIndex(hashSeed(seed + ':riddle'))
  const answer = normalizeAnswer(riddle.answer)
  const answerDigest = await sha256Hex(answer)
  const seal = await mintSeal(answer, seed)

  return {
    seed,
    riddleId: riddle.id,
    prompt: riddle.prompt,
    nudge: riddle.nudge,
    answerDigest,
    seal,
  }
}

export async function challengeFromSeed(seedInput: string): Promise<PublicChallenge | null> {
  const seed = seedInput.trim().toLowerCase()
  if (!/^[a-f0-9]{8,16}$/.test(seed)) return null
  const forged = await forgeChallenge(seed)
  const { seal: _seal, ...pub } = forged
  return pub
}

export async function verifyAttempt(
  challenge: PublicChallenge,
  raw: string,
): Promise<{ ok: true; seal: string } | { ok: false; reason: string }> {
  const answer = normalizeAnswer(raw)
  if (!answer) {
    return { ok: false, reason: 'Enter your answer — one word or a short phrase.' }
  }

  const digest = await sha256Hex(answer)
  if (digest !== challenge.answerDigest) {
    return { ok: false, reason: 'Not quite. Keep thinking — exact wording matters.' }
  }

  const seal = await mintSeal(answer, challenge.seed)
  return { ok: true, seal }
}

export type HostLedgerEntry = {
  seed: string
  seal: string
  riddleId: string
  createdAt: number
  label?: string
}

const LEDGER_KEY = 'loom.host.ledger.v2'

export function loadLedger(): HostLedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HostLedgerEntry[]
  } catch {
    return []
  }
}

export function saveLedgerEntry(entry: HostLedgerEntry) {
  const list = loadLedger().filter((e) => e.seed !== entry.seed)
  list.unshift(entry)
  localStorage.setItem(LEDGER_KEY, JSON.stringify(list.slice(0, 40)))
}

export function findSealInLedger(seal: string): HostLedgerEntry | undefined {
  const normalized = seal.trim().toUpperCase()
  return loadLedger().find((e) => e.seal === normalized)
}
