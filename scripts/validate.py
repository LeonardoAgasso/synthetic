#!/usr/bin/env python3
"""Checks that data/brands.json is valid before publishing it.

Usage:  python3 scripts/validate.py
Exits with code 1 (and lists the problems) if anything is wrong.
If you add a sector or a use, update it here AND in assets/common.js.
"""

import json
import re
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "brands.json"

CATEGORIES = {"ai", "no-ai"}
SECTORS = {"fashion", "ecommerce", "food", "beauty", "tech", "auto", "other"}
USES = {"campaign", "social", "ecommerce", "video", "digital-twins", "virtual-influencer"}

ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$")
FULL_DATE_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
COUNTRY_RE = re.compile(r"^[A-Z]{2}$")


def text_block(value):
    """A valid text field is a non-empty string."""
    return isinstance(value, str) and bool(value.strip())


def main():
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: line {e.lineno}, column {e.colno}: {e.msg}")
        return 1

    errors = []

    if not isinstance(data.get("updated"), str) or not FULL_DATE_RE.match(data["updated"]):
        errors.append('"updated" must be a date in YYYY-MM-DD format')

    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        errors.append('"entries" must be a non-empty list')
        entries = []

    seen = set()
    for i, e in enumerate(entries):
        where = f"entry {i + 1} ({e.get('id', 'no id')})"

        entry_id = e.get("id")
        if not isinstance(entry_id, str) or not ID_RE.match(entry_id):
            errors.append(f"{where}: missing or invalid id (lowercase letters, digits and hyphens only)")
        elif entry_id in seen:
            errors.append(f"{where}: duplicate id")
        else:
            seen.add(entry_id)

        if not isinstance(e.get("brand"), str) or not e["brand"].strip():
            errors.append(f"{where}: missing brand")

        if e.get("category") not in CATEGORIES:
            errors.append(f"{where}: category must be one of {sorted(CATEGORIES)}")

        if e.get("sector") not in SECTORS:
            errors.append(f"{where}: sector must be one of {sorted(SECTORS)}")

        if not isinstance(e.get("country"), str) or not COUNTRY_RE.match(e["country"]):
            errors.append(f"{where}: country must be a two-letter uppercase code (e.g. IT)")

        if not isinstance(e.get("date"), str) or not DATE_RE.match(e["date"]):
            errors.append(f"{where}: date must be YYYY, YYYY-MM or YYYY-MM-DD")

        uses = e.get("uses")
        if not isinstance(uses, list):
            errors.append(f"{where}: uses must be a list")
        else:
            unknown = [u for u in uses if u not in USES]
            if unknown:
                errors.append(f"{where}: unknown uses {unknown}")
            if e.get("category") == "ai" and not uses:
                errors.append(f"{where}: list at least one use")

        if not text_block(e.get("note")):
            errors.append(f"{where}: note must be a non-empty string")
        if not text_block(e.get("disclosure")):
            errors.append(f"{where}: disclosure must be a non-empty string")

        sources = e.get("sources")
        if not isinstance(sources, list) or not sources:
            errors.append(f"{where}: at least one source is required")
        else:
            for j, s in enumerate(sources):
                if not isinstance(s.get("url"), str) or not s["url"].startswith("https://"):
                    errors.append(f"{where}, source {j + 1}: url missing or not https")
                if not isinstance(s.get("publisher"), str) or not s["publisher"].strip():
                    errors.append(f"{where}, source {j + 1}: missing publisher")
                if "date" in s and not (isinstance(s["date"], str) and DATE_RE.match(s["date"])):
                    errors.append(f"{where}, source {j + 1}: date must be YYYY, YYYY-MM or YYYY-MM-DD")

    if errors:
        print(f"Found {len(errors)} problems in {DATA.name}:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"{DATA.name} is valid: {len(entries)} entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
