#!/bin/bash
# SENTINELA B2B — Script de compilação C++ → WebAssembly
#
# Pré-requisitos:
#   git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
#   cd ~/emsdk && ./emsdk install latest && ./emsdk activate latest
#   source ~/emsdk/emsdk_env.sh
#
# Para compilar:
#   cd wasm-src && chmod +x build.sh && ./build.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../public/wasm"

echo "🔨 Compilando processor.cpp para WebAssembly..."
mkdir -p "$OUTPUT_DIR"

em++ processor.cpp \
  -o "$OUTPUT_DIR/processor.js" \
  --bind \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME="SentinelaProcessor" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MAXIMUM_MEMORY=256MB \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -s ENVIRONMENT='web' \
  -s NO_EXIT_RUNTIME=1 \
  --no-entry \
  -O3

echo "✅ Compilado com sucesso!"
echo "   → $OUTPUT_DIR/processor.js"
echo "   → $OUTPUT_DIR/processor.wasm"
echo ""
echo "⚡ Build de desenvolvimento (com debug):"
echo "   ./build-dev.sh"
