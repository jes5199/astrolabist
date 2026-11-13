"""Validate curate.py against the downloaded OCR texts and write glosses.json.

usage: python3 -I build_glosses.py SRC_DIR OUT_JSON [--selftest]
  SRC_DIR: the directory filled by fetch_sources.sh and the two parse scripts
  (see docs/treatise-glosses.md). OUT_JSON: normally src/treatise-text/glosses.json

Gate: every sourced gloss, short gloss and definition must be a verbatim substring of
the cited entry (after the logged OCR fixes, whitespace collapsed, PG italics marks
removed). Exits 1 on any failure. --selftest corrupts one gloss and must fail.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from curate import G, OVERRIDES, BLANK, LINE_STRICT, TRANSLATION  # noqa: E402
from iapages import Pages  # noqa: E402

SRC = os.path.abspath(sys.argv[1])
D1 = f"{SRC}/onastrol00chautreatiserich_"
D2 = f"{SRC}/completeworksofg06chauuoft_"
PG = f"{SRC}/pg45027.txt"
CONTENT = os.path.join(HERE, "..", "..", "src", "content", "treatise")
SAMPLE = ["00-prologue", "p1-01", "p1-02", "p1-03"]

out = sys.argv[2]
selftest = "--selftest" in sys.argv

ents = {
    "eets": {e["line"]: e for e in json.load(open(f"{SRC}/eets.json"))},
    "oxf6": {e["line"]: e for e in json.load(open(f"{SRC}/oxf.json"))},
    "oxf6n": {e["line"]: e for e in json.load(open(f"{SRC}/oxfn.json"))},
}
pages = {
    "eets": Pages(D1 + "hocr_searchtext.txt", D1 + "hocr_pageindex.json", D1 + "page_numbers.json"),
    "oxf6": Pages(D2 + "hocr_searchtext.txt", D2 + "hocr_pageindex.json", D2 + "page_numbers.json"),
}
pages["oxf6n"] = pages["oxf6"]
pg_lines = open(PG, encoding="utf-8").read().split("\n")

norm = lambda s: re.sub(r"\s+", " ", s).strip()
errors = []


def entry_text(src, line, fixes):
    e = ents[src].get(line)
    if not e:
        errors.append(f"{src} L{line}: no parsed entry starts on this line")
        return None, None
    t = norm(e["text"])
    for a, b in fixes:
        if a not in t:
            errors.append(f"{src} L{line}: logged OCR fix target {a!r} not in entry")
        t = t.replace(a, b)
    return e, t


def pg_text(line, span=14):
    return norm(" ".join(pg_lines[line - 1: line - 1 + span]).replace("_", ""))


def page_of(src, e):
    raw = norm(e["text"])
    for n in (40, 28, 18, 12, 8, 6):
        r = pages[src].page_for(raw[:n])
        if r and r[0] != "ambiguous":
            return r[1]
    return None


def check(label, needle, hay):
    if needle is None:
        return
    if norm(needle) not in hay:
        errors.append(f"{label}: {needle!r} not found in source text")


# Skeat's own locators for the vol. 3 passages used (PG #45027 line -> where in the book)
OXF3_WHERE = {
    19031: "note to Prol. l. 1", 19037: "note to Prol. l. 5", 19040: "note to Prol. l. 7",
    19046: "note to Prol. l. 10", 19054: "note to Prol. l. 62", 19069: "note to Prol. l. 62",
    2672: "Introduction, § 28", 2734: "Introduction, § 28", 2742: "Introduction, § 28",
}

SRC_CITE = {
    "eets": "Skeat, EETS 1872, glossary",
    "oxf6": "Skeat, Oxford Chaucer 1894, glossary",
    "oxf6n": "Skeat, Oxford Chaucer 1894, index of names",
    "oxf3": "Skeat, Oxford Chaucer 1894, vol. III",
    "ours": "our gloss",
}

entries, forms, phrases = {}, {}, []
for (key, src, line, head, gloss, fs, extra) in G:
    if selftest and key == "turet":
        gloss = "a swivel for the ring"  # invented: the gate must reject this
    rec = {"gloss": gloss, "source": src}
    if extra.get("short"):
        rec["short"] = extra["short"]
    if extra.get("lineOnly"):
        rec["lineOnly"] = True
    # The strict modern line: Skeat's first sense (or a chosen piece of his gloss).
    base = extra.get("short") or gloss
    ln = LINE_STRICT.get(key) or re.split(r", |; ", base)[0]
    if ln not in gloss and ln not in base and ln.lower() not in [f.lower() for f in fs]:
        errors.append(f"{key}: strict line {ln!r} is not Skeat's wording (gloss {gloss!r})")
    rec["line"] = ln
    fixes = extra.get("fix", [])
    if src == "ours":
        if extra.get("def"):
            errors.append(f"{key}: an 'ours' entry may not carry a definition")
    else:
        e, t = entry_text(src, line, fixes)
        if t is not None:
            check(f"{key} gloss", gloss, t)
            check(f"{key} short", extra.get("short"), t)
            rec["ref"] = {"head": head, "page": page_of(src, e), "ocr": f"djvu.txt line {line}"}
            if extra.get("loc"):
                rec["ref"]["loc"] = extra["loc"]
            if fixes:
                rec["ref"]["ocrFixes"] = [f"{a} → {b}" for a, b in fixes]
            if not rec["ref"]["page"]:
                errors.append(f"{key}: page not found for {src} L{line}")
    if extra.get("def"):
        dsrc, dline, dtext = extra["def"]
        if dsrc == "oxf3":
            check(f"{key} def", dtext, pg_text(dline))
            dref = {"where": OXF3_WHERE[dline], "pgLine": dline}
        else:
            de, dt = entry_text(dsrc, dline, fixes if (dsrc, dline) == (src, line) else [])
            if dt is not None:
                check(f"{key} def", dtext, dt)
            dref = {"ocr": f"djvu.txt line {dline}", "page": page_of(dsrc, de) if de else None}
        rec["def"] = norm(dtext)
        rec["defSource"] = dsrc
        if extra.get("quotes"):
            rec["defQuotes"] = extra["quotes"]
        rec["defRef"] = dref
    if key in entries:
        errors.append(f"duplicate key {key}")
    entries[key] = rec
    for f in fs:
        if f in forms:
            errors.append(f"form {f} mapped twice ({forms[f]}, {key})")
        forms[f] = key
    if extra.get("phrase"):
        phrases.append({"words": extra["phrase"].lower(), "key": key})

# every mapped form and phrase must occur in the sample
text = {}
for s in SAMPLE:
    body = open(f"{CONTENT}/{s}.md", encoding="utf-8").read().split("---", 2)[2]
    text[s] = body
toks = {s: [w.lower() for w in re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)*", b)] for s, b in text.items()}
alltoks = set(w for t in toks.values() for w in t)
for f, k in forms.items():
    if f not in alltoks:
        errors.append(f"form {f!r} ({k}) does not occur in the sample")
joined = {s: " ".join(t) for s, t in toks.items()}
for p in phrases:
    if not any(f" {p['words']} " in f" {j} " for j in joined.values()):
        errors.append(f"phrase {p['words']!r} not in sample")
ov = []
for sec, phrase, word, key in OVERRIDES:
    ph = " ".join(re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)*", phrase.lower()))
    if f" {ph} " not in f" {joined[sec]} ":
        errors.append(f"override phrase {phrase!r} not in {sec}")
    if key is not None and key not in entries:
        errors.append(f"override key {key} unknown")
    ov.append({"section": sec, "match": ph, "word": word.lower(), "key": key})
KINDS = {"added-word", "reordered", "modernised-form", "paraphrase-phrase"}
spans = []
for sec, match, line, kind in TRANSLATION:
    ph = " ".join(re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)*", match.lower()))
    if f" {ph} " not in f" {joined[sec]} ":
        errors.append(f"translation span {match!r} not in {sec}")
    if kind not in KINDS:
        errors.append(f"translation span {match!r}: unknown departure kind {kind!r}")
    spans.append({"section": sec, "match": ph, "line": line, "kind": kind})
for b in BLANK:
    if b not in alltoks:
        errors.append(f"blank word {b!r} not in sample")
for k, r in entries.items():
    used = k in forms.values() or any(p["key"] == k for p in phrases) or any(o["key"] == k for o in ov)
    if not used:
        errors.append(f"entry {k} is never applied")

if errors:
    print("GLOSS GATE: FAIL")
    for e in errors:
        print("  -", e)
    sys.exit(1)

doc = {
    "_about": "Glosses for the sample of the treatise (Prologue, Part I §1-3). Generated by the gloss "
              "builder from public-domain Skeat glossaries; see docs/treatise-glosses.md. Do not hand-edit "
              "sourced entries: every sourced gloss/short/def is a verbatim substring of the cited entry.",
    "sample": SAMPLE,
    "sources": {
        "eets": {
            "cite": SRC_CITE["eets"],
            "title": "A Treatise on the Astrolabe; addressed to his son Lowys by Geoffrey Chaucer, A.D. 1391. "
                     "Ed. Walter W. Skeat. Early English Text Society, Extra Series 16. London: N. Trübner, 1872. "
                     "Glossarial Index, pp. 106-119.",
            "url": "https://archive.org/details/onastrol00chautreatiserich",
            "text": "https://archive.org/download/onastrol00chautreatiserich/onastrol00chautreatiserich_djvu.txt",
            "scan": "1968 lithographic reprint of the 1872 edition (reprinted 1880, 1928, 1968).",
            "refs": "Skeat's line references (pr. = Prologue, i. = Part I) follow the EETS text, not the 1894 text.",
        },
        "oxf6": {
            "cite": SRC_CITE["oxf6"],
            "title": "The Complete Works of Geoffrey Chaucer, ed. Walter W. Skeat. Vol. VI: Introduction, Glossary "
                     "and Indexes. Oxford: Clarendon Press, 1894. Glossarial Index.",
            "url": "https://archive.org/details/completeworksofg06chauuoft",
            "text": "https://archive.org/download/completeworksofg06chauuoft/completeworksofg06chauuoft_djvu.txt",
            "scan": "1926 impression, 'produced photographically from sheets of the First Edition' (1894).",
            "refs": "A. pr. / A. i. = Astrolabe Prologue / Part I, line numbers of the 1894 text (the text on this page).",
        },
        "oxf6n": {
            "cite": SRC_CITE["oxf6n"],
            "title": "As oxf6: Index of Proper Names.",
            "url": "https://archive.org/details/completeworksofg06chauuoft",
        },
        "oxf3": {
            "cite": SRC_CITE["oxf3"],
            "title": "The Complete Works of Geoffrey Chaucer, ed. Walter W. Skeat. Vol. III. Oxford: Clarendon Press, "
                     "1894. Introduction to the Treatise (§ 28) and Notes to the Treatise.",
            "url": "https://www.gutenberg.org/cache/epub/45027/pg45027.txt",
            "refs": "pgLine = line number in the Project Gutenberg plain-text file #45027.",
        },
        "ours": {
            "cite": SRC_CITE["ours"],
            "title": "Plain modern spelling equivalents written for this page where no Skeat entry was found. "
                     "Provisional; awaiting Jes (see docs/treatise-wording.md).",
        },
    },
    "entries": entries,
    "forms": dict(sorted(forms.items())),
    "phrases": phrases,
    "overrides": ov,
    "blank": BLANK,
    "lineSpans": spans,
}
json.dump(doc, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
n = {}
for r in entries.values():
    n[r["source"]] = n.get(r["source"], 0) + 1
print("GLOSS GATE: PASS", len(entries), "entries", len(forms), "forms", len(phrases), "phrases", n)
