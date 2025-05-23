# Type Compatibility Notes

## Label Element Type Definitions

This project has multiple definitions of `LabelElement` type across different files:

1. `/src/lib/types/label.types.ts` - The "official" type definition with strictest type checking:
   ```typescript
   export interface LabelElement {
     id: string;
     type: 'text' | 'image' | 'shape' | 'barcode' | 'qrCode' | 'uuidText' | 'company' | 'product';
     x: number;
     y: number;
     width?: number;
     height?: number;
     rotation: number; // Required
     size?: number;
     value?: string;
     color?: string;
     // Text styling properties
     bold?: boolean;
     italic?: boolean;
     strikethrough?: boolean;
     fontFamily?: string;
     fontSize?: number;
     properties: any; // Required
   }
   ```

2. `/src/services/labelStorage.ts` - The API communication layer definition:
   ```typescript
   export interface LabelElement {
     id: string;
     type: string; // Less strict - accepts any string
     x: number;
     y: number;
     width?: number;
     height?: number;
     size?: number;
     value?: string;
     color?: string;
     rotation?: number; // Optional
     properties?: any; // Optional
   }
   ```

3. `/src/app/editor/page.tsx` - The local interface definition:
   ```typescript
   interface LabelElement {
     id: string;
     type: string;
     x: number;
     y: number;
     width?: number;
     height?: number; 
     size?: number;
     value?: string;
     color?: string;
     uuidLength?: number;
     rotation?: number;
     properties?: any;
     // Text formatting properties
     bold?: boolean;
     italic?: boolean;
     strikethrough?: boolean;
     fontFamily?: string;
     fontSize?: number;
   }
   ```

## Issues and Solutions

### 1. Property Type Mismatches

There are inconsistencies in property requirements:
- `rotation`: Required in lib types, optional in others
- `properties`: Required in lib types, optional in others
- `type`: Strict union type in lib types, string in others

### 2. Backend Schema Changes

The backend schema was updated:
- Removed `size` field in favor of `fontSize`
- Added new properties like `rotation` and `properties`

### 3. Solutions Applied

- Made `rotation` and `properties` fields available in all interface definitions to prevent TypeScript errors
- Maintained local interface definitions where needed to prevent type incompatibility issues
- Updated backend controllers to work with the new schema

## Best Practices Moving Forward

1. **Single Source of Truth**: Consider consolidating to a single type definition shared between components.

2. **Type Compatibility**: When updating models:
   - Add new fields as optional initially
   - Update all interface definitions consistently
   - Consider using shared types or type extensions

3. **Backend API Changes**:
   - Update frontend types when backend schema changes
   - Implement fallbacks for backward compatibility (e.g., the `fontSize ?? size ?? null` pattern)

4. **Defensive Coding**:
   - Always check for existence of properties before accessing them
   - Provide fallbacks for missing properties (e.g., `element.rotation || 0`)
