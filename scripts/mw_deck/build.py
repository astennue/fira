#!/usr/bin/env python3
"""Assemble the MatchWise high-fidelity deck: fonts + css + slide fragments -> single HTML."""
import os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/z/my-project/download/MatchWise-HiFi-System-Design.html"

fonts = open(os.path.join(BASE, "fonts_b64.css")).read()
css = "\n".join(open(p).read() for p in sorted(glob.glob(os.path.join(BASE, "css", "*.css"))))
frags = sorted(glob.glob(os.path.join(BASE, "frag", "s*.html")))

body = "\n".join(open(p).read() for p in frags)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MatchWise — High-Fidelity System Design</title>
<style>
{fonts}
</style>
<style>
{css}
</style>
</head>
<body>
<div class="deck">
{body}
</div>
<script>
(function(){{
  var fit=function(){{
    var z=Math.min(1,(window.innerWidth-32)/1460);
    document.documentElement.style.setProperty('--pz',z.toFixed(4));
  }};
  fit();window.addEventListener('resize',fit);
}})();
</script>
</body>
</html>
"""
with open(OUT, "w") as f:
    f.write(html)
print(f"Wrote {OUT} ({os.path.getsize(OUT)//1024} KB), slides: {len(frags)}")
