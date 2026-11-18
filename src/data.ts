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

/** Primary picker shells — circular Spartan aspis with Greek-key rim */
export const shells: Shell[] = [
  {
    id: "helmet",
    name: "Helmet",
    tagline: "Corinthian crest on Greek-key rim",
    logo: "Spartan helmet",
    palette: ["#111111", "#FFFFFF", "#2A2A2A", "#C8C8C8"],
    image: "/images/shields/shield-helmet.jpg",
    wornImage: "/images/shields/worn-shield-helmet.jpg",
    notes:
      "Circular aspis shell. Greek-key meander outlines the shield; helmet sits in the center field.",
  },
  {
    id: "lambda",
    name: "Lambda",
    tagline: "Bronze Λ arrow — A without the crossbar",
    logo: "Lambda / arrow",
    palette: ["#8B6914", "#C4A35A", "#3A2E14", "#1A1A1A", "#FFFFFF"],
    image: "/images/shields/shield-lambda.jpg",
    wornImage: "/images/shields/worn-shield-lambda.jpg",
    notes:
      "Weathered bronze face with open chevron Λ — reads as an arrow outline, not a full A.",
  },
  {
    id: "wreath",
    name: "Wreath",
    tagline: "Laurel wreath on black field",
    logo: "Laurel wreath",
    palette: ["#111111", "#FFFFFF", "#E8E8E8"],
    image: "/images/shields/shield-wreath.jpg",
    wornImage: "/images/shields/worn-shield-wreath.jpg",
    notes: "Clean athletic wreath mark inside the Greek-key shield ring.",
  },
  {
    id: "labyrinth",
    name: "Labyrinth",
    tagline: "Concentric maze circles",
    logo: "Circular labyrinth",
    palette: ["#111111", "#FFFFFF", "#333333"],
    image: "/images/shields/shield-labyrinth.jpg",
    wornImage: "/images/shields/worn-shield-labyrinth.jpg",
    notes: "Geometric maze of concentric paths — the circle-in-circle mark.",
  },
  {
    id: "pinecone",
    name: "Pinecone",
    tagline: "Stylized pinecone emblem",
    logo: "Pinecone",
    palette: ["#111111", "#FFFFFF", "#2C2C2C"],
    image: "/images/shields/shield-pinecone.jpg",
    wornImage: "/images/shields/worn-shield-pinecone.jpg",
    notes: "Bold botanical pinecone icon centered on the aspis field.",
  },
];

/** Extra patterned + combo variants for the full design board */
export const moreShields: Shell[] = [
  {
    id: "combo-hl",
    name: "Helmet + Lambda",
    tagline: "Crest over open Λ",
    logo: "Helmet + Lambda",
    palette: ["#111111", "#FFFFFF"],
    image: "/images/shields/shield-combo-helmet-lambda.jpg",
    wornImage: "/images/shields/worn-shield-helmet.jpg",
    notes: "Two marks stacked — helmet primary, lambda secondary.",
  },
  {
    id: "combo-wh",
    name: "Wreath + Helmet",
    tagline: "Laurel ring around the crest",
    logo: "Wreath + Helmet",
    palette: ["#111111", "#FFFFFF"],
    image: "/images/shields/shield-combo-wreath-helmet.jpg",
    wornImage: "/images/shields/worn-shield-wreath.jpg",
    notes: "Wreath frames the helmet for a victory-mark read.",
  },
  {
    id: "combo-lp",
    name: "Labyrinth + Pinecone",
    tagline: "Maze with pinecone core",
    logo: "Labyrinth + Pinecone",
    palette: ["#111111", "#FFFFFF"],
    image: "/images/shields/shield-combo-labyrinth-pinecone.jpg",
    wornImage: "/images/shields/worn-shield-labyrinth.jpg",
    notes: "Labyrinth rings with pinecone locked in the center.",
  },
  {
    id: "combo-wll",
    name: "Wreath · Maze · Lambda",
    tagline: "Three marks layered",
    logo: "Wreath + Labyrinth + Lambda",
    palette: ["#111111", "#FFFFFF"],
    image: "/images/shields/shield-combo-wreath-labyrinth-lambda.jpg",
    wornImage: "/images/shields/worn-shield-lambda.jpg",
    notes: "Full stack: wreath, maze, open Λ at the heart.",
  },
  {
    id: "prism",
    name: "Prism Labyrinth",
    tagline: "Rainbow face + maze mark",
    logo: "Labyrinth on prism",
    palette: ["#7B2CBF", "#00C2FF", "#B8F000", "#FF6B00", "#FF1E56"],
    image: "/images/shields/shield-prism-labyrinth.jpg",
    wornImage: "/images/shields/worn-shield-prism.jpg",
    notes: "Brand rainbow wave on circular aspis with Greek-key rim.",
  },
  {
    id: "violet",
    name: "Violet Lambda",
    tagline: "Lilac marble + open Λ",
    logo: "Lambda on violet",
    palette: ["#F3E8FF", "#C084FC", "#7C3AED", "#111111"],
    image: "/images/shields/shield-violet-lambda.jpg",
    wornImage: "/images/shields/worn-shield-violet-lambda.jpg",
    notes: "Purple marble field with black arrow-Λ.",
  },
  {
    id: "surge",
    name: "Surge Helmet",
    tagline: "Electric swirl + crest",
    logo: "Helmet on surge",
    palette: ["#6D28D9", "#2563EB", "#F472B6", "#FACC15"],
    image: "/images/shields/shield-surge-helmet.jpg",
    wornImage: "/images/shields/worn-shield-surge.jpg",
    notes: "High-energy marble with Spartan helmet center.",
  },
  {
    id: "agate",
    name: "Agate Wreath",
    tagline: "Navy gold geode + laurel",
    logo: "Wreath on agate",
    palette: ["#0B1C3F", "#1D4ED8", "#D4A017", "#FFFFFF"],
    image: "/images/shields/shield-agate-wreath.jpg",
    wornImage: "/images/shields/worn-shield-wreath.jpg",
    notes: "Premium geode face with white wreath mark.",
  },
  {
    id: "electric",
    name: "Electric Lambda",
    tagline: "Blue–magenta marble + Λ",
    logo: "Lambda on electric",
    palette: ["#1E3A8A", "#22D3EE", "#DB2777", "#FFFFFF"],
    image: "/images/shields/shield-electric-lambda.jpg",
    wornImage: "/images/shields/worn-shield-lambda.jpg",
    notes: "Streetwear marble with open arrow-Λ.",
  },
  {
    id: "bronze-pine",
    name: "Bronze Pinecone",
    tagline: "Antique aspis + pinecone",
    logo: "Pinecone on bronze",
    palette: ["#8B6914", "#C4A35A", "#3A2E14"],
    image: "/images/shields/shield-bronze-pinecone.jpg",
    wornImage: "/images/shields/worn-shield-pinecone.jpg",
    notes: "Battle-worn bronze shield with raised pinecone.",
  },
];

export const wornGallery = [
  {
    src: "/images/shields/worn-shield-helmet.jpg",
    label: "Helmet · light skin",
  },
  {
    src: "/images/shields/worn-shield-lambda.jpg",
    label: "Lambda · tan skin",
  },
  {
    src: "/images/shields/worn-shield-wreath.jpg",
    label: "Wreath · brown skin",
  },
  {
    src: "/images/shields/worn-shield-labyrinth.jpg",
    label: "Labyrinth · deep brown",
  },
  {
    src: "/images/shields/worn-shield-pinecone.jpg",
    label: "Pinecone · olive skin",
  },
  {
    src: "/images/shields/worn-shield-prism.jpg",
    label: "Prism labyrinth · worn",
  },
  {
    src: "/images/shields/worn-shield-violet-lambda.jpg",
    label: "Violet lambda · worn",
  },
  {
    src: "/images/shields/worn-shield-surge.jpg",
    label: "Surge helmet · worn",
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
    body: "Inner-face pad loads the patellar tendon — that is the therapeutic mechanism.",
  },
  {
    title: "Aspis snap shell",
    body: "Circular Spartan-shield shell with Greek-key rim. Solid face — no decorative gap. Logos swap in the center.",
  },
  {
    title: "Low-bulk closure",
    body: "Micro-adjust hook-and-loop tab with a soft-backed end so it won’t chew through socks or skin.",
  },
];
