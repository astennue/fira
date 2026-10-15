#!/usr/bin/env python3
"""Set PDF metadata + render cover preview PNG for the MatchWise deck."""
import pypdf, pypdfium2 as pdfium

PDF = "/home/z/my-project/download/System Prototype/MatchWise-HiFi-System-Design.pdf"
PNG = "/home/z/my-project/download/System Prototype/MatchWise-HiFi-Preview.png"

# 1) Metadata
r = pypdf.PdfReader(PDF)
w = pypdf.PdfWriter()
w.append(r)
w.add_metadata({
    "/Title": "MatchWise — High-Fidelity System Design",
    "/Author": "FIRA",
    "/Creator": "MatchWise Design Team",
    "/Subject": "Hi-fi desktop system design deck (20 screens) — AI match platform for overseas recruitment",
})
with open(PDF, "wb") as f:
    w.write(f)
print("metadata: ok")

# 2) Cover preview PNG
doc = pdfium.PdfDocument(PDF)
page = doc[0]
img = page.render(scale=1.5).to_pil()
img.save(PNG)
print(f"preview: {PNG} ({img.width}x{img.height})")
