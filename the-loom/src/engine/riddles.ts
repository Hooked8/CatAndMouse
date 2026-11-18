export type HardRiddle = {
  id: string
  title: string
  prompt: string
  coreAnswer: string
  whyHard: string
}

/** Multi-step puzzles meant to take a long sit — not one-liner trivia. */
export const RIDDLE_BANK: HardRiddle[] = [
  {
    id: 'three-doors',
    title: 'The Three Doors',
    prompt: `Three doors stand in a windowless hall.

Behind one door is the only way out. Behind the other two: ruin.
Each door has one plate. Exactly one plate is true; the other two are false.

Left plate: "The middle door is safe."
Middle plate: "This door is safe."
Right plate: "The left door is ruin."

You may open only one door. Which do you open?

Answer with: left, middle, or right.`,
    coreAnswer: 'right',
    whyHard:
      'Exactly-one-true casework eliminates left and middle; only right survives.',
  },
  {
    id: 'bridge-ranks',
    title: 'Four Across the Bridge',
    prompt: `Four people must cross a bridge at night with one flashlight.
At most two cross at a time. Anyone crossing needs the flashlight. The flashlight must be brought back except after the final crossing. A pair moves at the slower person’s pace.

Times: Ava 1, Beau 2, Cy 5, Dee 10 (minutes).

What is the shortest total time for all four to cross?

Answer with a number only.`,
    coreAnswer: '17',
    whyHard: 'Optimal path is 17, not the tempting 19.',
  },
  {
    id: 'weighing-balls',
    title: 'Twelve Balls',
    prompt: `Twelve balls. Eleven identical. One is different — heavier or lighter, unknown which.

Balance scale. Three uses only. You must find the odd ball and whether it is heavy or light.

In a correct first weighing of the standard strategy, how many balls sit on each pan?

Answer with a number.`,
    coreAnswer: '4',
    whyHard: 'Must start 4 vs 4, never 6 vs 6.',
  },
  {
    id: 'poisoned-bottle',
    title: 'One Bottle in a Thousand',
    prompt: `1000 bottles, exactly one poisoned.
Poison kills a mouse in exactly 24 hours. You have one test window: administer now, read results once at 24 hours.
You must guarantee identifying the poisoned bottle.

What is the minimum number of mice required?

Answer with a number.`,
    coreAnswer: '10',
    whyHard: 'Binary encoding: 2^10 = 1024 ≥ 1000.',
  },
  {
    id: 'hat-logic',
    title: 'Blue and Red Hats',
    prompt: `Three perfect logicians in a line. Hats are red or blue.
C sees A and B. B sees A. A sees nothing.
They know there is at least one red hat. They speak in order C, then B, then A, each saying a color or "pass".

C says pass. B says pass. A then correctly names A’s own hat color.

What color is A’s hat?

Answer: red or blue.`,
    coreAnswer: 'red',
    whyHard: 'Common-knowledge elimination after two passes forces red.',
  },
  {
    id: 'ages-product',
    title: 'Product of Ages',
    prompt: `A census taker asks for three daughters’ ages.

Mother: "The product of their ages is 36."
Census taker: not enough information.
Mother: "The sum of their ages equals the house number next door."
Census taker looks next door, still cannot tell.
Mother: "My oldest daughter has her own room."
Census taker then knows.

What are the three ages?

Answer ascending like 2,2,9.`,
    coreAnswer: '2,2,9',
    whyHard:
      'Only 2+2+9 shares its sum with another factorization yet has a unique oldest.',
  },
  {
    id: 'sum-product',
    title: 'Sum and Product',
    prompt: `X and Y are integers, 2 ≤ X ≤ Y, X+Y < 100.
S is told X+Y. P is told X·Y. Both are perfect logicians.

P: I cannot find the numbers.
S: I knew you couldn’t.
P: Then I now know the numbers.
S: Then I now know too.

What are X and Y?

Answer like 4,13.`,
    coreAnswer: '4,13',
    whyHard: 'Freudenthal’s sum-product puzzle — long elimination.',
  },
  {
    id: 'cheryl-birthday',
    title: 'Cheryl’s Birthday',
    prompt: `Possible dates:

May 15, May 16, May 19,
June 17, June 18,
July 14, July 16,
August 14, August 15, August 17.

Albert knows the month; Bernard knows the day.

Albert: I don't know when Cheryl's birthday is, but I know that Bernard does not know too.
Bernard: At first I don't know when Cheryl's birthday is, but I know now.
Albert: Then I also know when Cheryl's birthday is.

What is the birthday?

Answer like July 16.`,
    coreAnswer: 'july 16',
    whyHard: 'Multi-stage elimination across months and days.',
  },
  {
    id: 'green-eyed',
    title: 'Green Eyes',
    prompt: `100 perfect logicians have green eyes. Each can see others’ eyes, not their own. Blue-eyed people also live there; nobody discusses eye color. If a green-eyed person deduces their own eye color, they leave at midnight that night.

A visitor says publicly: "I see someone with green eyes."

On which night do the 100 green-eyed logicians leave?

Answer with a number.`,
    coreAnswer: '100',
    whyHard: 'Induction / common knowledge — night 100.',
  },
  {
    id: 'books-ant',
    title: 'The Ant and the Volumes',
    prompt: `Three volumes on a shelf in order left to right: I, II, III, touching.
Each cover is 1/8 inch. Each text block is 1 inch.

An ant eats straight from the first page of Volume I to the last page of Volume III.

How many inches does it eat through?

Answer as a decimal like 1.25.`,
    coreAnswer: '1.25',
    whyHard:
      'First page of I faces right; last page of III faces left — only II plus two inner covers.',
  },
  {
    id: 'labeled-jars',
    title: 'Three Jars',
    prompt: `Three jars: peaches, plums, mixed. All three labels are wrong.
You may draw one fruit from only one jar, then must label all three correctly.

Which jar do you draw from?

Answer with the word on that jar’s (wrong) label: peaches, plums, or mixed.`,
    coreAnswer: 'mixed',
    whyHard: 'Only the jar labeled mixed yields a forced chain.',
  },
  {
    id: 'two-ropes',
    title: 'Two Ropes',
    prompt: `Two ropes each burn in exactly 60 minutes, but unevenly (half length ≠ 30 minutes).
Measure exactly 45 minutes using only the ropes and a lighter.

In the standard solution, how many rope-ends do you ignite in total across the whole procedure?

Answer with a number.`,
    coreAnswer: '5',
    whyHard: 'Light three ends at t=0, then one more at t=30 — five ends.',
  },
  {
    id: 'ladder-ship',
    title: 'The Ship Ladder',
    prompt: `A rope ladder hangs on a ship’s side. Rungs are one foot apart. The bottom rung touches the water.
Tide rises 6 inches per hour for 3 hours.

How many rungs are underwater after 3 hours?

Answer with a number.`,
    coreAnswer: '0',
    whyHard: 'Ship rises with the tide.',
  },
  {
    id: 'river-wolves',
    title: 'Fox, Goose, Grain',
    prompt: `Move fox, goose, and grain across a river. Boat holds you plus at most one item.
Fox alone with goose → goose eaten. Goose alone with grain → grain eaten.

Minimum number of crossings to get all across safely?

Answer with a number.`,
    coreAnswer: '7',
    whyHard: 'Easy to miscount as 5.',
  },
  {
    id: 'coin-bags',
    title: 'Nine Bags',
    prompt: `Nine bags. Exactly one bag is all counterfeit coins (9g). Real coins are 10g.
One numeric weighing on a digital scale.

You take 1 coin from bag 1, 2 from bag 2, … 9 from bag 9, and weigh them all together.

If the deficit from the all-genuine weight is 7 grams, which bag is counterfeit?

Answer with a number.`,
    coreAnswer: '7',
    whyHard: 'Deficit equals bag index.',
  },
  {
    id: 'monty-twist',
    title: 'Three Cups',
    prompt: `A stone is under one of three cups (equal odds). You pick cup 1.
The host always opens an empty cup you didn’t pick. He opens cup 2 (empty), then offers a switch to cup 3.
If he has two empty choices, he always opens the lower number (you know this).

To maximize winning chance, do you swap to cup 3?

Answer: swap or stay.`,
    coreAnswer: 'swap',
    whyHard: 'Still swap; posterior favors 3.',
  },
  {
    id: 'widow-sister',
    title: 'Same Day, Not Twins',
    prompt: `Two sisters born the same hour of the same day of the same year. They look alike. They are not twins.

What are they?

Answer in one word.`,
    coreAnswer: 'triplets',
    whyHard: 'Third sibling overlooked.',
  },
  {
    id: 'forward-room',
    title: 'The Seventh Floor',
    prompt: `A man lives on floor 10. He rides the elevator to the ground each morning.
Coming home he rides to floor 7 and walks the rest — unless it is raining, when he rides all the way to 10.

Why?

Answer in a short phrase.`,
    coreAnswer: 'he is a dwarf',
    whyHard: 'Can only reach button 7 unless using an umbrella.',
  },
  {
    id: 'bear-hunter',
    title: 'The Bear',
    prompt: `A hunter walks 1 km south, 1 km east, shoots a bear, then 1 km north back to camp.

What color is the bear?

Answer with a color.`,
    coreAnswer: 'white',
    whyHard: 'North Pole → polar bear.',
  },
  {
    id: 'missing-dollar',
    title: 'The Hotel Desk',
    prompt: `Three guests pay $30. Room is actually $25. Bellhop should return $5, keeps $2, gives $1 back to each guest.
Each guest paid $9 → $27, plus $2 kept → $29. Where is the missing dollar?

Answer with a short diagnosis of the trick (not a money amount).`,
    coreAnswer: 'bad accounting',
    whyHard: 'The $27 already includes the $2; adding them is the error.',
  },
  {
    id: 'truth-fork',
    title: 'Would You Say Yes',
    prompt: `Two doors (home / death). Two guards (truth / lie). Unknown who is who.
You ask one guard: "If I asked you whether the left door leads home, would you say yes?"
The guard answers "No."

Does the left door lead home?

Answer yes or no.`,
    coreAnswer: 'no',
    whyHard: 'Embedded question double-negates for the liar.',
  },
  {
    id: 'surgeon',
    title: 'The Emergency',
    prompt: `A father and son crash. The father dies. The son needs surgery. The surgeon says, "I cannot operate — this is my son."

How is this possible?

Answer in a few words.`,
    coreAnswer: 'the surgeon is his mother',
    whyHard: 'Assumption trap.',
  },
  {
    id: 'black-kettle',
    title: 'Lighter Barrel',
    prompt: `What can you put into a wooden barrel to make it lighter to lift?

Answer in one word.`,
    coreAnswer: 'holes',
    whyHard: 'Removing wood, not adding gas.',
  },
  {
    id: 'light-switches',
    title: 'Three Switches',
    prompt: `Three downstairs switches. One controls a single upstairs bulb. You may flip switches, then walk upstairs only once.

In the classic solution, how many switches do you turn to the ON position at some point before going upstairs?

Answer with a number.`,
    coreAnswer: '2',
    whyHard: 'Two are turned on (one later turned off); one never on.',
  },
  {
    id: 'splitting-pills',
    title: 'Poison Pills',
    prompt: `Four pills: two safe (1.0g), two poison (0.9g). Labels gone.
One numeric weighing. Can you guarantee identifying both safe pills?

Answer yes or no.`,
    coreAnswer: 'yes',
    whyHard: 'Weigh three pills; 3.0 / 2.9 / 2.8 separate all cases.',
  },
]
