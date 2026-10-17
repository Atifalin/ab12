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

// ---------- sort it ----------
export const SORT_SETS = [
  { id: 'colour', prompt: 'Put them in the right basket!',
    baskets: [
      { id: 'red',    label: 'Red',    icon: '🔴', color: '#ff6b6b' },
      { id: 'yellow', label: 'Yellow', icon: '🟡', color: '#ffd23f' },
      { id: 'blue',   label: 'Blue',   icon: '🔵', color: '#5c9dff' },
      { id: 'green',  label: 'Green',  icon: '🟢', color: '#4cd964' },
    ],
    items: [
      { id: 'apple',   emoji: '🍎', b: 'red' }, { id: 'strawberry', emoji: '🍓', b: 'red' },
      { id: 'redcar',  emoji: '🚗', b: 'red' }, { id: 'rose',    emoji: '🌹', b: 'red' },
      { id: 'heart',   emoji: '❤️', b: 'red' }, { id: 'banana',  emoji: '🍌', b: 'yellow' },
      { id: 'sunflower',emoji: '🌻', b: 'yellow' }, { id: 'chick', emoji: '🐥', b: 'yellow' },
      { id: 'star',    emoji: '⭐', b: 'yellow' }, { id: 'cheese', emoji: '🧀', b: 'yellow' },
      { id: 'whale',   emoji: '🐳', b: 'blue' }, { id: 'blueberries', emoji: '🫐', b: 'blue' },
      { id: 'blueheart',emoji: '💙', b: 'blue' }, { id: 'cap',   emoji: '🧢', b: 'blue' },
      { id: 'butterfly',emoji: '🦋', b: 'blue' }, { id: 'frog2', emoji: '🐸', b: 'green' },
      { id: 'broccoli',emoji: '🥦', b: 'green' }, { id: 'clover', emoji: '🍀', b: 'green' },
      { id: 'dino',    emoji: '🦖', b: 'green' }, { id: 'greenapple', emoji: '🍏', b: 'green' },
    ] },
  { id: 'kind', prompt: 'Where do they belong?',
    baskets: [
      { id: 'animals',  label: 'Animals',  icon: '🐶', color: '#c98a5c' },
      { id: 'food',     label: 'Food',     icon: '🍎', color: '#ff8c42' },
      { id: 'vehicles', label: 'Vehicles', icon: '🚗', color: '#5c9dff' },
    ],
    items: [
      { id: 'dog2',   emoji: '🐶', b: 'animals' }, { id: 'cat2',  emoji: '🐱', b: 'animals' },
      { id: 'horse2', emoji: '🐴', b: 'animals' }, { id: 'hen2',  emoji: '🐔', b: 'animals' },
      { id: 'sheep2', emoji: '🐑', b: 'animals' }, { id: 'pig2',  emoji: '🐷', b: 'animals' },
      { id: 'apple2', emoji: '🍎', b: 'food' }, { id: 'banana2', emoji: '🍌', b: 'food' },
      { id: 'pizza',  emoji: '🍕', b: 'food' }, { id: 'carrot', emoji: '🥕', b: 'food' },
      { id: 'donut',  emoji: '🍩', b: 'food' }, { id: 'milk2',  emoji: '🥛', b: 'food' },
      { id: 'car2',   emoji: '🚗', b: 'vehicles' }, { id: 'bus2',  emoji: '🚌', b: 'vehicles' },
      { id: 'plane',  emoji: '✈️', b: 'vehicles' }, { id: 'ship', emoji: '🚢', b: 'vehicles' },
      { id: 'bike',   emoji: '🚲', b: 'vehicles' }, { id: 'tractor', emoji: '🚜', b: 'vehicles' },
    ] },
  { id: 'size', prompt: 'Big things or small things?',
    baskets: [
      { id: 'big',   label: 'Big',   icon: '🐘', color: '#8a63ff' },
      { id: 'small', label: 'Small', icon: '🐜', color: '#ff9fb8' },
    ],
    items: [
      { id: 'elephant2', emoji: '🐘', b: 'big' }, { id: 'whale2',  emoji: '🐋', b: 'big' },
      { id: 'tree2',     emoji: '🌳', b: 'big' }, { id: 'giraffe', emoji: '🦒', b: 'big' },
      { id: 'house',     emoji: '🏠', b: 'big' }, { id: 'ant',     emoji: '🐜', b: 'small' },
      { id: 'fish2',     emoji: '🐟', b: 'small' }, { id: 'sprout', emoji: '🌱', b: 'small' },
      { id: 'mouse',     emoji: '🐁', b: 'small' }, { id: 'snail',  emoji: '🐌', b: 'small' },
    ] },
  { id: 'where', prompt: 'Where do they live?',
    baskets: [
      { id: 'sky',  label: 'Sky',  icon: '☁️', color: '#7ec8ff' },
      { id: 'land', label: 'Land', icon: '🏞️', color: '#74c476' },
      { id: 'sea',  label: 'Sea',  icon: '🌊', color: '#3e9ccf' },
    ],
    items: [
      { id: 'bird2',  emoji: '🐦', b: 'sky' }, { id: 'plane2', emoji: '✈️', b: 'sky' },
      { id: 'butterfly2', emoji: '🦋', b: 'sky' }, { id: 'kite2', emoji: '🪁', b: 'sky' },
      { id: 'cow2',   emoji: '🐄', b: 'land' }, { id: 'car3',   emoji: '🚗', b: 'land' },
      { id: 'dog3',   emoji: '🐕', b: 'land' }, { id: 'house2', emoji: '🏠', b: 'land' },
      { id: 'fish3',  emoji: '🐟', b: 'sea' }, { id: 'octopus', emoji: '🐙', b: 'sea' },
      { id: 'ship2',  emoji: '🚢', b: 'sea' }, { id: 'whale3', emoji: '🐳', b: 'sea' },
    ] },
  { id: 'letters', prompt: 'Letters or numbers?',
    baskets: [
      { id: 'letters', label: 'Letters', icon: '🔤', color: '#ff77a9' },
      { id: 'numbers', label: 'Numbers', icon: '🔢', color: '#2fb8ff' },
    ],
    items: [
      { id: 'la', emoji: 'A', b: 'letters' }, { id: 'lb', emoji: 'B', b: 'letters' },
      { id: 'lc', emoji: 'C', b: 'letters' }, { id: 'ld', emoji: 'D', b: 'letters' },
      { id: 'le', emoji: 'E', b: 'letters' }, { id: 'n2', emoji: '2', b: 'numbers' },
      { id: 'n4', emoji: '4', b: 'numbers' }, { id: 'n5', emoji: '5', b: 'numbers' },
      { id: 'n7', emoji: '7', b: 'numbers' }, { id: 'n9', emoji: '9', b: 'numbers' },
    ] },
];

// ---------- feed the monster ----------
export const FEED_FOODS = [
  { id: 'apple',   emoji: '🍎', name: 'apple',      color: 'red' },
  { id: 'banana',  emoji: '🍌', name: 'banana',     color: 'yellow' },
  { id: 'carrot',  emoji: '🥕', name: 'carrot',     color: 'orange' },
  { id: 'donut',   emoji: '🍩', name: 'donut',      color: 'pink' },
  { id: 'egg',     emoji: '🥚', name: 'egg',        color: 'white' },
  { id: 'fries',   emoji: '🍟', name: 'fries',      color: 'yellow' },
  { id: 'grapes',  emoji: '🍇', name: 'grapes',     color: 'purple' },
  { id: 'honey',   emoji: '🍯', name: 'honey',      color: 'yellow' },
  { id: 'icecream',emoji: '🍦', name: 'ice cream',  color: 'white' },
  { id: 'juice',   emoji: '🍹', name: 'juice',      color: 'orange' },
  { id: 'kiwi',    emoji: '🥝', name: 'kiwi',       color: 'green' },
  { id: 'lemon',   emoji: '🍋', name: 'lemon',      color: 'yellow' },
  { id: 'melon',   emoji: '🍈', name: 'melon',      color: 'green' },
  { id: 'noodles', emoji: '🍜', name: 'noodles',    color: 'yellow' },
  { id: 'orange',  emoji: '🍊', name: 'orange',     color: 'orange' },
  { id: 'pizza',   emoji: '🍕', name: 'pizza',      color: 'red' },
  { id: 'strawberry', emoji: '🍓', name: 'strawberry', color: 'red' },
  { id: 'tomato',  emoji: '🍅', name: 'tomato',     color: 'red' },
  { id: 'watermelon', emoji: '🍉', name: 'watermelon', color: 'green' },
];
export const FEED_COLORS = ['red', 'yellow', 'green', 'orange', 'white', 'purple', 'pink'];

// ---------- picture puzzle ----------
export const PUZZLES = [
  { id: 'lion',      title: 'Sunny Lion',      emoji: '🦁', set: 'animals',  bg1: '#fff3b0', bg2: '#ffd166', ground: '#70e000', deco: ['☀️', '🌳'] },
  { id: 'elephant',  title: 'Happy Elephant',  emoji: '🐘', set: 'animals',  bg1: '#caf0f8', bg2: '#90e0ef', ground: '#52b788', deco: ['☁️', '🌼'] },
  { id: 'dino',      title: 'Super Dino',      emoji: '🦖', set: 'animals',  bg1: '#d8f3dc', bg2: '#95d5b2', ground: '#40916c', deco: ['☀️', '🌴'] },
  { id: 'whale',     title: 'Splashy Whale',   emoji: '🐳', set: 'animals',  bg1: '#90e0ef', bg2: '#00b4d8', ground: '#0077b6', deco: ['🫧', '🐟'] },
  { id: 'rocket',    title: 'Space Rocket',    emoji: '🚀', set: 'vehicles', bg1: '#1d1e4e', bg2: '#3a0ca3', ground: '#7209b7', deco: ['⭐', '🌙'] },
  { id: 'firetruck', title: 'Fire Truck',      emoji: '🚒', set: 'vehicles', bg1: '#bde0fe', bg2: '#e0fbfc', ground: '#74c69d', deco: ['☁️', '🏠'] },
  { id: 'train',     title: 'Choo-Choo Train', emoji: '🚂', set: 'vehicles', bg1: '#a2d2ff', bg2: '#dff6ff', ground: '#52b788', deco: ['☁️', '🌳'] },
  { id: 'tractor',   title: 'Green Tractor',   emoji: '🚜', set: 'vehicles', bg1: '#fffae5', bg2: '#cfe9ff', ground: '#7ed36a', deco: ['☀️', '🌻'] },
  { id: 'cake',      title: 'Birthday Cake',   emoji: '🎂', set: 'fun',      bg1: '#ffe5ec', bg2: '#ffc2d1', ground: '#ff8fab', deco: ['🎈', '🎉'] },
  { id: 'rainbow',   title: 'Rainbow Sky',     emoji: '🌈', set: 'fun',      bg1: '#a8e6ff', bg2: '#e9ffdb', ground: '#70e000', deco: ['☀️', '☁️'] },
  { id: 'unicorn',   title: 'Magic Unicorn',   emoji: '🦄', set: 'fun',      bg1: '#f3d9fa', bg2: '#ffd6ff', ground: '#b197fc', deco: ['✨', '🌈'] },
  { id: 'robot',     title: 'Friendly Robot',  emoji: '🤖', set: 'fun',      bg1: '#e0fbfc', bg2: '#c2f0fc', ground: '#4cc9f0', deco: ['✨', '⭐'] },
];

// ---------- build & go! ----------
export const BUILD_VEHICLES = [
  { id: 'rocket',       name: 'Rocket Ship',    emoji: '🚀', sfx: 'rocket',  go: 'Three, two, one, blast off!',          env: 'space', targets: ['⭐', '🌙', '🫧', '☀️'] },
  { id: 'firetruck',    name: 'Fire Truck',     emoji: '🚒', sfx: 'siren',   go: 'Wee-oo wee-oo! Here comes the fire truck!', env: 'road',  targets: ['🫧', '🎈', '⭐', '☁️'] },
  { id: 'train',        name: 'Choo-Choo Train',emoji: '🚂', sfx: 'choo',    go: 'Choo choo! All aboard the train!',     env: 'track', targets: ['☁️', '🎈', '⭐', '🌻'] },
  { id: 'monstertruck', name: 'Monster Truck',  emoji: '🚜', sfx: 'vroom',   go: 'Vroom vroom! Big monster truck jump!', env: 'hills', targets: ['📦', '🎈', '⭐', '🍉'] },
  { id: 'submarine',    name: 'Submarine',      emoji: '🐳', sfx: 'bubbles', go: 'Splish splash! Dive under the sea!',   env: 'sea',   targets: ['🫧', '🐟', '🐙', '🦀'] },
  { id: 'plane',        name: 'Super Plane',    emoji: '✈️', sfx: 'vroom',   go: 'Zoom! Flying high in the clouds!',     env: 'sky',   targets: ['☁️', '🌈', '🎈', '⭐'] },
];

