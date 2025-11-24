#!/usr/bin/env node
/**
 * Generate all required icon sizes from a source PNG
 * Usage: node scripts/generate-icons.js <source-icon.png>
 * 
 * Requires: npm install sharp (or pnpm add sharp)
 */

const fs = require('fs');
const path = require('path');

const SOURCE_ICON = process.argv[2] || 'src-tauri/icons/Square310x310Logo.png';
const ICONS_DIR = path.join(__dirname, '../src-tauri/icons');

// Check if source exists
if (!fs.existsSync(SOURCE_ICON)) {
  console.error(`Error: Source icon not found: ${SOURCE_ICON}`);
  console.error('Usage: node scripts/generate-icons.js <source-icon.png>');
  process.exit(1);
}

// Try to use sharp if available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('⚠️  Error: sharp package not found!');
  console.error('');
  console.error('Please install sharp:');
  console.error('  npm install sharp');
  console.error('  or');
  console.error('  pnpm add sharp');
  console.error('');
  console.error('Alternatively, use the shell script:');
  console.error('  ./scripts/generate-icons.sh');
  process.exit(1);
}

async function generateIcons() {
  console.log(`Generating icons from: ${SOURCE_ICON}`);
  console.log(`Output directory: ${ICONS_DIR}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  try {
    // Generate PNG icons
    console.log('Generating PNG icons...');
    await sharp(SOURCE_ICON).resize(512, 512).toFile(path.join(ICONS_DIR, 'icon.png'));
    console.log('  ✅ icon.png (512x512)');

    await sharp(SOURCE_ICON).resize(32, 32).toFile(path.join(ICONS_DIR, '32x32.png'));
    console.log('  ✅ 32x32.png');

    await sharp(SOURCE_ICON).resize(128, 128).toFile(path.join(ICONS_DIR, '128x128.png'));
    console.log('  ✅ 128x128.png');

    await sharp(SOURCE_ICON).resize(256, 256).toFile(path.join(ICONS_DIR, '128x128@2x.png'));
    console.log('  ✅ 128x128@2x.png (256x256)');

    // Generate Windows .ico
    console.log('');
    console.log('Generating Windows .ico...');
    // ICO format requires multiple sizes, so we'll create a multi-resolution ICO
    const icoSizes = [16, 32, 48, 64, 128, 256];
    const icoImages = await Promise.all(
      icoSizes.map(size => 
        sharp(SOURCE_ICON)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    
    // Note: sharp doesn't directly support ICO format, so we'll save as PNG
    // For actual .ico, you may need to use online tools or imagemagick
    console.log('  ⚠️  Note: sharp doesn\'t generate .ico directly');
    console.log('  💡 Use online tool: https://cloudconvert.com/png-to-ico');
    console.log('  💡 Or use ImageMagick: convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico');

    // Generate macOS .icns
    console.log('');
    console.log('Generating macOS .icns...');
    console.log('  ⚠️  Note: sharp doesn\'t generate .icns directly');
    console.log('  💡 Use macOS iconutil:');
    console.log('     mkdir icon.iconset');
    console.log('     cp 32x32.png icon.iconset/icon_16x16.png');
    console.log('     cp 32x32.png icon.iconset/icon_16x16@2x.png');
    console.log('     cp 128x128.png icon.iconset/icon_32x32.png');
    console.log('     cp 128x128@2x.png icon.iconset/icon_32x32@2x.png');
    console.log('     cp 128x128.png icon.iconset/icon_128x128.png');
    console.log('     cp 128x128@2x.png icon.iconset/icon_128x128@2x.png');
    console.log('     cp icon.png icon.iconset/icon_256x256.png');
    console.log('     cp icon.png icon.iconset/icon_256x256@2x.png');
    console.log('     cp icon.png icon.iconset/icon_512x512.png');
    console.log('     cp icon.png icon.iconset/icon_512x512@2x.png');
    console.log('     iconutil -c icns icon.iconset -o icon.icns');
    console.log('  💡 Or use online tool: https://cloudconvert.com/png-to-icns');

    console.log('');
    console.log('✅ PNG icons generated successfully!');
    console.log(`📁 Icons location: ${ICONS_DIR}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Generate .ico file (Windows) using online tool or ImageMagick');
    console.log('   2. Generate .icns file (macOS) using iconutil or online tool');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();

