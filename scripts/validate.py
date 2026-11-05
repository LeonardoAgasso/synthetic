#!/usr/bin/env python3
"""Controlla che data/brands.json sia valido prima di pubblicarlo.

Uso:  python3 scripts/validate.py
Esce con codice 1 (e l'elenco dei problemi) se qualcosa non va.
Se aggiungi un settore o un uso, aggiornalo qui E in assets/common.js.
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
    """Un testo bilingue valido ha almeno una lingua compilata."""
    return isinstance(value, dict) and any(
        isinstance(value.get(k), str) and value[k].strip() for k in ("it", "en")
    )


def main():
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"JSON non valido: riga {e.lineno}, colonna {e.colno}: {e.msg}")
        return 1

    errors = []

    if not isinstance(data.get("updated"), str) or not FULL_DATE_RE.match(data["updated"]):
        errors.append('"updated" deve essere una data nel formato AAAA-MM-GG')

    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        errors.append('"entries" deve essere un elenco non vuoto')
        entries = []

    seen = set()
    for i, e in enumerate(entries):
        where = f"voce {i + 1} ({e.get('id', 'senza id')})"

        entry_id = e.get("id")
        if not isinstance(entry_id, str) or not ID_RE.match(entry_id):
            errors.append(f"{where}: id mancante o non valido (solo minuscole, numeri e trattini)")
        elif entry_id in seen:
            errors.append(f"{where}: id duplicato")
        else:
            seen.add(entry_id)

        if not isinstance(e.get("brand"), str) or not e["brand"].strip():
            errors.append(f"{where}: brand mancante")

        if e.get("category") not in CATEGORIES:
            errors.append(f"{where}: category deve essere uno tra {sorted(CATEGORIES)}")

        if e.get("sector") not in SECTORS:
            errors.append(f"{where}: sector deve essere uno tra {sorted(SECTORS)}")

        if not isinstance(e.get("country"), str) or not COUNTRY_RE.match(e["country"]):
            errors.append(f"{where}: country deve essere un codice di due lettere maiuscole (es. IT)")

        if not isinstance(e.get("date"), str) or not DATE_RE.match(e["date"]):
            errors.append(f"{where}: date deve essere AAAA, AAAA-MM o AAAA-MM-GG")

        uses = e.get("uses")
        if not isinstance(uses, list):
            errors.append(f"{where}: uses deve essere un elenco")
        else:
            unknown = [u for u in uses if u not in USES]
            if unknown:
                errors.append(f"{where}: usi non riconosciuti {unknown}")
            if e.get("category") == "ai" and not uses:
                errors.append(f"{where}: indica almeno un uso")

        if not text_block(e.get("note")):
            errors.append(f"{where}: note deve avere almeno il testo in it o en")
        if not text_block(e.get("disclosure")):
            errors.append(f"{where}: disclosure deve avere almeno il testo in it o en")

        sources = e.get("sources")
        if not isinstance(sources, list) or not sources:
            errors.append(f"{where}: serve almeno una fonte")
        else:
            for j, s in enumerate(sources):
                if not isinstance(s.get("url"), str) or not s["url"].startswith("https://"):
                    errors.append(f"{where}, fonte {j + 1}: url mancante o non https")
                if not isinstance(s.get("publisher"), str) or not s["publisher"].strip():
                    errors.append(f"{where}, fonte {j + 1}: publisher mancante")
                if "date" in s and not (isinstance(s["date"], str) and DATE_RE.match(s["date"])):
                    errors.append(f"{where}, fonte {j + 1}: date deve essere AAAA, AAAA-MM o AAAA-MM-GG")

    if errors:
        print(f"Trovati {len(errors)} problemi in {DATA.name}:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"{DATA.name} è valido: {len(entries)} voci.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
