export type Riddle = {
  id: string
  prompt: string
  /** Canonical answer — lowercase, exact spelling required for the seal */
  answer: string
  /** Gentle nudge after a few misses — never the answer */
  nudge: string
}

/**
 * Newspaper-contest riddles: everyday subjects, one clean answer,
 * the kind you chew on over coffee. No scavenger hunts, no gadgets —
 * just a question worth thinking about.
 */
export const RIDDLES: Riddle[] = [
  {
    id: 'sunday-horse',
    prompt:
      'I have a mane but I am not a lion. I have a gallop you can hear from the stands, yet I never leave the track of my own free will. People bet on me, name me, and wash me down when the race is done. What am I?',
    answer: 'racehorse',
    nudge: 'Think of the track, not the jungle.',
  },
  {
    id: 'steel-mustang',
    prompt:
      'I am called a wild horse, but I drink gasoline. I have no hooves, yet I leave rubber prints. Detroit gave me my name; the open road gave me my reputation. What am I?',
    answer: 'mustang',
    nudge: 'A famous car that borrowed a horse’s name.',
  },
  {
    id: 'pocket-full',
    prompt:
      'I have a head, a tail, but no body. I can be flipped but never broken. Presidents live on my face, and I buy almost nothing alone. What am I?',
    answer: 'coin',
    nudge: 'Something that jingles in a pocket.',
  },
  {
    id: 'kitchen-river',
    prompt:
      'I have a spout but I do not speak. I have a handle but I am not a door. I whistle when I am angry with heat, and calm only when you take me off the flame. What am I?',
    answer: 'kettle',
    nudge: 'Breakfast hears me before coffee is poured.',
  },
  {
    id: 'black-highway',
    prompt:
      'I stretch for miles without moving an inch. Cars race on my back, but I never get tired. Rain makes me shine; snow makes me vanish under white. What am I?',
    answer: 'road',
    nudge: 'You drive on me every day.',
  },
  {
    id: 'silent-pilot',
    prompt:
      'I have a needle but I never sew. I have a face but I never frown. Sailors and hikers trust me when the sky is cloudy and the path is lost. What am I?',
    answer: 'compass',
    nudge: 'I always know which way is north.',
  },
  {
    id: 'glass-eye',
    prompt:
      'I have a lens but I am not a camera. I bring far things near and near things into focus. Astronomers point me at the night; birdwatchers hang me around their necks. What am I?',
    answer: 'telescope',
    nudge: 'One kind stands in the backyard; another fits in two hands — but this riddle wants the sky-watcher.',
  },
  {
    id: 'morning-fold',
    prompt:
      'I am bought in the morning and thrown away by night. I carry yesterday’s scores, today’s weather, and tomorrow’s puzzles. Ink lives on my skin until fingers smudge me grey. What am I?',
    answer: 'newspaper',
    nudge: 'You might be reading something like me right now — in another form.',
  },
  {
    id: 'ring-master',
    prompt:
      'I have no tongue, but I announce the hour. I hang in towers and sit on nightstands. Some wind me; some plug me in; all of us mark the same invisible river. What am I?',
    answer: 'clock',
    nudge: 'Hands that never clap.',
  },
  {
    id: 'diamond-dust',
    prompt:
      'I fall without a parachute, pile up without bricks, and disappear without a broom if the sun works hard enough. Children catch me on their tongues; drivers curse me on the freeway. What am I?',
    answer: 'snow',
    nudge: 'Winter’s quiet visitor.',
  },
  {
    id: 'green-jacket',
    prompt:
      'I wear a jacket you peel, not one you button. Inside I am pale; outside I am often green or yellow. Athletes eat me before a match; monkeys made me famous. What am I?',
    answer: 'banana',
    nudge: 'A fruit that travels in bunches.',
  },
  {
    id: 'iron-bird',
    prompt:
      'I have wings but I am not a bird. I have a nose but I do not smell. I carry hundreds through the clouds and leave white trails across blue sky. What am I?',
    answer: 'airplane',
    nudge: 'The gate closes before I leave.',
  },
]

export function riddleByIndex(index: number): Riddle {
  const i = ((index % RIDDLES.length) + RIDDLES.length) % RIDDLES.length
  return RIDDLES[i]!
}
