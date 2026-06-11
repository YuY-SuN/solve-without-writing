#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
INDEX_PATH = DATA_DIR / "index.json"
SKIP_FILES = {"index.json"}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "dataset"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_existing_index():
    if not INDEX_PATH.exists():
        return {"defaultDatasetId": None, "datasets": []}
    return load_json(INDEX_PATH)


def list_dataset_files():
    return sorted(
        path for path in DATA_DIR.glob("*.json") if path.name not in SKIP_FILES
    )


def make_entry(path: Path, existing_by_path: dict[str, dict], used_ids: set[str]):
    data = load_json(path)
    existing = existing_by_path.get(path.name, {})

    base_id = existing.get("id") or slugify(path.stem)
    dataset_id = base_id
    suffix = 2
    while dataset_id in used_ids:
        dataset_id = f"{base_id}-{suffix}"
        suffix += 1
    used_ids.add(dataset_id)

    label = existing.get("label") or data.get("meta", {}).get("title") or path.stem
    return {
        "id": dataset_id,
        "label": label,
        "path": path.name,
    }


def build_index():
    existing_index = load_existing_index()
    existing_by_path = {
        entry.get("path"): entry
        for entry in existing_index.get("datasets", [])
        if entry.get("path")
    }

    used_ids = set()
    datasets = [make_entry(path, existing_by_path, used_ids) for path in list_dataset_files()]

    default_id = existing_index.get("defaultDatasetId")
    valid_ids = {entry["id"] for entry in datasets}
    if default_id not in valid_ids:
        default_id = datasets[0]["id"] if datasets else None

    return {
        "defaultDatasetId": default_id,
        "datasets": datasets,
    }


def write_index(index_data):
    INDEX_PATH.write_text(
        json.dumps(index_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main():
    try:
        index_data = build_index()
        write_index(index_data)
    except Exception as exc:
        print(f"failed to sync index.json: {exc}", file=sys.stderr)
        return 1

    print(f"updated {INDEX_PATH}")
    print(f"datasets: {len(index_data['datasets'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
