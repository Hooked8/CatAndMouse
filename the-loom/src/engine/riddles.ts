export type Riddle = {
  id: string
  prompt: string
  /** Canonical answer — lowercase, single spelling */
  answer: string
  /** Gentle nudge shown after 3 wrong tries — never the answer */
  nudge: string
  /** Why this feels solvable but resists shallow guesses */
  difficulty: 'woven' | 'knotted' | 'sealed'
}

/**
 * Original lateral riddles with precise single answers.
 * Famous internet riddles are avoided so memorized AI corpora help less.
 * The filament (page-local) is what blocks paste-into-ChatGPT unlocks.
 */
export const RIDDLES: Riddle[] = [
  {
    id: 'mirror-debt',
    prompt:
      'Every morning I borrow a face that is not mine, wear it without permission, and return it unbroken when the light leaves. I never age, yet I am always the age of whoever stands before me. What am I?',
    answer: 'mirror',
    nudge: 'Think of something that only exists while you look at it.',
    difficulty: 'woven',
  },
  {
    id: 'silent-crowd',
    prompt:
      'I can fill a room so completely that nobody can enter, yet I weigh nothing and you can sweep me out with a single gesture. The brighter I am invited, the less of me remains. What am I?',
    answer: 'darkness',
    nudge: 'What vanishes the moment you welcome its opposite?',
    difficulty: 'woven',
  },
  {
    id: 'forward-prison',
    prompt:
      'I have cities but no houses, forests but no trees, and water but no fish. Travelers cross me for hours and never get wet or lost in woods. What am I?',
    answer: 'map',
    nudge: 'You hold the whole world of me in two hands.',
    difficulty: 'woven',
  },
  {
    id: 'hungry-clock',
    prompt:
      'I eat the hours you offer me, but I grow no heavier. Ignore me and I punish you; watch me and I still leave. I have a face and hands, yet I never wave hello. What am I?',
    answer: 'clock',
    nudge: 'Something on the wall that takes without taking space.',
    difficulty: 'woven',
  },
  {
    id: 'word-blade',
    prompt:
      'Break me and I still work. Touch me and I may sting. I am often found where silence was promised, and I can start a war without lifting a finger. Spoken once, I cannot be unspoken. What am I?',
    answer: 'secret',
    nudge: 'Once shared, I am no longer what I was.',
    difficulty: 'knotted',
  },
  {
    id: 'river-liar',
    prompt:
      'I run but never walk. I have a bed but never sleep. I have a mouth but never eat. Stand in me and time seems slower; leave me and your footprints vanish. What am I?',
    answer: 'river',
    nudge: 'Geography with a pulse.',
    difficulty: 'woven',
  },
  {
    id: 'unwritten-author',
    prompt:
      'The more of me you take, the more you leave behind. I am made of nothing solid, yet courts and footprints swear by me. Thieves fear me; dancers make me on purpose. What am I?',
    answer: 'footsteps',
    nudge: 'Evidence of where a body has been.',
    difficulty: 'knotted',
  },
  {
    id: 'keyless-lock',
    prompt:
      'I open every lock, yet I am not a key. I silence every alarm, yet I am not a code. Kings and beggars use me the same way, usually when nobody is watching. Too much of me and the door never mattered. What am I?',
    answer: 'permission',
    nudge: 'Not metal. Not digits. Something granted.',
    difficulty: 'sealed',
  },
  {
    id: 'half-alive',
    prompt:
      'Alive without breath, as cold as death. Never thirsty, always drinking. Clad in mail, never clinking. In winter I stand taller; in summer I shrink without leaving. What am I?',
    answer: 'ice',
    nudge: 'Water wearing armor.',
    difficulty: 'knotted',
  },
  {
    id: 'name-thief',
    prompt:
      'I have no voice, but I can repeat every word you say in your own tone. Ask me a question and I answer with your question. Stand beside a canyon and you may meet me. What am I?',
    answer: 'echo',
    nudge: 'A reply that owns nothing of its own.',
    difficulty: 'woven',
  },
  {
    id: 'equal-cut',
    prompt:
      'I am lighter than a feather, yet the strongest person cannot hold me for five minutes. I enter without knocking and leave without farewell. Panic makes me scarce; calm invites me back. What am I?',
    answer: 'breath',
    nudge: 'You are using me to read this.',
    difficulty: 'knotted',
  },
  {
    id: 'future-ash',
    prompt:
      'I am not alive, but I grow. I do not have lungs, but I need air. I do not have a mouth, but water kills me. Give me wood and I sing; give me night and I paint the walls gold. What am I?',
    answer: 'fire',
    nudge: 'A hungry dancer that fears the rain.',
    difficulty: 'woven',
  },
]

export function riddleByIndex(index: number): Riddle {
  const i = ((index % RIDDLES.length) + RIDDLES.length) % RIDDLES.length
  return RIDDLES[i]!
}
