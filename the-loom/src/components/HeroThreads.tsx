export function HeroThreads() {
  return (
    <svg
      className="hero-threads"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9783a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5f8f86" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hg2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a9e94" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1a2330" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="thread thread-a"
        d="M-20,520 C180,420 260,640 480,500 S860,320 1220,420"
        fill="none"
        stroke="url(#hg1)"
        strokeWidth="1.6"
      />
      <path
        className="thread thread-b"
        d="M-40,220 C200,300 340,80 560,180 S900,360 1240,160"
        fill="none"
        stroke="url(#hg2)"
        strokeWidth="1.3"
      />
      <path
        className="thread thread-c"
        d="M100,780 C320,600 500,720 700,560 S1000,480 1200,620"
        fill="none"
        stroke="#c9783a"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <circle className="thread-bead bead-a" cx="480" cy="500" r="3.5" fill="#e0a15a" />
      <circle className="thread-bead bead-b" cx="560" cy="180" r="3" fill="#8eb0a8" />
      <circle className="thread-bead bead-c" cx="700" cy="560" r="3.2" fill="#c9783a" />
    </svg>
  )
}
