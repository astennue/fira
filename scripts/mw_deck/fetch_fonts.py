#!/usr/bin/env python3
"""Download premium Google Fonts (latin woff2) and emit base64 @font-face CSS
so the MatchWise deck is fully self-contained (works offline)."""
import base64, os, re, urllib.request

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts_b64.css")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

# family -> list of weights
WANT = {
    "Space Grotesk": [500, 700],
    "Inter": [400, 500, 600, 700, 800],
    "JetBrains Mono": [400, 600],
}

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

css_out = []
for fam, weights in WANT.items():
    api = "https://fonts.googleapis.com/css2?family=" + fam.replace(" ", "+")
    api += ":wght@" + ";".join(str(w) for w in weights)
    api += "&display=swap"
    css = fetch(api).decode("utf-8")
    # Parse blocks: capture font-family, weight, url, unicode-range comment (subset name)
    blocks = re.findall(r"/\*\s*([a-z0-9-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
    n = 0
    for subset, body in blocks:
        if subset != "latin":
            continue
        fam_m = re.search(r"font-family:\s*'([^']+)'", body)
        wgt_m = re.search(r"font-weight:\s*(\d+)", body)
        url_m = re.search(r"url\((https://[^)]+\.woff2)\)", body)
        if not (fam_m and wgt_m and url_m):
            continue
        woff = fetch(url_m.group(1))
        b64 = base64.b64encode(woff).decode("ascii")
        css_out.append(
            "@font-face{font-family:'%s';font-style:normal;font-weight:%s;"
            "src:url(data:font/woff2;base64,%s) format('woff2');"
            "unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}"
            % (fam_m.group(1), wgt_m.group(1), b64)
        )
        n += 1
        print(f"  {fam} {wgt_m.group(1)}: {len(woff)//1024} KB")
    if n == 0:
        raise SystemExit(f"ERROR: no latin subsets parsed for {fam}")

with open(OUT, "w") as f:
    f.write("\n".join(css_out))
print(f"Wrote {OUT} ({os.path.getsize(OUT)//1024} KB)")
