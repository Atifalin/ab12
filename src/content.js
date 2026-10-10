// ---------- content ----------
export const LETTERS = {
  A: ['Apple', '🍎'], B: ['Banana', '🍌'], C: ['Cat', '🐱'], D: ['Dog', '🐶'], E: ['Elephant', '🐘'],
  F: ['Fish', '🐟'], G: ['Grapes', '🍇'], H: ['Horse', '🐴'], I: ['Ice cream', '🍦'], J: ['Juice', '🍹'],
  K: ['Kite', '🪁'], L: ['Lion', '🦁'], M: ['Monkey', '🐵'], N: ['Nest', '🪺'], O: ['Orange', '🍊'],
  P: ['Parrot', '🦜'], Q: ['Queen', '👸'], R: ['Rabbit', '🐰'], S: ['Ship', '🚢'], T: ['Tiger', '🐯'],
  U: ['Umbrella', '☂️'], V: ['Violin', '🎻'], W: ['Whale', '🐳'], X: ['Xylophone', '🎼'], Y: ['Yo-yo', '🪀'],
  Z: ['Zebra', '🦓'],
};
export const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
// Phonetic letter names — a lone "C" makes TTS say "capital C", "see" doesn't.
export const PHON = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye',
  J: 'jay', K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar',
  S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double-you', X: 'ex', Y: 'why', Z: 'zee',
};
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
export const COUNT_EMOJI = ['🍎', '⭐', '🎈', '🍓', '🐥', '🚗', '🍪', '🐸', '🌼', '🦆', '🍩'];

export const SMASH = [
  ['🍎', 'Apple'], ['🍌', 'Banana'], ['🍉', 'Watermelon'], ['🍓', 'Strawberry'], ['🥕', 'Carrot'], ['🥦', 'Broccoli'],
  ['🌽', 'Corn'], ['🍇', 'Grapes'], ['🍍', 'Pineapple'], ['🥑', 'Avocado'], ['🍋', 'Lemon'], ['🍒', 'Cherries'],
  ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐭', 'Mouse'], ['🐰', 'Bunny'], ['🦊', 'Fox'], ['🐻', 'Bear'], ['🐼', 'Panda'],
  ['🐨', 'Koala'], ['🐯', 'Tiger'], ['🦁', 'Lion'], ['🐮', 'Cow'], ['🐷', 'Pig'], ['🐸', 'Frog'], ['🐵', 'Monkey'],
  ['🐔', 'Chicken'], ['🐧', 'Penguin'], ['🦆', 'Duck'], ['🦉', 'Owl'], ['🐝', 'Bee'], ['🦋', 'Butterfly'],
  ['🐢', 'Turtle'], ['🐙', 'Octopus'], ['🦀', 'Crab'], ['🐳', 'Whale'], ['🦒', 'Giraffe'], ['🦓', 'Zebra'],
  ['🦄', 'Unicorn'], ['🐘', 'Elephant'], ['🦖', 'Dinosaur'],
  ['🚗', 'Car'], ['🚕', 'Taxi'], ['🚌', 'Bus'], ['🚑', 'Ambulance'], ['🚒', 'Fire truck'], ['🚚', 'Truck'],
  ['🚜', 'Tractor'], ['🏎️', 'Race car'], ['🚂', 'Train'], ['✈️', 'Airplane'], ['🚁', 'Helicopter'], ['🚀', 'Rocket'],
  ['🛵', 'Scooter'], ['🚲', 'Bicycle'], ['⛵', 'Boat'], ['🚓', 'Police car'],
  ['🤪', 'Silly face'], ['😜', 'Wink'], ['🤡', 'Clown'], ['👻', 'Ghost'], ['🤖', 'Robot'], ['👾', 'Monster'],
  ['🎈', 'Balloon'], ['🌈', 'Rainbow'], ['⭐', 'Star'], ['🎉', 'Party'], ['🧸', 'Teddy bear'], ['🦕', 'Dino'],
];

export const COLORS = ['#ff5c8a', '#ff9f1c', '#ffe94d', '#4cd964', '#2fb8ff', '#8a63ff', '#ff6b6b', '#00c9a7', '#ff77e9', '#5c7cfa', '#f77f00', '#06d6a0', '#e63946', '#118ab2'];
export const BG = ['#ff5c8a', '#ff8c42', '#ffd23f', '#3ddc84', '#2fb8ff', '#8a63ff', '#ff4f79', '#00c2a8', '#f368e0', '#5468ff', '#ff6f3c', '#20c997'];
export const CHEERS = ['Yay!', 'Wow!', 'Great job!', 'Woohoo!', 'Awesome!', 'Hooray!', 'Super!', 'You did it!'];
export const WORDS = [
  ['Cat','🐱'],['Dog','🐶'],['Cow','🐮'],['Pig','🐷'],['Hen','🐔'],['Fox','🦊'],['Bee','🐝'],['Owl','🦉'],
  ['Fish','🐟'],['Duck','🦆'],['Frog','🐸'],['Bus','🚌'],['Car','🚗'],['Sun','☀️'],['Moon','🌙'],['Star','⭐'],
  ['Ball','⚽'],['Book','📖'],['Cake','🎂'],['Milk','🥛'],['Egg','🥚'],['Apple','🍎'],['Hat','🎩'],['Bed','🛏️'],
  ['Box','📦'],['Toy','🧸'],['Red','🔴'],['Blue','🔵'],['Mom','👩'],['Mama','👩'],['Dad','👨'],['Dada','👨'],
  ['Baby','👶'],['Love','❤️'],['Zoo','🦁'],['Yes','👍'],
];
export const FAMILY = ['Ezdan','Zohaan','Ahad','Ayat','Ayzal','Ali','Atif','Salma','Saqib','Heena','Aqib','Wasif','Tahreen','Arif','Noor Jahan'];
export const WORD_MAP = new Map();
for (const [w, e] of WORDS)
  WORD_MAP.set(w.toUpperCase().replace(/\s+/g, ''), { display: w, emoji: e, family: false, clip: 'word_' + slug(w) });
for (const w of FAMILY)
  WORD_MAP.set(w.toUpperCase().replace(/\s+/g, ''), { display: w, emoji: '💖', family: true, clip: 'word_' + slug(w) });

// ---------- word monsters ----------
export const LETTER_SOUNDS = {
  a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'hhh',
  i: 'ih', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'aw', p: 'puh',
  q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks',
  y: 'yuh', z: 'zzz',
};
export const WM_WORDS = [
  // CVC first (auto-step to 4-letter after all done)
  { w: 'cat', emoji: '🐱', act: 'walk', line: 'The cat says meow!' },
  { w: 'dog', emoji: '🐶', act: 'hop', line: 'The dog says woof!' },
  { w: 'sun', emoji: '☀️', act: 'spin', line: 'The sun is so warm!' },
  { w: 'pig', emoji: '🐷', act: 'roll', line: 'The pig says oink!' },
  { w: 'bus', emoji: '🚌', act: 'roll', line: 'The bus goes beep beep!' },
  { w: 'hat', emoji: '🎩', act: 'spin', line: 'The hat looks so fancy!' },
  { w: 'bed', emoji: '🛏️', act: 'bounce', line: 'The bed is so cozy!' },
  { w: 'cup', emoji: '🥤', act: 'roll', line: 'The cup is full of milk!' },
  { w: 'fox', emoji: '🦊', act: 'walk', line: 'The fox is so clever!' },
  { w: 'hen', emoji: '🐔', act: 'hop', line: 'The hen says cluck!' },
  { w: 'bug', emoji: '🐛', act: 'walk', line: 'The bug is so tiny!' },
  { w: 'map', emoji: '🗺️', act: 'roll', line: 'The map shows the way!' },
  { w: 'net', emoji: '🥅', act: 'bounce', line: 'The net catches the ball!' },
  { w: 'jam', emoji: '🍓', act: 'spin', line: 'The jam is so sweet!' },
  { w: 'van', emoji: '🚐', act: 'roll', line: 'The van goes vroom!' },
  { w: 'web', emoji: '🕸️', act: 'spin', line: 'The web is so sticky!' },
  { w: 'zip', emoji: '🤐', act: 'walk', line: 'The zip goes zzzip!' },
  { w: 'box', emoji: '📦', act: 'bounce', line: 'The box is full of toys!' },
  { w: 'mop', emoji: '🧹', act: 'walk', line: 'The mop makes it clean!' },
  { w: 'rat', emoji: '🐀', act: 'walk', line: 'The rat is so quick!' },
  // 4-letter words
  { w: 'frog', emoji: '🐸', act: 'hop', line: 'The frog says ribbit!' },
  { w: 'fish', emoji: '🐟', act: 'swim', line: 'The fish goes splish splash!' },
  { w: 'duck', emoji: '🦆', act: 'swim', line: 'The duck says quack!' },
  { w: 'milk', emoji: '🥛', act: 'roll', line: 'The milk is so yummy!' },
  { w: 'star', emoji: '⭐', act: 'spin', line: 'The star twinkles bright!' },
  { w: 'moon', emoji: '🌙', act: 'spin', line: 'The moon glows at night!' },
  { w: 'cake', emoji: '🎂', act: 'bounce', line: 'The cake is so tasty!' },
  { w: 'ball', emoji: '⚽', act: 'bounce', line: 'The ball goes boing!' },
  { w: 'bird', emoji: '🐦', act: 'fly', line: 'The bird says tweet!' },
  { w: 'tree', emoji: '🌳', act: 'walk', line: 'The tree is so tall!' },
  { w: 'boat', emoji: '⛵', act: 'swim', line: 'The boat sails away!' },
  { w: 'kite', emoji: '🪁', act: 'fly', line: 'The kite flies so high!' },
];

// ---------- animal farm ----------
// { id, name, emoji, scenes: ['farm','zoo','sea','jungle'], sound }
// Only animals with a real CC0/PD sound file (public/audio/animals/<id>.m4a)
// or a recorded anisnd_<id> take are included.
export const ANIMALS = [
  { id: 'cow',      name: 'Cow',      emoji: '🐮', scenes: ['farm'],   sound: 'moo' },
  { id: 'pig',      name: 'Pig',      emoji: '🐷', scenes: ['farm'],   sound: 'oink' },
  { id: 'sheep',    name: 'Sheep',    emoji: '🐑', scenes: ['farm'],   sound: 'baa' },
  { id: 'horse',    name: 'Horse',    emoji: '🐴', scenes: ['farm'],   sound: 'neigh' },
  { id: 'chicken',  name: 'Chicken',  emoji: '🐔', scenes: ['farm'],   sound: 'cluck' },
  { id: 'rooster',  name: 'Rooster',  emoji: '🐓', scenes: ['farm'],   sound: 'cock-a-doodle-doo' },
  { id: 'duck',     name: 'Duck',     emoji: '🦆', scenes: ['farm', 'sea'], sound: 'quack' },
  { id: 'dog',      name: 'Dog',      emoji: '🐶', scenes: ['farm'],   sound: 'woof' },
  { id: 'cat',      name: 'Cat',      emoji: '🐱', scenes: ['farm'],   sound: 'meow' },
  { id: 'goat',     name: 'Goat',     emoji: '🐐', scenes: ['farm'],   sound: 'baa' },
  { id: 'donkey',   name: 'Donkey',   emoji: '🫏', scenes: ['farm'],   sound: 'hee-haw' },
  { id: 'turkey',   name: 'Turkey',   emoji: '🦃', scenes: ['farm'],   sound: 'gobble' },
  { id: 'bee',      name: 'Bee',      emoji: '🐝', scenes: ['farm', 'jungle'], sound: 'buzz' },
  { id: 'crow',     name: 'Crow',     emoji: '🐦‍⬛', scenes: ['farm'],   sound: 'caw' },
  { id: 'lion',     name: 'Lion',     emoji: '🦁', scenes: ['zoo'],    sound: 'roar' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', scenes: ['zoo', 'jungle'], sound: 'toot' },
  { id: 'monkey',   name: 'Monkey',   emoji: '🐵', scenes: ['zoo', 'jungle'], sound: 'ooh ooh' },
  { id: 'owl',      name: 'Owl',      emoji: '🦉', scenes: ['zoo'],    sound: 'hoot' },
  { id: 'wolf',     name: 'Wolf',     emoji: '🐺', scenes: ['zoo'],    sound: 'howl' },
  { id: 'frog',     name: 'Frog',     emoji: '🐸', scenes: ['sea', 'jungle'], sound: 'ribbit' },
  { id: 'dolphin',  name: 'Dolphin',  emoji: '🐬', scenes: ['sea'],    sound: 'click click' },
  { id: 'whale',    name: 'Whale',    emoji: '🐳', scenes: ['sea'],    sound: 'ooo' },
  { id: 'parrot',   name: 'Parrot',   emoji: '🦜', scenes: ['jungle'], sound: 'squawk' },
  { id: 'goose',    name: 'Goose',    emoji: '🪿', scenes: ['sea', 'farm'], sound: 'honk' },
];
export const AF_SCENES = ['farm', 'zoo', 'sea', 'jungle', 'mix'];
