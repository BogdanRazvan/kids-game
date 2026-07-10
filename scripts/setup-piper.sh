#!/usr/bin/env bash
# One-time download of the Piper neural TTS engine + Romanian "mihai" voice,
# used by `npm run gen-audio` to render natural-sounding instruction clips.
# ~115 MB, kept out of git (see scripts/.gitignore). Linux x86_64.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)/.piper"
mkdir -p "$DIR"

echo "Downloading Piper binary…"
curl -sL -o "$DIR/piper.tar.gz" \
  https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz
tar xzf "$DIR/piper.tar.gz" -C "$DIR"
mv "$DIR/piper" "$DIR/piper-bin"
rm "$DIR/piper.tar.gz"

echo "Downloading Romanian voice (mihai, medium)…"
BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main/ro/ro_RO/mihai/medium
curl -sL -o "$DIR/mihai.onnx"      "$BASE/ro_RO-mihai-medium.onnx"
curl -sL -o "$DIR/mihai.onnx.json" "$BASE/ro_RO-mihai-medium.onnx.json"

echo "Done. Now run: npm run gen-audio"
