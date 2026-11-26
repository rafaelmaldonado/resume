"""Verify PDF text and reading order; render pages for visual review (requires PyMuPDF)."""
from pathlib import Path
from datetime import datetime
import json
import re
import fitz

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "content.json").read_text())
pdf = fitz.open(root / "output/pdf/rafael-maldonado-cv.pdf")


def compact(value):
    return re.sub(r"\s+", "", value.translate(str.maketrans({"·": "-", "–": "-", "—": "-"}))).lower()


def date_label(value):
    if len(value) == 4:
        return value
    parsed = datetime.fromisoformat(value if len(value) == 10 else value + "-01")
    return parsed.strftime("%b %-d, %Y" if len(value) == 10 else "%b %Y")


extracted = "\n".join(page.get_text() for page in pdf)
actual = compact(extracted)
expected = [data["hero"][key] for key in ["name", "role", "location", "intro"]] + [data["contact"]["email"]]
expected += [item["name"] for item in data["skills"]["items"]]
cursor = 0
for item in data["experience"]["items"]:
    title = item["role"] + " | " + item["company"]
    position = actual.find(compact(title), cursor)
    assert position >= 0, "Role missing or out of reading order: " + title
    cursor = position + len(compact(title))
    expected += [title, item["summary"], *item["highlights"], *item["technologies"], date_label(item["endDate"])]
    if item["startDate"]:
        expected.append(date_label(item["startDate"]))
for item in data["credentials"]["items"]:
    expected += [item["name"] + " - " + item["specialization"], item["renewedDate"], date_label(item["expirationDate"])]
assert all(compact(value) in actual for value in expected), [value for value in expected if compact(value) not in actual]
uris = [link.get("uri") for page in pdf for link in page.get_links()]
assert all(item["url"] in uris for item in data["credentials"]["items"]), "Certificate links missing"
assert "StructTreeRoot" in pdf.xref_get_keys(pdf.pdf_catalog()), "PDF is not tagged"
assert len(pdf) and all(page.get_text().strip() for page in pdf), "Empty PDF or blank page"
assert "Mérida" not in extracted and "Yucatán" not in extracted
render_dir = root / "tmp/pdfs"
render_dir.mkdir(parents=True, exist_ok=True)
for index, page in enumerate(pdf, 1):
    page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(render_dir / f"resume-page-{index}.png")
print(f"Verified {len(pdf)} tagged PDF pages, {len(expected)} text values, role reading order and certificate links.")
