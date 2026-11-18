export type Riddle = {
  id: string
  prompt: string
  answer: string
  hint?: string
}

/** Hard kitchen-table riddles — thinkable, not scavenger hunts. */
export const RIDDLES: Riddle[] = [
  {
    id: 'mirror-debt',
    prompt:
      'I borrow every face that stands before me and return it unbroken when the light leaves. I never age, yet I am always as old as whoever looks. What am I?',
    answer: 'a mirror',
    hint: 'You meet me in the bathroom every morning.',
  },
  {
    id: 'steel-mustang',
    prompt:
      'I am called a wild horse, but I drink gasoline. I have no hooves, yet I leave rubber prints. Detroit named me; the highway made me famous. What am I?',
    answer: 'a Mustang',
    hint: 'A car that stole a horse’s name.',
  },
  {
    id: 'sunday-horse',
    prompt:
      'I have a mane but I am not a lion. Crowds roar when I run, yet I never choose the race. People bet on me and wash me down when it is over. What am I?',
    answer: 'a racehorse',
  },
  {
    id: 'coin-flip',
    prompt:
      'I have a head and a tail, but no body. I can be flipped but never broken. Presidents live on my face. What am I?',
    answer: 'a coin',
  },
  {
    id: 'kettle',
    prompt:
      'I have a spout but I do not speak. I have a handle but I am not a door. I whistle when the heat gets high. What am I?',
    answer: 'a kettle',
  },
  {
    id: 'road',
    prompt:
      'I stretch for miles without moving an inch. Cars race on my back, but I never get tired. Rain makes me shine. What am I?',
    answer: 'a road',
  },
  {
    id: 'newspaper',
    prompt:
      'I am bought in the morning and often thrown away by night. I carry scores, weather, and puzzles. Ink lives on my skin. What am I?',
    answer: 'a newspaper',
  },
  {
    id: 'airplane',
    prompt:
      'I have wings but I am not a bird. I carry hundreds through the clouds and leave white trails across blue sky. What am I?',
    answer: 'an airplane',
  },
  {
    id: 'banana',
    prompt:
      'I wear a jacket you peel, not one you button. Athletes eat me before a match; I travel in bunches. What am I?',
    answer: 'a banana',
  },
  {
    id: 'clock',
    prompt:
      'I have no tongue, but I announce the hour. I hang in towers and sit on nightstands. What am I?',
    answer: 'a clock',
  },
  {
    id: 'compass',
    prompt:
      'I have a needle but I never sew. Sailors and hikers trust me when the path is lost. What am I?',
    answer: 'a compass',
  },
  {
    id: 'snow',
    prompt:
      'I fall without a parachute and pile up without bricks. Children catch me on their tongues; drivers curse me on the freeway. What am I?',
    answer: 'snow',
  },
  {
    id: 'telescope',
    prompt:
      'I bring far things near for anyone who points me at the night. Astronomers keep me in the backyard. What am I?',
    answer: 'a telescope',
  },
  {
    id: 'echo',
    prompt:
      'I have no voice of my own, yet I answer every word you shout. Stand by a canyon and you may meet me. What am I?',
    answer: 'an echo',
  },
  {
    id: 'shadow',
    prompt:
      'I follow you in the sun and hide from you in the dark. I grow tall at dusk and shrink at noon. What am I?',
    answer: 'a shadow',
  },
  {
    id: 'candle',
    prompt:
      'I am tall when I am young and short when I am old. Fire eats me while I work. What am I?',
    answer: 'a candle',
  },
  {
    id: 'map',
    prompt:
      'I have cities but no houses, forests but no trees, and rivers but no water. Travelers fold me and still find their way. What am I?',
    answer: 'a map',
  },
  {
    id: 'fire',
    prompt:
      'I am not alive, but I grow. I need air, but I have no lungs. Water kills me. What am I?',
    answer: 'fire',
  },
  {
    id: 'hole',
    prompt:
      'The more you take from me, the bigger I become. Digging makes me. What am I?',
    answer: 'a hole',
  },
  {
    id: 'sponge',
    prompt:
      'I am full of holes but I still hold water. Squeeze me and I give it back. What am I?',
    answer: 'a sponge',
  },
  {
    id: 'secret',
    prompt:
      'If you have me, you want to share me. If you share me, you have not kept me. What am I?',
    answer: 'a secret',
  },
  {
    id: 'breath',
    prompt:
      'I am lighter than a feather, yet the strongest person cannot hold me for many minutes. What am I?',
    answer: 'breath',
  },
  {
    id: 'towel',
    prompt:
      'I get wetter the more I dry. You hang me when my work is done. What am I?',
    answer: 'a towel',
  },
  {
    id: 'piano',
    prompt:
      'I have many keys but cannot open a single door. People press me to make me sing. What am I?',
    answer: 'a piano',
  },
  {
    id: 'stamp',
    prompt:
      'I travel the world but stay in one corner. I get licked but never taste. What am I?',
    answer: 'a postage stamp',
  },
  {
    id: 'onion',
    prompt:
      'I make you cry without ever telling a joke. Peel me and I still have layers. What am I?',
    answer: 'an onion',
  },
  {
    id: 'coffin',
    prompt:
      'The person who makes me does not want me. The person who buys me does not need me. The person who uses me does not know it. What am I?',
    answer: 'a coffin',
  },
  {
    id: 'darkness',
    prompt:
      'I can fill a room, yet take up no space. The moment you bring light, I leave. What am I?',
    answer: 'darkness',
  },
  {
    id: 'egg',
    prompt:
      'I have a shell that is not armor, a white that is not snow, and a yolk that is not gold — until you cook me. What am I?',
    answer: 'an egg',
  },
  {
    id: 'river',
    prompt:
      'I run but never walk. I have a bed but never sleep. I have a mouth but never eat. What am I?',
    answer: 'a river',
  },
  {
    id: 'glove',
    prompt:
      'I have four fingers and a thumb, but I am not alive. Winter loves me; summer forgets me. What am I?',
    answer: 'a glove',
  },
  {
    id: 'bookshelf',
    prompt:
      'I have many stories but never speak. I stand against the wall and hold whole worlds in rows. What am I?',
    answer: 'a bookshelf',
  },
  {
    id: 'silence',
    prompt:
      'I am so fragile that saying my name breaks me. What am I?',
    answer: 'silence',
  },
  {
    id: 'stairs',
    prompt:
      'I go up and down but never move. People use me every day and leave me behind. What am I?',
    answer: 'stairs',
  },
  {
    id: 'comb',
    prompt:
      'I have teeth but cannot bite. I straighten what grows on your head. What am I?',
    answer: 'a comb',
  },
  {
    id: 'cloud',
    prompt:
      'I float without wings, cry without eyes, and sometimes hide the sun. What am I?',
    answer: 'a cloud',
  },
  {
    id: 'keyboard',
    prompt:
      'I have space but no room. I have keys but no locks. You type on me for hours. What am I?',
    answer: 'a keyboard',
  },
  {
    id: 'fence',
    prompt:
      'I have posts but never mail a letter. I keep neighbors honest and dogs curious. What am I?',
    answer: 'a fence',
  },
  {
    id: 'ice',
    prompt:
      'Alive without breath, as cold as death. Never thirsty, always drinking. Clad in mail, never clinking. What am I?',
    answer: 'ice',
  },
  {
    id: 'window',
    prompt:
      'I show you the outside while keeping weather out. Break me and I cut; clean me and I disappear into the view. What am I?',
    answer: 'a window',
  },
  {
    id: 'anchor',
    prompt:
      'I am heavy so ships may rest. Drop me and the voyage pauses; raise me and it begins again. What am I?',
    answer: 'an anchor',
  },
  {
    id: 'lighthouse',
    prompt:
      'I stand still while sailors move. My single eye sweeps the dark so wrecks stay rare. What am I?',
    answer: 'a lighthouse',
  },
  {
    id: 'hourglass',
    prompt:
      'I measure time with falling sand. Turn me over and I begin again. What am I?',
    answer: 'an hourglass',
  },
  {
    id: 'saddle',
    prompt:
      'I sit on a horse but I am not a rider. Leather is my skin; stirrups are my friends. What am I?',
    answer: 'a saddle',
  },
  {
    id: 'railroad',
    prompt:
      'I have tracks but leave no footprints. Trains know me by heart. What am I?',
    answer: 'a railroad',
  },
]

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const HISTORY_KEY = 'loom.riddle.history.v1'
const MAX_HISTORY = 20

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveHistory(ids: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(0, MAX_HISTORY)))
}

export function generateRiddle(avoidId?: string): Riddle {
  const history = typeof localStorage !== 'undefined' ? loadHistory() : []
  const blocked = new Set(history)
  if (avoidId) blocked.add(avoidId)

  let pool = RIDDLES.filter((r) => !blocked.has(r.id))
  if (pool.length === 0) {
    pool = RIDDLES.filter((r) => r.id !== avoidId)
    if (typeof localStorage !== 'undefined') saveHistory([])
  }

  const rng = mulberry32(hashString(`${Date.now()}-${Math.random()}`))
  const pick = pool[Math.floor(rng() * pool.length)]!

  if (typeof localStorage !== 'undefined') {
    saveHistory([pick.id, ...history.filter((id) => id !== pick.id)])
  }

  return pick
}

export function allRiddles(): Riddle[] {
  return [...RIDDLES]
}
