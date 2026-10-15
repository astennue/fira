#!/usr/bin/env python3
"""Post-process MatchWise legal docx files for WPS/Word compatibility.

1. Remove empty <w:pgNumType/> elements from document.xml (docx-js artifact).
2. Patch footer PAGE fields with explicit format switches:
   - Roman-numeral sections -> PAGE \\* ROMAN \\* MERGEFORMAT
   - Arabic sections        -> PAGE \\* arabic \\* MERGEFORMAT
   Footer files are mapped to their section via footerReference rels.
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path


def patch(path):
    src = Path(path)
    tmp = src.with_suffix(".tmp.docx")

    with zipfile.ZipFile(src, "r") as zin:
        names = zin.namelist()
        data = {n: zin.read(n) for n in names}

    doc_xml = data["word/document.xml"].decode("utf-8")

    # 1. strip empty pgNumType
    doc_xml = re.sub(r"<w:pgNumType/>", "", doc_xml)

    # 2. map sectPr -> footer rIds in document order, with each sectPr's fmt
    sect_blocks = re.findall(r"<w:sectPr[^>]*>.*?</w:sectPr>", doc_xml, re.S)
    rels_xml = data["word/_rels/document.xml.rels"].decode("utf-8")
    rid_to_target = dict(re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"', rels_xml))

    footer_fmt = {}  # footer file -> 'ROMAN' | 'arabic'
    for block in sect_blocks:
        fmt = "arabic"
        m = re.search(r'<w:pgNumType[^>]*w:fmt="([^"]+)"', block)
        if m and "roman" in m.group(1).lower():
            fmt = "ROMAN"
        for rid in re.findall(r'<w:footerReference[^>]*r:id="([^"]+)"', block):
            target = rid_to_target.get(rid, "")
            fname = "word/" + target.lstrip("/") if not target.startswith("word/") else target
            if fname in data:
                footer_fmt[fname] = fmt

    for fname, fmt in footer_fmt.items():
        fx = data[fname].decode("utf-8")
        fx = re.sub(
            r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
            rf"\1 PAGE \\* {fmt} \\* MERGEFORMAT \2",
            fx,
        )
        data[fname] = fx.encode("utf-8")

    data["word/document.xml"] = doc_xml.encode("utf-8")

    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for n in names:
            zout.writestr(n, data[n])
    shutil.move(tmp, src)
    print(f"Patched {src.name}: footers={ {k.split('/')[-1]: v for k, v in footer_fmt.items()} }")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        patch(arg)
