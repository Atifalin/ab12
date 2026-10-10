import { sayUrls } from './voice.js';
import { rand } from './util.js';
import { WORD_MAP, FAMILY as FAMILY_NAMES } from '../content.js';

// ---------- family members ----------
// public/family/family.json, maintained by tools/studio.py. 404/invalid -> empty.
let familyData = { members: [] };
const lastFamTake = new Map(); // "<id>:<line>" -> last take file
let ready = null;

export function loadFamily() {
  if (ready) return ready;
  ready = fetch(`family/family.json?v=${Date.now()}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (j && Array.isArray(j.members)) familyData = j;
      mergeFamilyWords();
    })
    .catch(() => {});
  return ready;
}
loadFamily();

export const familyMembers = () => familyData.members || [];

const LINE_TEXT = {
  name: (m) => `${m.name}!`,
  peekaboo: (m) => `Peekaboo! It's ${m.name}!`,
  where: (m) => `Where's ${m.name}?`,
};

// Play one of a member's recorded takes -> Tara fallback -> TTS.
// line: name | peekaboo | where | fun (fun falls back to peekaboo, then name)
export function playLine(member, line, opts = {}) {
  const text = (LINE_TEXT[line] || LINE_TEXT.name)(member);
  const urls = [];
  const lines = member.lines || {};
  for (const key of line === 'fun' ? ['fun', 'peekaboo', 'name'] : [line]) {
    const takes = lines[key];
    if (takes && takes.length) {
      const mapKey = `${member.id}:${key}`;
      let f = rand(takes);
      if (takes.length > 1) {
        const prev = lastFamTake.get(mapKey);
        while (f === prev) f = rand(takes);
      }
      lastFamTake.set(mapKey, f);
      urls.push(`family/audio/${member.id}/${f}`);
      break;
    }
  }
  // real members get a Studio-generated tara_<line>.m4a; placeholders (id _x) have none
  if (line !== 'fun' && LINE_TEXT[line] && !member.id.startsWith('_'))
    urls.push(`family/audio/${member.id}/tara_${line}.m4a`);
  sayUrls(text, urls, opts);
}

// Family member names join the word-celebration set (letters only, family
// styling). Names already in WORD_MAP (e.g. FAMILY list names) are kept as-is.
function mergeFamilyWords() {
  for (const m of familyMembers()) {
    const key = (m.name || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length < 2 || WORD_MAP.has(key)) continue;
    WORD_MAP.set(key, { display: m.name, emoji: '💖', family: true, clip: null, member: m });
  }
}
