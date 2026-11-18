export type Shell = {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  palette: string[];
  image: string;
  wornImage: string;
  notes: string;
};

export const shells: Shell[] = [
  {
    id: "prism",
    name: "Prism Labyrinth",
    tagline: "Full-spectrum ripple with white maze mark",
    logo: "Circular labyrinth",
    palette: ["#7B2CBF", "#00C2FF", "#B8F000", "#FF6B00", "#FF1E56"],
    image: "/images/shell-01-prism-labyrinth.jpg",
    wornImage: "/images/achilles-strap-worn-prism.jpg",
    notes:
      "Solid continuous shell face — no decorative cutout. Rainbow wave language for high-visibility court energy.",
  },
  {
    id: "violet",
    name: "Violet Marble",
    tagline: "Mirrored lilac hydro-dip with black wordmark",
    logo: "ACHILLES wordmark",
    palette: ["#F3E8FF", "#C084FC", "#7C3AED", "#4C1D95", "#111111"],
    image: "/images/shell-02-violet-marble.jpg",
    wornImage: "/images/achilles-strap-worn-violet.jpg",
    notes:
      "Fashion-first colorway on a continuous oval shell. Reads as kit, not a brace.",
  },
  {
    id: "spartan",
    name: "Spartan Surge",
    tagline: "Electric swirl with crest helmet icon",
    logo: "Spartan helmet",
    palette: ["#6D28D9", "#2563EB", "#F472B6", "#FACC15", "#FB923C"],
    image: "/images/shell-03-spartan-surge.jpg",
    wornImage: "/images/achilles-strap-worn-spartan.jpg",
    notes:
      "Game-day shell. Helmet mark centered on a solid face so it stays readable when strapped.",
  },
  {
    id: "agate",
    name: "Horus Agate",
    tagline: "Navy geode marble with gold veins",
    logo: "Eye of Horus + ACHILLES",
    palette: ["#0B1C3F", "#1D4ED8", "#38BDF8", "#F8FAFC", "#D4A017"],
    image: "/images/shell-04-horus-agate.jpg",
    wornImage: "/images/achilles-strap-worn-agate.jpg",
    notes:
      "Premium dark colorway. Gold veining on a continuous shell — support comes from the inner pad, not a cutout.",
  },
  {
    id: "electric",
    name: "Electric A",
    tagline: "Blue–magenta liquid marble with boxed A",
    logo: "Boxed A",
    palette: ["#1E3A8A", "#2563EB", "#22D3EE", "#DB2777", "#F472B6"],
    image: "/images/shell-05-electric-a.jpg",
    wornImage: "/images/achilles-strap-worn-electric.jpg",
    notes:
      "Minimal brand hit over maximal pattern. Solid shell face matches the streetwear pant color story.",
  },
];

export const wornGallery = [
  {
    src: "/images/achilles-strap-worn-prism.jpg",
    label: "Prism Labyrinth · side view",
  },
  {
    src: "/images/worn-prism-front.jpg",
    label: "Prism Labyrinth · front view",
  },
  {
    src: "/images/achilles-strap-worn-violet.jpg",
    label: "Violet Marble · side view",
  },
  {
    src: "/images/worn-violet-bent.jpg",
    label: "Violet Marble · ready stance",
  },
  {
    src: "/images/achilles-strap-worn-spartan.jpg",
    label: "Spartan Surge · side view",
  },
  {
    src: "/images/worn-spartan-inner.jpg",
    label: "Spartan Surge · wrap detail",
  },
  {
    src: "/images/achilles-strap-worn-agate.jpg",
    label: "Horus Agate · side view",
  },
  {
    src: "/images/achilles-strap-worn-electric.jpg",
    label: "Electric A · side view",
  },
];

export const strapFeatures = [
  {
    title: "Breathable mesh band",
    body: "Open-knit polyester/elastane wrap. Stays thin under kneepads and compression tights.",
  },
  {
    title: "Moisture-wicking liner",
    body: "Cool-touch inner face pulls sweat off skin during long rallies and fourth quarters.",
  },
  {
    title: "Silicone grip dots",
    body: "Low-profile grip matrix stops the strap from migrating when you plant, cut, or land.",
  },
  {
    title: "Soft silicone pad",
    body: "Contoured pressure pad on the inner face targets the patellar tendon — that is the therapeutic mechanism, not a shell cutout.",
  },
  {
    title: "Four-post snap system",
    body: "Continuous solid shells click onto the chassis. No decorative gap — pattern runs edge to edge.",
  },
  {
    title: "Low-bulk closure",
    body: "Micro-adjust hook-and-loop tab with a soft-backed end so it won’t chew through socks or skin.",
  },
];
