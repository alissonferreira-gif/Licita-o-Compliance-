#!/bin/bash
# Build de desenvolvimento com símbolos de debug e assertions
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../public/wasm"

echo "🔨 Build DEV de processor.cpp..."
mkdir -p "$OUTPUT_DIR"

em++ processor.cpp \
  -o "$OUTPUT_DIR/processor.js" \
  --bind \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME="SentinelaProcessor" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -s ENVIRONMENT='web' \
  -s ASSERTIONS=2 \
  -s NO_EXIT_RUNTIME=1 \
  --no-entry \
  -g \
  -O1

echo "✅ Build DEV concluído!"
