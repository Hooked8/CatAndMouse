export type Riddle = {
  id: string
  prompt: string
  /** Canonical answer — lowercase, exact spelling */
  answer: string
  nudge: string
}

/**
 * Kitchen-table newspaper riddles: familiar subjects, one clean answer.
 * The AI block is the edition mark on the contest page — not these prompts alone.
 */
export const RIDDLES: Riddle[] = [
  {
    id: 'steel-mustang',
    prompt:
      'I am called a wild horse, but I drink gasoline. I have no hooves, yet I leave rubber prints. Detroit gave me my name; the open road gave me my reputation. What am I?',
    answer: 'mustang',
    nudge: 'A famous car that borrowed a horse’s name.',
  },
  {
    id: 'sunday-horse',
    prompt:
      'I have a mane but I am not a lion. Crowds cheer when I run, yet I never choose the race. People bet on me and wash me down when it is over. What am I?',
    answer: 'racehorse',
    nudge: 'Think of the track, not the jungle.',
  },
  {
    id: 'pocket-full',
    prompt:
      'I have a head and a tail, but no body. I can be flipped but never broken. Presidents live on my face. What am I?',
    answer: 'coin',
    nudge: 'Something that jingles in a pocket.',
  },
  {
    id: 'kitchen-whistle',
    prompt:
      'I have a spout but I do not speak. I have a handle but I am not a door. I whistle when the heat gets high. What am I?',
    answer: 'kettle',
    nudge: 'Breakfast hears me before coffee is poured.',
  },
  {
    id: 'black-highway',
    prompt:
      'I stretch for miles without moving an inch. Cars race on my back, but I never get tired. Rain makes me shine. What am I?',
    answer: 'road',
    nudge: 'You drive on me every day.',
  },
  {
    id: 'morning-fold',
    prompt:
      'I am bought in the morning and often thrown away by night. I carry scores, weather, and puzzles. Ink lives on my skin. What am I?',
    answer: 'newspaper',
    nudge: 'Sunday mornings used to start with me.',
  },
  {
    id: 'iron-bird',
    prompt:
      'I have wings but I am not a bird. I carry hundreds through the clouds and leave white trails across blue sky. What am I?',
    answer: 'airplane',
    nudge: 'The gate closes before I leave.',
  },
  {
    id: 'green-jacket',
    prompt:
      'I wear a jacket you peel, not one you button. Athletes eat me before a match; I travel in bunches. What am I?',
    answer: 'banana',
    nudge: 'Yellow when ready, green when patient.',
  },
  {
    id: 'ring-master',
    prompt:
      'I have no tongue, but I announce the hour. I hang in towers and sit on nightstands. What am I?',
    answer: 'clock',
    nudge: 'Hands that never clap.',
  },
  {
    id: 'silent-pilot',
    prompt:
      'I have a needle but I never sew. Sailors and hikers trust me when the path is lost. What am I?',
    answer: 'compass',
    nudge: 'I always know which way is north.',
  },
  {
    id: 'diamond-dust',
    prompt:
      'I fall without a parachute and pile up without bricks. Children catch me on their tongues; drivers curse me on the freeway. What am I?',
    answer: 'snow',
    nudge: 'Winter’s quiet visitor.',
  },
  {
    id: 'glass-sky',
    prompt:
      'I bring far things near for anyone who points me at the night. Astronomers keep me in the backyard. What am I?',
    answer: 'telescope',
    nudge: 'Built for stars, not selfies.',
  },
]

export function riddleByIndex(index: number): Riddle {
  const i = ((index % RIDDLES.length) + RIDDLES.length) % RIDDLES.length
  return RIDDLES[i]!
}
