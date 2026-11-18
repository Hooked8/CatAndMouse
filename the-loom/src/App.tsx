import { useMemo, useState } from 'react'
import { HeroThreads } from './components/HeroThreads'
import { generateRiddle, type Riddle } from './engine/riddles'

export default function App() {
  const first = useMemo(() => generateRiddle(), [])
  const [riddle, setRiddle] = useState<Riddle>(first)
  const [copied, setCopied] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)

  function copy(label: string, text: string) {
    void navigator.clipboard.writeText(text)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1400)
  }

  function nextRiddle() {
    setSpinning(true)
    window.setTimeout(() => {
      setRiddle(generateRiddle(riddle.id))
      setSpinning(false)
      setCopied(null)
    }, 180)
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
          <p className="eyebrow">Hard riddle machine</p>
          <h1 className="brand-hero">The Loom</h1>
          <p className="lede">
            Generates tough think-riddles and hands you the answer — so you can
            stump people without stump yourself.
          </p>
          <div className="cta-row">
            <button type="button" className="btn primary" onClick={nextRiddle}>
              {spinning ? 'Spinning…' : 'Generate a new riddle'}
            </button>
          </div>
        </div>
      </main>

      <section className={`machine ${spinning ? 'is-spinning' : ''}`}>
        <div className="machine-card riddle-card">
          <p className="card-label">Riddle</p>
          <p className="riddle-text">{riddle.prompt}</p>
          <button
            type="button"
            className="btn small"
            onClick={() => copy('riddle', riddle.prompt)}
          >
            {copied === 'riddle' ? 'Copied' : 'Copy riddle'}
          </button>
        </div>

        <div className="machine-card answer-card">
          <p className="card-label">Answer</p>
          <p className="answer-text">{riddle.answer}</p>
          {riddle.hint && <p className="hint-text">Hint if you need it: {riddle.hint}</p>}
          <button
            type="button"
            className="btn small"
            onClick={() => copy('answer', riddle.answer)}
          >
            {copied === 'answer' ? 'Copied' : 'Copy answer'}
          </button>
        </div>

        <div className="machine-actions">
          <button type="button" className="btn primary" onClick={nextRiddle}>
            Generate another
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              copy('both', `Riddle:\n${riddle.prompt}\n\nAnswer:\n${riddle.answer}`)
            }
          >
            {copied === 'both' ? 'Copied' : 'Copy both'}
          </button>
        </div>
      </section>

      <footer className="footer">
        <p>Hit generate whenever you want a fresh hard riddle — answer included.</p>
      </footer>
    </div>
  )
}
