import { chance, createRng, pick, range } from './rng'

export type Archetype =
  | 'space-hero'
  | 'mech-guardian'
  | 'kaiju-mini'
  | 'fantasy-knight'
  | 'street-racer'
  | 'cute-critter'
  | 'steampunk-pilot'
  | 'neon-ninja'
  | 'dino-rider'
  | 'crystal-mage'

export type DesignSpec = {
  id: string
  seed: number
  name: string
  archetype: Archetype
  tagline: string
  businessIdea: string
  printNotes: string
  priceHint: string
  palette: [string, string, string]
  proportions: {
    height: number
    torso: number
    head: number
    limb: number
    armor: number
    detail: number
  }
  features: {
    cape: boolean
    wings: boolean
    horns: boolean
    backpack: boolean
    weapon: boolean
    helmet: boolean
    tail: boolean
    base: boolean
  }
}

const ARCHETYPES: Archetype[] = [
  'space-hero',
  'mech-guardian',
  'kaiju-mini',
  'fantasy-knight',
  'street-racer',
  'cute-critter',
  'steampunk-pilot',
  'neon-ninja',
  'dino-rider',
  'crystal-mage',
]

const PREFIX: Record<Archetype, string[]> = {
  'space-hero': ['Nova', 'Orbit', 'Pulse', 'Astra', 'Quasar', 'Vega'],
  'mech-guardian': ['Titan', 'Aegis', 'Bolt', 'Forge', 'Iron', 'Unit'],
  'kaiju-mini': ['Rift', 'Roar', 'Scale', 'Ember', 'Volcan', 'Tide'],
  'fantasy-knight': ['Oath', 'Rune', 'Valor', 'Shield', 'Crown', 'Blade'],
  'street-racer': ['Drift', 'Turbo', 'Spark', 'Grid', 'Nitro', 'Rush'],
  'cute-critter': ['Puff', 'Bean', 'Mochi', 'Pip', 'Noodle', 'Bumble'],
  'steampunk-pilot': ['Brass', 'Gear', 'Cloud', 'Valve', 'Sky', 'Cog'],
  'neon-ninja': ['Shade', 'Volt', 'Ghost', 'Circuit', 'Flash', 'Echo'],
  'dino-rider': ['Fang', 'Ridge', 'Stampede', 'Claw', 'Trail', 'Thunder'],
  'crystal-mage': ['Prism', 'Lumen', 'Shard', 'Aura', 'Glint', 'Arc'],
}

const SUFFIX: Record<Archetype, string[]> = {
  'space-hero': ['Ranger', 'Captain', 'Scout', 'Commander', 'Ace'],
  'mech-guardian': ['Mk-II', 'Defender', 'Core', 'Sentinel', 'Chassis'],
  'kaiju-mini': ['Cub', 'Spawn', 'Whelp', 'Jr.', 'Mini'],
  'fantasy-knight': ['Paladin', 'Warden', 'Squire', 'Champion', 'Guard'],
  'street-racer': ['Pilot', 'Racer', 'Crew', 'Driver', 'Legend'],
  'cute-critter': ['Buddy', 'Pal', 'Pet', 'Friend', 'Charm'],
  'steampunk-pilot': ['Aviator', 'Captain', 'Navigator', 'Engineer'],
  'neon-ninja': ['Operative', 'Shadow', 'Runner', 'Agent'],
  'dino-rider': ['Rider', 'Tamer', 'Scout', 'Hunter'],
  'crystal-mage': ['Seer', 'Weaver', 'Oracle', 'Sage'],
}

const TAGLINES: Record<Archetype, string[]> = {
  'space-hero': [
    'Hero pose, magnetic boots, ready for display shelves.',
    'Bold silhouette that photographs like a collectible.',
  ],
  'mech-guardian': [
    'Chunky armor plates tuned for FDM layer lines.',
    'Modular look—print as a desk guardian statue.',
  ],
  'kaiju-mini': [
    'Pocket monster energy with printable stance.',
    'Roaring silhouette that kids and collectors both grab.',
  ],
  'fantasy-knight': [
    'Classic tabletop hero energy with a solid print base.',
    'Banner-ready pose for shelf or dice-tower sidekick.',
  ],
  'street-racer': [
    'Dynamic lean that feels mid-drift on a shelf.',
    'Helmet + suit detailing that pops after a quick paint.',
  ],
  'cute-critter': [
    'Chibi proportions engineered for zero-fail prints.',
    'Gift-shop friendly—print a whole color pack overnight.',
  ],
  'steampunk-pilot': [
    'Goggles, coat, and gear details that sell the story.',
    'Victorian-future charm for makers who love paint jobs.',
  ],
  'neon-ninja': [
    'Sharp angles, stealth stance, night-city energy.',
    'Looks killer in glow filament or dual-color prints.',
  ],
  'dino-rider': [
    'Rider + mount combo that dominates a print bed.',
    'Adventure toy energy parents actually want to buy.',
  ],
  'crystal-mage': [
    'Faceted crystal accents catch light on the shelf.',
    'Fantasy display piece with elegant silhouette.',
  ],
}

const BUSINESS: Record<Archetype, string[]> = {
  'space-hero': [
    'Sell painted 6" heroes on Etsy as “desktop explorers” — $28–$45 each after a simple spray + wash.',
    'Bundle unpainted packs of 3 for makerspaces and birthday party “paint your hero” kits.',
  ],
  'mech-guardian': [
    'Offer desk guardians to tech offices — corporate gift packs of 5 in brand colors.',
    'List STL variants as “print farm favorites” on MakerWorld / Printables with tip-jar links.',
  ],
  'kaiju-mini': [
    'Blind-bag style: print 8 color variants, sell mystery minis at $12 at craft fairs.',
    'Pair with LED bases for night-light kaiju — upsell to $35 finished product.',
  ],
  'fantasy-knight': [
    'Sell as RPG party packs (tank/mage/rogue) to D&D groups — $40 for a painted trio.',
    'Offer custom crest swap for wedding cake toppers / anniversary gifts.',
  ],
  'street-racer': [
    'Print team colors for local karting clubs as trophies and merch.',
    'Sell “pit crew” multi-packs unpainted to model hobby shops on consignment.',
  ],
  'cute-critter': [
    'Highest volume SKU: pastel filament packs for teachers’ desk pets at $8–$15.',
    'Seasonal recolors (Halloween, holidays) keep the same mesh earning all year.',
  ],
  'steampunk-pilot': [
    'Premium paint jobs for convention booths — $55–$80 finished display pieces.',
    'Offer brass-look filament versions as keychain charms at maker fairs.',
  ],
  'neon-ninja': [
    'Glow-in-the-dark filament + black stands = Instagram-ready product photos that convert.',
    'Sell as phone-stand hybrids (ninja holding a device ledge) for higher ASP.',
  ],
  'dino-rider': [
    'Parent gift set: rider + dino + display card — perfect for birthday upsells.',
    'School STEM booths love these; sell unpainted kits with a one-page paint guide.',
  ],
  'crystal-mage': [
    'Translucent filament + LED puck = premium night-light SKU at $40+.',
    'Offer “spell color” custom orders (blue frost, ruby fire) for personalization fees.',
  ],
}

const PRINT_NOTES: Record<Archetype, string> = {
  'space-hero': '0.16–0.2mm layers, 15% gyroid infill, tree supports under arms. Scale to 80–120mm tall.',
  'mech-guardian': 'Print upright. 0.2mm layers, 20% infill. Optional split at waist for easier painting.',
  'kaiju-mini': 'Very stable base. 0.16mm for teeth/claws. Minimal supports if posed carefully.',
  'fantasy-knight': 'Supports under cape & weapon. 0.12mm for armor edges if your printer allows.',
  'street-racer': 'Lean pose needs a brim. PETG recommended for thin limbs.',
  'cute-critter': 'Beginner-friendly: no supports at default pose. Great for multi-color AMS swaps.',
  'steampunk-pilot': 'Supports under coat tails. Bronze/silk PLA sells the look without paint.',
  'neon-ninja': 'Print with brim. Glow PLA + black PLA two-tone if dual extruder available.',
  'dino-rider': 'Large footprint—use 0.28mm draft for farm batches, refine hero units at 0.16mm.',
  'crystal-mage': 'Translucent PLA/PETG. Hollow crystal accents with 2–3 perimeters for glow.',
}

const PALETTES: Record<Archetype, [string, string, string][]> = {
  'space-hero': [
    ['#1B4D89', '#F2C14E', '#E8EEF7'],
    ['#0D7377', '#32E0C4', '#212121'],
  ],
  'mech-guardian': [
    ['#3D5A5B', '#E07A3D', '#C5D5D6'],
    ['#2C3E50', '#E74C3C', '#95A5A6'],
  ],
  'kaiju-mini': [
    ['#2D6A4F', '#D8F3DC', '#FFB703'],
    ['#6A4C93', '#F72585', '#4CC9F0'],
  ],
  'fantasy-knight': [
    ['#1D3557', '#A8DADC', '#E63946'],
    ['#3C2F2F', '#C9A227', '#F1FAEE'],
  ],
  'street-racer': [
    ['#111111', '#FF3B3B', '#F5F5F5'],
    ['#0B132B', '#5BC0BE', '#FFD60A'],
  ],
  'cute-critter': [
    ['#FF8FAB', '#FFE5EC', '#FB6F92'],
    ['#90DBF4', '#FBF8CC', '#F48C06'],
  ],
  'steampunk-pilot': [
    ['#5C4033', '#C4A574', '#1A1A1A'],
    ['#3E2723', '#D4A373', '#8D99AE'],
  ],
  'neon-ninja': [
    ['#0F0F0F', '#39FF14', '#222222'],
    ['#101820', '#FEE715', '#1B1B1B'],
  ],
  'dino-rider': [
    ['#588157', '#DAD7CD', '#BC6C25'],
    ['#344E41', '#A3B18A', '#DDA15E'],
  ],
  'crystal-mage': [
    ['#4A1942', '#9B5DE5', '#F15BB5'],
    ['#22577A', '#38A3A5', '#C7F9CC'],
  ],
}

const PRICE: Record<Archetype, string> = {
  'space-hero': 'Unpainted $18 · Painted $35–$48',
  'mech-guardian': 'Unpainted $22 · Painted $40–$55',
  'kaiju-mini': 'Blind bag $10–$14 · LED set $32',
  'fantasy-knight': 'Single $20 · Party pack $55',
  'street-racer': 'Unpainted $16 · Trophy paint $45',
  'cute-critter': 'Desk pet $8–$15 · Seasonal pack $28',
  'steampunk-pilot': 'Raw $20 · Convention paint $60–$80',
  'neon-ninja': 'Glow print $18 · Phone-stand hybrid $36',
  'dino-rider': 'Combo kit $24 · Painted $50',
  'crystal-mage': 'Translucent $22 · LED night-light $42',
}

function archetypeLabel(a: Archetype) {
  return a
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ')
}

export function generateDesign(seed = (Math.random() * 2 ** 31) | 0): DesignSpec {
  const rng = createRng(seed)
  const archetype = pick(rng, ARCHETYPES)
  const name = `${pick(rng, PREFIX[archetype])} ${pick(rng, SUFFIX[archetype])}`
  const palette = pick(rng, PALETTES[archetype])

  const features = {
    cape: chance(rng, archetype === 'fantasy-knight' || archetype === 'space-hero' ? 0.55 : 0.15),
    wings: chance(rng, archetype === 'crystal-mage' || archetype === 'kaiju-mini' ? 0.45 : 0.08),
    horns: chance(rng, archetype === 'kaiju-mini' || archetype === 'dino-rider' ? 0.7 : 0.12),
    backpack: chance(rng, archetype === 'space-hero' || archetype === 'mech-guardian' ? 0.65 : 0.2),
    weapon: chance(rng, archetype === 'cute-critter' ? 0.05 : 0.55),
    helmet: chance(rng, archetype === 'street-racer' || archetype === 'space-hero' || archetype === 'steampunk-pilot' ? 0.75 : 0.35),
    tail: chance(rng, archetype === 'kaiju-mini' || archetype === 'cute-critter' || archetype === 'dino-rider' ? 0.8 : 0.1),
    base: chance(rng, 0.85),
  }

  return {
    id: `pf-${seed.toString(36)}`,
    seed,
    name,
    archetype,
    tagline: pick(rng, TAGLINES[archetype]),
    businessIdea: pick(rng, BUSINESS[archetype]),
    printNotes: PRINT_NOTES[archetype],
    priceHint: PRICE[archetype],
    palette,
    proportions: {
      height: range(rng, 0.85, 1.2),
      torso: range(rng, 0.85, 1.15),
      head: range(rng, archetype === 'cute-critter' ? 1.15 : 0.85, archetype === 'cute-critter' ? 1.45 : 1.2),
      limb: range(rng, 0.85, 1.2),
      armor: range(rng, 0.7, 1.3),
      detail: range(rng, 0.6, 1.4),
    },
    features,
  }
}

export function archetypeTitle(a: Archetype) {
  return archetypeLabel(a)
}

export function freshSeed() {
  return (Date.now() ^ ((Math.random() * 2 ** 31) | 0)) >>> 0
}
