import { useMemo, useState } from 'react'
import { HeroThreads } from './components/HeroThreads'
import {
  fullChallengeText,
  generatePuzzle,
  shareableRiddleText,
  type GeneratedPuzzle,
} from './engine/generate'

function LockStamp({ instruction, code }: { instruction: string; code: string }) {
  return (
    <aside className="lock-stamp">
      <p className="lock-kicker">Precision lock · required</p>
      <p className="lock-code">{code}</p>
      <p className="lock-body">{instruction}</p>
      <p className="lock-note">
        This lock is separate from the riddle text on purpose. If someone pastes
        only the riddle into an AI, they miss this step — and the final answer
        will be wrong.
      </p>
    </aside>
  )
}

export default function App() {
  const initial = useMemo(() => generatePuzzle(), [])
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle>(initial)
  const [copied, setCopied] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [showHostNotes, setShowHostNotes] = useState(true)

  function copy(label: string, text: string) {
    void navigator.clipboard.writeText(text)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1400)
  }

  function next() {
    setSpinning(true)
    window.setTimeout(() => {
      setPuzzle(generatePuzzle(puzzle.riddle.id))
      setSpinning(false)
      setCopied(null)
    }, 160)
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          The Loom
        </div>
      </header>

      <main className="hero">
        <HeroThreads />
        <div className="hero-copy">
          <p className="eyebrow">Brutal think-puzzles</p>
          <h1 className="brand-hero">The Loom</h1>
          <p className="lede">
            Long, multi-step riddles meant to take a serious sit — then a
            precision lock so pasting the riddle alone into an AI still fails.
            You always get the answers up front.
          </p>
          <div className="cta-row">
            <button type="button" className="btn primary" onClick={next}>
              {spinning ? 'Forging…' : 'Generate a hard riddle'}
            </button>
          </div>
        </div>
      </main>

      <section className={`machine ${spinning ? 'is-spinning' : ''}`}>
        <div className="machine-card riddle-card">
          <p className="card-label">The puzzle</p>
          <h2 className="riddle-title">{puzzle.riddle.title}</h2>
          <pre className="riddle-text">{puzzle.riddle.prompt}</pre>
          <div className="btn-row">
            <button
              type="button"
              className="btn small"
              onClick={() => copy('riddle', shareableRiddleText(puzzle))}
            >
              {copied === 'riddle' ? 'Copied' : 'Copy riddle only'}
            </button>
            <button
              type="button"
              className="btn small"
              onClick={() => copy('full', fullChallengeText(puzzle))}
            >
              {copied === 'full' ? 'Copied' : 'Copy full challenge'}
            </button>
          </div>
          <p className="fine">
            “Copy riddle only” is the AI trap version — no precision lock
            included.
          </p>
        </div>

        <LockStamp instruction={puzzle.lock.instruction} code={puzzle.lock.code} />

        <div className="machine-card answer-card">
          <p className="card-label">Your answers (host only)</p>
          <div className="answer-grid">
            <div>
              <p className="answer-sub">Core solve</p>
              <p className="answer-text core">{puzzle.coreAnswer}</p>
            </div>
            <div>
              <p className="answer-sub">Final answer after the lock</p>
              <p className="answer-text final">{puzzle.finalAnswer}</p>
            </div>
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn small"
              onClick={() => copy('final', puzzle.finalAnswer)}
            >
              {copied === 'final' ? 'Copied' : 'Copy final answer'}
            </button>
            <button
              type="button"
              className="btn small"
              onClick={() => copy('core', puzzle.coreAnswer)}
            >
              {copied === 'core' ? 'Copied' : 'Copy core solve'}
            </button>
          </div>

          <button
            type="button"
            className="linkish"
            onClick={() => setShowHostNotes((v) => !v)}
          >
            {showHostNotes ? 'Hide' : 'Show'} why this is hard
          </button>
          {showHostNotes && <p className="host-note">{puzzle.riddle.whyHard}</p>}
        </div>

        <div className="machine-actions">
          <button type="button" className="btn primary" onClick={next}>
            Generate another
          </button>
        </div>
      </section>

      <footer className="footer">
        <p>
          Give people the full challenge (riddle + precision lock). If they only
          feed an AI the riddle block, the lock still breaks them.
        </p>
      </footer>
    </div>
  )
}
