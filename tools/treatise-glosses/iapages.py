"""Printed page lookup for an Internet Archive item via its hOCR search text,
page index and page_numbers.json. page_for(snippet) -> (leafNum, printed page) or None."""
import json, re


class Pages:
    def __init__(self, searchtext, pageindex, pagenumbers):
        txt = open(searchtext, encoding="utf-8").read()
        idx = json.load(open(pageindex))
        pn = json.load(open(pagenumbers))["pages"]
        self.pn = {p["leafNum"]: p.get("pageNumber") or "" for p in pn}
        self.pages = []
        for k, (a, b, *_rest) in enumerate(idx):
            self.pages.append(self.norm(txt[a:b]))
        # leafNum in page_numbers.json is 1-based leaf order matching pageindex order (+1)
        self.leaf_of = lambda k: k + 1

    @staticmethod
    def norm(s):
        return re.sub(r"\s+", " ", s).strip()

    def page_for(self, snippet):
        s = self.norm(snippet)
        hits = [k for k, t in enumerate(self.pages) if s in t]
        if len(hits) != 1:
            return None if not hits else ("ambiguous", [self.pn.get(self.leaf_of(k)) for k in hits])
        leaf = self.leaf_of(hits[0])
        return leaf, self.pn.get(leaf)
