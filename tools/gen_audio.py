#!/usr/bin/env python3
"""Generate all AB12 voice clips with macOS `say` + afconvert.

Usage:
    python3 tools/gen_audio.py            # Samantha voice (default)
    python3 tools/gen_audio.py Junior     # any voice from `say -v '?'`
    python3 tools/gen_audio.py Tara --only-missing   # skip clips that already exist

Outputs audio/<name>.m4a and tools/clips.txt (manifest used by record.sh /
your own recordings — keep filenames identical if you re-record).
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app.js"
OUT = ROOT / "audio"
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
