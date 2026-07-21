#!/usr/bin/env python3
"""Serve the prototype and expose a small on-device Vision OCR endpoint."""

import json
import mimetypes
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


PROJECT_DIR = Path(__file__).resolve().parent
OCR_BINARY = PROJECT_DIR / "scripts" / "ocr_problem"
MAX_IMAGE_BYTES = 20 * 1024 * 1024


class PrototypeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/ocr":
            self.send_json(404, {"error": "Not found"})
            return

        if not OCR_BINARY.exists():
            self.send_json(503, {"error": "OCR helper is not built"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        if content_length <= 0 or content_length > MAX_IMAGE_BYTES:
            self.send_json(400, {"error": "Invalid image size"})
            return

        image_bytes = self.rfile.read(content_length)
        content_type = self.headers.get("Content-Type", "image/jpeg").split(";", 1)[0]
        suffix = mimetypes.guess_extension(content_type) or ".jpg"
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(prefix="ai-tutor-ocr-", suffix=suffix, delete=False) as temp_file:
                temp_file.write(image_bytes)
                temp_path = temp_file.name

            result = subprocess.run(
                [str(OCR_BINARY), temp_path],
                capture_output=True,
                text=True,
                timeout=35,
                check=False,
            )
            if result.returncode != 0:
                self.send_json(422, {"error": result.stderr.strip() or "OCR failed"})
                return
            self.send_json(200, {"text": result.stdout.strip()})
        except subprocess.TimeoutExpired:
            self.send_json(504, {"error": "OCR timed out"})
        finally:
            if temp_path:
                try:
                    os.unlink(temp_path)
                except FileNotFoundError:
                    pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    server = ThreadingHTTPServer(("127.0.0.1", port), PrototypeHandler)
    print(f"Serving AI tutor prototype on http://127.0.0.1:{port}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
