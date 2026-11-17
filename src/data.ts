export type Shell = {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  palette: string[];
  image: string;
  wornImage?: string;
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
      "Direct lift from the brand’s rainbow wave language. High-visibility court energy for night games and highlights.",
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
      "Cleaner, more fashion-forward colorway. Reads as accessory first, support second.",
  },
  {
    id: "spartan",
    name: "Spartan Surge",
    tagline: "Electric swirl with crest helmet icon",
    logo: "Spartan helmet",
    palette: ["#6D28D9", "#2563EB", "#F472B6", "#FACC15", "#FB923C"],
    image: "/images/shell-03-spartan-surge.jpg",
    notes:
      "Aggressive game-day shell. Helmet mark sits above the cutout so it stays readable when strapped.",
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
      "Premium dark colorway for travel kits and pro looks. Gold veining adds jewelry-level finish.",
  },
  {
    id: "electric",
    name: "Electric A",
    tagline: "Blue–magenta liquid marble with boxed A",
    logo: "Boxed A",
    palette: ["#1E3A8A", "#2563EB", "#22D3EE", "#DB2777", "#F472B6"],
    image: "/images/shell-05-electric-a.jpg",
    notes:
      "Minimal brand hit over maximal pattern. Matches the streetwear pant color story.",
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
    body: "Contoured pressure pad targets the patellar tendon — support without thick neoprene bulk.",
  },
  {
    title: "Four-post snap system",
    body: "Shells click onto the chassis in seconds. Swap colorways between warmups and match play.",
  },
  {
    title: "Low-bulk closure",
    body: "Micro-adjust hook-and-loop tab with a soft-backed end so it won’t chew through socks or skin.",
  },
];
