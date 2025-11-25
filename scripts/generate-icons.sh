#!/bin/bash
# Script to generate all required icon sizes from a source PNG
# Usage: ./scripts/generate-icons.sh <source-icon.png>

SOURCE_ICON="${1:-src-tauri/icons/Square310x310Logo.png}"
ICONS_DIR="src-tauri/icons"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found: $SOURCE_ICON"
    echo "Usage: ./scripts/generate-icons.sh <source-icon.png>"
    exit 1
fi

echo "Generating icons from: $SOURCE_ICON"
echo "Output directory: $ICONS_DIR"

# Check if ImageMagick (convert) is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    # Generate PNG icons
    convert "$SOURCE_ICON" -resize 512x512 "$ICONS_DIR/icon.png"
    convert "$SOURCE_ICON" -resize 32x32 "$ICONS_DIR/32x32.png"
    convert "$SOURCE_ICON" -resize 128x128 "$ICONS_DIR/128x128.png"
    convert "$SOURCE_ICON" -resize 256x256 "$ICONS_DIR/128x128@2x.png"
    
    echo "✅ PNG icons generated"
    
    # Generate macOS .icns (requires iconutil or online conversion)
    echo "⚠️  macOS .icns generation requires iconutil or manual conversion"
    echo "   You can use: https://cloudconvert.com/png-to-icns"
    
    # Generate Windows .ico (requires ImageMagick with ICO support)
    if convert -list format | grep -q "ICO"; then
        convert "$SOURCE_ICON" -resize 256x256 "$ICONS_DIR/icon.ico"
        echo "✅ Windows .ico generated"
    else
        echo "⚠️  Windows .ico generation requires ImageMagick with ICO support"
        echo "   You can use: https://cloudconvert.com/png-to-ico"
    fi
    
# Check if sips (macOS) is available
elif command -v sips &> /dev/null; then
    echo "Using macOS sips..."
    
    # Generate PNG icons
    sips -z 512 512 "$SOURCE_ICON" --out "$ICONS_DIR/icon.png"
    sips -z 32 32 "$SOURCE_ICON" --out "$ICONS_DIR/32x32.png"
    sips -z 128 128 "$SOURCE_ICON" --out "$ICONS_DIR/128x128.png"
    sips -z 256 256 "$SOURCE_ICON" --out "$ICONS_DIR/128x128@2x.png"
    
    echo "✅ PNG icons generated"
    echo "⚠️  .icns and .ico files need to be generated manually or with online tools"
    
# Fallback: use Node.js if available
elif command -v node &> /dev/null; then
    echo "Using Node.js (sharp package required)..."
    echo "⚠️  Install sharp: npm install -g sharp-cli"
    echo "   Or use online tools to generate icons"
    
else
    echo "⚠️  No image conversion tool found!"
    echo ""
    echo "Please install one of:"
    echo "  - ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    echo "  - Or use online tools:"
    echo "    - https://cloudconvert.com/png-to-icns (for macOS .icns)"
    echo "    - https://cloudconvert.com/png-to-ico (for Windows .ico)"
    echo ""
    echo "Required icon files:"
    echo "  - icon.png (512x512)"
    echo "  - 32x32.png"
    echo "  - 128x128.png"
    echo "  - 128x128@2x.png (256x256)"
    echo "  - icon.icns (macOS)"
    echo "  - icon.ico (Windows)"
    exit 1
fi

echo ""
echo "✅ Icon generation complete!"
echo "📁 Icons location: $ICONS_DIR"

