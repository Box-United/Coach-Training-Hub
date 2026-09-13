"""Split the season curriculum guide into one PDF per week.

The coach curriculum guide arrives as a single PDF covering the whole season.
The hub serves it a week at a time, so this cuts it up into assets/curriculum/.

    python scripts/split-curriculum.py "Box United Curriculum Season 1.pdf"

Needs PyMuPDF:

    pip install pymupdf

Each week's assessment log is kept with the practice it belongs to (weeks 1,
2, 6 and 10 have one), so a coach printing a single file has everything for
that session. The scenario cards are pulled out separately because week 7
needs them printed and cut up rather than read, and the front matter becomes
one coach guide linked once rather than repeated on every week.

PAGE NUMBERS ARE THE PDF'S OWN, 1-based, not the numbers printed on the page,
which run 12 lower. If the guide is ever re-paginated these ranges have to be
checked against its contents page. The script prints the first line of every
file it writes, so a range that has slipped shows up immediately as the wrong
practice title.
"""

import os
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is not installed. Run: pip install pymupdf")

OUT_DIR = os.path.join("assets", "curriculum")

# (output file, [(first page, last page), ...]) — inclusive, 1-based.
JOBS = [
    ("coach-guide.pdf",    [(1, 12), (63, 63)]),  # getting started + references
    ("week-01.pdf",        [(14, 20)]),           # + jump rope assessment log
    ("week-02.pdf",        [(21, 26)]),           # + punch count log
    ("week-03.pdf",        [(27, 30)]),
    ("week-04.pdf",        [(31, 34)]),
    ("week-05.pdf",        [(35, 39)]),
    ("week-06.pdf",        [(40, 45)]),           # + midpoint punch count log
    ("week-07.pdf",        [(46, 49)]),
    ("week-08.pdf",        [(50, 53)]),
    ("week-09.pdf",        [(54, 55)]),
    ("week-10.pdf",        [(56, 60)]),           # + both post-assessment logs
    ("scenario-cards.pdf", [(61, 62)]),           # week 7 cut-outs
]


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python scripts/split-curriculum.py <curriculum.pdf>")

    source_path = sys.argv[1]
    if not os.path.isfile(source_path):
        sys.exit("No such file: " + source_path)

    source = fitz.open(source_path)

    # Catch a re-paginated guide before it writes twelve wrong files.
    highest = max(end for _, ranges in JOBS for _, end in ranges)
    if source.page_count < highest:
        sys.exit(
            "This PDF has %d pages but the ranges in this script go up to %d. "
            "The guide has probably been re-paginated: check the ranges against "
            "its contents page." % (source.page_count, highest)
        )

    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    for name, ranges in JOBS:
        out = fitz.open()
        for first, last in ranges:
            out.insert_pdf(source, from_page=first - 1, to_page=last - 1)

        path = os.path.join(OUT_DIR, name)
        out.save(path, garbage=4, deflate=True)

        # The first line is the practice title, so this is the quickest check
        # that a range still points where it is supposed to.
        opening = " ".join(out[0].get_text().split())[:58]
        print("%-20s %2d pages  %6.0f KB  %s"
              % (name, out.page_count, os.path.getsize(path) / 1024.0, opening))
        out.close()

    source.close()
    print("\nWrote %d files to %s" % (len(JOBS), OUT_DIR))


if __name__ == "__main__":
    main()
