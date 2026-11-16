import { useCallback, useState } from 'react'
import { LOCK_CODE_LABEL } from './lib/cryptex'
import './App.css'

function downloadFile(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export default function App() {
  const [status, setStatus] = useState('2 print plates ready — download both STLs')

  const dl1 = useCallback(() => {
    downloadFile('/plate-1-housing-vault.stl', 'plate-1-housing-vault.stl')
    setStatus('Downloaded Plate 1 — Housing + Vault')
  }, [])

  const dl2 = useCallback(() => {
    downloadFile('/plate-2-dials-caps.stl', 'plate-2-dials-caps.stl')
    setStatus('Downloaded Plate 2 — Dials + caps + clip')
  }, [])

  return (
    <div className="app">
      <div className="atmos" aria-hidden />
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">Pulseform</p>
            <p className="brand-sub">Cryptex vault kit</p>
          </div>
        </div>
        <p className="gen-meter">
          Code <span>{LOCK_CODE_LABEL}</span>
        </p>
      </header>

      <section className="control-deck">
        <div className="control-copy">
          <p className="eyebrow">Multi-part print · 2 plates</p>
          <h1 className="title">Cryptex Vault {LOCK_CODE_LABEL}</h1>
          <p className="tagline">
            9 engineered parts across two build plates. Sliding vault with stash cavity — opens only on code{' '}
            {LOCK_CODE_LABEL}.
          </p>
        </div>
        <p className="status-line" role="status">
          {status}
        </p>
      </section>

      <main className="plate-grid">
        <article className="plate-card">
          <img src="/plate-1-housing-vault.png" alt="Build plate 1 — housing and vault" />
          <div className="plate-card-body">
            <p className="plate-kicker">Plate 1 of 2</p>
            <h2>Housing + Vault</h2>
            <p>2 tall parts: outer housing tube and sliding vault with lock dogs + stash cavity.</p>
            <button type="button" className="btn btn-primary" onClick={dl1}>
              Download Plate 1 STL
            </button>
          </div>
        </article>

        <article className="plate-card">
          <img src="/plate-2-dials-caps.png" alt="Build plate 2 — dials and caps" />
          <div className="plate-card-body">
            <p className="plate-kicker">Plate 2 of 2</p>
            <h2>Dials + Caps + Clip</h2>
            <p>7 parts: four code dials (6·7·6·7), rear cap, nose grip, retention clip.</p>
            <button type="button" className="btn btn-primary" onClick={dl2}>
              Download Plate 2 STL
            </button>
          </div>
        </article>
      </main>

      <section className="hero-meta wrap-meta">
        <dl className="meta">
          <div>
            <dt>Unlock</dt>
            <dd>
              After assembly, align each dial’s tall tick to the witness mark — rear→nose <strong>6 · 7 · 6 · 7</strong>{' '}
              — then pull the nose to slide the vault open.
            </dd>
          </div>
          <div>
            <dt>Print</dt>
            <dd>0.16–0.2mm layers, 3–4 walls, 15–25% gyroid. Do not scale. PLA+ or PETG.</dd>
          </div>
        </dl>
      </section>

      <footer className="foot">
        <p>Pulseform Cryptex Vault — multi-part kit. Code factory-set to {LOCK_CODE_LABEL}.</p>
      </footer>
    </div>
  )
}
