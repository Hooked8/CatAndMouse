import { useEffect, useState } from "react";
import {
  moreShields,
  shells,
  strapFeatures,
  wornGallery,
  type Shell,
} from "./data";

const allSelectable = [...shells, ...moreShields];

export default function App() {
  const [activeId, setActiveId] = useState(shells[0].id);
  const active =
    allSelectable.find((s) => s.id === activeId) ?? shells[0];

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--shell-accent",
      active.palette[0],
    );
  }, [active]);

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand-mark" href="#top">
          ACHILLES
        </a>
        <nav className="nav">
          <a href="#strap">Strap</a>
          <a href="#shells">Shields</a>
          <a href="#worn">Worn</a>
          <a href="#system">System</a>
        </nav>
      </header>

      <main id="top">
        <Hero />
        <StrapSection />
        <ShellsSection active={active} onSelect={setActiveId} />
        <MoreBoardSection activeId={activeId} onSelect={setActiveId} />
        <WornSection shell={active} />
        <WornGallerySection />
        <SystemSection />
      </main>

      <footer className="footer">
        <p className="footer-brand">ACHILLES</p>
        <p className="footer-note">
          Patellar tendon strap · aspis shield shells with Greek-key rim
        </p>
      </footer>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">Volleyball · Basketball</p>
        <h1 className="hero-brand">ACHILLES</h1>
        <p className="hero-line">
          Tendon support shaped like a Spartan shield — not a medical brace.
        </p>
        <div className="hero-ctas">
          <a className="btn primary" href="#shells">
            See the shields
          </a>
          <a className="btn ghost" href="#strap">
            See the strap
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <img
          src="/images/shields/worn-shield-helmet.jpg"
          alt="ACHILLES patellar strap with Spartan helmet shield shell"
          className="hero-img"
        />
      </div>
    </section>
  );
}

function StrapSection() {
  return (
    <section className="section strap" id="strap">
      <div className="section-head">
        <h2>The functional strap</h2>
        <p>
          One chassis. Lightweight, breathable, and built to stay put under
          pads — circular aspis shells snap on top.
        </p>
      </div>

      <div className="strap-layout">
        <figure className="strap-shot">
          <img
            src="/images/achilles-functional-strap.jpg"
            alt="Black ACHILLES functional patellar strap with snap posts"
          />
          <figcaption>Chassis · charcoal mesh + snap posts</figcaption>
        </figure>

        <figure className="strap-shot secondary">
          <img
            src="/images/achilles-strap-inner-detail.jpg"
            alt="Inner liner with silicone pad and grip dots"
          />
          <figcaption>Inner face · soft pad + grip-dot liner</figcaption>
        </figure>
      </div>

      <ul className="feature-list">
        {strapFeatures.map((f) => (
          <li key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShellsSection({
  active,
  onSelect,
}: {
  active: Shell;
  onSelect: (id: string) => void;
}) {
  const index = Math.max(
    0,
    allSelectable.findIndex((s) => s.id === active.id),
  );

  return (
    <section className="section shells" id="shells">
      <div className="section-head">
        <h2>Aspis shield shells</h2>
        <p>
          Circular Spartan-shield face with a Greek-key meander rim. Swap the
          center mark: helmet, lambda arrow, wreath, labyrinth, or pinecone.
        </p>
      </div>

      <div className="shell-picker" role="tablist" aria-label="Core shield marks">
        {shells.map((shell, i) => (
          <button
            key={shell.id}
            role="tab"
            aria-selected={shell.id === active.id}
            className={
              shell.id === active.id ? "shell-tab active" : "shell-tab"
            }
            onClick={() => onSelect(shell.id)}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="swatches" aria-hidden="true">
              {shell.palette.slice(0, 4).map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
            <span className="shell-tab-name">{shell.name}</span>
          </button>
        ))}
      </div>

      <div className="shell-stage" key={active.id}>
        <figure className="shell-hero circle">
          <img src={active.image} alt={`${active.name} aspis shield shell`} />
        </figure>
        <div className="shell-meta">
          <p className="shell-index">
            Design {String(index + 1).padStart(2, "0")} /{" "}
            {String(allSelectable.length).padStart(2, "0")}
          </p>
          <h3>{active.name}</h3>
          <p className="shell-tagline">{active.tagline}</p>
          <dl>
            <div>
              <dt>Mark</dt>
              <dd>{active.logo}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{active.notes}</dd>
            </div>
          </dl>
          <div className="palette-row" aria-label="Color palette">
            {active.palette.map((c) => (
              <span key={c} className="chip">
                <i style={{ background: c }} />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="shell-grid">
        {shells.map((shell) => (
          <button
            key={shell.id}
            className={
              shell.id === active.id ? "shell-card active" : "shell-card"
            }
            onClick={() => onSelect(shell.id)}
          >
            <img src={shell.image} alt="" />
            <span>{shell.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MoreBoardSection({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="section more-board">
      <div className="section-head">
        <h2>More design versions</h2>
        <p>
          Combos and patterned faces — same Greek-key aspis outline, different
          centers and colorways.
        </p>
      </div>
      <div className="more-grid">
        {moreShields.map((shell) => (
          <button
            key={shell.id}
            className={
              shell.id === activeId ? "shell-card active" : "shell-card"
            }
            onClick={() => onSelect(shell.id)}
          >
            <img src={shell.image} alt={shell.name} />
            <span>{shell.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function WornSection({ shell }: { shell: Shell }) {
  return (
    <section className="section worn">
      <div className="worn-panel">
        <div className="worn-copy">
          <h2>On court</h2>
          <p>
            Chassis stays black and quiet. The{" "}
            <em>{shell.name}</em> aspis carries the brand — circular shield
            face, Greek-key rim, solid center. Support comes from the inner pad.
          </p>
          <ul>
            <li>Sits below the kneecap, not around the whole joint</li>
            <li>Thin enough under volleyball kneepads</li>
            <li>Shield shells snap off for wash or a mark swap</li>
          </ul>
        </div>
        <figure className="worn-shot">
          <img
            key={shell.id}
            src={shell.wornImage}
            alt={`ACHILLES strap worn with ${shell.name} shield on a human knee`}
          />
        </figure>
      </div>
    </section>
  );
}

function WornGallerySection() {
  return (
    <section className="section gallery" id="worn">
      <div className="section-head">
        <h2>On a real knee</h2>
        <p>
          Circular shield shells worn below the patella on natural skin —
          helmet, lambda, wreath, labyrinth, pinecone, and patterned faces.
        </p>
      </div>
      <div className="worn-gallery">
        {wornGallery.map((shot) => (
          <figure key={shot.src} className="gallery-card">
            <img src={shot.src} alt={shot.label} />
            <figcaption>{shot.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function SystemSection() {
  return (
    <section className="section system" id="system">
      <div className="section-head">
        <h2>How the system works</h2>
        <p>
          One strap. Many aspis faces. Built for athletes who dress like
          athletes.
        </p>
      </div>

      <ol className="steps">
        <li>
          <span className="step-num">01</span>
          <div>
            <h3>Wrap the chassis</h3>
            <p>
              Place the soft silicone pad just below the patella. Tension until
              support feels firm, not cinched. Grip dots lock the liner in place.
            </p>
          </div>
        </li>
        <li>
          <span className="step-num">02</span>
          <div>
            <h3>Snap the shield</h3>
            <p>
              Align the posts under the circular aspis. Press until you feel the
              click. The Greek-key rim frames whatever mark you chose.
            </p>
          </div>
        </li>
        <li>
          <span className="step-num">03</span>
          <div>
            <h3>Play · swap · wash</h3>
            <p>
              Peel the shield after the match. Hand-wash the mesh chassis; wipe
              shells clean. Next game, different mark in under ten seconds.
            </p>
          </div>
        </li>
      </ol>

      <div className="spec-strip">
        <div>
          <h3>Materials</h3>
          <p>
            Mesh band · wicking liner · soft silicone pad · TPU snaps · printed
            circular aspis shell with Greek-key rim
          </p>
        </div>
        <div>
          <h3>Not included</h3>
          <p>
            Thick neoprene, hinged braces, decorative shell cutouts, clinical
            beige everything
          </p>
        </div>
      </div>
    </section>
  );
}
