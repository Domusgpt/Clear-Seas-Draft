#!/usr/bin/env python3
"""Static asset smoke tests for Clear Seas / CSS-Web-Master HTML builds.

This script scans each HTML file in the repository and verifies that
locally-referenced assets (scripts, stylesheets, images, video files, etc.)
exist on disk. Remote URLs (http/https), inline data URIs, and hash
fragments are ignored so teams can host external resources without triggering
false positives.

Run the script from the repository root:

    python scripts/html-smoke-test.py --output docs/html-testing-report.md

By default the report is printed to stdout.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable, List, Sequence

REPO_ROOT = Path(__file__).resolve().parents[1]


@dataclass
class MissingResource:
    tag: str
    attribute: str
    value: str


class ResourceCollector(HTMLParser):
    """Collects local asset references from an HTML document."""

    def __init__(self) -> None:
        super().__init__()
        self._resources: List[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: Sequence[tuple[str, str | None]]) -> None:
        attr_name = self._attribute_for_tag(tag)
        if not attr_name:
            return

        attr_value = self._get_attr(attrs, attr_name)
        if not attr_value:
            return

        if self._should_skip(attr_value):
            return

        self._resources.append((tag, attr_value))

        # Some media tags may have secondary sources (e.g., <video poster="...">)
        if tag in {"video", "audio"}:
            poster = self._get_attr(attrs, "poster")
            if poster and not self._should_skip(poster):
                self._resources.append((f"{tag}[poster]", poster))

    @staticmethod
    def _attribute_for_tag(tag: str) -> str | None:
        mapping = {
            "script": "src",
            "img": "src",
            "source": "src",
            "track": "src",
            "link": "href",
            "video": "src",
            "audio": "src",
            "iframe": "src",
        }
        return mapping.get(tag)

    @staticmethod
    def _get_attr(attrs: Sequence[tuple[str, str | None]], name: str) -> str | None:
        for attr_name, attr_value in attrs:
            if attr_name == name and attr_value:
                return attr_value.strip()
        return None

    @staticmethod
    def _should_skip(value: str) -> bool:
        lowered = value.lower()
        return (
            lowered.startswith("http://")
            or lowered.startswith("https://")
            or lowered.startswith("//")
            or lowered.startswith("data:")
            or lowered.startswith("javascript:")
            or lowered.startswith("mailto:")
            or lowered.startswith("tel:")
            or lowered.startswith("#")
        )

    @property
    def resources(self) -> Iterable[tuple[str, str]]:
        return self._resources


def iter_html_files(root: Path) -> Iterable[Path]:
    for path in sorted(root.glob("**/*.html")):
        if any(part.startswith(".") for part in path.relative_to(root).parts):
            continue
        yield path


def normalize_path(path: str) -> str:
    clean = path.split("?")[0].split("#")[0]
    return clean


def check_file(html_path: Path) -> list[MissingResource]:
    parser = ResourceCollector()
    parser.feed(html_path.read_text(encoding="utf-8", errors="ignore"))

    missing: list[MissingResource] = []
    base_dir = html_path.parent

    for tag, resource in parser.resources:
        normalized = normalize_path(resource)
        candidate = (base_dir / normalized).resolve()
        try:
            candidate.relative_to(REPO_ROOT)
        except ValueError:
            # Resource points outside of the repo root; treat as missing.
            missing.append(MissingResource(tag=tag, attribute="src" if "src" in tag else "href", value=resource))
            continue

        if not candidate.exists():
            missing.append(MissingResource(tag=tag, attribute="src" if "src" in tag else "href", value=resource))

    return missing


def build_report(results: dict[Path, list[MissingResource]]) -> str:
    lines: list[str] = []
    lines.append("# HTML Smoke Test Report")
    lines.append("")
    lines.append("This report captures local asset resolution checks for every HTML build in the repository.")
    lines.append("Remote resources (http/https), inline data URIs, and anchor hashes are ignored.")
    lines.append("")

    for html_file, missing in results.items():
        rel_path = html_file.relative_to(REPO_ROOT)
        if missing:
            lines.append(f"## ❌ {rel_path}")
            lines.append("")
            lines.append("Missing local assets:")
            lines.append("")
            for m in missing:
                lines.append(f"- `{m.tag}` missing `{m.attribute}` → `{m.value}`")
        else:
            lines.append(f"## ✅ {rel_path}")
            lines.append("")
            lines.append("All local assets resolved.")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check HTML files for missing local asset references.")
    parser.add_argument("--output", type=Path, help="Optional path to write the markdown report.")
    parser.add_argument("paths", nargs="*", type=Path, help="Optional subset of HTML files to check.")
    return parser.parse_args(argv)


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)

    html_files: Iterable[Path]
    if args.paths:
        html_files = [REPO_ROOT / path for path in args.paths]
    else:
        html_files = iter_html_files(REPO_ROOT)

    results: dict[Path, list[MissingResource]] = {}
    for html_path in html_files:
        if html_path.suffix.lower() != ".html":
            continue
        if not html_path.exists():
            print(f"warning: {html_path} does not exist", file=sys.stderr)
            continue
        results[html_path] = check_file(html_path)

    report = build_report(results)

    if args.output:
        output_path: Path = args.output
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report, encoding="utf-8")
    else:
        print(report)

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
