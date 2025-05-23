const fs = require('fs');
const path = require('path');

// Test 1: Verify TextFormattingControls.tsx has been fixed for null value issue
const textFormattingPath = path.join(__dirname, 'src/components/labels/TextFormattingControls.tsx');
const textFormattingContents = fs.readFileSync(textFormattingPath, 'utf8');

// Check for null value fix in the component
const nullValueFixed = textFormattingContents.includes('value={fontSize || 12}');
console.log('TextFormattingControls null value fix:', nullValueFixed ? '✅ Fixed' : '❌ Not fixed');

// Test 2: Verify page.tsx is handling font properties correctly 
const pagePath = path.join(__dirname, 'src/app/editor/page.tsx');
const pageContents = fs.readFileSync(pagePath, 'utf8');

// Check for proper properties handling
const propertiesFixed = pageContents.includes('let properties = element.properties || {};');
console.log('Editor page properties handling:', propertiesFixed ? '✅ Fixed' : '❌ Not fixed');

// Test 3: Check for fontSize handling
const fontSizeFixed = pageContents.includes('fontSize: isTextElement ? (element.fontSize || element.size || 12) : undefined');
console.log('fontSize handling in editor page:', fontSizeFixed ? '✅ Fixed' : '❌ Not fixed');

// Test 4: Check backend handling of fontSize
const backendPath = path.join(__dirname, '..', 'labelapp_backend/src/controllers/labelController.ts');
if (fs.existsSync(backendPath)) {
  const backendContents = fs.readFileSync(backendPath, 'utf8');
  const backendFixed = backendContents.includes('element.fontSize ?? element.size');
  console.log('Backend controller fontSize handling:', backendFixed ? '✅ Fixed' : '❌ Not fixed');
} else {
  console.log('Backend controller: ❓ File not found');
}

// Overall assessment
if (nullValueFixed && propertiesFixed && fontSizeFixed) {
  console.log('\nSummary: All front-end fixes have been applied correctly! ✅');
} else {
  console.log('\nSummary: Some fixes are still missing. Please check the details above. ⚠️');
}
