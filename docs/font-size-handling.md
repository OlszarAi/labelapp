# Font Size Handling for Text Elements

## Overview
In our label application, text elements have a special property called `fontSize` that requires careful handling. This document outlines the proper way to handle fontSize to ensure it is correctly preserved when saving and loading labels.

## Key Points

1. **Dual Storage**: fontSize is stored in two locations:
   - Directly on the element object as `element.fontSize`
   - Within the properties object as `element.properties.fontSize`

2. **Consistency**: Both locations must be kept in sync at all times to prevent data loss

3. **Default Value**: The default fontSize is 12 unless otherwise specified

## Proper Implementation

### When Creating Text Elements
```typescript
const newTextElement = {
  // ...other properties
  fontSize: 14, // Set the main fontSize property
  properties: {
    // ...other styling properties
    fontSize: 14 // Must match the main fontSize property
  }
};
```

### When Updating fontSize
Always update both locations:
```typescript
// When updating directly:
element.fontSize = newSize;
element.properties.fontSize = newSize;

// When updating via properties:
element.properties.fontSize = newSize;
element.fontSize = newSize;
```

### In the Backend
When processing text elements, always use:
```typescript
const fontSize = isTextElement ? (element.fontSize || element.properties.fontSize || 12) : null;
```

## Common Pitfalls
- Updating only one location can lead to inconsistent state
- Not providing a default value can result in null or undefined fontSize
- Using element.size instead of element.fontSize
- **Missing element types**: Ensure all text element types ('text', 'uuidText', 'company', 'product') are included in the isTextElement check in both create and update functions

## Testing
After making changes to fontSize handling, verify:
1. Create a new text element and check both fontSize locations
2. Update the fontSize and verify both locations are updated
3. Save and reload the label to confirm fontSize is preserved
