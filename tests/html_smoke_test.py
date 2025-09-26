#!/usr/bin/env python3
"""Load each top-level HTML file and capture console/page errors."""
import asyncio
import json
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Tuple

from playwright.async_api import (
    Error as PlaywrightError,
    TimeoutError as PlaywrightTimeout,
    async_playwright,
)

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(
    [p for p in ROOT.glob("*.html") if p.is_file()]
)


class SilentHTTPRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        # Silence the default stdout logging from each asset fetch.
        return

    def handle(self) -> None:
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            # Ignore disconnect noise when headless browsers tear down early.
            pass


def start_static_server(root: Path) -> Tuple[ThreadingHTTPServer, str]:
    handler = partial(SilentHTTPRequestHandler, directory=str(root))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    host, port = httpd.server_address
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, f"http://{host}:{port}"


async def audit_file(context, base_url: str, html_path: Path) -> Dict[str, Any]:
    page = await context.new_page()
    console_events: List[Dict[str, Any]] = []
    page_errors: List[str] = []
    request_failures: List[Dict[str, str]] = []
    response_errors: List[Dict[str, Any]] = []

    def handle_console(msg):
        if msg.type == "error":
            console_events.append(
                {
                    "type": msg.type,
                    "text": msg.text,
                }
            )

    page.on("console", handle_console)
    page.on("pageerror", lambda exc: page_errors.append(str(exc)))
    page.on(
        "requestfailed",
        lambda request: request_failures.append(
            {
                "url": request.url,
                "failure": request.failure,  # type: ignore[arg-type]
            }
        ),
    )
    page.on(
        "response",
        lambda response: response.status >= 400
        and response_errors.append(
            {
                "url": response.url,
                "status": response.status,
                "status_text": response.status_text,
            }
        ),
    )

    file_url = f"{base_url}/{html_path.name}"
    navigation_error = None
    try:
        await page.goto(file_url, wait_until="load", timeout=20000)
        try:
            await page.wait_for_load_state("networkidle", timeout=10000)
        except PlaywrightTimeout:
            # networkidle frequently times out on static pages; only treat as warning
            pass
        except PlaywrightError as load_err:
            navigation_error = f"load-state: {load_err}"
        await page.wait_for_timeout(2000)
    except PlaywrightError as nav_err:
        navigation_error = str(nav_err)
    finally:
        await page.close()

    return {
        "file": html_path.name,
        "console_errors": console_events,
        "page_errors": page_errors,
        "navigation_error": navigation_error,
        "request_failures": request_failures,
        "response_errors": response_errors,
    }


async def main() -> None:
    httpd, base_url = start_static_server(ROOT)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            context = await browser.new_context()
            results = []
            for html_path in HTML_FILES:
                print(f"Auditing {html_path.name}...", file=sys.stderr)
                results.append(await audit_file(context, base_url, html_path))
            await browser.close()
    finally:
        httpd.shutdown()
        httpd.server_close()
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
