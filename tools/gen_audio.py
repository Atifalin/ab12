#!/usr/bin/env python3
"""Generate all AB12 voice clips with macOS `say` + afconvert.

Usage:
    python3 tools/gen_audio.py            # Samantha voice (default)
    python3 tools/gen_audio.py Junior     # any voice from `say -v '?'`
    python3 tools/gen_audio.py Tara --only-missing   # skip clips that already exist

Outputs public/audio/<name>.m4a and tools/clips.txt (manifest used by
tools/recorder.py / your own recordings — keep filenames identical if you
re-record).
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "content.js"
OUT = ROOT / "public" / "audio"
MANIFEST = ROOT / "tools" / "clips.txt"
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
ONLY_MISSING = "--only-missing" in sys.argv
VOICE = ARGS[0] if ARGS else "Samantha"

# Phonetic spellings so TTS says the letter NAME, not "capital C" etc.
PHON = {
    "A": "ay", "B": "bee", "C": "see", "D": "dee", "E": "ee", "F": "eff",
    "G": "jee", "H": "aitch", "I": "eye", "J": "jay", "K": "kay", "L": "ell",
    "M": "em", "N": "en", "O": "oh", "P": "pee", "Q": "cue", "R": "ar",
    "S": "ess", "T": "tee", "U": "you", "V": "vee", "W": "double-you",
    "X": "ex", "Y": "why", "Z": "zee",
}


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def extract(pattern: str, src: str):
    return re.findall(pattern, src)


def build_manifest():
    src = APP.read_text()
    clips = []

    letters = dict(extract(r"([A-Z]): \['([^']+)', '[^']+'\]", src))
    for ch, word in letters.items():
        p = PHON[ch]
        clips.append((f"letter_{ch}", p))
        clips.append((f"phrase_{ch}", f"{p}! {p} is for {word}!"))

    numbers_block = src.split("const NUMBER_WORDS = [")[1].split("]")[0]
    numbers = extract(r"'([^']+)'", numbers_block)
    for n, word in enumerate(numbers):
        clips.append((f"num_{n}", f"{word}!"))
    for n in range(2, 6):
        seq = ", ".join(numbers[1 : n + 1])
        clips.append((f"count_{n}", f"{seq}!"))

    cheers_block = src.split("const CHEERS = [")[1].split("]")[0]
    for i, cheer in enumerate(extract(r"'([^']+)'", cheers_block)):
        clips.append((f"cheer_{i}", cheer))

    smash_block = src.split("const SMASH = [")[1].split("];")[0]
    for name in extract(r"\['[^']+', '([^']+)'\]", smash_block):
        clips.append((f"smash_{slug(name)}", f"{name}!"))

    words_block = src.split("const WORDS = [")[1].split("];")[0]
    for w in extract(r"\['([^']+)', *'[^']*'\]", words_block):
        clips.append((f"word_{slug(w)}", f"{w}! You spelled {w}!"))
    family_block = src.split("const FAMILY = [")[1].split("];")[0]
    for w in extract(r"'([^']+)'", family_block):
        text = "Ezdan! You spelled Ezdan! That's you!" if w == "Ezdan" else f"{w}! You spelled {w}!"
        clips.append((f"word_{slug(w)}", text))

    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        clips.append((f"find_{ch}", f"Find {PHON[ch]}!"))
    for n in range(10):
        clips.append((f"find_{n}", f"Find {numbers[n]}!"))

    # Spell it! — "Let's spell X!" + letters-of-the-word recital
    spell_words = [word for _, word in letters.items()] + numbers[1:]
    for w in spell_words:
        clips.append((f"sword_{slug(w)}", f"Let's spell {w}!"))
        letters_spelled = ", ".join(PHON[c] for c in w.upper() if c in PHON)
        clips.append((f"sdone_{slug(w)}", f"{letters_spelled}. {w}!"))

    # Word Monsters — letter sounds, word shout-outs, action lines
    sounds = dict(extract(r"(\w): '([^']+)'",
                          src.split("const LETTER_SOUNDS = {")[1].split("}")[0]))
    for ch, snd in sounds.items():
        clips.append((f"snd_{ch}", snd))
    wm_block = src.split("const WM_WORDS = [")[1].split("];")[0]
    for w, line in extract(r"w: '([^']+)'.*line: '([^']+)'", wm_block):
        clips.append((f"wm_{slug(w)}", f"{w.capitalize()}!"))
        clips.append((f"wmact_{slug(w)}", line))
    clips.append(("wm_intro", "Let's make words with the letter monsters!"))

    # Animal Farm — names, lines, quiz prompts. `anisnd_*` entries are
    # real animal sounds (recorded/downloaded) — listed for the Studio but
    # never generated (filtered out in main()).
    ani_block = src.split("const ANIMALS = [")[1].split("];")[0]
    for aid, name, sound in extract(
            r"id: '([^']+)'.*name: '([^']+)'.*sound: '([^']+)'", ani_block):
        clips.append((f"ani_{aid}", f"{name}!"))
        clips.append((f"anisay_{aid}", f"The {name.lower()} says {sound}!"))
        clips.append((f"aniq_{aid}", f"Who says {sound}?"))
        clips.append((f"anisnd_{aid}", f"{sound.capitalize()}!"))
    clips.append(("farm_intro", "Let's visit the animals!"))

    # Sort it! — baskets, prompts, item names, misc
    sort_names = {
        'apple': 'apple', 'strawberry': 'strawberry', 'redcar': 'red car',
        'rose': 'rose', 'heart': 'heart', 'banana': 'banana', 'sunflower': 'sunflower',
        'chick': 'chick', 'star': 'star', 'cheese': 'cheese', 'whale': 'whale',
        'blueberries': 'blueberries', 'blueheart': 'blue heart', 'cap': 'cap',
        'butterfly': 'butterfly', 'frog2': 'frog', 'broccoli': 'broccoli',
        'clover': 'clover', 'dino': 'dinosaur', 'greenapple': 'green apple',
        'dog2': 'dog', 'cat2': 'cat', 'horse2': 'horse', 'hen2': 'chicken',
        'sheep2': 'sheep', 'pig2': 'pig', 'apple2': 'apple', 'banana2': 'banana',
        'pizza': 'pizza', 'carrot': 'carrot', 'donut': 'donut', 'milk2': 'milk',
        'car2': 'car', 'bus2': 'bus', 'plane': 'aeroplane', 'ship': 'ship',
        'bike': 'bike', 'tractor': 'tractor',
        'elephant2': 'elephant', 'whale2': 'whale', 'tree2': 'tree',
        'giraffe': 'giraffe', 'house': 'house', 'ant': 'ant', 'fish2': 'fish',
        'sprout': 'sprout', 'mouse': 'mouse', 'snail': 'snail',
        'bird2': 'bird', 'plane2': 'aeroplane', 'butterfly2': 'butterfly',
        'kite2': 'kite', 'cow2': 'cow', 'car3': 'car', 'dog3': 'dog',
        'house2': 'house', 'fish3': 'fish', 'octopus': 'octopus',
        'ship2': 'ship', 'whale3': 'whale',
        'la': 'Ay', 'lb': 'Bee', 'lc': 'See', 'ld': 'Dee', 'le': 'Ee',
        'n2': 'Two', 'n4': 'Four', 'n5': 'Five', 'n7': 'Seven', 'n9': 'Nine',
    }
    sort_block = src.split("const SORT_SETS = [")[1].split("];")[0]
    for bid, label in extract(r"id: '([^']+)',\s*label: '([^']+)'", sort_block):
        clips.append((f"sortb_{bid}", f"{label}!"))
    for sid, prompt in extract(r"id: '([^']+)', prompt: '([^']+)'", sort_block):
        clips.append((f"sortq_{sid}", prompt))
    for iid in extract(r"id: '([^']+)',\s*emoji:", sort_block):
        clips.append((f"sorti_{iid}", f"{sort_names.get(iid, iid)}!"))
    clips.append(("sort_intro", "Let's sort everything into the right baskets!"))
    clips.append(("sort_try", "Hmm, try another basket!"))
    clips.append(("sort_done", "You sorted them all!"))

    # Feed the Monster — requests, reactions
    feed_block = src.split("const FEED_FOODS = [")[1].split("];")[0]
    feed_colors = extract(r"color: '([^']+)'", feed_block)
    for fid, name in extract(r"id: '([^']+)',.*name: '([^']+)'", feed_block):
        clips.append((f"feedi_{fid}", f"{name}!"))
    feed_letters = sorted({i[0] for i in extract(r"id: '([a-z]+)',.*name:", feed_block)})
    for ch in feed_letters:
        clips.append((f"feedq_l_{ch}", f"I want something that starts with {PHON[ch.upper()]}!"))
    for c in sorted(set(feed_colors)):
        clips.append((f"feedq_c_{c}", f"Feed me something {c}!"))
    for n in range(2, 6):
        clips.append((f"feedq_n_{n}", f"Feed me {numbers[n].lower()}!"))
    for i, yum in enumerate(["Yum!", "Yummy yum yum!", "Mmm, delicious!"]):
        clips.append((f"feed_yum{i + 1}", yum))
    clips.append(("feed_blech", "Blech! Not that one!"))
    clips.append(("feed_dance", "I'm so full and happy!"))
    clips.append(("feed_intro", "Feed the hungry monster!"))
    clips.append(("feedsfx_crunch", "Crunch crunch crunch! Nom nom!"))
    clips.append(("feedsfx_slurp", "Slurrrp! Ahhh, so good!"))
    clips.append(("feedsfx_burp", "Burrrp! Excuse me!"))
    clips.append(("feedsfx_giggle", "Hehehe! That tickles my tummy!"))
    clips.append(("feedsfx_poke", "Boing! Hey, that's my silly head!"))
    clips.append(("feedsfx_hungry", "Aaaah! Feed me! Nom nom nom!"))
    clips.append(("feedsfx_snore", "Zzzzz... Huh? I'm awake!"))

    # Picture Puzzle — intro, snap, completed picture lines
    puz_block = src.split("const PUZZLES = [")[1].split("];")[0]
    for pid, ptitle in extract(r"id: '([^']+)',\s*title: '([^']+)'", puz_block):
        clips.append((f"puz_{pid}", f"Hooray! You made the {ptitle}!"))
    clips.append(("puz_intro", "Let's put the picture puzzle together!"))
    clips.append(("puz_snap", "Snap! Great fit!"))

    # Build & Go! — intro, parts, vehicle names, launch lines
    bg_block = src.split("const BUILD_VEHICLES = [")[1].split("];")[0]
    for vid, vname, vgo in extract(
            r"id: '([^']+)',\s*name: '([^']+)',.*go: '([^']+)'", bg_block):
        clips.append((f"bg_v_{vid}", f"{vname}!"))
        clips.append((f"bg_go_{vid}", vgo))
    clips.append(("bg_intro", "Let's build and go!"))
    clips.append(("bg_snap", "Click! That fits!"))
    clips.append(("bg_ready", "All built! Press the big GO button!"))

    clips.append(("intro_learn", "Let's learn letters and numbers!"))
    clips.append(("intro_smash", "Smash time!"))
    clips.append(("find_intro", "Let's play find it!"))
    clips.append(("find_ten", "You found ten! Amazing!"))
    clips.append(("try_again", "Try again!"))
    clips.append(("voice_on", "Voice on!"))
    return clips


def render(name: str, text: str):
    aiff = OUT / f"{name}.aiff"
    m4a = OUT / f"{name}.m4a"
    subprocess.run(["say", "-v", VOICE, "-o", str(aiff), text], check=True)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", str(aiff), str(m4a)], check=True)
    aiff.unlink()


def main():
    OUT.mkdir(exist_ok=True)
    clips = build_manifest()
    MANIFEST.write_text("\n".join(f"{n}\t{t}" for n, t in clips) + "\n")
    print(f"{len(clips)} clips -> {OUT} (voice: {VOICE})")
    clips = [(n, t) for n, t in clips if not n.startswith("anisnd_")]
    if ONLY_MISSING:
        clips = [(n, t) for n, t in clips if not (OUT / f"{n}.m4a").exists()]
        print(f"--only-missing: {len(clips)} to generate")
    for i, (name, text) in enumerate(clips, 1):
        render(name, text)
        if i % 25 == 0:
            print(f"  {i}/{len(clips)}")
    print(f"done. manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
