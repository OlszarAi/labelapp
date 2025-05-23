// This script tests both old and new ways of accessing text formatting properties
// to ensure backward compatibility with the new schema

// Example element representing an old schema record
const oldElement = {
  id: 'test1',
  type: 'uuidText',
  x: 10,
  y: 10,
  size: 12,
  bold: true,
  italic: false,
  strikethrough: false,
  fontFamily: 'Arial',
  value: '12345678-1234-1234-1234-1234567890ab'
};

// Example element representing the new schema
const newElement = {
  id: 'test2',
  type: 'uuidText',
  x: 10,
  y: 10,
  fontSize: 12,
  properties: {
    bold: true,
    italic: false,
    strikethrough: false,
    fontFamily: 'Arial',
  },
  value: '12345678-1234-1234-1234-1234567890ab'
};

// Helper function to render text properties consistently regardless of schema
function renderElementText(element) {
  // Get font size (preferring fontSize over size)
  const fontSize = element.fontSize || element.size || 12;
  
  // Get text styling properties (preferring properties object if available)
  const isBold = element.properties?.bold ?? element.bold ?? false;
  const isItalic = element.properties?.italic ?? element.italic ?? false;
  const isStrikethrough = element.properties?.strikethrough ?? element.strikethrough ?? false;
  const fontFamily = element.properties?.fontFamily ?? element.fontFamily ?? 'Arial';
  
  console.log(`Rendering element with id ${element.id}:
  Font Size: ${fontSize}
  Font Family: ${fontFamily}
  Bold: ${isBold ? 'Yes' : 'No'}
  Italic: ${isItalic ? 'Yes' : 'No'}
  Strikethrough: ${isStrikethrough ? 'Yes' : 'No'}
  Value: ${element.value}
  `);
}

// Test rendering with both old and new schema
console.log("=== Testing Old Schema ===");
renderElementText(oldElement);

console.log("=== Testing New Schema ===");
renderElementText(newElement);

// Test updating properties - old schema
function updateElementProperty(element, property, value) {
  const updated = { ...element };
  
  if (property.includes('.')) {
    const parts = property.split('.');
    if (parts[0] === 'properties') {
      const propName = parts[1];
      const currentProps = element.properties || {};
      updated.properties = {
        ...currentProps,
        [propName]: value
      };
    }
  } else {
    updated[property] = value;
    
    if (property === 'fontSize') {
      const currentProps = element.properties || {};
      updated.properties = {
        ...currentProps,
        fontSize: value
      };
    }
  }
  
  return updated;
}

// Test updating properties
const updatedOld = updateElementProperty(oldElement, 'properties.bold', false);
const updatedNew = updateElementProperty(newElement, 'fontSize', 14);

console.log("=== Updated Old Schema (Bold=false) ===");
renderElementText(updatedOld);

console.log("=== Updated New Schema (fontSize=14) ===");
renderElementText(updatedNew);
