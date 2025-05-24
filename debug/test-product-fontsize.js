// Test script to verify font size handling for product elements
console.log('Testing font size handling in product elements');

// Example of a product element creation and update lifecycle
const productElement = {
  id: 'test-id',
  type: 'product',
  x: 10,
  y: 10,
  fontSize: 14, // Initial font size
  value: 'Sample product',
  properties: {
    bold: false,
    italic: false,
    strikethrough: false,
    fontFamily: 'Arial',
    fontSize: 14 // Should match main fontSize property
  }
};

console.log('Initial product element:', productElement);

// Simulate updating fontSize through the UI
console.log('\nUpdating fontSize to 18...');
const updatedElement = {
  ...productElement,
  fontSize: 18, // Updated main property
  properties: {
    ...productElement.properties,
    fontSize: 18 // Updated in properties too
  }
};

console.log('Updated product element:', updatedElement);

// Simulate what happens when saving to the database with our fix
console.log('\nSimulating save to database with fixed controller...');
const isTextElement = ['text', 'uuidText', 'company', 'product'].includes(updatedElement.type);
const fontSize = isTextElement ? (updatedElement.fontSize || updatedElement.properties.fontSize || 12) : null;

const dbSavedElement = {
  ...updatedElement,
  fontSize: fontSize
};

console.log('Element saved to database:', dbSavedElement);

// Simulate what would happen with the bug (before our fix)
console.log('\nSimulating save to database with buggy controller (for comparison)...');
const isTextElementBuggy = ['text', 'uuidText', 'company'].includes(updatedElement.type);
const fontSizeBuggy = isTextElementBuggy ? (updatedElement.fontSize || updatedElement.properties.fontSize || 12) : null;

const dbSavedElementBuggy = {
  ...updatedElement,
  fontSize: fontSizeBuggy
};

console.log('Element saved to database (with bug):', dbSavedElementBuggy);

// Verify the difference between bug and fix
console.log('\nFont size preserved correctly with fix:', dbSavedElement.fontSize === 18);
console.log('Font size would be null with bug:', dbSavedElementBuggy.fontSize === null);