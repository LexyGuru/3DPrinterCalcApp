#!/bin/bash
# Generate macOS .icns file from PNG icons
# This script should be run after generate-icons.sh or generate-icons.js

ICONS_DIR="src-tauri/icons"
ICONSET_DIR="$ICONS_DIR/icon.iconset"

echo "Generating macOS .icns file..."

# Create iconset directory
mkdir -p "$ICONSET_DIR"

# Copy and rename icons to match macOS iconset structure
if [ -f "$ICONS_DIR/32x32.png" ]; then
    cp "$ICONS_DIR/32x32.png" "$ICONSET_DIR/icon_16x16.png"
    cp "$ICONS_DIR/32x32.png" "$ICONSET_DIR/icon_16x16@2x.png"
fi

if [ -f "$ICONS_DIR/128x128.png" ]; then
    cp "$ICONS_DIR/128x128.png" "$ICONSET_DIR/icon_32x32.png"
fi

if [ -f "$ICONS_DIR/128x128@2x.png" ]; then
    cp "$ICONS_DIR/128x128@2x.png" "$ICONSET_DIR/icon_32x32@2x.png"
    cp "$ICONS_DIR/128x128@2x.png" "$ICONSET_DIR/icon_128x128.png"
    cp "$ICONS_DIR/128x128@2x.png" "$ICONSET_DIR/icon_128x128@2x.png"
fi

if [ -f "$ICONS_DIR/icon.png" ]; then
    cp "$ICONS_DIR/icon.png" "$ICONSET_DIR/icon_256x256.png"
    cp "$ICONS_DIR/icon.png" "$ICONSET_DIR/icon_256x256@2x.png"
    cp "$ICONS_DIR/icon.png" "$ICONSET_DIR/icon_512x512.png"
    cp "$ICONS_DIR/icon.png" "$ICONSET_DIR/icon_512x512@2x.png"
fi

# Generate .icns file using iconutil
if command -v iconutil &> /dev/null; then
    iconutil -c icns "$ICONSET_DIR" -o "$ICONS_DIR/icon.icns"
    echo "✅ icon.icns generated successfully!"
    
    # Clean up iconset directory
    rm -rf "$ICONSET_DIR"
else
    echo "⚠️  iconutil not found. This script requires macOS."
    echo "💡 You can use online tool: https://cloudconvert.com/png-to-icns"
fi

