import { pickEditionMark } from './editions'
import { hashSeed } from './filaments'
import { riddleByIndex } from './riddles'

export type PublicChallenge = {
  seed: string
  riddleId: string
  prompt: string
  nudge: string
  /** Printed on the contest page — required with the answer. Not part of the riddle text. */
  editionMark: string
  /** SHA-256 of the riddle answer alone (for soft feedback) */
  answerDigest: string
  /** SHA-256 of the full winning entry */
  entryDigest: string
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

/** Winning entry: "<answer> <editionMark>" */
export function normalizeEntry(answer: string, editionMark: string): string {
  return `${normalizeAnswer(answer)} ${normalizeAnswer(editionMark)}`.trim()
}

export function parseEntry(raw: string): { answer: string; edition: string } | null {
  const cleaned = normalizeAnswer(raw)
  const parts = cleaned.split(' ')
  if (parts.length < 2) return null
  return {
    answer: parts.slice(0, -1).join(' '),
    edition: parts[parts.length - 1]!,
  }
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function mintSeal(entry: string, seed: string): Promise<string> {
  const digest = await sha256Hex(`${seed}::${normalizeAnswer(entry)}::loom-v3`)
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
  const editionMark = pickEditionMark(seed, [answer])
  const entry = normalizeEntry(answer, editionMark)
  const answerDigest = await sha256Hex(answer)
  const entryDigest = await sha256Hex(entry)
  const seal = await mintSeal(entry, seed)

  return {
    seed,
    riddleId: riddle.id,
    prompt: riddle.prompt,
    nudge: riddle.nudge,
    editionMark,
    answerDigest,
    entryDigest,
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
  const normalized = normalizeAnswer(raw)
  if (!normalized) {
    return {
      ok: false,
      reason: 'Enter the answer, then the edition mark from this page.',
    }
  }

  const entryDigest = await sha256Hex(normalized)
  if (entryDigest === challenge.entryDigest) {
    const seal = await mintSeal(normalized, challenge.seed)
    return { ok: true, seal }
  }

  // Soft feedback: they solved the riddle but skipped the edition mark (classic AI paste fail)
  const parsed = parseEntry(raw)
  const answerOnly = parsed?.answer ?? normalized
  const answerDigest = await sha256Hex(answerOnly)
  if (answerDigest === challenge.answerDigest) {
    return {
      ok: false,
      reason:
        'That solves the riddle — but not the contest. Add the edition mark printed on this page.',
    }
  }

  if (!parsed) {
    return {
      ok: false,
      reason: 'Use both words: the answer, then the edition mark.',
    }
  }

  return { ok: false, reason: 'Not quite. Keep thinking — exact wording matters.' }
}

export type HostLedgerEntry = {
  seed: string
  seal: string
  riddleId: string
  createdAt: number
  label?: string
}

const LEDGER_KEY = 'loom.host.ledger.v3'

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
