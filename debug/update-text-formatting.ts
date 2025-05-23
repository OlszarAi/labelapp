// This script will update all TextFormattingControls instances in the EditorSidebar.tsx file
// to use the new properties-based formatting system

// Run this script to update all occurrences:
// npx tsx update-text-formatting.ts

import * as fs from 'fs';
import * as path from 'path';

const file = path.join(__dirname, 'src/components/labels/EditorSidebar.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Define the pattern to match TextFormattingControls component with its props
const regex = /<TextFormattingControls\s+elementId=\{element\.id\}\s+bold=\{element\.bold\}\s+italic=\{element\.italic\}\s+strikethrough=\{element\.strikethrough\}\s+fontFamily=\{element\.fontFamily\}\s+fontSize=\{element\.fontSize\s+\|\|\s+element\.size\}\s+updateElementProperty=\{updateElementProperty\}\s+\/>/g;

// Replace with the new implementation using properties
const replacement = `<TextFormattingControls
                        elementId={element.id}
                        bold={(element.properties as any)?.bold}
                        italic={(element.properties as any)?.italic}
                        strikethrough={(element.properties as any)?.strikethrough}
                        fontFamily={(element.properties as any)?.fontFamily}
                        fontSize={element.fontSize}
                        updateElementProperty={updateElementProperty}
                      />`;

// Perform the replacement
const updatedContent = content.replace(regex, replacement);

// Write the updated content back to the file
fs.writeFileSync(file, updatedContent, 'utf-8');

console.log('TextFormattingControls components updated successfully!');
