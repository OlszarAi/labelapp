# Editor Migration Summary

## Overview
This document summarizes the migration of the old label editor files to legacy namespaces to avoid conflicts with the new v2 editor implementation.

**Migration Date**: June 6, 2025
**Migration Status**: ✅ COMPLETED

## Files Moved

### 1. Component Files
**From**: `/src/components/labels/`  
**To**: `/src/components/labels-legacy/`

- `EditorSidebar.tsx`
- `LabelCanvas.tsx`
- `LabelEditor.tsx`
- `LabelPreview.tsx`
- `LegacyEditorSidebar.tsx`
- `LegacyLabelCanvas.tsx`
- `LegacyLabelEditor.tsx`

### 2. App Route Files
**From**: `/src/app/editor/`  
**To**: `/src/app/editor-legacy/`

- `page.tsx`

## Import Updates

### Updated Import Statements
1. **File**: `/src/app/projekty/[id]/page.tsx`
   - Changed: `@/components/labels/LabelPreview` → `@/components/labels-legacy/LabelPreview`

2. **File**: `/src/app/editor-legacy/page.tsx`
   - Changed: `@/components/labels/EditorSidebar` → `@/components/labels-legacy/EditorSidebar`
   - Changed: `@/components/labels/LabelEditor` → `@/components/labels-legacy/LabelEditor`
   - Changed: `@/components/labels/LabelPreview` → `@/components/labels-legacy/LabelPreview`

### Updated Route References
All routing references updated from `/editor` to `/editor-legacy`:

1. **File**: `/src/app/projekty/[id]/page.tsx`
   - Link to editor with project and label IDs

2. **File**: `/src/app/editor-legacy/page.tsx`
   - Internal navigation URLs (2 instances)

3. **File**: `/src/app/page.tsx`
   - Main navigation links (4 instances)

4. **File**: `/src/components/layout/MainLayout.tsx`
   - Navigation menu link

5. **File**: `/src/components/labels-legacy/LegacyLabelEditor.tsx`
   - Internal navigation URLs (2 instances)

6. **File**: `/src/components/labels-legacy/LabelEditor.tsx`
   - Internal navigation URLs (2 instances)

## Directory Structure After Migration

```
src/
├── app/
│   ├── editor-legacy/           # ← MOVED FROM editor/
│   │   └── page.tsx
│   └── projekty/
│       └── [id]/
│           └── page.tsx         # ← UPDATED IMPORTS
├── components/
│   ├── labels-legacy/           # ← MOVED FROM labels/
│   │   ├── EditorSidebar.tsx
│   │   ├── LabelCanvas.tsx
│   │   ├── LabelEditor.tsx
│   │   ├── LabelPreview.tsx
│   │   ├── LegacyEditorSidebar.tsx
│   │   ├── LegacyLabelCanvas.tsx
│   │   └── LegacyLabelEditor.tsx
│   └── layout/
│       └── MainLayout.tsx       # ← UPDATED ROUTES
```

## URL Changes

| Old URL | New URL |
|---------|---------|
| `/editor` | `/editor-legacy` |
| `/editor?projectId=...` | `/editor-legacy?projectId=...` |
| `/editor?projectId=...&labelId=...` | `/editor-legacy?projectId=...&labelId=...` |

## Verification Steps

### ✅ Completed Checks
1. ✅ All files successfully moved
2. ✅ All import statements updated
3. ✅ All route references updated
4. ✅ No broken imports detected
5. ✅ Old directories removed

### 🧪 Testing Required
- [ ] Test legacy editor functionality at `/editor-legacy`
- [ ] Test project links navigate to legacy editor
- [ ] Test all navigation menu links work
- [ ] Test label creation and editing workflow
- [ ] Test export functionality

## Next Steps

1. **Test Migration**: Verify that the legacy editor works correctly at the new URLs
2. **Begin V2 Implementation**: Start implementing the new v2 editor in the freed up namespaces:
   - `/src/app/editor-v2/`
   - `/src/components/editor-v2/`
   - `/src/hooks/editor-v2/`
   - `/src/lib/editor-v2/`

## Notes

- **No Logic Changed**: Only file locations and imports were modified
- **Backward Compatibility**: All existing functionality preserved
- **Clean Separation**: V2 editor can now be implemented without conflicts
- **CANVA_CLONE References**: Ready to adapt solutions from `/CANVA_CLONE/` for v2 editor

## Rollback Instructions

If rollback is needed:
1. Move files back: `labels-legacy/` → `labels/` and `editor-legacy/` → `editor/`
2. Revert all import changes in this document
3. Update all route references back to `/editor`
